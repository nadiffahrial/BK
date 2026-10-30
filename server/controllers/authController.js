import { getDb } from '../config/db.js';

const DEMO_USERS = {
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

export const login = async (req, res) => {
  const { email, password, role, isQuickDemo } = req.body;
  const db = getDb();

  // 1. If explicit quick demo is requested (or role is provided without email)
  if ((isQuickDemo || !email) && role && DEMO_USERS[role]) {
    return res.status(200).json({
      success: true,
      message: 'Login demo berhasil',
      user: DEMO_USERS[role],
      token: `token-demo-${role}-${Date.now()}`
    });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email atau username akun wajib diisi'
    });
  }

  const cleanEmail = email.trim();

  // 2. Query MySQL users table
  if (db) {
    try {
      const [users] = await db.query('SELECT * FROM `users` WHERE email = ?', [cleanEmail]);
      if (users.length > 0) {
        const u = users[0];
        return res.status(200).json({
          success: true,
          source: 'MySQL (XAMPP smartspace_db.users)',
          message: 'Login berhasil via database MySQL',
          user: {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            department: u.department,
            avatarUrl: u.avatar_url
          },
          token: `token-${Date.now()}`
        });
      }
    } catch (err) {
      console.error('MySQL auth error:', err);
    }
  }

  // 3. Dynamic User Fallback for custom emails
  const cleanName = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail;
  const user = {
    id: `usr-${Date.now()}`,
    name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
    email: cleanEmail,
    role: role || 'student',
    department: role === 'admin' ? 'Direktorat Sarpras & IT' : role === 'staff' ? 'Dosen / Pengajar' : 'Mahasiswa',
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`
  };

  return res.status(200).json({
    success: true,
    message: 'Login berhasil',
    user,
    token: `token-${Date.now()}`
  });
};
