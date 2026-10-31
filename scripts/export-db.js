import { initDatabase } from '../server/config/db.js';
import fs from 'fs';
import path from 'path';

async function exportSql() {
  const pool = await initDatabase();
  if (!pool) {
    console.error('Failed to connect to database');
    process.exit(1);
  }

  const tables = ['users', 'buildings', 'floors', 'rooms', 'room_facilities', 'room_schedules', 'bookings', 'cs_tickets'];

  let sql = '-- ============================================================\n';
  sql += '-- SmartCampus 3D Universitas Siliwangi Database Export\n';
  sql += '-- Database: smartspace_db\n';
  sql += '-- Server: MariaDB / MySQL (XAMPP phpMyAdmin)\n';
  sql += '-- Gedung: LABTEK 1 & FT.1\n';
  sql += '-- Generated At: ' + new Date().toISOString() + '\n';
  sql += '-- ============================================================\n\n';
  sql += 'CREATE DATABASE IF NOT EXISTS `smartspace_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n';
  sql += 'USE `smartspace_db`;\n\n';
  sql += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

  for (const t of tables) {
    const [createRes] = await pool.query(`SHOW CREATE TABLE \`${t}\``);
    sql += '-- ------------------------------------------------------------\n';
    sql += `-- Struktur Tabel: ${t}\n`;
    sql += '-- ------------------------------------------------------------\n';
    sql += `DROP TABLE IF EXISTS \`${t}\`;\n`;
    sql += createRes[0]['Create Table'] + ';\n\n';

    const [rows] = await pool.query(`SELECT * FROM \`${t}\``);
    if (rows.length > 0) {
      sql += `-- Data Tabel: ${t} (${rows.length} baris)\n`;
      const cols = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
      for (const r of rows) {
        const vals = Object.values(r).map(v => {
          if (v === null) return 'NULL';
          if (typeof v === 'number') return v;
          if (typeof v === 'boolean') return v ? 1 : 0;
          if (typeof v === 'object') return pool.escape(JSON.stringify(v));
          return pool.escape(String(v));
        }).join(', ');
        sql += `INSERT INTO \`${t}\` (${cols}) VALUES (${vals});\n`;
      }
      sql += '\n';
    }
  }

  sql += 'SET FOREIGN_KEY_CHECKS = 1;\n';
  sql += '-- Selesai.\n';

  const dir = path.resolve('database');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'smartspace_db.sql'), sql, 'utf8');

  console.log(`✅ File database/smartspace_db.sql berhasil dibuat (${sql.length} bytes)`);
  await pool.end();
}

exportSql().catch(err => {
  console.error('Error exporting SQL:', err);
  process.exit(1);
});

