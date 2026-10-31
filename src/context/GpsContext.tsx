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
  requestCompassPermission: () => Promise<boolean>;
  setManualHeading: (deg: number) => void;
}

const GpsContext = createContext<GpsContextType | undefined>(undefined);

// Default initial state (at Lobby anchor)
const defaultBeacon = IOT_BEACONS[0];

export const getCompassDirectionName = (deg: number): string => {
  const normalized = ((deg % 360) + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return 'Utara (N)';
  if (normalized >= 22.5 && normalized < 67.5) return 'Timur Laut (NE)';
  if (normalized >= 67.5 && normalized < 112.5) return 'Timur (E)';
  if (normalized >= 112.5 && normalized < 157.5) return 'Tenggara (SE)';
  if (normalized >= 157.5 && normalized < 202.5) return 'Selatan (S)';
  if (normalized >= 202.5 && normalized < 247.5) return 'Barat Daya (SW)';
  if (normalized >= 247.5 && normalized < 292.5) return 'Barat (W)';
  return 'Barat Laut (NW)';
};

const initialDeviceState: DeviceLocationState = {
  isTracking: true,
  mode: 'iot-beacon',
  source: 'IoT Beacon ESP32 (Anchor Lobby)',
  latitude: defaultBeacon.latitude,
  longitude: defaultBeacon.longitude,
  accuracy: 1.5,
  heading: 90, // Default pointing East (along the main corridor)
  speed: 0,
  floorNumber: 1,
  buildingId: 'gedung-a',
  canvasX: defaultBeacon.x,
  canvasY: defaultBeacon.y,
  nearestBeacon: defaultBeacon,
  detectedBeacons: IOT_BEACONS.slice(0, 3),
  lastUpdate: new Date(),
  permissionStatus: 'prompt',
  error: null,
  isCompassActive: false,
  compassSupported: typeof window !== 'undefined' && 'DeviceOrientationEvent' in window,
  compassDirectionName: 'Timur (E)',
  relativeBearingToTarget: null,
  relativeTurnInstruction: null
};

export const GpsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deviceState, setDeviceState] = useState<DeviceLocationState>(initialDeviceState);
  const [targetRoom, setTargetRoomState] = useState<Room | null>(null);
  const [isSimulatingWalk, setIsSimulatingWalk] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const walkIntervalRef = useRef<any>(null);
  const lastHeadingRef = useRef<number>(90);

  // Filter beacons for current building and floor
  const availableBeacons = useMemo(() => {
    return IOT_BEACONS.filter(
      b => b.buildingId === deviceState.buildingId && b.floorNumber === deviceState.floorNumber
    );
  }, [deviceState.buildingId, deviceState.floorNumber]);

  // Request Compass Permission (Crucial for iOS 13+ & modern Android)
  const requestCompassPermission = async (): Promise<boolean> => {
    try {
      if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setupOrientationListeners();
          setDeviceState(prev => ({ ...prev, isCompassActive: true, error: null }));
          return true;
        } else {
          setDeviceState(prev => ({ ...prev, isCompassActive: false, error: 'Izin sensor orientasi tidak diberikan.' }));
          return false;
        }
      } else {
        // Android / non-iOS standard
        setupOrientationListeners();
        setDeviceState(prev => ({ ...prev, isCompassActive: true }));
        return true;
      }
    } catch (err: any) {
      console.warn('Compass permission request failed:', err.message);
      return false;
    }
  };

  // Setup orientation listeners with smoothing
  const setupOrientationListeners = () => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let rawHeading: number | null = null;

      // 1. iOS Safari true compass heading
      if ((e as any).webkitCompassHeading !== undefined && (e as any).webkitCompassHeading !== null) {
        rawHeading = (e as any).webkitCompassHeading;
      } 
      // 2. Android deviceorientationabsolute or alpha
      else if (e.alpha !== null && !isNaN(e.alpha)) {
        // For Android: 360 - alpha aligns with compass heading
        rawHeading = (360 - (e.alpha as number)) % 360;
      }

      if (rawHeading !== null && !isNaN(rawHeading)) {
        // Low-pass filter to smooth out sensor jitter
        const diff = (rawHeading - lastHeadingRef.current + 540) % 360 - 180;
        const smoothedHeading = Math.round(((lastHeadingRef.current + diff * 0.35) % 360 + 360) % 360);
        lastHeadingRef.current = smoothedHeading;

        setDeviceState(prev => ({
          ...prev,
          heading: smoothedHeading,
          isCompassActive: true,
          compassDirectionName: getCompassDirectionName(smoothedHeading)
        }));
      }
    };

    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  };

  // Auto-init orientation listener on mount if permission not required
  useEffect(() => {
    if (typeof (DeviceOrientationEvent as any)?.requestPermission !== 'function') {
      setupOrientationListeners();
    }
  }, []);

  // Manual heading adjustment (useful for PC / desktop testing)
  const setManualHeading = (deg: number) => {
    const normalized = ((deg % 360) + 360) % 360;
    lastHeadingRef.current = normalized;
    setDeviceState(prev => ({
      ...prev,
      heading: normalized,
      compassDirectionName: getCompassDirectionName(normalized)
    }));
  };

  // Request actual hardware geolocation (mobile phone, laptop GPS/Wi-Fi)
  const startTracking = (preferredMode: IotTrackingMode = 'device-gps') => {
    requestCompassPermission();

    if (preferredMode === 'device-gps' && 'geolocation' in navigator) {
      setDeviceState(prev => ({
        ...prev,
        isTracking: true,
        mode: 'device-gps',
        source: 'Menginisialisasi GPS Perangkat...'
      }));

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy, heading, speed } = pos.coords;
          
          setDeviceState(prev => {
            const nearest = availableBeacons.reduce((closest, curr) => {
              const d1 = Math.hypot(curr.latitude - latitude, curr.longitude - longitude);
              const d2 = Math.hypot(closest.latitude - latitude, closest.longitude - longitude);
              return d1 < d2 ? curr : closest;
            }, availableBeacons[0] || defaultBeacon);

            const effectiveHeading = heading !== null && !isNaN(heading) ? Math.round(heading) : prev.heading;

            return {
              ...prev,
              isTracking: true,
              mode: 'device-gps',
              source: `GPS Satelit (${accuracy < 10 ? 'Akurasi Tinggi' : 'Seluler/Wi-Fi'})`,
              latitude,
              longitude,
              accuracy: Math.round(accuracy * 10) / 10,
              heading: effectiveHeading,
              speed: speed !== null ? Math.round(speed * 10) / 10 : null,
              permissionStatus: 'granted',
              nearestBeacon: nearest,
              compassDirectionName: getCompassDirectionName(effectiveHeading),
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

  // Set user's position to a specific IoT anchor beacon
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

  // Calculate route and turn-by-turn guidance with device orientation awareness
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

    // Build waypoint coordinates along the corridor
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
    const estimatedSeconds = Math.max(5, Math.round(totalDistanceMeters / 1.2));

    // Next waypoint target for orientation
    const nextWaypoint = pathPoints[1] || pathPoints[0];
    const dx = nextWaypoint.x - startX;
    const dy = nextWaypoint.y - startY;
    // In canvas: 0° is North (up), 90° East (right), 180° South (down), 270° West (left)
    const targetBearing = Math.round((Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360);

    // Relative angle between where user is currently facing and where they should go
    const relativeAngle = ((targetBearing - deviceState.heading + 540) % 360) - 180;

    let relativeTurn = 'Lurus ke depan';
    if (relativeAngle > 25 && relativeAngle <= 70) relativeTurn = 'Serong kanan';
    else if (relativeAngle > 70 && relativeAngle <= 120) relativeTurn = 'Belok kanan';
    else if (relativeAngle > 120 && relativeAngle <= 165) relativeTurn = 'Tajam ke kanan';
    else if (relativeAngle < -25 && relativeAngle >= -70) relativeTurn = 'Serong kiri';
    else if (relativeAngle < -70 && relativeAngle >= -120) relativeTurn = 'Belok kiri';
    else if (relativeAngle < -120 && relativeAngle >= -165) relativeTurn = 'Tajam ke kiri';
    else if (Math.abs(relativeAngle) > 165) relativeTurn = 'Putar balik ke belakang';

    // Update relative bearing in deviceState
    setTimeout(() => {
      setDeviceState(prev => {
        if (prev.relativeBearingToTarget === relativeAngle && prev.relativeTurnInstruction === relativeTurn) {
          return prev;
        }
        return {
          ...prev,
          relativeBearingToTarget: relativeAngle,
          relativeTurnInstruction: relativeTurn
        };
      });
    }, 0);

    // Generate turn-by-turn steps
    const steps: RouteNavigationStep[] = [];
    const fromZone = deviceState.nearestBeacon?.zone || 'Posisi Awal';

    steps.push({
      instruction: `Mulai dari ${fromZone} (Arahkan perangkat: ${relativeTurn})`,
      distanceMeters: 0,
      iconName: 'arrive'
    });

    const isMovingEast = doorX > startX;
    const corridorDist = Math.round(Math.abs(doorX - startX) * 0.08);

    if (corridorDist > 2) {
      steps.push({
        instruction: `Berjalan lurus di koridor ke arah ${isMovingEast ? 'Timur' : 'Barat'} (${corridorDist} m)`,
        distanceMeters: corridorDist,
        iconName: 'straight'
      });
    }

    const isNorthRoom = targetRoom.coordinates.y < corridorY;
    steps.push({
      instruction: `Belok ${isNorthRoom ? 'kiri' : 'kanan'} masuk ke ${targetRoom.code}`,
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
  }, [targetRoom, deviceState.canvasX, deviceState.canvasY, deviceState.heading, deviceState.nearestBeacon, isSimulatingWalk]);

  // Automated simulated walking from current location to target room
  const startSimulatedWalk = () => {
    if (!routeInfo || routeInfo.pathPoints.length < 2) return;
    setIsSimulatingWalk(true);

    let currentSegmentIndex = 0;
    let t = 0;

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

      // In canvas: 0° is North (up), 90° East (right), 180° South (down), 270° West (left)
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const angleDeg = Math.round((Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360);

      setDeviceState(prev => ({
        ...prev,
        canvasX: Math.round(currX),
        canvasY: Math.round(currY),
        heading: angleDeg,
        compassDirectionName: getCompassDirectionName(angleDeg),
        speed: 1.2
      }));

      if (t >= 1) {
        t = 0;
        currentSegmentIndex += 1;
        if (currentSegmentIndex >= routeInfo.pathPoints.length - 1) {
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
        availableBeacons,
        requestCompassPermission,
        setManualHeading
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
