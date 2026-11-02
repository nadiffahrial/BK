import { state, findRoomById } from '../store.js';
import { getDb } from '../config/db.js';
import { broadcastEvent } from '../sse.js';

// Base coordinates for Universitas Siliwangi
const UNSIL_LAT = -7.348611;
const UNSIL_LNG = 108.224167;

export const IOT_BEACONS_DATA = [
  // Gedung LABTEK 1 - Tingkat 1
  {
    id: 'UNSIL-BCN-01',
    name: 'IoT Anchor Lobby Barat & Pintu Utama',
    buildingId: 'gedung-a',
    floorNumber: 1,
    x: 90,
    y: 250,
    latitude: UNSIL_LAT + 0.00001,
    longitude: UNSIL_LNG - 0.00002,
    rssi: -52,
    txPower: -59,
    zone: 'Lobby Utama & Gerbang Barat',
    macAddress: 'F2:4A:BC:01:A1:01',
    status: 'ACTIVE'
  },
  {
    id: 'UNSIL-BCN-02',
    name: 'IoT Anchor Tangga Sentral & BAAK',
    buildingId: 'gedung-a',
    floorNumber: 1,
    x: 280,
    y: 250,
    latitude: UNSIL_LAT + 0.000015,
    longitude: UNSIL_LNG - 0.00001,
    rssi: -58,
    txPower: -59,
    zone: 'Akses Tangga Sentral & Layanan BAAK',
    macAddress: 'F2:4A:BC:01:A1:02',
    status: 'ACTIVE'
  },
  {
    id: 'UNSIL-BCN-03',
    name: 'IoT Anchor Selasar Koridor Tengah',
    buildingId: 'gedung-a',
    floorNumber: 1,
    x: 480,
    y: 250,
    latitude: UNSIL_LAT + 0.00002,
    longitude: UNSIL_LNG,
    rssi: -61,
    txPower: -59,
    zone: 'Selasar Koridor Tengah Lt. 1',
    macAddress: 'F2:4A:BC:01:A1:03',
    status: 'ACTIVE'
  },
  {
    id: 'UNSIL-BCN-04',
    name: 'IoT Anchor Sayap Timur (Amfiteater)',
    buildingId: 'gedung-a',
    floorNumber: 1,
    x: 750,
    y: 250,
    latitude: UNSIL_LAT + 0.000025,
    longitude: UNSIL_LNG + 0.000015,
    rssi: -66,
    txPower: -59,
    zone: 'Sayap Timur & Ruang Amfiteater',
    macAddress: 'F2:4A:BC:01:A1:04',
    status: 'ACTIVE'
  },

  // Gedung LABTEK 1 - Tingkat 2
  {
    id: 'UNSIL-BCN-05',
    name: 'IoT Anchor Tangga Atas Lt. 2',
    buildingId: 'gedung-a',
    floorNumber: 2,
    x: 90,
    y: 250,
    latitude: UNSIL_LAT + 0.00001,
    longitude: UNSIL_LNG - 0.00002,
    rssi: -55,
    txPower: -59,
    zone: 'Lobby Tangga Tingkat 2',
    macAddress: 'F2:4A:BC:02:A2:01',
    status: 'ACTIVE'
  },
  {
    id: 'UNSIL-BCN-06',
    name: 'IoT Anchor Selasar Lab Komputasi Lt. 2',
    buildingId: 'gedung-a',
    floorNumber: 2,
    x: 480,
    y: 250,
    latitude: UNSIL_LAT + 0.00002,
    longitude: UNSIL_LNG,
    rssi: -59,
    txPower: -59,
    zone: 'Selasar Laboratorium Komputer & Riset AI',
    macAddress: 'F2:4A:BC:02:A2:02',
    status: 'ACTIVE'
  },

  // Gedung FT.1 - Tingkat 1 & 2
  {
    id: 'UNSIL-BCN-07',
    name: 'IoT Anchor Lobby FT.1 Dekanat',
    buildingId: 'gedung-b',
    floorNumber: 1,
    x: 90,
    y: 250,
    latitude: UNSIL_LAT + 0.0001,
    longitude: UNSIL_LNG + 0.00005,
    rssi: -54,
    txPower: -59,
    zone: 'Lobby Gedung FT.1',
    macAddress: 'F2:4A:BC:03:B1:01',
    status: 'ACTIVE'
  },
  {
    id: 'UNSIL-BCN-08',
    name: 'IoT Anchor Koridor Tengah FT.1',
    buildingId: 'gedung-b',
    floorNumber: 1,
    x: 480,
    y: 250,
    latitude: UNSIL_LAT + 0.00011,
    longitude: UNSIL_LNG + 0.00007,
    rssi: -60,
    txPower: -59,
    zone: 'Koridor Utama FT.1',
    macAddress: 'F2:4A:BC:03:B1:02',
    status: 'ACTIVE'
  }
];

