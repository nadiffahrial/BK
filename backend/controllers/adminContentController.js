import { getDb } from '../config/db.js';
import { state } from '../store.js';

let fallbackBuildings = null;

export const getAdminBuildings = async (_req, res) => {
  const db = getDb();
  if (db) {
    try {
      const [rows] = await db.query('SELECT `content_json` FROM `campus_content` WHERE `content_key` = ?', ['buildings']);
      if (rows.length) return res.json({ success: true, data: typeof rows[0].content_json === 'string' ? JSON.parse(rows[0].content_json) : rows[0].content_json });
    } catch (error) { console.error('Gagal memuat perubahan admin:', error); }
  }
  res.json({ success: true, data: fallbackBuildings });
};

export const saveAdminBuildings = async (req, res) => {
  const buildings = req.body?.buildings;
  if (!Array.isArray(buildings)) return res.status(400).json({ success: false, message: 'Data gedung tidak valid.' });
  const db = getDb();
  if (db) {
    try {
      await db.query('INSERT INTO `campus_content` (`content_key`, `content_json`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `content_json` = VALUES(`content_json`)', ['buildings', JSON.stringify(buildings)]);
    } catch (error) {
      console.error('Gagal menyimpan perubahan admin:', error);
      return res.status(500).json({ success: false, message: 'Perubahan gagal disimpan ke database.' });
    }
  }
  fallbackBuildings = buildings;
  state.buildings = buildings;
  res.json({ success: true, data: buildings });
};
