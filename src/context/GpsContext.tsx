import React, { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode } from 'react';
import { Room } from '../types';
import { DeviceLocationState, IotBeaconNode, PathRouteInfo, IotTrackingMode, RouteNavigationStep } from '../types/gps';
import { IOT_BEACONS } from '../data/iotBeaconsData';

interface GpsContextType {
  deviceState: DeviceLocationState;
  routeInfo: PathRouteInfo | null;
  targetRoom: Room | null;
  isSimulatingWalk: boolean;
  startTracking: (mode?: IotTrackingMode) => void;
  stopTracking: () => void;
  setAnchorBeacon: (beaconId: string) => void;
  setTargetRoom: (room: Room | null) => void;
  startSimulatedWalk: () => void;
  stopSimulatedWalk: () => void;
  availableBeacons: IotBeaconNode[];
}

const GpsContext = createContext<GpsContextType | undefined>(undefined);

// Default initial state (at Lobby anchor)
const defaultBeacon = IOT_BEACONS[0];

const initialDeviceState: DeviceLocationState = {
  isTracking: true,
  mode: 'iot-beacon',
  source: 'IoT Beacon ESP32 (Anchor Lobby)',
  latitude: defaultBeacon.latitude,
  longitude: defaultBeacon.longitude,
  accuracy: 1.5,
  heading: 45,
  speed: 0,
  floorNumber: 1,
  buildingId: 'gedung-a',
  canvasX: defaultBeacon.x,
  canvasY: defaultBeacon.y,
  nearestBeacon: defaultBeacon,
  detectedBeacons: IOT_BEACONS.slice(0, 3),
  lastUpdate: new Date(),
  permissionStatus: 'prompt',
  error: null
};

