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
    color: '#3b82f6',
    hasCanopy: true,
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
    color: '#3b82f6',
    hasCanopy: true,
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
    color: '#2563eb',
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
    color: '#3b82f6',
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
    color: '#3b82f6',
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
    color: '#3b82f6',
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
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('sunset');
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
      scene.background = new THREE.Color(isDark ? '#1a1829' : '#e0dfd5');
      scene.fog = new THREE.FogExp2(isDark ? '#1a1829' : '#e0dfd5', 0.0055);
      sun.color.set('#f59e0b');
      sun.intensity = 2.4;
      sun.position.set(80, 50, 60);
      ambient.color.set('#fed7aa');
      ambient.intensity = 0.9;
      hemi.color.set('#fdba74');
      hemi.groundColor.set('#475569');
      hemi.intensity = 0.7;
    } else if (timeOfDay === 'day') {
      // Siang Cerah
      scene.background = new THREE.Color(isDark ? '#0f172a' : '#dbeafe');
      scene.fog = new THREE.FogExp2(isDark ? '#0f172a' : '#dbeafe', 0.0045);
      sun.color.set('#ffffff');
      sun.intensity = 2.8;
      sun.position.set(60, 90, 50);
      ambient.color.set('#ffffff');
      ambient.intensity = 1.0;
      hemi.color.set('#93c5fd');
      hemi.groundColor.set('#86efac');
      hemi.intensity = 0.8;
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

  // Inisialisasi WebGL Three.js
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 620;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isDark ? '#1a1829' : '#e0dfd5');
    scene.fog = new THREE.FogExp2(isDark ? '#1a1829' : '#e0dfd5', 0.0055);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.5, 800);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight('#fed7aa', 0.9);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#fdba74', '#475569', 0.7);
    hemiLightRef.current = hemiLight;
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#f59e0b', 2.4);
    sunLightRef.current = sunLight;
    sunLight.position.set(80, 50, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 350;
    const d = 95;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    // 5. Hamparan Rumput Hijau Kampus & Sawah Sekitar
    const groundGeo = new THREE.PlaneGeometry(320, 320);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#3d7848',
      roughness: 0.9,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.15;
    ground.receiveShadow = true;
    scene.add(ground);

    // Petak Sawah Depan Kanan (Sesuai Foto Udara)
    const paddyGeo = new THREE.PlaneGeometry(80, 60);
    const paddyMat = new THREE.MeshStandardMaterial({ color: '#2d5a37', roughness: 0.85 });
    const paddy = new THREE.Mesh(paddyGeo, paddyMat);
    paddy.rotation.x = -Math.PI / 2;
    paddy.position.set(45, -0.1, 75);
    paddy.receiveShadow = true;
    scene.add(paddy);

    // 5b. Danau / Kolam Retensi di Sebelah Kanan (Sesuai Foto Udara Asli)
    const pondGeo = new THREE.CylinderGeometry(18, 22, 0.4, 28);
    const pondMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.88
    });
    const pond = new THREE.Mesh(pondGeo, pondMat);
    pond.position.set(65, 0.05, 5);
    pond.scale.set(1.4, 1, 0.9);
    scene.add(pond);

    // Bibir Kolam Berpasir
    const pondBankGeo = new THREE.CylinderGeometry(20, 24, 0.25, 28);
    const pondBankMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.9 });
    const pondBank = new THREE.Mesh(pondBankGeo, pondBankMat);
    pondBank.position.set(65, -0.02, 5);
    pondBank.scale.set(1.4, 1, 0.9);
    scene.add(pondBank);

    // 5c. Jalan Aspal Depan Kampus
    const roadGeo = new THREE.PlaneGeometry(240, 24);
    const roadMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.85, metalness: 0.1 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -0.08, 42);
    road.receiveShadow = true;
    scene.add(road);

    // 5d. Jaringan Paving Stone Penghubung Seluruh Gedung
    const plazaMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.75, metalness: 0.15 });

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
    const walkEW = new THREE.Mesh(new THREE.PlaneGeometry(120, 10), plazaMat);
    walkEW.rotation.x = -Math.PI / 2;
    walkEW.position.set(5, -0.04, 1);
    walkEW.receiveShadow = true;
    scene.add(walkEW);

    // Koridor Penghubung ke Gedung Utara
    const walkNS = new THREE.Mesh(new THREE.PlaneGeometry(12, 55), plazaMat);
    walkNS.rotation.x = -Math.PI / 2;
    walkNS.position.set(5, -0.04, -25);
    walkNS.receiveShadow = true;
    scene.add(walkNS);

    // 5e. Taman Depan Dekanat & Tiang Bendera
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 12, 8), new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.9 }));
    flagPole.position.set(28, 6, 27);
    flagPole.castShadow = true;
    scene.add(flagPole);

    const flag = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.4, 0.05), new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.4 }));
    flag.position.set(29.2, 11, 27);
    scene.add(flag);

    // 6. MATERIAL BANGUNAN REALISTIS
    const wallBlueMat = new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.5, metalness: 0.1 });
    const wallBlueDarkMat = new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.5, metalness: 0.1 });
    const wallSlateMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.6, metalness: 0.1 });
    const whiteConcreteMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.45, metalness: 0.05 });
    const plinthMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.15, metalness: 0.85 });
    const roofTileMat = new THREE.MeshStandardMaterial({ color: '#9e361b', roughness: 0.65, metalness: 0.08, flatShading: true });
    const roofRidgeMat = new THREE.MeshStandardMaterial({ color: '#782613', roughness: 0.55 });
    const goldMat = new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.3, metalness: 0.7 });

    // 7. BUILDER SEMUA BANGUNAN KAMPUS
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

      // 1. Pondasi Beton Plinth
      const plinthGeo = new THREE.BoxGeometry(bldg.length + 2.4, 0.5, bldg.depth + 2.4);
      const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
      plinthMesh.position.y = 0.25;
      plinthMesh.castShadow = true;
      plinthMesh.receiveShadow = true;
      bldgGroup.add(plinthMesh);

      // 2. Lantai 1
      const floor1Group = new THREE.Group();
      const wall1Mesh = new THREE.Mesh(new THREE.BoxGeometry(bldg.length, floorHeight, bldg.depth), chosenWallMat);
      wall1Mesh.position.y = 0.5 + floorHeight / 2;
      wall1Mesh.castShadow = true;
      wall1Mesh.receiveShadow = true;
      floor1Group.add(wall1Mesh);

      // Kolom & jendela lantai 1
      const colCount = Math.max(7, Math.floor(bldg.length / 5));
      const colStep = bldg.length / (colCount - 1);
      const colGeo = new THREE.BoxGeometry(0.7, floorHeight + 0.1, 0.7);

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
          const winW = colStep - 0.8;
          const winH = 1.8;
          const winFront = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, 0.2), glassMat);
          winFront.position.set(cx + colStep / 2, 0.5 + 2.0, bldg.depth / 2 + 0.05);
          floor1Group.add(winFront);

          const winBack = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, 0.2), glassMat);
          winBack.position.set(cx + colStep / 2, 0.5 + 2.0, -bldg.depth / 2 - 0.05);
          floor1Group.add(winBack);
        }
      }

      bldgGroup.add(floor1Group);

      // 3. Lantai 2
      const floor2Group = new THREE.Group();
      floor2Group.position.y = 0.5 + floorHeight;

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
          const winW = colStep - 0.8;
          const winH = 1.8;
          const winFront = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, 0.2), glassMat);
          winFront.position.set(cx + colStep / 2, 0.45 + 2.0, bldg.depth / 2 + 0.05);
          floor2Group.add(winFront);

          const winBack = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, 0.2), glassMat);
          winBack.position.set(cx + colStep / 2, 0.45 + 2.0, -bldg.depth / 2 - 0.05);
          floor2Group.add(winBack);
        }
      }

      bldgGroup.add(floor2Group);
      buildingFloor2sRef.current.set(bldg.id, floor2Group);

      // 4. Atap Limasan
      const roofGroup = new THREE.Group();
      roofGroup.position.y = 0.5 + floorHeight * 2 + 0.45;

      const eaveOverhang = 1.4;
      const roofW = bldg.length + eaveOverhang * 2;
      const roofD = bldg.depth + eaveOverhang * 2;

      const fasciaMesh = new THREE.Mesh(new THREE.BoxGeometry(roofW, 0.35, roofD), whiteConcreteMat);
      fasciaMesh.position.y = 0.18;
      fasciaMesh.castShadow = true;
      roofGroup.add(fasciaMesh);

      const hipRoofGeo = createHipRoofGeometry(roofW, roofD, roofPeak, 10.5);
      const hipRoofMesh = new THREE.Mesh(hipRoofGeo, roofTileMat);
      hipRoofMesh.position.y = 0.35;
      hipRoofMesh.castShadow = true;
      hipRoofMesh.receiveShadow = true;
      roofGroup.add(hipRoofMesh);

      const ridgeLen = Math.max(4, roofW - 10.5 * 2);
      const ridgeMesh = new THREE.Mesh(new THREE.BoxGeometry(ridgeLen, 0.3, 0.6), roofRidgeMat);
      ridgeMesh.position.set(0, 0.35 + roofPeak + 0.05, 0);
      roofGroup.add(ridgeMesh);

      bldgGroup.add(roofGroup);
      buildingRoofsRef.current.set(bldg.id, roofGroup);

      // 5. Kanopi Pintu Masuk
      if (bldg.hasCanopy) {
        const canW = bldg.isDekanat ? 14.0 : 9.0;
        const canD = bldg.isDekanat ? 7.0 : 5.5;
        const canH = 3.8;
        const canX = bldg.isDekanat ? 0 : bldg.length * 0.16;
        const canZ = bldg.depth / 2 + canD / 2;

        const canopyRoof = new THREE.Mesh(new THREE.BoxGeometry(canW, 0.4, canD), whiteConcreteMat);
        canopyRoof.position.set(canX, canH, canZ);
        canopyRoof.castShadow = true;
        bldgGroup.add(canopyRoof);

        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, canH, 0.55), whiteConcreteMat);
        p1.position.set(canX - canW / 2 + 0.5, canH / 2, canZ + canD / 2 - 0.5);
        p1.castShadow = true;
        bldgGroup.add(p1);

        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, canH, 0.55), whiteConcreteMat);
        p2.position.set(canX + canW / 2 - 0.5, canH / 2, canZ + canD / 2 - 0.5);
        p2.castShadow = true;
        bldgGroup.add(p2);

        // Plang nama emas pada Dekanat
        if (bldg.isDekanat) {
          const signBoard = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 0.2), goldMat);
          signBoard.position.set(canX, canH + 0.8, canZ + canD / 2);
          bldgGroup.add(signBoard);
        }
      }

      // 6. Highlight Edges Mesh (Warna Hijau Menyala untuk Denah Tersedia, Biru untuk Gedung Lain)
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

      // 7. Hitbox untuk Raycast Interaktif
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

    // 8. Pohon-Pohon Kampus (Sesuai Vegetasi Foto Drone Asli)
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: '#5c4033', roughness: 0.9 });
    const treeFoliageMat1 = new THREE.MeshStandardMaterial({ color: '#2d6a4f', roughness: 0.8 });
    const treeFoliageMat2 = new THREE.MeshStandardMaterial({ color: '#40916c', roughness: 0.8 });

    const createCampusTree = (x: number, z: number, scale = 1) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, 0, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, 3 * scale, 6), treeTrunkMat);
      trunk.position.y = 1.5 * scale;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const crown1 = new THREE.Mesh(new THREE.ConeGeometry(2.4 * scale, 3.8 * scale, 7), treeFoliageMat1);
      crown1.position.y = 3.6 * scale;
      crown1.castShadow = true;
      treeGroup.add(crown1);

      const crown2 = new THREE.Mesh(new THREE.ConeGeometry(1.8 * scale, 3.0 * scale, 7), treeFoliageMat2);
      crown2.position.y = 5.2 * scale;
      crown2.castShadow = true;
      treeGroup.add(crown2);

      scene.add(treeGroup);
    };

    // Koordinat pohon di sekeliling jalan dan batas kawasan kampus
    const treeCoords = [
      // Sisi Barat
      [-65, 20, 1.2], [-65, 0, 1.1], [-65, -20, 1.3], [-60, -40, 1.0],
      // Antar Gedung
      [-42, 14, 0.9], [-40, -12, 1.0], [5, 14, 0.8], [5, -12, 0.85],
      // Sekitar Danau
      [68, 22, 1.2], [78, 12, 1.1], [82, -2, 1.3], [74, -14, 1.0],
      // Sepanjang Jalan Depan
      [-40, 32, 0.85], [-20, 32, 0.9], [0, 32, 0.85], [15, 32, 0.9], [45, 32, 0.95],
      // Sisi Utara Belakang
      [-30, -50, 1.2], [-5, -50, 1.1], [20, -50, 1.25], [45, -50, 1.15]
    ];
    treeCoords.forEach(([tx, tz, ts]) => createCampusTree(tx, tz, ts));

    // 9. Interaksi Mouse & Touch (Raycasting Click & Hover)
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

      orbitState.current.targetAzimuth -= deltaX * 0.006;
      orbitState.current.targetPolar = Math.max(0.12, Math.min(Math.PI / 2 - 0.04, orbitState.current.targetPolar - deltaY * 0.006));
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
      orbitState.current.targetDistance = Math.max(30, Math.min(180, orbitState.current.targetDistance + e.deltaY * 0.08));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handlePointerDown);
    domEl.addEventListener('mousemove', handlePointerMove);
    domEl.addEventListener('mouseup', handlePointerUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    domEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    domEl.addEventListener('touchmove', handlePointerMove, { passive: true });
    domEl.addEventListener('touchend', handlePointerUp);

    // 10. Loop Animasi
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const os = orbitState.current;

      if (isAutoRotate && !os.isDragging) {
        os.targetAzimuth += 0.0025;
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
      const nh = container.clientHeight || 620;
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
    <div className="relative w-full bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-md overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* 1. Toolbar Atas */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-900/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Building2 className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                  Kawasan 3D Lengkap Fakultas Teknik Universitas Siliwangi
                </h3>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Denah Interaktif: LABTEK 1 & FT.1</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Representasi 3D seluruh bangunan real life sesuai foto drone. Denah digital tersedia untuk <strong>Gedung LABTEK 1</strong> dan <strong>Gedung FT.1</strong>.
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
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
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
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
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
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
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
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
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
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
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
              onClick={() => setTimeOfDay('day')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                timeOfDay === 'day' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Siang Cerah"
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
      <div className="relative w-full h-[560px] sm:h-[640px] bg-slate-900 select-none overflow-hidden">
        
        {/* Kanvas Three.js */}
        <div ref={containerRef} className="w-full h-full touch-none" />

        {/* 🏷️ Floating Building Pills di Kiri Atas (Menyoroti Gedung yang Memiliki Denah) */}
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

          {/* Gedung Dekanat FT (Gedung Eksternal) */}
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

          {/* Gedung FT.2 (Gedung Eksternal) */}
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
