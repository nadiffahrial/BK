import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { getAllBuildings, getBuildingById, getBuildingFloors } from '../controllers/buildingController.js';
import { getAllRooms, getRoomById, updateRoomStatus, getCampusStats, searchRoomsEngine } from '../controllers/roomController.js';
import { getAllBookings, createBooking, cancelBooking } from '../controllers/bookingController.js';
import { getAllBeacons, getBeaconById, locateDevicePosition, calculateNavigationRoute, updateIotTelemetry } from '../controllers/iotController.js';
import { getCampusProfile, getTodaySchedules, getStudentCategories } from '../controllers/campusController.js';
import { addClient } from '../sse.js';

const router = Router();

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

// 2. Real-time SSE Stream (Live events for Room Status, IoT Telemetry, & Beacons)
router.get('/events', addClient);

// 3. Authentication
router.post('/auth/login', login);

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
router.patch('/rooms/:id/status', updateRoomStatus);

// 8. 🛰️ IoT GPS & Indoor Positioning System APIs (BARU)
router.get('/iot/beacons', getAllBeacons);
router.get('/iot/beacons/:id', getBeaconById);
router.post('/iot/locate', locateDevicePosition);
router.post('/navigation/route', calculateNavigationRoute);
router.post('/iot/telemetry', updateIotTelemetry);

// 9. Bookings (Backend compatibility)
router.get('/bookings', getAllBookings);
router.post('/bookings', createBooking);
router.delete('/bookings/:id', cancelBooking);

// 10. Campus Statistics
router.get('/stats', getCampusStats);

export default router;
