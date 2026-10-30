import { getDb } from '../config/db.js';
import { state, findRoomById } from '../store.js';
import { broadcastEvent } from '../sse.js';

export const getAllRooms = async (req, res) => {
  const { buildingId, floorNumber, status, type, search } = req.query;
  const db = getDb();

  if (db) {
    try {
      let query = `
        SELECT r.*, b.name as building_name, b.code as building_code, f.name as floor_name 
        FROM \`rooms\` r
        JOIN \`buildings\` b ON r.building_id = b.id
        JOIN \`floors\` f ON r.building_id = f.building_id AND r.floor_number = f.floor_number
        WHERE 1=1
      `;
      const params = [];

      if (buildingId) {
        query += ' AND (r.building_id = ? OR b.code = ?)';
        params.push(buildingId, buildingId);
      }
      if (floorNumber) {
        query += ' AND r.floor_number = ?';
        params.push(Number(floorNumber));
      }
      if (status && status !== 'all') {
        query += ' AND r.status = ?';
        params.push(status);
      }
      if (type && type !== 'all') {
        query += ' AND r.type = ?';
        params.push(type);
      }
      if (search) {
        query += ' AND (r.name LIKE ? OR r.code LIKE ? OR r.description LIKE ?)';
        const q = `%${search}%`;
        params.push(q, q, q);
      }

      const [rooms] = await db.query(query, params);
      const parsed = rooms.map(r => ({
        ...r,
        buildingId: r.building_id,
        floorNumber: r.floor_number,
        currentOccupancy: r.current_occupancy,
        acUnits: r.ac_units,
        currentActivity: r.current_activity_json ? (typeof r.current_activity_json === 'string' ? JSON.parse(r.current_activity_json) : r.current_activity_json) : null,
        coordinates: typeof r.coordinates_json === 'string' ? JSON.parse(r.coordinates_json) : r.coordinates_json,
        facilities: []
      }));

      return res.status(200).json({
        success: true,
        source: 'MySQL (XAMPP)',
        total: parsed.length,
        data: parsed
      });
    } catch (err) {
      console.error('MySQL query error in getAllRooms:', err);
    }
  }

  // Fallback
  let rooms = [];
  for (const b of state.buildings) {
    if (buildingId && b.id !== buildingId && b.code !== buildingId) continue;
    for (const f of b.floors) {
      if (floorNumber && f.floorNumber !== Number(floorNumber)) continue;
      for (const r of f.rooms) {
        rooms.push({ ...r, buildingName: b.name, buildingCode: b.code, floorName: f.name });
      }
    }
  }
  if (status && status !== 'all') rooms = rooms.filter(r => r.status.toLowerCase() === status.toLowerCase());
  if (type && type !== 'all') rooms = rooms.filter(r => r.type.toLowerCase() === type.toLowerCase());
  if (search) {
    const q = search.toLowerCase();
    rooms = rooms.filter(r => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }

  res.status(200).json({ success: true, source: 'in-memory-fallback', total: rooms.length, data: rooms });
};

export const getRoomById = async (req, res) => {
  const { id } = req.params;
  const db = getDb();

  if (db) {
    try {
      const [rooms] = await db.query('SELECT * FROM `rooms` WHERE id = ? OR code = ?', [id, id]);
      if (rooms.length > 0) {
        const r = rooms[0];
        const [facilities] = await db.query('SELECT * FROM `room_facilities` WHERE room_id = ?', [r.id]);
        const [schedule] = await db.query('SELECT * FROM `room_schedules` WHERE room_id = ?', [r.id]);

        return res.status(200).json({
          success: true,
          source: 'MySQL (XAMPP)',
          data: {
            id: r.id,
            code: r.code,
            name: r.name,
            buildingId: r.building_id,
            floorNumber: r.floor_number,
            type: r.type,
            status: r.status,
            capacity: r.capacity,
            currentOccupancy: r.current_occupancy,
            temperature: r.temperature,
            acUnits: r.ac_units,
            description: r.description,
            currentActivity: r.current_activity_json ? (typeof r.current_activity_json === 'string' ? JSON.parse(r.current_activity_json) : r.current_activity_json) : null,
            coordinates: typeof r.coordinates_json === 'string' ? JSON.parse(r.coordinates_json) : r.coordinates_json,
            facilities: facilities.map(f => ({ name: f.name, iconName: f.icon_name, available: Boolean(f.available), spec: f.spec })),
            schedule: schedule.map(s => ({ id: s.id, title: s.title, organizer: s.organizer, timeRange: s.time_range, type: s.type }))
          }
        });
      }
    } catch (err) {
      console.error('MySQL query error in getRoomById:', err);
    }
  }

  const match = findRoomById(id);
  if (!match) {
    return res.status(404).json({ success: false, message: `Ruangan '${id}' tidak ditemukan` });
  }

  res.status(200).json({ success: true, data: match.room });
};

export const updateRoomStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['available', 'occupied', 'reserved', 'maintenance'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status tidak valid. Harus salah satu dari: ${validStatuses.join(', ')}`
    });
  }

  const db = getDb();
  let updatedRoom = null;

  if (db) {
    try {
      await db.query('UPDATE `rooms` SET status = ? WHERE id = ? OR code = ?', [status, id, id]);
      const [rows] = await db.query('SELECT * FROM `rooms` WHERE id = ? OR code = ?', [id, id]);
      if (rows.length > 0) {
        updatedRoom = rows[0];
      }
    } catch (err) {
      console.error('MySQL update error in updateRoomStatus:', err);
    }
  }

  // Also update in-memory store
  const match = findRoomById(id);
  if (match) {
    match.room.status = status;
    if (!updatedRoom) updatedRoom = match.room;
  }

  // Broadcast real-time SSE event to all connected React clients
  broadcastEvent('ROOM_STATUS_UPDATED', {
    roomId: updatedRoom?.id || id,
    roomCode: updatedRoom?.code || id,
    newStatus: status,
    updatedAt: new Date().toISOString()
  });

  res.status(200).json({
    success: true,
    message: `Status ruangan berhasil diperbarui di database MySQL (XAMPP)`,
    data: updatedRoom
  });
};

export const getCampusStats = async (req, res) => {
  const db = getDb();

  if (db) {
    try {
      const [totalRow] = await db.query('SELECT COUNT(*) as total FROM `rooms`');
      const [statusRows] = await db.query('SELECT status, COUNT(*) as cnt FROM `rooms` GROUP BY status');
      const [peopleRow] = await db.query('SELECT SUM(current_occupancy) as total_people FROM `rooms`');
      const [bookingCount] = await db.query('SELECT COUNT(*) as total_bookings FROM `bookings`');
      const [bldgCount] = await db.query('SELECT COUNT(*) as total_bldgs FROM `buildings`');

      const counts = { available: 0, occupied: 0, reserved: 0, maintenance: 0 };
      statusRows.forEach(r => { counts[r.status] = r.cnt; });

      const total = totalRow[0].total;

      return res.status(200).json({
        success: true,
        source: 'MySQL (XAMPP smartspace_db)',
        data: {
          buildingsCount: bldgCount[0].total_bldgs,
          totalRooms: total,
          availableRooms: counts.available,
          occupiedRooms: counts.occupied,
          reservedRooms: counts.reserved,
          maintenanceRooms: counts.maintenance,
          occupancyPercentage: total > 0 ? Math.round((counts.occupied / total) * 100) : 0,
          totalPeopleInCampus: peopleRow[0].total_people || 0,
          activeBookingsCount: bookingCount[0].total_bookings,
          serverTime: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('MySQL stats query error:', err);
    }
  }

  // Fallback
  const allRooms = state.buildings.flatMap(b => b.floors.flatMap(f => f.rooms));
  res.status(200).json({
    success: true,
    source: 'in-memory-fallback',
    data: {
      buildingsCount: state.buildings.length,
      totalRooms: allRooms.length,
      availableRooms: allRooms.filter(r => r.status === 'available').length,
      occupiedRooms: allRooms.filter(r => r.status === 'occupied').length,
      reservedRooms: allRooms.filter(r => r.status === 'reserved').length,
      maintenanceRooms: allRooms.filter(r => r.status === 'maintenance').length,
      occupancyPercentage: 35,
      totalPeopleInCampus: 350,
      activeBookingsCount: state.bookings.length,
      serverTime: new Date().toISOString()
    }
  });
};

// ========================================================
// Universal Search Engine for Campus Rooms & Facilities
// ========================================================
export const searchRoomsEngine = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.status(200).json({ success: true, count: 0, data: [] });
  }

  const queryStr = q.trim().toLowerCase();
  const db = getDb();

  if (db) {
    try {
      const searchParam = `%${queryStr}%`;

      // 1. Search in rooms
      const [roomMatches] = await db.query(
        `SELECT r.id, r.code, r.name 
         FROM \`rooms\` r
         WHERE r.name LIKE ? OR r.code LIKE ? OR r.description LIKE ? OR r.type LIKE ?`,
        [searchParam, searchParam, searchParam, searchParam]
      );

      // 2. Search in facilities
      const [facMatches] = await db.query(
        `SELECT rf.room_id, rf.name as facility_name, rf.spec 
         FROM \`room_facilities\` rf
         WHERE rf.name LIKE ? OR rf.spec LIKE ?`,
        [searchParam, searchParam]
      );

      // 3. Search in schedules
      const [schedMatches] = await db.query(
        `SELECT rs.room_id, rs.title as schedule_title, rs.organizer, rs.time_range, rs.type as schedule_type 
         FROM \`room_schedules\` rs
         WHERE rs.title LIKE ? OR rs.organizer LIKE ? OR rs.type LIKE ?`,
        [searchParam, searchParam, searchParam]
      );

      const matchedRoomIds = new Set();
      const matchReasons = {};

      roomMatches.forEach(r => {
        matchedRoomIds.add(r.id);
        if (r.code.toLowerCase().includes(queryStr)) {
          matchReasons[r.id] = `Kode Ruang: ${r.code}`;
        } else if (r.name.toLowerCase().includes(queryStr)) {
          matchReasons[r.id] = `Nama Ruangan: ${r.name}`;
        } else {
          matchReasons[r.id] = `Deskripsi Ruang`;
        }
      });

      facMatches.forEach(f => {
        matchedRoomIds.add(f.room_id);
        if (!matchReasons[f.room_id]) {
          matchReasons[f.room_id] = `Fasilitas: ${f.facility_name}`;
        }
      });

      schedMatches.forEach(s => {
        matchedRoomIds.add(s.room_id);
        if (!matchReasons[s.room_id]) {
          if (s.organizer && s.organizer.toLowerCase().includes(queryStr)) {
            matchReasons[s.room_id] = `Dosen / Penyelenggara: ${s.organizer}`;
          } else {
            matchReasons[s.room_id] = `Mata Kuliah: ${s.schedule_title}`;
          }
        }
      });

      if (matchedRoomIds.size > 0) {
        const idList = Array.from(matchedRoomIds);
        const placeholders = idList.map(() => '?').join(',');
        const [fullRooms] = await db.query(
          `SELECT r.*, b.name as building_name, b.code as building_code, b.short_name as building_short_name, f.name as floor_name
           FROM \`rooms\` r
           JOIN \`buildings\` b ON r.building_id = b.id
           JOIN \`floors\` f ON r.building_id = f.building_id AND r.floor_number = f.floor_number
           WHERE r.id IN (${placeholders})`,
          idList
        );

        const [allFacs] = await db.query(
          `SELECT * FROM \`room_facilities\` WHERE room_id IN (${placeholders})`,
          idList
        );
        const [allScheds] = await db.query(
          `SELECT * FROM \`room_schedules\` WHERE room_id IN (${placeholders})`,
          idList
        );

        const results = fullRooms.map(r => ({
          id: r.id,
          code: r.code,
          name: r.name,
          buildingId: r.building_id,
          buildingName: r.building_name,
          buildingCode: r.building_code,
          buildingShortName: r.building_short_name,
          floorNumber: r.floor_number,
          floorName: r.floor_name,
          type: r.type,
          status: r.status,
          capacity: r.capacity,
          currentOccupancy: r.current_occupancy,
          temperature: r.temperature,
          acUnits: r.ac_units,
          description: r.description,
          currentActivity: r.current_activity_json ? (typeof r.current_activity_json === 'string' ? JSON.parse(r.current_activity_json) : r.current_activity_json) : null,
          coordinates: typeof r.coordinates_json === 'string' ? JSON.parse(r.coordinates_json) : r.coordinates_json,
          matchReason: matchReasons[r.id] || 'Kesesuaian Data Kampus',
          facilities: allFacs.filter(f => f.room_id === r.id).map(f => ({ name: f.name, iconName: f.icon_name, available: Boolean(f.available), spec: f.spec })),
          schedule: allScheds.filter(s => s.room_id === r.id).map(s => ({ id: s.id, title: s.title, organizer: s.organizer, timeRange: s.time_range, type: s.type }))
        }));

        return res.status(200).json({
          success: true,
          source: 'MySQL Search Engine (smartspace_db)',
          count: results.length,
          query: queryStr,
          data: results
        });
      }
    } catch (err) {
      console.error('MySQL search engine error:', err);
    }
  }

  // Fallback in-memory search
  const fallbackResults = [];
  for (const b of state.buildings) {
    for (const f of b.floors) {
      for (const r of f.rooms) {
        let matched = false;
        let reason = '';

        if (r.code.toLowerCase().includes(queryStr)) {
          matched = true;
          reason = `Kode Ruangan: ${r.code}`;
        } else if (r.name.toLowerCase().includes(queryStr)) {
          matched = true;
          reason = `Nama Ruangan: ${r.name}`;
        } else if (r.currentActivity && (r.currentActivity.title.toLowerCase().includes(queryStr) || r.currentActivity.personInCharge.toLowerCase().includes(queryStr))) {
          matched = true;
          reason = `Agenda: ${r.currentActivity.title}`;
        } else if (r.facilities && r.facilities.some(fac => fac.name.toLowerCase().includes(queryStr))) {
          matched = true;
          const fac = r.facilities.find(fac => fac.name.toLowerCase().includes(queryStr));
          reason = `Fasilitas: ${fac.name}`;
        } else if (r.schedule && r.schedule.some(s => s.title.toLowerCase().includes(queryStr) || s.organizer.toLowerCase().includes(queryStr))) {
          matched = true;
          const sched = r.schedule.find(s => s.title.toLowerCase().includes(queryStr) || s.organizer.toLowerCase().includes(queryStr));
          reason = `Jadwal: ${sched.title}`;
        } else if (r.description.toLowerCase().includes(queryStr)) {
          matched = true;
          reason = 'Deskripsi Ruangan';
        }

        if (matched) {
          fallbackResults.push({
            ...r,
            buildingName: b.name,
            buildingCode: b.code,
            buildingShortName: b.shortName,
            floorName: f.name,
            matchReason: reason
          });
        }
      }
    }
  }

  res.status(200).json({
    success: true,
    source: 'in-memory-search-engine',
    count: fallbackResults.length,
    query: queryStr,
    data: fallbackResults
  });
};
