import { getDb } from '../config/db.js';

let fallbackVisits = 0;

export const recordVisit = async (_req, res) => {
  const db = getDb();
  if (db) {
    try {
      await db.query('INSERT INTO `campus_visits` (`visited_at`) VALUES (CURRENT_TIMESTAMP)');
      const [[row]] = await db.query('SELECT COUNT(*) AS total FROM `campus_visits`');
      return res.status(200).json({ success: true, totalVisits: Number(row.total), source: 'database' });
    } catch (error) {
      console.error('Gagal menyimpan kunjungan:', error);
    }
  }
  fallbackVisits += 1;
  return res.status(200).json({ success: true, totalVisits: fallbackVisits, source: 'memory' });
};
