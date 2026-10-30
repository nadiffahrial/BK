
export const INITIAL_BUILDINGS = [
  {
    id: 'gedung-a',
    code: 'A',
    name: 'Gedung LABTEK 1 - Perkuliahan Terpadu & Laboratorium',
    shortName: 'LABTEK 1',
    tagline: 'Pusat Perkuliahan Teori, Lab Komputer, dan Sidang Skripsi Universitas',
    floorsCount: 2,
    address: 'Komp. Kampus Barat, Jl. Prof. Soedarto, SH, Tembalang',
    operatingHours: '07.00 - 21.00 WIB',
    floors: [
      {
        floorNumber: 1,
        name: 'Lantai 1 - Ruang Kuliah Teori & Layanan BAAK',
        description: 'Lantai ruang kuliah teori kapasitas besar, loket registrasi akademik, dan lounge mahasiswa.',
        dimensions: { width: 900, height: 500 },
        rooms: [
          {
            id: 'a-101',
            code: 'A-101',
            name: 'Ruang Kuliah Teori 01 (Smart Classroom)',
            buildingId: 'gedung-a',
            floorNumber: 1,
            type: 'classroom',
            status: 'occupied',
            capacity: 60,
            currentOccupancy: 54,
            temperature: 22,
            acUnits: 3,
            facilities: [
              { name: 'Interactive Smart Board 86"', iconName: 'Monitor', available: true },
              { name: 'Sound System & Wireless Mic', iconName: 'Volume2', available: true },
              { name: 'WiFi Eduroam 500 Mbps', iconName: 'Wifi', available: true }
            ],
            description: 'Ruang kuliah teori berkapasitas 60 mahasiswa dengan fasilitas smart display dan AC sentral.',
            currentActivity: {
              title: 'Mata Kuliah: Algoritma & Struktur Data (Kelas A)',
              personInCharge: 'Dr. Ir. Budi Santoso, M.Kom',
              department: 'S1 Teknik Informatika',
              startTime: '08:00',
              endTime: '10:30'
            },
            schedule: [
              { id: 'sa-101', title: 'Algoritma & Struktur Data', organizer: 'Dr. Budi Santoso', timeRange: '08:00 - 10:30', type: 'Perkuliahan' },
              { id: 'sa-102', title: 'Kalkulus Lanjut', organizer: 'Dra. Nur Indah, M.Si', timeRange: '13:00 - 15:30', type: 'Perkuliahan' }
            ],
            coordinates: { x: 40, y: 40, w: 260, h: 200, doorPosition: 'bottom' }
          },
          {
            id: 'a-102',
            code: 'A-102',
            name: 'Ruang Kuliah Teori 02 (Multimedia)',
            buildingId: 'gedung-a',
            floorNumber: 1,
            type: 'classroom',
            status: 'available',
            capacity: 60,
            temperature: 23,
            acUnits: 3,
            facilities: [
              { name: 'Laser Projector 5000 Lumens', iconName: 'Tv', available: true },
              { name: 'Stopkontak Tiap Meja Mahasiswa', iconName: 'Zap', available: true }
            ],
            description: 'Ruang kuliah dengan proyektor laser resolusi tinggi dan pencahayaan ergonomis.',
            schedule: [
              { id: 'sa-103', title: 'Basis Data Terdistribusi', organizer: 'Tim Dosen Basis Data', timeRange: '14:00 - 16:30', type: 'Perkuliahan' }
            ],
            coordinates: { x: 320, y: 40, w: 280, h: 200, doorPosition: 'bottom' }
          },
          {
            id: 'a-103',
            code: 'A-103',
            name: 'Ruang Kuliah Amfiteater A3 (Kuliah Umum)',
            buildingId: 'gedung-a',
            floorNumber: 1,
            type: 'auditorium',
            status: 'reserved',
            capacity: 100,
            temperature: 21,
            acUnits: 4,
            facilities: [
              { name: 'Kursi Teater Bertingkat', iconName: 'Users', available: true },
              { name: 'Dual Display Videotron', iconName: 'Tv', available: true },
              { name: 'Live Streaming Rig', iconName: 'Camera', available: true }
            ],
            description: 'Ruang amfiteater bertingkat untuk kuliah umum gabungan dan seminar akademik prodi.',
            schedule: [
              { id: 'sa-104', title: 'Kuliah Tamu: Keamanan Siber di Industri FinTech', organizer: 'Himpunan Mahasiswa', timeRange: '13:00 - 16:00', type: 'Kuliah Umum' }
            ],
            coordinates: { x: 620, y: 40, w: 240, h: 200, doorPosition: 'left' }
          },
          {
            id: 'a-104',
            code: 'A-104',
            name: 'Pusat Layanan BAAK & Registrasi KRS',
            buildingId: 'gedung-a',
            floorNumber: 1,
            type: 'office',
            status: 'occupied',
            capacity: 30,
            currentOccupancy: 18,
            temperature: 22,
            acUnits: 2,
            facilities: [
              { name: 'Loket Pelayanan Mahasiswa 1-5', iconName: 'Users', available: true },
              { name: 'Mesin Antrean Digital', iconName: 'Monitor', available: true }
            ],
            description: 'Loket pengurusan Kartu Rencana Studi (KRS), surat keterangan aktif, dan transkrip.',
            currentActivity: {
              title: 'Layanan Validasi KRS & Cuti Akademik',
              personInCharge: 'Staff Biro Akademik (BAAK)',
              department: 'BAAK Universitas',
              startTime: '08:30',
              endTime: '15:30'
            },
            schedule: [],
            coordinates: { x: 40, y: 260, w: 260, h: 200, doorPosition: 'top' }
          },
          {
            id: 'a-105',
            code: 'A-105',
            name: 'Lounge Mahasiswa & Co-Study Corner',
            buildingId: 'gedung-a',
            floorNumber: 1,
            type: 'lounge',
            status: 'available',
            capacity: 45,
            temperature: 24,
            acUnits: 3,
            facilities: [
              { name: 'Meja Diskusi Modular', iconName: 'Layers', available: true },
              { name: 'Coffee Station & Vending Machine', iconName: 'Coffee', available: true },
              { name: 'Free WiFi 6', iconName: 'Wifi', available: true }
            ],
            description: 'Ruang tunggu belajar mandiri mahasiswa di sela-sela pergantian jam kuliah.',
            schedule: [],
            coordinates: { x: 320, y: 260, w: 280, h: 200, doorPosition: 'top' }
          },
          {
            id: 'a-106',
            code: 'A-106',
            name: 'Ruang Transit & Bimbingan Dosen Pengajar',
            buildingId: 'gedung-a',
            floorNumber: 1,
            type: 'office',
            status: 'available',
            capacity: 20,
            temperature: 22,
            acUnits: 2,
            facilities: [
              { name: 'Meja Kerja Dosen', iconName: 'UserCheck', available: true },
              { name: 'Loker Dosen Pengampu', iconName: 'Lock', available: true }
            ],
            description: 'Ruang istirahat dan persiapan dosen sebelum memulai jam perkuliahan di lantai 1.',
            schedule: [],
            coordinates: { x: 620, y: 260, w: 240, h: 200, doorPosition: 'left' }
          }
        ]
      },
      {
        floorNumber: 2,
        name: 'Lantai 2 - Laboratorium Komputer & Sidang Skripsi',
        description: 'Lantai praktikum komputer, riset kecerdasan buatan, dan ruang ujian pendadaran sarjana.',
        dimensions: { width: 900, height: 500 },
        rooms: [
          {
            id: 'a-201',
            code: 'A-201',
            name: 'Lab Komputasi & Pemrograman Web',
            buildingId: 'gedung-a',
            floorNumber: 2,
            type: 'laboratory',
            status: 'occupied',
            capacity: 45,
            currentOccupancy: 42,
            temperature: 20,
            acUnits: 3,
            facilities: [
              { name: '45x PC Intel Core i7 32GB RAM', iconName: 'Cpu', available: true },
              { name: 'Projector & Screen 120"', iconName: 'Tv', available: true },
              { name: 'Gigabit Switch Network', iconName: 'Network', available: true }
            ],
            description: 'Laboratorium praktikum mata kuliah pemrograman frontend, backend, dan database.',
            currentActivity: {
              title: 'Praktikum Pemrograman Berorientasi Objek (Kelas C)',
              personInCharge: 'Asisten Laboratorium & Dosen Pengampu',
              department: 'Laboratorium Komputasi',
              startTime: '10:00',
              endTime: '12:30'
            },
            schedule: [
              { id: 'sa-201', title: 'Praktikum PBO Kelas C', organizer: 'Tim Asisten Lab', timeRange: '10:00 - 12:30', type: 'Praktikum' },
              { id: 'sa-202', title: 'Praktikum Web Framework', organizer: 'Tim Asisten Lab', timeRange: '13:30 - 16:00', type: 'Praktikum' }
            ],
            coordinates: { x: 40, y: 40, w: 260, h: 200, doorPosition: 'bottom' }
          },
          {
            id: 'a-202',
            code: 'A-202',
            name: 'Lab Kecerdasan Buatan & Data Science',
            buildingId: 'gedung-a',
            floorNumber: 2,
            type: 'laboratory',
            status: 'occupied',
            capacity: 40,
            currentOccupancy: 35,
            temperature: 19,
            acUnits: 4,
            facilities: [
              { name: '35x PC Workstation Nvidia RTX 4080', iconName: 'Cpu', available: true },
              { name: 'High-Performance Computing Node', iconName: 'Server', available: true }
            ],
            description: 'Lab riset pelatihan model Machine Learning, Deep Learning, dan Computer Vision.',
            currentActivity: {
              title: 'Praktikum Deep Learning & Pengolahan Citra Digital',
              personInCharge: 'Prof. Sri Wahyuni, Ph.D',
              department: 'Laboratorium AI',
              startTime: '09:00',
              endTime: '12:00'
            },
            schedule: [],
            coordinates: { x: 320, y: 40, w: 280, h: 200, doorPosition: 'bottom' }
          },
          {
            id: 'a-203',
            code: 'A-203',
            name: 'Ruang Sidang Skripsi & Pendadaran Sarjana',
            buildingId: 'gedung-a',
            floorNumber: 2,
            type: 'meeting',
            status: 'occupied',
            capacity: 25,
            currentOccupancy: 12,
            temperature: 21,
            acUnits: 2,
            facilities: [
              { name: 'Meja Dewan Penguji (5 Dosen)', iconName: 'Users', available: true },
              { name: 'Podium Presentasi Mahasiswa', iconName: 'Mic', available: true },
              { name: 'Smart Display TV 75"', iconName: 'Tv', available: true }
            ],
            description: 'Ruang formal untuk pelaksanaan ujian sidang skripsi dan seminar proposal tugas akhir.',
            currentActivity: {
              title: 'Sidang Tugas Akhir: "Implementasi Smart Building IoT"',
              personInCharge: 'Ketua Tim Penguji Skripsi',
              department: 'Program Studi Informatika',
              startTime: '10:00',
              endTime: '11:45'
            },
            schedule: [
              { id: 'sa-203', title: 'Sidang Skripsi Sesi Pagi', organizer: 'Koordinator TA', timeRange: '10:00 - 11:45', type: 'Sidang' },
              { id: 'sa-204', title: 'Sidang Skripsi Sesi Siang', organizer: 'Koordinator TA', timeRange: '13:00 - 14:45', type: 'Sidang' }
            ],
            coordinates: { x: 620, y: 40, w: 240, h: 200, doorPosition: 'left' }
          },
          {
            id: 'a-204',
            code: 'A-204',
            name: 'Ruang Bimbingan Akademik & Dosen Wali',
            buildingId: 'gedung-a',
            floorNumber: 2,
            type: 'office',
            status: 'available',
            capacity: 25,
            temperature: 22,
            acUnits: 2,
            facilities: [
              { name: 'Bilik Konsultasi Dosen-Mahasiswa', iconName: 'Users', available: true },
              { name: 'WiFi Eduroam Kampus', iconName: 'Wifi', available: true }
            ],
            description: 'Ruang konsultasi rencana studi perwalian semester dan bimbingan revisi tugas akhir.',
            schedule: [],
            coordinates: { x: 40, y: 260, w: 260, h: 200, doorPosition: 'top' }
          },
          {
            id: 'a-205',
            code: 'A-205',
            name: 'Ruang Kuliah Seminar Hybrid A-205',
            buildingId: 'gedung-a',
            floorNumber: 2,
            type: 'classroom',
            status: 'available',
            capacity: 50,
            temperature: 22,
            acUnits: 3,
            facilities: [
              { name: 'Zoom Rooms Integration System', iconName: 'Video', available: true },
              { name: 'PTZ Tracking Camera Otomatis', iconName: 'Camera', available: true }
            ],
            description: 'Ruang kuliah berorientasi pembelajaran hybrid luring dan daring sekaligus.',
            schedule: [
              { id: 'sa-205', title: 'Kuliah Tamu Dosen Praktisi Industri', organizer: 'Prodi Informatika', timeRange: '14:00 - 16:30', type: 'Kuliah Hybrid' }
            ],
            coordinates: { x: 320, y: 260, w: 280, h: 200, doorPosition: 'top' }
          },
          {
            id: 'a-206',
            code: 'A-206',
            name: 'Network Operations Center & Server Lab',
            buildingId: 'gedung-a',
            floorNumber: 2,
            type: 'facility',
            status: 'maintenance',
            capacity: 8,
            temperature: 18,
            acUnits: 3,
            facilities: [
              { name: 'Server Blade Cluster Kampus', iconName: 'Server', available: true },
              { name: 'Sistem UPS Cadangan 30 kVA', iconName: 'Zap', available: true }
            ],
            description: 'Pusat operasional jaringan internet kampus dan server praktikum mahasiswa.',
            currentActivity: {
              title: 'Pemeliharaan Rutin Switch Core Jaringan',
              personInCharge: 'Tim Network Engineer UPT',
              department: 'UPT Komputer',
              startTime: '09:00',
              endTime: '15:00'
            },
            schedule: [],
            coordinates: { x: 620, y: 260, w: 240, h: 200, doorPosition: 'left' }
          }
        ]
      }
    ]
  },
  {
    id: 'gedung-b',
    code: 'B',
    name: 'Gedung FT.1 - Dekanat & Pusat Riset Inovasi',
    shortName: 'FT.1',
    tagline: 'Pusat Manajemen Pimpinan Fakultas, Senat Akademik, dan Lab Robotika',
    floorsCount: 2,
    address: 'Komp. Kampus Barat, Jl. Prof. Soedarto, SH, Tembalang',
    operatingHours: '07.30 - 21.30 WIB',
    floors: [
      {
        floorNumber: 1,
        name: 'Lantai 1 - Kantor Dekanat & Layanan Mahasiswa',
        description: 'Lobby utama fakultas, kantor dekanat, loket kemahasiswaan, dan poliklinik.',
        dimensions: { width: 900, height: 500 },
        rooms: [
          {
            id: 'b-101',
            code: 'B-101',
            name: 'Grand Lobby Dekanat & Receptionist',
            buildingId: 'gedung-b',
            floorNumber: 1,
            type: 'facility',
            status: 'available',
            capacity: 50,
            temperature: 23,
            acUnits: 3,
            facilities: [
              { name: 'Meja Resepsionis & Kiosk Layanan', iconName: 'UserCheck', available: true },
              { name: 'Display Informasi Fakultas', iconName: 'Monitor', available: true }
            ],
            description: 'Pintu masuk utama Gedung Dekanat dengan layanan informasi bagi tamu dan mahasiswa.',
            schedule: [],
            coordinates: { x: 40, y: 40, w: 260, h: 200, doorPosition: 'bottom' }
          },
          {
            id: 'b-102',
            code: 'B-102',
            name: 'Kantor Dekan & Para Wakil Dekan',
            buildingId: 'gedung-b',
            floorNumber: 1,
            type: 'office',
            status: 'occupied',
            capacity: 20,
            currentOccupancy: 12,
            temperature: 21,
            acUnits: 3,
            facilities: [
              { name: 'Ruang Kerja Dekan & Wadek I/II/III', iconName: 'Shield', available: true },
              { name: 'Ruang Tamu Pimpinan', iconName: 'Armchair', available: true }
            ],
            description: 'Ruang kerja pimpinan fakultas untuk koordinasi strategis tridharma perguruan tinggi.',
            currentActivity: {
              title: 'Audiensi Kerjasama Industri BUMN PT Telkom',
              personInCharge: 'Dekan Fakultas & Wakil Dekan III',
              department: 'Dekanat',
              startTime: '09:30',
              endTime: '12:00'
            },
            schedule: [],
            coordinates: { x: 320, y: 40, w: 280, h: 200, doorPosition: 'bottom' }
          },
          {
            id: 'b-103',
            code: 'B-103',
            name: 'Bagian Tata Usaha & Kepegawaian',
            buildingId: 'gedung-b',
            floorNumber: 1,
            type: 'office',
            status: 'occupied',
            capacity: 25,
            currentOccupancy: 18,
            temperature: 22,
            acUnits: 2,
            facilities: [
              { name: 'Stasiun Kerja Administrasi Dosen', iconName: 'Users', available: true },
              { name: 'Arsip Dokumen Fakultas', iconName: 'Archive', available: true }
            ],
            description: 'Layanan administrasi persuratan dinas, surat pengantar tugas, dan arsip fakultas.',
            schedule: [],
            coordinates: { x: 620, y: 40, w: 240, h: 200, doorPosition: 'left' }
          },
          {
            id: 'b-104',
            code: 'B-104',
            name: 'Sekretariat BEM & Organisasi Mahasiswa',
            buildingId: 'gedung-b',
            floorNumber: 1,
            type: 'office',
            status: 'available',
            capacity: 35,
            temperature: 23,
            acUnits: 2,
            facilities: [
              { name: 'Meja Rapat Presidium Ormawa', iconName: 'Users', available: true },
              { name: 'Papan Pengumuman Kegiatan Mahasiswa', iconName: 'FileText', available: true }
            ],
            description: 'Pusat kegiatan organisasi Badan Eksekutif Mahasiswa (BEM) dan Senat Mahasiswa.',
            schedule: [
              { id: 'sb-101', title: 'Rapat Persiapan Dies Natalis Kampus', organizer: 'Pengurus BEM', timeRange: '15:30 - 18:00', type: 'Rapat Ormawa' }
            ],
            coordinates: { x: 40, y: 260, w: 260, h: 200, doorPosition: 'top' }
          },
          {
            id: 'b-105',
            code: 'B-105',
            name: 'Pusat Karir & Bimbingan Konseling Mahasiswa',
            buildingId: 'gedung-b',
            floorNumber: 1,
            type: 'office',
            status: 'available',
            capacity: 20,
            temperature: 22,
            acUnits: 2,
            facilities: [
              { name: 'Bilik Konseling Psikologis Privat', iconName: 'Shield', available: true },
              { name: 'Pojok Magang Kampus Merdeka (MBKM)', iconName: 'BookOpen', available: true }
            ],
            description: 'Layanan konsultasi kesehatan mental mahasiswa dan info magang BUMN/swasta.',
            schedule: [],
            coordinates: { x: 320, y: 260, w: 280, h: 200, doorPosition: 'top' }
          },
          {
            id: 'b-106',
            code: 'B-106',
            name: 'Poliklinik Mini Pertolongan Pertama (P3K)',
            buildingId: 'gedung-b',
            floorNumber: 1,
            type: 'facility',
            status: 'available',
            capacity: 10,
            temperature: 21,
            acUnits: 1,
            facilities: [
              { name: 'Bed Pasien & Tabung Oksigen', iconName: 'Home', available: true },
              { name: 'Obat-obatan Darurat Kampus', iconName: 'Shield', available: true }
            ],
            description: 'Layanan medis darurat untuk penanganan awal mahasiswa atau civitas yang kurang sehat.',
            schedule: [],
            coordinates: { x: 620, y: 260, w: 240, h: 200, doorPosition: 'left' }
          }
        ]
      },
      {
        floorNumber: 2,
        name: 'Lantai 2 - Ruang Sidang Senat & Lab Riset Inovasi',
        description: 'Lantai representatif rapat senat guru besar, lab robotika, dan perpustakaan riset.',
        dimensions: { width: 900, height: 500 },
        rooms: [
          {
            id: 'b-201',
            code: 'B-201',
            name: 'Ruang Sidang Senat Akademik Fakultas',
            buildingId: 'gedung-b',
            floorNumber: 2,
            type: 'meeting',
            status: 'occupied',
            capacity: 40,
            currentOccupancy: 28,
            temperature: 21,
            acUnits: 4,
            facilities: [
              { name: 'Meja Rapat Senat U-Shape', iconName: 'Users', available: true },
              { name: 'Audio Conference Tiap Kursi', iconName: 'Mic', available: true },
              { name: 'Dual Display TV 85"', iconName: 'Tv', available: true }
            ],
            description: 'Ruang rapat formal guru besar dan pimpinan prodi untuk penentuan kebijakan akademik.',
            currentActivity: {
              title: 'Rapat Evaluasi Kurikulum Berbasis Outcome (OBE)',
              personInCharge: 'Ketua Senat Fakultas',
              department: 'Senat Fakultas',
              startTime: '09:00',
              endTime: '12:30'
            },
            schedule: [
              { id: 'sb-201', title: 'Rapat Evaluasi Kurikulum OBE', organizer: 'Senat Fakultas', timeRange: '09:00 - 12:30', type: 'Rapat Senat' }
            ],
            coordinates: { x: 40, y: 40, w: 260, h: 200, doorPosition: 'bottom' }
          },
          {
            id: 'b-202',
            code: 'B-202',
            name: 'Lab Riset Robotika, IoT & FabLab 3D',
            buildingId: 'gedung-b',
            floorNumber: 2,
            type: 'laboratory',
            status: 'occupied',
            capacity: 35,
            currentOccupancy: 26,
            temperature: 22,
            acUnits: 3,
            facilities: [
              { name: '8x High Precision 3D Printers', iconName: 'Printer', available: true },
              { name: 'Arena Uji Robotika Beroda KRI', iconName: 'Grid', available: true },
              { name: 'Soldering & Oscilloscope Station', iconName: 'Zap', available: true }
            ],
            description: 'Laboratorium riset hardware, robot otonom, dan pembuatan prototipe tugas akhir.',
            currentActivity: {
              title: 'Pengerjaan Prototipe Robot Pemadam Api Otonom',
              personInCharge: 'Tim Robotika Universitas',
              department: 'Lab Robotika',
              startTime: '09:30',
              endTime: '16:00'
            },
            schedule: [],
            coordinates: { x: 320, y: 40, w: 280, h: 200, doorPosition: 'bottom' }
          },
          {
            id: 'b-203',
            code: 'B-203',
            name: 'Ruang Sidang Tesis Magister & Promosi',
            buildingId: 'gedung-b',
            floorNumber: 2,
            type: 'meeting',
            status: 'reserved',
            capacity: 25,
            temperature: 21,
            acUnits: 2,
            facilities: [
              { name: 'Meja Penguji Tertutup', iconName: 'Shield', available: true },
              { name: 'Layar Presentasi Interaktif', iconName: 'Tv', available: true }
            ],
            description: 'Ruangan khusus untuk ujian tesis mahasiswa pascasarjana (S2).',
            schedule: [
              { id: 'sb-202', title: 'Ujian Tesis S2 Informatika', organizer: 'Program Pascasarjana', timeRange: '13:00 - 15:30', type: 'Ujian Tesis' }
            ],
            coordinates: { x: 620, y: 40, w: 240, h: 200, doorPosition: 'left' }
          },
          {
            id: 'b-204',
            code: 'B-204',
            name: 'Coworking Space Riset Dosen & Mahasiswa',
            buildingId: 'gedung-b',
            floorNumber: 2,
            type: 'lounge',
            status: 'available',
            capacity: 40,
            temperature: 23,
            acUnits: 3,
            facilities: [
              { name: 'Sofa Diskusi & Meja Panjang', iconName: 'Layers', available: true },
              { name: 'Glass Wall Ideation Board', iconName: 'PenTool', available: true }
            ],
            description: 'Ruang kolaborasi penulisan publikasi jurnal terindeks Scopus dan proposal hibah.',
            schedule: [],
            coordinates: { x: 40, y: 260, w: 260, h: 200, doorPosition: 'top' }
          },
          {
            id: 'b-205',
            code: 'B-205',
            name: 'Perpustakaan Riset Digital & E-Journal',
            buildingId: 'gedung-b',
            floorNumber: 2,
            type: 'facility',
            status: 'available',
            capacity: 45,
            temperature: 22,
            acUnits: 3,
            facilities: [
              { name: 'Terminal Akses IEEE & ScienceDirect', iconName: 'Search', available: true },
              { name: 'Koleksi Skripsi & Tesis Digital', iconName: 'Book', available: true }
            ],
            description: 'Pusat referensi ilmiah digital dengan akses jurnal internasional bereputasi.',
            schedule: [],
            coordinates: { x: 320, y: 260, w: 280, h: 200, doorPosition: 'top' }
          },
          {
            id: 'b-206',
            code: 'B-206',
            name: 'Studio Multimedia & Produksi MOOCs Daring',
            buildingId: 'gedung-b',
            floorNumber: 2,
            type: 'facility',
            status: 'available',
            capacity: 12,
            temperature: 20,
            acUnits: 2,
            facilities: [
              { name: 'Peredam Suara Profesional', iconName: 'Shield', available: true },
              { name: 'Kamera Cinema & Teleprompter', iconName: 'Camera', available: true },
              { name: 'Lighting Studio & Green Screen', iconName: 'Sun', available: true }
            ],
            description: 'Studio rekaman video materi pembelajaran daring (MOOCs) bagi dosen universitas.',
            schedule: [],
            coordinates: { x: 620, y: 260, w: 240, h: 200, doorPosition: 'left' }
          }
        ]
      }
    ]
  }
];


