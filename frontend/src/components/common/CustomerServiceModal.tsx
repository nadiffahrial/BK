import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  X, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
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
import type { CsContactSettings } from '../../services/api';
import { CsChatMessage, CsTicket } from '../../types';

const DEFAULT_CS_CONTACTS: CsContactSettings = {
  whatsappNumber: '+62 812-3456-7890',
  email: 'sarpras@unsil.ac.id',
  officeLocation: 'Gedung LABKOM 1 Lantai 1 (Ruang A-106 BAAK) & Gedung FT.1 Lantai 1',
  officeHours: 'Senin - Jumat (08.00 - 16.30 WIB)'
};

interface CustomerServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoomCode?: string;
  onNotificationSent?: (msg: string) => void;
}

export const CustomerServiceModal: React.FC<CustomerServiceModalProps> = ({
  isOpen,
  onClose,
  initialRoomCode = '',
  onNotificationSent
}) => {
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'contact' | 'chat'>('create');
  const [tickets, setTickets] = useState<CsTicket[]>([]);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [editedStatus, setEditedStatus] = useState<string>('pending');
  const [editedResponse, setEditedResponse] = useState<string>('');
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState<boolean>(false);
  const [ticketLoadError, setTicketLoadError] = useState<string | null>(null);
  const [ticketUpdateNotice, setTicketUpdateNotice] = useState<string | null>(null);
  const [ticketUpdateError, setTicketUpdateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [chatTicketId, setChatTicketId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<CsChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [contactSettings, setContactSettings] = useState<CsContactSettings>(DEFAULT_CS_CONTACTS);
  const [contactDraft, setContactDraft] = useState<CsContactSettings>(DEFAULT_CS_CONTACTS);
  const [isSavingContacts, setIsSavingContacts] = useState(false);
  const [contactNotice, setContactNotice] = useState<string | null>(null);
  const [visitorConversations, setVisitorConversations] = useState<Array<{ ticketId: string; subject: string; initialMessage?: string; accessToken: string }>>(() => {
    try {
      const saved = localStorage.getItem('smartspace_cs_conversations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const isCsAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const visitorAccessToken = visitorConversations.find(item => item.ticketId === chatTicketId)?.accessToken;

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

  // Load tickets for authenticated administrators
  const fetchTickets = async () => {
    if (
      !token ||
      (user?.role !== 'admin' && user?.role !== 'super_admin')
    ) {
      setTickets([]);
      return;
    }

    setIsLoadingTickets(true);
    setTicketLoadError(null);

    try {
      const data = await apiService.getCsTickets(
        undefined,
        undefined,
        token
      );

      setTickets(data);
    } catch (error) {
      console.error('Gagal mengambil tiket CS:', error);
      setTickets([]);
      setTicketLoadError(error instanceof Error ? error.message : 'Gagal mengambil riwayat tiket.');
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // Simpan perubahan status dan tanggapan tiket CS
  const handleUpdateTicket = async (ticketId: string) => {
    if (!token) {
      setTicketUpdateError('Sesi login tidak ditemukan. Silakan masuk kembali.');
      return;
    }

    setIsUpdatingTicket(true);
    setTicketUpdateError(null);
    setTicketUpdateNotice(null);

    try {
      await apiService.updateCsTicketStatus(
        ticketId,
        editedStatus,
        token,
        editedResponse
      );

      await fetchTickets();

      setEditingTicketId(null);
      setEditedResponse('');
      setTicketUpdateNotice('Perubahan tiket berhasil disimpan.');
      window.setTimeout(() => setTicketUpdateNotice(null), 4000);
    } catch (error) {
      console.error('Gagal memperbarui tiket:', error);
      setTicketUpdateError(error instanceof Error ? error.message : 'Tiket gagal diperbarui. Silakan coba kembali.');
    } finally {
      setIsUpdatingTicket(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(isCsAdmin ? 'history' : visitorConversations.length > 0 ? 'chat' : 'create');
    if (!isCsAdmin) setChatTicketId(current => current || visitorConversations[0]?.ticketId || null);
  }, [isOpen, isCsAdmin, visitorConversations]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    apiService.getCsContactSettings().then(settings => {
      if (!active || !settings) return;
      const merged = { ...DEFAULT_CS_CONTACTS, ...settings };
      setContactSettings(merged);
      setContactDraft(merged);
    });
    return () => { active = false; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    return apiService.subscribeToEvents(event => {
      const settings = event.type === 'CS_CONTACTS_UPDATED' ? event.data?.settings as CsContactSettings | undefined : undefined;
      if (!settings) return;
      const merged = { ...DEFAULT_CS_CONTACTS, ...settings };
      setContactSettings(merged);
      setContactDraft(merged);
    });
  }, [isOpen]);

  const handleSaveContactSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !isCsAdmin) return;
    setIsSavingContacts(true);
    setContactNotice(null);
    try {
      const saved = await apiService.saveCsContactSettings(contactDraft, token);
      setContactSettings(saved);
      setContactDraft(saved);
      setContactNotice('Kontak CS berhasil disimpan.');
    } catch (error) {
      setContactNotice(error instanceof Error ? error.message : 'Kontak CS gagal disimpan.');
    } finally {
      setIsSavingContacts(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !chatTicketId || (isCsAdmin ? !token : !visitorAccessToken)) return;
    let active = true;
    const loadMessages = async () => {
      try {
        const messages = isCsAdmin
          ? await apiService.getCsTicketMessages(chatTicketId, token!)
          : await apiService.getVisitorCsTicketMessages(chatTicketId, visitorAccessToken!);
        if (active) {
          setChatMessages(current => {
            const byId = new Map(current.map(item => [item.id, item]));
            messages.forEach(item => byId.set(item.id, item));
            return [...byId.values()].sort((a, b) => a.id - b.id);
          });
          setChatError(null);
        }
      } catch (error: any) {
        if (active) setChatError(error.message || 'Percakapan gagal dimuat.');
      }
    };
    setChatMessages([]);
    loadMessages();
    const poll = window.setInterval(loadMessages, 3000);
    return () => { active = false; window.clearInterval(poll); };
  }, [isOpen, chatTicketId, token, isCsAdmin, visitorAccessToken]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!isCsAdmin && !visitorAccessToken) || (isCsAdmin && !token) || !chatTicketId || !chatDraft.trim() || isSendingChat) return;
    setIsSendingChat(true);
    setChatError(null);
    try {
      const sent = isCsAdmin
        ? await apiService.sendCsTicketMessage(chatTicketId, chatDraft.trim(), token!)
        : await apiService.sendVisitorCsTicketMessage(chatTicketId, chatDraft.trim(), visitorAccessToken!);
      setChatMessages(current => current.some(item => item.id === sent.id) ? current : [...current, sent]);
      setChatDraft('');
    } catch (error: any) {
      setChatError(error.message || 'Pesan gagal dikirim.');
    } finally {
      setIsSendingChat(false);
    }
  };

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
        if (res.data?.id && res.chatAccessToken) {
          const conversation = { ticketId: res.data.id, subject: res.data.subject, initialMessage: res.data.message, accessToken: res.chatAccessToken };
          const updatedConversations = [conversation, ...visitorConversations.filter(item => item.ticketId !== conversation.ticketId)].slice(0, 10);
          setVisitorConversations(updatedConversations);
          localStorage.setItem('smartspace_cs_conversations', JSON.stringify(updatedConversations));
          setChatTicketId(conversation.ticketId);
        }
        if (onNotificationSent) {
          onNotificationSent(res.message);
        }
        // Reset form inputs (keep user details)
        setSubject('');
        setMessage('');
        setRoomCode('');
        
        // Refresh ticket list
        await fetchTickets();

        // Arahkan ke riwayat hanya untuk administrator
        setTimeout(() => {
          setActiveTab(isCsAdmin ? 'history' : 'chat');

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
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-10 animate-modal-spring flex flex-col max-h-[90vh] text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 shrink-0">
                <Headphones className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
              </div>
              <div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                    {isCsAdmin ? 'Antrean Layanan CS' : 'Layanan CS Kampus'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isCsAdmin ? 'Tinjau tiket dan balas percakapan pengguna.' : 'Pusat bantuan civitas akademika.'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              title="Tutup Layanan CS"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none text-xs">
            {!isCsAdmin && <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'create'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kirim Pengaduan</span>
            </button>}

            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'history'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isCsAdmin ? `Antrean Tiket (${tickets.length})` : `Riwayat Tiket (${tickets.length})`}</span>
              </button>
            )}

            {!isCsAdmin && visitorConversations.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setChatTicketId(current => current || visitorConversations[0].ticketId);
                  setActiveTab('chat');
                }}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'chat' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat Saya ({visitorConversations.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'contact'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{isCsAdmin ? 'Pengaturan Kontak' : 'Kontak Langsung'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: FORM PENGADUAN BARU */}
          {activeTab === 'create' && !isCsAdmin && (
            <div>
              {submitSuccess && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-slide-down">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div>{submitSuccess}</div>
                    <div className="text-[10px] font-normal text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {isCsAdmin ? 'Mengalihkan ke riwayat tiket...' : 'Membuka ruang chat tiket Anda...'}
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

              {ticketLoadError && (
                <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                  Riwayat tiket tidak dapat dimuat: {ticketLoadError} Pastikan backend dan MySQL aktif, lalu segarkan.
                </div>
              )}

              {ticketUpdateNotice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{ticketUpdateNotice}</div>}
              {ticketUpdateError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{ticketUpdateError}</div>}

              {tickets.length > 0 ? (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 text-xs"
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

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg">
                      "{t.message}"
                    </p>

                    {/* Admin CS Response */}
                    {t.adminResponse && (
                      <div className="p-3 rounded-lg border-l-2 border-emerald-600 bg-slate-50 dark:bg-slate-900/60 text-[11px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 block mb-0.5">
                          Tanggapan petugas:
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
                    {/* Tombol Kelola Tiket - Admin */}
                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTicketId(t.id);
                            setEditedStatus(t.status);
                            setEditedResponse(t.adminResponse || '');
                          }}
                          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                          Kelola Tiket
                        </button>
                        <button
                          type="button"
                          onClick={() => setChatTicketId(current => current === t.id ? null : t.id)}
                          className="ml-2 px-4 py-2 text-xs font-semibold rounded-lg border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          aria-expanded={chatTicketId === t.id}
                        >
                          {chatTicketId === t.id ? 'Tutup Chat' : 'Buka Live Chat'}
                        </button>
                      </div>
                    )}
                    {chatTicketId === t.id && (
                      <section className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden" aria-label={`Percakapan tiket ${t.id}`}>
                        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-100">Percakapan #{t.id}</span>
                        </div>
                        <div className="max-h-56 overflow-y-auto p-3 space-y-2">
                          <div className="max-w-[90%] rounded-xl rounded-tl-sm bg-slate-100 dark:bg-slate-800 p-2.5">
                            <div className="text-[10px] font-bold text-slate-500">{t.senderName} · Pengaduan</div>
                            <p className="whitespace-pre-wrap break-words text-[11px] text-slate-800 dark:text-slate-100">{t.message}</p>
                          </div>
                          {chatMessages.map(item => (
                            <div key={item.id} className={`max-w-[90%] rounded-xl p-2.5 ${item.senderRole === 'admin' || item.senderRole === 'super_admin' ? 'ml-auto rounded-tr-sm bg-emerald-100 dark:bg-emerald-950/70' : 'rounded-tl-sm bg-slate-100 dark:bg-slate-800'}`}>
                              <div className="text-[10px] font-bold text-slate-500">{item.senderName} · {new Date(item.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</div>
                              <p className="whitespace-pre-wrap break-words text-[11px] text-slate-800 dark:text-slate-100">{item.message}</p>
                            </div>
                          ))}
                          {chatMessages.length === 0 && !chatError && <p className="text-center text-[10px] text-slate-400">Belum ada balasan. Kirim pesan untuk memulai percakapan.</p>}
                        </div>
                        {chatError && <p role="alert" className="px-3 pb-2 text-[11px] text-rose-600">{chatError}</p>}
                        <form onSubmit={handleSendChat} className="flex gap-2 p-2 border-t border-slate-200 dark:border-slate-700">
                          <textarea value={chatDraft} onChange={e => setChatDraft(e.target.value)} maxLength={5000} rows={2} placeholder="Tulis balasan untuk pengirim tiket..." className="flex-1 resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                          <button type="submit" disabled={isSendingChat || !chatDraft.trim()} className="self-end rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{isSendingChat ? 'Mengirim...' : 'Kirim'}</button>
                        </form>
                      </section>
                    )}
                    {/* Form Pengelolaan Tiket */}
                    {editingTicketId === t.id && (
                      <div className="mt-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20 space-y-3">

                        <div>
                          <label className="block text-xs font-semibold mb-2">
                            Status Tiket
                          </label>

                          <select
                            value={editedStatus}
                            onChange={(e) => setEditedStatus(e.target.value)}
                            className="w-full p-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                          >
                            <option value="pending">Menunggu Tindak Lanjut</option>
                            <option value="in_progress">Sedang Ditangani</option>
                            <option value="resolved">Selesai Ditangani</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-2">
                            Tanggapan Petugas
                          </label>

                          <textarea
                            value={editedResponse}
                            onChange={(e) => setEditedResponse(e.target.value)}
                            rows={3}
                            placeholder="Tuliskan tanggapan untuk pengirim tiket..."
                            className="w-full p-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingTicketId(null)}
                            disabled={isUpdatingTicket}
                            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700"
                          >
                            Batal
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateTicket(t.id)}
                            disabled={isUpdatingTicket}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {isUpdatingTicket ? 'Menyimpan...' : 'Simpan Perubahan'}
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  {isLoadingTickets ? 'Memuat tiket...' : ticketLoadError ? 'Tiket tidak dapat dimuat. Periksa koneksi atau sesi admin.' : 'Belum ada tiket dari pengguna.'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && !isCsAdmin && (
            <div className="space-y-3">
              <div>
                <label htmlFor="visitor-chat-ticket" className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">Pilih tiket</label>
                <select
                  id="visitor-chat-ticket"
                  value={chatTicketId || ''}
                  onChange={e => setChatTicketId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  {visitorConversations.map(item => <option key={item.ticketId} value={item.ticketId}>#{item.ticketId} · {item.subject}</option>)}
                </select>
              </div>
              {chatTicketId && (
                <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" aria-label="Live chat dengan petugas CS">
                  <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Percakapan #{chatTicketId}</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300">Petugas CS</span>
                  </div>
                  <div className="max-h-80 min-h-32 space-y-2 overflow-y-auto p-3">
                    {visitorConversations.find(item => item.ticketId === chatTicketId)?.initialMessage && (
                      <div className="max-w-[90%] rounded-xl rounded-tl-sm bg-slate-100 p-2.5 dark:bg-slate-800">
                        <div className="text-[10px] font-bold text-slate-500">Pengaduan awal</div>
                        <p className="whitespace-pre-wrap break-words text-xs text-slate-800 dark:text-slate-100">{visitorConversations.find(item => item.ticketId === chatTicketId)?.initialMessage}</p>
                      </div>
                    )}
                    {chatMessages.map(item => (
                      <div key={item.id} className={`max-w-[90%] rounded-xl p-2.5 ${item.senderRole === 'visitor' ? 'ml-auto rounded-tr-sm bg-emerald-100 dark:bg-emerald-950/70' : 'rounded-tl-sm bg-slate-100 dark:bg-slate-800'}`}>
                        <div className="text-[10px] font-bold text-slate-500">{item.senderRole === 'visitor' ? 'Anda' : item.senderName} · {new Date(item.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</div>
                        <p className="whitespace-pre-wrap break-words text-xs text-slate-800 dark:text-slate-100">{item.message}</p>
                      </div>
                    ))}
                    {chatMessages.length === 0 && !chatError && <p className="py-6 text-center text-xs text-slate-400">Belum ada balasan. Petugas akan membalas di percakapan ini.</p>}
                  </div>
                  {chatError && <p role="alert" className="px-3 pb-2 text-xs text-rose-600">{chatError}</p>}
                  <form onSubmit={handleSendChat} className="flex gap-2 border-t border-slate-200 p-2 dark:border-slate-700">
                    <textarea value={chatDraft} onChange={e => setChatDraft(e.target.value)} maxLength={5000} rows={2} placeholder="Tulis pesan untuk petugas CS..." className="flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800" />
                    <button type="submit" disabled={isSendingChat || !chatDraft.trim()} className="self-end rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{isSendingChat ? 'Mengirim...' : 'Kirim'}</button>
                  </form>
                  <p className="px-3 pb-2 text-[10px] text-slate-400">Akses chat tersimpan pada browser ini. Gunakan perangkat/browser yang sama untuk melanjutkan.</p>
                </section>
              )}
            </div>
          )}

          {/* TAB 3: KONTAK LANGSUNG */}
          {activeTab === 'contact' && (isCsAdmin ? (
            <form onSubmit={handleSaveContactSettings} className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Pengaturan kontak yang dilihat pengguna</h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Perubahan disimpan bersama dan langsung digunakan pada tab Kontak Langsung.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Nomor WhatsApp
                  <input type="tel" required maxLength={32} value={contactDraft.whatsappNumber} onChange={event => setContactDraft({ ...contactDraft, whatsappNumber: event.target.value })} placeholder="+62 812-3456-7890" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </label>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Email layanan
                  <input type="email" required maxLength={180} value={contactDraft.email} onChange={event => setContactDraft({ ...contactDraft, email: event.target.value })} placeholder="layanan@kampus.ac.id" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </label>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">Lokasi loket
                  <input type="text" required maxLength={180} value={contactDraft.officeLocation} onChange={event => setContactDraft({ ...contactDraft, officeLocation: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </label>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">Jam layanan
                  <input type="text" required maxLength={180} value={contactDraft.officeHours} onChange={event => setContactDraft({ ...contactDraft, officeHours: event.target.value })} placeholder="Senin - Jumat (08.00 - 16.30 WIB)" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </label>
              </div>
              {contactNotice && <p role="status" className={`text-xs ${contactNotice.includes('berhasil') ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>{contactNotice}</p>}
              <div className="flex justify-end">
                <button type="submit" disabled={isSavingContacts} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">{isSavingContacts ? 'Menyimpan…' : 'Simpan Kontak'}</button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <a href={`https://wa.me/${contactSettings.whatsappNumber.replace(/\D/g, '')}?text=Halo%20Layanan%20Customer%20Service%20SILOKA%20UNSIL`} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800">
                <div className="flex items-center gap-3"><div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"><Phone className="h-4 w-4" /></div><div><h4 className="font-semibold text-slate-900 dark:text-white">WhatsApp Layanan CS</h4><p className="mt-0.5 text-slate-500 dark:text-slate-400">{contactSettings.whatsappNumber}</p></div></div><ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
              </a>
              <a href={`mailto:${contactSettings.email}?subject=Pengaduan%20Fasilitas%20SILOKA`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800">
                <div className="flex items-center gap-3"><div className="rounded-lg bg-slate-100 p-2.5 text-slate-700 dark:bg-slate-700 dark:text-slate-200"><Mail className="h-4 w-4" /></div><div><h4 className="font-semibold text-slate-900 dark:text-white">Email Layanan CS</h4><p className="mt-0.5 text-slate-500 dark:text-slate-400">{contactSettings.email}</p></div></div><ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
              </a>
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50"><div className="rounded-lg bg-slate-100 p-2.5 text-slate-700 dark:bg-slate-700 dark:text-slate-200"><MapPin className="h-4 w-4" /></div><div><h4 className="font-semibold text-slate-900 dark:text-white">Loket layanan</h4><p className="mt-0.5 text-slate-500 dark:text-slate-400">{contactSettings.officeLocation}</p><p className="mt-2 text-slate-500 dark:text-slate-400">Jam layanan: {contactSettings.officeHours}</p></div></div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
};

