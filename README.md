# SmartCampus3D - Universitas Siliwangi 🏛️📍

> **Sistem Informasi Denah 3D Interaktif & Navigasi Kampus Berbasis IoT GPS**  
> Kampus Universitas Siliwangi — Gedung LABTEK 1 (Perkuliahan Terpadu) & Gedung FT.1 (Dekanat & Riset).

---

## 📁 Struktur Monorepo (Frontend & Backend Terpisah)

```text
BK/
├── 📂 frontend/                 # Aplikasi Frontend (React + Vite + TailwindCSS)
│   ├── public/                 # Aset statis & logo kampus
│   ├── src/                    # Komponen, Halaman, Hook, & Data
│   ├── index.html              # Entry HTML Vite
│   ├── vite.config.ts          # Konfigurasi Vite & API Proxy
│   ├── tailwind.config.js      # Konfigurasi Tema & Warna Kampus
│   ├── tsconfig.json           # Konfigurasi TypeScript
│   └── package.json            # Dependensi khusus Frontend
│
├── 📂 backend/                  # Server Backend (Node.js Express + MySQL)
│   ├── config/                 # Koneksi MySQL Pool (db.js)
│   ├── controllers/            # Controller Auth, Ruangan, Booking, CS
│   ├── data/                   # Initial data & backup SQL
│   ├── routes/                 # Endpoint REST API & SSE
│   ├── index.js                # Server Entrypoint (Port 5000)
│   ├── sse.js                  # Server-Sent Events Real-time
│   ├── store.js                # In-memory Store Fallback
│   ├── .env                    # Variabel Lingkungan DB XAMPP
│   └── package.json            # Dependensi khusus Backend
│
├── 📂 database/                 # Script SQL phpMyAdmin (smartspace_db.sql)
├── 📂 docs/                     # Diagram Use Case (Draw.io & XML)
└── package.json                # Root Runner & Monorepo Workspaces
```

---

## 🚀 Panduan Menjalankan Proyek

### 1. Cara Cepat (Jalankan dari Root Folder)

```bash
# 1. Jalankan Backend Server (Terminal 1)
npm run server

# 2. Jalankan Frontend Web (Terminal 2)
npm run dev
```

### 2. Cara Mandiri (Folder Masing-masing)

#### Menjalankan Backend:
```bash
cd backend
npm install       # (jika baru pertama kali)
npm run dev       # berjalan di http://localhost:5000
```

#### Menjalankan Frontend:
```bash
cd frontend
npm install       # (jika baru pertama kali)
npm run dev       # berjalan di http://localhost:5173
```

---

## 🗄️ Konfigurasi Database (MySQL phpMyAdmin)

1. Nyalakan modul **Apache** dan **MySQL** di **XAMPP Control Panel**.
2. File SQL tersedia di [`database/smartspace_db.sql`](./database/smartspace_db.sql).
3. Buka `http://localhost/phpmyadmin/`, pilih tab **Impor**, lalu pilih file `smartspace_db.sql` dan klik **Kirim**.
4. File `.env` di folder `backend/`:
   ```env
   PORT=5000
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=smartspace_db
   DB_PORT=3306
   ```

---

## 🛠️ Tech Stack

### Frontend:
- **Framework:** React 19 with TypeScript
- **Bundler:** Vite 6
- **Styling:** Tailwind CSS & Lucide Icons
- **State Management:** React Context API (`AuthContext`, `GpsContext`, `ThemeContext`)

### Backend:
- **Runtime:** Node.js (Express.js)
- **Database Driver:** `mysql2/promise` (MariaDB / MySQL XAMPP)
- **Real-Time Communication:** Server-Sent Events (SSE)
- **Fallback:** In-Memory Cache saat database offline
