import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Building, Room } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import {
  Building2,
  Layers,
  Sparkles,
  Camera,
  Sun,
  Sunset,
  Moon,
  RotateCw,
  Eye,
  ChevronRight,
  Info,
  CheckCircle2,
  Lock,
  Compass,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';

interface Campus3DBuildingViewerProps {
  buildings: Building[];
  activeBuildingId: string;
  onSelectBuilding: (buildingId: string) => void;
  activeFloorNumber: number;
  onSelectFloor: (floorNumber: number) => void;
  onSelectRoom?: (room: Room) => void;
  onSwitchToFloorPlan?: () => void;
}

// Data definisi seluruh bangunan di kompleks Fakultas Teknik Kampus 2 sesuai foto asli lapangan
interface CampusBuildingDef {
  id: string;
  name: string;
  shortName: string;
  code: string;
  role: string;
  hasFloorPlan: boolean;
  x: number;
  z: number;
  length: number;
  depth: number;
  height: number;
  roofHeight: number;
  hasFrontCanopy?: boolean;
  canopyX?: number;
  isDekanat?: boolean;
  signType?: 'ft1' | 'ft2' | 'labtek1' | 'dekanat' | 'generic';
  description: string;
}

const ALL_CAMPUS_BUILDINGS: CampusBuildingDef[] = [
  // 1. Gedung LABTEK 1 (Baris Depan Barat, Dilingkari Merah, Denah Tersedia ✓)
  {
    id: 'gedung-a',
    name: 'Gedung LABTEK 1',
    shortName: 'LABTEK 1',
    code: 'A',
    role: 'Laboratorium Komputer & Riset Teknik Terpadu',
    hasFloorPlan: true,
    x: -24,
    z: 14,
    length: 50,
    depth: 13.5,
    height: 7.8,
    roofHeight: 5.2,
    hasFrontCanopy: true,
    canopyX: 8,
    signType: 'labtek1',
    description: 'Pusat laboratorium komputer, jaringan, multimedia, dan riset AI Fakultas Teknik.'
  },
  // 2. Gedung FT.1 (Baris Tengah Barat, Sejajar di Belakang LABTEK 1, Dilingkari Merah, Denah Tersedia ✓)
  {
    id: 'gedung-b',
    name: 'Gedung FT.1',
    shortName: 'FT.1',
    code: 'B',
    role: 'Informatika & Sistem Informasi (Kuliah & Sidang)',
    hasFloorPlan: true,
    x: -20,
    z: -14,
    length: 52,
    depth: 13.5,
    height: 7.8,
    roofHeight: 5.2,
    hasFrontCanopy: true,
    canopyX: -12,
    signType: 'ft1',
    description: 'Gedung perkuliahan program studi Informatika dan Sistem Informasi, serta ruang sidang skripsi.'
  },
  // 3. Gedung Dekanat & Pusat Administrasi Fakultas Teknik (Baris Depan Timur)
  {
    id: 'dekanat-ft',
    name: 'Gedung Dekanat & Tata Usaha FT',
    shortName: 'DEKANAT FT',
    code: 'DK',
    role: 'Kantor Dekan & Layanan Administrasi Fakultas',
    hasFloorPlan: false,
    x: 26,
    z: 14,
    length: 46,
    depth: 15.0,
    height: 8.6,
    roofHeight: 5.4,
    hasFrontCanopy: true,
    canopyX: 0,
    isDekanat: true,
    signType: 'dekanat',
    description: 'Pusat pimpinan Fakultas Teknik, ruang senat, pelayanan akademik dan administrasi terpusat.'
  },
  // 4. Gedung FT.2 - Teknik Elektro (Baris Tengah Timur, Sejajar di Belakang Dekanat)
  {
    id: 'gedung-ft2',
    name: 'Gedung FT.2 (Teknik Elektro)',
    shortName: 'FT.2',
    code: 'FT2',
    role: 'Perkuliahan & Laboratorium Teknik Elektro',
    hasFloorPlan: false,
    x: 28,
    z: -14,
    length: 50,
    depth: 13.5,
    height: 7.8,
    roofHeight: 5.2,
    hasFrontCanopy: true,
    canopyX: -10,
    signType: 'ft2',
    description: 'Gedung perkuliahan teori, ruang dosen, dan laboratorium program studi Teknik Elektro.'
  },
  // 5. Gedung Lab Terpadu Utara 1 (Baris Belakang Barat)
  {
    id: 'lab-utara-1',
    name: 'Gedung Kuliah & Lab Utara 1',
    shortName: 'LAB UTARA 1',
    code: 'LU1',
    role: 'Laboratorium Praktikum Terpadu',
    hasFloorPlan: false,
    x: -12,
    z: -42,
    length: 48,
    depth: 13.0,
    height: 7.6,
    roofHeight: 5.0,
    signType: 'generic',
    description: 'Fasilitas laboratorium praktikum terpadu rekayasa keteknikan.'
  },
  // 6. Gedung Lab Terpadu Utara 2 (Baris Belakang Timur)
  {
    id: 'lab-utara-2',
    name: 'Gedung Kuliah & Lab Utara 2',
    shortName: 'LAB UTARA 2',
    code: 'LU2',
    role: 'Laboratorium Teknik Mesin & Konversi Energi',
    hasFloorPlan: false,
    x: 30,
    z: -42,
    length: 48,
    depth: 13.0,
    height: 7.6,
    roofHeight: 5.0,
    signType: 'generic',
    description: 'Fasilitas penunjang praktikum teknik mesin dan permesinan terpadu.'
  },
  // 7. Gedung Workshop / Utilitas Barat
  {
    id: 'workshop-barat',
    name: 'Gedung Workshop & Utilitas Barat',
    shortName: 'WORKSHOP',
    code: 'WS',
    role: 'Gedung Power House, Genset & Workshop',
    hasFloorPlan: false,
    x: -58,
    z: 0,
    length: 30,
    depth: 11.0,
    height: 6.5,
    roofHeight: 4.4,
    description: 'Pusat gardu distribusi listrik, genset cadangan, dan sarana pemeliharaan fakultas.'
  }
];

// =========================================================================
// PROCEDURAL PROCEDURAL TEXTURES GENERATORS (PBR EXACT MATCH REAL LIFE)
// =========================================================================

// 1. Tekstur Dinding Cat Biru Cerulean Asli FT UNSIL dengan Garis Tali Air
function generateSkyBlueWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warna biru muda khas dinding FT UNSIL (sesuai foto lapangan)
  ctx.fillStyle = '#3ea6ff';
  ctx.fillRect(0, 0, 512, 512);

  // Variasi tekstur cat tembok halus
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? '#369bf0' : '#47aeff';
    ctx.fillRect(x, y, 2.5, 2.5);
  }

  // Garis tali air horizontal pembagi lantai
  ctx.strokeStyle = '#278be6';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 256);
  ctx.lineTo(512, 256);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  return texture;
}

