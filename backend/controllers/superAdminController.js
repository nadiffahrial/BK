import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getDb } from '../config/db.js';

const audit = async (db, req, action, targetId, details) => {
  try {
    await db.query(
      'INSERT INTO admin_activity_logs (actor_id, target_user_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, targetId || null, action, details || null, req.ip || null]
    );
  } catch (error) {
    console.error('Gagal mencatat aktivitas Super Admin:', error.message);
  }
};

const validEmail = value => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const getManagedAdmins = async (req, res) => {
  try {
    const db = getDb();
    const [admins] = await db.query(`
      SELECT u.id, u.name, u.email, u.department, u.created_at AS createdAt,
        MAX(CASE WHEN l.action = 'login' THEN l.created_at END) AS lastLoginAt
      FROM users u
      LEFT JOIN admin_activity_logs l ON l.actor_id = u.id
      WHERE u.role = 'admin'
      GROUP BY u.id, u.name, u.email, u.department, u.created_at
      ORDER BY u.created_at DESC
    `);
    const [activity] = await db.query(`
      SELECT l.id, l.action, l.details, l.ip_address AS ipAddress,
        l.created_at AS createdAt, actor.name AS actorName,
        target.name AS targetName, target.email AS targetEmail
      FROM admin_activity_logs l
      LEFT JOIN users actor ON actor.id = l.actor_id
      LEFT JOIN users target ON target.id = l.target_user_id
      ORDER BY l.created_at DESC
      LIMIT 50
    `);
    return res.json({ success: true, data: { admins, activity } });
  } catch (error) {
    console.error('Gagal mengambil daftar admin:', error);
    return res.status(500).json({ success: false, message: 'Daftar admin gagal dimuat.' });
  }
};

export const createManagedAdmin = async (req, res) => {
  const { name, email, department, password } = req.body || {};
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 150 || !validEmail(email) ||
      typeof password !== 'string' || password.length < 10 || password.length > 128 ||
      (department != null && (typeof department !== 'string' || department.length > 150))) {
    return res.status(400).json({ success: false, message: 'Nama, email valid, dan kata sandi minimal 10 karakter wajib diisi.' });
  }

  try {
    const db = getDb();
    const normalizedEmail = email.trim().toLowerCase();
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Email tersebut sudah digunakan.' });
    const id = `usr-${randomUUID()}`;
    const passwordHash = await bcrypt.hash(password, 12);
    await db.query(
      'INSERT INTO users (id, name, email, password, role, department) VALUES (?, ?, ?, ?, \'admin\', ?)',
      [id, name.trim(), normalizedEmail, passwordHash, department?.trim() || null]
    );
    await audit(db, req, 'admin_created', id, `Akun admin ${normalizedEmail} dibuat`);
    return res.status(201).json({ success: true, message: 'Akun admin berhasil dibuat.', data: { id, name: name.trim(), email: normalizedEmail, department: department?.trim() || null } });
  } catch (error) {
    console.error('Gagal membuat akun admin:', error);
    return res.status(500).json({ success: false, message: 'Akun admin gagal dibuat.' });
  }
};

export const resetManagedAdminPassword = async (req, res) => {
  const { password } = req.body || {};
  if (typeof password !== 'string' || password.length < 10 || password.length > 128) {
    return res.status(400).json({ success: false, message: 'Kata sandi baru harus terdiri dari 10–128 karakter.' });
  }
  try {
    const db = getDb();
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await db.query('UPDATE users SET password = ? WHERE id = ? AND role = \'admin\'', [passwordHash, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Akun admin tidak ditemukan.' });
    await audit(db, req, 'admin_password_reset', req.params.id, 'Kata sandi admin direset');
    return res.json({ success: true, message: 'Kata sandi admin berhasil direset.' });
  } catch (error) {
    console.error('Gagal mereset kata sandi admin:', error);
    return res.status(500).json({ success: false, message: 'Kata sandi gagal direset.' });
  }
};

export const deleteManagedAdmin = async (req, res) => {
  try {
    const db = getDb();
    const [admins] = await db.query('SELECT id, email FROM users WHERE id = ? AND role = \'admin\' LIMIT 1', [req.params.id]);
    if (!admins.length) return res.status(404).json({ success: false, message: 'Akun admin tidak ditemukan.' });
    await db.query('DELETE FROM users WHERE id = ? AND role = \'admin\'', [req.params.id]);
    await audit(db, req, 'admin_deleted', req.params.id, `Akun admin ${admins[0].email} dihapus`);
    return res.json({ success: true, message: 'Akun admin berhasil dihapus.' });
  } catch (error) {
    console.error('Gagal menghapus akun admin:', error);
    return res.status(500).json({ success: false, message: 'Akun admin gagal dihapus.' });
  }
};
