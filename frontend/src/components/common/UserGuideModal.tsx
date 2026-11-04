import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Compass, 
  Search, 
  Calendar, 
  Headphones, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Layers, 
  Box, 
  Navigation, 
  Sparkles, 
  Laptop, 
  AlertCircle,
  HelpCircle,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
  onOpenCs?: () => void;
}

type GuideTab = 'overview' | 'student' | 'lecturer' | 'admin' | 'guest' | 'features';

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
  onOpenCs
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-fade-in transition-all duration-300">
      {/* Background click dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog with Spring Scale-in */}
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-100/90 dark:border-slate-800 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 animate-modal-spring z-10 transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal with Gradient & Glow */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shrink-0 shadow-md relative overflow-hidden">
          {/* Subtle Background Glow Accent */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group transition-transform duration-300 hover:scale-105 hover:rotate-3">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="guide-modal-title" className="text-base sm:text-lg font-black tracking-tight leading-tight">
                  Buku Panduan Pengguna
                </h2>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/20 shadow-xs">
                  SmartCampus3D
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                Petunjuk Lengkap Berdasarkan Kebutuhan & Peran Civitas Kampus
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/25 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer text-white relative z-10 hover:rotate-90"
            title="Tutup Panduan (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigasi Peran & Fitur with Modern Smooth Pills */}
        <div className="px-6 pt-3 pb-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Tujuan & Gambaran', icon: Sparkles },
            { id: 'student', label: '🎓 Mahasiswa', icon: GraduationCap },
            { id: 'lecturer', label: '👨‍🏫 Dosen & Staff', icon: Briefcase },
            { id: 'admin', label: '🛡️ Administrator Sarpras', icon: ShieldCheck },
            { id: 'guest', label: '👤 Tamu / Publik', icon: Users },
            { id: 'features', label: '⚡ Fitur & Shortcut', icon: Laptop },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as GuideTab)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-250 cursor-pointer whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/20 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body Modal with Smooth Tab-Slide Transition */}
        <div 
          key={activeTab} 
          className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed animate-tab-slide"
        >
          {/* TAB 1: OVERVIEW & PURPOSE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="p-4.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 modern-card-hover group">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      Tujuan Utama Website SmartCampus3D
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                      Aplikasi ini dirancang khusus untuk mempermudah seluruh civitas akademika Universitas Siliwangi dalam menemukan lokasi ruangan, melihat fasilitas gedung secara interaktif 3D & 2D, mengajukan reservasi ruang kuliah/sidang, hingga melaporkan gangguan fasilitas secara cepat dan terintegrasi.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Pilar Manfaat with Modern Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col modern-card-hover group hover:border-blue-300 dark:hover:border-blue-600/50">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-xs">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                    1. Navigasi & Denah Akurat
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Denah Gedung LABTEK 1 dan FT.1 (Lantai 1-2) dengan petunjuk arah rute belokan langkah demi langkah menuju pintu ruangan target.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col modern-card-hover group hover:border-amber-300 dark:hover:border-amber-600/50">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                    2. Status & Reservasi Ruangan
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Cek status real-time (Tersedia, Terisi, Terjadwal) dan ajukan peminjaman ruangan tanpa bentrok jadwal kuliah.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col modern-card-hover group hover:border-teal-300 dark:hover:border-teal-600/50">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-xs">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                    3. Layanan Pengaduan CS Terpadu
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Lapor fasilitas rusak (AC mati, proyektor error, WiFi lambat) yang langsung diterima oleh admin sarana prasarana.
                  </p>
                </div>
              </div>

              {/* Status Warna Ruangan */}
              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Arti Warna Status Ruangan pada Denah:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 modern-card-hover">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Tersedia (Kosong)</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 modern-card-hover">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-300">Terisi (Kuliah/Rapat)</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 modern-card-hover">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Direservasi</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 modern-card-hover">
                    <span className="w-3 h-3 rounded-full bg-slate-500 shadow-sm" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Perbaikan / Servis</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PANDUAN MAHASISWA */}
          {activeTab === 'student' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Panduan Lengkap untuk Mahasiswa
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Solusi cepat mencari ruang kelas kuliah, lab praktikum, dan layanan BAAK
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 modern-card-hover group hover:border-emerald-300 dark:hover:border-emerald-500/40">
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2.5 text-sm mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-xs">1</span>
                    Mencari Ruang Kelas Kuliah Cepat (Ctrl + K)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8.5">
                    Tekan tombol <strong>Ctrl + K</strong> pada keyboard atau klik tombol <strong>Cari</strong> di navigasi atas. Ketik kode ruangan (misal: <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">A-101</code>) atau nama mata kuliah (misal: <em>Algoritma</em>). Klik hasil pencarian untuk langsung diarahkan ke ruangan tersebut.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 modern-card-hover group hover:border-emerald-300 dark:hover:border-emerald-500/40">
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2.5 text-sm mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-xs">2</span>
                    Melihat Denah 3D & Menghidupkan Petunjuk Arah
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8.5">
                    Klik salah satu ruangan pada denah untuk membuka jendela info. Klik tombol hijau <strong>"Tampilkan Rute Jalan"</strong>. Garis rute dari lobby/tangga menuju pintu ruangan target akan otomatis muncul lengkap dengan estimasi jarak dan waktu tempuh.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 modern-card-hover group hover:border-emerald-300 dark:hover:border-emerald-500/40">
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2.5 text-sm mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-xs">3</span>
                    Mengajukan Peminjaman Ruang untuk Kegiatan Himpunan / Belajar
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8.5">
                    Pilih ruangan yang berstatus <strong>Tersedia (Hijau)</strong>, lalu klik tombol <strong>"Ajukan Peminjaman"</strong>. Isi nama peminjam, keperluan kegiatan, dan jam penggunaan. Permohonan Anda akan langsung tercatat di jadwal sistem.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 modern-card-hover group hover:border-emerald-300 dark:hover:border-emerald-500/40">
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2.5 text-sm mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-xs">4</span>
                    Melaporkan Fasilitas Kelas Rusak (Layanan CS)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8.5">
                    Jika AC kelas tidak dingin, proyektor bermasalah, atau spidol habis, klik tombol melayang <strong>"Layanan CS"</strong> di pojok kanan bawah. Kirimkan laporan agar petugas sarpras segera datang memperbaiki.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PANDUAN DOSEN & STAFF */}
          {activeTab === 'lecturer' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-xs">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Panduan untuk Dosen & Staff Akademik
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kelola jadwal mengajar, bimbingan mahasiswa, dan reservasi ruang sidang
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 modern-card-hover group hover:border-blue-300 dark:hover:border-blue-500/40">
                  <h4 className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2.5 text-sm mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-xs">1</span>
                    Cek Ketersediaan Ruangan untuk Kuliah Pengganti / Ujian
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8.5">
                    Gunakan filter status di menu utama untuk menampilkan hanya ruangan yang <strong>Tersedia</strong>. Anda dapat melihat kapasitas kursi, unit AC, proyektor laser, dan suhu telemetri IoT ruangan secara akurat sebelum memilih ruang perkuliahan.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 modern-card-hover group hover:border-blue-300 dark:hover:border-blue-500/40">
                  <h4 className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2.5 text-sm mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-xs">2</span>
                    Memesan Ruang Sidang Skripsi & Rapat Senat
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8.5">
                    Buka <strong>Gedung LABTEK 1 Lantai 2</strong> (Ruang A-203 Ruang Sidang Skripsi) atau <strong>Gedung FT.1 Lantai 2</strong> (Ruang B-201 Ruang Sidang Senat). Klik tombol reservasi untuk mendaftarkan jadwal sidang agar mahasiswa dan penguji dapat melihatnya di sistem.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 modern-card-hover group hover:border-blue-300 dark:hover:border-blue-500/40">
                  <h4 className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2.5 text-sm mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-xs">3</span>
                    Memperbarui Status Ruang (Tersedia / Selesai Kelas)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8.5">
                    Saat jam perkuliahan selesai, buka detail ruangan dan ubah status kembali menjadi <strong>Tersedia</strong> agar dapat dimanfaatkan oleh dosen lain.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PANDUAN ADMINISTRATOR */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Panduan untuk Administrator Sarpras & IT
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manajemen data ruangan, approval reservasi, tindak lanjut tiket pengaduan, dan database
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 modern-card-hover group hover:border-rose-300 dark:hover:border-rose-500/40">
                  <h4 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2.5 text-sm mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-xs">1</span>
                    Kontrol Master Status Ruangan
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8.5">
                    Administrator dapat mengubah status ruangan mana pun menjadi <em>Tersedia</em>, <em>Terisi</em>, <em>Reservasi</em>, atau <em>Pemeliharaan (Maintenance)</em>. Perubahan status akan langsung tersiar secara real-time melalui Server-Sent Events (SSE).
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 modern-card-hover group hover:border-rose-300 dark:hover:border-rose-500/40">
                  <h4 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2.5 text-sm mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-xs">2</span>
                    Merespon & Menutup Tiket Pengaduan CS
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8.5">
                    Buka modal Layanan CS untuk melihat daftar tiket laporan fasilitas yang masuk dari mahasiswa/dosen. Petugas dapat menugaskan teknisi, mengubah status menjadi <em>Dalam Proses</em> atau <em>Selesai</em>.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 modern-card-hover group hover:border-rose-300 dark:hover:border-rose-500/40">
                  <h4 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2.5 text-sm mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-xs">3</span>
                    Sinkronisasi & Backup Database phpMyAdmin
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8.5">
                    Seluruh perubahan tersimpan di database MySQL <code>smartspace_db</code>. Backup terbaru tersedia di folder <code>database/smartspace_db.sql</code> yang dapat diexport ulang sewaktu-waktu.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PANDUAN TAMU / PUBLIK */}
          {activeTab === 'guest' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Panduan untuk Tamu, Orang Tua & Pengunjung Kampus
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Menemukan lokasi layanan administrasi, kantor pimpinan, dan poliklinik
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 modern-card-hover group hover:border-amber-300 dark:hover:border-amber-500/40">
                  <h4 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2.5 text-sm mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-xs">1</span>
                    Menuju Kantor Dekanat & Pimpinan Fakultas
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8.5">
                    Pilih tombol <strong>Gedung FT.1</strong> pada pemilih gedung atas. Masuk ke <strong>Lantai 1</strong>. Ruang B-101 adalah Grand Lobby Resepsionis, dan Ruang B-102 adalah Kantor Dekan & Wakil Dekan.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 modern-card-hover group hover:border-amber-300 dark:hover:border-amber-500/40">
                  <h4 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2.5 text-sm mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-xs">2</span>
                    Menemukan Loket BAAK (Administrasi & Legalisir Ijazah)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8.5">
                    Pilih <strong>Gedung LABTEK 1 Lantai 1</strong>, Ruang <strong>A-104</strong> adalah Pusat Layanan BAAK untuk pengurusan dokumen akademik dan wisuda.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 modern-card-hover group hover:border-amber-300 dark:hover:border-amber-500/40">
                  <h4 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2.5 text-sm mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-xs">3</span>
                    Pertolongan Medis Pertama (Poliklinik Mini P3K)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8.5">
                    Poliklinik kesehatan darurat terletak di <strong>Gedung FT.1 Lantai 1, Ruang B-106</strong> dengan perlengkapan P3K dan tempat istirahat penanganan awal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FITUR UTAMA & SHORTCUT */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 shadow-xs">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Shortcut Keyboard & Tips Canggih
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Gunakan shortcut untuk navigasi yang jauh lebih cepat
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between modern-card-hover group">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">Buka Search Engine Spotlight</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Cari ruangan & mata kuliah instan</div>
                  </div>
                  <kbd className="px-2.5 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs transition-transform duration-200 group-hover:scale-105">
                    Ctrl + K
                  </kbd>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between modern-card-hover group">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">Tutup Jendela Dialog / Modal</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Kembali ke denah utama</div>
                  </div>
                  <kbd className="px-2.5 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs transition-transform duration-200 group-hover:scale-105">
                    Esc
                  </kbd>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between modern-card-hover group">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">Ganti Mode Denah 3D / 2D / Daftar</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Pilih perspektif denah terbaik</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                    Header Navbar
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between modern-card-hover group">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">Mode Gelap / Terang (Dark Mode)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Kenyamanan mata saat malam hari</div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                    Tombol Bulan/Matahari
                  </span>
                </div>
              </div>

              {/* Action Buttons with Smooth Hover Lift */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 modern-card-hover">
                <div className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                  Ingin langsung mencoba fitur pencarian ruangan atau layanan CS?
                </div>
                <div className="flex items-center gap-2">
                  {onOpenSearch && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenSearch();
                      }}
                      className="smooth-btn px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Search className="w-3.5 h-3.5" />
                      Cari Ruang Sekarang
                    </button>
                  )}
                  {onOpenCs && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCs();
                      }}
                      className="smooth-btn px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      Layanan CS
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal with Smooth Button */}
        <div className="px-6 py-3.5 bg-slate-100/80 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>Sistem Informasi Tata Ruang Terpadu Universitas Siliwangi</span>
          </div>
          <button
            onClick={onClose}
            className="smooth-btn px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            Mengerti, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};