export const GpsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deviceState, setDeviceState] = useState<DeviceLocationState>(initialDeviceState);
  const [targetRoom, setTargetRoomState] = useState<Room | null>(null);
  const [isSimulatingWalk, setIsSimulatingWalk] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const walkIntervalRef = useRef<any>(null);

  // Filter beacons for current building and floor
  const availableBeacons = useMemo(() => {
    return IOT_BEACONS.filter(
      b => b.buildingId === deviceState.buildingId && b.floorNumber === deviceState.floorNumber
    );
  }, [deviceState.buildingId, deviceState.floorNumber]);

  // Request actual hardware geolocation (mobile phone, laptop GPS/Wi-Fi)
  const startTracking = (preferredMode: IotTrackingMode = 'device-gps') => {
    if (preferredMode === 'device-gps' && 'geolocation' in navigator) {
      setDeviceState(prev => ({
        ...prev,
        isTracking: true,
        mode: 'device-gps',
        source: 'Menginisialisasi GPS Perangkat...'
      }));

      // Start watching device GPS
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy, heading, speed } = pos.coords;
          
          setDeviceState(prev => {
            // Find nearest IoT beacon to anchor indoors
            const nearest = availableBeacons.reduce((closest, curr) => {
              const d1 = Math.hypot(curr.latitude - latitude, curr.longitude - longitude);
              const d2 = Math.hypot(closest.latitude - latitude, closest.longitude - longitude);
              return d1 < d2 ? curr : closest;
            }, availableBeacons[0] || defaultBeacon);

            return {
              ...prev,
              isTracking: true,
              mode: 'device-gps',
              source: `GPS Satelit (${accuracy < 10 ? 'Akurasi Tinggi' : 'Seluler/Wi-Fi'})`,
              latitude,
              longitude,
              accuracy: Math.round(accuracy * 10) / 10,
              heading: heading !== null && !isNaN(heading) ? heading : prev.heading,
              speed: speed !== null ? Math.round(speed * 10) / 10 : null,
              permissionStatus: 'granted',
              nearestBeacon: nearest,
              lastUpdate: new Date(),
              error: null
            };
          });
        },
        (err) => {
          console.warn('Device GPS unavailable or permission denied, fallback to IoT Beacon:', err.message);
          setDeviceState(prev => ({
            ...prev,
            isTracking: true,
            mode: 'iot-beacon',
            source: 'IoT Beacon Triangulasi (Fallback)',
            permissionStatus: 'denied',
            error: 'Izin GPS tidak diberikan. Beralih ke sistem IoT Beacon Indoor.'
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 2000
        }
      );
    } else {
      // Use IoT Beacon Triangulation Mode
      setDeviceState(prev => ({
        ...prev,
        isTracking: true,
        mode: 'iot-beacon',
        source: 'IoT Beacon ESP32 Active Triangulation',
        accuracy: 1.8,
        error: null
      }));
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    stopSimulatedWalk();
    setDeviceState(prev => ({
      ...prev,
      isTracking: false
    }));
  };

  // Device orientation (compass heading sensor for mobile devices)
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null && !isNaN(e.alpha)) {
        setDeviceState(prev => ({
          ...prev,
          heading: Math.round(e.alpha as number)
        }));
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  // Set user's position to a specific IoT anchor beacon (manual selection or floor switch)
  const setAnchorBeacon = (beaconId: string) => {
    const targetBeacon = IOT_BEACONS.find(b => b.id === beaconId);
    if (!targetBeacon) return;

    stopSimulatedWalk();

    setDeviceState(prev => ({
      ...prev,
      mode: 'iot-beacon',
      source: `IoT Anchor (${targetBeacon.zone})`,
      latitude: targetBeacon.latitude,
      longitude: targetBeacon.longitude,
      accuracy: 1.2,
      floorNumber: targetBeacon.floorNumber,
      buildingId: targetBeacon.buildingId,
      canvasX: targetBeacon.x,
      canvasY: targetBeacon.y,
      nearestBeacon: targetBeacon,
      lastUpdate: new Date(),
      error: null
    }));
  };

  // Set target room for turn-by-turn navigation
  const setTargetRoom = (room: Room | null) => {
    stopSimulatedWalk();
    setTargetRoomState(room);
    if (room) {
      // Ensure current device floor matches room floor for immediate guidance
      if (deviceState.floorNumber !== room.floorNumber) {
        const floorBeacon = IOT_BEACONS.find(
          b => b.buildingId === room.buildingId && b.floorNumber === room.floorNumber
        ) || defaultBeacon;

        setDeviceState(prev => ({
          ...prev,
          floorNumber: room.floorNumber,
          buildingId: room.buildingId,
          canvasX: floorBeacon.x,
          canvasY: floorBeacon.y,
          nearestBeacon: floorBeacon
        }));
      }
    }
  };

  // Calculate route and turn-by-turn guidance
  const routeInfo = useMemo<PathRouteInfo | null>(() => {
    if (!targetRoom) return null;

    const startX = deviceState.canvasX;
    const startY = deviceState.canvasY;
    const corridorY = 250; // Central corridor centerline

    const doorX = targetRoom.coordinates.x + targetRoom.coordinates.w / 2;
    const doorY = targetRoom.coordinates.doorPosition === 'bottom'
      ? targetRoom.coordinates.y + targetRoom.coordinates.h
      : targetRoom.coordinates.doorPosition === 'top'
      ? targetRoom.coordinates.y
      : targetRoom.coordinates.y + targetRoom.coordinates.h / 2;

    const roomCenterX = targetRoom.coordinates.x + targetRoom.coordinates.w / 2;
    const roomCenterY = targetRoom.coordinates.y + targetRoom.coordinates.h / 2;

    // Build waypoint coordinates along the architectural grid
    const pathPoints: { x: number; y: number }[] = [
      { x: startX, y: startY }
    ];

    if (Math.abs(startY - corridorY) > 5) {
      pathPoints.push({ x: startX, y: corridorY });
    }

    pathPoints.push({ x: doorX, y: corridorY });
    pathPoints.push({ x: doorX, y: doorY });
    pathPoints.push({ x: roomCenterX, y: roomCenterY });

    // Calculate distance (scale: 1 canvas unit ≈ 0.08 meters)
    let totalCanvasUnits = 0;
    for (let i = 0; i < pathPoints.length - 1; i++) {
      totalCanvasUnits += Math.hypot(
        pathPoints[i + 1].x - pathPoints[i].x,
        pathPoints[i + 1].y - pathPoints[i].y
      );
    }

    const totalDistanceMeters = Math.max(3, Math.round(totalCanvasUnits * 0.08));
    // Average walking speed indoors: 1.2 m/s
    const estimatedSeconds = Math.max(5, Math.round(totalDistanceMeters / 1.2));

    // Generate turn-by-turn steps
    const steps: RouteNavigationStep[] = [];
    const fromZone = deviceState.nearestBeacon?.zone || 'Posisi Awal';

    steps.push({
      instruction: `Mulai navigasi dari ${fromZone}`,
      distanceMeters: 0,
      iconName: 'arrive'
    });

    const isMovingEast = doorX > startX;
    const corridorDist = Math.round(Math.abs(doorX - startX) * 0.08);

    if (corridorDist > 2) {
      steps.push({
        instruction: `Berjalan lurus di koridor tengah ke arah ${isMovingEast ? 'Timur' : 'Barat'} (${corridorDist} m)`,
        distanceMeters: corridorDist,
        iconName: 'straight'
      });
    }

    const isNorthRoom = targetRoom.coordinates.y < corridorY;
    steps.push({
      instruction: `Belok ${isNorthRoom ? 'kiri' : 'kanan'} menuju pintu masuk ${targetRoom.code}`,
      distanceMeters: 4,
      iconName: isNorthRoom ? 'turn-left' : 'turn-right'
    });

    steps.push({
      instruction: `Tiba di tujuan: ${targetRoom.code} - ${targetRoom.name}`,
      distanceMeters: 0,
      iconName: 'arrive'
    });

    return {
      targetRoom,
      totalDistanceMeters,
      estimatedSeconds,
      steps,
      pathPoints,
      isSimulatingWalk
    };
  }, [targetRoom, deviceState.canvasX, deviceState.canvasY, deviceState.nearestBeacon, isSimulatingWalk]);

  // Automated simulated walking from current location to target room
  const startSimulatedWalk = () => {
    if (!routeInfo || routeInfo.pathPoints.length < 2) return;
    setIsSimulatingWalk(true);

    let currentSegmentIndex = 0;
    let t = 0; // Segment interpolation (0 to 1)

    if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);

    walkIntervalRef.current = setInterval(() => {
      const p1 = routeInfo.pathPoints[currentSegmentIndex];
      const p2 = routeInfo.pathPoints[currentSegmentIndex + 1];

      if (!p1 || !p2) {
        stopSimulatedWalk();
        return;
      }

      t += 0.05;

      const currX = p1.x + (p2.x - p1.x) * t;
      const currY = p1.y + (p2.y - p1.y) * t;

      // Calculate heading angle
      const angleDeg = Math.round((Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI) + 90;

      setDeviceState(prev => ({
        ...prev,
        canvasX: Math.round(currX),
        canvasY: Math.round(currY),
        heading: (angleDeg + 360) % 360,
        speed: 1.2
      }));

      if (t >= 1) {
        t = 0;
        currentSegmentIndex += 1;
        if (currentSegmentIndex >= routeInfo.pathPoints.length - 1) {
          // Arrived at destination!
          stopSimulatedWalk();
        }
      }
    }, 60);
  };

  const stopSimulatedWalk = () => {
    if (walkIntervalRef.current) {
      clearInterval(walkIntervalRef.current);
      walkIntervalRef.current = null;
    }
    setIsSimulatingWalk(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (walkIntervalRef.current) {
        clearInterval(walkIntervalRef.current);
      }
    };
  }, []);

  return (
    <GpsContext.Provider
      value={{
        deviceState,
        routeInfo,
        targetRoom,
        isSimulatingWalk,
        startTracking,
        stopTracking,
        setAnchorBeacon,
        setTargetRoom,
        startSimulatedWalk,
        stopSimulatedWalk,
        availableBeacons
      }}
    >
      {children}
    </GpsContext.Provider>
  );
};

export const useGps = (): GpsContextType => {
  const context = useContext(GpsContext);
  if (!context) {
    throw new Error('useGps must be used within a GpsProvider');
  }
  return context;
};

export default GpsProvider;

