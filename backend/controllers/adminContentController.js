import { getDb } from '../config/db.js';
import { state } from '../store.js';
import { broadcastEvent } from '../sse.js';

let fallbackBuildings = null;
let fallbackCampusModelLabels = null;
let fallbackCsContactSettings = null;
let fallbackScheduleCatalog = null;

export const getScheduleCatalog = async (_req, res) => {
  const db = getDb();
  if (db) {
    try {
      const [rows] = await db.query('SELECT `content_json` FROM `campus_content` WHERE `content_key` = ?', ['schedule_catalog']);
      if (rows.length) {
        const catalog = typeof rows[0].content_json === 'string' ? JSON.parse(rows[0].content_json) : rows[0].content_json;
        return res.json({ success: true, data: catalog });
      }
    } catch (error) {
      console.error('Gagal memuat katalog jadwal:', error);
      return res.status(500).json({ success: false, message: 'Katalog jadwal gagal dimuat.' });
    }
  }
  return res.json({ success: true, data: fallbackScheduleCatalog });
};

export const saveScheduleCatalog = async (req, res) => {
  const input = req.body?.catalog;
  const cleanList = value => Array.isArray(value)
    ? [...new Set(value.filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean))]
    : null;
  const agendas = cleanList(input?.agendas);
  const lecturers = cleanList(input?.lecturers);
  if (!input || typeof input !== 'object' || Array.isArray(input) || !agendas || !lecturers || agendas.length > 300 || lecturers.length > 300 || [...agendas, ...lecturers].some(value => value.length > 120)) {
    return res.status(400).json({ success: false, message: 'Data mata kuliah atau dosen tidak valid.' });
  }
  const catalog = { agendas, lecturers };
  const db = getDb();
  if (db) {
    try {
      await db.query(
        'INSERT INTO `campus_content` (`content_key`, `content_json`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `content_json` = VALUES(`content_json`)',
        ['schedule_catalog', JSON.stringify(catalog)]
      );
    } catch (error) {
      console.error('Gagal menyimpan katalog jadwal:', error);
      return res.status(500).json({ success: false, message: 'Katalog jadwal gagal disimpan ke database.' });
    }
  }
  fallbackScheduleCatalog = catalog;
  broadcastEvent('SCHEDULE_CATALOG_UPDATED', { catalog });
  return res.json({ success: true, data: catalog });
};

export const getCsContactSettings = async (_req, res) => {
  const db = getDb();
  if (db) {
    try {
      const [rows] = await db.query('SELECT `content_json` FROM `campus_content` WHERE `content_key` = ?', ['cs_contacts']);
      if (rows.length) {
        const settings = typeof rows[0].content_json === 'string' ? JSON.parse(rows[0].content_json) : rows[0].content_json;
        return res.json({ success: true, data: settings });
      }
    } catch (error) {
      console.error('Gagal memuat kontak Layanan CS:', error);
      return res.status(500).json({ success: false, message: 'Kontak Layanan CS gagal dimuat.' });
    }
  }
  return res.json({ success: true, data: fallbackCsContactSettings });
};

export const saveCsContactSettings = async (req, res) => {
  const input = req.body?.settings;
  const fields = ['whatsappNumber', 'email', 'officeLocation', 'officeHours'];
  if (!input || typeof input !== 'object' || Array.isArray(input) || fields.some(field => typeof input[field] !== 'string' || !input[field].trim() || input[field].trim().length > 180)) {
    return res.status(400).json({ success: false, message: 'Lengkapi kontak CS dengan benar (maksimal 180 karakter per kolom).' });
  }
  const settings = Object.fromEntries(fields.map(field => [field, input[field].trim()]));
  if (!/^[+\d\s().-]{8,32}$/.test(settings.whatsappNumber) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
    return res.status(400).json({ success: false, message: 'Nomor WhatsApp atau alamat email tidak valid.' });
  }

  const db = getDb();
  if (db) {
    try {
      await db.query(
        'INSERT INTO `campus_content` (`content_key`, `content_json`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `content_json` = VALUES(`content_json`)',
        ['cs_contacts', JSON.stringify(settings)]
      );
    } catch (error) {
      console.error('Gagal menyimpan kontak Layanan CS:', error);
      return res.status(500).json({ success: false, message: 'Kontak CS gagal disimpan ke database.' });
    }
  }
  fallbackCsContactSettings = settings;
  broadcastEvent('CS_CONTACTS_UPDATED', { settings });
  return res.json({ success: true, data: settings });
};

export const getCampusModelLabels = async (_req, res) => {
  const db = getDb();
  if (db) {
    try {
      const [rows] = await db.query('SELECT `content_json` FROM `campus_content` WHERE `content_key` = ?', ['campus_model_labels']);
      if (rows.length) {
        const labels = typeof rows[0].content_json === 'string' ? JSON.parse(rows[0].content_json) : rows[0].content_json;
        return res.json({ success: true, data: labels });
      }
    } catch (error) {
      console.error('Gagal memuat label model kampus:', error);
      return res.status(500).json({ success: false, message: 'Label model kampus gagal dimuat.' });
    }
  }
  return res.json({ success: true, data: fallbackCampusModelLabels });
};

export const saveCampusModelLabels = async (req, res) => {
  const input = req.body?.labels;
  const allowedIds = new Set(['gedung-ft3', 'gedung-lt3', 'gedung-b', 'gedung-ft2', 'gedung-a', 'gedung-lt2', 'dekanat-ft']);
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return res.status(400).json({ success: false, message: 'Data label gedung tidak valid.' });
  }
  const labels = {};
  for (const [id, value] of Object.entries(input)) {
    if (!allowedIds.has(id) || typeof value !== 'string' || !value.trim() || value.trim().length > 48) {
      return res.status(400).json({ success: false, message: 'Setiap label gedung harus berisi maksimal 48 karakter.' });
    }
    labels[id] = value.trim();
  }
  if (!Object.keys(labels).length) return res.status(400).json({ success: false, message: 'Tidak ada label gedung untuk disimpan.' });

  const db = getDb();
  if (db) {
    try {
      await db.query(
        'INSERT INTO `campus_content` (`content_key`, `content_json`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `content_json` = VALUES(`content_json`)',
        ['campus_model_labels', JSON.stringify(labels)]
      );
    } catch (error) {
      console.error('Gagal menyimpan label model kampus:', error);
      return res.status(500).json({ success: false, message: 'Label gedung gagal disimpan ke database.' });
    }
  }
  fallbackCampusModelLabels = labels;
  broadcastEvent('CAMPUS_MODEL_LABELS_UPDATED', { labels });
  return res.json({ success: true, data: labels });
};

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
  broadcastEvent('ADMIN_BUILDINGS_UPDATED', { buildings });
  res.json({ success: true, data: buildings });
};
