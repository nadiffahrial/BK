import React, { useCallback, useEffect, useState } from 'react';
import { AdminActivity, apiService, ManagedAdmin } from '../../services/api';
import { Clock3, KeyRound, LoaderCircle, Plus, RefreshCw, ShieldCheck, Trash2, UserRoundPlus, X } from 'lucide-react';

interface Props { token: string; }

const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'Belum pernah masuk';

const actionLabel: Record<string, string> = {
  login: 'Admin masuk',
  admin_created: 'Akun admin dibuat',
  admin_password_reset: 'Kata sandi direset',
  admin_deleted: 'Akun admin dihapus',
  super_admin_bootstrap: 'Super Admin disiapkan'
};

export const SuperAdminAdminPanel: React.FC<Props> = ({ token }) => {
  const [admins, setAdmins] = useState<ManagedAdmin[]>([]);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [resetTarget, setResetTarget] = useState<ManagedAdmin | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [form, setForm] = useState({ name: '', email: '', department: '', password: '' });

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await apiService.getManagedAdmins(token);
      setAdmins(result.admins);
      setActivity(result.activity);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Data admin gagal dimuat.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { void refresh(); }, [refresh]);

  const createAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true); setError(''); setNotice('');
    try {
      await apiService.createManagedAdmin(form, token);
      setForm({ name: '', email: '', department: '', password: '' });
      setNotice('Akun admin berhasil dibuat.');
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Akun admin gagal dibuat.');
    } finally { setIsSaving(false); }
  };

  const saveReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resetTarget) return;
    setIsSaving(true); setError(''); setNotice('');
    try {
      await apiService.resetManagedAdminPassword(resetTarget.id, resetPassword, token);
      setNotice(`Kata sandi ${resetTarget.name} berhasil direset.`);
      setResetTarget(null); setResetPassword('');
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Kata sandi gagal direset.');
    } finally { setIsSaving(false); }
  };

  const removeAdmin = async (admin: ManagedAdmin) => {
    if (!window.confirm(`Hapus akun admin ${admin.name} (${admin.email})? Akun ini tidak akan dapat login lagi.`)) return;
    setError(''); setNotice('');
    try {
      await apiService.deleteManagedAdmin(admin.id, token);
      setNotice(`Akun ${admin.name} berhasil dihapus.`);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Akun admin gagal dihapus.');
    }
  };

  return <section className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-400">Kontrol akses</p>
        <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">Manajemen Admin</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pantau aktivitas login dan kelola akun Admin kampus.</p>
      </div>
      <button type="button" onClick={() => void refresh()} disabled={isLoading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"><RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}/>Segarkan data</button>
    </div>

    {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}
    {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{notice}</div>}

    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800"><div><h3 className="font-bold text-slate-900 dark:text-white">Admin terdaftar</h3><p className="mt-0.5 text-xs text-slate-500">{admins.length} akun aktif tercatat</p></div><ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-400"/></div>
          {isLoading ? <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin"/>Memuat akun…</div> : admins.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">Belum ada akun Admin.</p> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-950"><tr><th className="px-4 py-3">Admin</th><th className="px-4 py-3">Login terakhir</th><th className="px-4 py-3 text-right">Tindakan</th></tr></thead><tbody>{admins.map(admin => <tr key={admin.id} className="border-t border-slate-100 dark:border-slate-800"><td className="px-4 py-3"><div className="font-semibold text-slate-900 dark:text-slate-100">{admin.name}</div><div className="mt-0.5 text-xs text-slate-500">{admin.email}{admin.department ? ` · ${admin.department}` : ''}</div><div className="mt-1 text-[10px] text-slate-400">Dibuat {formatDate(admin.createdAt)}</div></td><td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300"><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-slate-400"/>{formatDate(admin.lastLoginAt)}</span></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button type="button" title="Reset kata sandi" onClick={() => { setResetTarget(admin); setResetPassword(''); setError(''); }} className="rounded-md p-2 text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-amber-950/40 dark:hover:text-amber-300"><KeyRound className="h-4 w-4"/></button><button type="button" title="Hapus admin" onClick={() => void removeAdmin(admin)} className="rounded-md p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"><Trash2 className="h-4 w-4"/></button></div></td></tr>)}</tbody></table></div>
          )}
        </article>

        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800"><h3 className="font-bold text-slate-900 dark:text-white">Aktivitas terbaru</h3><p className="mt-0.5 text-xs text-slate-500">Riwayat login, pembuatan akun, reset kata sandi, dan penghapusan.</p></div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">{activity.length ? activity.slice(0, 12).map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"><div><div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{actionLabel[item.action] || item.action}</div><div className="mt-0.5 text-xs text-slate-500">{item.actorName || 'Akun dihapus'}{item.targetEmail ? ` · ${item.targetEmail}` : item.details ? ` · ${item.details}` : ''}</div></div><time className="text-[11px] text-slate-400">{formatDate(item.createdAt)}</time></div>) : <p className="p-6 text-center text-sm text-slate-500">Belum ada aktivitas yang tercatat.</p>}</div>
        </article>
      </div>

      <form onSubmit={createAdmin} className="h-fit rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2"><span className="rounded-lg bg-emerald-50 p-2 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"><UserRoundPlus className="h-4 w-4"/></span><div><h3 className="font-bold text-slate-900 dark:text-white">Tambah Admin</h3><p className="text-xs text-slate-500">Akun diberi akses Admin, bukan Super Admin.</p></div></div>
        {([['Nama lengkap', 'name', 'text'], ['Email kampus', 'email', 'email'], ['Unit / departemen', 'department', 'text'], ['Kata sandi awal', 'password', 'password']] as const).map(([label, key, type]) => <label key={key} className="mt-3 block text-xs font-semibold text-slate-600 dark:text-slate-300">{label}<input required={key !== 'department'} type={type} minLength={key === 'password' ? 10 : undefined} autoComplete={key === 'password' ? 'new-password' : undefined} value={form[key]} onChange={event => setForm(current => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"/></label>)}
        <button type="submit" disabled={isSaving || !form.name.trim() || !form.email.trim() || form.password.length < 10} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Plus className="h-4 w-4"/>}Buat akun Admin</button>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Kata sandi disimpan sebagai hash dan tidak ditampilkan kembali.</p>
      </form>
    </div>

    {resetTarget && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setResetTarget(null); }}><form role="dialog" aria-modal="true" aria-labelledby="reset-admin-title" onSubmit={saveReset} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"><div className="mb-4 flex items-start justify-between gap-3"><div><h3 id="reset-admin-title" className="font-bold text-slate-900 dark:text-white">Reset kata sandi</h3><p className="mt-1 text-xs text-slate-500">{resetTarget.name} · {resetTarget.email}</p></div><button type="button" onClick={() => setResetTarget(null)} aria-label="Tutup" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4"/></button></div><label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Kata sandi baru<input autoFocus type="password" minLength={10} autoComplete="new-password" value={resetPassword} onChange={event => setResetPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"/></label><button type="submit" disabled={isSaving || resetPassword.length < 10} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"><KeyRound className="h-4 w-4"/>Simpan kata sandi baru</button></form></div>}
  </section>;
};
