import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const exportDb = async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smartspace_db',
    port: Number(process.env.DB_PORT) || 3306
  });

  let sql = `-- ========================================================\n`;
  sql += `-- Database Schema & Initial Data for SmartCampus 3D\n`;
  sql += `-- 2 Gedung Universitas & Masing-Masing 2 Tingkat (24 Ruangan)\n`;
  sql += `-- Compatible with XAMPP (MySQL / MariaDB) & phpMyAdmin\n`;
  sql += `-- Generated on ${new Date().toISOString()}\n`;
  sql += `-- ========================================================\n\n`;
  sql += `CREATE DATABASE IF NOT EXISTS \`smartspace_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
  sql += `USE \`smartspace_db\`;\n\n`;
  sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

  const tables = ['users', 'buildings', 'floors', 'rooms', 'room_facilities', 'room_schedules', 'bookings'];

  for (const table of tables) {
    const [createRes] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
    sql += `-- --------------------------------------------------------\n`;
    sql += `-- Table structure for \`${table}\`\n`;
    sql += `-- --------------------------------------------------------\n`;
    sql += `DROP TABLE IF EXISTS \`${table}\`;\n`;
    sql += createRes[0]['Create Table'] + `;\n\n`;

    const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
    if (rows.length > 0) {
      sql += `-- Dumping data for table \`${table}\` (${rows.length} rows)\n`;
      sql += `INSERT INTO \`${table}\` VALUES \n`;
      const valStrings = rows.map(row => {
        const vals = Object.values(row).map(val => {
          if (val === null) return 'NULL';
          if (typeof val === 'number') return val;
          if (typeof val === 'boolean') return val ? 1 : 0;
          if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "\\'")}'`;
          return `'${String(val).replace(/'/g, "\\'")}'`;
        });
        return `(${vals.join(', ')})`;
      });
      sql += valStrings.join(',\n') + `;\n\n`;
    }
  }

  sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

  fs.writeFileSync('database/smartspace_db.sql', sql, 'utf8');
  console.log(`Database exported successfully to database/smartspace_db.sql!`);
  await conn.end();
};

exportDb().catch(console.error);

