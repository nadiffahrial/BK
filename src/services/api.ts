import { Building, RoomStatus, BookingRequest, User, SearchResultRoom, CsTicket } from '../types';
import { BUILDINGS_DATA } from '../data/buildingsData';

const API_BASE = '/api';

export const apiService = {
  // Check backend health
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Auth login
  async login(email: string, role?: string, password?: string): Promise<{ user: User; token: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, password })
      });
      if (res.ok) {
        const data = await res.json();
        return { user: data.user, token: data.token };
      }
    } catch (e) {
      console.warn('Backend login fallback to client auth');
    }
    // Fallback
    const fallbackUser: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].toUpperCase(),
      email,
      role: (role as User['role']) || 'staff',
      department: role === 'admin' ? 'Direktorat Sarpras' : 'Staff Akademik',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
    };
    return { user: fallbackUser, token: 'local-token' };
  },

  // Fetch all buildings
  async getBuildings(): Promise<Building[]> {
    try {
      const res = await fetch(`${API_BASE}/buildings`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Backend unavailable, using local buildings dataset');
    }
    return BUILDINGS_DATA;
  },

  // Update room status
  async updateRoomStatus(roomId: string, status: RoomStatus): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch (e) {
      console.warn('Backend room status update failed, handled locally');
      return false;
    }
  },

  // Create booking
  async createBooking(booking: Partial<BookingRequest>): Promise<BookingRequest | null> {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Backend booking failed, handled locally');
    }
    return null;
  },

  // Search Rooms Engine
  async searchRooms(query: string): Promise<SearchResultRoom[]> {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();

    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`, {
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend search API unavailable, using client fallback', e);
    }

    // Client-side fallback search across BUILDINGS_DATA
    const results: SearchResultRoom[] = [];
    for (const b of BUILDINGS_DATA) {
      for (const f of b.floors) {
        for (const r of f.rooms) {
          let matched = false;
          let matchReason = '';

          if (r.code.toLowerCase().includes(q)) {
            matched = true;
            matchReason = `Kode Ruangan: ${r.code}`;
          } else if (r.name.toLowerCase().includes(q)) {
            matched = true;
            matchReason = `Nama: ${r.name}`;
          } else if (r.currentActivity && (r.currentActivity.title.toLowerCase().includes(q) || r.currentActivity.personInCharge.toLowerCase().includes(q))) {
            matched = true;
            matchReason = `Agenda: ${r.currentActivity.title}`;
          } else if (r.facilities && r.facilities.some(fac => fac.name.toLowerCase().includes(q) || (fac.spec && fac.spec.toLowerCase().includes(q)))) {
            matched = true;
            const fac = r.facilities.find(fac => fac.name.toLowerCase().includes(q) || (fac.spec && fac.spec.toLowerCase().includes(q)));
            matchReason = `Fasilitas: ${fac?.name || ''}`;
          } else if (r.schedule && r.schedule.some(s => s.title.toLowerCase().includes(q) || s.organizer.toLowerCase().includes(q))) {
            matched = true;
            const sched = r.schedule.find(s => s.title.toLowerCase().includes(q) || s.organizer.toLowerCase().includes(q));
            matchReason = sched?.organizer.toLowerCase().includes(q)
              ? `Dosen: ${sched?.organizer}`
              : `Mata Kuliah: ${sched?.title}`;
          } else if (r.description && r.description.toLowerCase().includes(q)) {
            matched = true;
            matchReason = 'Deskripsi Ruangan';
          }

          if (matched) {
            results.push({
              ...r,
              buildingName: b.name,
              buildingCode: b.code,
              buildingShortName: b.shortName,
              floorName: f.name,
              matchReason
            });
          }
        }
      }
    }
    return results;
  },

  // Connect to Real-time Server-Sent Events
  subscribeToEvents(onEvent: (event: { type: string; data: any }) => void): () => void {
    try {
      const eventSource = new EventSource(`${API_BASE}/events`);

      eventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          onEvent(parsed);
        } catch (err) {
          // ignore parse errors
        }
      };

      return () => {
        eventSource.close();
      };
    } catch (err) {
      console.warn('EventSource not supported or server offline');
      return () => {};
    }
  },

  // Campus Profile (Universitas Siliwangi)
  async getCampusProfile(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/campus/info`);
      if (res.ok) {
        const json = await res.json();
        return json.campus;
      }
    } catch {
      // fallback
    }
    return {
      name: 'Universitas Siliwangi',
      address: 'Jl. Siliwangi No. 24, Tasikmalaya',
      buildings: ['LABTEK 1', 'FT.1']
    };
  },

  // Today's Lecture & Lab Schedules
  async getTodaySchedules(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/schedule/today`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // fallback
    }
    return [];
  },

  // Student Room Categories
  async getStudentCategories(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // fallback
    }
    return [];
  },

  // IoT Beacons API
  async getIotBeacons(buildingId?: string, floorNumber?: number): Promise<any[]> {
    try {
      let url = `${API_BASE}/iot/beacons`;
      const params = new URLSearchParams();
      if (buildingId) params.append('buildingId', buildingId);
      if (floorNumber) params.append('floorNumber', String(floorNumber));
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // fallback
    }
    return [];
  },

  // Calculate Navigation Route (Turn-by-turn guidance)
  async calculateNavigationRoute(fromX: number, fromY: number, targetRoomId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/navigation/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromX, fromY, targetRoomId })
      });
      if (res.ok) {
        const json = await res.json();
        return json.navigation;
      }
    } catch {
      // fallback
    }
    return null;
  },

  // Update IoT Environmental Sensor Telemetry
  async updateIotTelemetry(roomId: string, data: { temperature?: number; currentOccupancy?: number; status?: RoomStatus }): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/iot/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, ...data })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ========================================================
  // 🎧 LAYANAN CUSTOMER SERVICE (CS) & PENGADUAN KAMPUS
  // ========================================================

  // Ambil daftar tiket CS dari Backend
  async getCsTickets(category?: string, status?: string): Promise<CsTicket[]> {
    try {
      let url = `${API_BASE}/cs/tickets`;
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (status && status !== 'all') params.append('status', status);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch {
      // Local fallback for offline/gh-pages
      try {
        const local = localStorage.getItem('smartspace_cs_tickets');
        if (local) return JSON.parse(local);
      } catch {}
    }
    return [
      {
        id: 'CS-1001',
        senderName: 'Dimas Aditya',
        senderEmail: 'dimas.aditya@student.ac.id',
        senderRole: 'student',
        category: 'Sarana & Fasilitas',
        roomCode: 'A-102',
        subject: 'Proyektor Lab Pemrograman redup',
        message: 'Kabel HDMI proyektor di Lab Pemrograman Lantai 1 agak longgar sehingga gambar berkedip saat praktikum.',
        status: 'in_progress',
        adminResponse: 'Tim teknisi sarpras IT sedang menuju lokasi untuk pengecekan kabel proyektor.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];
  },

  // Kirim tiket pengaduan / pesan baru ke Layanan CS Backend
  async createCsTicket(ticketData: {
    senderName: string;
    senderEmail?: string;
    senderRole?: string;
    category: string;
    roomCode?: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; message: string; data?: CsTicket }> {
    try {
      const res = await fetch(`${API_BASE}/cs/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (err: any) {
      console.warn('Backend offline, saving CS ticket locally:', err.message);
    }

    // Fallback: simpan di localStorage jika backend offline
    const newTicket: CsTicket = {
      id: `CS-${Math.floor(1000 + Math.random() * 9000)}`,
      senderName: ticketData.senderName,
      senderEmail: ticketData.senderEmail || 'tamu@unsil.ac.id',
      senderRole: (ticketData.senderRole as any) || 'student',
      category: ticketData.category,
      roomCode: ticketData.roomCode || '-',
      subject: ticketData.subject,
      message: ticketData.message,
      status: 'pending',
      adminResponse: 'Tiket berhasil diterima sistem lokal. Menunggu sinkronisasi ke server Node.js.',
      createdAt: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('smartspace_cs_tickets') || '[]');
      existing.unshift(newTicket);
      localStorage.setItem('smartspace_cs_tickets', JSON.stringify(existing));
    } catch {}

    return {
      success: true,
      message: `Tiket bantuan #${newTicket.id} berhasil dicatat di Layanan CS (Mode Offline).`,
      data: newTicket
    };
  },

  // Update status tiket CS (oleh admin)
  async updateCsTicketStatus(ticketId: string, status: string, adminResponse?: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/cs/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminResponse })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { success: false };
  }
};
