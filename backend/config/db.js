import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { INITIAL_BUILDINGS, INITIAL_BOOKINGS } from '../data/initialData.js';

dotenv.config();

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'smartspace_db';
const DB_PORT = Number(process.env.DB_PORT) || 3306;

let pool = null;

export const initDatabase = async () => {
  try {
    // 1. Connect to MySQL server (without database name) to check/create database
    const initialConn = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT
    });

    console.log(`🔌 Terhubung ke MySQL XAMPP di ${DB_HOST}:${DB_PORT}`);

    // Create database if not exists
    await initialConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`🗄️  Database '${DB_NAME}' siap di phpMyAdmin`);
    await initialConn.end();

    // 2. Connect to the smartspace_db database using Connection Pool
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 3. Create tables if not exist
    await createTables();

    // 4. Seed initial data if tables are empty
    await seedInitialData();

    return pool;
  } catch (error) {
    console.error('❌ Gagal terhubung ke MySQL XAMPP:', error.message);
    console.warn('⚠️  Menjalankan server dengan mode in-memory data fallback.');
    return null;
  }
};

const createTables = async () => {
  // Users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
      \`name\` VARCHAR(150) NOT NULL,
      \`email\` VARCHAR(150) NOT NULL UNIQUE,
      \`password\` VARCHAR(255) DEFAULT '123456',
      \`role\` ENUM('admin', 'staff', 'student', 'guest') DEFAULT 'staff',
      \`department\` VARCHAR(150) DEFAULT NULL,
      \`avatar_url\` VARCHAR(255) DEFAULT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Buildings
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`buildings\` (
      \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
      \`code\` VARCHAR(10) NOT NULL,
      \`name\` VARCHAR(150) NOT NULL,
      \`short_name\` VARCHAR(50) NOT NULL,
      \`tagline\` TEXT,
      \`floors_count\` INT DEFAULT 4,
      \`address\` TEXT,
      \`operating_hours\` VARCHAR(100),
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Floors
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`floors\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`building_id\` VARCHAR(50) NOT NULL,
      \`floor_number\` INT NOT NULL,
      \`name\` VARCHAR(150) NOT NULL,
      \`description\` TEXT,
      \`width\` INT DEFAULT 900,
      \`height\` INT DEFAULT 500,
      FOREIGN KEY (\`building_id\`) REFERENCES \`buildings\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Rooms
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`rooms\` (
      \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
      \`code\` VARCHAR(20) NOT NULL,
      \`name\` VARCHAR(150) NOT NULL,
      \`building_id\` VARCHAR(50) NOT NULL,
      \`floor_number\` INT NOT NULL,
      \`type\` VARCHAR(50) DEFAULT 'classroom',
      \`status\` ENUM('available', 'occupied', 'reserved', 'maintenance') DEFAULT 'available',
      \`capacity\` INT DEFAULT 30,
      \`current_occupancy\` INT DEFAULT 0,
      \`temperature\` INT DEFAULT 22,
      \`ac_units\` INT DEFAULT 2,
      \`description\` TEXT,
      \`current_activity_json\` JSON DEFAULT NULL,
      \`coordinates_json\` JSON NOT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (\`building_id\`) REFERENCES \`buildings\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Room Facilities
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`room_facilities\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`room_id\` VARCHAR(50) NOT NULL,
      \`name\` VARCHAR(150) NOT NULL,
      \`icon_name\` VARCHAR(50) DEFAULT 'Check',
      \`available\` BOOLEAN DEFAULT TRUE,
      \`spec\` VARCHAR(150) DEFAULT NULL,
      FOREIGN KEY (\`room_id\`) REFERENCES \`rooms\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Room Schedules
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`room_schedules\` (
      \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
      \`room_id\` VARCHAR(50) NOT NULL,
      \`title\` VARCHAR(200) NOT NULL,
      \`organizer\` VARCHAR(150) NOT NULL,
      \`time_range\` VARCHAR(100) NOT NULL,
      \`type\` VARCHAR(100) DEFAULT 'Agenda',
      FOREIGN KEY (\`room_id\`) REFERENCES \`rooms\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Bookings
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`bookings\` (
      \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
      \`room_id\` VARCHAR(50) NOT NULL,
      \`room_name\` VARCHAR(150) NOT NULL,
      \`room_code\` VARCHAR(50) NOT NULL,
      \`user_name\` VARCHAR(150) NOT NULL,
      \`user_email\` VARCHAR(150) NOT NULL,
      \`booking_date\` DATE NOT NULL,
      \`start_time\` VARCHAR(10) NOT NULL,
      \`end_time\` VARCHAR(10) NOT NULL,
      \`purpose\` TEXT NOT NULL,
      \`participants\` INT DEFAULT 1,
      \`status\` ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'confirmed',
      \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (\`room_id\`) REFERENCES \`rooms\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Customer Service & Pengaduan Kampus Tickets
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`cs_tickets\` (
      \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
      \`sender_name\` VARCHAR(150) NOT NULL,
      \`sender_email\` VARCHAR(150) NOT NULL,
      \`sender_role\` VARCHAR(50) DEFAULT 'student',
      \`category\` VARCHAR(100) NOT NULL,
      \`room_code\` VARCHAR(50) DEFAULT '-',
      \`subject\` VARCHAR(255) NOT NULL,
      \`message\` TEXT NOT NULL,
      \`status\` ENUM('pending', 'in_progress', 'resolved') DEFAULT 'pending',
      \`admin_response\` TEXT,
      \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log(`📋 Tabel-tabel MySQL berhasil disinkronkan`);
};

const seedInitialData = async () => {
  // Ensure CS tickets are seeded if empty
  const [csCheck] = await pool.query('SELECT COUNT(*) as cnt FROM `cs_tickets`');
  if (csCheck[0].cnt === 0) {
    await pool.query(
      `INSERT INTO \`cs_tickets\` (id, sender_name, sender_email, sender_role, category, room_code, subject, message, status, admin_response)
       VALUES 
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'CS-1011', 'Dimas Aditya (21040101)', 'dimas.aditya@student.unsil.ac.id', 'student', 'Sarana & Fasilitas', 'A-101', 'Proyektor HDMI Berkedip saat Kuliah', 'Kabel port HDMI di meja dosen ruang A-101 agak kendor dan layar proyektor berkedip hijau.', 'in_progress', 'Tim teknisi BAAK/Sarpras sudah diberitahu dan kabel HDMI pengganti sedang dipasang.',
        'CS-1008', 'Dr. Budi Santoso, M.T.', 'budi.santoso@unsil.ac.id', 'staff', 'Jaringan & WiFi Eduroam', 'A-201', 'Koneksi WiFi Lab AI Lambat', 'Koneksi hotspot Access Point di Lab Riset AI sering putus saat mahasiswa menjalankan training model.', 'resolved', 'Access Point telah di-restart dan alokasi bandwidth ditambah oleh UPT TIK.'
      ]
    );
    console.log('✅ Tiket demo CS berhasil di-seed ke MySQL cs_tickets');
  }

  const [bRows] = await pool.query('SELECT COUNT(*) as cnt FROM `buildings`');
  const [sRows] = await pool.query('SELECT COUNT(*) as cnt FROM `room_schedules`');
  if (bRows[0].cnt === INITIAL_BUILDINGS.length && sRows[0].cnt > 0) {
    console.log(`✨ Database MySQL sudah berisi data gedung universitas (${bRows[0].cnt} gedung, 2 tingkat, ${sRows[0].cnt} jadwal).`);
    return;
  }

  console.log(`🌱 Menyesuaikan database ke dataset Universitas (${INITIAL_BUILDINGS.length} Gedung, masing-masing 2 Tingkat)...`);
  
  // Clear old tables for clean migration
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  await pool.query('TRUNCATE TABLE `bookings`');
  await pool.query('TRUNCATE TABLE `room_schedules`');
  await pool.query('TRUNCATE TABLE `room_facilities`');
  await pool.query('TRUNCATE TABLE `rooms`');
  await pool.query('TRUNCATE TABLE `floors`');
  await pool.query('TRUNCATE TABLE `buildings`');
  await pool.query('TRUNCATE TABLE `users`');
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');

  // 1. Seed Demo Users
  const users = [
    {
      id: 'usr-admin',
      name: 'Ir. Hendra Pratama, M.Kom',
      email: 'admin.kampus@smartspace.ac.id',
      password: 'admin',
      role: 'admin',
      department: 'Direktorat Sarana Prasarana & IT',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 'usr-staff',
      name: 'Siti Rahmawati, S.Kom',
      email: 'siti.staff@smartspace.ac.id',
      password: 'staff',
      role: 'staff',
      department: 'Sekretariat Fakultas Fasilkom',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 'usr-student',
      name: 'Dimas Aditya (21040101)',
      email: 'dimas.aditya@student.ac.id',
      password: 'student',
      role: 'student',
      department: 'S1 Teknik Informatika 2023',
      avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 'usr-guest',
      name: 'Tamu / Delegasi Kampus',
      email: 'tamu@external-visitor.com',
      password: 'guest',
      role: 'guest',
      department: 'Pengunjung Publik',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
    }
  ];

  for (const u of users) {
    await pool.query(
      'INSERT INTO `users` (id, name, email, password, role, department, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [u.id, u.name, u.email, u.password, u.role, u.department, u.avatar_url]
    );
  }

  // 2. Seed Buildings, Floors, Rooms, Facilities, Schedules
  for (const b of INITIAL_BUILDINGS) {
    await pool.query(
      'INSERT INTO `buildings` (id, code, name, short_name, tagline, floors_count, address, operating_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [b.id, b.code, b.name, b.shortName, b.tagline, b.floorsCount, b.address, b.operatingHours]
    );

    for (const f of b.floors) {
      await pool.query(
        'INSERT INTO `floors` (building_id, floor_number, name, description, width, height) VALUES (?, ?, ?, ?, ?, ?)',
        [b.id, f.floorNumber, f.name, f.description, f.dimensions.width, f.dimensions.height]
      );

      for (const r of f.rooms) {
        await pool.query(
          `INSERT INTO \`rooms\` (id, code, name, building_id, floor_number, type, status, capacity, current_occupancy, temperature, ac_units, description, current_activity_json, coordinates_json) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            r.id,
            r.code,
            r.name,
            b.id,
            f.floorNumber,
            r.type,
            r.status,
            r.capacity,
            r.currentOccupancy || 0,
            r.temperature || 22,
            r.acUnits || 2,
            r.description,
            r.currentActivity ? JSON.stringify(r.currentActivity) : null,
            JSON.stringify(r.coordinates)
          ]
        );

        // Facilities
        if (r.facilities && r.facilities.length > 0) {
          for (const fac of r.facilities) {
            await pool.query(
              'INSERT INTO `room_facilities` (room_id, name, icon_name, available, spec) VALUES (?, ?, ?, ?, ?)',
              [r.id, fac.name, fac.iconName, fac.available, fac.spec || null]
            );
          }
        }

        // Schedules
        if (r.schedule && r.schedule.length > 0) {
          for (const s of r.schedule) {
            await pool.query(
              'INSERT INTO `room_schedules` (id, room_id, title, organizer, time_range, type) VALUES (?, ?, ?, ?, ?, ?)',
              [s.id, r.id, s.title, s.organizer, s.timeRange, s.type]
            );
          }
        }
      }
    }
  }

  // 3. Seed Bookings
  for (const bk of INITIAL_BOOKINGS) {
    await pool.query(
      `INSERT INTO \`bookings\` (id, room_id, room_name, room_code, user_name, user_email, booking_date, start_time, end_time, purpose, participants, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bk.id,
        bk.roomId,
        bk.roomName,
        bk.roomCode,
        bk.userName,
        bk.userEmail,
        bk.date,
        bk.startTime,
        bk.endTime,
        bk.purpose,
        bk.participants,
        bk.status
      ]
    );
  }

  // 4. Seed CS Tickets if empty
  const [csRows] = await pool.query('SELECT COUNT(*) as cnt FROM `cs_tickets`');
  if (csRows[0].cnt === 0) {
    const initialTickets = [
      {
        id: 'CS-1011',
        sender_name: 'Dimas Aditya (21040101)',
        sender_email: 'dimas.aditya@student.unsil.ac.id',
        sender_role: 'student',
        category: 'Sarana & Fasilitas',
        room_code: 'A-101',
        subject: 'Proyektor HDMI Berkedip saat Kuliah',
        message: 'Kabel port HDMI di meja dosen ruang A-101 agak kendor dan layar proyektor berkedip hijau.',
        status: 'in_progress',
        admin_response: 'Tim teknisi BAAK/Sarpras sudah diberitahu dan kabel HDMI pengganti sedang dipasang.'
      },
      {
        id: 'CS-1008',
        sender_name: 'Dr. Budi Santoso, M.T.',
        sender_email: 'budi.santoso@unsil.ac.id',
        sender_role: 'staff',
        category: 'Jaringan & WiFi Eduroam',
        room_code: 'A-201',
        subject: 'Koneksi WiFi Lab AI Lambat',
        message: 'Koneksi hotspot Access Point di Lab Riset AI sering putus saat mahasiswa menjalankan training model.',
        status: 'resolved',
        admin_response: 'Access Point telah di-restart dan alokasi bandwidth ditambah oleh UPT TIK.'
      }
    ];

    for (const t of initialTickets) {
      await pool.query(
        `INSERT INTO \`cs_tickets\` (id, sender_name, sender_email, sender_role, category, room_code, subject, message, status, admin_response)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.sender_name, t.sender_email, t.sender_role, t.category, t.room_code, t.subject, t.message, t.status, t.admin_response]
      );
    }
  }

  console.log('✅ Seeding data gedung & tiket CS ke MySQL phpMyAdmin berhasil selesai!');
};

export const getDb = () => pool;

