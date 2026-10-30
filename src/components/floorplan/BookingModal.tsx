import React, { useState } from 'react';
import { Room, BookingRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Building2,
  Leaf
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
  const [department, setDepartment] = useState(user?.department || 'Fakultas Sains & Teknologi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!room) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newBooking: BookingRequest = {
        id: `BK-${Date.now().toString().slice(-6)}`,
        roomId: room.id,
        roomName: room.name,
        roomCode: room.code,
        userName: user?.name || 'Pengguna Terdaftar',
        userEmail: user?.email || 'user@smartspace.ac.id',
        date,
        startTime,
        endTime,
        purpose,
        participants,
        createdAt: new Date().toISOString(),
        status: 'confirmed'
      };

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#14b8a6']
        });
      } catch (err) {
        // fallback
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      onBookingSuccess(newBooking);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl border border-emerald-100 shadow-2xl overflow-hidden animate-slide-up text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Formulir Peminjaman Ruang</h3>
              <p className="text-xs text-slate-500">
                {room.code} — {room.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-900">Peminjaman Berhasil Dikonfirmasi!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Ruangan <strong className="text-emerald-700">{room.code}</strong> telah tercatat dalam sistem reservasi untuk tanggal {date} pukul {startTime} - {endTime} WIB.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-left text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Pemohon:</span>
                <span className="text-slate-900 font-bold">{user?.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Keperluan:</span>
                <span className="text-slate-900 font-bold">{purpose}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status Jadwal:</span>
                <span className="text-emerald-700 font-bold">Terverifikasi Otomatis</span>
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
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            
            {/* Room Summary Pill */}
            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-700 font-semibold">Kapasitas Maksimal Ruang:</span>
              </div>
              <span className="font-extrabold text-emerald-800">{room.capacity} Orang</span>
            </div>

            {/* Date and Time slots */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 font-bold block mb-1">Tanggal</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-600 font-bold block mb-1">Jam Mulai</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-600 font-bold block mb-1">Jam Selesai</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            {/* Participants & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-bold block mb-1">Jumlah Peserta</label>
                <input
                  type="number"
                  min="1"
                  max={room.capacity}
                  value={participants}
                  onChange={(e) => setParticipants(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-600 font-bold block mb-1">Departemen / Ormawa</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Misal: Himpunan Mahasiswa / Lab"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="text-slate-600 font-bold block mb-1">Keperluan / Nama Acara</label>
              <textarea
                rows={3}
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Contoh: Diskusi Kelompok Tugas Besar Pemrograman Web & Lomba Karya Ilmiah"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 text-xs resize-none"
              />
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 transition-colors font-semibold"
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

          </form>
        )}

      </div>
    </div>
  );
};
