import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role?: User['role'], name?: string) => Promise<boolean>;
  quickLogin: (role: User['role']) => void;
  logout: () => void;
}

const DEMO_USERS: Record<User['role'], User> = {
  admin: {
    id: 'usr-admin',
    name: 'Ir. Hendra Pratama, M.Kom',
    email: 'admin.kampus@smartspace.ac.id',
    role: 'admin',
    department: 'Direktorat Sarana Prasarana & IT',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  staff: {
    id: 'usr-staff',
    name: 'Dr. Ir. Budi Santoso, M.Kom',
    email: 'budi.santoso@dosen.ac.id',
    role: 'staff',
    department: 'Dosen Informatika & Koordinator Lab AI',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  student: {
    id: 'usr-student',
    name: 'Dimas Aditya (21040101)',
    email: 'dimas.aditya@student.ac.id',
    role: 'student',
    department: 'S1 Teknik Informatika 2023',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'
  },
  guest: {
    id: 'usr-guest',
    name: 'Tamu / Delegasi Kampus',
    email: 'tamu@external-visitor.com',
    role: 'guest',
    department: 'Pengunjung Publik',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartspace_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('smartspace_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smartspace_user');
    }
  }, [user]);

  const login = async (email: string, role: User['role'] = 'staff', name?: string): Promise<boolean> => {
    try {
      const res = await apiService.login(email, role);
      if (name) res.user.name = name;
      setUser(res.user);
      return true;
    } catch {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: name || email.split('@')[0].toUpperCase(),
        email,
        role,
        department: role === 'admin' ? 'Direktorat Sarpras' : role === 'student' ? 'Mahasiswa' : 'Staff Fakultas',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
      };
      setUser(newUser);
      return true;
    }
  };

  const quickLogin = (role: User['role']) => {
    setUser(DEMO_USERS[role]);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        quickLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
