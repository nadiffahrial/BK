import { createHash, randomBytes } from 'node:crypto';
import { getDb } from '../config/db.js';
import { state } from '../store.js';
import { broadcastEvent } from '../sse.js';

/**
 * Controller Layanan Customer Service (CS) & Pengaduan Fasilitas Kampus
 * Terhubung langsung ke MySQL phpMyAdmin dan SSE untuk notifikasi real-time.
 */

// 1. Dapatkan semua tiket & pengaduan CS (dari MySQL dengan fallback ke in-memory)
export const getAllCsTickets = async (req, res) => {
  const { category, status } = req.query;
  const db = getDb();

  if (db) {
    try {
      let query = 'SELECT * FROM `cs_tickets` WHERE 1=1';
      const params = [];

      if (category && category !== 'all') {
        query += ' AND category LIKE ?';
        params.push(`%${category}%`);
      }

      if (status && status !== 'all') {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await db.query(query, params);
      const parsed = rows.map(t => ({
        id: t.id,
        senderName: t.sender_name,
        senderEmail: t.sender_email,
        senderRole: t.sender_role,
        category: t.category,
        roomCode: t.room_code,
        subject: t.subject,
        message: t.message,
        status: t.status,
        adminResponse: t.admin_response,
        createdAt: t.created_at
      }));

      return res.status(200).json({
        success: true,
        source: 'MySQL (smartspace_db)',
        total: parsed.length,
        data: parsed
      });
    } catch (err) {
      console.error('MySQL query error in getAllCsTickets:', err.message);
    }
  }

  // In-Memory Fallback
  try {
    let results = [...state.csTickets];

    if (category && category !== 'all') {
      results = results.filter(t => t.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (status && status !== 'all') {
      results = results.filter(t => t.status === status);
    }

    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      success: true,
      source: 'in-memory-fallback',
      total: results.length,
      data: results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data pengaduan CS', error: err.message });
  }
};

// 2. Buat tiket CS / Kirim pesan pengaduan baru (simpan ke MySQL & broadcast SSE)
export const createCsTicket = async (req, res) => {
  try {
    const { senderName, senderEmail, senderRole, category, roomCode, subject, message } = req.body;

    if (!senderName || !message) {
      return res.status(400).json({
        success: false,
        message: 'Nama pengirim dan isi pesan wajib diisi.'
      });
    }

    const ticketId = `CS-${randomBytes(4).toString('hex').toUpperCase()}`;
    const chatAccessToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(chatAccessToken).digest('hex');
    const newTicket = {
      id: ticketId,
      senderName: senderName.trim(),
      senderEmail: (senderEmail || 'tamu@unsil.ac.id').trim(),
      senderRole: senderRole || 'student',
      category: category || 'Sarana & Fasilitas',
      roomCode: (roomCode || '-').toUpperCase().trim(),
      subject: (subject || 'Pengaduan Layanan Kampus').trim(),
      message: message.trim(),
      status: 'pending',
      adminResponse: 'Tiket telah masuk antrean Layanan CS BAAK & IT. Petugas sedang mengecek.',
      createdAt: new Date().toISOString()
    };

    // 1. Simpan ke MySQL jika koneksi aktif
    const db = getDb();
    if (db) {
      try {
        await db.query(
          `INSERT INTO \`cs_tickets\` (id, sender_name, sender_email, sender_role, category, room_code, subject, message, status, admin_response)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newTicket.id,
            newTicket.senderName,
            newTicket.senderEmail,
            newTicket.senderRole,
            newTicket.category,
            newTicket.roomCode,
            newTicket.subject,
            newTicket.message,
            newTicket.status,
            newTicket.adminResponse
          ]
        );
        await db.query(
          'INSERT INTO `cs_ticket_access` (ticket_id, token_hash) VALUES (?, ?)',
          [newTicket.id, tokenHash]
        );
        console.log(`[CS Backend] ✅ Tiket #${newTicket.id} tersimpan ke MySQL database 'smartspace_db'`);
      } catch (dbErr) {
        console.error('MySQL insert error for cs_tickets:', dbErr.message);
        return res.status(500).json({ success: false, message: 'Tiket gagal disimpan. Silakan coba kembali.' });
      }
    } else {
      state.csTicketAccess[newTicket.id] = tokenHash;
      state.csTicketMessages[newTicket.id] = [];
    }

    // 2. Simpan ke in-memory store agar sinkron
    state.csTickets.unshift(newTicket);

    console.log(`[CS Backend] 🔔 Notifikasi Baru! Tiket #${newTicket.id} dari ${newTicket.senderName} (${newTicket.category}): "${newTicket.subject}"`);

    // 3. Broadcast event real-time ke semua klien via SSE
    broadcastEvent('NEW_CS_TICKET', {
      ticket: newTicket,
      message: `Pesan CS Baru dari ${newTicket.senderName} (${newTicket.category}): "${newTicket.subject}"`,
      timestamp: newTicket.createdAt
    });

    res.status(201).json({
      success: true,
      message: `Tiket bantuan #${newTicket.id} berhasil dikirim ke Layanan CS BAAK & IT dan tersimpan di database MySQL!`,
      data: newTicket,
      chatAccessToken
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal membuat tiket CS', error: err.message });
  }
};

// 3. Update status tiket CS (oleh Admin / Super Admin)
export const updateCsTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const allowedStatuses = ['pending', 'in_progress', 'resolved'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tiket tidak valid.'
      });
    }

    const db = getDb();

    if (!db) {
      return res.status(503).json({
        success: false,
        message: 'Database MySQL tidak tersedia.'
      });
    }

    const [result] = await db.query(
      `UPDATE cs_tickets
       SET status = COALESCE(?, status),
           admin_response = COALESCE(?, admin_response)
       WHERE id = ?`,
      [status || null, adminResponse ?? null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tiket tidak ditemukan.'
      });
    }

    const [rows] = await db.query(
      'SELECT * FROM cs_tickets WHERE id = ?',
      [id]
    );

    const ticket = rows[0];

    broadcastEvent('CS_STATUS_UPDATED', {
      ticketId: id,
      status: ticket.status,
      adminResponse: ticket.admin_response
    });

    return res.status(200).json({
      success: true,
      message: `Tiket #${id} berhasil diperbarui.`,
      data: ticket
    });

  } catch (err) {
    console.error('Gagal memperbarui tiket CS:', err);

    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui status tiket CS.'
    });
  }
};

