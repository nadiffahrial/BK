import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Building, Room } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import {
  Box,
  Layers,
  Sparkles,
  Camera,
  Sun,
  Sunset,
  Moon,
  RotateCw,
  Compass,
  Eye,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  Building2,
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

// Helper untuk membuat atap limasan / hip roof 3D dengan 4 bidang miring (trapezoid depan-belakang, segitiga samping)
function createHipRoofGeometry(
  width: number,       // panjang sumbu X
  depth: number,       // lebar sumbu Z
  height: number,      // tinggi puncak atap
  ridgeInset: number   // jarak dari ujung ke jurai puncak
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

  // Bidang miring depan (trapezoid: v0 -> v1 -> v5 -> v4)
  pushTri(v0, v1, v5);
  pushTri(v0, v5, v4);

  // Bidang miring belakang (trapezoid: v2 -> v3 -> v4 -> v5)
  pushTri(v2, v3, v4);
  pushTri(v2, v4, v5);

  // Jurai samping kiri (segitiga: v3 -> v0 -> v4)
  pushTri(v3, v0, v4);

  // Jurai samping kanan (segitiga: v1 -> v2 -> v5)
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
  const [cameraPreset, setCameraPreset] = useState<'drone' | 'front' | 'iso' | 'top'>('drone');
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('sunset'); // Default golden hour sesuai foto
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  // Ref Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Building Groups
  const labtekGroupRef = useRef<THREE.Group | null>(null);
  const ft1GroupRef = useRef<THREE.Group | null>(null);
  const labtekRoofRef = useRef<THREE.Group | null>(null);
  const ft1RoofRef = useRef<THREE.Group | null>(null);
  const labtekFloor2Ref = useRef<THREE.Group | null>(null);
  const ft1Floor2Ref = useRef<THREE.Group | null>(null);

  // Selection highlight mesh
  const labtekHighlightRef = useRef<THREE.LineSegments | null>(null);
  const ft1HighlightRef = useRef<THREE.LineSegments | null>(null);

  // Lighting refs
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Orbit navigation parameters
  const orbitState = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    azimuth: 0.65, // sudut awal menyerupai foto drone
    polar: 0.85,
    distance: 88,
    target: new THREE.Vector3(2, 4, 0),
    targetAzimuth: 0.65,
    targetPolar: 0.85,
    targetDistance: 88
  });

  const activeBuilding = buildings.find(b => b.id === activeBuildingId) || buildings[0];

  // Preset Kamera Smooth Orbit
  const applyCameraPreset = useCallback((preset: 'drone' | 'front' | 'iso' | 'top') => {
    setCameraPreset(preset);
    const os = orbitState.current;
    if (preset === 'drone') {
      // Sudut menyerupai foto drone udara dari barat daya (persis foto referensi user)
      os.targetAzimuth = 0.58;
      os.targetPolar = 0.82;
      os.targetDistance = 90;
      os.target.set(2, 4, 0);
    } else if (preset === 'front') {
      // Tampak depan LABTEK 1
      os.targetAzimuth = 0;
      os.targetPolar = 1.35;
      os.targetDistance = 65;
      os.target.set(0, 5, 14);
    } else if (preset === 'iso') {
      // Sudut isometrik arsitektur klasik
      os.targetAzimuth = 0.785; // 45 deg
      os.targetPolar = 0.95;
      os.targetDistance = 85;
      os.target.set(2, 4, 0);
    } else if (preset === 'top') {
      // Tampak atas denah master plan
      os.targetAzimuth = 0;
      os.targetPolar = 0.15;
      os.targetDistance = 110;
      os.target.set(2, 0, 0);
    }
  }, []);

  // Update lighting berdasarkan waktu siang/sunset/malam
  useEffect(() => {
    if (!sceneRef.current || !sunLightRef.current || !ambientLightRef.current || !hemiLightRef.current) return;

    const scene = sceneRef.current;
    const sun = sunLightRef.current;
    const ambient = ambientLightRef.current;
    const hemi = hemiLightRef.current;

    if (timeOfDay === 'sunset') {
      // Golden Hour (Kabut sore berhawa sejuk seperti foto asli Mugarsari)
      scene.background = new THREE.Color(isDark ? '#1a1829' : '#e0dfd5');
      scene.fog = new THREE.FogExp2(isDark ? '#1a1829' : '#e0dfd5', 0.0075);
      sun.color.set('#f59e0b');
      sun.intensity = 2.4;
      sun.position.set(65, 38, 50);
      ambient.color.set('#fed7aa');
      ambient.intensity = 0.9;
      hemi.color.set('#fdba74');
      hemi.groundColor.set('#475569');
      hemi.intensity = 0.7;
    } else if (timeOfDay === 'day') {
      // Siang Cerah
      scene.background = new THREE.Color(isDark ? '#0f172a' : '#dbeafe');
      scene.fog = new THREE.FogExp2(isDark ? '#0f172a' : '#dbeafe', 0.006);
      sun.color.set('#ffffff');
      sun.intensity = 2.8;
      sun.position.set(50, 75, 40);
      ambient.color.set('#ffffff');
      ambient.intensity = 1.0;
      hemi.color.set('#93c5fd');
      hemi.groundColor.set('#86efac');
      hemi.intensity = 0.8;
    } else {
      // Malam Hari dengan Lampu Kampus Menyala
      scene.background = new THREE.Color('#030712');
      scene.fog = new THREE.FogExp2('#030712', 0.012);
      sun.color.set('#38bdf8');
      sun.intensity = 0.35;
      sun.position.set(-30, 40, -40);
      ambient.color.set('#1e293b');
      ambient.intensity = 0.6;
      hemi.color.set('#1e3a8a');
      hemi.groundColor.set('#064e3b');
      hemi.intensity = 0.5;
    }
  }, [timeOfDay, isDark]);

  // Efek Mode Potongan Lantai (Exploded View)
  useEffect(() => {
    const targetYRoof = isExploded ? 11.5 : 0;
    const targetYFloor2 = isExploded ? 5.5 : 0;

    const animateLift = () => {
      if (labtekRoofRef.current) {
        labtekRoofRef.current.position.y += (targetYRoof - labtekRoofRef.current.position.y) * 0.15;
      }
      if (ft1RoofRef.current) {
        ft1RoofRef.current.position.y += (targetYRoof - ft1RoofRef.current.position.y) * 0.15;
      }
      if (labtekFloor2Ref.current) {
        labtekFloor2Ref.current.position.y += (targetYFloor2 - labtekFloor2Ref.current.position.y) * 0.15;
      }
      if (ft1Floor2Ref.current) {
        ft1Floor2Ref.current.position.y += (targetYFloor2 - ft1Floor2Ref.current.position.y) * 0.15;
      }
    };

    const interval = setInterval(animateLift, 16);
    return () => clearInterval(interval);
  }, [isExploded]);

  // Highlight gedung aktif
  useEffect(() => {
    if (labtekHighlightRef.current) {
      labtekHighlightRef.current.visible = activeBuildingId === 'gedung-a';
    }
    if (ft1HighlightRef.current) {
      ft1HighlightRef.current.visible = activeBuildingId === 'gedung-b';
    }
  }, [activeBuildingId]);

  // Inisialisasi Scene Three.js
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 580;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isDark ? '#1a1829' : '#e0dfd5');
    scene.fog = new THREE.FogExp2(isDark ? '#1a1829' : '#e0dfd5', 0.0075);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.5, 600);
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

    // 4. Tata Cahaya (Lighting)
    const ambientLight = new THREE.AmbientLight('#fed7aa', 0.9);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#fdba74', '#475569', 0.7);
    hemiLightRef.current = hemiLight;
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#f59e0b', 2.4);
    sunLightRef.current = sunLight;
    sunLight.position.set(65, 45, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 250;
    const d = 60;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    // 5. Lingkungan Kampus (Tanah Rumput, Jalan Aspal, Jalur Paving)
    // 5a. Hamparan Rumput Hijau Luas
    const groundGeo = new THREE.PlaneGeometry(240, 240);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#417a4c',
      roughness: 0.9,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.15;
    ground.receiveShadow = true;
    scene.add(ground);

    // 5b. Area Parkir & Jalan Depan Kampus (Aspal Abu Gelap)
    const roadGeo = new THREE.PlaneGeometry(160, 22);
    const roadMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.85,
      metalness: 0.1
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -0.08, 38);
    road.receiveShadow = true;
    scene.add(road);

    // 5c. Jalur Penghubung Paving Stone antara LABTEK 1 dan FT.1
    const plazaGeo = new THREE.PlaneGeometry(76, 26);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.75,
      metalness: 0.15
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, -0.05, 0);
    plaza.receiveShadow = true;
    scene.add(plaza);

    // 6. BUILDINGS BUILDER (LABTEK 1 & FT.1)
    // Material Bangunan Khas UNSIL FT (Dinding Biru Khas, Tiang Putih Beton, Genteng Limasan Merah Bata)
    const wallBlueMat = new THREE.MeshStandardMaterial({
      color: '#3b82f6', // Biru cerulean khas Gedung Fakultas Teknik UNSIL
      roughness: 0.5,
      metalness: 0.1
    });

    const whiteConcreteMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.45,
      metalness: 0.05
    });

    const plinthMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      roughness: 0.8
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.15,
      metalness: 0.85
    });

    const roofTileMat = new THREE.MeshStandardMaterial({
      color: '#9e361b', // Terracotta merah bata khas genteng perisai limasan
      roughness: 0.65,
      metalness: 0.08,
      flatShading: true
    });

    const roofRidgeMat = new THREE.MeshStandardMaterial({
      color: '#782613',
      roughness: 0.55
    });

    // Helper membuat satu gedung kampus 2 lantai
    const buildCampusBuilding = (
      name: string,
      code: 'A' | 'B',
      buildingId: string,
      centerX: number,
      centerZ: number,
      length: number,
      depth: number,
      hasFrontCanopy: boolean
    ) => {
      const bldgGroup = new THREE.Group();
      bldgGroup.position.set(centerX, 0, centerZ);
      bldgGroup.name = buildingId;

      const floorHeight = 3.8;
      const roofPeak = 5.2;

      // 1. Podium / Pondasi Beton
      const plinthGeo = new THREE.BoxGeometry(length + 2.5, 0.5, depth + 2.5);
      const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
      plinthMesh.position.y = 0.25;
      plinthMesh.castShadow = true;
      plinthMesh.receiveShadow = true;
      bldgGroup.add(plinthMesh);

      // 2. LANTAI 1 (Ground Floor)
      const floor1Group = new THREE.Group();

      // Dinding inti lantai 1
      const wall1Geo = new THREE.BoxGeometry(length, floorHeight, depth);
      const wall1Mesh = new THREE.Mesh(wall1Geo, wallBlueMat);
      wall1Mesh.position.y = 0.5 + floorHeight / 2;
      wall1Mesh.castShadow = true;
      wall1Mesh.receiveShadow = true;
      floor1Group.add(wall1Mesh);

      // Kolom-kolom beton putih tampak luar (10 bay)
      const colCount = 11;
      const colStep = length / (colCount - 1);
      const colGeo = new THREE.BoxGeometry(0.7, floorHeight + 0.1, 0.7);

      for (let i = 0; i < colCount; i++) {
        const cx = -length / 2 + i * colStep;
        
        // Kolom depan
        const colFront = new THREE.Mesh(colGeo, whiteConcreteMat);
        colFront.position.set(cx, 0.5 + floorHeight / 2, depth / 2 + 0.1);
        colFront.castShadow = true;
        floor1Group.add(colFront);

        // Kolom belakang
        const colBack = new THREE.Mesh(colGeo, whiteConcreteMat);
        colBack.position.set(cx, 0.5 + floorHeight / 2, -depth / 2 - 0.1);
        colBack.castShadow = true;
        floor1Group.add(colBack);

        // Jendela kaca antar-kolom
        if (i < colCount - 1) {
          const winW = colStep - 0.8;
          const winH = 1.9;
          const winGeo = new THREE.BoxGeometry(winW, winH, 0.2);

          // Jendela depan
          const winFront = new THREE.Mesh(winGeo, glassMat);
          winFront.position.set(cx + colStep / 2, 0.5 + 2.1, depth / 2 + 0.05);
          floor1Group.add(winFront);

          // Jendela belakang
          const winBack = new THREE.Mesh(winGeo, glassMat);
          winBack.position.set(cx + colStep / 2, 0.5 + 2.1, -depth / 2 - 0.05);
          floor1Group.add(winBack);
        }
      }

      bldgGroup.add(floor1Group);

      // 3. LANTAI 2 (Second Floor Group - bisa terangkat di mode exploded)
      const floor2Group = new THREE.Group();
      floor2Group.position.y = 0.5 + floorHeight;

      // Balok sabuk / lantai cor pemisah
      const beamGeo = new THREE.BoxGeometry(length + 1.2, 0.45, depth + 1.2);
      const beamMesh = new THREE.Mesh(beamGeo, whiteConcreteMat);
      beamMesh.position.y = 0.22;
      beamMesh.castShadow = true;
      floor2Group.add(beamMesh);

      // Dinding inti lantai 2
      const wall2Geo = new THREE.BoxGeometry(length, floorHeight, depth);
      const wall2Mesh = new THREE.Mesh(wall2Geo, wallBlueMat);
      wall2Mesh.position.y = 0.45 + floorHeight / 2;
      wall2Mesh.castShadow = true;
      wall2Mesh.receiveShadow = true;
      floor2Group.add(wall2Mesh);

      // Kolom & jendela lantai 2
      for (let i = 0; i < colCount; i++) {
        const cx = -length / 2 + i * colStep;

        const colFront = new THREE.Mesh(colGeo, whiteConcreteMat);
        colFront.position.set(cx, 0.45 + floorHeight / 2, depth / 2 + 0.1);
        colFront.castShadow = true;
        floor2Group.add(colFront);

        const colBack = new THREE.Mesh(colGeo, whiteConcreteMat);
        colBack.position.set(cx, 0.45 + floorHeight / 2, -depth / 2 - 0.1);
        colBack.castShadow = true;
        floor2Group.add(colBack);

        if (i < colCount - 1) {
          const winW = colStep - 0.8;
          const winH = 1.9;
          const winGeo = new THREE.BoxGeometry(winW, winH, 0.2);

          const winFront = new THREE.Mesh(winGeo, glassMat);
          winFront.position.set(cx + colStep / 2, 0.45 + 2.1, depth / 2 + 0.05);
          floor2Group.add(winFront);

          const winBack = new THREE.Mesh(winGeo, glassMat);
          winBack.position.set(cx + colStep / 2, 0.45 + 2.1, -depth / 2 - 0.05);
          floor2Group.add(winBack);
        }
      }

      bldgGroup.add(floor2Group);

      // 4. ATAP LIMASAN (Hip Roof Group)
      const roofGroup = new THREE.Group();
      roofGroup.position.y = 0.5 + floorHeight * 2 + 0.45;

      // Lisplang Putih Keliling Atap (Eaves Fascia)
      const eaveOverhang = 1.4;
      const roofW = length + eaveOverhang * 2;
      const roofD = depth + eaveOverhang * 2;
      const fasciaGeo = new THREE.BoxGeometry(roofW, 0.35, roofD);
      const fasciaMesh = new THREE.Mesh(fasciaGeo, whiteConcreteMat);
      fasciaMesh.position.y = 0.18;
      fasciaMesh.castShadow = true;
      roofGroup.add(fasciaMesh);

      // Bidang Miring Genteng Atap Limasan (Hip Roof Geometry)
      const hipRoofGeo = createHipRoofGeometry(roofW, roofD, roofPeak, 10.5);
      const hipRoofMesh = new THREE.Mesh(hipRoofGeo, roofTileMat);
      hipRoofMesh.position.y = 0.35;
      hipRoofMesh.castShadow = true;
      hipRoofMesh.receiveShadow = true;
      roofGroup.add(hipRoofMesh);

      // Nok / Bubungan Jurai Puncak (Apex Ridge)
      const ridgeLen = roofW - 10.5 * 2;
      const ridgeGeo = new THREE.BoxGeometry(ridgeLen, 0.3, 0.6);
      const ridgeMesh = new THREE.Mesh(ridgeGeo, roofRidgeMat);
      ridgeMesh.position.set(0, 0.35 + roofPeak + 0.05, 0);
      roofGroup.add(ridgeMesh);

      bldgGroup.add(roofGroup);

      // 5. KANOPI PINTU MASUK DEPAN (Entrance Portico)
      if (hasFrontCanopy) {
        const canW = 9.0;
        const canD = 5.5;
        const canH = 3.6;
        const canX = length * 0.16; // Posisi teras depan sesuai foto
        const canZ = depth / 2 + canD / 2;

        const canopyRoofGeo = new THREE.BoxGeometry(canW, 0.4, canD);
        const canopyRoof = new THREE.Mesh(canopyRoofGeo, whiteConcreteMat);
        canopyRoof.position.set(canX, canH, canZ);
        canopyRoof.castShadow = true;
        bldgGroup.add(canopyRoof);

        // Tiang Kanopi
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, canH, 0.5), whiteConcreteMat);
        p1.position.set(canX - canW / 2 + 0.4, canH / 2, canZ + canD / 2 - 0.4);
        p1.castShadow = true;
        bldgGroup.add(p1);

        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, canH, 0.5), whiteConcreteMat);
        p2.position.set(canX + canW / 2 - 0.4, canH / 2, canZ + canD / 2 - 0.4);
        p2.castShadow = true;
        bldgGroup.add(p2);

        // Anak Tangga Teras Depan
        const stepGeo = new THREE.BoxGeometry(canW - 1, 0.25, 2.2);
        const stepMesh = new THREE.Mesh(stepGeo, plinthMat);
        stepMesh.position.set(canX, 0.12, canZ + canD / 2 + 0.8);
        stepMesh.receiveShadow = true;
        bldgGroup.add(stepMesh);
      }

      // 6. Highlight Selection Box (Outline Hijau Menyala)
      const highlightGeo = new THREE.BoxGeometry(length + 3.5, floorHeight * 2 + roofPeak + 2, depth + 3.5);
      const highlightEdges = new THREE.EdgesGeometry(highlightGeo);
      const highlightMat = new THREE.LineBasicMaterial({ color: '#10b981', linewidth: 3 });
      const highlightMesh = new THREE.LineSegments(highlightEdges, highlightMat);
      highlightMesh.position.y = (floorHeight * 2 + roofPeak) / 2;
      highlightMesh.visible = false;
      bldgGroup.add(highlightMesh);

      // Hitbox untuk raycasting click & hover
      const hitBoxGeo = new THREE.BoxGeometry(length + 3, floorHeight * 2 + roofPeak + 1, depth + 3);
      const hitBoxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBox.position.y = (floorHeight * 2 + roofPeak) / 2;
      hitBox.userData = { buildingId, name, code };
      bldgGroup.add(hitBox);

      scene.add(bldgGroup);

      return {
        group: bldgGroup,
        roof: roofGroup,
        floor2: floor2Group,
        highlight: highlightMesh,
        hitBox
      };
    };

    // Bangun GEDUNG LABTEK 1 (Gedung A - Bagian Depan Sesuai Lingkaran Merah Foto)
    const labtek = buildCampusBuilding(
      'Gedung LABTEK 1',
      'A',
      'gedung-a',
      0,       // Center X
      14,      // Center Z (lebih dekat ke kamera/jalan)
      52,      // Panjang
      13.5,    // Lebar
      true     // Memiliki kanopi teras depan
    );
    labtekGroupRef.current = labtek.group;
    labtekRoofRef.current = labtek.roof;
    labtekFloor2Ref.current = labtek.floor2;
    labtekHighlightRef.current = labtek.highlight;

    // Bangun GEDUNG FT.1 (Gedung B - Sejajar di Belakang LABTEK 1 Sesuai Lingkaran Merah Foto)
    const ft1 = buildCampusBuilding(
      'Gedung FT.1',
      'B',
      'gedung-b',
      3.5,     // Sedikit bergeser ke timur sesuai foto drone
      -14,     // Center Z (sejajar di belakang LABTEK 1)
      54,      // Panjang
      13.5,    // Lebar
      true     // Kanopi pintu masuk
    );
    ft1GroupRef.current = ft1.group;
    ft1RoofRef.current = ft1.roof;
    ft1Floor2Ref.current = ft1.floor2;
    ft1HighlightRef.current = ft1.highlight;

    // 7. Pohon & Vegetasi Kampus (Matching Drone Photo Atmosphere)
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: '#5c4033', roughness: 0.9 });
    const treeFoliageMat1 = new THREE.MeshStandardMaterial({ color: '#2d6a4f', roughness: 0.8 });
    const treeFoliageMat2 = new THREE.MeshStandardMaterial({ color: '#40916c', roughness: 0.8 });

    const createCampusTree = (x: number, z: number, scale = 1) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, 0, z);

      // Batang
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, 3 * scale, 6), treeTrunkMat);
      trunk.position.y = 1.5 * scale;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Tajuk daun bertingkat
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

    // Sebaran pohon di sekeliling taman kampus sesuai foto drone
    const treeCoords = [
      [-36, 18, 1.1], [-38, 8, 1.2], [-35, -4, 0.9], [-37, -18, 1.3],
      [36, 16, 1.0], [39, 4, 1.2], [37, -10, 0.9], [38, -22, 1.1],
      [-24, 30, 0.8], [-12, 30, 0.7], [16, 30, 0.9], [28, 30, 0.85],
      [-20, -28, 1.1], [-6, -28, 1.2], [14, -28, 1.0], [26, -28, 1.15]
    ];
    treeCoords.forEach(([tx, tz, ts]) => createCampusTree(tx, tz, ts));

    // 8. Interaksi Mouse Raycaster (Klik & Hover Gedung)
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

      // Hitbox Raycasting untuk Hover
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([labtek.hitBox, ft1.hitBox]);

      if (intersects.length > 0) {
        const hitData = intersects[0].object.userData;
        container.style.cursor = 'pointer';
        setHoveredBuilding(hitData.buildingId);
      } else {
        container.style.cursor = orbitState.current.isDragging ? 'grabbing' : 'default';
        setHoveredBuilding(null);
      }

      // Orbit Drag
      if (!orbitState.current.isDragging) return;

      const deltaX = clientX - orbitState.current.prevX;
      const deltaY = clientY - orbitState.current.prevY;
      orbitState.current.prevX = clientX;
      orbitState.current.prevY = clientY;

      orbitState.current.targetAzimuth -= deltaX * 0.007;
      orbitState.current.targetPolar = Math.max(0.12, Math.min(Math.PI / 2 - 0.04, orbitState.current.targetPolar - deltaY * 0.007));
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      // Deteksi jika ini adalah klik biasa (bukan drag panjang)
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([labtek.hitBox, ft1.hitBox]);

      if (intersects.length > 0) {
        const hitData = intersects[0].object.userData;
        onSelectBuilding(hitData.buildingId);
      }

      orbitState.current.isDragging = false;
      container.style.cursor = 'default';
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitState.current.targetDistance = Math.max(25, Math.min(130, orbitState.current.targetDistance + e.deltaY * 0.06));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handlePointerDown);
    domEl.addEventListener('mousemove', handlePointerMove);
    domEl.addEventListener('mouseup', handlePointerUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    domEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    domEl.addEventListener('touchmove', handlePointerMove, { passive: true });
    domEl.addEventListener('touchend', handlePointerUp);

    // 9. Loop Render Animasi
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const os = orbitState.current;

      // Auto rotate jika diaktifkan
      if (isAutoRotate && !os.isDragging) {
        os.targetAzimuth += 0.003;
      }

      // Smooth damping interpolation (Lerp)
      os.azimuth += (os.targetAzimuth - os.azimuth) * 0.08;
      os.polar += (os.targetPolar - os.polar) * 0.08;
      os.distance += (os.targetDistance - os.distance) * 0.08;

      // Konversi koordinat bola ke Kartesius
      const cx = os.target.x + os.distance * Math.sin(os.polar) * Math.sin(os.azimuth);
      const cy = os.target.y + os.distance * Math.cos(os.polar);
      const cz = os.target.z + os.distance * Math.sin(os.polar) * Math.cos(os.azimuth);

      camera.position.set(cx, cy, cz);
      camera.lookAt(os.target);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight || 580;
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
      
      {/* 1. Header Toolbar Atas */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-900/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Building2 className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                  Model Bangunan 3D Gedung Fakultas Teknik
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  LABTEK 1 & FT.1
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Representasi 3D arsitektural gedung kuliah terpadu & labkom Kampus 2 Mugarsari sesuai foto udara.
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
              title="Sudut pandang udara menyerupai foto drone asli"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Foto Drone</span>
            </button>

            <button
              onClick={() => applyCameraPreset('front')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                cameraPreset === 'front'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
              title="Tampak Depan Mata Memandang"
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
              title="Sudut Isometrik 45 Derajat"
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
              title="Tampak Atas (Site Plan)"
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
            title="Buka atap dan pisahkan lantai untuk melihat ruangan dalam"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isExploded ? 'Tutup Atap' : 'Potongan Lantai 3D'}</span>
          </button>

          {/* Pencahayaan Siang / Sunset / Malam */}
          <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl gap-0.5">
            <button
              onClick={() => setTimeOfDay('day')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                timeOfDay === 'day' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Pencahayaan Siang Cerah"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTimeOfDay('sunset')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                timeOfDay === 'sunset' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Pencahayaan Golden Hour Sore (Sesuai Foto Drone Asli)"
            >
              <Sunset className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTimeOfDay('night')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                timeOfDay === 'night' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Pencahayaan Malam Hari"
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
            <span className="hidden sm:inline">Foto Asli</span>
          </button>
        </div>
      </div>

      {/* 2. WebGL 3D Canvas Viewport */}
      <div className="relative w-full h-[540px] sm:h-[620px] bg-slate-900 select-none overflow-hidden">
        
        {/* Kontainer Canvas Three.js */}
        <div ref={containerRef} className="w-full h-full touch-none" />

        {/* 🏷️ 3D Floating Building Selector Pills */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2.5 pointer-events-auto">
          
          {/* LABTEK 1 Button */}
          <button
            onClick={() => onSelectBuilding('gedung-a')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl backdrop-blur-md text-xs font-extrabold transition-all shadow-lg cursor-pointer border ${
              activeBuildingId === 'gedung-a'
                ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/40 translate-x-1 scale-105'
                : 'bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-white'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${activeBuildingId === 'gedung-a' ? 'bg-white animate-ping' : 'bg-blue-500'}`} />
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span>Gedung LABTEK 1</span>
                {activeBuildingId === 'gedung-a' && <span className="text-[10px]">✓</span>}
              </div>
              <span className="text-[10px] font-normal opacity-85 block">Labkom & Riset Terpadu</span>
            </div>
          </button>

          {/* FT.1 Button */}
          <button
            onClick={() => onSelectBuilding('gedung-b')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl backdrop-blur-md text-xs font-extrabold transition-all shadow-lg cursor-pointer border ${
              activeBuildingId === 'gedung-b'
                ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/40 translate-x-1 scale-105'
                : 'bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-white'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${activeBuildingId === 'gedung-b' ? 'bg-white animate-ping' : 'bg-blue-500'}`} />
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span>Gedung FT.1</span>
                {activeBuildingId === 'gedung-b' && <span className="text-[10px]">✓</span>}
              </div>
              <span className="text-[10px] font-normal opacity-85 block">Ruang Kuliah & Dekanat</span>
            </div>
          </button>

        </div>

        {/* 💡 Petunjuk Interaksi Navigasi di Sudut Kanan Atas */}
        <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
          <span>Geser mouse / sentuh untuk memutar 360° • Scroll untuk zoom</span>
        </div>

        {/* 📋 Floating Bottom Building Action Card */}
        <div className="absolute bottom-4 left-4 right-4 z-20 max-w-2xl mx-auto p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-200 dark:border-slate-700 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-modal-spring">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-extrabold shadow-md shrink-0">
              {activeBuilding.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {activeBuilding.name}
                </h4>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  {activeBuilding.floorsCount} Tingkat
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {activeBuilding.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <button
              onClick={() => {
                onSelectFloor(1);
                if (onSwitchToFloorPlan) onSwitchToFloorPlan();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-extrabold transition-all cursor-pointer"
            >
              Lantai 1
            </button>

            <button
              onClick={() => {
                onSelectFloor(2);
                if (onSwitchToFloorPlan) onSwitchToFloorPlan();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-extrabold transition-all cursor-pointer"
            >
              Lantai 2
            </button>

            {onSwitchToFloorPlan && (
              <button
                onClick={onSwitchToFloorPlan}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <span>Buka Denah Isometrik</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 3. Modal Lightbox Foto Asli Drone (Bandingkan Langsung dengan Foto Referensi) */}
      {showPhotoModal && (
        <div 
          className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowPhotoModal(false)}
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-modal-spring"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <h4 className="text-white text-sm sm:text-base font-extrabold">
                  Foto Udara Asli: Gedung LABTEK 1 & FT.1 Universitas Siliwangi
                </h4>
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
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="p-4 bg-slate-900 border-t border-white/10 text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
              <span>
                Area yang ditandai lingkaran merah adalah <strong>Gedung LABTEK 1</strong> (depan) dan <strong>Gedung FT.1</strong> (belakang).
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
