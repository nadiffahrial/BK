import {
  authenticateToken,
  authorizeRoles
} from '../middleware/authMiddleware.js';
import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { getAllBuildings, getBuildingById, getBuildingFloors } from '../controllers/buildingController.js';
import { getAllRooms, getRoomById, updateRoomStatus, getCampusStats, searchRoomsEngine } from '../controllers/roomController.js';
import { getAllBeacons, getBeaconById, locateDevicePosition, calculateNavigationRoute, updateIotTelemetry } from '../controllers/iotController.js';
import { getCampusProfile, getTodaySchedules, getStudentCategories } from '../controllers/campusController.js';
import { getAllCsTickets, createCsTicket, updateCsTicketStatus, getCsTicketMessages, sendCsTicketMessage, getVisitorCsTicketMessages, sendVisitorCsTicketMessage } from '../controllers/csController.js';
import { addClient } from '../sse.js';
import { rateLimit } from 'express-rate-limit';
import { recordVisit } from '../controllers/analyticsController.js';
import { getAdminBuildings, saveAdminBuildings, getCampusModelLabels, saveCampusModelLabels, getCsContactSettings, saveCsContactSettings, getScheduleCatalog, saveScheduleCatalog } from '../controllers/adminContentController.js';
import { createManagedAdmin, deleteManagedAdmin, getManagedAdmins, resetManagedAdminPassword, updateManagedAdminProfile } from '../controllers/superAdminController.js';

const router = Router();

router.post('/analytics/visit', recordVisit);
router.get('/admin/buildings', getAdminBuildings);
router.put('/admin/buildings', authenticateToken, authorizeRoles('admin', 'super_admin'), saveAdminBuildings);
router.get('/campus/model-labels', getCampusModelLabels);
router.put('/campus/model-labels', authenticateToken, authorizeRoles('admin', 'super_admin'), saveCampusModelLabels);
router.get('/cs/contact-settings', getCsContactSettings);
router.put('/cs/contact-settings', authenticateToken, authorizeRoles('admin', 'super_admin'), saveCsContactSettings);
router.get('/schedule/catalog', getScheduleCatalog);
router.put('/schedule/catalog', authenticateToken, authorizeRoles('admin', 'super_admin'), saveScheduleCatalog);
router.get('/super-admin/admins', authenticateToken, authorizeRoles('super_admin'), getManagedAdmins);
router.post('/super-admin/admins', authenticateToken, authorizeRoles('super_admin'), createManagedAdmin);
router.put('/super-admin/admins/:id/profile', authenticateToken, authorizeRoles('super_admin'), updateManagedAdminProfile);
router.put('/super-admin/admins/:id/password', authenticateToken, authorizeRoles('super_admin'), resetManagedAdminPassword);
router.delete('/super-admin/admins/:id', authenticateToken, authorizeRoles('super_admin'), deleteManagedAdmin);

// Rate Limit untuk Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.'
  }
});

// Rate Limit untuk Pengaduan
const csTicketLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak pengiriman pengaduan. Silakan coba lagi nanti.'
  }
});

const csChatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak aktivitas chat. Silakan tunggu sebentar.' }
});

// 1. Healthcheck & Service Status
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'SmartCampus Universitas Siliwangi Backend API',
    institution: 'Universitas Siliwangi (UNSIL)',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// 2. Real-time SSE Stream (Live events for Room Status, IoT Telemetry, CS Notifications, & Beacons)
router.get('/events', addClient);

// 3. Authentication
router.post('/auth/login', loginLimiter, login);

// 4. Campus Profile & Information (Universitas Siliwangi)
router.get('/campus/info', getCampusProfile);
router.get('/campus/profile', getCampusProfile);
router.get('/schedule/today', getTodaySchedules);
router.get('/categories', getStudentCategories);

// 5. Buildings
router.get('/buildings', getAllBuildings);
router.get('/buildings/:id', getBuildingById);
router.get('/buildings/:id/floors', getBuildingFloors);

// 6. Universal Search Engine
router.get('/search', searchRoomsEngine);

// 7. Rooms
router.get('/rooms', getAllRooms);
router.get('/rooms/:id', getRoomById);
router.patch(
  '/rooms/:id/status',
  authenticateToken,
  authorizeRoles('admin', 'super_admin'),
  updateRoomStatus
);

// 8. Indoor Positioning System APIs
router.get('/iot/beacons', getAllBeacons);
router.get('/iot/beacons/:id', getBeaconById);
router.post('/iot/locate', locateDevicePosition);
router.post('/navigation/route', calculateNavigationRoute);
router.post('/iot/telemetry', updateIotTelemetry);

// 10. Layanan Customer Service (CS) & Pengaduan Kampus
router.get(
  '/cs/tickets',
  authenticateToken,
  authorizeRoles('admin', 'super_admin'),
  getAllCsTickets
);

router.post('/cs/tickets', csTicketLimiter, createCsTicket);

// Visitor chat uses a per-ticket capability token returned only to the ticket creator.
router.get('/cs/public/tickets/:id/messages', csChatLimiter, getVisitorCsTicketMessages);
router.post('/cs/public/tickets/:id/messages', csChatLimiter, sendVisitorCsTicketMessage);

router.patch(
  '/cs/tickets/:id/status',
  authenticateToken,
  authorizeRoles('admin', 'super_admin'),
  updateCsTicketStatus
);

router.get(
  '/cs/tickets/:id/messages',
  authenticateToken,
  authorizeRoles('admin', 'super_admin'),
  getCsTicketMessages
);
router.post(
  '/cs/tickets/:id/messages',
  authenticateToken,
  authorizeRoles('admin', 'super_admin'),
  sendCsTicketMessage
);

// 11. Campus Statistics
router.get('/stats', getCampusStats);

export default router;
