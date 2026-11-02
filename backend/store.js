import { INITIAL_BUILDINGS, INITIAL_BOOKINGS } from './data/initialData.js';

// In-memory data store for live modifications during server runtime
export const state = {
  buildings: JSON.parse(JSON.stringify(INITIAL_BUILDINGS)),
  bookings: JSON.parse(JSON.stringify(INITIAL_BOOKINGS)),
  csTickets: [
    {
      id: 'CS-1001',
      senderName: 'Dimas Aditya',
      senderEmail: 'dimas.aditya@student.ac.id',
      senderRole: 'student',
      category: 'Sarana & Fasilitas',
      roomCode: 'A-102',
      subject: 'Proyektor Lab Pemrograman redup',
      message: 'Kabel HDMI proyektor di Lab Pemrograman Lantai 1 agak longgar sehingga gambar berkedip saat praktikum.',
      status: 'in_progress', // 'pending' | 'in_progress' | 'resolved'
      adminResponse: 'Tim teknisi sarpras IT sedang menuju lokasi untuk penggantian kabel HDMI.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'CS-1002',
      senderName: 'Dr. Ir. Budi Santoso',
      senderEmail: 'budi.santoso@dosen.ac.id',
      senderRole: 'staff',
      category: 'Layanan BAAK / Jadwal',
      roomCode: 'A-201',
      subject: 'Jadwal Kuliah Pengganti AI',
      message: 'Konfirmasi ketersediaan Lab AI untuk jadwal kuliah pengganti hari Rabu pukul 13.00.',
      status: 'resolved',
      adminResponse: 'Ruang Lab AI telah dijadwalkan dan disinkronkan ke sistem SmartCampus3D.',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
    }
  ]
};

// Helper to find room across all buildings & floors
export const findRoomById = (roomId) => {
  for (const b of state.buildings) {
    for (const f of b.floors) {
      const room = f.rooms.find(r => r.id === roomId);
      if (room) {
        return { room, floor: f, building: b };
      }
    }
  }
  return null;
};
