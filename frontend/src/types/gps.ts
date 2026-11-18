import { Room } from './index';

export type IotTrackingMode = 'device-gps' | 'indoor-nav' | 'simulated';

export interface IotBeaconNode {
  id: string;
  name: string;
  buildingId: string;
  floorNumber: number;
  x: number;
  y: number;
  latitude: number;
  longitude: number;
  zone: string;
}

export interface DeviceLocationState {
  isTracking: boolean;
  mode: IotTrackingMode;
  source: string;
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  heading: number; // degrees 0-360
  speed: number | null; // m/s
  floorNumber: number;
  buildingId: string;
  canvasX: number;
  canvasY: number;
  nearestBeacon: IotBeaconNode | null;
  detectedBeacons?: IotBeaconNode[];
  lastUpdate: Date;
  permissionStatus: 'granted' | 'prompt' | 'denied';
  error: string | null;
  isCompassActive?: boolean;
  compassSupported?: boolean;
  compassDirectionName?: string;
  relativeBearingToTarget?: number | null;
  relativeTurnInstruction?: string | null;
}

export interface RouteNavigationStep {
  instruction: string;
  distanceMeters: number;
  iconName: 'straight' | 'turn-left' | 'turn-right' | 'stairs' | 'arrive';
}

export interface PathRouteInfo {
  targetRoom: Room;
  totalDistanceMeters: number;
  estimatedSeconds: number;
  steps: RouteNavigationStep[];
  pathPoints: { x: number; y: number }[];
  isSimulatingWalk?: boolean;
}

