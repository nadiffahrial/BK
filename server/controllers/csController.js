import { state } from '../store.js';
import { broadcastEvent } from '../sse.js';

/**
 * Controller Layanan Customer Service (CS) & Pengaduan Fasilitas Kampus
 * Terhubung langsung ke SSE untuk notifikasi real-time ke web dan civitas kampus.
 */

// 1. Dapatkan semua tiket & pengaduan CS
export const getAllCsTickets = (req, res) => {
  try {
    const { category, status } = req.query;
    let results = [...state.csTickets];

    if (category && category !== 'all') {
      results = results.filter(t => t.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (status && status !== 'all') {
      results = results.filter(t => t.status === status);
    }

    // Urutkan dari yang terbaru
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      success: true,
      total: results.length,
      data: results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data pengaduan CS', error: err.message });
  }
};

// 2. Buat tiket CS / Kirim pesan pengaduan baru
export const createCsTicket = (req, res) => {
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
      category: category || 'Bantuan Umum',
      roomCode: (roomCode || '-').toUpperCase().trim(),
      subject: (subject || 'Pengaduan Layanan Kampus').trim(),
      message: message.trim(),
      status: 'pending', // 'pending' | 'in_progress' | 'resolved'
      adminResponse: 'Tiket telah masuk antrean Layanan CS BAAK & IT. Petugas sedang mengecek.',
      createdAt: new Date().toISOString()
    };

    // Simpan ke in-memory store
    state.csTickets.unshift(newTicket);

    console.log(`[CS Backend] 🔔 Notifikasi Baru! Tiket #${newTicket.id} dari ${newTicket.senderName} (${newTicket.category}): "${newTicket.subject}"`);

    // Broadcast event real-time ke semua klien yang terhubung via SSE!
    broadcastEvent('NEW_CS_TICKET', {
      ticket: newTicket,
      message: `Pesan CS Baru dari ${newTicket.senderName} (${newTicket.category}): "${newTicket.subject}"`,
      timestamp: newTicket.createdAt
    });

    res.status(201).json({
      success: true,
      message: `Tiket bantuan #${newTicket.id} berhasil dikirim ke Layanan CS BAAK & IT. Notifikasi telah disiarkan ke backend!`,
      data: newTicket
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal membuat tiket CS', error: err.message });
  }
};

// 3. Update status tiket CS (oleh Admin / Staff)
export const updateCsTicketStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const ticket = state.csTickets.find(t => t.id === id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: `Tiket CS #${id} tidak ditemukan.` });
    }

    if (status) ticket.status = status;
    if (adminResponse) ticket.adminResponse = adminResponse;
    ticket.updatedAt = new Date().toISOString();

    console.log(`[CS Backend] Status Tiket #${id} diperbarui ke '${ticket.status}'.`);

    // Broadcast update
    broadcastEvent('CS_STATUS_UPDATED', {
      ticket,
      message: `Status Tiket #${id} (${ticket.senderName}) telah diperbarui menjadi '${ticket.status}'.`
    });

    res.status(200).json({
      success: true,
      message: `Status tiket #${id} berhasil diperbarui.`,
      data: ticket
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui status tiket CS', error: err.message });
  }
};
