import React, { useEffect, useMemo, useState } from 'react';
import { Building, Room, RoomFacility, RoomScheduleItem, RoomStatus } from '../../types';
import { CalendarDays, Pencil, Plus, Trash2, Users, DoorOpen, Wrench, TicketCheck, X, Save, Menu, ChevronDown } from 'lucide-react';
import { CAMPUS_MODEL_LABELS } from '../../data/campusModelLabels';
import { SuperAdminAdminPanel } from './SuperAdminAdminPanel';
import { apiService, ScheduleCatalog } from '../../services/api';

interface Props {
  buildings: Building[];
  onBuildingsChange: (buildings: Building[]) => void;
  campusModelLabels: Record<string, string>;
  onCampusModelLabelsChange: (labels: Record<string, string>) => void;
  isSuperAdmin: boolean;
  token: string;
  onSectionChange: (section: 'overview' | 'rooms' | 'schedule' | 'catalog' | 'admins') => void;
  ticketCount: number;
  visitCount: number;
  onOpenTickets: () => void;
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const emptyRoom = { code: '', name: '', buildingId: '', floorNumber: 1, capacity: 30, description: '', equipment: '', status: 'available' as RoomStatus };
const emptyScheduleCatalog: ScheduleCatalog = { agendas: [], lecturers: [] };
const uniqueNames = (values: string[]) => [...new Map(values.map(value => value.trim()).filter(Boolean).map(value => [value.toLocaleLowerCase('id-ID'), value.trim()])).values()].sort((a, b) => a.localeCompare(b, 'id-ID'));

export const AdminWorkspace: React.FC<Props> = ({ buildings, onBuildingsChange, campusModelLabels, onCampusModelLabelsChange, isSuperAdmin, token, onSectionChange, ticketCount, visitCount, onOpenTickets }) => {
  const [section, setSection] = useState<'overview' | 'rooms' | 'schedule' | 'catalog' | 'admins'>('overview');
  const [roomBuildingFilter, setRoomBuildingFilter] = useState('all');
  const [roomFloorFilter, setRoomFloorFilter] = useState('all');
  const [scheduleBuildingFilter, setScheduleBuildingFilter] = useState('all');
  const [scheduleFloorFilter, setScheduleFloorFilter] = useState('all');
  const [roomDraft, setRoomDraft] = useState<Room | null>(null);
  const [scheduleRoom, setScheduleRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState(emptyRoom);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ title: '', organizer: '', className: '', day: 'Senin', start: '08:00', end: '10:00', type: 'Perkuliahan', holidayDates: '' });
  const [scheduleCatalog, setScheduleCatalog] = useState<ScheduleCatalog>(emptyScheduleCatalog);
  const [agendaDraft, setAgendaDraft] = useState('');
  const [lecturerDraft, setLecturerDraft] = useState('');
  const [editingCatalogValue, setEditingCatalogValue] = useState<{ kind: keyof ScheduleCatalog; name: string } | null>(null);
  const [catalogEditDraft, setCatalogEditDraft] = useState('');
  const [catalogNotice, setCatalogNotice] = useState('');
  const [notice, setNotice] = useState('');
  const [buildingNameDrafts, setBuildingNameDrafts] = useState<Record<string, string>>(campusModelLabels);
  useEffect(() => {
    setBuildingNameDrafts(campusModelLabels);
  }, [campusModelLabels]);
  useEffect(() => {
    const handleSection = (event: Event) => {
      const next = (event as CustomEvent<typeof section>).detail;
      if (next === 'admins' && !isSuperAdmin) return;
      setSection(next);
      onSectionChange(next);
    };
    window.addEventListener('admin-section', handleSection);
    return () => window.removeEventListener('admin-section', handleSection);
  }, [isSuperAdmin, onSectionChange]);
  const rooms = useMemo(() => buildings.flatMap(b => b.floors.flatMap(f => f.rooms)), [buildings]);
  const roomFilterFloors = useMemo(() => {
    const scopedBuildings = roomBuildingFilter === 'all' ? buildings : buildings.filter(building => building.id === roomBuildingFilter);
    return [...new Set(scopedBuildings.flatMap(building => building.floors.map(floor => floor.floorNumber)))].sort((a, b) => a - b);
  }, [buildings, roomBuildingFilter]);
  const filteredRooms = useMemo(() => rooms.filter(room =>
    (roomBuildingFilter === 'all' || room.buildingId === roomBuildingFilter) &&
    (roomFloorFilter === 'all' || room.floorNumber === Number(roomFloorFilter))
  ), [rooms, roomBuildingFilter, roomFloorFilter]);
  const scheduleFilterFloors = useMemo(() => {
    const scopedBuildings = scheduleBuildingFilter === 'all' ? buildings : buildings.filter(building => building.id === scheduleBuildingFilter);
    return [...new Set(scopedBuildings.flatMap(building => building.floors.map(floor => floor.floorNumber)))].sort((a, b) => a - b);
  }, [buildings, scheduleBuildingFilter]);
  const filteredScheduleRooms = useMemo(() => rooms.filter(room =>
    (scheduleBuildingFilter === 'all' || room.buildingId === scheduleBuildingFilter) &&
    (scheduleFloorFilter === 'all' || room.floorNumber === Number(scheduleFloorFilter))
  ), [rooms, scheduleBuildingFilter, scheduleFloorFilter]);
  const schedules = rooms.flatMap(r => r.schedule.map(s => ({ ...s, room: r })));
  const agendaOptions = uniqueNames([...scheduleCatalog.agendas, ...schedules.map(item => item.title)]);
  const lecturerOptions = uniqueNames([...scheduleCatalog.lecturers, ...schedules.map(item => item.organizer)]);
  const available = rooms.filter(r => r.status === 'available').length;
  const occupancy = rooms.length ? Math.round(rooms.reduce((n, r) => n + (r.currentOccupancy || 0), 0) / rooms.reduce((n, r) => n + r.capacity, 0) * 100) : 0;

