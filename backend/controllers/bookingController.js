import { getDb } from '../config/db.js';
import { state, findRoomById } from '../store.js';
import { broadcastEvent } from '../sse.js';

export const getAllBookings = async (req, res) => {
  const { roomId, date } = req.query;
  const db = getDb();

  if (db) {
    try {
      let query = 'SELECT * FROM `bookings` WHERE 1=1';
      const params = [];
      if (roomId) {
        query += ' AND room_id = ?';
        params.push(roomId);
      }
      if (date) {
        query += ' AND booking_date = ?';
        params.push(date);
      }
      query += ' ORDER BY created_at DESC';

      const [bookings] = await db.query(query, params);
      const parsed = bookings.map(b => ({
        id: b.id,
        roomId: b.room_id,
        roomName: b.room_name,
        roomCode: b.room_code,
        userName: b.user_name,
        userEmail: b.user_email,
        date: b.booking_date,
        startTime: b.start_time,
        endTime: b.end_time,
        purpose: b.purpose,
        participants: b.participants,
        status: b.status,
        createdAt: b.created_at
      }));

      return res.status(200).json({
        success: true,
        source: 'MySQL (XAMPP smartspace_db)',
        total: parsed.length,
        data: parsed
      });
    } catch (err) {
      console.error('MySQL query error in getAllBookings:', err);
    }
  }

  // Fallback
  let bookings = [...state.bookings];
  if (roomId) bookings = bookings.filter(b => b.roomId.toLowerCase() === roomId.toLowerCase());
  if (date) bookings = bookings.filter(b => b.date === date);

  res.status(200).json({ success: true, source: 'in-memory-fallback', total: bookings.length, data: bookings });
};

export const createBooking = async (req, res) => {
  const { roomId, userName, userEmail, date, startTime, endTime, purpose, participants } = req.body;

  if (!roomId || !userName || !date || !startTime || !endTime || !purpose) {
    return res.status(400).json({
      success: false,
      message: 'Semua field wajib diisi (roomId, userName, date, startTime, endTime, purpose)'
    });
  }

  const db = getDb();
  const newBookingId = `BK-${Date.now().toString().slice(-6)}`;
  let roomData = null;

  if (db) {
    try {
      const [rooms] = await db.query('SELECT * FROM `rooms` WHERE id = ? OR code = ?', [roomId, roomId]);
      if (rooms.length > 0) {
        roomData = rooms[0];
      }
    } catch (err) {
      console.error('Error fetching room in createBooking:', err);
    }
  }

  if (!roomData) {
    const match = findRoomById(roomId);
    if (match) roomData = match.room;
  }

  if (!roomData) {
    return res.status(404).json({ success: false, message: `Ruangan '${roomId}' tidak ditemukan` });
  }

  const newBooking = {
    id: newBookingId,
    roomId: roomData.id,
    roomName: roomData.name,
    roomCode: roomData.code,
    userName,
    userEmail: userEmail || 'user@smartspace.ac.id',
    date,
    startTime,
    endTime,
    purpose,
    participants: participants || Math.min(20, roomData.capacity),
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  };

  if (db) {
    try {
      // 1. Insert into bookings table
      await db.query(
        `INSERT INTO \`bookings\` (id, room_id, room_name, room_code, user_name, user_email, booking_date, start_time, end_time, purpose, participants, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newBooking.id,
          newBooking.roomId,
          newBooking.roomName,
          newBooking.roomCode,
          newBooking.userName,
          newBooking.userEmail,
          newBooking.date,
          newBooking.startTime,
          newBooking.endTime,
          newBooking.purpose,
          newBooking.participants,
          newBooking.status
        ]
      );

      // 2. Update room status to 'reserved'
      await db.query('UPDATE `rooms` SET status = ? WHERE id = ?', ['reserved', newBooking.roomId]);

      // 3. Add to room schedules table
      await db.query(
        'INSERT INTO `room_schedules` (id, room_id, title, organizer, time_range, type) VALUES (?, ?, ?, ?, ?, ?)',
        [newBooking.id, newBooking.roomId, newBooking.purpose, newBooking.userName, `${newBooking.startTime} - ${newBooking.endTime}`, 'Peminjaman Baru']
      );

      console.log(`💾 Reservasi ${newBooking.id} berhasil disimpan ke MySQL phpMyAdmin`);
    } catch (err) {
      console.error('MySQL insert error in createBooking:', err);
    }
  }

  // Also update in-memory store
  state.bookings.unshift(newBooking);
  const match = findRoomById(roomId);
  if (match) {
    match.room.status = 'reserved';
    match.room.schedule.push({
      id: newBooking.id,
      title: newBooking.purpose,
      organizer: newBooking.userName,
      timeRange: `${newBooking.startTime} - ${newBooking.endTime}`,
      type: 'Peminjaman Baru'
    });
  }

  // Broadcast real-time SSE event to all connected clients
  broadcastEvent('NEW_BOOKING_CREATED', {
    booking: newBooking,
    room: {
      id: roomData.id,
      code: roomData.code,
      name: roomData.name,
      status: 'reserved'
    }
  });

  res.status(201).json({
    success: true,
    source: db ? 'MySQL (XAMPP smartspace_db)' : 'in-memory-fallback',
    message: `Peminjaman ruangan ${roomData.code} berhasil disimpan ke database MySQL`,
    data: newBooking
  });
};

export const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const db = getDb();

  if (db) {
    try {
      await db.query('DELETE FROM `bookings` WHERE id = ?', [id]);
      await db.query('DELETE FROM `room_schedules` WHERE id = ?', [id]);
    } catch (err) {
      console.error('MySQL delete error in cancelBooking:', err);
    }
  }

  const index = state.bookings.findIndex(b => b.id.toLowerCase() === id.toLowerCase());
  if (index !== -1) {
    state.bookings.splice(index, 1);
  }

  broadcastEvent('BOOKING_CANCELLED', { bookingId: id });

  res.status(200).json({
    success: true,
    message: `Reservasi '${id}' berhasil dihapus dari database MySQL`
  });
};
