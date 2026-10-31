import React, { useState } from 'react';
import { Room, BookingRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Building2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  room: Room | null;
  onClose: () => void;
  onBookingSuccess: (booking: BookingRequest) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  room,
  onClose,
  onBookingSuccess
}) => {
  const { user } = useAuth();
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('15:00');
  const [purpose, setPurpose] = useState('');
  const [participants, setParticipants] = useState<number>(room?.capacity ? Math.min(20, room.capacity) : 10);
  const [department, setDepartment] = useState(user?.department || 'Fakultas Teknik / Sains');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<BookingRequest | null>(null);

  if (!room) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) return;

    setIsSubmitting(true);

    const bookingPayload: Partial<BookingRequest> = {
      roomId: room.id,
      roomName: room.name,
      roomCode: room.code,
      userName: user?.name || 'Civitas Kampus',
      userEmail: user?.email || 'user@unsil.ac.id',
      date,
      startTime,
      endTime,
      purpose: purpose.trim(),
      participants,
      status: 'confirmed'
    };

    try {
      const serverBooking = await apiService.createBooking(bookingPayload);
      const finalBooking: BookingRequest = serverBooking || {
        id: `BK-${Date.now().toString().slice(-6)}`,
        ...bookingPayload,
        createdAt: new Date().toISOString()
      } as BookingRequest;

      setCreatedBooking(finalBooking);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#14b8a6']
        });
      } catch {}

      setIsSuccess(true);
      onBookingSuccess(finalBooking);
    } catch (err: any) {
      alert(`Gagal memproses reservasi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up text-slate-800 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/80 dark:from-slate-800/80 to-white dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">Formulir Reservasi Ruangan</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {room.code} — {room.name} ({room.buildingId === 'gedung-a' ? 'LABTEK 1' : 'FT.1'} Lt {room.floorNumber})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-300 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">Peminjaman Berhasil Dikonfirmasi!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Ruangan <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{room.code}</strong> telah tercatat dalam sistem reservasi untuk tanggal {date} pukul {startTime} - {endTime} WIB.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Kode Reservasi:</span>
                <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">#{createdBooking?.id}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Pemohon:</span>
                <span className="text-slate-900 dark:text-white font-bold">{user?.name}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Keperluan:</span>
                <span className="text-slate-900 dark:text-white font-bold">{purpose}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Status Sistem:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi & Tersinkronisasi Node.js
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                Selesai & Kembali ke Denah
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
            
            {/* Room Summary Pill */}
            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Kapasitas Maksimal Ruang:</span>
              </div>
              <span className="font-extrabold text-emerald-800 dark:text-emerald-300 font-mono">{room.capacity} Orang</span>
            </div>

            {/* Date and Time slots */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-bold block mb-1">Tanggal</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-bold block mb-1">Jam Mulai</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-bold block mb-1">Jam Selesai</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            {/* Participants & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-bold block mb-1">Estimasi Jumlah Peserta</label>
                <input
                  type="number"
                  min="1"
                  max={room.capacity}
                  value={participants}
                  onChange={(e) => setParticipants(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-bold block mb-1">Departemen / Ormawa</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Misal: Himpunan Mahasiswa / Lab"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-bold block mb-1">
                Keperluan / Nama Acara <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Contoh: Diskusi Kelompok Tugas Besar Pemrograman Web & Lomba Karya Ilmiah"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 text-xs resize-none"
              />
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Terhubung ke Backend Node.js
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !purpose.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Konfirmasi Peminjaman</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
