import { IotBeaconNode } from '../types/gps';

// Base coordinates for Universitas Siliwangi, Tasikmalaya
const UNSIL_LAT = -7.348611;
const UNSIL_LNG = 108.224167;

export const IOT_BEACONS: IotBeaconNode[] = [
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
    macAddress: 'F2:4A:BC:01:A1:01'
  },
  {
    id: 'UNSIL-BCN-02',
    name: 'IoT Anchor Tangga Sentral & Lift',
    buildingId: 'gedung-a',
    floorNumber: 1,
    x: 280,
    y: 250,
    latitude: UNSIL_LAT + 0.000015,
    longitude: UNSIL_LNG - 0.00001,
    rssi: -58,
    txPower: -59,
    zone: 'Akses Tangga Sentral & BAAK',
    macAddress: 'F2:4A:BC:01:A1:02'
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
    zone: 'Selasar Koridor Tengah',
    macAddress: 'F2:4A:BC:01:A1:03'
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
    macAddress: 'F2:4A:BC:01:A1:04'
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
    macAddress: 'F2:4A:BC:02:A2:01'
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
    zone: 'Selasar Laboratorium Riset AI',
    macAddress: 'F2:4A:BC:02:A2:02'
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
    macAddress: 'F2:4A:BC:03:B1:01'
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
    macAddress: 'F2:4A:BC:03:B1:02'
  }
];

