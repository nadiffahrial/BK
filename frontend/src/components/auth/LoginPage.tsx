import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { CustomerServiceModal } from '../common/CustomerServiceModal';
import { CampusLogo } from '../common/CampusLogo';
import { Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onClose: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onClose }) => {
  const { login } = useAuth();
  const [isCsModalOpen, setIsCsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Masukkan alamat email Anda.');
      return;
    }
    if (!password) {
      setError('Masukkan kata sandi akun.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) onClose();
      else setError('Email atau kata sandi tidak sesuai. Silakan coba lagi.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Terjadi kendala saat menghubungi server autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen flex-col overflow-y-auto bg-slate-50 text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="w-full border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <CampusLogo size="md" />
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">SILOKA</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Siliwangi Location Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Kembali
            </button>
            <ThemeToggle showLabel={false} size="sm" />
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[0.95fr_1.05fr]">
          <div
            className="relative flex min-h-52 flex-col justify-end bg-cover bg-center p-6 text-white sm:min-h-64 sm:p-8 md:min-h-[560px] lg:p-10"
            style={{ backgroundImage: "url('/images/login-campus.jpeg')" }}
            role="img"
            aria-label="Gedung kampus Universitas Siliwangi"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/45 to-slate-950/20" />
            <div className="relative max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">Universitas Siliwangi</p>
              <h2 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">Selamat datang di SILOKA</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/85">Masuk untuk mengelola informasi gedung, ruang, jadwal, dan layanan kampus.</p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
            <div className="mb-7">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">ADMINISTRASI KAMPUS</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Masuk ke akun</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">Gunakan akun administrator yang terdaftar.</p>
            </div>

            {error && (
              <div role="alert" className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="nama@kampus.ac.id"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Kata sandi</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 pr-11 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(value => !value)}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={event => setRememberMe(event.target.checked)}
                  className="h-4 w-4 accent-emerald-700"
                />
                <span>Ingat sesi di perangkat ini</span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Memeriksa akun…' : 'Masuk'}
              </button>
            </form>

            <div className="mt-7 border-t border-slate-200 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Butuh bantuan masuk?{' '}
              <button type="button" onClick={() => setIsCsModalOpen(true)} className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                Hubungi Layanan CS
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-4 py-4 text-center text-xs text-slate-500 dark:text-slate-500">
        © {new Date().getFullYear()} SILOKA · Universitas Siliwangi
      </footer>

      <CustomerServiceModal isOpen={isCsModalOpen} onClose={() => setIsCsModalOpen(false)} />
    </div>
  );
};
