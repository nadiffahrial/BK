import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  X, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  RefreshCw, 
  Building2,
  ChevronRight,
  ExternalLink,
  Laptop,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { CsTicket } from '../../types';

interface CustomerServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBackendConnected: boolean;
  initialRoomCode?: string;
  onNotificationSent?: (msg: string) => void;
}

export const CustomerServiceModal: React.FC<CustomerServiceModalProps> = ({
  isOpen,
  onClose,
  isBackendConnected,
  initialRoomCode = '',
  onNotificationSent
}) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'contact'>('create');
  const [tickets, setTickets] = useState<CsTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Form states
  const [senderName, setSenderName] = useState<string>('');
  const [senderEmail, setSenderEmail] = useState<string>('');
  const [category, setCategory] = useState<string>('Sarana & Fasilitas');
  const [roomCode, setRoomCode] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Prefill user details if logged in
  useEffect(() => {
    if (user) {
      setSenderName(user.name);
      setSenderEmail(user.email);
    }
  }, [user]);

  // Set initial room code if provided
  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode);
    }
  }, [initialRoomCode]);

  // Load tickets on open or tab change
  const fetchTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const data = await apiService.getCsTickets();
      setTickets(data);
    } catch {
      // ignore
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !message.trim()) {
      alert('Mohon isi nama Anda dan pesan pengaduan.');
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(null);

    try {
      const res = await apiService.createCsTicket({
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim() || (user?.email || 'tamu@unsil.ac.id'),
        senderRole: user?.role || 'student',
        category,
        roomCode: roomCode.trim() || '-',
        subject: subject.trim() || `Pengaduan ${category}`,
        message: message.trim()
      });

      if (res.success) {
        setSubmitSuccess(res.message);
        if (onNotificationSent) {
          onNotificationSent(res.message);
        }
        // Reset form inputs (keep user details)
        setSubject('');
        setMessage('');
        setRoomCode('');
        
        // Refresh ticket list
        await fetchTickets();

        // Switch to history tab after 1.5 seconds
        setTimeout(() => {
          setActiveTab('history');
          setSubmitSuccess(null);
        }, 1800);
      }
    } catch (err: any) {
      alert(`Gagal mengirim pengaduan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'Sarana & Fasilitas', label: '🛠️ Kerusakan Sarpras / Proyektor / AC' },
    { id: 'Kendala Akun & Login', label: '🔑 Kendala Akun & Login SSO' },
    { id: 'Jaringan & Lab Komputer', label: '💻 Lab Komputer & Jaringan Internet' },
    { id: 'Layanan BAAK / Jadwal', label: '📋 Layanan BAAK & Jadwal Ruang Kuliah' },
    { id: 'Lainnya / Umum', label: '💬 Pertanyaan & Informasi Umum' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Selesai Ditangani
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-700 flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-600 animate-spin" /> Sedang Ditangani
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-600" /> Menunggu Tindak Lanjut
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main CS Card Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-200 dark:border-slate-800 overflow-hidden z-10 animate-slide-down flex flex-col max-h-[90vh] text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-emerald-100 dark:border-slate-800 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-sm shadow-xs shrink-0">
                <Headphones className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight">
                    Layanan CS & Pengaduan Kampus
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-800/60 text-emerald-200 border border-emerald-400/40">
                    UNSIL 24/7
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/90 mt-0.5 flex items-center gap-2">
                  <span>Pusat Bantuan Civitas LABTEK 1 & FT.1</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-300 animate-ping' : 'bg-amber-300'}`} />
                    {isBackendConnected ? 'Backend Node.js Terhubung' : 'Mode Offline'}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Tutup Layanan CS"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-white/20 overflow-x-auto scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'create'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kirim Pengaduan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'history'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Riwayat Tiket ({tickets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'contact'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Kontak Langsung</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: FORM PENGADUAN BARU */}
          {activeTab === 'create' && (
            <div>
              {submitSuccess && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-slide-down">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div>{submitSuccess}</div>
                    <div className="text-[10px] font-normal text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Notifikasi pengaduan telah disiarkan ke server. Mengalihkan ke riwayat tiket...
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                
                {/* Row 1: Nama & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nama Pengirim <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Nama lengkap Anda..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Email Kampus / No. WhatsApp
                    </label>
                    <input
                      type="text"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="contoh: dimas@student.ac.id / 0812..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Row 2: Kategori & Kode Ruang */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Kategori Pengaduan
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Kode Ruangan Terkait (Opsional)
                    </label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="misal: A-102, A-201, B-101..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Row 3: Subjek */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subjek / Judul Pengaduan
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="misal: Proyektor kelas tidak menyala, AC bocor, kendala login SSO..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Row 4: Pesan Detail */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Isi Pesan Detail Pengaduan <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Jelaskan kendala, lokasi persis, atau bantuan yang Anda perlukan..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Pesan otomatis dikirim ke Backend API & tim teknisi kampus
                  </span>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Mengirim ke Server...' : 'Kirim ke Layanan CS'}</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 2: RIWAYAT TIKET PENGADUAN */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-600 dark:text-slate-400">
                  Daftar Tiket Layanan CS ({tickets.length})
                </span>
                <button
                  type="button"
                  onClick={fetchTickets}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingTickets ? 'animate-spin' : ''}`} />
                  <span>Segarkan</span>
                </button>
              </div>

              {tickets.length > 0 ? (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                          #{t.id}
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {t.subject}
                        </span>
                      </div>
                      {getStatusBadge(t.status)}
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      "{t.message}"
                    </p>

                    {/* Admin CS Response */}
                    {t.adminResponse && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px]">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                          Tanggapan Petugas CS BAAK & Sarpras:
                        </span>
                        <p className="text-slate-700 dark:text-slate-200">
                          {t.adminResponse}
                        </p>
                      </div>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                      <span>Pengirim: <strong className="text-slate-600 dark:text-slate-300">{t.senderName}</strong> ({t.category})</span>
                      <span>{new Date(t.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  Belum ada tiket pengaduan tersimpan.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KONTAK LANGSUNG */}
          {activeTab === 'contact' && (
            <div className="space-y-3 text-xs">
              
              {/* WhatsApp Call Center */}
              <a
                href="https://wa.me/6281234567890?text=Halo%20Layanan%20Customer%20Service%20SmartCampus3D%20UNSIL"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white">
                      WhatsApp CS Mahasiswa & Dosen (UNSIL)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      +62 812-3456-7890 • Chat Langsung dengan Petugas Helpdesk
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </a>

              {/* Email BAAK & Sarpras */}
              <a
                href="mailto:sarpras@unsil.ac.id?subject=Pengaduan%20Fasilitas%20SmartCampus3D"
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-600 text-white shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white">
                      Email Resmi BAAK & Sarpras IT
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      sarpras@unsil.ac.id • Surat Pengaduan & Layanan Akademik
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </a>

              {/* Lokasi Loket Fisik */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">
                    Loket Layanan Fisik Kampus
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Gedung LABTEK 1 Lantai 1 (Ruang A-106 BAAK) & Gedung FT.1 Lantai 1
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold mt-1">
                    Jam Operasional: Senin - Jumat (08.00 - 16.30 WIB)
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