// GET /api/iot/beacons
export const getAllBeacons = (req, res) => {
  const { buildingId, floorNumber } = req.query;

  let results = IOT_BEACONS_DATA;

  if (buildingId) {
    results = results.filter(b => b.buildingId === buildingId);
  }
  if (floorNumber) {
    results = results.filter(b => b.floorNumber === Number(floorNumber));
  }

  res.status(200).json({
    success: true,
    total: results.length,
    campus: 'Universitas Siliwangi',
    data: results
  });
};

// GET /api/iot/beacons/:id
export const getBeaconById = (req, res) => {
  const { id } = req.params;
  const beacon = IOT_BEACONS_DATA.find(b => b.id.toLowerCase() === id.toLowerCase());

  if (!beacon) {
    return res.status(404).json({
      success: false,
      message: `IoT Beacon dengan ID '${id}' tidak ditemukan.`
    });
  }

  res.status(200).json({
    success: true,
    data: beacon
  });
};

// POST /api/iot/locate (Indoor Trilateration & Positioning)
export const locateDevicePosition = (req, res) => {
  const { signals, latitude, longitude, floorNumber, buildingId } = req.body;

  let locatedBeacon = null;
  let estimatedAccuracy = 1.5;

  if (Array.isArray(signals) && signals.length > 0) {
    // Sort signals by strongest RSSI (closer to 0 is stronger)
    const sorted = [...signals].sort((a, b) => (b.rssi || -100) - (a.rssi || -100));
    const strongest = sorted[0];
    locatedBeacon = IOT_BEACONS_DATA.find(b => b.id === strongest.beaconId) || IOT_BEACONS_DATA[0];
    estimatedAccuracy = Math.max(1.0, Math.min(5.0, Math.round(Math.abs(strongest.rssi + 50) * 0.1 * 10) / 10));
  } else if (latitude && longitude) {
    // Find closest GPS anchor
    locatedBeacon = IOT_BEACONS_DATA.reduce((closest, curr) => {
      const d1 = Math.hypot(curr.latitude - latitude, curr.longitude - longitude);
      const d2 = Math.hypot(closest.latitude - latitude, closest.longitude - longitude);
      return d1 < d2 ? curr : closest;
    }, IOT_BEACONS_DATA[0]);
    estimatedAccuracy = 2.0;
  } else {
    // Default to Lobby
    locatedBeacon = IOT_BEACONS_DATA[0];
  }

  res.status(200).json({
    success: true,
    position: {
      canvasX: locatedBeacon.x,
      canvasY: locatedBeacon.y,
      floorNumber: locatedBeacon.floorNumber,
      buildingId: locatedBeacon.buildingId,
      latitude: locatedBeacon.latitude,
      longitude: locatedBeacon.longitude,
      accuracyMeters: estimatedAccuracy,
      nearestBeacon: {
        id: locatedBeacon.id,
        name: locatedBeacon.name,
        zone: locatedBeacon.zone,
        macAddress: locatedBeacon.macAddress
      },
      timestamp: new Date().toISOString()
    }
  });
};

