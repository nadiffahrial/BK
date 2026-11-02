export type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export type RoomType = 
  | 'classroom' 
  | 'laboratory' 
  | 'meeting' 
  | 'auditorium' 
  | 'office' 
  | 'facility'
  | 'lounge';

export interface RoomScheduleItem {
  id: string;
  title: string;
  organizer: string;
  timeRange: string;
  type: string;
}

export interface RoomFacility {
  name: string;
  iconName: string;
  available: boolean;
  spec?: string;
}

export interface Room {
  id: string;
  code: string;           // e.g., "A-101", "B-204"
  name: string;           // e.g., "Lab Rekayasa Perangkat Lunak"
  buildingId: string;     // 'gedung-a' | 'gedung-b'
  floorNumber: number;    // 1, 2, 3, 4
  type: RoomType;
  status: RoomStatus;
  capacity: number;
  currentOccupancy?: number;
  temperature?: number;   // e.g., 22°C
  acUnits?: number;
  facilities: RoomFacility[];
  description: string;
  currentActivity?: {
    title: string;
    personInCharge: string;
    department: string;
    startTime: string;
    endTime: string;
  };
  schedule: RoomScheduleItem[];
  // SVG Coordinates on layout canvas (width, height, x, y in grid units)
  coordinates: {
    x: number;
    y: number;
    w: number;
    h: number;
    doorPosition?: 'top' | 'bottom' | 'left' | 'right';
  };
}

export interface Floor {
  floorNumber: number;
  name: string;           // e.g., "Lantai 1 - Hall & Layanan Akademik"
  description: string;
  dimensions: {
    width: number;
    height: number;
  };
  rooms: Room[];
}

export interface Building {
  id: string;
  name: string;           // e.g., "Gedung A - Menara Graha Sains"
  shortName: string;      // "Gedung A"
  code: 'A' | 'B';
  tagline: string;
  floorsCount: number;
  address: string;
  operatingHours: string;
  floors: Floor[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'student' | 'guest';
  department?: string;
  avatarUrl?: string;
}

export interface BookingRequest {
  id: string;
  roomId: string;
  roomName: string;
  roomCode: string;
  userName: string;
  userEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  participants: number;
  createdAt: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export type ViewMode = '2d' | '3d' | 'list';

export interface SearchResultRoom extends Room {
  buildingName?: string;
  buildingCode?: string;
  buildingShortName?: string;
  floorName?: string;
  matchReason?: string;
}



export interface CsTicket {
  id: string;
  senderName: string;
  senderEmail: string;
  senderRole?: 'student' | 'staff' | 'admin' | 'guest';
  category: string;
  roomCode?: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  adminResponse?: string;
  createdAt: string;
  updatedAt?: string;
}