  useEffect(() => {
    let active = true;
    apiService.getScheduleCatalog().then(catalog => {
      if (active && catalog) setScheduleCatalog({ agendas: uniqueNames(catalog.agendas), lecturers: uniqueNames(catalog.lecturers) });
    });
    return () => { active = false; };
  }, []);

  const commitRoom = (id: string, update: (room: Room) => Room) => onBuildingsChange(buildings.map(b => ({ ...b, floors: b.floors.map(f => ({ ...f, rooms: f.rooms.map(r => r.id === id ? update(r) : r) })) })));
  const saveBuildingName = (buildingId: string) => {
    const name = (buildingNameDrafts[buildingId] || '').trim();
    if (!name) return;
    onCampusModelLabelsChange({ ...campusModelLabels, [buildingId]: name });
    if (buildings.some(building => building.id === buildingId)) {
      onBuildingsChange(buildings.map(building => building.id === buildingId ? { ...building, shortName: name } : building));
    }
    setNotice('Nama gedung pada model 3D disimpan.');
    window.setTimeout(() => setNotice(''), 2500);
  };
  const openEdit = (room: Room) => {
    setRoomDraft(room);
    setRoomForm({ code: room.code, name: room.name, buildingId: room.buildingId, floorNumber: room.floorNumber, capacity: room.capacity, description: room.description, equipment: room.facilities.map(f => `${f.name}${f.spec ? ` (${f.spec})` : ''}`).join(', '), status: room.status });
    setShowRoomForm(true);
  };
  const saveRoom = () => {
    if (!roomDraft) return;
    const facilities: RoomFacility[] = roomForm.equipment.split(',').map(x => x.trim()).filter(Boolean).map(entry => ({ name: entry.replace(/^!/, '').trim(), iconName: 'Check', available: !entry.startsWith('!') }));
    commitRoom(roomDraft.id, room => ({ ...room, name: roomForm.name.trim(), capacity: Number(roomForm.capacity), description: roomForm.description.trim(), facilities }));
    setShowRoomForm(false); setRoomDraft(null); setNotice('Data ruang disimpan.'); window.setTimeout(() => setNotice(''), 2500);
  };
  const addSchedule = () => {
    if (!scheduleRoom || !scheduleForm.title.trim() || !scheduleForm.organizer.trim() || scheduleForm.start >= scheduleForm.end) return;
    const toMinutes = (time: string) => { const [hour, minute] = time.split(':').map(Number); return hour * 60 + minute; };
    const [startMinute, endMinute] = [toMinutes(scheduleForm.start), toMinutes(scheduleForm.end)];
    const overlaps = scheduleRoom.schedule.some(item => {
      if (item.day !== scheduleForm.day) return false;
      const [oldStart, oldEnd] = item.timeRange.split(' - ').map(toMinutes);
      return startMinute < oldEnd && endMinute > oldStart;
    });
    if (overlaps) { setNotice('Jadwal bertabrakan dengan agenda lain pada hari dan jam tersebut.'); return; }
    const item: RoomScheduleItem = { id: `schedule-${Date.now()}`, title: scheduleForm.title.trim(), organizer: scheduleForm.organizer.trim(), className: scheduleForm.className.trim(), type: scheduleForm.type, timeRange: `${scheduleForm.start} - ${scheduleForm.end}`, day: scheduleForm.day, holidayDates: scheduleForm.holidayDates.split(',').map(d => d.trim()).filter(Boolean) };
    commitRoom(scheduleRoom.id, room => ({ ...room, schedule: [...room.schedule, item] }));
    setScheduleForm({ title: '', organizer: '', className: '', day: 'Senin', start: '08:00', end: '10:00', type: 'Perkuliahan', holidayDates: '' });
    setNotice('Jadwal ditambahkan.'); window.setTimeout(() => setNotice(''), 2500);
  };
  const saveCatalog = async (next: ScheduleCatalog) => {
    if (!token) {
      setCatalogNotice('Sesi admin tidak ditemukan. Silakan masuk kembali.');
      return false;
    }
    setCatalogNotice('Menyimpan perubahan…');
    try {
      const saved = await apiService.saveScheduleCatalog(next, token);
      setScheduleCatalog({ agendas: uniqueNames(saved.agendas), lecturers: uniqueNames(saved.lecturers) });
      setCatalogNotice('Daftar agenda dan pengajar disimpan.');
      return true;
    } catch (error) {
      setCatalogNotice(error instanceof Error ? error.message : 'Daftar gagal disimpan.');
      return false;
    }
  };
  const addAgenda = () => {
    const name = agendaDraft.trim();
    if (!name || agendaOptions.some(item => item.toLocaleLowerCase('id-ID') === name.toLocaleLowerCase('id-ID'))) return;
    setAgendaDraft('');
    void saveCatalog({ ...scheduleCatalog, agendas: uniqueNames([...scheduleCatalog.agendas, name]) });
  };
  const addLecturer = () => {
    const name = lecturerDraft.trim();
    if (!name || lecturerOptions.some(item => item.toLocaleLowerCase('id-ID') === name.toLocaleLowerCase('id-ID'))) return;
    setLecturerDraft('');
    void saveCatalog({ ...scheduleCatalog, lecturers: uniqueNames([...scheduleCatalog.lecturers, name]) });
  };
  const removeCatalogValue = (kind: keyof ScheduleCatalog, name: string) => {
    const inUse = schedules.some(item => (kind === 'agendas' ? item.title : item.organizer) === name);
    if (inUse) {
      setCatalogNotice('Data yang masih dipakai jadwal tidak dapat dihapus.');
      return;
    }
    void saveCatalog({ ...scheduleCatalog, [kind]: scheduleCatalog[kind].filter(item => item !== name) });
  };
  const renameCatalogValue = async (kind: keyof ScheduleCatalog, oldName: string) => {
    const newName = catalogEditDraft.trim();
    if (!newName) return;
    if (newName.toLocaleLowerCase('id-ID') !== oldName.toLocaleLowerCase('id-ID') &&
      (kind === 'agendas' ? agendaOptions : lecturerOptions).some(item => item.toLocaleLowerCase('id-ID') === newName.toLocaleLowerCase('id-ID'))) {
      setCatalogNotice('Nama tersebut sudah ada di daftar.');
      return;
    }

    const updatedBuildings = buildings.map(building => ({
      ...building,
      floors: building.floors.map(floor => ({
        ...floor,
        rooms: floor.rooms.map(room => ({
          ...room,
          schedule: room.schedule.map(item => {
            if (kind === 'agendas' && item.title === oldName) return { ...item, title: newName };
            if (kind === 'lecturers' && item.organizer === oldName) return { ...item, organizer: newName };
            return item;
          })
        }))
      }))
    }));
    const nextCatalog = { ...scheduleCatalog, [kind]: uniqueNames([...scheduleCatalog[kind].filter(item => item !== oldName), newName]) };
    onBuildingsChange(updatedBuildings);
    if (await saveCatalog(nextCatalog)) {
      setEditingCatalogValue(null);
      setCatalogEditDraft('');
    }
  };
  const deleteSchedule = (room: Room, id: string) => commitRoom(room.id, r => ({ ...r, schedule: r.schedule.filter(s => s.id !== id) }));
  const go = (target: typeof section) => { if (target === 'admins' && !isSuperAdmin) return; setSection(target); onSectionChange(target); setShowMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return <section className="mb-7">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-400">Administrasi kampus</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{section === 'overview' ? 'Dashboard' : section === 'rooms' ? 'Ruang & fasilitas' : section === 'schedule' ? 'Jadwal ruangan' : section === 'catalog' ? 'Agenda & pengajar' : 'Manajemen Admin'}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{section === 'admins' ? 'Kelola akses dan pantau aktivitas admin kampus.' : section === 'catalog' ? 'Simpan daftar mata kuliah, agenda, dan penanggung jawab.' : 'Pantau pemakaian ruang dan kelola fasilitas kampus.'}</p></div>
      <div className="flex items-center gap-2"><button type="button" onClick={onOpenTickets} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"><TicketCheck className="h-4 w-4"/><span className="hidden sm:inline">Antrean layanan</span><span className="rounded-full bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">{ticketCount}</span></button><button type="button" onClick={() => setShowMobileMenu(v => !v)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-emerald-50 hover:text-emerald-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"><Menu className="h-4 w-4"/> Navigasi <ChevronDown className="h-3.5 w-3.5"/></button></div>
    </div>
    {showMobileMenu && <nav className={`mb-4 grid ${isSuperAdmin ? 'grid-cols-5' : 'grid-cols-4'} gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-md dark:border-slate-700 dark:bg-slate-900 md:hidden`}><button onClick={() => go('overview')} className="rounded-lg p-2 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-slate-800">Dashboard</button><button onClick={() => go('rooms')} className="rounded-lg p-2 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-slate-800">Ruang</button><button onClick={() => go('schedule')} className="rounded-lg p-2 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-slate-800">Jadwal</button><button onClick={() => go('catalog')} className="rounded-lg p-2 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-slate-800">Agenda</button>{isSuperAdmin && <button onClick={() => go('admins')} className="rounded-lg p-2 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-slate-800">Admin</button>}</nav>}
    {notice && <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{notice}</div>}
    {section === 'overview' && <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total ruangan', value: rooms.length, icon: DoorOpen, hint: `${buildings.length} gedung` },
          { label: 'Tersedia', value: available, icon: CalendarDays, hint: `${rooms.length ? Math.round(available / rooms.length * 100) : 0}% dari ruang` },
          { label: 'Kapasitas terpakai', value: `${occupancy}%`, icon: Users, hint: `${rooms.reduce((n, r) => n + (r.currentOccupancy || 0), 0)} orang tercatat` },
          { label: 'Perlu pemeliharaan', value: rooms.filter(r => r.status === 'maintenance').length, icon: Wrench, hint: `${ticketCount} tiket belum selesai` },
          { label: 'Total kunjungan', value: visitCount, icon: Users, hint: 'tercatat oleh server' }
        ].map(item => <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800"><div className="flex items-center justify-between text-slate-500 dark:text-slate-400"><span className="text-xs font-semibold">{item.label}</span><item.icon className="h-4 w-4 text-emerald-700 dark:text-emerald-400"/></div><div className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{item.value}</div><div className="mt-1 text-xs text-slate-500">{item.hint}</div></article>)}
      </div>
      <article className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3"><h2 className="font-bold text-slate-900 dark:text-white">Nama gedung pada model 3D</h2><p className="mt-1 text-xs text-slate-500">Ubah label gedung kawasan yang tampil di model.</p></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.keys(CAMPUS_MODEL_LABELS).map(buildingId => {
            const building = buildings.find(item => item.id === buildingId);
            return <form key={buildingId} className="flex items-end gap-2" onSubmit={event => { event.preventDefault(); saveBuildingName(buildingId); }}>
              <label className="min-w-0 flex-1 text-xs font-semibold text-slate-600 dark:text-slate-300">{CAMPUS_MODEL_LABELS[buildingId]}
                <input value={buildingNameDrafts[buildingId] ?? CAMPUS_MODEL_LABELS[buildingId]} onChange={event => setBuildingNameDrafts(current => ({ ...current, [buildingId]: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" maxLength={48} />
              </label>
              <button type="submit" disabled={!(buildingNameDrafts[buildingId] || '').trim()} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"><Save className="h-3.5 w-3.5"/>Simpan</button>
            </form>;
          })}
        </div>
      </article>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-900 dark:text-white">Ringkasan kondisi ruang</h2><p className="mt-1 text-xs text-slate-500">Status terbaru dari seluruh gedung</p></div><button onClick={() => go('rooms')} className="text-xs font-bold text-emerald-700 transition-colors hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200">Kelola ruang →</button></div><div className="mt-5 space-y-3">{([['Tersedia', 'available', 'bg-emerald-500'], ['Digunakan', 'occupied', 'bg-rose-500'], ['Terjadwal', 'reserved', 'bg-amber-500'], ['Pemeliharaan', 'maintenance', 'bg-slate-400']] as const).map(([label, status, color]) => { const count = rooms.filter(r => r.status === status).length; return <div key={status} className="flex items-center gap-3 text-sm"><span className={`h-2.5 w-2.5 rounded-full ${color}`}/><span className="w-28 text-slate-600 dark:text-slate-300">{label}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${color}`} style={{ width: `${rooms.length ? count / rooms.length * 100 : 0}%` }}/></div><span className="w-8 text-right font-bold text-slate-800 dark:text-slate-200">{count}</span></div>})}</div></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-bold text-slate-900 dark:text-white">Aktivitas terjadwal</h2><p className="mt-1 text-xs text-slate-500">{schedules.length} agenda di semua ruangan</p><div className="mt-4 space-y-3">{schedules.slice(0, 4).map(s => <div key={s.id} className="border-l-2 border-emerald-500 pl-3"><div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{s.title}</div><div className="mt-0.5 text-xs text-slate-500">{s.room.code} · {s.day || '—'} · {s.timeRange}</div></div>)}{schedules.length === 0 && <p className="py-4 text-sm text-slate-500">Belum ada agenda. Tambahkan jadwal ruangan.</p>}</div><button onClick={() => go('schedule')} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-800"><CalendarDays className="h-4 w-4"/> Kelola jadwal</button></article>
      </div>
    </>}
    {section === 'rooms' && <article className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 p-4 dark:border-slate-800">
        <div><h2 className="font-bold text-slate-900 dark:text-white">Daftar ruang</h2><p className="mt-1 text-xs text-slate-500">Edit data ruang dengan memfilter gedung dan lantai.</p></div>
        <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Gedung
            <select value={roomBuildingFilter} onChange={event => { setRoomBuildingFilter(event.target.value); setRoomFloorFilter('all'); }} className="mt-1 w-full min-w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
              <option value="all">Semua gedung</option>
              {buildings.map(building => <option key={building.id} value={building.id}>{building.shortName}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Lantai
            <select value={roomFloorFilter} onChange={event => setRoomFloorFilter(event.target.value)} className="mt-1 w-full min-w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
              <option value="all">Semua lantai</option>
              {roomFilterFloors.map(floor => <option key={floor} value={floor}>Lantai {floor}</option>)}
            </select>
          </label>
        </div>
        <p className="w-full text-xs text-slate-500">Menampilkan {filteredRooms.length} dari {rooms.length} ruangan.</p>
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-950"><tr><th className="px-4 py-3">Ruangan</th><th className="px-4 py-3">Gedung</th><th className="px-4 py-3">Kapasitas</th><th className="px-4 py-3">Peralatan</th><th className="px-4 py-3">Tindakan</th></tr></thead><tbody>
        {filteredRooms.map(r => <tr key={r.id} className="border-t border-slate-100 transition-colors hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-slate-800/60"><td className="px-4 py-3"><div className="font-bold text-slate-800 dark:text-slate-100">{r.code} · {r.name}</div><div className="max-w-[340px] truncate text-xs text-slate-500">{r.description}</div></td><td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{buildings.find(b => b.id === r.buildingId)?.shortName} · Lt {r.floorNumber}</td><td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{r.capacity} orang</td><td className="max-w-40 truncate px-4 py-3 text-xs text-slate-500">{r.facilities.map(f => f.name).join(', ') || '—'}</td><td className="px-4 py-3"><div className="flex gap-1"><button title="Jadwalkan" onClick={() => setScheduleRoom(r)} className="rounded-md p-2 text-slate-500 transition-colors hover:bg-emerald-100 hover:text-emerald-800 dark:hover:bg-emerald-950"><CalendarDays className="h-4 w-4"/></button><button title="Edit" onClick={() => openEdit(r)} className="rounded-md p-2 text-slate-500 transition-colors hover:bg-emerald-100 hover:text-emerald-800 dark:hover:bg-emerald-950"><Pencil className="h-4 w-4"/></button></div></td></tr>)}
        {filteredRooms.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">Tidak ada ruangan pada filter ini.</td></tr>}
      </tbody></table></div>
    </article>}
    {section === 'catalog' && <div className="grid gap-4 lg:grid-cols-2">
      {([
        { key: 'agendas' as const, title: 'Mata kuliah / agenda', draft: agendaDraft, setDraft: setAgendaDraft, add: addAgenda, values: agendaOptions },
        { key: 'lecturers' as const, title: 'Dosen / penanggung jawab', draft: lecturerDraft, setDraft: setLecturerDraft, add: addLecturer, values: lecturerOptions }
      ]).map(group => <article key={group.key} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">{group.title}</h2>
        <form className="mt-3 flex gap-2" onSubmit={event => { event.preventDefault(); group.add(); }}>
          <input value={group.draft} onChange={event => group.setDraft(event.target.value)} maxLength={120} placeholder={`Tambah ${group.title.toLocaleLowerCase('id-ID')}`} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          <button type="submit" disabled={!group.draft.trim()} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">Tambah</button>
        </form>
        <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {group.values.map(value => {
            const saved = scheduleCatalog[group.key].includes(value);
            const inUse = schedules.some(item => (group.key === 'agendas' ? item.title : item.organizer) === value);
            const isEditing = editingCatalogValue?.kind === group.key && editingCatalogValue.name === value;
            return <li key={value} className="flex items-center justify-between gap-3 py-2.5 text-sm text-slate-700 dark:text-slate-200">
              {isEditing ? (
                <form className="flex w-full items-center gap-2" onSubmit={event => { event.preventDefault(); void renameCatalogValue(group.key, value); }}>
                  <input autoFocus value={catalogEditDraft} onChange={event => setCatalogEditDraft(event.target.value)} maxLength={120} aria-label={`Ubah ${group.title}`} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
                  <button type="submit" disabled={!catalogEditDraft.trim()} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">Simpan</button>
                  <button type="button" onClick={() => { setEditingCatalogValue(null); setCatalogEditDraft(''); }} className="rounded-lg px-2 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Batal</button>
                </form>
              ) : <>
                <span className="min-w-0">{value}{inUse && <span className="ml-2 text-xs text-slate-400">Dipakai jadwal</span>}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" onClick={() => { setEditingCatalogValue({ kind: group.key, name: value }); setCatalogEditDraft(value); }} className="rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40">Edit</button>
                  {saved && <button type="button" disabled={inUse} onClick={() => removeCatalogValue(group.key, value)} className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-rose-950/30" title={inUse ? 'Masih digunakan oleh jadwal' : `Hapus ${value}`}>Hapus</button>}
                </div>
              </>}
            </li>;
          })}
          {group.values.length === 0 && <li className="py-6 text-center text-sm text-slate-500">Belum ada data. Tambahkan melalui kolom di atas.</li>}
        </ul>
      </article>)}
      {catalogNotice && <p role="status" className="text-sm text-slate-600 dark:text-slate-300 lg:col-span-2">{catalogNotice}</p>}
    </div>}
    {section === 'schedule' && <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <article className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">Jadwal ruangan</h2>
        <p className="mt-1 text-xs text-slate-500">Status ruang mengikuti jadwal aktif menurut waktu WIB. Tanggal libur mengecualikan jadwal.</p>
        <div className="mt-4 space-y-2">
          {schedules.map(item => <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
            <div><div className="font-semibold text-slate-800 dark:text-slate-100">{item.title}</div><div className="mt-1 text-xs text-slate-500">{item.room.code} · {item.day || 'Hari belum ditentukan'} · {item.timeRange}{item.className ? ` · Kelas ${item.className}` : ''}</div><div className="text-xs text-slate-500">Dosen/penanggung jawab: {item.organizer}{item.holidayDates?.length ? ` · Libur: ${item.holidayDates.join(', ')}` : ''}</div></div>
            <button onClick={() => deleteSchedule(item.room, item.id)} className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30" aria-label={`Hapus jadwal ${item.title}`}><Trash2 className="h-4 w-4"/></button>
          </div>)}
          {schedules.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Belum ada jadwal ruangan.</p>}
        </div>
      </article>
      <article className="h-fit rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">Tambah jadwal</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Filter gedung
            <select value={scheduleBuildingFilter} onChange={event => { setScheduleBuildingFilter(event.target.value); setScheduleFloorFilter('all'); setScheduleRoom(null); }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
              <option value="all">Semua gedung</option>
              {buildings.map(building => <option key={building.id} value={building.id}>{building.shortName}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Filter lantai
            <select value={scheduleFloorFilter} onChange={event => { setScheduleFloorFilter(event.target.value); setScheduleRoom(null); }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
              <option value="all">Semua lantai</option>
              {scheduleFilterFloors.map(floor => <option key={floor} value={floor}>Lantai {floor}</option>)}
            </select>
          </label>
        </div>
        <label className="mt-4 block text-xs font-semibold text-slate-600 dark:text-slate-300">Ruangan
          <select value={scheduleRoom?.id || ''} onChange={event => setScheduleRoom(filteredScheduleRooms.find(room => room.id === event.target.value) || null)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">Pilih ruangan…</option>{filteredScheduleRooms.map(room => <option key={room.id} value={room.id}>{room.code} · {room.name}</option>)}</select>
        </label>
        <label className="mt-3 block text-xs font-semibold text-slate-600 dark:text-slate-300">Mata kuliah / agenda
          <select value={scheduleForm.title} onChange={event => setScheduleForm({ ...scheduleForm, title: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">Pilih agenda…</option>{agendaOptions.map(name => <option key={name} value={name}>{name}</option>)}</select>
        </label>
        <label className="mt-3 block text-xs font-semibold text-slate-600 dark:text-slate-300">Dosen / penanggung jawab
          <select value={scheduleForm.organizer} onChange={event => setScheduleForm({ ...scheduleForm, organizer: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">Pilih penanggung jawab…</option>{lecturerOptions.map(name => <option key={name} value={name}>{name}</option>)}</select>
        </label>
        <label className="mt-3 block text-xs font-semibold text-slate-600 dark:text-slate-300">Kelas
          <input value={scheduleForm.className} onChange={event => setScheduleForm({ ...scheduleForm, className: event.target.value })} maxLength={40} placeholder="Contoh: 1A" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
        </label>
        <label className="mt-3 block text-xs font-semibold text-slate-600 dark:text-slate-300">Jenis agenda
          <select value={scheduleForm.type} onChange={event => setScheduleForm({ ...scheduleForm, type: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">{['Perkuliahan', 'Praktikum', 'Rapat', 'Seminar', 'Layanan', 'Lainnya'].map(type => <option key={type}>{type}</option>)}</select>
        </label>
        <label className="mt-3 block text-xs font-semibold text-slate-600 dark:text-slate-300">Hari
          <select value={scheduleForm.day} onChange={event => setScheduleForm({ ...scheduleForm, day: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">{DAYS.map(day => <option key={day}>{day}</option>)}</select>
        </label>
        <div className="mt-3 grid grid-cols-2 gap-2"><label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Mulai<input type="time" value={scheduleForm.start} onChange={event => setScheduleForm({ ...scheduleForm, start: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"/></label><label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Selesai<input type="time" value={scheduleForm.end} onChange={event => setScheduleForm({ ...scheduleForm, end: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"/></label></div>
        <label className="mt-3 block text-xs font-semibold text-slate-600 dark:text-slate-300">Tanggal libur (opsional, YYYY-MM-DD; pisahkan koma)
          <input placeholder="2026-12-25, 2027-01-01" value={scheduleForm.holidayDates} onChange={event => setScheduleForm({ ...scheduleForm, holidayDates: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"/>
        </label>
        <button disabled={!scheduleRoom || !scheduleForm.title || !scheduleForm.organizer || scheduleForm.start >= scheduleForm.end} onClick={addSchedule} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-4 w-4"/>Simpan jadwal</button>
        <button type="button" onClick={() => go('catalog')} className="mt-2 w-full rounded-lg px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40">Kelola mata kuliah dan pengajar</button>
      </article>
    </div>}
    {section === 'admins' && isSuperAdmin && <SuperAdminAdminPanel token={token} />}
    {showRoomForm && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={e => { if (e.target === e.currentTarget) setShowRoomForm(false); }}><div role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-2xl dark:bg-slate-900"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900 dark:text-white">Ubah data ruang</h2><button onClick={() => setShowRoomForm(false)} className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4"/></button></div><div className="grid gap-3 sm:grid-cols-2">{([['Nama ruang', 'name'], ['Kapasitas', 'capacity'], ['Deskripsi', 'description'], ['Peralatan (pisahkan koma; awali tanda ! untuk alat tidak tersedia)', 'equipment']] as const).map(([label, key]) => <label key={key} className={`text-xs font-semibold text-slate-600 dark:text-slate-300 ${key === 'description' || key === 'equipment' ? 'sm:col-span-2' : ''}`}>{label}{key === 'description' || key === 'equipment' ? <textarea rows={key === 'description' ? 3 : 2} value={roomForm[key]} onChange={e => setRoomForm({ ...roomForm, [key]: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"/> : <input type={key === 'capacity' ? 'number' : 'text'} min="1" value={roomForm[key]} onChange={e => setRoomForm({ ...roomForm, [key]: key === 'capacity' ? Number(e.target.value) : e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"/>}</label>)}</div><button disabled={!roomForm.name.trim() || roomForm.capacity < 1} onClick={saveRoom} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"><Save className="h-4 w-4"/> Simpan perubahan</button></div></div>}
    {scheduleRoom && section !== 'schedule' && <div className="fixed bottom-5 right-5 z-30 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white shadow-xl"><span className="text-sm">Pilih <strong>Jadwal ruangan</strong> untuk mengatur {scheduleRoom.code}</span><button onClick={() => go('schedule')} className="text-xs font-bold text-emerald-300 hover:text-emerald-100">Buka →</button><button onClick={() => setScheduleRoom(null)} aria-label="Tutup" className="text-slate-400 hover:text-white"><X className="h-4 w-4"/></button></div>}
  </section>;
};
