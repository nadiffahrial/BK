# SmartCampus3D - Universitas Siliwangi 🏛️📍

> **Sistem Informasi Denah 3D Interaktif & Navigasi Kampus Berbasis IoT GPS**  
> Kampus Universitas Siliwangi — Gedung LABTEK 1 (Perkuliahan Terpadu) & Gedung FT.1 (Dekanat & Riset).

---

## 🌟 Fitur Utama

- **🏛️ Denah 3D Isometrik & 2D Interaktif:**
  - Visualisasi arsitektural gedung kampus lengkap dengan tangga sentral, partisi dinding ruangan, pintu, meja kuliah, dan fasilitas.
  - Multi-lantai: Tingkat 1 & Tingkat 2 untuk Gedung LABTEK 1 dan FT.1.
  - Quick-switch tombol gedung yang langsung memfokuskan model 3D.
- **🧭 Navigasi Jalur IoT & Turn-by-Turn Guidance:**
  - Penentuan posisi pengguna melalui IoT Anchor Beacons (BLE/ESP32) dan fallback GPS perangkat.
  - Algoritma pencarian rute jalan (*pathfinding*) cerdas dengan estimasi jarak (meter) dan waktu tempuh (detik).
  - Simulasi langkah dinamis (*Simulate Walk*) langsung di atas canvas denah.
- **🔍 Pencarian Ruangan Mahasiswa Cepat (Spotlight / Ctrl+K):**
  - Mesin pencari instan untuk ruang kuliah teori, laboratorium komputer & AI, ruang sidang skripsi, ruang dosen, dan layanan BAAK.
- **⚡ Status Ruangan & Telemetri Real-Time:**
  - Ketersediaan ruangan (*Available*, *Occupied*, *Reserved*, *Maintenance*).
  - Update langsung dengan Server-Sent Events (SSE) dan integrasi database MySQL XAMPP.
- **🌓 Transisi Fleksibel Dark Mode & Light Mode:**
  - Tema adaptif dengan palet warna resmi Universitas Siliwangi (Emerald, Gold, Slate).

---

## 🛠️ Tech Stack

### Frontend:
- **Framework:** React 18 with TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS & Lucide Icons
- **State Management:** React Context API (`AuthContext`, `GpsContext`, `ThemeContext`)

### Backend:
- **Runtime:** Node.js (Express.js)
- **Database:** MySQL (XAMPP / MariaDB) dengan auto-fallback memory store
- **Real-Time Communication:** Server-Sent Events (SSE)

---

## 🚀 Panduan Menjalankan Proyek

### 1. Prasyarat
- [Node.js](https://nodejs.org/) (versi 18+ direkomendasikan)
- [XAMPP](https://www.apachefriends.org/) (untuk Apache & MySQL port 3306)

### 2. Instalasi Dependensi
```bash
# Clone repository
git clone https://github.com/nadiffahrial/BK.git
cd BK

# Install paket frontend & backend
npm install
```

### 3. Konfigurasi Database
1. Buka XAMPP Control Panel dan nyalakan **Apache** dan **MySQL**.
2. Masuk ke **phpMyAdmin** (`http://localhost/phpmyadmin/`).
3. Buat database bernama `smartspace_db` (skema dan data awal akan otomatis ter-generate saat server backend pertama kali dijalankan dari `database/schema.sql`).
4. Sesuaikan file `.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=smartspace_db
   DB_PORT=3306
   ```

### 4. Menjalankan Aplikasi
Buka 2 terminal terpisah:

**Terminal 1 (Backend API Server):**
```bash
node server/index.js
# Backend aktif di: http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev
# Frontend aktif di: http://localhost:5173
```

---

## 📁 Struktur Direktori
```text
├── database/            # Skema SQL & inisialisasi data MySQL
├── public/              # Aset statis & logo resmi Universitas Siliwangi
├── server/
│   ├── config/          # Koneksi MySQL pool
│   ├── controllers/     # Controller IoT, navigasi, kampus, ruangan, jadwal, auth
│   ├── routes/          # Definisi REST API endpoints
│   ├── index.js         # Entry point server Express & SSE
│   └── store.js         # In-memory store data gedung & fallback
├── src/
│   ├── components/
│   │   ├── auth/        # Halaman Login & Quick Demo Roles
│   │   ├── common/      # ThemeToggle, SearchEngineModal, StudentRoomFinder
│   │   ├── floorplan/   # IsometricView 3D, FloorMapSvg 2D, RoomDetailModal
│   │   ├── layout/      # Navbar, BuildingCardSelector, NavigationMenuDrawer, Footer
│   │   └── navigation/  # IotGpsControlBar & panduan rute jalan
│   ├── context/         # AuthContext, GpsContext, ThemeContext
│   ├── data/            # Data statis gedung, tingkat lantai, dan IoT Beacons
│   ├── services/        # API client & SSE EventSource service
│   ├── types/           # Deklarasi TypeScript interfaces
│   ├── App.tsx          # Komponen utama aplikasi
│   └── main.tsx         # Bootstrap React DOM
└── package.json
```

---

## 👨‍💻 Kontributor
- **Nadif Ahmad Fahrial** ([@nadiffahrial](https://github.com/nadiffahrial))
- **Universitas Siliwangi**

