import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { CustomerServiceModal } from '../common/CustomerServiceModal';
import unsilLogo from '../../assets/logo-unsil.png';
import { 
  Building2, 
  KeyRound, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  UserCheck, 
  Layers, 
  MapPin, 
  Clock, 
  Compass, 
  CheckCircle2,
  Lock,
  Leaf,
  Eye,
  EyeOff,
  GraduationCap,
  Laptop,
  Server,
  Zap,
  Radio
} from 'lucide-react';
import { User } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<'quick' | 'form'>('quick');
  const [isCsModalOpen, setIsCsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState('');

  const demoRoles = [
    {
      role: 'student' as const,
      badge: 'Mahasiswa',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
      name: 'Dimas Aditya (21040101)',
      subtext: 'S1 Teknik Informatika • Angkatan 2023',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      icon: GraduationCap,
      description: 'Akses penuh pencarian ruang kuliah, jadwal lab, & navigasi rute ke LABTEK 1 / FT.1'
    },
    {
      role: 'staff' as const,
      badge: 'Dosen / Pengajar',
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300 dark:border-teal-700',
      name: 'Dr. Ir. Budi Santoso, M.Kom',
      subtext: 'Dosen Informatika & Koordinator Lab AI',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      icon: Laptop,
      description: 'Kelola jadwal perkuliahan, reservasi ruang sidang skripsi & lab praktikum'
    },
    {
      role: 'admin' as const,
      badge: 'Admin Sarpras & IT',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
      name: 'Ir. Hendra Pratama, M.Kom',
      subtext: 'Direktorat Sarana Prasarana & IT Kampus',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      icon: ShieldCheck,
      description: 'Kendali penuh status ruangan (Tersedia/Terisi/Servis) secara realtime di database MySQL'
    },
    {
      role: 'guest' as const,
      badge: 'Tamu / Pengunjung',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700',
      name: 'Tamu / Delegasi Kampus',
      subtext: 'Pengunjung Publik & Mahasiswa Baru',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      icon: Compass,
      description: 'Mode jelajah bebas denah 2D dan model 3D interaktif tanpa batas'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Masukkan alamat email kampus atau username Anda.');
      return;
    }
    if (!password) {
      setError('Masukkan kata sandi akun.');
      return;
    }

    setIsLoading(true);
    try {
      const guessedRole: User['role'] = email.includes('admin')
        ? 'admin'
        : email.includes('dosen') || email.includes('staff')
        ? 'staff'
        : 'student';
      const success = await login(email.trim(), guessedRole);
      if (!success) {
        setError('Gagal masuk ke sistem. Silakan coba kembali.');
      }
    } catch {
      setError('Terjadi kendala saat menghubungi server autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuick = (role: User['role']) => {
    setLoadingRole(role);
    setIsLoading(true);
    setTimeout(() => {
      quickLogin(role);
      setIsLoading(false);
      setLoadingRole(null);
    }, 350);
  };

  const fillCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('demo123456');
    setActiveTab('form');
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300 selection:bg-emerald-500 selection:text-white">
      
      {/* Dynamic Background Grid Pattern & Ambient Gradient Orbs */}
      <div className="fixed inset-0 bg-grid-blueprint opacity-60 dark:opacity-20 pointer-events-none" />
      <div className="fixed -top-40 -left-40 w-[500px] h-[500px] bg-emerald-400/20 dark:bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-subtle" />
      <div className="fixed -bottom-40 -right-40 w-[500px] h-[500px] bg-teal-400/20 dark:bg-teal-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-subtle" />

      {/* Top Floating Navigation Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center shrink-0">
            <img
              src={unsilLogo}
              alt="Logo Universitas Siliwangi"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-sm transition-transform hover:scale-105"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                SmartCampus<span className="text-emerald-600 dark:text-emerald-400">3D</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Universitas Siliwangi
              </span>
            </div>
            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hidden sm:block">
              Universitas Siliwangi • Gedung LABTEK 1 & FT.1
            </p>
          </div>
        </div>

        {/* Right Controls: MySQL Live Indicator + Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-emerald-200/80 dark:border-slate-800 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-700 dark:text-slate-300 text-[11px]">MySQL XAMPP Live</span>
          </div>

          {/* Theme Toggle Button (Light / Dark Mode) */}
          <ThemeToggle showLabel={false} size="md" />
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-auto py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl sm:rounded-[32px] shadow-2xl border border-emerald-100 dark:border-slate-800 overflow-hidden transition-all duration-300">
          
          {/* ========================================================
              LEFT COLUMN: HERO BRANDING & CAMPUS 3D SHOWCASE
             ======================================================== */}
          <div className="lg:col-span-5 relative p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-gradient-to-br from-emerald-800 via-emerald-950 to-slate-950 text-white overflow-hidden">
            
            {/* Ambient Graphic Elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Badge Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-bold">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Smart Navigation v2.5 Eco Edition</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  Sistem Wayfinding & Denah Kampus Interaktif
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed mt-2.5">
                  Platform navigasi pintar bagi mahasiswa dan civitas akademika untuk menemukan ruangan kelas, jadwal praktikum lab, dan rute jalan terdekat.
                </p>
              </div>

              {/* 3 Interactive Campus Highlights */}
              <div className="space-y-3 pt-2">
                
                {/* Feature 1: Dual Building Architecture */}
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/30 text-emerald-300 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span>2 Gedung Utama & 4 Tingkat</span>
                        <span className="text-[10px] bg-emerald-500/40 text-emerald-100 px-1.5 py-0.2 rounded font-mono">24 Ruang</span>
                      </div>
                      <p className="text-[11px] text-emerald-200/80 mt-0.5">
                        Gedung LABTEK 1 (Kuliah & BAAK) dan Gedung FT.1 (Dekanat & Riset).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 2: 3D Isometric View */}
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-500/30 text-teal-300 shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white">
                        Visualisasi 3D Multi-Lantai Isometrik
                      </div>
                      <p className="text-[11px] text-emerald-200/80 mt-0.5">
                        Mode pisah tumpukan lantai (*expanded stack*) dengan rotasi interaktif.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 3: Smart Spotlight Search */}
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/30 text-amber-300 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span>Spotlight Search Engine</span>
                        <kbd className="text-[9px] bg-white/20 text-white px-1 rounded font-mono">Ctrl+K</kbd>
                      </div>
                      <p className="text-[11px] text-emerald-200/80 mt-0.5">
                        Cari ruang kuliah, nama dosen, jadwal mata kuliah, atau fasilitas lab.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Campus Stat Banner */}
            <div className="relative mt-8 pt-5 border-t border-white/15 flex items-center justify-between text-xs text-emerald-200/90 z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-semibold">Database Terintegrasi XAMPP</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-300 font-bold bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                100% Online
              </span>
            </div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: MODERN LOGIN FORM & QUICK DEMO SELECTOR
             ======================================================== */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white dark:bg-slate-900 transition-colors">
            <div>
              
              {/* Header Title with Tab Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Masuk ke Sistem Kampus
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pilih akun demonstrasi cepat atau gunakan akun Single Sign-On (SSO).
                  </p>
                </div>

                {/* Tab Switcher Pills */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('quick')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'quick'
                        ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs border border-emerald-200 dark:border-emerald-600/40'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    ⚡ Masuk 1-Klik
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'form'
                        ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs border border-emerald-200 dark:border-emerald-600/40'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    🔑 Form Login
                  </button>
                </div>
              </div>

              {/* Error Alert Banner */}
              {error && (
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between animate-slide-up">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>{error}</span>
                  </div>
                  <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 font-bold">✕</button>
                </div>
              )}

              {/* TAB 1: 1-CLICK INSTANT ROLES (MAHASISWA, DOSEN, ADMIN, TAMU) */}
              {activeTab === 'quick' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                    <span>Pilih Peran Anda untuk Masuk Langsung</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold lowercase">
                      tanpa perlu ketik password
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {demoRoles.map((item) => {
                      const Icon = item.icon;
                      const isThisLoading = isLoading && loadingRole === item.role;

                      return (
                        <div
                          key={item.role}
                          onClick={() => !isLoading && handleQuick(item.role)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden ${
                            item.role === 'student'
                              ? 'bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/40 dark:to-slate-800/80 border-emerald-300 dark:border-emerald-700 shadow-xs hover:border-emerald-500 hover:shadow-md'
                              : 'bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-sm'
                          }`}
                        >
                          {/* Top row with Badge & Icon */}
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                            <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          {/* User Avatar + Name */}
                          <div className="flex items-center gap-2.5 my-1.5">
                            <img
                              src={item.avatar}
                              alt={item.name}
                              className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0"
                            />
                            <div className="truncate">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 truncate transition-colors">
                                {item.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {item.subtext}
                              </p>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 my-1 leading-relaxed">
                            {item.description}
                          </p>

                          {/* Bottom Action */}
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300">
                            <span>{isThisLoading ? 'Memuat profil...' : 'Masuk sebagai ' + item.badge.split(' ')[0]}</span>
                            {isThisLoading ? (
                              <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Guest Exploration Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleQuick('guest')}
                      className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Jelajah Denah Sebagai Tamu Publik Tanpa Login</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: MANUAL SSO & FORM CREDENTIALS */}
              {activeTab === 'form' && (
                <div className="animate-fade-in">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Alamat Email Kampus / NIM / NIP
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nama.user@student.ac.id atau @kampus.ac.id"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Password Input with Eye Toggle */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Kata Sandi SSO
                        </label>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer">
                          Lupa sandi?
                        </span>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Masukkan kata sandi..."
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/20 accent-emerald-600 cursor-pointer"
                        />
                        <span>Ingat sesi masuk di perangkat ini</span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Masuk ke Denah LABTEK 1 & FT.1</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>

            {/* Bottom Form Footer & Security Badge */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Enkripsi SSL Kampus 256-bit</span>
              </span>

              <span>
                Butuh bantuan login?{' '}
                <button
                  type="button"
                  onClick={() => setIsCsModalOpen(true)}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Layanan BAAK & IT (CS)
                </button>
              </span>
            </div>

          </div>

        </div>
      </main>

      {/* Modal Layanan CS / Helpdesk */}
      <CustomerServiceModal
        isOpen={isCsModalOpen}
        onClose={() => setIsCsModalOpen(false)}
        isBackendConnected={true}
      />

      {/* Clean Minimalist Bottom Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} SmartCampus3D • Gedung LABTEK 1 & Gedung FT.1 Universitas
      </footer>

    </div>
  );
};
