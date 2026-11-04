import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  Printer,
  Download,
  Copy,
  Check,
  QrCode,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  room: Room | null;
  initialTime?: { startTime: string; endTime: string };
  onClose: () => void;
  onBookingSuccess: (booking: BookingRequest) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  room,
  initialTime,
  onClose,
  onBookingSuccess
}) => {
  const { user } = useAuth();
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(initialTime?.startTime || '13:00');
  const [endTime, setEndTime] = useState(initialTime?.endTime || '15:00');
  const [purpose, setPurpose] = useState('');
  const [participants, setParticipants] = useState<number>(room?.capacity ? Math.min(20, room.capacity) : 10);
  const [department, setDepartment] = useState(user?.department || 'Fakultas Teknik / Sains');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<BookingRequest | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (initialTime) {
      setStartTime(initialTime.startTime);
      setEndTime(initialTime.endTime);
    }
  }, [initialTime]);

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

  const handleCopyBookingId = () => {
    if (!createdBooking?.id) return;
    navigator.clipboard.writeText(createdBooking.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadIcs = () => {
    if (!createdBooking) return;
    const dateFormatted = date.replace(/-/g, '');
    const startFormatted = startTime.replace(':', '') + '00';
    const endFormatted = endTime.replace(':', '') + '00';
    const bldgName = room.buildingId === 'gedung-a' ? 'Gedung LABTEK 1' : 'Gedung FT.1';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Universitas Siliwangi//SmartCampus3D//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:smartcampus-${createdBooking.id}@unsil.ac.id`,
      `DTSTAMP:${dateFormatted}T000000Z`,
      `DTSTART:${dateFormatted}T${startFormatted}`,
      `DTEND:${dateFormatted}T${endFormatted}`,
      `SUMMARY:Izin Ruang: ${room.code} - ${room.name}`,
      `DESCRIPTION:Reservasi ruang kampus oleh ${user?.name || 'Civitas'}.\\nKeperluan: ${purpose}\\nKode Tiket: #${createdBooking.id}\\nStatus: Dikonfirmasi Resmi.`,
      `LOCATION:${room.code} - ${room.name}, ${bldgName} Lantai ${room.floorNumber}, Universitas Siliwangi`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Tiket-Ruang-${room.code}-${date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-modal-spring text-slate-800 dark:text-slate-100 transition-colors my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/80 dark:from-slate-800/80 to-white dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {isSuccess ? 'Digital Room Pass (E-Tiket Kampus)' : 'Formulir Reservasi Ruangan'}
              </h3>
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
          <div className="p-5 sm:p-7 space-y-5">
            {/* Success Heading */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Peminjaman Dikonfirmasi Resmi</span>
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                Surat Izin Digital Siap Digunakan
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Tunjukkan E-Pass ini kepada petugas keamanan atau laboran saat memasuki gedung.
              </p>
            </div>

            {/* Boarding Pass Card */}
            <div 
              id="printable-boarding-pass"
              className="relative p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900 border-2 border-dashed border-emerald-300 dark:border-emerald-700 shadow-sm overflow-hidden"
            >
              {/* Top Banner inside Ticket */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200/70 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    US
                  </div>
                  <div>
                    <div className="text-[10px] font-black tracking-widest text-emerald-800 dark:text-emerald-300 uppercase">
                      Universitas Siliwangi
                    </div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">
                      SmartCampus3D • Official Digital Pass
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                    STATUS: AKTIF
                  </span>
                </div>
              </div>

              {/* Main Ticket Information */}
              <div className="py-3.5 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ruangan</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                    {room.code}
                  </span>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate font-medium">
                    {room.name}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Lokasi Gedung</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    {room.buildingId === 'gedung-a' ? 'LABTEK 1' : 'FT.1'} (Lt {room.floorNumber})
                  </span>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    Kapasitas: {room.capacity} org
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Jadwal Tanggal</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {date}
                  </span>
                  <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    {startTime} - {endTime} WIB
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Pemohon / Unit</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate block">
                    {user?.name || 'Civitas Kampus'}
                  </span>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {department}
                  </div>
                </div>
              </div>

              {/* Purpose row */}
              <div className="pb-3 border-b border-emerald-200/70 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Keperluan Kegiatan</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold italic">
                  "{purpose}"
                </p>
              </div>

              {/* QR Code & Code Barcode Footer */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Kode Reservasi</div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-slate-700 shadow-2xs">
                      #{createdBooking?.id}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyBookingId}
                      className="p-1.5 rounded-lg bg-emerald-100 dark:bg-slate-700 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 transition-colors"
                      title="Salin Kode Reservasi"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Styled SVG QR Code Simulation */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-emerald-200 dark:border-slate-700 shadow-2xs">
                  <svg className="w-10 h-10 text-emerald-900 dark:text-emerald-300" viewBox="0 0 33 33" fill="currentColor">
                    <path d="M0 0h9v9H0zm2 2v5h5V2zm1 1h3v3H3zm8-3h2v4h-2zm4 0h9v9h-9zm2 2v5h5V2zm1 1h3v3h-3zm-7 3h3v2h-3zm-6 5h2v2H2zm4 0h3v2H6zm6 0h2v4h-2zm4 0h2v2h-2zm4 0h3v2h-3zm-14 3h2v2H6zm8 0h3v2h-3zm6 0h3v2h-3zm-20 3h9v9H0zm2 2v5h5v-5zm1 1h3v3H3zm8 0h2v2h-2zm4 0h2v4h-2zm3 0h3v2h-3zm-7 3h3v2h-3zm8 0h4v2h-4zm-8 3h2v2h-2zm4 0h2v2h-2zm3 0h3v2h-3z" />
                  </svg>
                  <div className="text-[9px] text-slate-400 font-mono leading-tight">
                    <div>SCAN ME</div>
                    <div className="text-emerald-600 font-bold">VERIFIED</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span>Cetak E-Tiket (Print)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadIcs}
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-emerald-300 dark:border-emerald-700 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Simpan Kalender (.ics)</span>
              </button>
            </div>

            {/* Finish Button */}
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
            >
              Selesai & Kembali ke Denah
            </button>
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
