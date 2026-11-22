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

// Data definisi seluruh bangunan di kompleks Fakultas Teknik Kampus 2 sesuai foto udara asli
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
  color: string;
  hasCanopy?: boolean;
  canopySide?: 'front' | 'back';
  isDekanat?: boolean;
  hasStairTower?: boolean;
  description: string;
}

const ALL_CAMPUS_BUILDINGS: CampusBuildingDef[] = [
  // 1. LABTEK 1 (Gedung A - Bagian Depan Kiri, Dilingkari Merah, Denah Tersedia)
  {
    id: 'gedung-a',
    name: 'Gedung LABTEK 1',
    shortName: 'LABTEK 1',
    code: 'A',
    role: 'Laboratorium Komputer, Jaringan & Riset Terpadu',
    hasFloorPlan: true,
    x: -20,
    z: 14,
    length: 50,
    depth: 13.5,
    height: 7.8,
    roofHeight: 5.2,
    color: '#4a8bc9', // Biru cerulean khas FT UNSIL
    hasCanopy: true,
    hasStairTower: true,
    description: 'Pusat riset informatika, lab kecerdasan buatan, jaringan, server, dan fasilitas akademik.'
  },
  // 2. FT.1 (Gedung B - Sejajar di Belakang LABTEK 1, Dilingkari Merah, Denah Tersedia)
  {
    id: 'gedung-b',
    name: 'Gedung FT.1',
    shortName: 'FT.1',
    code: 'B',
    role: 'Ruang Perkuliahan Teori & Ruang Sidang FT',
    hasFloorPlan: true,
    x: -16,
    z: -12,
    length: 52,
    depth: 13.5,
    height: 7.8,
    roofHeight: 5.2,
    color: '#4a8bc9',
    hasCanopy: true,
    hasStairTower: true,
    description: 'Ruang perkuliahan teori, ruang sidang skripsi, dan administrasi program studi FT.'
  },
  // 3. Gedung Dekanat & Pusat Administrasi Fakultas Teknik (Depan Kanan dengan Fasad Megah & Tiang Bendera)
  {
    id: 'dekanat-ft',
    name: 'Gedung Dekanat & Tata Usaha FT',
    shortName: 'DEKANAT FT',
    code: 'DK',
    role: 'Kantor Dekan, Wakil Dekan & Layanan Administrasi Fakultas',
    hasFloorPlan: false,
    x: 28,
    z: 14,
    length: 46,
    depth: 15.0,
    height: 8.6,
    roofHeight: 5.4,
    color: '#2b6cb0',
    hasCanopy: true,
    isDekanat: true,
    description: 'Pusat pimpinan Fakultas Teknik, ruang senat, pelayanan akademik & kemahasiswaan FT.'
  },
  // 4. Gedung Perkuliahan FT.2 (Sejajar di Belakang Gedung Dekanat)
  {
    id: 'gedung-ft2',
    name: 'Gedung Perkuliahan FT.2',
    shortName: 'FT.2',
    code: 'FT2',
    role: 'Ruang Kuliah & Laboratorium Pendukung Teknik',
    hasFloorPlan: false,
    x: 30,
    z: -12,
    length: 50,
    depth: 13.5,
    height: 7.8,
    roofHeight: 5.2,
    color: '#4a8bc9',
    hasCanopy: true,
    description: 'Kawasan perkuliahan reguler dan laboratorium jurusan teknik.'
  },
  // 5. Gedung Kuliah & Lab Terpadu Belakang 1 (Baris Utara Kiri)
  {
    id: 'lab-utara-1',
    name: 'Gedung Lab Terpadu Utara 1',
    shortName: 'LAB UTARA 1',
    code: 'LU1',
    role: 'Laboratorium Praktikum Terpadu & Bengkel Riset',
    hasFloorPlan: false,
    x: -10,
    z: -38,
    length: 48,
    depth: 13.0,
    height: 7.6,
    roofHeight: 5.0,
    color: '#4a8bc9',
    description: 'Laboratorium riset rekayasa keteknikan dan fasilitas pengujian terpadu.'
  },
  // 6. Gedung Kuliah & Lab Terpadu Belakang 2 (Baris Utara Kanan)
  {
    id: 'lab-utara-2',
    name: 'Gedung Lab Terpadu Utara 2',
    shortName: 'LAB UTARA 2',
    code: 'LU2',
    role: 'Laboratorium Teknik Mesin & Elektro',
    hasFloorPlan: false,
    x: 32,
    z: -38,
    length: 48,
    depth: 13.0,
    height: 7.6,
    roofHeight: 5.0,
    color: '#4a8bc9',
    description: 'Fasilitas penunjang praktikum teknik elektro dan mekanik.'
  },
  // 7. Gedung Penunjang / Workshop Sisi Barat
  {
    id: 'workshop-barat',
    name: 'Gedung Fasilitas Penunjang Barat',
    shortName: 'PENUNJANG',
    code: 'WS',
    role: 'Gedung Workshop, Power House & Utilitas Kampus',
    hasFloorPlan: false,
    x: -54,
    z: 1,
    length: 30,
    depth: 11.0,
    height: 6.5,
    roofHeight: 4.4,
    color: '#475569',
    description: 'Pusat instalasi kelistrikan, genset cadangan, dan sarana pemeliharaan fakultas.'
  }
];