export const INITIAL_BOOKINGS = [
  {
    id: 'BK-102901',
    roomId: 'a-101',
    roomName: 'Ruang Kuliah Teori 01 (Smart Classroom)',
    roomCode: 'A-101',
    userName: 'Dr. Ir. Budi Santoso',
    userEmail: 'budi@kampus.ac.id',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '10:30',
    purpose: 'Kuliah Algoritma & Pemrograman Dasar',
    participants: 54,
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  },
  {
    id: 'BK-102902',
    roomId: 'a-203',
    roomName: 'Ruang Sidang Skripsi & Pendadaran Sarjana',
    roomCode: 'A-203',
    userName: 'Koordinator Skripsi Informatika',
    userEmail: 'skripsi@kampus.ac.id',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:45',
    purpose: 'Sidang Ujian Tugas Akhir Mahasiswa',
    participants: 12,
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  },
  {
    id: 'BK-102903',
    roomId: 'b-201',
    roomName: 'Ruang Sidang Senat Akademik Fakultas',
    roomCode: 'B-201',
    userName: 'Sekretariat Senat Fakultas',
    userEmail: 'senat@kampus.ac.id',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '12:30',
    purpose: 'Rapat Evaluasi Kurikulum Outcome-Based Education (OBE)',
    participants: 28,
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  }
];
