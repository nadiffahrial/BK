import { IotBeaconNode } from '../types/gps';

// Base coordinates for Universitas Siliwangi, Tasikmalaya
const UNSIL_LAT = -7.348611;
const UNSIL_LNG = 108.224167;

export const IOT_BEACONS: IotBeaconNode[] = [
  // Gedung LABTEK 1 - Tingkat 1
  {
    id: 'UNSIL-BCN-01',
    name: 'Titik Acuan Lobby Barat & Pintu Utama',
    buildingId: 'gedung-a',
    floorNumber: 1,
    x: 90,
    y: 250,
    latitude: UNSIL_LAT + 0.00001,
    longitude: UNSIL_LNG - 0.00002,
    zone: 'Lobby Utama & Gerbang Barat'
  },
  {
    id: 'UNSIL-BCN-02',
    name: 'Titik Acuan Tangga Sentral & Lift',
    buildingId: 'gedung-a',
    floorNumber: 1,
    x: 280,
    y: 250,
    latitude: UNSIL_LAT + 0.000015,
    longitude: UNSIL_LNG - 0.00001,
    zone: 'Akses Tangga Sentral & BAAK'
  },
  {
    id: 'UNSIL-BCN-03',
    name: 'Titik Acuan Selasar Koridor Tengah',
    buildingId: 'gedung-a',
    floorNumber: 1,
    x: 480,
    y: 250,
    latitude: UNSIL_LAT + 0.00002,
    longitude: UNSIL_LNG,
    zone: 'Selasar Koridor Tengah'
  },
  {
    id: 'UNSIL-BCN-04',
    name: 'Titik Acuan Sayap Timur (Amfiteater)',
    buildingId: 'gedung-a',
    floorNumber: 1,
    x: 750,
    y: 250,
    latitude: UNSIL_LAT + 0.000025,
    longitude: UNSIL_LNG + 0.000015,
    zone: 'Sayap Timur & Ruang Amfiteater'
  },

  // Gedung LABTEK 1 - Tingkat 2
  {
    id: 'UNSIL-BCN-05',
    name: 'Titik Acuan Tangga Atas Lt. 2',
    buildingId: 'gedung-a',
    floorNumber: 2,
    x: 90,
    y: 250,
    latitude: UNSIL_LAT + 0.00001,
    longitude: UNSIL_LNG - 0.00002,
    zone: 'Lobby Tangga Tingkat 2'
  },
  {
    id: 'UNSIL-BCN-06',
    name: 'Titik Acuan Selasar Lab Komputasi Lt. 2',
    buildingId: 'gedung-a',
    floorNumber: 2,
    x: 480,
    y: 250,
    latitude: UNSIL_LAT + 0.00002,
    longitude: UNSIL_LNG,
    zone: 'Selasar Laboratorium Riset AI'
  },

  // Gedung FT.1 - Tingkat 1 & 2
  {
    id: 'UNSIL-BCN-07',
    name: 'Titik Acuan Lobby FT.1 Dekanat',
    buildingId: 'gedung-b',
    floorNumber: 1,
    x: 90,
    y: 250,
    latitude: UNSIL_LAT + 0.0001,
    longitude: UNSIL_LNG + 0.00005,
    zone: 'Lobby Gedung FT.1'
  },
  {
    id: 'UNSIL-BCN-08',
    name: 'Titik Acuan Koridor Tengah FT.1',
    buildingId: 'gedung-b',
    floorNumber: 1,
    x: 480,
    y: 250,
    latitude: UNSIL_LAT + 0.00011,
    longitude: UNSIL_LNG + 0.00007,
    zone: 'Koridor Utama FT.1'
  }
];