// =========================================================================
// PROCEDURAL PROCEDURAL TEXTURES GENERATORS (PBR HIGH REALISM)
// =========================================================================

// 1. Tekstur Genteng Merah Bata Realistis (Terracotta Roof Tile Bump & Pattern)
function generateRoofTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8a331a';
  ctx.fillRect(0, 0, 512, 512);

  const rowHeight = 32;
  const colWidth = 48;

  for (let y = 0; y < 512; y += rowHeight) {
    const isOdd = (y / rowHeight) % 2 === 1;
    const offsetX = isOdd ? colWidth / 2 : 0;

    // Bayangan overlap bawah genteng
    ctx.fillStyle = '#521d0e';
    ctx.fillRect(0, y + rowHeight - 4, 512, 4);

    // Kilau sorotan cahaya atas genteng
    ctx.fillStyle = '#b44b2c';
    ctx.fillRect(0, y, 512, 3);

    for (let x = -colWidth; x < 512 + colWidth; x += colWidth) {
      const tileX = x + offsetX;
      ctx.fillStyle = '#42160a';
      ctx.fillRect(tileX, y, 2.5, rowHeight);

      // Gradien lekukan genteng
      const grad = ctx.createLinearGradient(tileX, y, tileX + colWidth, y);
      grad.addColorStop(0, 'rgba(0,0,0,0.18)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.08)');
      grad.addColorStop(1, 'rgba(0,0,0,0.22)');
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

// 2. Tekstur Jendela Kaca Reflektif dengan Kusen Putih
function generateWindowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Kaca gelap reflektif
  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#1e3a5f');
  grad.addColorStop(0.4, '#172554');
  grad.addColorStop(0.8, '#0f172a');
  grad.addColorStop(1, '#090d16');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Pantulan langit diagonal
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(30, 250);
  ctx.lineTo(180, 10);
  ctx.lineTo(230, 10);
  ctx.lineTo(80, 250);
  ctx.closePath();
  ctx.fill();

  // Kusen luar putih
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 246, 246);

  // Mullion tengah
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(128, 5);
  ctx.lineTo(128, 251);
  ctx.stroke();

  // Transom bar
  ctx.beginPath();
  ctx.moveTo(5, 80);
  ctx.lineTo(251, 80);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 3. Tekstur Papan Nama Emas FAKULTAS TEKNIK pada Dekanat
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

  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('FAKULTAS TEKNIK', 256, 42);

  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('UNIVERSITAS SILIWANGI', 256, 75);

  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#93c5fd';
  ctx.fillText('GEDUNG DEKANAT & PUSAT ADMINISTRASI', 256, 102);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 4. Tekstur Rumput Hijau Alami Bertekstur (Noise Texture)
function generateGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3d7848';
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

// 5. Tekstur Paving Stone Interlocking Abu-Abu
function generatePavingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 256, 256);

  const blockSize = 32;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.8;

  for (let y = 0; y < 256; y += blockSize) {
    const offset = (y / blockSize) % 2 === 1 ? blockSize / 2 : 0;
    for (let x = -blockSize; x < 256 + blockSize; x += blockSize) {
      const bx = x + offset;
      const shade = (Math.random() * 18 - 9);
      const val = Math.min(240, Math.max(185, 215 + shade));
      ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
      ctx.fillRect(bx + 1, y + 1, blockSize - 2, blockSize - 2);
      ctx.strokeRect(bx, y, blockSize, blockSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
  return texture;
}

// 6. Tekstur Aspal Jalan Depan Lengkap dengan Marka Putih & Kuning
function generateAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 128);

  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 128;
    ctx.fillStyle = Math.random() > 0.5 ? '#334155' : '#0f172a';
    ctx.fillRect(x, y, 2, 2);
  }

  // Trotoar / Kerb tepi jalan
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 512, 6);
  ctx.fillRect(0, 122, 512, 6);

  // Marka putus-putus tengah jalan
  ctx.fillStyle = '#fde047';
  for (let x = 0; x < 512; x += 48) {
    ctx.fillRect(x + 8, 62, 32, 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 1);
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

  // State Kontrol Interaktif
  const [cameraPreset, setCameraPreset] = useState<'drone' | 'labtek_ft1' | 'front' | 'iso' | 'top'>('drone');
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [timeOfDay, setTimeOfDay] = useState<'sunset' | 'day' | 'night'>('sunset'); // Default golden hour sore seperti foto
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

  // Lighting References
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Orbit State
  const orbitState = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    azimuth: 0.58, // Sudut pandang persis seperti foto drone
    polar: 0.82,
    distance: 120,
    target: new THREE.Vector3(5, 4, -4),
    targetAzimuth: 0.58,
    targetPolar: 0.82,
    targetDistance: 120
  });

  // Sinkronisasi pilihan gedung dari luar
  useEffect(() => {
    const found = ALL_CAMPUS_BUILDINGS.find(b => b.id === activeBuildingId);
    if (found) {
      setSelectedCampusBuilding(found);
    }
  }, [activeBuildingId]);

  // Update highlight garis seleksi pada gedung aktif
  useEffect(() => {
    highlightMeshesRef.current.forEach((mesh, id) => {
      mesh.visible = id === selectedCampusBuilding.id;
    });
  }, [selectedCampusBuilding]);

  // Preset Kamera Smooth
  const applyCameraPreset = useCallback((preset: 'drone' | 'labtek_ft1' | 'front' | 'iso' | 'top') => {
    setCameraPreset(preset);
    const os = orbitState.current;
    if (preset === 'drone') {
      // Sudut Foto Drone Asli (Mencakup seluruh kawasan fakultas)
      os.targetAzimuth = 0.58;
      os.targetPolar = 0.82;
      os.targetDistance = 120;
      os.target.set(5, 4, -4);
    } else if (preset === 'labtek_ft1') {
      // Fokus Khusus pada Gedung LABTEK 1 & FT.1 yang dilingkari merah
      os.targetAzimuth = 0.55;
      os.targetPolar = 0.88;
      os.targetDistance = 75;
      os.target.set(-18, 5, 2);
    } else if (preset === 'front') {
      // Tampak Depan Jalan Utama Kampus & Fasad Dekanat
      os.targetAzimuth = 0.05;
      os.targetPolar = 1.35;
      os.targetDistance = 90;
      os.target.set(4, 5, 14);
    } else if (preset === 'iso') {
      // Isometrik Klasik 45 Derajat
      os.targetAzimuth = 0.785;
      os.targetPolar = 0.95;
      os.targetDistance = 115;
      os.target.set(5, 4, -4);
    } else if (preset === 'top') {
      // Tampak Atas Master Plan Seluruh Fakultas
      os.targetAzimuth = 0;
      os.targetPolar = 0.15;
      os.targetDistance = 145;
      os.target.set(5, 0, -6);
    }
  }, []);

  // Waktu Pencahayaan
  useEffect(() => {
    if (!sceneRef.current || !sunLightRef.current || !ambientLightRef.current || !hemiLightRef.current) return;

    const scene = sceneRef.current;
    const sun = sunLightRef.current;
    const ambient = ambientLightRef.current;
    const hemi = hemiLightRef.current;

    if (timeOfDay === 'sunset') {
      // Golden Hour berkabut khas Tasikmalaya/Mugarsari (persis di foto)
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
    } else if (timeOfDay === 'day') {
      // Siang Cerah
      scene.background = new THREE.Color(isDark ? '#0f172a' : '#dbeafe');
      scene.fog = new THREE.FogExp2(isDark ? '#0f172a' : '#dbeafe', 0.0045);
      sun.color.set('#ffffff');
      sun.intensity = 2.9;
      sun.position.set(60, 95, 50);
      ambient.color.set('#ffffff');
      ambient.intensity = 1.05;
      hemi.color.set('#93c5fd');
      hemi.groundColor.set('#86efac');
      hemi.intensity = 0.85;
    } else {
      // Malam Hari dengan Lampu Menyala
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

  // Mode Potongan Lantai (Exploded View)
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

  // Inisialisasi WebGL Three.js Realistis
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 640;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isDark ? '#1a1829' : '#d8d4c7');
    scene.fog = new THREE.FogExp2(isDark ? '#1a1829' : '#d8d4c7', 0.0055);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.5, 900);
    cameraRef.current = camera;

    // 3. Renderer dengan PCF Soft Shadows & Tone Mapping Realistis
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
    const ambientLight = new THREE.AmbientLight('#fed7aa', 0.95);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#fdba74', '#475569', 0.75);
    hemiLightRef.current = hemiLight;
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#f59e0b', 2.6);
    sunLightRef.current = sunLight;
    sunLight.position.set(85, 52, 65);
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

    // 5. TEKSTUR PROCEDURAL REALISTIS (PBR)
    const roofTexture = generateRoofTileTexture();
    const windowTexture = generateWindowTexture();
    const grassTexture = generateGrassTexture();
    const pavingTexture = generatePavingTexture();
    const asphaltTexture = generateAsphaltTexture();
    const dekanatSignTexture = generateDekanatSignTexture();

    // 6. LINGKUNGAN KAMPUS (Ground, Jalan, Danau, Sawah)
    // 6a. Hamparan Rumput Hijau Bertekstur
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

    // 6b. Petak Sawah Terasering Depan Kanan (Sesuai Foto Udara)
    const paddyGeo = new THREE.PlaneGeometry(90, 70);
    const paddyMat = new THREE.MeshStandardMaterial({
      color: '#265330',
      roughness: 0.9,
      metalness: 0.05
    });
    const paddy = new THREE.Mesh(paddyGeo, paddyMat);
    paddy.rotation.x = -Math.PI / 2;
    paddy.position.set(48, -0.1, 80);
    paddy.receiveShadow = true;
    scene.add(paddy);

    // Pematang Sawah
    const ridgeMat = new THREE.MeshStandardMaterial({ color: '#3d342a', roughness: 0.95 });
    for (let r = 0; r < 4; r++) {
      const ridgeMesh = new THREE.Mesh(new THREE.BoxGeometry(88, 0.3, 1.2), ridgeMat);
      ridgeMesh.position.set(48, 0.05, 55 + r * 18);
      scene.add(ridgeMesh);
    }

    // 6c. Danau / Kolam Retensi di Sebelah Kanan (Sesuai Foto Udara Asli)
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

    // Tepian Pasir & Batu Danau
    const pondBankGeo = new THREE.CylinderGeometry(22, 26, 0.3, 36);
    const pondBankMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.95 });
    const pondBank = new THREE.Mesh(pondBankGeo, pondBankMat);
    pondBank.position.set(68, -0.02, 5);
    pondBank.scale.set(1.4, 1, 0.95);
    scene.add(pondBank);

    // 6d. Jalan Aspal Depan Kampus Lengkap Marka Jalan
    const roadGeo = new THREE.PlaneGeometry(260, 24);
    const roadMat = new THREE.MeshStandardMaterial({
      map: asphaltTexture,
      roughness: 0.8,
      metalness: 0.15
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -0.06, 42);
    road.receiveShadow = true;
    scene.add(road);

    // 6e. Area Parkir & Garis Parkir Mobil di Depan Dekanat
    const parkingGeo = new THREE.PlaneGeometry(55, 18);
    const parkingMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.85 });
    const parking = new THREE.Mesh(parkingGeo, parkingMat);
    parking.rotation.x = -Math.PI / 2;
    parking.position.set(28, -0.05, 27);
    parking.receiveShadow = true;
    scene.add(parking);

    // Garis parkir mobil putih
    const pLineMat = new THREE.MeshBasicMaterial({ color: '#e2e8f0' });
    for (let p = -22; p <= 22; p += 4.5) {
      const pline = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 6), pLineMat);
      pline.rotation.x = -Math.PI / 2;
      pline.position.set(28 + p, -0.04, 27);
      scene.add(pline);
    }

    // 6f. Jaringan Paving Stone Penghubung Seluruh Bangunan
    const plazaMat = new THREE.MeshStandardMaterial({
      map: pavingTexture,
      roughness: 0.75,
      metalness: 0.12
    });

    // Plaza Tengah (antara LABTEK 1 dan FT.1)
    const plaza1 = new THREE.Mesh(new THREE.PlaneGeometry(62, 22), plazaMat);
    plaza1.rotation.x = -Math.PI / 2;
    plaza1.position.set(-18, -0.05, 1);
    plaza1.receiveShadow = true;
    scene.add(plaza1);

    // Plaza Timur (antara Dekanat dan FT.2)
    const plaza2 = new THREE.Mesh(new THREE.PlaneGeometry(58, 22), plazaMat);
    plaza2.rotation.x = -Math.PI / 2;
    plaza2.position.set(30, -0.05, 1);
    plaza2.receiveShadow = true;
    scene.add(plaza2);

    // Koridor Penghubung Timur-Barat
    const walkEW = new THREE.Mesh(new THREE.PlaneGeometry(125, 10), plazaMat);
    walkEW.rotation.x = -Math.PI / 2;
    walkEW.position.set(5, -0.04, 1);
    walkEW.receiveShadow = true;
    scene.add(walkEW);

    // Koridor Penghubung ke Gedung Utara
    const walkNS = new THREE.Mesh(new THREE.PlaneGeometry(12, 58), plazaMat);
    walkNS.rotation.x = -Math.PI / 2;
    walkNS.position.set(5, -0.04, -26);
    walkNS.receiveShadow = true;
    scene.add(walkNS);

    // 6g. Taman Bunga & Tiang Bendera Depan Dekanat
    const flagPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 13, 8),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.9, roughness: 0.2 })
    );
    flagPole.position.set(28, 6.5, 32);
    flagPole.castShadow = true;
    scene.add(flagPole);

    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 1.6, 0.06),
      new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.4 })
    );
    flag.position.set(29.4, 11.5, 32);
    scene.add(flag);

    // Bulatan Taman Tiang Bendera
    const gardenBase = new THREE.Mesh(
      new THREE.CylinderGeometry(4.5, 5, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.85 })
    );
    gardenBase.position.set(28, 0.15, 32);
    scene.add(gardenBase);

    // 7. MATERIAL ARSITEKTURAL REALISTIS (PBR)
    const wallBlueMat = new THREE.MeshStandardMaterial({
      color: '#4285c5', // Biru cerulean persis seperti foto udara
      roughness: 0.45,
      metalness: 0.1
    });

    const wallBlueDarkMat = new THREE.MeshStandardMaterial({
      color: '#2563eb', // Biru Dekanat yang lebih tegas
      roughness: 0.45,
      metalness: 0.12
    });

    const wallSlateMat = new THREE.MeshStandardMaterial({
      color: '#475569',
      roughness: 0.65,
      metalness: 0.08
    });

    const whiteConcreteMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.4,
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

    const roofMat = new THREE.MeshStandardMaterial({
      map: roofTexture,
      roughness: 0.6,
      metalness: 0.1,
      flatShading: true
    });

    const roofRidgeMat = new THREE.MeshStandardMaterial({
      color: '#6b2512',
      roughness: 0.55
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
      const chosenWallMat = bldg.isDekanat ? wallBlueDarkMat : (bldg.id === 'workshop-barat' ? wallSlateMat : wallBlueMat);

      // 1. Podium / Pondasi Beton Plinth
      const plinthGeo = new THREE.BoxGeometry(bldg.length + 2.5, 0.5, bldg.depth + 2.5);
      const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
      plinthMesh.position.y = 0.25;
      plinthMesh.castShadow = true;
      plinthMesh.receiveShadow = true;
      bldgGroup.add(plinthMesh);

      // 2. Lantai 1 (Ground Floor)
      const floor1Group = new THREE.Group();
      const wall1Mesh = new THREE.Mesh(new THREE.BoxGeometry(bldg.length, floorHeight, bldg.depth), chosenWallMat);
      wall1Mesh.position.y = 0.5 + floorHeight / 2;
      wall1Mesh.castShadow = true;
      wall1Mesh.receiveShadow = true;
      floor1Group.add(wall1Mesh);

      // Kolom Beton Putih & Jendela Kaca Bertekstur
      const colCount = Math.max(7, Math.floor(bldg.length / 5));
      const colStep = bldg.length / (colCount - 1);
      const colGeo = new THREE.BoxGeometry(0.75, floorHeight + 0.1, 0.75);

      for (let i = 0; i < colCount; i++) {
        const cx = -bldg.length / 2 + i * colStep;

        const colFront = new THREE.Mesh(colGeo, whiteConcreteMat);
        colFront.position.set(cx, 0.5 + floorHeight / 2, bldg.depth / 2 + 0.1);
        colFront.castShadow = true;
        floor1Group.add(colFront);

        const colBack = new THREE.Mesh(colGeo, whiteConcreteMat);
        colBack.position.set(cx, 0.5 + floorHeight / 2, -bldg.depth / 2 - 0.1);
        colBack.castShadow = true;
        floor1Group.add(colBack);

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

          // Kanopi kecil pelindung matahari di atas jendela (Sunshade Ledge)
          const shadeFront = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.2, 0.15, 0.7), whiteConcreteMat);
          shadeFront.position.set(cx + colStep / 2, 0.5 + 2.95, bldg.depth / 2 + 0.4);
          shadeFront.castShadow = true;
          floor1Group.add(shadeFront);
        }
      }

      bldgGroup.add(floor1Group);

      // 3. Lantai 2 (Second Floor Group)
      const floor2Group = new THREE.Group();
      floor2Group.position.y = 0.5 + floorHeight;

      // Sabuk balok lantai 2
      const beamMesh = new THREE.Mesh(new THREE.BoxGeometry(bldg.length + 1.2, 0.45, bldg.depth + 1.2), whiteConcreteMat);
      beamMesh.position.y = 0.22;
      beamMesh.castShadow = true;
      floor2Group.add(beamMesh);

      const wall2Mesh = new THREE.Mesh(new THREE.BoxGeometry(bldg.length, floorHeight, bldg.depth), chosenWallMat);
      wall2Mesh.position.y = 0.45 + floorHeight / 2;
      wall2Mesh.castShadow = true;
      wall2Mesh.receiveShadow = true;
      floor2Group.add(wall2Mesh);

      for (let i = 0; i < colCount; i++) {
        const cx = -bldg.length / 2 + i * colStep;

        const colFront = new THREE.Mesh(colGeo, whiteConcreteMat);
        colFront.position.set(cx, 0.45 + floorHeight / 2, bldg.depth / 2 + 0.1);
        colFront.castShadow = true;
        floor2Group.add(colFront);

        const colBack = new THREE.Mesh(colGeo, whiteConcreteMat);
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

          const shadeFront = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.2, 0.15, 0.7), whiteConcreteMat);
          shadeFront.position.set(cx + colStep / 2, 0.45 + 2.95, bldg.depth / 2 + 0.4);
          shadeFront.castShadow = true;
          floor2Group.add(shadeFront);
        }
      }

      bldgGroup.add(floor2Group);
      buildingFloor2sRef.current.set(bldg.id, floor2Group);

      // 4. Atap Limasan (Hip Roof) dengan Tekstur Genteng Merah Bata Realistis
      const roofGroup = new THREE.Group();
      roofGroup.position.y = 0.5 + floorHeight * 2 + 0.45;

      const eaveOverhang = 1.5;
      const roofW = bldg.length + eaveOverhang * 2;
      const roofD = bldg.depth + eaveOverhang * 2;

      // Lisplang Putih Keliling Atap
      const fasciaMesh = new THREE.Mesh(new THREE.BoxGeometry(roofW, 0.4, roofD), whiteConcreteMat);
      fasciaMesh.position.y = 0.2;
      fasciaMesh.castShadow = true;
      roofGroup.add(fasciaMesh);

      // Bidang Miring Genteng Atap Limasan
      const hipRoofGeo = createHipRoofGeometry(roofW, roofD, roofPeak, 10.5);
      const hipRoofMesh = new THREE.Mesh(hipRoofGeo, roofMat);
      hipRoofMesh.position.y = 0.4;
      hipRoofMesh.castShadow = true;
      hipRoofMesh.receiveShadow = true;
      roofGroup.add(hipRoofMesh);

      // Nok / Bubungan Jurai Puncak (Apex Ridge)
      const ridgeLen = Math.max(4, roofW - 10.5 * 2);
      const ridgeMesh = new THREE.Mesh(new THREE.BoxGeometry(ridgeLen, 0.35, 0.7), roofRidgeMat);
      ridgeMesh.position.set(0, 0.4 + roofPeak + 0.05, 0);
      roofGroup.add(ridgeMesh);

      bldgGroup.add(roofGroup);
      buildingRoofsRef.current.set(bldg.id, roofGroup);

      // 5. Kanopi Pintu Masuk / Teras Portico
      if (bldg.hasCanopy) {
        const canW = bldg.isDekanat ? 16.0 : 9.5;
        const canD = bldg.isDekanat ? 7.5 : 5.8;
        const canH = 3.8;
        const canX = bldg.isDekanat ? 0 : bldg.length * 0.16;
        const canZ = bldg.depth / 2 + canD / 2;

        const canopyRoof = new THREE.Mesh(new THREE.BoxGeometry(canW, 0.45, canD), whiteConcreteMat);
        canopyRoof.position.set(canX, canH, canZ);
        canopyRoof.castShadow = true;
        bldgGroup.add(canopyRoof);

        // Tiang Pilar Kanopi
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.65, canH, 0.65), whiteConcreteMat);
        p1.position.set(canX - canW / 2 + 0.6, canH / 2, canZ + canD / 2 - 0.6);
        p1.castShadow = true;
        bldgGroup.add(p1);

        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.65, canH, 0.65), whiteConcreteMat);
        p2.position.set(canX + canW / 2 - 0.6, canH / 2, canZ + canD / 2 - 0.6);
        p2.castShadow = true;
        bldgGroup.add(p2);

        // Anak Tangga Masuk
        const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(canW - 1, 0.25, 2.5), plinthMat);
        stepMesh.position.set(canX, 0.12, canZ + canD / 2 + 1.0);
        stepMesh.receiveShadow = true;
        bldgGroup.add(stepMesh);

        // Plang nama emas resmi "FAKULTAS TEKNIK UNIVERSITAS SILIWANGI" pada Dekanat
        if (bldg.isDekanat) {
          const signBoardGeo = new THREE.PlaneGeometry(12, 3.0);
          const signBoardMat = new THREE.MeshStandardMaterial({
            map: dekanatSignTexture,
            roughness: 0.3,
            metalness: 0.4
          });
          const signBoard = new THREE.Mesh(signBoardGeo, signBoardMat);
          signBoard.position.set(canX, canH + 1.8, canZ + canD / 2 + 0.05);
          bldgGroup.add(signBoard);

          // Balkon atas teras dekanat
          const balconyRailGeo = new THREE.BoxGeometry(canW - 0.5, 1.0, canD - 0.5);
          const balconyRail = new THREE.Mesh(
            balconyRailGeo,
            new THREE.MeshStandardMaterial({ color: '#f8fafc', wireframe: true })
          );
          balconyRail.position.set(canX, canH + 0.7, canZ);
          bldgGroup.add(balconyRail);
        }
      }

      // 6. Tangga Samping / Sayap Luar pada LABTEK 1 & FT.1
      if (bldg.hasStairTower) {
        const stairX = -bldg.length / 2 - 2.5;
        const stairTower = new THREE.Mesh(
          new THREE.BoxGeometry(4.5, bldg.height, bldg.depth * 0.6),
          whiteConcreteMat
        );
        stairTower.position.set(stairX, 0.5 + bldg.height / 2, 0);
        stairTower.castShadow = true;
        stairTower.receiveShadow = true;
        bldgGroup.add(stairTower);
      }

      // 7. Highlight Edges Mesh (Warna Hijau Menyala untuk Denah Tersedia, Biru untuk Gedung Lain)
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

      // 8. Hitbox untuk Raycast Interaktif
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

    // 9. VEGETASI & POHON KAMPUS MULTI-SPECIES (Sesuai Foto Udara Asli)
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: '#4a3325', roughness: 0.95 });
    const leafDarkMat = new THREE.MeshStandardMaterial({ color: '#1b4332', roughness: 0.85 });
    const leafMidMat = new THREE.MeshStandardMaterial({ color: '#2d6a4f', roughness: 0.8 });
    const leafLightMat = new THREE.MeshStandardMaterial({ color: '#52b788', roughness: 0.75 });

    // 9a. Pohon Rindang Kanopi Daun Berlapis (Canopy Tree)
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

    // 9b. Pohon Kelapa Tropis (Palm Tree)
    const createPalmTree = (x: number, z: number, scale = 1) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      // Batang melengkung
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * scale, 0.45 * scale, 7 * scale, 6), treeTrunkMat);
      trunk.position.set(0.4 * scale, 3.5 * scale, 0);
      trunk.rotation.z = -0.08;
      trunk.castShadow = true;
      group.add(trunk);

      // Pelepah daun kelapa
      for (let f = 0; f < 6; f++) {
        const frondAngle = (f / 6) * Math.PI * 2;
        const frond = new THREE.Mesh(new THREE.ConeGeometry(0.6 * scale, 3.5 * scale, 4), leafMidMat);
        frond.position.set(Math.cos(frondAngle) * 1.4 * scale, 7.2 * scale, Math.sin(frondAngle) * 1.4 * scale);
        frond.rotation.x = Math.sin(frondAngle) * 0.9;
        frond.rotation.z = Math.cos(frondAngle) * -0.9;
        group.add(frond);
      }

      scene.add(group);
    };

    // 9c. Deretan Semak / Tanaman Pangkas Hias (Hedge Row)
    const createHedge = (x: number, z: number, lenX: number, lenZ: number) => {
      const hedge = new THREE.Mesh(
        new THREE.BoxGeometry(lenX, 1.2, lenZ),
        new THREE.MeshStandardMaterial({ color: '#2d6a4f', roughness: 0.85 })
      );
      hedge.position.set(x, 0.6, z);
      hedge.castShadow = true;
      scene.add(hedge);
    };

    // Sebaran pohon di sekeliling kawasan kampus persis sesuai foto drone
    const trees = [
      // Sisi Barat Luar
      [-68, 22, 1.3], [-70, 0, 1.2], [-68, -22, 1.4], [-62, -45, 1.1],
      // Antar Gedung Kiri & Kanan
      [-42, 14, 0.95], [-40, -12, 1.0], [5, 14, 0.85], [5, -12, 0.9],
      // Sisi Danau Timur (Pohon Rimbun & Kelapa)
      [72, 24, 1.2], [82, 14, 1.3], [85, -2, 1.4], [78, -16, 1.1],
      // Sepanjang Jalan Depan
      [-45, 34, 0.9], [-22, 34, 0.85], [0, 34, 0.9], [15, 34, 0.85], [48, 34, 0.95],
      // Sisi Utara Belakang
      [-32, -54, 1.3], [-8, -54, 1.2], [18, -54, 1.35], [46, -54, 1.25]
    ];
    trees.forEach(([tx, tz, ts]) => createCanopyTree(tx, tz, ts));

    // Pohon Kelapa Dekat Danau & Sawah
    createPalmTree(62, 18, 1.2);
    createPalmTree(84, 6, 1.3);
    createPalmTree(76, -10, 1.1);
    createPalmTree(-66, 10, 1.1);

    // Semak Hias di Depan Gedung Dekanat
    createHedge(16, 20, 1.0, 12);
    createHedge(40, 20, 1.0, 12);
    createHedge(28, 24, 20, 0.8);

    // 10. Bayangan Gedung Rektorat Kampus 2 di Kejauhan Timur Laut (Sesuai Foto Udara)
    const rektoratGroup = new THREE.Group();
    rektoratGroup.position.set(110, 0, -75);
    const rekBase = new THREE.Mesh(new THREE.BoxGeometry(45, 14, 25), whiteConcreteMat);
    rekBase.position.y = 7;
    rektoratGroup.add(rekBase);
    const rekRoof = new THREE.Mesh(new THREE.ConeGeometry(22, 16, 4), new THREE.MeshStandardMaterial({ color: '#522b1b', roughness: 0.6 }));
    rekRoof.position.y = 22;
    rekRoof.rotation.y = Math.PI / 4;
    rektoratGroup.add(rekRoof);
    scene.add(rektoratGroup);

    // 11. Interaksi Mouse & Touch (Raycasting Click & Hover)
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

    // 12. Loop Animasi
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
      const nh = container.clientHeight || 640;
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
    <div className="relative w-full bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-lg overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* 1. Toolbar Atas */}
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

            <button
              onClick={() => applyCameraPreset('top')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                cameraPreset === 'top'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
              title="Tampak Atas (Site Plan Seluruh Fakultas)"
            >
              Atas
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
              onClick={() => setTimeOfDay('sunset')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                timeOfDay === 'sunset' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Sore / Golden Hour (Sesuai Foto Drone Asli)"
            >
              <Sunset className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTimeOfDay('day')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                timeOfDay === 'day' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Siang Cerah"
            >
              <Sun className="w-3.5 h-3.5" />
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
                <span className="text-[10px] font-normal opacity-80 block">Kuliah Teori & Sidang</span>
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
            <span className="font-semibold text-[11px]">Gedung FT.2</span>
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
                : 'bg-gradient-to-tr from-slate-600 to-slate-800'
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
