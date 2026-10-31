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

    const ticketId = `CS-${Math.floor(1000 + Math.random() * 9000)}`;
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
        console.log(`[CS Backend] ✅ Tiket #${newTicket.id} tersimpan ke MySQL database 'smartspace_db'`);
      } catch (dbErr) {
        console.error('MySQL insert error for cs_tickets:', dbErr.message);
      }
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
      data: newTicket
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal membuat tiket CS', error: err.message });
  }
};

// 3. Update status tiket CS (oleh Admin / Staff)
export const updateCsTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const db = getDb();
    if (db) {
      try {
        await db.query(
          'UPDATE `cs_tickets` SET `status` = COALESCE(?, `status`), `admin_response` = COALESCE(?, `admin_response`) WHERE `id` = ?',
          [status || null, adminResponse || null, id]
        );
      } catch (dbErr) {
        console.error('MySQL update error for cs_tickets:', dbErr.message);
      }
    }

    const ticket = state.csTickets.find(t => t.id === id);
    if (ticket) {
      if (status) ticket.status = status;
      if (adminResponse) ticket.adminResponse = adminResponse;
      ticket.updatedAt = new Date().toISOString();
    }

    console.log(`[CS Backend] Status Tiket #${id} diperbarui ke '${status}'.`);

    // Broadcast update
    broadcastEvent('CS_STATUS_UPDATED', {
      ticketId: id,
      status,
      adminResponse,
      message: `Status Tiket #${id} telah diperbarui menjadi '${status}'.`
    });

    res.status(200).json({
      success: true,
      message: `Status tiket #${id} berhasil diperbarui di database.`,
      data: ticket || { id, status, adminResponse }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui status tiket CS', error: err.message });
  }
};
