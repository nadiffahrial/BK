import React from 'react';
import { BookOpen, X } from 'lucide-react';
import { User } from '../../types';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
  onOpenCs?: () => void;
  role: User['role'] | null;
}

type GuideTab = 'user' | 'admin' | 'superAdmin';

const GuideStep: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-4 first:pt-0 last:pb-0">
    <span className="pt-0.5 text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">{number}</span>
    <div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{children}</p>
    </div>
  </li>
);

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose, onOpenSearch, onOpenCs, role }) => {
  const activeTab: GuideTab = role === 'super_admin' ? 'superAdmin' : role === 'admin' ? 'admin' : 'user';

  if (!isOpen) return null;

  const tabLabel = activeTab === 'superAdmin' ? 'Super Admin' : activeTab === 'admin' ? 'Admin' : 'Pengguna';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="guide-modal-title" className="text-base font-semibold text-slate-900 dark:text-white sm:text-lg">Panduan SILOKA</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Cara menggunakan peta kampus dan layanan.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup panduan" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <nav aria-label="Bagian panduan" className="shrink-0 border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">
          <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Panduan {tabLabel}</span>
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
          {activeTab === 'user' && (
            <div>
              <div className="mb-5 max-w-2xl">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Mencari ruang dan informasi kampus</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Panduan ini berlaku untuk pengunjung, mahasiswa, dan dosen. Tidak perlu masuk untuk melihat peta dan informasi ruang.</p>
              </div>
              <ol className="divide-y divide-slate-200 dark:divide-slate-800">
                <GuideStep number="01" title="Pilih tampilan dan lokasi">Gunakan pilihan 2D Denah, 3D Model, atau Daftar pada bagian atas. Pada peta, pilih gedung dan lantai yang ingin dilihat.</GuideStep>
                <GuideStep number="02" title="Cari ruangan">Klik tombol Cari atau tekan Ctrl + K, lalu masukkan nama atau kode ruang. Pilih ruang pada hasil untuk melihat informasinya.</GuideStep>
                <GuideStep number="03" title="Periksa detail ruang">Pilih ruang pada denah atau daftar untuk melihat lokasi, kapasitas, fasilitas, dan seluruh jadwalnya. Jadwal yang cocok dengan hari dan waktu WIB akan ditandai sedang berlangsung; di luar jadwal, ruang tersedia kecuali sedang dalam perbaikan atau rusak. Panorama tampil jika ruang memilikinya.</GuideStep>
                <GuideStep number="04" title="Hubungi layanan kampus">Gunakan Layanan CS untuk membuat tiket dan melanjutkan percakapan dengan petugas. Tab Kontak Langsung menyediakan WhatsApp, email, lokasi, dan jam layanan.</GuideStep>
              </ol>
              <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-5 dark:border-slate-800">
                {onOpenSearch && <button type="button" onClick={() => { onClose(); onOpenSearch(); }} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800">Cari ruang</button>}
                {onOpenCs && <button type="button" onClick={() => { onClose(); onOpenCs(); }} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">Buka Layanan CS</button>}
              </div>
            </div>
          )}

          {(activeTab === 'admin' || activeTab === 'superAdmin') && (
            <div>
              <div className="mb-5 max-w-2xl">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Panduan Admin</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Gunakan navigasi di samping untuk berpindah antara Dashboard, ruang, jadwal, dan antrean layanan.</p>
              </div>
              <ol className="divide-y divide-slate-200 dark:divide-slate-800">
                <GuideStep number="01" title="Dashboard">Lihat peta kampus, ringkasan kondisi ruang, dan aktivitas terjadwal. Pilih ruang untuk melihat detail atau memperbarui statusnya.</GuideStep>
                <GuideStep number="02" title="Ruang & fasilitas">Pilih gedung dan lantai melalui filter agar daftar lebih singkat. Gunakan tindakan pada baris ruang untuk mengubah data ruang atau mulai mengatur jadwalnya.</GuideStep>
                <GuideStep number="03" title="Agenda & pengajar">Kelola daftar Mata kuliah / agenda dan Dosen / penanggung jawab di halaman Agenda & pengajar. Data ini menjadi pilihan saat membuat jadwal.</GuideStep>
                <GuideStep number="04" title="Jadwal ruangan">Pilih ruang, agenda, penanggung jawab, kelas, hari, dan jam. Jadwal akan terlihat pada detail ruang pengguna dan statusnya mengikuti waktu WIB.</GuideStep>
                <GuideStep number="05" title="Antrean layanan CS">Buka Antrean layanan untuk meninjau tiket pengguna, mengubah status, menulis tanggapan, dan membuka live chat.</GuideStep>
                <GuideStep number="06" title="Pengaturan Kontak CS">Di modal Layanan CS, buka Pengaturan Kontak untuk memperbarui nomor WhatsApp, email, lokasi loket, dan jam layanan yang dilihat pengguna.</GuideStep>
              </ol>
            </div>
          )}

          {activeTab === 'superAdmin' && (
            <div>
              <div className="mb-5 max-w-2xl">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Panduan Super Admin</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Super Admin memiliki fungsi admin serta akses tambahan untuk mengelola akun administrator.</p>
              </div>
              <ol className="divide-y divide-slate-200 dark:divide-slate-800">
                <GuideStep number="01" title="Kelola Admin">Buka menu Kelola Admin untuk melihat akun admin, menambahkan akun, mengatur ulang kata sandi, atau menghapus akses admin.</GuideStep>
                <GuideStep number="02" title="Pengaturan operasional">Fungsi Dashboard, Ruang & fasilitas, Agenda & pengajar, Jadwal ruangan, dan Antrean layanan tersedia sama seperti pada akun admin.</GuideStep>
                <GuideStep number="03" title="Perubahan kontak layanan">Pengaturan Kontak CS mengubah informasi kontak bersama yang ditampilkan kepada semua pengguna.</GuideStep>
              </ol>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">
          <span className="text-xs text-slate-500 dark:text-slate-400">SILOKA · Universitas Siliwangi</span>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Tutup panduan</button>
        </footer>
      </section>
    </div>
  );
};