// 2. Fasad Plang Gedung FT.1 (Sesuai Foto Lapangan: "FT.1 INFORMATIKA & SISTEM INFORMASI")
function generateFT1SignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Latar biru cerulean dinding
  ctx.fillStyle = '#3ea6ff';
  ctx.fillRect(0, 0, 512, 512);

  // 3 Jendela ventilasi kotak hitam kecil di atas (sesuai foto)
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 3;
  const ventTopY = 70;
  [140, 256, 372].forEach((vx) => {
    ctx.fillRect(vx - 22, ventTopY - 22, 44, 44);
    ctx.strokeRect(vx - 22, ventTopY - 22, 44, 44);
  });

  // Tulisan 3D Putih Timbul "FT.1" (Sesuai Foto Lapangan)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Bayangan drop shadow 3D
  ctx.font = '900 115px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('FT.1', 259, 218);

  // Huruf balok timbul putih bersih
  ctx.fillStyle = '#ffffff';
  ctx.fillText('FT.1', 256, 215);

  // Subtitle teks: INFORMATIKA & SISTEM INFORMASI
  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('INFORMATIKA', 257, 283);
  ctx.fillText('& SISTEM INFORMASI', 257, 317);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('INFORMATIKA', 256, 282);
  ctx.fillText('& SISTEM INFORMASI', 256, 316);

  // Lisplang kanopi kecil pembagi
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(50, 360, 412, 12);

  // 3 Jendela ventilasi kotak hitam kecil di bawah kanopi
  const ventBotY = 425;
  [140, 256, 372].forEach((vx) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(vx - 22, ventBotY - 22, 44, 44);
    ctx.strokeRect(vx - 22, ventBotY - 22, 44, 44);
  });

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 3. Fasad Plang Gedung FT.2 (Sesuai Foto Lapangan: "FT.2 TEKNIK ELEKTRO")
function generateFT2SignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3ea6ff';
  ctx.fillRect(0, 0, 512, 512);

  // 4 Jendela ventilasi kotak kecil di atas (sesuai foto FT.2)
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 3;
  const ventTopY = 70;
  [110, 207, 304, 401].forEach((vx) => {
    ctx.fillRect(vx - 20, ventTopY - 20, 40, 40);
    ctx.strokeRect(vx - 20, ventTopY - 20, 40, 40);
  });

  // Tulisan 3D Putih Timbul "FT.2"
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '900 115px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('FT.2', 259, 218);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('FT.2', 256, 215);

  // Subtitle teks: TEKNIK ELEKTRO
  ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('TEKNIK ELEKTRO', 257, 291);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('TEKNIK ELEKTRO', 256, 290);

  // Lisplang kanopi kecil pembagi
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(50, 360, 412, 12);

  // 4 Jendela ventilasi kotak kecil di bawah kanopi
  const ventBotY = 425;
  [110, 207, 304, 401].forEach((vx) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(vx - 20, ventBotY - 20, 40, 40);
    ctx.strokeRect(vx - 20, ventBotY - 20, 40, 40);
  });

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 4. Fasad Plang Gedung LABTEK 1
function generateLabtek1SignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3ea6ff';
  ctx.fillRect(0, 0, 512, 512);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '900 90px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('LABTEK 1', 258, 208);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('LABTEK 1', 256, 205);

  ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('LABORATORIUM TEKNIK TERPADU', 256, 280);
  ctx.fillText('INFORMATIKA • ELEKTRO • SIPIL', 256, 315);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 5. Plang Nama Emas Resmi Dekanat Fakultas Teknik
function generateDekanatSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 500, 116);

  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('FAKULTAS TEKNIK', 256, 42);

  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('UNIVERSITAS SILIWANGI', 256, 75);

  ctx.font = '11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#93c5fd';
  ctx.fillText('GEDUNG DEKANAT & PUSAT ADMINISTRASI', 256, 102);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 6. Tekstur Genteng Keramik Merah Bata Bergelombang (Sesuai Foto Udara)
function generateRoofTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warna dasar genteng cokelat merah bata tua (sesuai foto lapangan)
  ctx.fillStyle = '#6e2716';
  ctx.fillRect(0, 0, 512, 512);

  const rowHeight = 28;
  const colWidth = 42;

  for (let y = 0; y < 512; y += rowHeight) {
    const isOdd = (y / rowHeight) % 2 === 1;
    const offsetX = isOdd ? colWidth / 2 : 0;

    // Bayangan overlap bawah genteng
    ctx.fillStyle = '#42160a';
    ctx.fillRect(0, y + rowHeight - 4, 512, 4);

    // Kilau sorotan cahaya atas genteng
    ctx.fillStyle = '#993922';
    ctx.fillRect(0, y, 512, 3);

    for (let x = -colWidth; x < 512 + colWidth; x += colWidth) {
      const tileX = x + offsetX;
      ctx.fillStyle = '#361107';
      ctx.fillRect(tileX, y, 2.5, rowHeight);

      // Lengkungan genteng keramik
      const grad = ctx.createLinearGradient(tileX, y, tileX + colWidth, y);
      grad.addColorStop(0, 'rgba(0,0,0,0.22)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.09)');
      grad.addColorStop(1, 'rgba(0,0,0,0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(tileX + 2, y + 2, colWidth - 4, rowHeight - 6);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

// 7. Tekstur Paving Block Pola Herringbone (Sesuai Foto Koridor Tengah)
function generateHerringbonePavingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#c8d0db';
  ctx.fillRect(0, 0, 256, 256);

  const pw = 28;
  const ph = 14;
  ctx.strokeStyle = '#8e9aa8';
  ctx.lineWidth = 1.6;

  // Gambar susunan paving bata saling mengunci (herringbone)
  for (let y = -28; y < 284; y += 28) {
    for (let x = -28; x < 284; x += 28) {
      // Pasangan bata horizontal dan vertikal
      const shade1 = Math.random() * 22 - 11;
      const v1 = Math.min(235, Math.max(185, 205 + shade1));
      ctx.fillStyle = `rgb(${v1}, ${v1 + 2}, ${v1 + 4})`;
      ctx.fillRect(x + 1, y + 1, pw - 2, ph - 2);
      ctx.strokeRect(x, y, pw, ph);

      const shade2 = Math.random() * 22 - 11;
      const v2 = Math.min(235, Math.max(185, 205 + shade2));
      ctx.fillStyle = `rgb(${v2}, ${v2 + 2}, ${v2 + 4})`;
      ctx.fillRect(x + ph + 1, y + ph + 1, ph - 2, pw - 2);
      ctx.strokeRect(x + ph, y + ph, ph, pw);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

// 8. Tekstur Jendela Kaca Reflektif dengan Kusen Putih
function generateWindowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#172554');
  grad.addColorStop(0.5, '#0f172a');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Pantulan langit
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(30, 250);
  ctx.lineTo(190, 10);
  ctx.lineTo(240, 10);
  ctx.lineTo(80, 250);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 246, 246);

  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(128, 5);
  ctx.lineTo(128, 251);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(5, 80);
  ctx.lineTo(251, 80);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 9. Tekstur Rumput Alami Bergradasi
function generateGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3c7943';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 3.5 + 1;
    const rnd = Math.random();
    if (rnd < 0.4) ctx.fillStyle = '#4c8f53';
    else if (rnd < 0.75) ctx.fillStyle = '#2d5e35';
    else ctx.fillStyle = '#5ca266';
    ctx.fillRect(x, y, r, r);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

// Helper Atap Limasan / Hip Roof 4 Bidang Miring
function createHipRoofGeometry(
  width: number,
  depth: number,
  height: number,
  ridgeInset: number
): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const halfW = width / 2;
  const halfD = depth / 2;
  const ridgeX = Math.max(0, halfW - ridgeInset);

  const positions: number[] = [];
  const uvs: number[] = [];

  const pushTri = (
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number]
  ) => {
    positions.push(...p1, ...p2, ...p3);
    uvs.push(0, 0, 1, 0, 0.5, 1);
  };

  const v0: [number, number, number] = [-halfW, 0, halfD];
  const v1: [number, number, number] = [halfW, 0, halfD];
  const v2: [number, number, number] = [halfW, 0, -halfD];
  const v3: [number, number, number] = [-halfW, 0, -halfD];
  const v4: [number, number, number] = [-ridgeX, height, 0];
  const v5: [number, number, number] = [ridgeX, height, 0];

  // Depan
  pushTri(v0, v1, v5);
  pushTri(v0, v5, v4);
  // Belakang
  pushTri(v2, v3, v4);
  pushTri(v2, v4, v5);
  // Kiri
  pushTri(v3, v0, v4);
  // Kanan
  pushTri(v1, v2, v5);

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.computeVertexNormals();

  return geom;
}

export const Campus3DBuildingViewer: React.FC<Campus3DBuildingViewerProps> = ({
  buildings,
  activeBuildingId,
  onSelectBuilding,
  activeFloorNumber,
  onSelectFloor,
  onSwitchToFloorPlan
}) => {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  // State Kontrol
  const [cameraPreset, setCameraPreset] = useState<'drone' | 'labtek_ft1' | 'courtyard' | 'front' | 'iso'>('drone');
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day'); // Default siang cerah seperti foto lapangan
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [hoveredBuildingId, setHoveredBuildingId] = useState<string | null>(null);
  const [selectedCampusBuilding, setSelectedCampusBuilding] = useState<CampusBuildingDef>(
    ALL_CAMPUS_BUILDINGS.find(b => b.id === activeBuildingId) || ALL_CAMPUS_BUILDINGS[0]
  );

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const buildingGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const buildingRoofsRef = useRef<Map<string, THREE.Group>>(new Map());
  const buildingFloor2sRef = useRef<Map<string, THREE.Group>>(new Map());
  const highlightMeshesRef = useRef<Map<string, THREE.LineSegments>>(new Map());
  const hitBoxesRef = useRef<THREE.Mesh[]>([]);

  // Lighting
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Orbit State
  const orbitState = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    azimuth: 0.58,
    polar: 0.82,
    distance: 125,
    target: new THREE.Vector3(2, 4, -5),
    targetAzimuth: 0.58,
    targetPolar: 0.82,
    targetDistance: 125
  });

  useEffect(() => {
    const found = ALL_CAMPUS_BUILDINGS.find(b => b.id === activeBuildingId);
    if (found) setSelectedCampusBuilding(found);
  }, [activeBuildingId]);

  useEffect(() => {
    highlightMeshesRef.current.forEach((mesh, id) => {
      mesh.visible = id === selectedCampusBuilding.id;
    });
  }, [selectedCampusBuilding]);

  // Preset Kamera Akurat
  const applyCameraPreset = useCallback((preset: 'drone' | 'labtek_ft1' | 'courtyard' | 'front' | 'iso') => {
    setCameraPreset(preset);
    const os = orbitState.current;
    if (preset === 'drone') {
      // Sudut Foto Drone Asli (Mencakup seluruh kawasan fakultas)
      os.targetAzimuth = 0.58;
      os.targetPolar = 0.82;
      os.targetDistance = 125;
      os.target.set(2, 4, -5);
    } else if (preset === 'labtek_ft1') {
      // Fokus ke LABTEK 1 & FT.1 (yang dilingkari merah)
      os.targetAzimuth = 0.52;
      os.targetPolar = 0.86;
      os.targetDistance = 75;
      os.target.set(-22, 5, 0);
    } else if (preset === 'courtyard') {
      // Sudut Jalan Koridor Paving Tengah (Persis Foto 4 "Kita lihat ke sana")
      os.targetAzimuth = 0.02;
      os.targetPolar = 1.32;
      os.targetDistance = 55;
      os.target.set(2, 4, 0);
    } else if (preset === 'front') {
      // Tampak Depan Jalan Utama Kampus & Fasad Dekanat
      os.targetAzimuth = 0.05;
      os.targetPolar = 1.35;
      os.targetDistance = 90;
      os.target.set(2, 5, 14);
    } else if (preset === 'iso') {
      // Isometrik Klasik 45 Derajat
      os.targetAzimuth = 0.785;
      os.targetPolar = 0.95;
      os.targetDistance = 115;
      os.target.set(2, 4, -5);
    }
  }, []);

  // Waktu Pencahayaan
  useEffect(() => {
    if (!sceneRef.current || !sunLightRef.current || !ambientLightRef.current || !hemiLightRef.current) return;

    const scene = sceneRef.current;
    const sun = sunLightRef.current;
    const ambient = ambientLightRef.current;
    const hemi = hemiLightRef.current;

    if (timeOfDay === 'day') {
      // Siang Cerah Bersih Langit Biru (Persis Foto 2, 3, 4, 5 Lapangan)
      scene.background = new THREE.Color(isDark ? '#0b1329' : '#87ceeb');
      scene.fog = new THREE.FogExp2(isDark ? '#0b1329' : '#b0e0e6', 0.0035);
      sun.color.set('#ffffff');
      sun.intensity = 2.9;
      sun.position.set(65, 100, 55);
      ambient.color.set('#ffffff');
      ambient.intensity = 1.1;
      hemi.color.set('#93c5fd');
      hemi.groundColor.set('#86efac');
      hemi.intensity = 0.9;
    } else if (timeOfDay === 'sunset') {
      // Golden Hour berkabut (Persis Foto Drone 1)
      scene.background = new THREE.Color(isDark ? '#1a1829' : '#d8d4c7');
      scene.fog = new THREE.FogExp2(isDark ? '#1a1829' : '#d8d4c7', 0.0055);
      sun.color.set('#f59e0b');
      sun.intensity = 2.6;
      sun.position.set(85, 52, 65);
      ambient.color.set('#fed7aa');
      ambient.intensity = 0.95;
      hemi.color.set('#fdba74');
      hemi.groundColor.set('#475569');
      hemi.intensity = 0.75;
    } else {
      // Malam Hari Lampu Menyala
      scene.background = new THREE.Color('#030712');
      scene.fog = new THREE.FogExp2('#030712', 0.009);
      sun.color.set('#38bdf8');
      sun.intensity = 0.35;
      sun.position.set(-40, 50, -40);
      ambient.color.set('#1e293b');
      ambient.intensity = 0.6;
      hemi.color.set('#1e3a8a');
      hemi.groundColor.set('#064e3b');
      hemi.intensity = 0.5;
    }
  }, [timeOfDay, isDark]);

  // Mode Potongan Lantai
  useEffect(() => {
    const targetYRoof = isExploded ? 10.5 : 0;
    const targetYFloor2 = isExploded ? 5.0 : 0;

    const animateLift = () => {
      buildingRoofsRef.current.forEach((roof) => {
        roof.position.y += (targetYRoof - roof.position.y) * 0.15;
      });
      buildingFloor2sRef.current.forEach((fl2) => {
        fl2.position.y += (targetYFloor2 - fl2.position.y) * 0.15;
      });
    };

    const interval = setInterval(animateLift, 16);
    return () => clearInterval(interval);
  }, [isExploded]);

  // Inisialisasi WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 650;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isDark ? '#0b1329' : '#87ceeb');
    scene.fog = new THREE.FogExp2(isDark ? '#0b1329' : '#b0e0e6', 0.0035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.5, 950);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.1);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#93c5fd', '#86efac', 0.9);
    hemiLightRef.current = hemiLight;
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#ffffff', 2.9);
    sunLightRef.current = sunLight;
    sunLight.position.set(65, 100, 55);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 400;
    const d = 100;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0002;
    scene.add(sunLight);

    // 5. TEKSTUR PROCEDURAL PBR REALISTIS
    const wallTexture = generateSkyBlueWallTexture();
    const ft1SignTexture = generateFT1SignTexture();
    const ft2SignTexture = generateFT2SignTexture();
    const labtek1SignTexture = generateLabtek1SignTexture();
    const dekanatSignTexture = generateDekanatSignTexture();
    const roofTexture = generateRoofTileTexture();
    const pavingTexture = generateHerringbonePavingTexture();
    const windowTexture = generateWindowTexture();
    const grassTexture = generateGrassTexture();

    // 6. MATERIAL REALISTIS (SESUAI FOTO REAL LIFE)
    // Dinding Biru Muda Cerulean
    const wallSkyBlueMat = new THREE.MeshStandardMaterial({
      map: wallTexture,
      roughness: 0.45,
      metalness: 0.08
    });

    // Kolom & Sudut Pilar: BIRU TUA COBALT / ROYAL BLUE (Sesuai Foto 2 & 5)
    const pillarRoyalBlueMat = new THREE.MeshStandardMaterial({
      color: '#1565c0', // Biru tua royal kolom asli FT
      roughness: 0.4,
      metalness: 0.12
    });

    // Lisplang & Trims: PUTIH BERSIH
    const whiteTrimMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.35,
      metalness: 0.05
    });

    const plinthMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      roughness: 0.85
    });

    const windowGlassMat = new THREE.MeshStandardMaterial({
      map: windowTexture,
      roughness: 0.12,
      metalness: 0.85
    });

    const roofTileMat = new THREE.MeshStandardMaterial({
      map: roofTexture,
      roughness: 0.55,
      metalness: 0.1,
      flatShading: true
    });

    const roofRidgeMat = new THREE.MeshStandardMaterial({
      color: '#4e190e',
      roughness: 0.5
    });

    // 7. LINGKUNGAN KAMPUS (Ground, Paving Herringbone, Jalan, Danau, Jembatan Penghubung)
    // 7a. Rumput
    const groundGeo = new THREE.PlaneGeometry(360, 360);
    const groundMat = new THREE.MeshStandardMaterial({
      map: grassTexture,
      roughness: 0.85,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.15;
    ground.receiveShadow = true;
    scene.add(ground);

    // 7b. Danau Retensi Timur
    const pondGeo = new THREE.CylinderGeometry(20, 24, 0.45, 36);
    const pondMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.08,
      metalness: 0.85,
      transparent: true,
      opacity: 0.9
    });
    const pond = new THREE.Mesh(pondGeo, pondMat);
    pond.position.set(68, 0.05, 5);
    pond.scale.set(1.4, 1, 0.95);
    scene.add(pond);

    // 7c. Jalan Paving Herringbone Luas di Koridor Tengah (Persis Foto 4)
    const pavingMat = new THREE.MeshStandardMaterial({
      map: pavingTexture,
      roughness: 0.75,
      metalness: 0.12
    });

    // Koridor Paving Utama Tengah (antara LABTEK/FT.1 dan Dekanat/FT.2)
    const mainStreetPaving = new THREE.Mesh(new THREE.PlaneGeometry(36, 120), pavingMat);
    mainStreetPaving.rotation.x = -Math.PI / 2;
    mainStreetPaving.position.set(2, -0.04, -5);
    mainStreetPaving.receiveShadow = true;
    scene.add(mainStreetPaving);

    // Paving Penghubung Barat (LABTEK 1 ke FT.1)
    const westPlaza = new THREE.Mesh(new THREE.PlaneGeometry(60, 24), pavingMat);
    westPlaza.rotation.x = -Math.PI / 2;
    westPlaza.position.set(-22, -0.05, 0);
    westPlaza.receiveShadow = true;
    scene.add(westPlaza);

    // Paving Penghubung Timur (Dekanat ke FT.2)
    const eastPlaza = new THREE.Mesh(new THREE.PlaneGeometry(56, 24), pavingMat);
    eastPlaza.rotation.x = -Math.PI / 2;
    eastPlaza.position.set(28, -0.05, 0);
    eastPlaza.receiveShadow = true;
    scene.add(eastPlaza);

    // 7d. KANOPI KORIDOR PENGHUBUNG BIRU (Sesuai Foto 4: Canopy Bridge Tengah)
    const bridgeCanopyGeo = new THREE.BoxGeometry(24, 0.45, 6);
    const bridgeCanopyMat = new THREE.MeshStandardMaterial({ color: '#1565c0', roughness: 0.4 });
    const bridgeCanopy = new THREE.Mesh(bridgeCanopyGeo, bridgeCanopyMat);
    bridgeCanopy.position.set(2, 4.2, 0);
    bridgeCanopy.castShadow = true;
    scene.add(bridgeCanopy);

    // Tiang Kanopi Penghubung
    const pMat = new THREE.MeshStandardMaterial({ color: '#1565c0' });
    [-8, 8].forEach((bx) => {
      [-2.4, 2.4].forEach((bz) => {
        const bp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.2, 0.5), pMat);
        bp.position.set(2 + bx, 2.1, bz);
        bp.castShadow = true;
        scene.add(bp);
      });
    });

    // 8. BUILDER SEMUA BANGUNAN KAMPUS LENGKAP
    hitBoxesRef.current = [];
    buildingGroupsRef.current.clear();
    buildingRoofsRef.current.clear();
    buildingFloor2sRef.current.clear();
    highlightMeshesRef.current.clear();

    ALL_CAMPUS_BUILDINGS.forEach((bldg) => {
      const bldgGroup = new THREE.Group();
      bldgGroup.position.set(bldg.x, 0, bldg.z);
      bldgGroup.name = bldg.id;

      const floorHeight = bldg.height / 2;
      const roofPeak = bldg.roofHeight;

      // 1. Pondasi Beton Plinth
      const plinthMesh = new THREE.Mesh(
        new THREE.BoxGeometry(bldg.length + 2.4, 0.5, bldg.depth + 2.4),
        plinthMat
      );
      plinthMesh.position.y = 0.25;
      plinthMesh.castShadow = true;
      plinthMesh.receiveShadow = true;
      bldgGroup.add(plinthMesh);

      // 2. Dinding Utama: CAT BIRU CERULEAN ASLI (Sky Blue)
      // Lantai 1
      const floor1Group = new THREE.Group();
      const wall1Mesh = new THREE.Mesh(
        new THREE.BoxGeometry(bldg.length, floorHeight, bldg.depth),
        wallSkyBlueMat
      );
      wall1Mesh.position.y = 0.5 + floorHeight / 2;
      wall1Mesh.castShadow = true;
      wall1Mesh.receiveShadow = true;
      floor1Group.add(wall1Mesh);

      // Kolom Struktural: BIRU TUA ROYAL (Cobalt Blue Pillars)
      const colCount = Math.max(7, Math.floor(bldg.length / 5));
      const colStep = bldg.length / (colCount - 1);
      const colGeo = new THREE.BoxGeometry(0.8, floorHeight + 0.1, 0.8);

      for (let i = 0; i < colCount; i++) {
        const cx = -bldg.length / 2 + i * colStep;

        // Pilar depan biru tua
        const colFront = new THREE.Mesh(colGeo, pillarRoyalBlueMat);
        colFront.position.set(cx, 0.5 + floorHeight / 2, bldg.depth / 2 + 0.1);
        colFront.castShadow = true;
        floor1Group.add(colFront);

        // Pilar belakang biru tua
        const colBack = new THREE.Mesh(colGeo, pillarRoyalBlueMat);
        colBack.position.set(cx, 0.5 + floorHeight / 2, -bldg.depth / 2 - 0.1);
        colBack.castShadow = true;
        floor1Group.add(colBack);

        // Jendela Kaca Reflektif Antar-Kolom
        if (i < colCount - 1) {
          const winW = colStep - 0.85;
          const winH = 1.85;

          const winFront = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), windowGlassMat);
          winFront.position.set(cx + colStep / 2, 0.5 + 2.0, bldg.depth / 2 + 0.08);
          floor1Group.add(winFront);

          const winBack = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), windowGlassMat);
          winBack.rotation.y = Math.PI;
          winBack.position.set(cx + colStep / 2, 0.5 + 2.0, -bldg.depth / 2 - 0.08);
          floor1Group.add(winBack);

          // Lisplang Kanopi Kecil Putih di Atas Jendela (Sunshade Ledge)
          const shadeFront = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.2, 0.15, 0.7), whiteTrimMat);
          shadeFront.position.set(cx + colStep / 2, 0.5 + 2.95, bldg.depth / 2 + 0.4);
          shadeFront.castShadow = true;
          floor1Group.add(shadeFront);
        }
      }

      bldgGroup.add(floor1Group);

      // 3. Lantai 2
      const floor2Group = new THREE.Group();
      floor2Group.position.y = 0.5 + floorHeight;

      // Sabuk Balok Tengah Putih
      const beamMesh = new THREE.Mesh(
        new THREE.BoxGeometry(bldg.length + 1.2, 0.45, bldg.depth + 1.2),
        whiteTrimMat
      );
      beamMesh.position.y = 0.22;
      beamMesh.castShadow = true;
      floor2Group.add(beamMesh);

      const wall2Mesh = new THREE.Mesh(
        new THREE.BoxGeometry(bldg.length, floorHeight, bldg.depth),
        wallSkyBlueMat
      );
      wall2Mesh.position.y = 0.45 + floorHeight / 2;
      wall2Mesh.castShadow = true;
      wall2Mesh.receiveShadow = true;
      floor2Group.add(wall2Mesh);

      for (let i = 0; i < colCount; i++) {
        const cx = -bldg.length / 2 + i * colStep;

        const colFront = new THREE.Mesh(colGeo, pillarRoyalBlueMat);
        colFront.position.set(cx, 0.45 + floorHeight / 2, bldg.depth / 2 + 0.1);
        colFront.castShadow = true;
        floor2Group.add(colFront);

        const colBack = new THREE.Mesh(colGeo, pillarRoyalBlueMat);
        colBack.position.set(cx, 0.45 + floorHeight / 2, -bldg.depth / 2 - 0.1);
        colBack.castShadow = true;
        floor2Group.add(colBack);

        if (i < colCount - 1) {
          const winW = colStep - 0.85;
          const winH = 1.85;

          const winFront = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), windowGlassMat);
          winFront.position.set(cx + colStep / 2, 0.45 + 2.0, bldg.depth / 2 + 0.08);
          floor2Group.add(winFront);

          const winBack = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), windowGlassMat);
          winBack.rotation.y = Math.PI;
          winBack.position.set(cx + colStep / 2, 0.45 + 2.0, -bldg.depth / 2 - 0.08);
          floor2Group.add(winBack);

          const shadeFront = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.2, 0.15, 0.7), whiteTrimMat);
          shadeFront.position.set(cx + colStep / 2, 0.45 + 2.95, bldg.depth / 2 + 0.4);
          shadeFront.castShadow = true;
          floor2Group.add(shadeFront);
        }
      }

      // Fasad Ujung Timur dengan Plang Huruf 3D Putih Asli (Sesuai Foto 2, 3, 5)
      let signMat: THREE.MeshStandardMaterial | null = null;
      if (bldg.signType === 'ft1') {
        signMat = new THREE.MeshStandardMaterial({ map: ft1SignTexture, roughness: 0.4 });
      } else if (bldg.signType === 'ft2') {
        signMat = new THREE.MeshStandardMaterial({ map: ft2SignTexture, roughness: 0.4 });
      } else if (bldg.signType === 'labtek1') {
        signMat = new THREE.MeshStandardMaterial({ map: labtek1SignTexture, roughness: 0.4 });
      }

      if (signMat) {
        // Tempelkan plang nama timbul pada fasad ujung barat/timur gedung
        const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(bldg.depth * 0.9, floorHeight * 1.8), signMat);
        signMesh.rotation.y = Math.PI / 2;
        signMesh.position.set(bldg.length / 2 + 0.08, 0.5 + floorHeight, 0);
        bldgGroup.add(signMesh);
      }

      bldgGroup.add(floor2Group);
      buildingFloor2sRef.current.set(bldg.id, floor2Group);

      // 4. Atap Limasan (Hip Roof) dengan Genteng Merah Cokelat Asli
      const roofGroup = new THREE.Group();
      roofGroup.position.y = 0.5 + floorHeight * 2 + 0.45;

      const eaveOverhang = 1.5;
      const roofW = bldg.length + eaveOverhang * 2;
      const roofD = bldg.depth + eaveOverhang * 2;

      // Lisplang Putih Keliling Atap (Eaves Fascia)
      const fasciaMesh = new THREE.Mesh(new THREE.BoxGeometry(roofW, 0.4, roofD), whiteTrimMat);
      fasciaMesh.position.y = 0.2;
      fasciaMesh.castShadow = true;
      roofGroup.add(fasciaMesh);

      // Bidang Miring Genteng Atap Limasan
      const hipRoofGeo = createHipRoofGeometry(roofW, roofD, roofPeak, 10.5);
      const hipRoofMesh = new THREE.Mesh(hipRoofGeo, roofTileMat);
      hipRoofMesh.position.y = 0.4;
      hipRoofMesh.castShadow = true;
      hipRoofMesh.receiveShadow = true;
      roofGroup.add(hipRoofMesh);

      // Nok Jurai Puncak (Apex Ridge)
      const ridgeLen = Math.max(4, roofW - 10.5 * 2);
      const ridgeMesh = new THREE.Mesh(new THREE.BoxGeometry(ridgeLen, 0.35, 0.7), roofRidgeMat);
      ridgeMesh.position.set(0, 0.4 + roofPeak + 0.05, 0);
      roofGroup.add(ridgeMesh);

      bldgGroup.add(roofGroup);
      buildingRoofsRef.current.set(bldg.id, roofGroup);

      // 5. Kanopi Teras Pintu Masuk
      if (bldg.hasFrontCanopy) {
        const canW = bldg.isDekanat ? 16.0 : 9.5;
        const canD = bldg.isDekanat ? 7.5 : 5.8;
        const canH = 3.8;
        const canX = bldg.canopyX ?? (bldg.isDekanat ? 0 : 8);
        const canZ = bldg.depth / 2 + canD / 2;

        const canopyRoof = new THREE.Mesh(new THREE.BoxGeometry(canW, 0.45, canD), whiteTrimMat);
        canopyRoof.position.set(canX, canH, canZ);
        canopyRoof.castShadow = true;
        bldgGroup.add(canopyRoof);

        // Pilar Kanopi Biru Tua Royal
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.65, canH, 0.65), pillarRoyalBlueMat);
        p1.position.set(canX - canW / 2 + 0.6, canH / 2, canZ + canD / 2 - 0.6);
        p1.castShadow = true;
        bldgGroup.add(p1);

        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.65, canH, 0.65), pillarRoyalBlueMat);
        p2.position.set(canX + canW / 2 - 0.6, canH / 2, canZ + canD / 2 - 0.6);
        p2.castShadow = true;
        bldgGroup.add(p2);

        // Anak Tangga Masuk
        const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(canW - 1, 0.25, 2.5), plinthMat);
        stepMesh.position.set(canX, 0.12, canZ + canD / 2 + 1.0);
        stepMesh.receiveShadow = true;
        bldgGroup.add(stepMesh);

        // Plang Nama Emas Resmi Dekanat
        if (bldg.isDekanat) {
          const signBoard = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 3.0),
            new THREE.MeshStandardMaterial({ map: dekanatSignTexture, roughness: 0.3, metalness: 0.4 })
          );
          signBoard.position.set(canX, canH + 1.8, canZ + canD / 2 + 0.05);
          bldgGroup.add(signBoard);
        }
      }

      // 6. Highlight Selection Box
      const highlightGeo = new THREE.BoxGeometry(bldg.length + 3.2, bldg.height + roofPeak + 2, bldg.depth + 3.2);
      const highlightEdges = new THREE.EdgesGeometry(highlightGeo);
      const highlightMat = new THREE.LineBasicMaterial({
        color: bldg.hasFloorPlan ? '#10b981' : '#38bdf8',
        linewidth: 3
      });
      const highlightMesh = new THREE.LineSegments(highlightEdges, highlightMat);
      highlightMesh.position.y = (bldg.height + roofPeak) / 2;
      highlightMesh.visible = bldg.id === activeBuildingId;
      bldgGroup.add(highlightMesh);
      highlightMeshesRef.current.set(bldg.id, highlightMesh);

      // 7. Hitbox
      const hitBoxGeo = new THREE.BoxGeometry(bldg.length + 3.0, bldg.height + roofPeak + 1, bldg.depth + 3.0);
      const hitBoxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBox.position.y = (bldg.height + roofPeak) / 2;
      hitBox.userData = { buildingDef: bldg };
      bldgGroup.add(hitBox);
      hitBoxesRef.current.push(hitBox);

      scene.add(bldgGroup);
      buildingGroupsRef.current.set(bldg.id, bldgGroup);
    });

    // 9. VEGETASI & POHON KAMPUS (Sesuai Foto Udara)
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: '#4a3325', roughness: 0.95 });
    const leafDarkMat = new THREE.MeshStandardMaterial({ color: '#1b4332', roughness: 0.85 });
    const leafMidMat = new THREE.MeshStandardMaterial({ color: '#2d6a4f', roughness: 0.8 });
    const leafLightMat = new THREE.MeshStandardMaterial({ color: '#52b788', roughness: 0.75 });

    const createCanopyTree = (x: number, z: number, scale = 1) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.6 * scale, 3.5 * scale, 7), treeTrunkMat);
      trunk.position.y = 1.75 * scale;
      trunk.castShadow = true;
      group.add(trunk);

      const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4 * scale, 1), leafDarkMat);
      crown1.position.set(0, 3.8 * scale, 0);
      crown1.castShadow = true;
      group.add(crown1);

      const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8 * scale, 1), leafMidMat);
      crown2.position.set(0.6 * scale, 5.2 * scale, 0.4 * scale);
      crown2.castShadow = true;
      group.add(crown2);

      const crown3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4 * scale, 1), leafLightMat);
      crown3.position.set(-0.5 * scale, 5.0 * scale, -0.3 * scale);
      crown3.castShadow = true;
      group.add(crown3);

      scene.add(group);
    };

    const trees = [
      [-70, 22, 1.3], [-72, 0, 1.2], [-70, -22, 1.4],
      [-46, 14, 0.95], [-44, -14, 1.0], [4, 14, 0.85], [4, -14, 0.9],
      [72, 24, 1.2], [82, 14, 1.3], [85, -2, 1.4], [78, -16, 1.1],
      [-45, 34, 0.9], [-22, 34, 0.85], [0, 34, 0.9], [15, 34, 0.85], [48, 34, 0.95],
      [-32, -56, 1.3], [-8, -56, 1.2], [18, -56, 1.35], [46, -56, 1.25]
    ];
    trees.forEach(([tx, tz, ts]) => createCanopyTree(tx, tz, ts));

    // 10. Interaksi Mouse & Touch
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      orbitState.current.isDragging = true;
      orbitState.current.prevX = clientX;
      orbitState.current.prevY = clientY;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hitBoxesRef.current);

      if (intersects.length > 0) {
        const def = intersects[0].object.userData.buildingDef as CampusBuildingDef;
        container.style.cursor = 'pointer';
        setHoveredBuildingId(def.id);
      } else {
        container.style.cursor = orbitState.current.isDragging ? 'grabbing' : 'default';
        setHoveredBuildingId(null);
      }

      if (!orbitState.current.isDragging) return;

      const deltaX = clientX - orbitState.current.prevX;
      const deltaY = clientY - orbitState.current.prevY;
      orbitState.current.prevX = clientX;
      orbitState.current.prevY = clientY;

      orbitState.current.targetAzimuth -= deltaX * 0.0055;
      orbitState.current.targetPolar = Math.max(0.12, Math.min(Math.PI / 2 - 0.04, orbitState.current.targetPolar - deltaY * 0.0055));
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hitBoxesRef.current);

      if (intersects.length > 0) {
        const def = intersects[0].object.userData.buildingDef as CampusBuildingDef;
        setSelectedCampusBuilding(def);
        if (def.hasFloorPlan) {
          onSelectBuilding(def.id);
        }
      }

      orbitState.current.isDragging = false;
      container.style.cursor = 'default';
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitState.current.targetDistance = Math.max(30, Math.min(190, orbitState.current.targetDistance + e.deltaY * 0.08));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handlePointerDown);
    domEl.addEventListener('mousemove', handlePointerMove);
    domEl.addEventListener('mouseup', handlePointerUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    domEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    domEl.addEventListener('touchmove', handlePointerMove, { passive: true });
    domEl.addEventListener('touchend', handlePointerUp);

    // 11. Loop Render Animasi
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const os = orbitState.current;

      if (isAutoRotate && !os.isDragging) {
        os.targetAzimuth += 0.0022;
      }

      os.azimuth += (os.targetAzimuth - os.azimuth) * 0.08;
      os.polar += (os.targetPolar - os.polar) * 0.08;
      os.distance += (os.targetDistance - os.distance) * 0.08;

      const cx = os.target.x + os.distance * Math.sin(os.polar) * Math.sin(os.azimuth);
      const cy = os.target.y + os.distance * Math.cos(os.polar);
      const cz = os.target.z + os.distance * Math.sin(os.polar) * Math.cos(os.azimuth);

      camera.position.set(cx, cy, cz);
      camera.lookAt(os.target);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight || 650;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      domEl.removeEventListener('mousedown', handlePointerDown);
      domEl.removeEventListener('mousemove', handlePointerMove);
      domEl.removeEventListener('mouseup', handlePointerUp);
      domEl.removeEventListener('wheel', handleWheel);
      domEl.removeEventListener('touchstart', handlePointerDown);
      domEl.removeEventListener('touchmove', handlePointerMove);
      domEl.removeEventListener('touchend', handlePointerUp);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [isAutoRotate, onSelectBuilding, isDark]);

  return (
    <div className="relative w-full bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-xl overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* 1. Header Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Visualisasi 3D Realistis Kawasan Fakultas Teknik
                </h3>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Denah Interaktif: LABTEK 1 & FT.1</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Model 3D arsitektural akurat berbasis foto drone udara: tekstur genteng limasan, dinding biru FT, dan lanskap danau.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Preset Kamera */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => applyCameraPreset('drone')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                cameraPreset === 'drone'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
              title="Sudut pandang udara seluruh kawasan persis seperti foto drone asli"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Foto Drone</span>
            </button>

            <button
              onClick={() => applyCameraPreset('labtek_ft1')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                cameraPreset === 'labtek_ft1'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
              title="Fokus ke Gedung LABTEK 1 & FT.1 (Area yang ditandai merah)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Fokus LABTEK & FT.1</span>
            </button>

            <button
              onClick={() => applyCameraPreset('courtyard')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                cameraPreset === 'courtyard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
              title="Sudut pandang jalan paving tengah (Persis Foto Lapangan)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Koridor Tengah</span>
            </button>

            <button
              onClick={() => applyCameraPreset('front')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                cameraPreset === 'front'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
              title="Tampak Depan Dekanat & Jalan Utama"
            >
              Depan
            </button>

            <button
              onClick={() => applyCameraPreset('iso')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                cameraPreset === 'iso'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
              title="Sudut Isometrik Arsitektur"
            >
              Isometrik
            </button>
          </div>

          {/* Mode Potongan Lantai (Exploded) */}
          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isExploded
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30 ring-2 ring-emerald-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50'
            }`}
            title="Angkat atap seluruh gedung untuk melihat potongan lantai"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isExploded ? 'Tutup Atap' : 'Potongan Lantai 3D'}</span>
          </button>

          {/* Pencahayaan */}
          <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl gap-0.5">
            <button
              onClick={() => setTimeOfDay('day')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                timeOfDay === 'day' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Siang Cerah (Persis Foto 2-5)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTimeOfDay('sunset')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                timeOfDay === 'sunset' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Sore / Golden Hour (Sesuai Foto Drone Asli)"
            >
              <Sunset className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTimeOfDay('night')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                timeOfDay === 'night' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Malam Hari"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
              isAutoRotate
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
            title={isAutoRotate ? 'Hentikan Putaran Otomatis' : 'Putar 3D Otomatis'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
          </button>

          {/* Tombol Bandingkan Foto Drone Asli */}
          <button
            onClick={() => setShowPhotoModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
            title="Lihat foto drone asli yang ditandai lingkaran merah"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Foto Drone Asli</span>
          </button>
        </div>
      </div>

      {/* 2. WebGL 3D Canvas Viewport */}
      <div className="relative w-full h-[580px] sm:h-[660px] bg-slate-900 select-none overflow-hidden">
        
        {/* Kanvas Three.js */}
        <div ref={containerRef} className="w-full h-full touch-none" />

        {/* 🏷️ Floating Building Pills di Kiri Atas */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto max-w-[280px]">
          
          <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
            <span>Pilih Bangunan Kampus:</span>
          </div>

          {/* LABTEK 1 (Denah Tersedia) */}
          <button
            onClick={() => {
              const def = ALL_CAMPUS_BUILDINGS.find(b => b.id === 'gedung-a')!;
              setSelectedCampusBuilding(def);
              onSelectBuilding('gedung-a');
            }}
            className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl backdrop-blur-md text-xs font-extrabold transition-all shadow-lg cursor-pointer border text-left ${
              selectedCampusBuilding.id === 'gedung-a'
                ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/40 translate-x-1'
                : 'bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedCampusBuilding.id === 'gedung-a' ? 'bg-white animate-ping' : 'bg-emerald-500'}`} />
              <div>
                <span className="block font-bold">Gedung LABTEK 1</span>
                <span className="text-[10px] font-normal opacity-80 block">Labkom & Riset Terpadu</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-700/80 text-white shrink-0">
              Denah 3D ✓
            </span>
          </button>

          {/* FT.1 (Denah Tersedia) */}
          <button
            onClick={() => {
              const def = ALL_CAMPUS_BUILDINGS.find(b => b.id === 'gedung-b')!;
              setSelectedCampusBuilding(def);
              onSelectBuilding('gedung-b');
            }}
            className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl backdrop-blur-md text-xs font-extrabold transition-all shadow-lg cursor-pointer border text-left ${
              selectedCampusBuilding.id === 'gedung-b'
                ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/40 translate-x-1'
                : 'bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedCampusBuilding.id === 'gedung-b' ? 'bg-white animate-ping' : 'bg-emerald-500'}`} />
              <div>
                <span className="block font-bold">Gedung FT.1</span>
                <span className="text-[10px] font-normal opacity-80 block">Informatika & SI</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-700/80 text-white shrink-0">
              Denah 3D ✓
            </span>
          </button>

          {/* Gedung Dekanat FT */}
          <button
            onClick={() => {
              const def = ALL_CAMPUS_BUILDINGS.find(b => b.id === 'dekanat-ft')!;
              setSelectedCampusBuilding(def);
            }}
            className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs transition-all shadow-sm cursor-pointer border text-left ${
              selectedCampusBuilding.id === 'dekanat-ft'
                ? 'bg-sky-700 text-white border-sky-400 ring-2 ring-sky-400/30'
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white'
            }`}
          >
            <span className="font-semibold text-[11px]">Gedung Dekanat FT</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              Eksterior
            </span>
          </button>

          {/* Gedung FT.2 */}
          <button
            onClick={() => {
              const def = ALL_CAMPUS_BUILDINGS.find(b => b.id === 'gedung-ft2')!;
              setSelectedCampusBuilding(def);
            }}
            className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs transition-all shadow-sm cursor-pointer border text-left ${
              selectedCampusBuilding.id === 'gedung-ft2'
                ? 'bg-sky-700 text-white border-sky-400 ring-2 ring-sky-400/30'
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white'
            }`}
          >
            <span className="font-semibold text-[11px]">Gedung FT.2 (Elektro)</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              Eksterior
            </span>
          </button>

        </div>

        {/* Petunjuk Interaksi Navigasi */}
        <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
          <span>Klik bangunan mana saja untuk memilih • Geser 360° • Scroll Zoom</span>
        </div>

        {/* 📋 Floating Bottom Inspector Card untuk Bangunan Terpilih */}
        <div className="absolute bottom-4 left-4 right-4 z-20 max-w-2xl mx-auto p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-200 dark:border-slate-700 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-modal-spring">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-md shrink-0 ${
              selectedCampusBuilding.hasFloorPlan
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-700'
            }`}>
              {selectedCampusBuilding.code}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {selectedCampusBuilding.name}
                </h4>
                {selectedCampusBuilding.hasFloorPlan ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Denah 3D Aktif</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Hanya Model Eksterior 3D</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {selectedCampusBuilding.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            {selectedCampusBuilding.hasFloorPlan ? (
              <>
                <button
                  onClick={() => {
                    onSelectBuilding(selectedCampusBuilding.id);
                    onSelectFloor(1);
                    if (onSwitchToFloorPlan) onSwitchToFloorPlan();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-extrabold transition-all cursor-pointer"
                >
                  Lantai 1
                </button>

                <button
                  onClick={() => {
                    onSelectBuilding(selectedCampusBuilding.id);
                    onSelectFloor(2);
                    if (onSwitchToFloorPlan) onSwitchToFloorPlan();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-extrabold transition-all cursor-pointer"
                >
                  Lantai 2
                </button>

                {onSwitchToFloorPlan && (
                  <button
                    onClick={() => {
                      onSelectBuilding(selectedCampusBuilding.id);
                      onSwitchToFloorPlan();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span>Buka Denah Isometrik</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Denah dikhususkan untuk:
                </span>
                <button
                  onClick={() => {
                    const labtek = ALL_CAMPUS_BUILDINGS.find(b => b.id === 'gedung-a')!;
                    setSelectedCampusBuilding(labtek);
                    onSelectBuilding('gedung-a');
                    if (onSwitchToFloorPlan) onSwitchToFloorPlan();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Buka LABTEK 1
                </button>
                <button
                  onClick={() => {
                    const ft1 = ALL_CAMPUS_BUILDINGS.find(b => b.id === 'gedung-b')!;
                    setSelectedCampusBuilding(ft1);
                    onSelectBuilding('gedung-b');
                    if (onSwitchToFloorPlan) onSwitchToFloorPlan();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Buka FT.1
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. Modal Lightbox Foto Udara Asli Drone */}
      {showPhotoModal && (
        <div 
          className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowPhotoModal(false)}
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-modal-spring"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-white text-sm sm:text-base font-extrabold">
                    Foto Udara Asli Kawasan Fakultas Teknik Universitas Siliwangi
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Kawasan Gedung Kuliah Terpadu dan Laboratorium FT Kampus 2 Mugarsari
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-white/70 hover:text-white px-2 py-1 rounded-lg text-sm font-bold"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="relative p-2 bg-slate-950 flex justify-center">
              <img 
                src="./images/gedung-labtek-ft1-unsil.jpg" 
                alt="Gedung Kuliah Terpadu dan Laboratorium Fakultas Teknik Universitas Siliwangi" 
                className="max-h-[72vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="p-4 bg-slate-900 border-t border-white/10 text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
              <span>
                Area yang dilingkari merah adalah <strong>Gedung LABTEK 1</strong> dan <strong>Gedung FT.1</strong> yang memiliki fitur denah interaktif lengkap.
              </span>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold"
              >
                Kembali ke Model 3D
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
