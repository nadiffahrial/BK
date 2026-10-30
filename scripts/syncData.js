import fs from 'fs';

let code = fs.readFileSync('src/data/buildingsData.ts', 'utf8');
code = code.replace(/import { Building } from '\.\.\/types';\r?\n/, '');
code = code.replace('export const BUILDINGS_DATA: Building[] =', 'export const INITIAL_BUILDINGS =');

const bookings = `

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
`;

fs.writeFileSync('server/data/initialData.js', code + bookings, 'utf8');
console.log('Successfully synced server/data/initialData.js');

