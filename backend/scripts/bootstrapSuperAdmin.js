import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getDb, initDatabase } from '../config/db.js';

const name = process.env.SUPER_ADMIN_NAME?.trim();
const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SUPER_ADMIN_PASSWORD;

if (!name || !email || !password || password.length < 6) {
  console.error('Atur SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, dan SUPER_ADMIN_PASSWORD (minimal 6 karakter) sebelum menjalankan bootstrap.');
  process.exit(1);
}

try {
  await initDatabase();
  const db = getDb();
  if (!db) throw new Error('Database MySQL tidak dapat diakses.');
  const [[existingSuperAdmin]] = await db.query("SELECT id FROM users WHERE role = 'super_admin' LIMIT 1");
  if (existingSuperAdmin) throw new Error('Super Admin sudah tersedia. Bootstrap awal tidak dijalankan.');

  const passwordHash = await bcrypt.hash(password, 12);
  const [[existingAccount]] = await db.query('SELECT id, role FROM users WHERE email = ? LIMIT 1', [email]);
  let id;
  if (existingAccount) {
    if (existingAccount.role !== 'admin') throw new Error('Email tersebut sudah dipakai akun non-admin.');
    id = existingAccount.id;
    await db.query("UPDATE users SET name = ?, password = ?, role = 'super_admin' WHERE id = ?", [name, passwordHash, id]);
  } else {
    id = `usr-${randomUUID()}`;
    await db.query("INSERT INTO users (id, name, email, password, role, department) VALUES (?, ?, ?, ?, 'super_admin', 'Administrasi Sistem')", [id, name, email, passwordHash]);
  }
  await db.query(
    "INSERT INTO admin_activity_logs (actor_id, target_user_id, action, details) VALUES (?, ?, 'super_admin_bootstrap', 'Super Admin pertama dibuat')",
    [id, id]
  );
  console.log(`Super Admin siap: ${email}. Hapus variabel SUPER_ADMIN_PASSWORD dari environment setelah bootstrap.`);
  await db.end();
} catch (error) {
  console.error(error.message || error);
  const db = getDb();
  if (db) await db.end().catch(() => {});
  process.exitCode = 1;
}
