import { state } from '../store.js';

export const getCampusProfile = (req, res) => {
  const allRooms = state.buildings.flatMap(b => b.floors.flatMap(f => f.rooms));
  const availableRooms = allRooms.filter(r => r.status === 'available').length;
  const occupiedRooms = allRooms.filter(r => r.status === 'occupied').length;
  const reservedRooms = allRooms.filter(r => r.status === 'reserved').length;
  const totalCapacity = allRooms.reduce((acc, r) => acc + (r.capacity || 0), 0);

  res.status(200).json({
    success: true,
    campus: {
      name: 'Universitas Siliwangi',
      tagline: 'Sistem Informasi Denah 3D & Navigasi Kampus Terpadu',
      address: 'Jl. Siliwangi No. 24, Kahuripan, Kec. Tawang, Kota Tasikmalaya, Jawa Barat 46115',
      coordinates: {
        latitude: -7.348611,
        longitude: 108.224167
      },
      operatingHours: '07:00 - 21:00 WIB',
      buildings: state.buildings.map(b => ({
        id: b.id,
        code: b.code,
        name: b.name,
        shortName: b.shortName,
        floorsCount: b.floorsCount,
        totalRooms: b.floors.flatMap(f => f.rooms).length
      })),
      metrics: {
        totalRooms: allRooms.length,
        availableRooms,
        occupiedRooms,
        reservedRooms,
        totalCapacity
      }
    }
  });
};

export const getTodaySchedules = (req, res) => {
  const { date } = req.query;
  const todaySchedules = [];

  for (const b of state.buildings) {
    for (const f of b.floors) {
      for (const r of f.rooms) {
        if (r.currentActivity && r.status === 'occupied') {
          todaySchedules.push({
            id: `active-${r.id}`,
            roomId: r.id,
            roomCode: r.code,
            roomName: r.name,
            buildingName: b.shortName,
            floorNumber: f.floorNumber,
            title: r.currentActivity.title,
            lecturer: r.currentActivity.personInCharge,
            department: r.currentActivity.department,
            timeRange: `${r.currentActivity.startTime} - ${r.currentActivity.endTime}`,
            status: 'SEDANG_BERLANGSUNG'
          });
        }

        if (Array.isArray(r.schedule)) {
          r.schedule.forEach(s => {
            todaySchedules.push({
              id: s.id,
              roomId: r.id,
              roomCode: r.code,
              roomName: r.name,
              buildingName: b.shortName,
              floorNumber: f.floorNumber,
              title: s.title,
              lecturer: s.organizer,
              timeRange: s.timeRange,
              type: s.type,
              status: 'TERJADWAL'
            });
          });
        }
      }
    }
  }

  res.status(200).json({
    success: true,
    total: todaySchedules.length,
    date: date || new Date().toISOString().split('T')[0],
    data: todaySchedules
  });
};

export const getStudentCategories = (req, res) => {
  const allRooms = state.buildings.flatMap(b => b.floors.flatMap(f => f.rooms));

  const categories = [
    {
      id: 'classroom',
      name: 'Ruang Kuliah Teori',
      description: 'Kelas perkuliahan teori, smart classroom, dan multimedia',
      count: allRooms.filter(r => r.type === 'classroom' || r.type === 'auditorium').length,
      available: allRooms.filter(r => (r.type === 'classroom' || r.type === 'auditorium') && r.status === 'available').length
    },
    {
      id: 'laboratory',
      name: 'Laboratorium Komputer & Riset',
      description: 'Lab Komputasi, Riset AI, dan Rekayasa Sistem',
      count: allRooms.filter(r => r.type === 'laboratory' || r.name.toLowerCase().includes('lab')).length,
      available: allRooms.filter(r => (r.type === 'laboratory' || r.name.toLowerCase().includes('lab')) && r.status === 'available').length
    },
    {
      id: 'skripsi',
      name: 'Ruang Sidang Skripsi',
      description: 'Ruang sidang tugas akhir, komprehensif, dan tesis',
      count: allRooms.filter(r => r.name.toLowerCase().includes('skripsi') || r.name.toLowerCase().includes('sidang')).length,
      available: allRooms.filter(r => (r.name.toLowerCase().includes('skripsi') || r.name.toLowerCase().includes('sidang')) && r.status === 'available').length
    },
    {
      id: 'office',
      name: 'Layanan BAAK & Dosen',
      description: 'Loket registrasi akademik, ruang pimpinan, dan dosen',
      count: allRooms.filter(r => r.type === 'office' || r.name.toLowerCase().includes('baak')).length,
      available: allRooms.filter(r => (r.type === 'office' || r.name.toLowerCase().includes('baak')) && r.status === 'available').length
    },
    {
      id: 'lounge',
      name: 'Lounge / Belajar Mandiri',
      description: 'Ruang diskusi mahasiswa, coworking, dan fasilitas santai',
      count: allRooms.filter(r => r.type === 'lounge' || r.type === 'facility').length,
      available: allRooms.filter(r => (r.type === 'lounge' || r.type === 'facility') && r.status === 'available').length
    }
  ];

  res.status(200).json({
    success: true,
    data: categories
  });
};