// POST /api/navigation/route (Indoor Pathfinding & Turn-by-Turn Guidance)
export const calculateNavigationRoute = (req, res) => {
  const { fromX, fromY, fromFloor, targetRoomId } = req.body;

  if (!targetRoomId) {
    return res.status(400).json({
      success: false,
      message: 'Parameter targetRoomId wajib disertakan.'
    });
  }

  // Find target room
  let targetRoom = null;
  for (const b of state.buildings) {
    for (const f of b.floors) {
      for (const r of f.rooms) {
        if (r.id === targetRoomId || r.code.toLowerCase() === targetRoomId.toLowerCase()) {
          targetRoom = r;
          break;
        }
      }
    }
  }

  if (!targetRoom) {
    return res.status(404).json({
      success: false,
      message: `Ruangan dengan ID '${targetRoomId}' tidak ditemukan.`
    });
  }

  const startX = typeof fromX === 'number' ? fromX : 90;
  const startY = typeof fromY === 'number' ? fromY : 250;
  const corridorY = 250;

  const doorX = targetRoom.coordinates.x + targetRoom.coordinates.w / 2;
  const doorY = targetRoom.coordinates.doorPosition === 'bottom'
    ? targetRoom.coordinates.y + targetRoom.coordinates.h
    : targetRoom.coordinates.doorPosition === 'top'
    ? targetRoom.coordinates.y
    : targetRoom.coordinates.y + targetRoom.coordinates.h / 2;

  const roomCenterX = targetRoom.coordinates.x + targetRoom.coordinates.w / 2;
  const roomCenterY = targetRoom.coordinates.y + targetRoom.coordinates.h / 2;

  // Build architectural waypoint points
  const pathPoints = [{ x: startX, y: startY }];

  if (Math.abs(startY - corridorY) > 5) {
    pathPoints.push({ x: startX, y: corridorY });
  }

  pathPoints.push({ x: doorX, y: corridorY });
  pathPoints.push({ x: doorX, y: doorY });
  pathPoints.push({ x: roomCenterX, y: roomCenterY });

  // Calculate distance: 1 canvas unit ≈ 0.08 meters
  let totalUnits = 0;
  for (let i = 0; i < pathPoints.length - 1; i++) {
    totalUnits += Math.hypot(pathPoints[i + 1].x - pathPoints[i].x, pathPoints[i + 1].y - pathPoints[i].y);
  }

  const totalDistanceMeters = Math.max(3, Math.round(totalUnits * 0.08));
  const estimatedSeconds = Math.max(5, Math.round(totalDistanceMeters / 1.2));

  // Generate Turn-by-Turn steps in Indonesian
  const steps = [];
  steps.push({
    order: 1,
    instruction: `Mulai navigasi dari posisi awal (Selasar Lantai ${targetRoom.floorNumber})`,
    distanceMeters: 0,
    action: 'START'
  });

  const isMovingEast = doorX > startX;
  const corridorDist = Math.round(Math.abs(doorX - startX) * 0.08);

  if (corridorDist > 2) {
    steps.push({
      order: 2,
      instruction: `Berjalan lurus di selasar koridor ke arah ${isMovingEast ? 'Timur' : 'Barat'} sejauh ${corridorDist} meter`,
      distanceMeters: corridorDist,
      action: 'STRAIGHT'
    });
  }

  const isNorth = targetRoom.coordinates.y < corridorY;
  steps.push({
    order: steps.length + 1,
    instruction: `Belok ${isNorth ? 'kiri' : 'kanan'} menghadap pintu masuk ${targetRoom.code}`,
    distanceMeters: 4,
    action: isNorth ? 'TURN_LEFT' : 'TURN_RIGHT'
  });

  steps.push({
    order: steps.length + 1,
    instruction: `Tiba di tujuan: ${targetRoom.code} - ${targetRoom.name}`,
    distanceMeters: 0,
    action: 'ARRIVE'
  });

  res.status(200).json({
    success: true,
    navigation: {
      targetRoom: {
        id: targetRoom.id,
        code: targetRoom.code,
        name: targetRoom.name,
        buildingId: targetRoom.buildingId,
        floorNumber: targetRoom.floorNumber
      },
      totalDistanceMeters,
      estimatedSeconds,
      pathPoints,
      steps
    }
  });
};

// POST /api/iot/telemetry (Update environmental sensors)
export const updateIotTelemetry = async (req, res) => {
  const { roomId, temperature, currentOccupancy, status } = req.body;

  if (!roomId) {
    return res.status(400).json({
      success: false,
      message: 'Parameter roomId wajib disertakan.'
    });
  }

  const found = findRoomById(roomId);
  if (!found || !found.room) {
    return res.status(404).json({
      success: false,
      message: `Ruangan dengan ID '${roomId}' tidak ditemukan.`
    });
  }

  const targetRoom = found.room;

  if (typeof temperature === 'number') targetRoom.temperature = temperature;
  if (typeof currentOccupancy === 'number') targetRoom.currentOccupancy = currentOccupancy;
  if (status) targetRoom.status = status;

  // Update MySQL if connected
  const db = getDb();
  if (db) {
    try {
      await db.query(
        'UPDATE `rooms` SET `temperature` = ?, `current_occupancy` = ?, `status` = COALESCE(?, status) WHERE `id` = ?',
        [targetRoom.temperature, targetRoom.currentOccupancy, status || null, roomId]
      );
    } catch (err) {
      console.warn('MySQL telemetry update warning:', err.message);
    }
  }

  // Broadcast real-time SSE event to all connected devices
  broadcastEvent('IOT_TELEMETRY_UPDATED', {
    roomId,
    roomCode: targetRoom.code,
    temperature: targetRoom.temperature,
    currentOccupancy: targetRoom.currentOccupancy,
    status: targetRoom.status,
    timestamp: new Date().toISOString()
  });

  res.status(200).json({
    success: true,
    message: `Telemetri sensor IoT untuk '${targetRoom.code}' berhasil diperbarui dan disiarkan secara real-time.`,
    data: {
      roomId,
      roomCode: targetRoom.code,
      temperature: targetRoom.temperature,
      currentOccupancy: targetRoom.currentOccupancy,
      status: targetRoom.status
    }
  });
};
