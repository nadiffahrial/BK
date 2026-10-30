import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';
import { initDatabase } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString('id-ID');
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Mount API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.send({
    message: 'SmartCampus 3D Universitas Siliwangi Backend Server is Running',
    institution: 'Universitas Siliwangi (UNSIL)',
    database: 'MySQL XAMPP (phpMyAdmin) connected',
    databaseName: process.env.DB_NAME || 'smartspace_db',
    documentation: '/api/health',
    endpoints: [
      'GET /api/campus/info (Profil Kampus UNSIL & Ringkasan Gedung)',
      'GET /api/schedule/today (Jadwal Perkuliahan Hari Ini)',
      'GET /api/categories (Kategori Ruangan Mahasiswa)',
      'GET /api/buildings (Daftar Gedung LABTEK 1 & FT.1)',
      'GET /api/rooms (Daftar Ruangan & Filter)',
      'GET /api/search (Search Engine Pencarian Cepat Ruangan)',
      'PATCH /api/rooms/:id/status (Update Status Ruang)',
      'GET /api/iot/beacons (Daftar IoT Anchor Beacons ESP32/BLE)',
      'POST /api/iot/locate (Trilaterasi Posisi Indoor)',
      'POST /api/navigation/route (Kalkulasi Rute Jalan Turn-by-Turn)',
      'POST /api/iot/telemetry (Update Sensor Lingkungan & Suhu)',
      'GET /api/events (Server-Sent Events Real-time)'
    ]
  });
});

// Start listening and initialize MySQL XAMPP connection
const startServer = async () => {
  // Connect and initialize database
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  🚀 Node.js Backend Server is live!`);
    console.log(`  📍 Listening on:    http://localhost:${PORT}`);
    console.log(`  🗄️  MySQL XAMPP DB:  ${process.env.DB_NAME || 'smartspace_db'} (port ${process.env.DB_PORT || 3306})`);
    console.log(`  🌐 phpMyAdmin:      http://localhost/phpmyadmin/`);
    console.log(`  📡 API Health:      http://localhost:${PORT}/api/health`);
    console.log(`  ⚡ SSE Events:      http://localhost:${PORT}/api/events`);
    console.log(`=======================================================`);
  });
};

startServer();

export default app;
