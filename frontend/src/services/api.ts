import { Building, RoomStatus, User, SearchResultRoom, CsTicket, CsChatMessage } from '../types';
import { BUILDINGS_DATA } from '../data/buildingsData';

const API_BASE = '/api';

export interface ManagedAdmin {
  id: string;
  name: string;
  email: string;
  department: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminActivity {
  id: number;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  actorName: string | null;
  targetName: string | null;
  targetEmail: string | null;
}

export interface CsContactSettings {
  whatsappNumber: string;
  email: string;
  officeLocation: string;
  officeHours: string;
}

export interface ScheduleCatalog {
  agendas: string[];
  lecturers: string[];
}

const superAdminRequest = async (path: string, token: string, method = 'GET', body?: unknown) => {
  const response = await fetch(`${API_BASE}/super-admin/admins${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) throw new Error(payload.message || 'Permintaan pengelolaan admin gagal.');
  return payload;
};

export const apiService = {
  async getManagedAdmins(token: string): Promise<{ admins: ManagedAdmin[]; activity: AdminActivity[] }> {
    const result = await superAdminRequest('', token);
    return result.data;
  },

  async createManagedAdmin(input: { name: string; email: string; department: string; password: string }, token: string): Promise<void> {
    await superAdminRequest('', token, 'POST', input);
  },

  async updateManagedAdminProfile(id: string, input: { name: string; email: string }, token: string): Promise<void> {
    await superAdminRequest(`/${encodeURIComponent(id)}/profile`, token, 'PUT', input);
  },

  async resetManagedAdminPassword(id: string, password: string, token: string): Promise<void> {
    await superAdminRequest(`/${encodeURIComponent(id)}/password`, token, 'PUT', { password });
  },

  async deleteManagedAdmin(id: string, token: string): Promise<void> {
    await superAdminRequest(`/${encodeURIComponent(id)}`, token, 'DELETE');
  },

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

  async getAdminBuildings(): Promise<Building[] | null> {
    try {
      const res = await fetch(`${API_BASE}/admin/buildings`);
      if (!res.ok) return null;
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : null;
    } catch { return null; }
  },

  async saveAdminBuildings(buildings: Building[], token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/buildings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ buildings })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Perubahan gagal disimpan ke server.');
    }
  },

  async getCampusModelLabels(): Promise<Record<string, string> | null> {
    try {
      const res = await fetch(`${API_BASE}/campus/model-labels`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data && typeof json.data === 'object' && !Array.isArray(json.data) ? json.data : null;
    } catch { return null; }
  },

  async saveCampusModelLabels(labels: Record<string, string>, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/campus/model-labels`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ labels })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Label gedung gagal disimpan ke server.');
    }
  },

  async getCsContactSettings(): Promise<CsContactSettings | null> {
    try {
      const res = await fetch(`${API_BASE}/cs/contact-settings`);
      if (!res.ok) return null;
      const json = await res.json();
      const data = json.data;
      return data && typeof data === 'object' && !Array.isArray(data) ? data as CsContactSettings : null;
    } catch { return null; }
  },

  async saveCsContactSettings(settings: CsContactSettings, token: string): Promise<CsContactSettings> {
    const res = await fetch(`${API_BASE}/cs/contact-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ settings })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Kontak CS gagal disimpan.');
    return data.data as CsContactSettings;
  },

  async getScheduleCatalog(): Promise<ScheduleCatalog | null> {
    try {
      const res = await fetch(`${API_BASE}/schedule/catalog`);
      if (!res.ok) return null;
      const json = await res.json();
      const data = json.data;
      return data && Array.isArray(data.agendas) && Array.isArray(data.lecturers) ? data as ScheduleCatalog : null;
    } catch { return null; }
  },

  async saveScheduleCatalog(catalog: ScheduleCatalog, token: string): Promise<ScheduleCatalog> {
    const res = await fetch(`${API_BASE}/schedule/catalog`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ catalog })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Katalog jadwal gagal disimpan.');
    return data.data as ScheduleCatalog;
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

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Gagal mengambil data tiket Customer Service.');
    }

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
    }): Promise<{ success: boolean; message: string; data?: CsTicket; chatAccessToken?: string }> {
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

    async getCsTicketMessages(ticketId: string, token: string): Promise<CsChatMessage[]> {
      const res = await fetch(`${API_BASE}/cs/tickets/${encodeURIComponent(ticketId)}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal mengambil percakapan tiket.');
      return json.data || [];
    },

    async sendCsTicketMessage(ticketId: string, message: string, token: string): Promise<CsChatMessage> {
      const res = await fetch(`${API_BASE}/cs/tickets/${encodeURIComponent(ticketId)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal mengirim pesan.');
      return json.data;
    },

    async getVisitorCsTicketMessages(ticketId: string, accessToken: string): Promise<CsChatMessage[]> {
      const res = await fetch(`${API_BASE}/cs/public/tickets/${encodeURIComponent(ticketId)}/messages`, {
        headers: { 'X-CS-Ticket-Access': accessToken }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal mengambil percakapan tiket.');
      return json.data || [];
    },

    async sendVisitorCsTicketMessage(ticketId: string, message: string, accessToken: string): Promise<CsChatMessage> {
      const res = await fetch(`${API_BASE}/cs/public/tickets/${encodeURIComponent(ticketId)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CS-Ticket-Access': accessToken },
        body: JSON.stringify({ message })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal mengirim pesan.');
      return json.data;
    },
  };