// Riwayat percakapan live chat untuk satu tiket (khusus petugas CS).
export const getCsTicketMessages = async (req, res) => {
  const db = getDb();
  if (!db) return res.status(503).json({ success: false, message: 'Database MySQL tidak tersedia.' });
  try {
    const { id } = req.params;
    const [tickets] = await db.query('SELECT id FROM `cs_tickets` WHERE id = ? LIMIT 1', [id]);
    if (!tickets.length) return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan.' });
    const [rows] = await db.query(
      `SELECT id, ticket_id AS ticketId, sender_id AS senderId, sender_name AS senderName,
              sender_role AS senderRole, message, created_at AS createdAt
       FROM cs_ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC, id ASC`, [id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Gagal mengambil percakapan CS:', err.message);
    return res.status(500).json({ success: false, message: 'Gagal mengambil percakapan tiket.' });
  }
};

export const sendCsTicketMessage = async (req, res) => {
  const db = getDb();
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  if (!message) return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong.' });
  if (message.length > 5000) return res.status(400).json({ success: false, message: 'Pesan maksimal 5000 karakter.' });
  if (!db) return res.status(503).json({ success: false, message: 'Database MySQL tidak tersedia.' });
  try {
    const { id: ticketId } = req.params;
    const [tickets] = await db.query('SELECT id FROM `cs_tickets` WHERE id = ? LIMIT 1', [ticketId]);
    if (!tickets.length) return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan.' });
    const user = req.user;
    const [result] = await db.query(
      `INSERT INTO cs_ticket_messages (ticket_id, sender_id, sender_name, sender_role, message)
       VALUES (?, ?, ?, ?, ?)`, [ticketId, user.id, user.name, user.role, message]
    );
    const [rows] = await db.query(
      `SELECT id, ticket_id AS ticketId, sender_id AS senderId, sender_name AS senderName,
              sender_role AS senderRole, message, created_at AS createdAt
       FROM cs_ticket_messages WHERE id = ?`, [result.insertId]
    );
    const chatMessage = rows[0];
    return res.status(201).json({ success: true, data: chatMessage });
  } catch (err) {
    console.error('Gagal mengirim pesan CS:', err.message);
    return res.status(500).json({ success: false, message: 'Gagal mengirim pesan tiket.' });
  }
};

const hasVisitorChatAccess = async (ticketId, token) => {
  if (typeof token !== 'string' || token.length !== 64) return false;
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const db = getDb();
  if (!db) return state.csTicketAccess[ticketId] === tokenHash;
  const [rows] = await db.query(
    'SELECT ticket_id FROM cs_ticket_access WHERE ticket_id = ? AND token_hash = ? LIMIT 1',
    [ticketId, tokenHash]
  );
  return rows.length > 0;
};

export const getVisitorCsTicketMessages = async (req, res) => {
  const { id } = req.params;
  try {
    if (!await hasVisitorChatAccess(id, req.get('x-cs-ticket-access'))) {
      return res.status(403).json({ success: false, message: 'Akses percakapan tidak valid.' });
    }
    const db = getDb();
    if (!db) return res.json({ success: true, data: state.csTicketMessages[id] || [] });
    const [rows] = await db.query(
      `SELECT id, ticket_id AS ticketId, sender_id AS senderId, sender_name AS senderName,
              sender_role AS senderRole, message, created_at AS createdAt
       FROM cs_ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC, id ASC`, [id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Gagal mengambil chat pengunjung:', err.message);
    return res.status(500).json({ success: false, message: 'Gagal mengambil percakapan tiket.' });
  }
};

export const sendVisitorCsTicketMessage = async (req, res) => {
  const { id: ticketId } = req.params;
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  if (!message) return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong.' });
  if (message.length > 5000) return res.status(400).json({ success: false, message: 'Pesan maksimal 5000 karakter.' });
  try {
    if (!await hasVisitorChatAccess(ticketId, req.get('x-cs-ticket-access'))) {
      return res.status(403).json({ success: false, message: 'Akses percakapan tidak valid.' });
    }
    const db = getDb();
    if (!db) {
      const ticket = state.csTickets.find(item => item.id === ticketId);
      if (!ticket) return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan.' });
      const chatMessage = {
        id: Date.now(), ticketId, senderId: `visitor:${ticketId}`, senderName: ticket.senderName,
        senderRole: 'visitor', message, createdAt: new Date().toISOString()
      };
      state.csTicketMessages[ticketId] ||= [];
      state.csTicketMessages[ticketId].push(chatMessage);
      return res.status(201).json({ success: true, data: chatMessage });
    }
    const [tickets] = await db.query('SELECT sender_name FROM cs_tickets WHERE id = ? LIMIT 1', [ticketId]);
    if (!tickets.length) return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan.' });
    const [result] = await db.query(
      `INSERT INTO cs_ticket_messages (ticket_id, sender_id, sender_name, sender_role, message)
       VALUES (?, ?, ?, 'visitor', ?)`, [`${ticketId}`, `visitor:${ticketId}`, tickets[0].sender_name, message]
    );
    const [rows] = await db.query(
      `SELECT id, ticket_id AS ticketId, sender_id AS senderId, sender_name AS senderName,
              sender_role AS senderRole, message, created_at AS createdAt
       FROM cs_ticket_messages WHERE id = ?`, [result.insertId]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Gagal mengirim chat pengunjung:', err.message);
    return res.status(500).json({ success: false, message: 'Gagal mengirim pesan tiket.' });
  }
};
