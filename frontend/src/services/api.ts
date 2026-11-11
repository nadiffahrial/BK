import { Building, RoomStatus, User, SearchResultRoom, CsTicket } from '../types';
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
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login gagal.');
    }

    return {
      user: data.user,
      token: data.token
    };
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
  async updateRoomStatus(
    roomId: string,
    status: RoomStatus,
    token: string
  ): Promise<void> {
    const res = await fetch(`${API_BASE}/rooms/${roomId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Gagal memperbarui status ruangan.');
    }
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
  async getCsTickets(
    category?: string,
    status?: string,
    token?: string
  ): Promise<CsTicket[]> {
    let url = `${API_BASE}/cs/tickets`;
    const params = new URLSearchParams();

    if (category && category !== 'all') {
      params.append('category', category);
    }

    if (status && status !== 'all') {
      params.append('status', status);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error('Gagal mengambil data tiket Customer Service.');
    }

    const json = await res.json();
    return json.data || [];
  },

    // Kirim tiket pengaduan ke Backend
    async createCsTicket(ticketData: {
      senderName: string;
      senderEmail?: string;
      senderRole?: string;
      category: string;
      roomCode?: string;
      subject: string;
      message: string;
    }): Promise<{ success: boolean; message: string; data?: CsTicket }> {
      const res = await fetch(`${API_BASE}/cs/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketData)
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Gagal mengirim pengaduan.');
      }

      return json;
    },

    // Update status tiket CS (oleh admin)
    async updateCsTicketStatus(
      ticketId: string,
      status: string,
      token: string,
      adminResponse?: string
    ): Promise<any> {
      const res = await fetch(`${API_BASE}/cs/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminResponse })
      });

      if (!res.ok) {
        throw new Error('Gagal memperbarui status tiket Customer Service.');
      }

      return await res.json();
    },
  };