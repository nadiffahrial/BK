-- ============================================================
-- SmartCampus 3D Universitas Siliwangi Database Export
-- Database: smartspace_db
-- Server: MariaDB / MySQL (XAMPP phpMyAdmin)
-- Gedung: LABTEK 1 & FT.1
-- Generated At: 2026-10-31T11:36:20.838Z
-- ============================================================

CREATE DATABASE IF NOT EXISTS `smartspace_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `smartspace_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Struktur Tabel: users
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) DEFAULT '123456',
  `role` enum('admin','staff','student','guest') DEFAULT 'staff',
  `department` varchar(150) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data Tabel: users (4 baris)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `department`, `avatar_url`, `created_at`) VALUES ('usr-admin', 'Ir. Hendra Pratama, M.Kom', 'admin.kampus@smartspace.ac.id', 'admin', 'admin', 'Direktorat Sarana Prasarana & IT', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `department`, `avatar_url`, `created_at`) VALUES ('usr-guest', 'Tamu / Delegasi Kampus', 'tamu@external-visitor.com', 'guest', 'guest', 'Pengunjung Publik', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `department`, `avatar_url`, `created_at`) VALUES ('usr-staff', 'Siti Rahmawati, S.Kom', 'siti.staff@smartspace.ac.id', 'staff', 'staff', 'Sekretariat Fakultas Fasilkom', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `department`, `avatar_url`, `created_at`) VALUES ('usr-student', 'Dimas Aditya (21040101)', 'dimas.aditya@student.ac.id', 'student', 'student', 'S1 Teknik Informatika 2023', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80', '\"2026-10-29T15:41:30.000Z\"');

-- ------------------------------------------------------------
-- Struktur Tabel: buildings
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `buildings`;
CREATE TABLE `buildings` (
  `id` varchar(50) NOT NULL,
  `code` varchar(10) NOT NULL,
  `name` varchar(150) NOT NULL,
  `short_name` varchar(50) NOT NULL,
  `tagline` text DEFAULT NULL,
  `floors_count` int(11) DEFAULT 4,
  `address` text DEFAULT NULL,
  `operating_hours` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data Tabel: buildings (2 baris)
INSERT INTO `buildings` (`id`, `code`, `name`, `short_name`, `tagline`, `floors_count`, `address`, `operating_hours`, `created_at`) VALUES ('gedung-a', 'A', 'Gedung LABTEK 1 - Perkuliahan Terpadu & Laboratorium', 'LABTEK 1', 'Pusat Perkuliahan Teori, Lab Komputer, dan Sidang Skripsi Universitas', 2, 'Komp. Kampus Barat, Jl. Prof. Soedarto, SH, Tembalang', '07.00 - 21.00 WIB', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `buildings` (`id`, `code`, `name`, `short_name`, `tagline`, `floors_count`, `address`, `operating_hours`, `created_at`) VALUES ('gedung-b', 'B', 'Gedung FT.1 - Dekanat & Pusat Riset Inovasi', 'FT.1', 'Pusat Manajemen Pimpinan Fakultas, Senat Akademik, dan Lab Robotika', 2, 'Komp. Kampus Barat, Jl. Prof. Soedarto, SH, Tembalang', '07.30 - 21.30 WIB', '\"2026-10-29T15:41:30.000Z\"');

-- ------------------------------------------------------------
-- Struktur Tabel: floors
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `floors`;
CREATE TABLE `floors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `building_id` varchar(50) NOT NULL,
  `floor_number` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `width` int(11) DEFAULT 900,
  `height` int(11) DEFAULT 500,
  PRIMARY KEY (`id`),
  KEY `building_id` (`building_id`),
  CONSTRAINT `floors_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data Tabel: floors (4 baris)
INSERT INTO `floors` (`id`, `building_id`, `floor_number`, `name`, `description`, `width`, `height`) VALUES (1, 'gedung-a', 1, 'Lantai 1 - Ruang Kuliah Teori & Layanan BAAK', 'Lantai ruang kuliah teori kapasitas besar, loket registrasi akademik, dan lounge mahasiswa.', 900, 500);
INSERT INTO `floors` (`id`, `building_id`, `floor_number`, `name`, `description`, `width`, `height`) VALUES (2, 'gedung-a', 2, 'Lantai 2 - Laboratorium Komputer & Sidang Skripsi', 'Lantai praktikum komputer, riset kecerdasan buatan, dan ruang ujian pendadaran sarjana.', 900, 500);
INSERT INTO `floors` (`id`, `building_id`, `floor_number`, `name`, `description`, `width`, `height`) VALUES (3, 'gedung-b', 1, 'Lantai 1 - Kantor Dekanat & Layanan Mahasiswa', 'Lobby utama fakultas, kantor dekanat, loket kemahasiswaan, dan poliklinik.', 900, 500);
INSERT INTO `floors` (`id`, `building_id`, `floor_number`, `name`, `description`, `width`, `height`) VALUES (4, 'gedung-b', 2, 'Lantai 2 - Ruang Sidang Senat & Lab Riset Inovasi', 'Lantai representatif rapat senat guru besar, lab robotika, dan perpustakaan riset.', 900, 500);

-- ------------------------------------------------------------
-- Struktur Tabel: rooms
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `rooms`;
CREATE TABLE `rooms` (
  `id` varchar(50) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(150) NOT NULL,
  `building_id` varchar(50) NOT NULL,
  `floor_number` int(11) NOT NULL,
  `type` varchar(50) DEFAULT 'classroom',
  `status` enum('available','occupied','reserved','maintenance') DEFAULT 'available',
  `capacity` int(11) DEFAULT 30,
  `current_occupancy` int(11) DEFAULT 0,
  `temperature` int(11) DEFAULT 22,
  `ac_units` int(11) DEFAULT 2,
  `description` text DEFAULT NULL,
  `current_activity_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`current_activity_json`)),
  `coordinates_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`coordinates_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `building_id` (`building_id`),
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data Tabel: rooms (24 baris)
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('a-101', 'A-101', 'Ruang Kuliah Teori 01 (Smart Classroom)', 'gedung-a', 1, 'classroom', 'reserved', 60, 50, 22, 3, 'Ruang kuliah teori berkapasitas 60 mahasiswa dengan fasilitas smart display dan AC sentral.', '{\"title\":\"Mata Kuliah: Algoritma & Struktur Data (Kelas A)\",\"personInCharge\":\"Dr. Ir. Budi Santoso, M.Kom\",\"department\":\"S1 Teknik Informatika\",\"startTime\":\"08:00\",\"endTime\":\"10:30\"}', '{\"x\":40,\"y\":40,\"w\":260,\"h\":200,\"doorPosition\":\"bottom\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('a-102', 'A-102', 'Ruang Kuliah Teori 02 (Multimedia)', 'gedung-a', 1, 'classroom', 'available', 60, 0, 23, 3, 'Ruang kuliah dengan proyektor laser resolusi tinggi dan pencahayaan ergonomis.', NULL, '{\"x\":320,\"y\":40,\"w\":280,\"h\":200,\"doorPosition\":\"bottom\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('a-103', 'A-103', 'Ruang Kuliah Amfiteater A3 (Kuliah Umum)', 'gedung-a', 1, 'auditorium', 'reserved', 100, 0, 21, 4, 'Ruang amfiteater bertingkat untuk kuliah umum gabungan dan seminar akademik prodi.', NULL, '{\"x\":620,\"y\":40,\"w\":240,\"h\":200,\"doorPosition\":\"left\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('a-104', 'A-104', 'Pusat Layanan BAAK & Registrasi KRS', 'gedung-a', 1, 'office', 'occupied', 30, 18, 22, 2, 'Loket pengurusan Kartu Rencana Studi (KRS), surat keterangan aktif, dan transkrip.', '{\"title\":\"Layanan Validasi KRS & Cuti Akademik\",\"personInCharge\":\"Staff Biro Akademik (BAAK)\",\"department\":\"BAAK Universitas\",\"startTime\":\"08:30\",\"endTime\":\"15:30\"}', '{\"x\":40,\"y\":260,\"w\":260,\"h\":200,\"doorPosition\":\"top\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('a-105', 'A-105', 'Lounge Mahasiswa & Co-Study Corner', 'gedung-a', 1, 'lounge', 'available', 45, 0, 24, 3, 'Ruang tunggu belajar mandiri mahasiswa di sela-sela pergantian jam kuliah.', NULL, '{\"x\":320,\"y\":260,\"w\":280,\"h\":200,\"doorPosition\":\"top\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('a-106', 'A-106', 'Ruang Transit & Bimbingan Dosen Pengajar', 'gedung-a', 1, 'office', 'available', 20, 0, 22, 2, 'Ruang istirahat dan persiapan dosen sebelum memulai jam perkuliahan di lantai 1.', NULL, '{\"x\":620,\"y\":260,\"w\":240,\"h\":200,\"doorPosition\":\"left\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('a-201', 'A-201', 'Lab Komputasi & Pemrograman Web', 'gedung-a', 2, 'laboratory', 'occupied', 45, 42, 20, 3, 'Laboratorium praktikum mata kuliah pemrograman frontend, backend, dan database.', '{\"title\":\"Praktikum Pemrograman Berorientasi Objek (Kelas C)\",\"personInCharge\":\"Asisten Laboratorium & Dosen Pengampu\",\"department\":\"Laboratorium Komputasi\",\"startTime\":\"10:00\",\"endTime\":\"12:30\"}', '{\"x\":40,\"y\":40,\"w\":260,\"h\":200,\"doorPosition\":\"bottom\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('a-202', 'A-202', 'Lab Kecerdasan Buatan & Data Science', 'gedung-a', 2, 'laboratory', 'occupied', 40, 35, 19, 4, 'Lab riset pelatihan model Machine Learning, Deep Learning, dan Computer Vision.', '{\"title\":\"Praktikum Deep Learning & Pengolahan Citra Digital\",\"personInCharge\":\"Prof. Sri Wahyuni, Ph.D\",\"department\":\"Laboratorium AI\",\"startTime\":\"09:00\",\"endTime\":\"12:00\"}', '{\"x\":320,\"y\":40,\"w\":280,\"h\":200,\"doorPosition\":\"bottom\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('a-203', 'A-203', 'Ruang Sidang Skripsi & Pendadaran Sarjana', 'gedung-a', 2, 'meeting', 'occupied', 25, 12, 21, 2, 'Ruang formal untuk pelaksanaan ujian sidang skripsi dan seminar proposal tugas akhir.', '{\"title\":\"Sidang Tugas Akhir: \\\"Implementasi Smart Building IoT\\\"\",\"personInCharge\":\"Ketua Tim Penguji Skripsi\",\"department\":\"Program Studi Informatika\",\"startTime\":\"10:00\",\"endTime\":\"11:45\"}', '{\"x\":620,\"y\":40,\"w\":240,\"h\":200,\"doorPosition\":\"left\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('a-204', 'A-204', 'Ruang Bimbingan Akademik & Dosen Wali', 'gedung-a', 2, 'office', 'available', 25, 0, 22, 2, 'Ruang konsultasi rencana studi perwalian semester dan bimbingan revisi tugas akhir.', NULL, '{\"x\":40,\"y\":260,\"w\":260,\"h\":200,\"doorPosition\":\"top\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('a-205', 'A-205', 'Ruang Kuliah Seminar Hybrid A-205', 'gedung-a', 2, 'classroom', 'available', 50, 0, 22, 3, 'Ruang kuliah berorientasi pembelajaran hybrid luring dan daring sekaligus.', NULL, '{\"x\":320,\"y\":260,\"w\":280,\"h\":200,\"doorPosition\":\"top\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('a-206', 'A-206', 'Network Operations Center & Server Lab', 'gedung-a', 2, 'facility', 'maintenance', 8, 0, 18, 3, 'Pusat operasional jaringan internet kampus dan server praktikum mahasiswa.', '{\"title\":\"Pemeliharaan Rutin Switch Core Jaringan\",\"personInCharge\":\"Tim Network Engineer UPT\",\"department\":\"UPT Komputer\",\"startTime\":\"09:00\",\"endTime\":\"15:00\"}', '{\"x\":620,\"y\":260,\"w\":240,\"h\":200,\"doorPosition\":\"left\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('b-101', 'B-101', 'Grand Lobby Dekanat & Receptionist', 'gedung-b', 1, 'facility', 'available', 50, 0, 23, 3, 'Pintu masuk utama Gedung Dekanat dengan layanan informasi bagi tamu dan mahasiswa.', NULL, '{\"x\":40,\"y\":40,\"w\":260,\"h\":200,\"doorPosition\":\"bottom\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('b-102', 'B-102', 'Kantor Dekan & Para Wakil Dekan', 'gedung-b', 1, 'office', 'occupied', 20, 12, 21, 3, 'Ruang kerja pimpinan fakultas untuk koordinasi strategis tridharma perguruan tinggi.', '{\"title\":\"Audiensi Kerjasama Industri BUMN PT Telkom\",\"personInCharge\":\"Dekan Fakultas & Wakil Dekan III\",\"department\":\"Dekanat\",\"startTime\":\"09:30\",\"endTime\":\"12:00\"}', '{\"x\":320,\"y\":40,\"w\":280,\"h\":200,\"doorPosition\":\"bottom\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('b-103', 'B-103', 'Bagian Tata Usaha & Kepegawaian', 'gedung-b', 1, 'office', 'occupied', 25, 18, 22, 2, 'Layanan administrasi persuratan dinas, surat pengantar tugas, dan arsip fakultas.', NULL, '{\"x\":620,\"y\":40,\"w\":240,\"h\":200,\"doorPosition\":\"left\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('b-104', 'B-104', 'Sekretariat BEM & Organisasi Mahasiswa', 'gedung-b', 1, 'office', 'available', 35, 0, 23, 2, 'Pusat kegiatan organisasi Badan Eksekutif Mahasiswa (BEM) dan Senat Mahasiswa.', NULL, '{\"x\":40,\"y\":260,\"w\":260,\"h\":200,\"doorPosition\":\"top\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('b-105', 'B-105', 'Pusat Karir & Bimbingan Konseling Mahasiswa', 'gedung-b', 1, 'office', 'available', 20, 0, 22, 2, 'Layanan konsultasi kesehatan mental mahasiswa dan info magang BUMN/swasta.', NULL, '{\"x\":320,\"y\":260,\"w\":280,\"h\":200,\"doorPosition\":\"top\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('b-106', 'B-106', 'Poliklinik Mini Pertolongan Pertama (P3K)', 'gedung-b', 1, 'facility', 'available', 10, 0, 21, 1, 'Layanan medis darurat untuk penanganan awal mahasiswa atau civitas yang kurang sehat.', NULL, '{\"x\":620,\"y\":260,\"w\":240,\"h\":200,\"doorPosition\":\"left\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('b-201', 'B-201', 'Ruang Sidang Senat Akademik Fakultas', 'gedung-b', 2, 'meeting', 'occupied', 40, 28, 21, 4, 'Ruang rapat formal guru besar dan pimpinan prodi untuk penentuan kebijakan akademik.', '{\"title\":\"Rapat Evaluasi Kurikulum Berbasis Outcome (OBE)\",\"personInCharge\":\"Ketua Senat Fakultas\",\"department\":\"Senat Fakultas\",\"startTime\":\"09:00\",\"endTime\":\"12:30\"}', '{\"x\":40,\"y\":40,\"w\":260,\"h\":200,\"doorPosition\":\"bottom\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('b-202', 'B-202', 'Lab Riset Robotika, IoT & FabLab 3D', 'gedung-b', 2, 'laboratory', 'occupied', 35, 26, 22, 3, 'Laboratorium riset hardware, robot otonom, dan pembuatan prototipe tugas akhir.', '{\"title\":\"Pengerjaan Prototipe Robot Pemadam Api Otonom\",\"personInCharge\":\"Tim Robotika Universitas\",\"department\":\"Lab Robotika\",\"startTime\":\"09:30\",\"endTime\":\"16:00\"}', '{\"x\":320,\"y\":40,\"w\":280,\"h\":200,\"doorPosition\":\"bottom\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('b-203', 'B-203', 'Ruang Sidang Tesis Magister & Promosi', 'gedung-b', 2, 'meeting', 'reserved', 25, 0, 21, 2, 'Ruangan khusus untuk ujian tesis mahasiswa pascasarjana (S2).', NULL, '{\"x\":620,\"y\":40,\"w\":240,\"h\":200,\"doorPosition\":\"left\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('b-204', 'B-204', 'Coworking Space Riset Dosen & Mahasiswa', 'gedung-b', 2, 'lounge', 'available', 40, 0, 23, 3, 'Ruang kolaborasi penulisan publikasi jurnal terindeks Scopus dan proposal hibah.', NULL, '{\"x\":40,\"y\":260,\"w\":260,\"h\":200,\"doorPosition\":\"top\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('b-205', 'B-205', 'Perpustakaan Riset Digital & E-Journal', 'gedung-b', 2, 'facility', 'available', 45, 0, 22, 3, 'Pusat referensi ilmiah digital dengan akses jurnal internasional bereputasi.', NULL, '{\"x\":320,\"y\":260,\"w\":280,\"h\":200,\"doorPosition\":\"top\"}', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `rooms` (`id`, `code`, `name`, `building_id`, `floor_number`, `type`, `status`, `capacity`, `current_occupancy`, `temperature`, `ac_units`, `description`, `current_activity_json`, `coordinates_json`, `created_at`) VALUES ('b-206', 'B-206', 'Studio Multimedia & Produksi MOOCs Daring', 'gedung-b', 2, 'facility', 'available', 12, 0, 20, 2, 'Studio rekaman video materi pembelajaran daring (MOOCs) bagi dosen universitas.', NULL, '{\"x\":620,\"y\":260,\"w\":240,\"h\":200,\"doorPosition\":\"left\"}', '\"2026-10-29T15:41:30.000Z\"');

-- ------------------------------------------------------------
-- Struktur Tabel: room_facilities
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `room_facilities`;
CREATE TABLE `room_facilities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `icon_name` varchar(50) DEFAULT 'Check',
  `available` tinyint(1) DEFAULT 1,
  `spec` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `room_facilities_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data Tabel: room_facilities (56 baris)
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (1, 'a-101', 'Interactive Smart Board 86\"', 'Monitor', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (2, 'a-101', 'Sound System & Wireless Mic', 'Volume2', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (3, 'a-101', 'WiFi Eduroam 500 Mbps', 'Wifi', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (4, 'a-102', 'Laser Projector 5000 Lumens', 'Tv', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (5, 'a-102', 'Stopkontak Tiap Meja Mahasiswa', 'Zap', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (6, 'a-103', 'Kursi Teater Bertingkat', 'Users', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (7, 'a-103', 'Dual Display Videotron', 'Tv', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (8, 'a-103', 'Live Streaming Rig', 'Camera', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (9, 'a-104', 'Loket Pelayanan Mahasiswa 1-5', 'Users', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (10, 'a-104', 'Mesin Antrean Digital', 'Monitor', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (11, 'a-105', 'Meja Diskusi Modular', 'Layers', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (12, 'a-105', 'Coffee Station & Vending Machine', 'Coffee', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (13, 'a-105', 'Free WiFi 6', 'Wifi', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (14, 'a-106', 'Meja Kerja Dosen', 'UserCheck', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (15, 'a-106', 'Loker Dosen Pengampu', 'Lock', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (16, 'a-201', '45x PC Intel Core i7 32GB RAM', 'Cpu', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (17, 'a-201', 'Projector & Screen 120\"', 'Tv', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (18, 'a-201', 'Gigabit Switch Network', 'Network', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (19, 'a-202', '35x PC Workstation Nvidia RTX 4080', 'Cpu', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (20, 'a-202', 'High-Performance Computing Node', 'Server', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (21, 'a-203', 'Meja Dewan Penguji (5 Dosen)', 'Users', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (22, 'a-203', 'Podium Presentasi Mahasiswa', 'Mic', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (23, 'a-203', 'Smart Display TV 75\"', 'Tv', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (24, 'a-204', 'Bilik Konsultasi Dosen-Mahasiswa', 'Users', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (25, 'a-204', 'WiFi Eduroam Kampus', 'Wifi', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (26, 'a-205', 'Zoom Rooms Integration System', 'Video', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (27, 'a-205', 'PTZ Tracking Camera Otomatis', 'Camera', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (28, 'a-206', 'Server Blade Cluster Kampus', 'Server', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (29, 'a-206', 'Sistem UPS Cadangan 30 kVA', 'Zap', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (30, 'b-101', 'Meja Resepsionis & Kiosk Layanan', 'UserCheck', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (31, 'b-101', 'Display Informasi Fakultas', 'Monitor', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (32, 'b-102', 'Ruang Kerja Dekan & Wadek I/II/III', 'Shield', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (33, 'b-102', 'Ruang Tamu Pimpinan', 'Armchair', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (34, 'b-103', 'Stasiun Kerja Administrasi Dosen', 'Users', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (35, 'b-103', 'Arsip Dokumen Fakultas', 'Archive', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (36, 'b-104', 'Meja Rapat Presidium Ormawa', 'Users', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (37, 'b-104', 'Papan Pengumuman Kegiatan Mahasiswa', 'FileText', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (38, 'b-105', 'Bilik Konseling Psikologis Privat', 'Shield', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (39, 'b-105', 'Pojok Magang Kampus Merdeka (MBKM)', 'BookOpen', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (40, 'b-106', 'Bed Pasien & Tabung Oksigen', 'Home', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (41, 'b-106', 'Obat-obatan Darurat Kampus', 'Shield', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (42, 'b-201', 'Meja Rapat Senat U-Shape', 'Users', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (43, 'b-201', 'Audio Conference Tiap Kursi', 'Mic', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (44, 'b-201', 'Dual Display TV 85\"', 'Tv', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (45, 'b-202', '8x High Precision 3D Printers', 'Printer', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (46, 'b-202', 'Arena Uji Robotika Beroda KRI', 'Grid', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (47, 'b-202', 'Soldering & Oscilloscope Station', 'Zap', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (48, 'b-203', 'Meja Penguji Tertutup', 'Shield', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (49, 'b-203', 'Layar Presentasi Interaktif', 'Tv', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (50, 'b-204', 'Sofa Diskusi & Meja Panjang', 'Layers', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (51, 'b-204', 'Glass Wall Ideation Board', 'PenTool', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (52, 'b-205', 'Terminal Akses IEEE & ScienceDirect', 'Search', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (53, 'b-205', 'Koleksi Skripsi & Tesis Digital', 'Book', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (54, 'b-206', 'Peredam Suara Profesional', 'Shield', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (55, 'b-206', 'Kamera Cinema & Teleprompter', 'Camera', 1, NULL);
INSERT INTO `room_facilities` (`id`, `room_id`, `name`, `icon_name`, `available`, `spec`) VALUES (56, 'b-206', 'Lighting Studio & Green Screen', 'Sun', 1, NULL);

-- ------------------------------------------------------------
-- Struktur Tabel: room_schedules
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `room_schedules`;
CREATE TABLE `room_schedules` (
  `id` varchar(50) NOT NULL,
  `room_id` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `organizer` varchar(150) NOT NULL,
  `time_range` varchar(100) NOT NULL,
  `type` varchar(100) DEFAULT 'Agenda',
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `room_schedules_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data Tabel: room_schedules (13 baris)
INSERT INTO `room_schedules` (`id`, `room_id`, `title`, `organizer`, `time_range`, `type`) VALUES ('BK-901609', 'a-101', 'Test Booking Validation', 'Test User', '08:00 - 10:00', 'Peminjaman Baru');
INSERT INTO `room_schedules` (`id`, `room_id`, `title`, `organizer`, `time_range`, `type`) VALUES ('sa-101', 'a-101', 'Algoritma & Struktur Data', 'Dr. Budi Santoso', '08:00 - 10:30', 'Perkuliahan');
INSERT INTO `room_schedules` (`id`, `room_id`, `title`, `organizer`, `time_range`, `type`) VALUES ('sa-102', 'a-101', 'Kalkulus Lanjut', 'Dra. Nur Indah, M.Si', '13:00 - 15:30', 'Perkuliahan');
INSERT INTO `room_schedules` (`id`, `room_id`, `title`, `organizer`, `time_range`, `type`) VALUES ('sa-103', 'a-102', 'Basis Data Terdistribusi', 'Tim Dosen Basis Data', '14:00 - 16:30', 'Perkuliahan');
INSERT INTO `room_schedules` (`id`, `room_id`, `title`, `organizer`, `time_range`, `type`) VALUES ('sa-104', 'a-103', 'Kuliah Tamu: Keamanan Siber di Industri FinTech', 'Himpunan Mahasiswa', '13:00 - 16:00', 'Kuliah Umum');
INSERT INTO `room_schedules` (`id`, `room_id`, `title`, `organizer`, `time_range`, `type`) VALUES ('sa-201', 'a-201', 'Praktikum PBO Kelas C', 'Tim Asisten Lab', '10:00 - 12:30', 'Praktikum');
INSERT INTO `room_schedules` (`id`, `room_id`, `title`, `organizer`, `time_range`, `type`) VALUES ('sa-202', 'a-201', 'Praktikum Web Framework', 'Tim Asisten Lab', '13:30 - 16:00', 'Praktikum');
INSERT INTO `room_schedules` (`id`, `room_id`, `title`, `organizer`, `time_range`, `type`) VALUES ('sa-203', 'a-203', 'Sidang Skripsi Sesi Pagi', 'Koordinator TA', '10:00 - 11:45', 'Sidang');
INSERT INTO `room_schedules` (`id`, `room_id`, `title`, `organizer`, `time_range`, `type`) VALUES ('sa-204', 'a-203', 'Sidang Skripsi Sesi Siang', 'Koordinator TA', '13:00 - 14:45', 'Sidang');
INSERT INTO `room_schedules` (`id`, `room_id`, `title`, `organizer`, `time_range`, `type`) VALUES ('sa-205', 'a-205', 'Kuliah Tamu Dosen Praktisi Industri', 'Prodi Informatika', '14:00 - 16:30', 'Kuliah Hybrid');
INSERT INTO `room_schedules` (`id`, `room_id`, `title`, `organizer`, `time_range`, `type`) VALUES ('sb-101', 'b-104', 'Rapat Persiapan Dies Natalis Kampus', 'Pengurus BEM', '15:30 - 18:00', 'Rapat Ormawa');
INSERT INTO `room_schedules` (`id`, `room_id`, `title`, `organizer`, `time_range`, `type`) VALUES ('sb-201', 'b-201', 'Rapat Evaluasi Kurikulum OBE', 'Senat Fakultas', '09:00 - 12:30', 'Rapat Senat');
INSERT INTO `room_schedules` (`id`, `room_id`, `title`, `organizer`, `time_range`, `type`) VALUES ('sb-202', 'b-203', 'Ujian Tesis S2 Informatika', 'Program Pascasarjana', '13:00 - 15:30', 'Ujian Tesis');

-- ------------------------------------------------------------
-- Struktur Tabel: bookings
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` varchar(50) NOT NULL,
  `room_id` varchar(50) NOT NULL,
  `room_name` varchar(150) NOT NULL,
  `room_code` varchar(50) NOT NULL,
  `user_name` varchar(150) NOT NULL,
  `user_email` varchar(150) NOT NULL,
  `booking_date` date NOT NULL,
  `start_time` varchar(10) NOT NULL,
  `end_time` varchar(10) NOT NULL,
  `purpose` text NOT NULL,
  `participants` int(11) DEFAULT 1,
  `status` enum('confirmed','pending','cancelled') DEFAULT 'confirmed',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data Tabel: bookings (4 baris)
INSERT INTO `bookings` (`id`, `room_id`, `room_name`, `room_code`, `user_name`, `user_email`, `booking_date`, `start_time`, `end_time`, `purpose`, `participants`, `status`, `created_at`) VALUES ('BK-102901', 'a-101', 'Ruang Kuliah Teori 01 (Smart Classroom)', 'A-101', 'Dr. Ir. Budi Santoso', 'budi@kampus.ac.id', '\"2026-10-28T17:00:00.000Z\"', '08:00', '10:30', 'Kuliah Algoritma & Pemrograman Dasar', 54, 'confirmed', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `bookings` (`id`, `room_id`, `room_name`, `room_code`, `user_name`, `user_email`, `booking_date`, `start_time`, `end_time`, `purpose`, `participants`, `status`, `created_at`) VALUES ('BK-102902', 'a-203', 'Ruang Sidang Skripsi & Pendadaran Sarjana', 'A-203', 'Koordinator Skripsi Informatika', 'skripsi@kampus.ac.id', '\"2026-10-28T17:00:00.000Z\"', '10:00', '11:45', 'Sidang Ujian Tugas Akhir Mahasiswa', 12, 'confirmed', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `bookings` (`id`, `room_id`, `room_name`, `room_code`, `user_name`, `user_email`, `booking_date`, `start_time`, `end_time`, `purpose`, `participants`, `status`, `created_at`) VALUES ('BK-102903', 'b-201', 'Ruang Sidang Senat Akademik Fakultas', 'B-201', 'Sekretariat Senat Fakultas', 'senat@kampus.ac.id', '\"2026-10-28T17:00:00.000Z\"', '09:00', '12:30', 'Rapat Evaluasi Kurikulum Outcome-Based Education (OBE)', 28, 'confirmed', '\"2026-10-29T15:41:30.000Z\"');
INSERT INTO `bookings` (`id`, `room_id`, `room_name`, `room_code`, `user_name`, `user_email`, `booking_date`, `start_time`, `end_time`, `purpose`, `participants`, `status`, `created_at`) VALUES ('BK-901609', 'a-101', 'Ruang Kuliah Teori 01 (Smart Classroom)', 'A-101', 'Test User', 'test@kampus.ac.id', '\"2026-10-29T17:00:00.000Z\"', '08:00', '10:00', 'Test Booking Validation', 10, 'confirmed', '\"2026-10-29T15:48:21.000Z\"');

-- ------------------------------------------------------------
-- Struktur Tabel: cs_tickets
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `cs_tickets`;
CREATE TABLE `cs_tickets` (
  `id` varchar(50) NOT NULL,
  `sender_name` varchar(150) NOT NULL,
  `sender_email` varchar(150) NOT NULL,
  `sender_role` varchar(50) DEFAULT 'student',
  `category` varchar(100) NOT NULL,
  `room_code` varchar(50) DEFAULT '-',
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('pending','in_progress','resolved') DEFAULT 'pending',
  `admin_response` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data Tabel: cs_tickets (2 baris)
INSERT INTO `cs_tickets` (`id`, `sender_name`, `sender_email`, `sender_role`, `category`, `room_code`, `subject`, `message`, `status`, `admin_response`, `created_at`) VALUES ('CS-1008', 'Dr. Budi Santoso, M.T.', 'budi.santoso@unsil.ac.id', 'staff', 'Jaringan & WiFi Eduroam', 'A-201', 'Koneksi WiFi Lab AI Lambat', 'Koneksi hotspot Access Point di Lab Riset AI sering putus saat mahasiswa menjalankan training model.', 'resolved', 'Access Point telah di-restart dan alokasi bandwidth ditambah oleh UPT TIK.', '\"2026-10-31T11:36:20.000Z\"');
INSERT INTO `cs_tickets` (`id`, `sender_name`, `sender_email`, `sender_role`, `category`, `room_code`, `subject`, `message`, `status`, `admin_response`, `created_at`) VALUES ('CS-1011', 'Dimas Aditya (21040101)', 'dimas.aditya@student.unsil.ac.id', 'student', 'Sarana & Fasilitas', 'A-101', 'Proyektor HDMI Berkedip saat Kuliah', 'Kabel port HDMI di meja dosen ruang A-101 agak kendor dan layar proyektor berkedip hijau.', 'in_progress', 'Tim teknisi BAAK/Sarpras sudah diberitahu dan kabel HDMI pengganti sedang dipasang.', '\"2026-10-31T11:36:20.000Z\"');

SET FOREIGN_KEY_CHECKS = 1;
-- Selesai.
