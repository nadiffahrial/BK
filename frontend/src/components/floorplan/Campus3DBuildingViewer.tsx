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
  Image as ImageIcon,
  Car,
  Flag,
  Navigation,
  Sliders,
  Zap,
  Maximize2
} from 'lucide-react';
import { UNSIL_LOGO_BASE64 } from './logoBase64';

interface Campus3DBuildingViewerProps {
  buildings: Building[];
  activeBuildingId: string;
  onSelectBuilding: (buildingId: string) => void;
  activeFloorNumber: number;
  onSelectFloor: (floorNumber: number) => void;
  onSelectRoom?: (room: Room) => void;
  onSwitchToFloorPlan?: () => void;
}

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
  signType?: 'ft1' | 'ft2' | 'labtek1' | 'sipil' | 'dekanat' | 'generic';
  description: string;
}

const ALL_CAMPUS_BUILDINGS: CampusBuildingDef[] = [
  // 1. Gedung LABTEK 1 (Lajur Barat-Depan, Dilingkari Merah, Denah Lantai 1 & 2 Tersedia ✓)
  {
    id: 'gedung-a',
    name: 'Gedung LABTEK 1',
    shortName: 'LABTEK 1',
    code: 'A',
    role: 'Laboratorium Komputer & Riset Teknik Terpadu',
    hasFloorPlan: true,
    x: -28,
    z: 14,
    length: 50,
    depth: 13.5,
    height: 7.8,
    roofHeight: 5.2,
    hasFrontCanopy: true,
    canopyX: 8,
    signType: 'labtek1',
    description: 'Pusat laboratorium komputer, jaringan, multimedia, dan riset AI Fakultas Teknik (Denah Tersedia).'
  },
  // 2. Gedung FT.1 (Lajur Barat-Tengah, Dilingkari Merah, Denah Lantai 1 & 2 Tersedia ✓)
  {
    id: 'gedung-b',
    name: 'Gedung FT.1 (Informatika & SI)',
    shortName: 'FT.1',
    code: 'B',
    role: 'Informatika & Sistem Informasi (Kuliah & Sidang)',
    hasFloorPlan: true,
    x: -26,
    z: -16,
    length: 52,
    depth: 13.5,
    height: 7.8,
    roofHeight: 5.2,
    hasFrontCanopy: true,
    canopyX: -12,
    signType: 'ft1',
    description: 'Gedung perkuliahan program studi Informatika dan Sistem Informasi, serta ruang sidang skripsi (Denah Tersedia).'
  },
  // 3. Gedung Dekanat & Pusat Administrasi Fakultas Teknik (Lajur Tengah-Depan, Sesuai Google Earth Pin Merah & Foto Fasad)
  {
    id: 'dekanat-ft',
    name: 'Gedung Dekanat & Ruang Kuliah Terpadu FT',
    shortName: 'DEKANAT FT',
    code: 'DK',
    role: 'Dekanat & Ruang Kuliah Terpadu (SBSN 2022-2023)',
    hasFloorPlan: false,
    x: 26,
    z: 14,
    length: 48,
    depth: 14.5,
    height: 8.6,
    roofHeight: 5.5,
    hasFrontCanopy: true,
    canopyX: -4,
    isDekanat: true,
    signType: 'dekanat',
    description: 'Gedung Dekanat, kantor pimpinan, dan Ruang Kuliah Terpadu SBSN 2022-2023 dengan kanopi FAKULTAS TEKNIK dan logo resmi UNSIL.'
  },
  // 4. Gedung FT.2 - Teknik Elektro (Lajur Tengah, Sejajar di Belakang Dekanat)
  {
    id: 'gedung-ft2',
    name: 'Gedung FT.2 (Teknik Elektro)',
    shortName: 'FT.2',
    code: 'FT2',
    role: 'Perkuliahan & Laboratorium Teknik Elektro',
    hasFloorPlan: false,
    x: 28,
    z: -16,
    length: 50,
    depth: 13.5,
    height: 7.8,
    roofHeight: 5.2,
    hasFrontCanopy: true,
    canopyX: -10,
    signType: 'ft2',
    description: 'Gedung perkuliahan teori, ruang dosen, dan laboratorium praktikum program studi Teknik Elektro.'
  },
  // 5. Gedung Laboratorium Teknik Sipil Mugarsari (Lajur Timur-Depan, Sesuai Google Earth)
  {
    id: 'lab-sipil',
    name: 'Gedung Lab Teknik Sipil Mugarsari',
    shortName: 'LAB SIPIL',
    code: 'TS',
    role: 'Laboratorium Rekayasa Struktur & Uji Bahan Sipil',
    hasFloorPlan: false,
    x: 62,
    z: 14,
    length: 50,
    depth: 14.0,
    height: 8.0,
    roofHeight: 5.4,
    hasFrontCanopy: true,
    canopyX: -6,
    signType: 'sipil',
    description: 'Fasilitas pengujian bahan konstruksi, mekanika tanah, struktur beton, dan rekayasa hidrolika Teknik Sipil Mugarsari.'
  },
  // 6. Gedung Kuliah & Lab Riset Terpadu Panjang (Lajur Tengah-Utara, Gedung Terpanjang di Google Earth)
  {
    id: 'lab-terpadu-panjang',
    name: 'Gedung Kuliah & Lab Riset Terpadu',
    shortName: 'KULIAH TERPADU',
    code: 'KTP',
    role: 'Gedung Kuliah Terpadu Bersama & Riset Keteknikan',
    hasFloorPlan: false,
    x: 2,
    z: -46,
    length: 68,
    depth: 14.0,
    height: 8.2,
    roofHeight: 5.5,
    hasFrontCanopy: true,
    canopyX: 0,
    signType: 'generic',
    description: 'Gedung perkuliahan terpanjang di kampus untuk kelas bersama lintas program studi dan riset keteknikan terpadu.'
  },
  // 7. Gedung Laboratorium Teknik Mesin & Energi Terbarukan (Lajur Timur-Utara)
  {
    id: 'lab-mesin',
    name: 'Gedung Lab Teknik Mesin & Energi',
    shortName: 'LAB MESIN',
    code: 'TM',
    role: 'Laboratorium Konversi Energi & Manufaktur CNC',
    hasFloorPlan: false,
    x: 62,
    z: -40,
    length: 48,
    depth: 13.5,
    height: 7.6,
    roofHeight: 5.0,
    signType: 'generic',
    description: 'Fasilitas praktikum manufaktur, CNC, permesinan, pengelasan, dan riset konversi energi Fakultas Teknik.'
  }
];

// =========================================================================
// UNREAL ENGINE 5 PBR PROCEDURAL TEXTURES & NORMAL MAP GENERATORS
// =========================================================================

// 1. Generate Procedural HDR Equirectangular Sky Map (Lumen-style IBL)
function generateUnrealHdrSky(timeOfDay: 'day' | 'sunset' | 'night'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  if (timeOfDay === 'day') {
    // Siang Terik Bersih (Unreal Engine Ultra Sky Atmosphere)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    skyGrad.addColorStop(0, '#1d4ed8');    // Zenith deep blue
    skyGrad.addColorStop(0.35, '#38bdf8'); // Mid sky
    skyGrad.addColorStop(0.5, '#bae6fd');  // Horizon atmospheric haze
    skyGrad.addColorStop(0.52, '#dbeafe'); // Horizon glint
    skyGrad.addColorStop(0.65, '#22c55e'); // Ground foliage bounce
    skyGrad.addColorStop(1, '#14532d');    // Terrain deep green
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Matahari & Corona Flare
    const sunX = 720;
    const sunY = 320;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 320);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.08, '#fffbeb');
    sunGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.45)');
    sunGrad.addColorStop(0.6, 'rgba(186, 230, 253, 0.15)');
    sunGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 320, 0, Math.PI * 2);
    ctx.fill();

    // Awan Cumulus Halus khas Unreal Engine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    const drawCloud = (cx: number, cy: number, w: number, h: number) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, w, h, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + w * 0.4, cy - h * 0.2, w * 0.7, h * 0.8, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - w * 0.4, cy + h * 0.1, w * 0.6, h * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    drawCloud(400, 380, 160, 45);
    drawCloud(1100, 340, 220, 55);
    drawCloud(1650, 410, 180, 48);
    drawCloud(150, 420, 140, 40);

  } else if (timeOfDay === 'sunset') {
    // Golden Hour Cinematic Sunset
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    skyGrad.addColorStop(0, '#312e81');    // Indigo zenith
    skyGrad.addColorStop(0.3, '#7c2d12');  // Deep amber
    skyGrad.addColorStop(0.48, '#ea580c'); // Vibrant orange
    skyGrad.addColorStop(0.52, '#fef08a'); // Golden horizon
    skyGrad.addColorStop(0.65, '#365314'); // Warm ground
    skyGrad.addColorStop(1, '#1c1917');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Matahari Terbenam Emas
    const sunX = 850;
    const sunY = 490;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 400);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.12, '#fef08a');
    sunGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.5)');
    sunGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 400, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // Cyber Night / Midnight Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    skyGrad.addColorStop(0, '#020617');
    skyGrad.addColorStop(0.48, '#0f172a');
    skyGrad.addColorStop(0.52, '#1e293b');
    skyGrad.addColorStop(1, '#020617');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Bulan Terang
    const moonX = 500;
    const moonY = 220;
    const moonGrad = ctx.createRadialGradient(moonX, moonY, 8, moonX, moonY, 140);
    moonGrad.addColorStop(0, '#ffffff');
    moonGrad.addColorStop(0.2, '#e0f2fe');
    moonGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.2)');
    moonGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 140, 0, Math.PI * 2);
    ctx.fill();

    // Bintang-bintang
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 600; i++) {
      const sx = Math.random() * 2048;
      const sy = Math.random() * 500;
      const sr = Math.random() * 1.5 + 0.5;
      ctx.fillRect(sx, sy, sr, sr);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

// 2. Tekstur Dinding Cat Biru FT dengan Bump Tali Air Tajam
function generateSkyBlueWallTextures(): { diffuse: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const dCanvas = document.createElement('canvas');
  dCanvas.width = 1024;
  dCanvas.height = 1024;
  const dctx = dCanvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = 1024;
  bCanvas.height = 1024;
  const bctx = bCanvas.getContext('2d')!;

  // Diffuse: Biru cerulean FT UNSIL
  dctx.fillStyle = '#3ea6ff';
  dctx.fillRect(0, 0, 1024, 1024);

  // Bump: Netral abu-abu 128
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, 1024, 1024);

  // Butiran plesteran cat tembok realistis (Micro-surface roughness)
  for (let i = 0; i < 25000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const val = Math.random() > 0.5 ? 20 : -20;
    dctx.fillStyle = val > 0 ? '#4ab0ff' : '#339cf5';
    dctx.fillRect(x, y, 2, 2);

    bctx.fillStyle = val > 0 ? '#959595' : '#6b6b6b';
    bctx.fillRect(x, y, 2, 2);
  }

  // Tali air horizontal pembagi lantai (Groove indent)
  dctx.strokeStyle = '#2283dc';
  dctx.lineWidth = 4;
  dctx.beginPath();
  dctx.moveTo(0, 512);
  dctx.lineTo(1024, 512);
  dctx.stroke();

  bctx.strokeStyle = '#202020'; // Gelap = ceruk ke dalam
  bctx.lineWidth = 6;
  bctx.beginPath();
  bctx.moveTo(0, 512);
  bctx.lineTo(1024, 512);
  bctx.stroke();

  const diffuse = new THREE.CanvasTexture(dCanvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(4, 2);

  const bump = new THREE.CanvasTexture(bCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(4, 2);

  return { diffuse, bump };
}

// 3. Tekstur Genteng Keramik Limasan Cokelat Terakota dengan Bump Lengkungan
function generateRoofTilePbrTextures(): { diffuse: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const dCanvas = document.createElement('canvas');
  dCanvas.width = 1024;
  dCanvas.height = 1024;
  const dctx = dCanvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = 1024;
  bCanvas.height = 1024;
  const bctx = bCanvas.getContext('2d')!;

  dctx.fillStyle = '#6e2716';
  dctx.fillRect(0, 0, 1024, 1024);

  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, 1024, 1024);

  const rowHeight = 36;
  const colWidth = 54;

  for (let y = 0; y < 1024; y += rowHeight) {
    const isOdd = (y / rowHeight) % 2 === 1;
    const offsetX = isOdd ? colWidth / 2 : 0;

    // Garis overlap genteng bawah (Shadowed lip)
    dctx.fillStyle = '#3a1208';
    dctx.fillRect(0, y + rowHeight - 6, 1024, 6);

    bctx.fillStyle = '#202020';
    bctx.fillRect(0, y + rowHeight - 6, 1024, 6);

    // Kilau sorotan atas genteng
    dctx.fillStyle = '#9c381f';
    dctx.fillRect(0, y, 1024, 4);

    bctx.fillStyle = '#e0e0e0';
    bctx.fillRect(0, y, 1024, 4);

    for (let x = -colWidth; x < 1024 + colWidth; x += colWidth) {
      const tileX = x + offsetX;
      dctx.fillStyle = '#2b0c05';
      dctx.fillRect(tileX, y, 3, rowHeight);

      bctx.fillStyle = '#303030';
      bctx.fillRect(tileX, y, 4, rowHeight);

      // Lengkungan genteng keramik (Curved normal height)
      const grad = dctx.createLinearGradient(tileX, y, tileX + colWidth, y);
      grad.addColorStop(0, 'rgba(0,0,0,0.25)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.12)');
      grad.addColorStop(1, 'rgba(0,0,0,0.28)');
      dctx.fillStyle = grad;
      dctx.fillRect(tileX + 3, y + 3, colWidth - 6, rowHeight - 9);

      const bGrad = bctx.createLinearGradient(tileX, y, tileX + colWidth, y);
      bGrad.addColorStop(0, '#505050');
      bGrad.addColorStop(0.5, '#d0d0d0');
      bGrad.addColorStop(1, '#505050');
      bctx.fillStyle = bGrad;
      bctx.fillRect(tileX + 3, y + 3, colWidth - 6, rowHeight - 9);
    }
  }

  const diffuse = new THREE.CanvasTexture(dCanvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(6, 6);

  const bump = new THREE.CanvasTexture(bCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(6, 6);

  return { diffuse, bump };
}

// 4. Tekstur Paving Herringbone Interlock dengan Bevel Bump
function generateHerringbonePbrTextures(): { diffuse: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const dCanvas = document.createElement('canvas');
  dCanvas.width = 512;
  dCanvas.height = 512;
  const dctx = dCanvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = 512;
  bCanvas.height = 512;
  const bctx = bCanvas.getContext('2d')!;

  dctx.fillStyle = '#cbd5e1';
  dctx.fillRect(0, 0, 512, 512);

  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, 512, 512);

  const pw = 40;
  const ph = 20;

  for (let y = -40; y < 552; y += 40) {
    for (let x = -40; x < 552; x += 40) {
      const v = Math.min(235, Math.max(185, 210 + (Math.random() * 24 - 12)));
      dctx.fillStyle = `rgb(${v}, ${v + 2}, ${v + 5})`;
      dctx.fillRect(x + 1, y + 1, pw - 2, ph - 2);

      dctx.strokeStyle = '#64748b';
      dctx.lineWidth = 2;
      dctx.strokeRect(x, y, pw, ph);

      // Bump grout / bevels
      bctx.fillStyle = '#a8a8a8';
      bctx.fillRect(x + 2, y + 2, pw - 4, ph - 4);
      bctx.strokeStyle = '#222222';
      bctx.lineWidth = 3;
      bctx.strokeRect(x, y, pw, ph);

      // Pasangan tegak
      const v2 = Math.min(235, Math.max(185, 210 + (Math.random() * 24 - 12)));
      dctx.fillStyle = `rgb(${v2}, ${v2 + 2}, ${v2 + 5})`;
      dctx.fillRect(x + ph + 1, y + ph + 1, ph - 2, pw - 2);
      dctx.strokeRect(x + ph, y + ph, ph, pw);

      bctx.fillStyle = '#a8a8a8';
      bctx.fillRect(x + ph + 2, y + ph + 2, ph - 4, pw - 4);
      bctx.strokeStyle = '#222222';
      bctx.lineWidth = 3;
      bctx.strokeRect(x + ph, y + ph, ph, pw);
    }
  }

  const diffuse = new THREE.CanvasTexture(dCanvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(8, 8);

  const bump = new THREE.CanvasTexture(bCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(8, 8);

  return { diffuse, bump };
}

// 5. Panel Fasad Biru SBSN Dekanat Resolusi Tinggi (Ornamen Batik Chevron, Logo Resmi UNSIL Asli, Teks Emas SBSN)
function generateDekanatFeatureWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const texture = new THREE.CanvasTexture(canvas);

  const drawContent = (logoImg?: HTMLImageElement) => {
    // Latar biru tua cobalt megah
    ctx.fillStyle = '#0d3875';
    ctx.fillRect(0, 0, 1024, 512);

    // Ornamen Batik Geometris Putih Sisi Kiri
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(40, 460);
    ctx.lineTo(140, 256);
    ctx.lineTo(40, 60);
    ctx.lineTo(95, 60);
    ctx.lineTo(195, 256);
    ctx.lineTo(95, 460);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#0d3875';
    ctx.lineWidth = 3;
    for (let y = 80; y < 450; y += 32) {
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(170, y);
      ctx.stroke();
    }
    ctx.restore();

    // Gambar Logo Resmi Universitas Siliwangi (Perisai Hijau & Harimau Maung Siliwangi Asli)
    const logoCenterX = 560;
    const logoCenterY = 118;
    const logoSize = 135;

    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
      ctx.drawImage(logoImg, logoCenterX - logoSize / 2, logoCenterY - logoSize / 2, logoSize, logoSize);
    } else {
      ctx.beginPath();
      ctx.arc(logoCenterX, logoCenterY, 52, 0, Math.PI * 2);
      ctx.fillStyle = '#15803d';
      ctx.fill();
    }

    // Teks Emas Resmi SBSN
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const drawGoldText = (text: string, x: number, y: number, font: string) => {
      ctx.font = font;
      ctx.fillStyle = '#061c40';
      ctx.fillText(text, x + 2, y + 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(text, x, y);
    };

    drawGoldText('LABORATORIUM DAN RUANG KULIAH TERPADU', logoCenterX, 225, '800 28px "Plus Jakarta Sans", sans-serif');
    drawGoldText('UNIVERSITAS SILIWANGI', logoCenterX, 275, '900 36px "Plus Jakarta Sans", sans-serif');
    drawGoldText('FAKULTAS TEKNIK', logoCenterX, 330, '900 38px "Plus Jakarta Sans", sans-serif');
    drawGoldText('SBSN TAHUN ANGGARAN 2022-2023', logoCenterX, 395, '800 24px "Plus Jakarta Sans", sans-serif');

    texture.needsUpdate = true;
  };

  const img = new Image();
  img.onload = () => {
    drawContent(img);
  };
  img.src = UNSIL_LOGO_BASE64;
  drawContent();

  return texture;
}

// 6. Plang Kanopi Depan: "FAKULTAS TEKNIK"
function generateCanopyFasciaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0d3875';
  ctx.fillRect(0, 0, 512, 96);

  ctx.strokeStyle = '#1e40af';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 504, 88);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '900 38px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#020617';
  ctx.fillText('FAKULTAS TEKNIK', 258, 50);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('FAKULTAS TEKNIK', 256, 48);

  return new THREE.CanvasTexture(canvas);
}

// 7. Fasad FT.1 & FT.2
function generateFT1SignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3ea6ff';
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 3;
  const ventTopY = 70;
  [140, 256, 372].forEach((vx) => {
    ctx.fillRect(vx - 22, ventTopY - 22, 44, 44);
    ctx.strokeRect(vx - 22, ventTopY - 22, 44, 44);
  });

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '900 115px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('FT.1', 259, 218);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('FT.1', 256, 215);

  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('INFORMATIKA', 257, 283);
  ctx.fillText('& SISTEM INFORMASI', 257, 317);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('INFORMATIKA', 256, 282);
  ctx.fillText('& SISTEM INFORMASI', 256, 316);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(50, 360, 412, 12);

  const ventBotY = 425;
  [140, 256, 372].forEach((vx) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(vx - 22, ventBotY - 22, 44, 44);
    ctx.strokeRect(vx - 22, ventBotY - 22, 44, 44);
  });

  return new THREE.CanvasTexture(canvas);
}

function generateFT2SignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3ea6ff';
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 3;
  const ventTopY = 70;
  [110, 207, 304, 401].forEach((vx) => {
    ctx.fillRect(vx - 20, ventTopY - 20, 40, 40);
    ctx.strokeRect(vx - 20, ventTopY - 20, 40, 40);
  });

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '900 115px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('FT.2', 259, 218);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('FT.2', 256, 215);

  ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('TEKNIK ELEKTRO', 257, 291);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('TEKNIK ELEKTRO', 256, 290);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(50, 360, 412, 12);

  const ventBotY = 425;
  [110, 207, 304, 401].forEach((vx) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(vx - 20, ventBotY - 20, 40, 40);
    ctx.strokeRect(vx - 20, ventBotY - 20, 40, 40);
  });

  return new THREE.CanvasTexture(canvas);
}

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

  return new THREE.CanvasTexture(canvas);
}

function generateSipilSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3ea6ff';
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 3;
  const ventTopY = 70;
  [110, 207, 304, 401].forEach((vx) => {
    ctx.fillRect(vx - 20, ventTopY - 20, 40, 40);
    ctx.strokeRect(vx - 20, ventTopY - 20, 40, 40);
  });

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '900 82px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('LAB SIPIL', 258, 208);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('LAB SIPIL', 256, 205);

  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('TEKNIK SIPIL MUGARSARI', 257, 281);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('TEKNIK SIPIL MUGARSARI', 256, 280);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(50, 350, 412, 10);

  const ventBotY = 425;
  [110, 207, 304, 401].forEach((vx) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(vx - 20, ventBotY - 20, 40, 40);
    ctx.strokeRect(vx - 20, ventBotY - 20, 40, 40);
  });

  return new THREE.CanvasTexture(canvas);
}

// 8. Jendela Kaca Reflektif Fasad Depan Grid Mullions
function generateFrontGridWindowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#1e293b');
  grad.addColorStop(0.5, '#0f172a');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, 244, 244);

  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(85, 12);
  ctx.lineTo(85, 244);
  ctx.moveTo(170, 12);
  ctx.lineTo(170, 244);
  ctx.moveTo(12, 128);
  ctx.lineTo(244, 128);
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

// 9. Tekstur Aspal Jalan dengan Garis Marka
function generateAsphaltPbrTextures(): { diffuse: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e242d';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? '#28313d' : '#141820';
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  // Garis marka jalan putih putus-putus
  ctx.fillStyle = '#f8fafc';
  for (let y = 30; y < 512; y += 80) {
    ctx.fillRect(250, y, 12, 45);
  }

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(4, 8);
  return { diffuse };
}

// 10. Talud Batu Kali & Kanstin
function generateRetainingWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, 0, 256, 256);

  const stones = [
    { x: 30, y: 30, r: 24, c: '#334155' },
    { x: 95, y: 35, r: 28, c: '#475569' },
    { x: 170, y: 30, r: 32, c: '#1e293b' },
    { x: 230, y: 40, r: 22, c: '#334155' },
    { x: 45, y: 95, r: 32, c: '#475569' },
    { x: 125, y: 100, r: 36, c: '#1e293b' },
    { x: 205, y: 95, r: 30, c: '#334155' },
    { x: 30, y: 165, r: 28, c: '#1e293b' },
    { x: 100, y: 170, r: 32, c: '#334155' },
    { x: 175, y: 165, r: 34, c: '#475569' },
    { x: 235, y: 160, r: 24, c: '#1e293b' },
    { x: 50, y: 225, r: 26, c: '#334155' },
    { x: 130, y: 225, r: 30, c: '#475569' },
    { x: 210, y: 225, r: 28, c: '#1e293b' }
  ];

  stones.forEach(s => {
    ctx.fillStyle = s.c;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, s.r, s.r * 0.75, Math.random() * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 2);
  return texture;
}

function generateCurbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 64, 32);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(64, 0, 64, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 1);
  return texture;
}

// 11. Rumput Alami
function generateGrassPbrTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3c7943';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 12000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 3.5 + 1;
    const rnd = Math.random();
    if (rnd < 0.35) ctx.fillStyle = '#4c8f53';
    else if (rnd < 0.7) ctx.fillStyle = '#2d5e35';
    else ctx.fillStyle = '#5ca266';
    ctx.fillRect(x, y, r, r);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

// Helper Atap Limasan
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

  pushTri(v0, v1, v5);
  pushTri(v0, v5, v4);
  pushTri(v2, v3, v4);
  pushTri(v2, v4, v5);
  pushTri(v3, v0, v4);
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
  const [cameraPreset, setCameraPreset] = useState<'drone' | 'labtek_ft1' | 'courtyard' | 'front' | 'road_side' | 'iso' | 'satellite'>('front');
  const [graphicsQuality, setGraphicsQuality] = useState<'ue5_ultra' | 'ue5_high'>('ue5_ultra');
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [hoveredBuildingId, setHoveredBuildingId] = useState<string | null>(null);
  const [selectedCampusBuilding, setSelectedCampusBuilding] = useState<CampusBuildingDef>(
    ALL_CAMPUS_BUILDINGS.find(b => b.id === 'dekanat-ft') || ALL_CAMPUS_BUILDINGS[2]
  );

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pmremGeneratorRef = useRef<THREE.PMREMGenerator | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const flagMeshRef = useRef<THREE.Mesh | null>(null);

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
    azimuth: 0.04,
    polar: 1.40,
    distance: 50,
    target: new THREE.Vector3(24, 4.5, 14),
    targetAzimuth: 0.04,
    targetPolar: 1.40,
    targetDistance: 50
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

  // Preset Kamera Akurat (Unreal Engine Cinematic Focal Points)
  const applyCameraPreset = useCallback((preset: 'drone' | 'labtek_ft1' | 'courtyard' | 'front' | 'road_side' | 'iso' | 'satellite') => {
    setCameraPreset(preset);
    const os = orbitState.current;

    if (preset === 'front') {
      // PERSIS FOTO 1: Tampak Depan Fasad Dekanat & Kanopi "FAKULTAS TEKNIK" (SBSN 2022-2023)
      os.targetAzimuth = 0.04;
      os.targetPolar = 1.40;
      os.targetDistance = 48;
      os.target.set(24, 4.5, 14);
    } else if (preset === 'road_side') {
      // PERSIS FOTO 2: Akses Jalan Aspal Depan, Talud Batu Kali, Barisan Motor & Gedung FT.2
      os.targetAzimuth = 0.42;
      os.targetPolar = 1.42;
      os.targetDistance = 56;
      os.target.set(32, 4.0, -8);
    } else if (preset === 'courtyard') {
      // PERSIS FOTO 3: Sudut Jalan Paving Herringbone Tengah & Kanopi Penghubung
      os.targetAzimuth = 0.02;
      os.targetPolar = 1.34;
      os.targetDistance = 52;
      os.target.set(2, 4, 0);
    } else if (preset === 'labtek_ft1') {
      // Fokus ke LABTEK 1 & FT.1 (yang dilingkari merah)
      os.targetAzimuth = 0.52;
      os.targetPolar = 0.88;
      os.targetDistance = 72;
      os.target.set(-26, 5, -2);
    } else if (preset === 'drone') {
      // PERSIS FOTO DRONE: Sudut Udara Seluruh Kawasan Fakultas
      os.targetAzimuth = 0.58;
      os.targetPolar = 0.82;
      os.targetDistance = 140;
      os.target.set(16, 4, -14);
    } else if (preset === 'iso') {
      os.targetAzimuth = 0.785;
      os.targetPolar = 0.95;
      os.targetDistance = 130;
      os.target.set(16, 4, -14);
    } else if (preset === 'satellite') {
      // PERSIS GOOGLE EARTH SATELIT: Sudut Atas Miring Satelit Mugarsari
      os.targetAzimuth = 0.05;
      os.targetPolar = 0.40;
      os.targetDistance = 160;
      os.target.set(16, 2, -14);
    }
  }, []);

  // Update Dynamic Unreal Engine Sky & Lighting IBL
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current || !pmremGeneratorRef.current) return;
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const pmrem = pmremGeneratorRef.current;

    const skyTex = generateUnrealHdrSky(timeOfDay);
    const envMap = pmrem.fromEquirectangular(skyTex).texture;

    scene.environment = envMap;
    scene.background = skyTex;

    const sun = sunLightRef.current;
    const ambient = ambientLightRef.current;
    const hemi = hemiLightRef.current;

    if (!sun || !ambient || !hemi) return;

    if (timeOfDay === 'day') {
      scene.fog = new THREE.FogExp2('#bfe5f8', 0.0030);
      sun.color.set('#fffbf0');
      sun.intensity = 3.6;
      sun.position.set(65, 110, 55);
      ambient.color.set('#f0f9ff');
      ambient.intensity = 0.85;
      hemi.color.set('#bae6fd');
      hemi.groundColor.set('#4ade80');
      hemi.intensity = 0.75;
      renderer.toneMappingExposure = 1.25;
    } else if (timeOfDay === 'sunset') {
      scene.fog = new THREE.FogExp2('#c2825b', 0.0042);
      sun.color.set('#fb923c');
      sun.intensity = 3.2;
      sun.position.set(90, 48, 65);
      ambient.color.set('#fed7aa');
      ambient.intensity = 0.7;
      hemi.color.set('#fdba74');
      hemi.groundColor.set('#78350f');
      hemi.intensity = 0.65;
      renderer.toneMappingExposure = 1.15;
    } else {
      scene.fog = new THREE.FogExp2('#030712', 0.0075);
      sun.color.set('#38bdf8');
      sun.intensity = 0.5;
      sun.position.set(-45, 60, -45);
      ambient.color.set('#1e293b');
      ambient.intensity = 0.55;
      hemi.color.set('#1e3a8a');
      hemi.groundColor.set('#022c22');
      hemi.intensity = 0.45;
      renderer.toneMappingExposure = 1.05;
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

  // Inisialisasi WebGL Scene (Unreal Engine 5 Engine Pipeline)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 650;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera Cinematic Lens (50mm equivalent)
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.5, 1200);
    cameraRef.current = camera;

    // 3. Renderer dengan ACESFilmic & PCF Soft Shadows (Unreal Engine Look - GPU Optimized)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Capped at 1.5x for locked 60fps on retina/4K displays
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // PMREM IBL Generator
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    pmremGeneratorRef.current = pmrem;

    const skyTex = generateUnrealHdrSky('day');
    const envMap = pmrem.fromEquirectangular(skyTex).texture;
    scene.environment = envMap;
    scene.background = skyTex;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Unreal Engine 5 Lumen-style (Optimized Shadow Map Resolution)
    const ambientLight = new THREE.AmbientLight('#f0f9ff', 0.85);
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#bae6fd', '#4ade80', 0.75);
    hemiLightRef.current = hemiLight;
    scene.add(hemiLight);

    // Directional Sun Light dengan High-Performance PCF Soft Shadows (1536x1536)
    const sunLight = new THREE.DirectionalLight('#fffbf0', 3.6);
    sunLightRef.current = sunLight;
    sunLight.position.set(65, 110, 55);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1536; // 1536x1536: Crisp soft shadows with 7x faster depth rendering than 4K
    sunLight.shadow.mapSize.height = 1536;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 450;
    const d = 110;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.normalBias = 0.025;
    scene.add(sunLight);

    // 5. TEKSTUR PBR & NORMAL BUMP
    const { diffuse: wallDiff, bump: wallBump } = generateSkyBlueWallTextures();
    const { diffuse: roofDiff, bump: roofBump } = generateRoofTilePbrTextures();
    const { diffuse: pavingDiff, bump: pavingBump } = generateHerringbonePbrTextures();
    const { diffuse: asphaltDiff } = generateAsphaltPbrTextures();
    const grassDiff = generateGrassPbrTexture();
    const dekanatFeatureTexture = generateDekanatFeatureWallTexture();
    const canopyFasciaTexture = generateCanopyFasciaTexture();
    const ft1SignTexture = generateFT1SignTexture();
    const ft2SignTexture = generateFT2SignTexture();
    const labtek1SignTexture = generateLabtek1SignTexture();
    const sipilSignTexture = generateSipilSignTexture();
    const frontGridWindowTexture = generateFrontGridWindowTexture();
    const retainingWallTexture = generateRetainingWallTexture();
    const curbTexture = generateCurbTexture();

    // 6. MATERIAL PHYSICAL REALISTIS (MeshPhysicalMaterial dengan Clearcoat & Refleksi Lingkungan IBL)
    // Dinding Biru FT PBR
    const wallSkyBlueMat = new THREE.MeshPhysicalMaterial({
      map: wallDiff,
      bumpMap: wallBump,
      bumpScale: 0.035,
      roughness: 0.42,
      metalness: 0.04,
      envMapIntensity: 0.75
    });

    // Kolom Biru Cobalt Tua dengan Lapisan Glossy Clearcoat
    const pillarRoyalBlueMat = new THREE.MeshPhysicalMaterial({
      color: '#1565c0',
      roughness: 0.35,
      metalness: 0.15,
      clearcoat: 0.55,
      clearcoatRoughness: 0.15,
      envMapIntensity: 0.95
    });

    // Kanopi Navy Fasad Depan
    const canopyNavyMat = new THREE.MeshPhysicalMaterial({
      color: '#0d3875',
      roughness: 0.32,
      metalness: 0.18,
      clearcoat: 0.6,
      envMapIntensity: 0.9
    });

    // Lisplang Putih Bersih
    const whiteTrimMat = new THREE.MeshPhysicalMaterial({
      color: '#f8fafc',
      roughness: 0.28,
      metalness: 0.05,
      clearcoat: 0.4,
      envMapIntensity: 0.8
    });

    // Genteng Limasan Terakota Glazed Ceramic PBR
    const roofTileMat = new THREE.MeshPhysicalMaterial({
      map: roofDiff,
      bumpMap: roofBump,
      bumpScale: 0.05,
      roughness: 0.45,
      metalness: 0.08,
      clearcoat: 0.75, // Kilau keramik genteng asli
      clearcoatRoughness: 0.2,
      envMapIntensity: 0.9
    });

    const roofRidgeMat = new THREE.MeshStandardMaterial({
      color: '#4e190e',
      roughness: 0.5
    });

    // Kaca Jendela Reflektif Unreal Engine ArchViz Glass
    const frontWindowMat = new THREE.MeshPhysicalMaterial({
      map: frontGridWindowTexture,
      roughness: 0.04,
      metalness: 0.92,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      envMapIntensity: 2.2 // Pantulan tajam langit & awan
    });

    const plinthMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      roughness: 0.85
    });

    // 7. DUNIA & LANSKAP SEKITAR (Pegunungan Latar Belakang & Hutan Mugarsari khas Unreal Engine)
    // 7a. Pegunungan Latar Belakang 360 Derajat
    const mountainGroup = new THREE.Group();
    const mountainMat = new THREE.MeshStandardMaterial({
      color: '#1e3a5f',
      roughness: 0.95,
      metalness: 0.05
    });

    const createMountainRidge = (radius: number, height: number, yPos: number, segments: number) => {
      const geo = new THREE.CylinderGeometry(radius, radius * 1.08, height, segments, 1, true);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getY(i);
        if (u > 0) {
          const angle = Math.atan2(pos.getZ(i), pos.getX(i));
          const noise = Math.sin(angle * 7) * 14 + Math.cos(angle * 13) * 8 + Math.sin(angle * 23) * 4;
          pos.setY(i, u + noise);
        }
      }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, mountainMat);
      m.position.y = yPos;
      return m;
    };

    mountainGroup.add(createMountainRidge(260, 48, 18, 24));
    mountainGroup.add(createMountainRidge(290, 68, 26, 24));
    scene.add(mountainGroup);

    // 7b. Rumput Kampus PBR
    const groundGeo = new THREE.PlaneGeometry(420, 420);
    const groundMat = new THREE.MeshStandardMaterial({
      map: grassDiff,
      roughness: 0.85,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.15;
    ground.receiveShadow = true;
    scene.add(ground);

    // 7c. Danau Retensi Timur (Air Animasi Glistening Water Sesuai Google Earth)
    const pondGeo = new THREE.CylinderGeometry(24, 30, 0.45, 48);
    const pondMat = new THREE.MeshPhysicalMaterial({
      color: '#0284c7',
      roughness: 0.03,
      metalness: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      transparent: true,
      opacity: 0.94,
      envMapIntensity: 2.6
    });
    const pond = new THREE.Mesh(pondGeo, pondMat);
    pond.position.set(96, 0.05, 12);
    pond.scale.set(1.5, 1, 1.15);
    scene.add(pond);
    waterMeshRef.current = pond;

    // 7d. Paving Herringbone PBR Koridor & Halaman
    const pavingMat = new THREE.MeshPhysicalMaterial({
      map: pavingDiff,
      bumpMap: pavingBump,
      bumpScale: 0.04,
      roughness: 0.65,
      metalness: 0.1,
      envMapIntensity: 0.65
    });

    // Koridor Paving Utama Tengah
    const mainStreetPaving = new THREE.Mesh(new THREE.PlaneGeometry(42, 136), pavingMat);
    mainStreetPaving.rotation.x = -Math.PI / 2;
    mainStreetPaving.position.set(2, -0.04, -12);
    mainStreetPaving.receiveShadow = true;
    scene.add(mainStreetPaving);

    // Plaza Barat (Area LABTEK 1 & FT.1)
    const westPlaza = new THREE.Mesh(new THREE.PlaneGeometry(68, 36), pavingMat);
    westPlaza.rotation.x = -Math.PI / 2;
    westPlaza.position.set(-26, -0.05, 0);
    westPlaza.receiveShadow = true;
    scene.add(westPlaza);

    // Plaza Timur (Area Dekanat & Lab Sipil)
    const eastPlaza = new THREE.Mesh(new THREE.PlaneGeometry(90, 50), pavingMat);
    eastPlaza.rotation.x = -Math.PI / 2;
    eastPlaza.position.set(44, -0.04, 25);
    eastPlaza.receiveShadow = true;
    scene.add(eastPlaza);

    // 7e. Jembatan Kanopi Koridor Penghubung Biru
    const bridgeCanopyGeo = new THREE.BoxGeometry(24, 0.45, 6);
    const bridgeCanopy = new THREE.Mesh(bridgeCanopyGeo, pillarRoyalBlueMat);
    bridgeCanopy.position.set(2, 4.2, 0);
    bridgeCanopy.castShadow = true;
    scene.add(bridgeCanopy);

    [-8, 8].forEach((bx) => {
      [-2.4, 2.4].forEach((bz) => {
        const bp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.2, 0.5), pillarRoyalBlueMat);
        bp.position.set(2 + bx, 2.1, bz);
        bp.castShadow = true;
        scene.add(bp);
      });
    });

    // 7f. Jalan Aspal Depan & Area Parkir Utama Barat (Persis Google Earth Mugarsari)
    const asphaltMat = new THREE.MeshPhysicalMaterial({
      map: asphaltDiff,
      roughness: 0.72,
      metalness: 0.15,
      clearcoat: 0.35, // Efek aspal terawat dengan sedikit kilau spekular
      envMapIntensity: 0.5
    });

    // Area Parkir Barat Luas (Parkiran Mahasiswa & Dosen FT)
    const westParkingMesh = new THREE.Mesh(new THREE.PlaneGeometry(46, 115), asphaltMat);
    westParkingMesh.rotation.x = -Math.PI / 2;
    westParkingMesh.position.set(-66, -0.08, -6);
    westParkingMesh.receiveShadow = true;
    scene.add(westParkingMesh);

    // Kanopi Peneduh Parkir Motor Barat
    const parkShedMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', metalness: 0.8, roughness: 0.25 });
    const parkShedGeo = new THREE.BoxGeometry(36, 0.2, 5.5);
    [-35, 10].forEach(sz => {
      const shed = new THREE.Mesh(parkShedGeo, parkShedMat);
      shed.position.set(-66, 3.2, sz);
      shed.castShadow = true;
      scene.add(shed);
    });

    // Jalan Aspal Akses Utama Depan
    const frontRoadMesh = new THREE.Mesh(new THREE.PlaneGeometry(210, 18), asphaltMat);
    frontRoadMesh.rotation.x = -Math.PI / 2;
    frontRoadMesh.position.set(8, -0.1, 48);
    frontRoadMesh.receiveShadow = true;
    scene.add(frontRoadMesh);

    // Jalan Akses Samping Timur Menuju Danau
    const sideRoadMesh = new THREE.Mesh(new THREE.PlaneGeometry(16, 110), asphaltMat);
    sideRoadMesh.rotation.x = -Math.PI / 2;
    sideRoadMesh.position.set(96, -0.1, -12);
    sideRoadMesh.receiveShadow = true;
    scene.add(sideRoadMesh);
    scene.add(sideRoadMesh);

    // Talud Batu Kali & Kanstin
    const retainingWallMat = new THREE.MeshStandardMaterial({ map: retainingWallTexture, roughness: 0.9 });
    const curbMat = new THREE.MeshStandardMaterial({ map: curbTexture, roughness: 0.6 });

    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(70, 1.2, 0.8), retainingWallMat);
    wall1.position.set(25, 0.45, 39.5);
    wall1.castShadow = true;
    scene.add(wall1);

    const curb1 = new THREE.Mesh(new THREE.BoxGeometry(70, 0.25, 0.35), curbMat);
    curb1.position.set(25, 1.15, 39.5);
    scene.add(curb1);

    const wallSide = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 54), retainingWallMat);
    wallSide.position.set(51, 0.45, 14);
    wallSide.castShadow = true;
    scene.add(wallSide);

    const curbSide = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 54), curbMat);
    curbSide.position.set(51, 1.15, 14);
    scene.add(curbSide);

    // 8. TIANG BENDERA INDONESIA MERAH PUTIH DENGAN GELOMBANG REALISTIS
    const flagGroup = new THREE.Group();
    flagGroup.position.set(22, 0, 26);

    const flagBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.4, 24), plinthMat);
    flagBase.position.y = 0.2;
    flagGroup.add(flagBase);

    const flagPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 10.5, 16),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.9, roughness: 0.15 })
    );
    flagPole.position.y = 5.4;
    flagPole.castShadow = true;
    flagGroup.add(flagPole);

    const goldBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.95, roughness: 0.1 })
    );
    goldBall.position.y = 10.7;
    flagGroup.add(goldBall);

    const flagClothGeo = new THREE.PlaneGeometry(2.4, 1.4, 16, 8);
    const flagCanvas = document.createElement('canvas');
    flagCanvas.width = 128;
    flagCanvas.height = 64;
    const fctx = flagCanvas.getContext('2d')!;
    fctx.fillStyle = '#dc2626';
    fctx.fillRect(0, 0, 128, 32);
    fctx.fillStyle = '#ffffff';
    fctx.fillRect(0, 32, 128, 32);
    const flagTex = new THREE.CanvasTexture(flagCanvas);

    const flagCloth = new THREE.Mesh(
      flagClothGeo,
      new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide, roughness: 0.55 })
    );
    flagCloth.position.set(1.2, 9.8, 0);
    flagCloth.castShadow = true;
    flagGroup.add(flagCloth);
    flagMeshRef.current = flagCloth;
    scene.add(flagGroup);

    // 9. LAMPU JALAN ARSITEKTURAL MODERN (Street Lamp Posts)
    const lampMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.85, roughness: 0.25 });
    const lampBulbMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });

    const createStreetLamp = (lx: number, lz: number, rotY: number) => {
      const lg = new THREE.Group();
      lg.position.set(lx, 0, lz);
      lg.rotation.y = rotY;

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 7.5, 12), lampMat);
      pole.position.y = 3.75;
      pole.castShadow = true;
      lg.add(pole);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.15), lampMat);
      arm.position.set(0.6, 7.4, 0);
      lg.add(arm);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 0.35), lampMat);
      head.position.set(1.2, 7.3, 0);
      lg.add(head);

      const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.25), lampBulbMat);
      bulb.position.set(1.2, 7.22, 0);
      lg.add(bulb);

      scene.add(lg);
    };

    createStreetLamp(50, 38, -Math.PI / 2);
    createStreetLamp(50, 14, -Math.PI / 2);
    createStreetLamp(50, -10, -Math.PI / 2);
    createStreetLamp(-2, 38, Math.PI / 2);
    createStreetLamp(-42, 38, Math.PI / 2);

    // 10. DERETAN MOTOR & MOBIL DENGAN MATERIAL CLEARCOAT OTOMOTIF
    const motoGroup = new THREE.Group();
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.95 });
    const seatMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.8 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.95, roughness: 0.1 });

    const createMotorbike = (x: number, z: number, rotY: number, colorHex: string, helmetHex: string) => {
      const m = new THREE.Group();
      m.position.set(x, 0, z);
      m.rotation.y = rotY;

      const fw = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12), wheelMat);
      fw.rotation.z = Math.PI / 2;
      fw.position.set(0.42, 0.24, 0);
      m.add(fw);

      const rw = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12), wheelMat);
      rw.rotation.z = Math.PI / 2;
      rw.position.set(-0.42, 0.24, 0);
      m.add(rw);

      const bodyMat = new THREE.MeshPhysicalMaterial({
        color: colorHex,
        roughness: 0.3,
        metalness: 0.4,
        clearcoat: 0.85,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.2
      });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.35, 0.26), bodyMat);
      body.position.set(0.04, 0.44, 0);
      m.add(body);

      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.22), seatMat);
      seat.position.set(-0.1, 0.64, 0);
      m.add(seat);

      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.48), chromeMat);
      bar.position.set(0.36, 0.78, 0);
      m.add(bar);

      const helmet = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 10, 10),
        new THREE.MeshPhysicalMaterial({ color: helmetHex, roughness: 0.25, clearcoat: 0.8 })
      );
      helmet.position.set(-0.1, 0.76, 0);
      m.add(helmet);

      motoGroup.add(m);
    };

    const bikeColors = ['#0f172a', '#dc2626', '#2563eb', '#ea580c', '#ffffff', '#475569', '#16a34a'];
    const helmetColors = ['#f8fafc', '#0f172a', '#dc2626', '#fbbf24', '#0284c7'];

    for (let r = 0; r < 2; r++) {
      const zRow = 30 + r * 3.5;
      for (let i = 0; i < 14; i++) {
        const xPos = 6 + i * 2.4;
        const col = bikeColors[i % bikeColors.length];
        const hcol = helmetColors[(i * 3 + r) % helmetColors.length];
        createMotorbike(xPos, zRow, -0.4, col, hcol);
      }
    }

    for (let i = 0; i < 9; i++) {
      const col = bikeColors[(i + 2) % bikeColors.length];
      const hcol = helmetColors[i % helmetColors.length];
      createMotorbike(45.5, -4 - i * 2.2, Math.PI / 2 + 0.1, col, hcol);
    }

    scene.add(motoGroup);

    // Mobil Parkir Depan dengan Cat Clearcoat Mengkilap khas Unreal Engine
    const createCar = (x: number, z: number, rotY: number, colorHex: string) => {
      const carGroup = new THREE.Group();
      carGroup.position.set(x, 0, z);
      carGroup.rotation.y = rotY;

      const carPaint = new THREE.MeshPhysicalMaterial({
        color: colorHex,
        roughness: 0.2,
        metalness: 0.6,
        clearcoat: 1.0, // Automotive clearcoat shine
        clearcoatRoughness: 0.03,
        envMapIntensity: 1.8
      });
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: '#0f172a',
        roughness: 0.05,
        metalness: 0.9,
        clearcoat: 1.0,
        envMapIntensity: 2.0
      });

      const lower = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.85, 1.8), carPaint);
      lower.position.y = 0.6;
      lower.castShadow = true;
      carGroup.add(lower);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 1.6), glassMat);
      cabin.position.set(-0.2, 1.3, 0);
      carGroup.add(cabin);

      // Lampu Depan Headlights
      const hlMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
      [-0.6, 0.6].forEach(hz => {
        const hl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.32), hlMat);
        hl.position.set(2.05, 0.65, hz);
        carGroup.add(hl);
      });

      [[-1.3, 0.95], [-1.3, -0.95], [1.3, 0.95], [1.3, -0.95]].forEach(([wx, wz]) => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.22, 14), wheelMat);
        w.rotation.x = Math.PI / 2;
        w.position.set(wx, 0.35, wz);
        carGroup.add(w);
      });

      scene.add(carGroup);
    };

    createCar(12, 24, 0.1, '#ffffff');
    createCar(16, 24, 0.1, '#94a3b8');
    createCar(36, 24, -0.15, '#020617');

    // 11. BUILDER SEMUA BANGUNAN KAMPUS LENGKAP
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

      // 1. Plinth Pondasi
      const plinthMesh = new THREE.Mesh(
        new THREE.BoxGeometry(bldg.length + 2.4, 0.5, bldg.depth + 2.4),
        plinthMat
      );
      plinthMesh.position.y = 0.25;
      plinthMesh.castShadow = true;
      plinthMesh.receiveShadow = true;
      bldgGroup.add(plinthMesh);

      // 2. Lantai 1
      const floor1Group = new THREE.Group();
      const wall1Mesh = new THREE.Mesh(
        new THREE.BoxGeometry(bldg.length, floorHeight, bldg.depth),
        wallSkyBlueMat
      );
      wall1Mesh.position.y = 0.5 + floorHeight / 2;
      wall1Mesh.castShadow = true;
      wall1Mesh.receiveShadow = true;
      floor1Group.add(wall1Mesh);

      const colCount = Math.max(7, Math.floor(bldg.length / 5));
      const colStep = bldg.length / (colCount - 1);
      const colGeo = new THREE.BoxGeometry(0.8, floorHeight + 0.1, 0.8);

      for (let i = 0; i < colCount; i++) {
        const cx = -bldg.length / 2 + i * colStep;

        const colFront = new THREE.Mesh(colGeo, pillarRoyalBlueMat);
        colFront.position.set(cx, 0.5 + floorHeight / 2, bldg.depth / 2 + 0.1);
        colFront.castShadow = true;
        floor1Group.add(colFront);

        const colBack = new THREE.Mesh(colGeo, pillarRoyalBlueMat);
        colBack.position.set(cx, 0.5 + floorHeight / 2, -bldg.depth / 2 - 0.1);
        colBack.castShadow = true;
        floor1Group.add(colBack);

        if (i < colCount - 1) {
          const winW = colStep - 0.85;
          const winH = 1.85;
          const isDekanatFeaturePanel = bldg.isDekanat && (cx + colStep / 2 < 0);

          if (!isDekanatFeaturePanel) {
            const winFront = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), frontWindowMat);
            winFront.position.set(cx + colStep / 2, 0.5 + 2.0, bldg.depth / 2 + 0.08);
            floor1Group.add(winFront);

            const shadeFront = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.2, 0.15, 0.7), whiteTrimMat);
            shadeFront.position.set(cx + colStep / 2, 0.5 + 2.95, bldg.depth / 2 + 0.4);
            shadeFront.castShadow = true;
            floor1Group.add(shadeFront);
          }

          const winBack = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), frontWindowMat);
          winBack.rotation.y = Math.PI;
          winBack.position.set(cx + colStep / 2, 0.5 + 2.0, -bldg.depth / 2 - 0.08);
          floor1Group.add(winBack);
        }
      }

      bldgGroup.add(floor1Group);

      // 3. Lantai 2
      const floor2Group = new THREE.Group();
      floor2Group.position.y = 0.5 + floorHeight;

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
          const isDekanatFeaturePanel = bldg.isDekanat && (cx + colStep / 2 < 0);

          if (!isDekanatFeaturePanel) {
            const winFront = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), frontWindowMat);
            winFront.position.set(cx + colStep / 2, 0.45 + 2.0, bldg.depth / 2 + 0.08);
            floor2Group.add(winFront);

            const shadeFront = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.2, 0.15, 0.7), whiteTrimMat);
            shadeFront.position.set(cx + colStep / 2, 0.45 + 2.95, bldg.depth / 2 + 0.4);
            shadeFront.castShadow = true;
            floor2Group.add(shadeFront);
          }

          const winBack = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), frontWindowMat);
          winBack.rotation.y = Math.PI;
          winBack.position.set(cx + colStep / 2, 0.45 + 2.0, -bldg.depth / 2 - 0.08);
          floor2Group.add(winBack);
        }
      }

      // Plang Ujung Gedung FT.1, FT.2, LABTEK 1
      let signMat: THREE.Material | null = null;
      if (bldg.signType === 'ft1') {
        signMat = new THREE.MeshStandardMaterial({ map: ft1SignTexture, roughness: 0.35 });
      } else if (bldg.signType === 'ft2') {
        signMat = new THREE.MeshStandardMaterial({ map: ft2SignTexture, roughness: 0.35 });
      } else if (bldg.signType === 'labtek1') {
        signMat = new THREE.MeshStandardMaterial({ map: labtek1SignTexture, roughness: 0.35 });
      } else if (bldg.signType === 'sipil') {
        signMat = new THREE.MeshStandardMaterial({ map: sipilSignTexture, roughness: 0.35 });
      }

      if (signMat) {
        const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(bldg.depth * 0.9, floorHeight * 1.8), signMat);
        signMesh.rotation.y = Math.PI / 2;
        signMesh.position.set(bldg.length / 2 + 0.08, 0.5 + floorHeight, 0);
        bldgGroup.add(signMesh);
      }

      // Fasad Depan Dekanat Panel SBSN
      if (bldg.isDekanat) {
        const featurePanelMat = new THREE.MeshPhysicalMaterial({
          map: dekanatFeatureTexture,
          roughness: 0.35,
          metalness: 0.12,
          clearcoat: 0.5,
          envMapIntensity: 0.9
        });
        const panelW = 16.5;
        const panelH = floorHeight * 1.95;
        const panelMesh = new THREE.Mesh(new THREE.PlaneGeometry(panelW, panelH), featurePanelMat);
        panelMesh.position.set(-14.5, 0.5 + floorHeight, bldg.depth / 2 + 0.18);
        bldgGroup.add(panelMesh);

        // Emblem Logo Resmi Universitas Siliwangi Timbul 3D (Perisai Hijau & Harimau Maung Siliwangi Asli)
        const logoBadgeTexture = new THREE.TextureLoader().load(UNSIL_LOGO_BASE64);
        const logoBadgeMat = new THREE.MeshPhysicalMaterial({
          map: logoBadgeTexture,
          transparent: true,
          roughness: 0.25,
          metalness: 0.2,
          clearcoat: 0.8,
          envMapIntensity: 1.5
        });
        const logoBadgeMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 2.35), logoBadgeMat);
        const logoPosX = -14.5 + panelW * (560 / 1024 - 0.5);
        const logoPosY = 0.5 + floorHeight + panelH * (0.5 - 118 / 512);
        logoBadgeMesh.position.set(logoPosX, logoPosY, bldg.depth / 2 + 0.24);
        bldgGroup.add(logoBadgeMesh);
      }

      bldgGroup.add(floor2Group);
      buildingFloor2sRef.current.set(bldg.id, floor2Group);

      // 4. Atap Limasan PBR
      const roofGroup = new THREE.Group();
      roofGroup.position.y = 0.5 + floorHeight * 2 + 0.45;

      const eaveOverhang = 1.5;
      const roofW = bldg.length + eaveOverhang * 2;
      const roofD = bldg.depth + eaveOverhang * 2;

      const fasciaMesh = new THREE.Mesh(new THREE.BoxGeometry(roofW, 0.4, roofD), whiteTrimMat);
      fasciaMesh.position.y = 0.2;
      fasciaMesh.castShadow = true;
      roofGroup.add(fasciaMesh);

      const hipRoofGeo = createHipRoofGeometry(roofW, roofD, roofPeak, 10.5);
      const hipRoofMesh = new THREE.Mesh(hipRoofGeo, roofTileMat);
      hipRoofMesh.position.y = 0.4;
      hipRoofMesh.castShadow = true;
      hipRoofMesh.receiveShadow = true;
      roofGroup.add(hipRoofMesh);

      const ridgeLen = Math.max(4, roofW - 10.5 * 2);
      const ridgeMesh = new THREE.Mesh(new THREE.BoxGeometry(ridgeLen, 0.35, 0.7), roofRidgeMat);
      ridgeMesh.position.set(0, 0.4 + roofPeak + 0.05, 0);
      roofGroup.add(ridgeMesh);

      bldgGroup.add(roofGroup);
      buildingRoofsRef.current.set(bldg.id, roofGroup);

      // 5. Kanopi Teras Pintu Masuk
      if (bldg.hasFrontCanopy) {
        const canW = bldg.isDekanat ? 14.5 : 9.5;
        const canD = bldg.isDekanat ? 7.8 : 5.8;
        const canH = 4.2;
        const canX = bldg.canopyX ?? (bldg.isDekanat ? -4 : 8);
        const canZ = bldg.depth / 2 + canD / 2;

        const canopyRoof = new THREE.Mesh(
          new THREE.BoxGeometry(canW, 0.55, canD),
          bldg.isDekanat ? canopyNavyMat : whiteTrimMat
        );
        canopyRoof.position.set(canX, canH, canZ);
        canopyRoof.castShadow = true;
        bldgGroup.add(canopyRoof);

        if (bldg.isDekanat) {
          const canopySignMat = new THREE.MeshPhysicalMaterial({ map: canopyFasciaTexture, roughness: 0.35, clearcoat: 0.5 });
          const canopySign = new THREE.Mesh(new THREE.PlaneGeometry(canW * 0.95, 0.52), canopySignMat);
          canopySign.position.set(canX, canH, canZ + canD / 2 + 0.04);
          bldgGroup.add(canopySign);
        }

        const colW = bldg.isDekanat ? 0.95 : 0.65;
        const pOffsets = [canX - canW / 2 + 0.8, canX + canW / 2 - 0.8];

        pOffsets.forEach((px) => {
          const pBottom = new THREE.Mesh(new THREE.BoxGeometry(colW, 1.2, colW), pillarRoyalBlueMat);
          pBottom.position.set(px, 0.6, canZ + canD / 2 - 0.7);
          pBottom.castShadow = true;
          bldgGroup.add(pBottom);

          const pMid = new THREE.Mesh(new THREE.BoxGeometry(colW - 0.05, 2.2, colW - 0.05), whiteTrimMat);
          pMid.position.set(px, 1.2 + 1.1, canZ + canD / 2 - 0.7);
          pMid.castShadow = true;
          bldgGroup.add(pMid);

          const pTop = new THREE.Mesh(new THREE.BoxGeometry(colW, canH - 3.4, colW), pillarRoyalBlueMat);
          pTop.position.set(px, 3.4 + (canH - 3.4) / 2, canZ + canD / 2 - 0.7);
          pTop.castShadow = true;
          bldgGroup.add(pTop);
        });

        const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(canW + 2, 0.35, 3.0), plinthMat);
        stepMesh.position.set(canX, 0.17, canZ + canD / 2 + 1.2);
        stepMesh.receiveShadow = true;
        bldgGroup.add(stepMesh);
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
      highlightMesh.visible = bldg.id === selectedCampusBuilding.id;
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

    // 12. POHON & VEGETASI TROPIS (Pohon Pelindung & Palem/Kelapa Sesuai Foto Udara)
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: '#3d2817', roughness: 0.95 });
    const leafDarkMat = new THREE.MeshStandardMaterial({ color: '#133e2b', roughness: 0.85 });
    const leafMidMat = new THREE.MeshStandardMaterial({ color: '#235e40', roughness: 0.8 });
    const leafLightMat = new THREE.MeshStandardMaterial({ color: '#449e6f', roughness: 0.75 });

    const createCanopyTree = (x: number, z: number, scale = 1) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.6 * scale, 3.5 * scale, 8), treeTrunkMat);
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
      // Deretan pohon peneduh Parkiran Barat (Google Earth Mugarsari)
      [-86, -50, 1.1], [-86, -30, 1.2], [-86, -10, 1.15], [-86, 12, 1.2], [-86, 32, 1.05],
      [-50, -48, 0.95], [-50, -24, 1.0], [-50, 0, 0.95], [-50, 24, 1.0],
      // Sekitar Danau Retensi Timur (Google Earth)
      [84, -6, 1.2], [96, 4, 1.3], [108, 16, 1.25], [98, 28, 1.35], [82, 30, 1.1],
      // Jalur Pedestrian & Taman Koridor
      [53, 30, 0.8], [53, 20, 0.85], [53, 10, 0.8], [53, 0, 0.85], [53, -10, 0.9], [53, -20, 0.95],
      [-46, 14, 0.95], [-44, -14, 1.0], [4, 14, 0.85], [4, -14, 0.9],
      [-45, 34, 0.9], [-22, 34, 0.85], [-2, 38, 0.85], [48, 38, 0.95],
      [-32, -56, 1.3], [-8, -56, 1.2], [18, -56, 1.35], [46, -56, 1.25]
    ];
    trees.forEach(([tx, tz, ts]) => createCanopyTree(tx, tz, ts));

    // 13. Interaksi Mouse & Touch
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
      orbitState.current.targetDistance = Math.max(25, Math.min(190, orbitState.current.targetDistance + e.deltaY * 0.08));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handlePointerDown);
    domEl.addEventListener('mousemove', handlePointerMove);
    domEl.addEventListener('mouseup', handlePointerUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    domEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    domEl.addEventListener('touchmove', handlePointerMove, { passive: true });
    domEl.addEventListener('touchend', handlePointerUp);

    // 14. Loop Render Animasi (GPU-accelerated, zero CPU recomputation)
    let clockTime = 0;
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      clockTime += 0.016;

      // Animasi kibaran bendera (Pure GPU matrix transform, tanpa recompute normal di CPU)
      if (flagMeshRef.current) {
        flagMeshRef.current.rotation.y = Math.sin(clockTime * 2.5) * 0.09;
      }

      // Animasi gelombang air danau retensi
      if (waterMeshRef.current) {
        waterMeshRef.current.rotation.y = Math.sin(clockTime * 0.25) * 0.015;
      }

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
      pmrem.dispose();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [isAutoRotate, onSelectBuilding, isDark]);

  const CAMPUS_REAL_PHOTOS = [
    {
      title: 'Tampak Depan Fasad Dekanat & Kanopi "FAKULTAS TEKNIK"',
      subtitle: 'Plang Timbul FAKULTAS TEKNIK, Panel Biru SBSN 2022-2023, Tiang Bendera & Deretan Parkir',
      image: './images/ft-depan-dekanat.jpg',
      presetKey: 'front' as const,
      description: 'Menampilkan fasad megah depan Fakultas Teknik: kanopi biru bertuliskan FAKULTAS TEKNIK, ornamen batik chevron di panel biru SBSN, tiang bendera Merah Putih, dan barisan motor parkir.'
    },
    {
      title: 'Akses Jalan Depan & Talud Batu Kali (Menuju FT.2)',
      subtitle: 'Jalan Aspal, Talud Batu Kali dengan Kanstin Belang, dan Plang FT.2 Teknik Elektro',
      image: './images/ft-jalan-akses-ft2.jpg',
      presetKey: 'road_side' as const,
      description: 'Sudut pandang dari jalan aspal depan menelusuri talud batu kali, pembatas kanstin hitam-putih, pohon pelindung, dan deretan motor di sisi FT.2.'
    },
    {
      title: 'Koridor Tengah Paving Herringbone & Jembatan Kanopi',
      subtitle: 'Jalan Koridor Penghubung Antar Sayap Bangunan',
      image: './images/ft-koridor-tengah.jpg',
      presetKey: 'courtyard' as const,
      description: 'Paving block saling mengunci abu-abu (herringbone) di antara barisan gedung dengan jembatan kanopi biru penghubung kedua sayap.'
    },
    {
      title: 'Plang Identitas 3D FT.1 (Informatika & SI)',
      subtitle: 'Huruf Balok Timbul FT.1, Kisi Ventilasi Kotak & Garis Lisplang Putih',
      image: './images/ft-gedung-ft1.jpg',
      presetKey: 'labtek_ft1' as const,
      description: 'Fasad ujung timur Gedung FT.1 yang memuat tulisan timbul 3D FT.1 INFORMATIKA & SISTEM INFORMASI.'
    },
    {
      title: 'Foto Udara Kompleks Fakultas Teknik (Drone)',
      subtitle: 'Kawasan Lengkap Gedung Kuliah Terpadu & Laboratorium FT Kampus 2 Mugarsari',
      image: './images/gedung-labtek-ft1-unsil.jpg',
      presetKey: 'drone' as const,
      description: 'Tata letak masterplan 7 massa bangunan fakultas dengan genteng keramik cokelat terakota dan danau retensi.'
    }
  ];

  return (
    <div className="relative w-full bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* 1. Header Toolbar dengan Unreal Engine 5 Badge */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 text-white shadow-md shadow-orange-500/25 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-white" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <span>Visualisasi 3D Realistis Kawasan Fakultas Teknik</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs">
                    UE5 Lumen PBR
                  </span>
                </h3>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Denah Interaktif: LABTEK 1 & FT.1</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rendering grafis Unreal Engine: Image-Based Lighting (IBL), 4K Virtual Soft Shadows, Clearcoat Glass & Paint, lanskap pegunungan, dan pencahayaan filmis ACES HDR.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Preset Kamera */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => applyCameraPreset('front')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                cameraPreset === 'front'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
              title="Tampak Depan Dekanat & Kanopi FAKULTAS TEKNIK (Sesuai Foto 1)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Detail Depan</span>
            </button>

            <button
              onClick={() => applyCameraPreset('road_side')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                cameraPreset === 'road_side'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
              title="Akses Jalan Aspal Depan & Talud Batu Kali (Sesuai Foto 2)"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Jalan Akses</span>
            </button>

            <button
              onClick={() => applyCameraPreset('courtyard')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                cameraPreset === 'courtyard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
              title="Sudut pandang jalan paving tengah (Persis Foto 3)"
            >
              <span>Koridor Tengah</span>
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
              onClick={() => applyCameraPreset('satellite')}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                cameraPreset === 'satellite'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
              title="Sudut Pandang Satelit Google Earth Kampus 2 Mugarsari"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Google Earth 🛰️</span>
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

          {/* Pencahayaan Dinamis */}
          <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl gap-0.5">
            <button
              onClick={() => setTimeOfDay('day')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                timeOfDay === 'day' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Siang Terik (Unreal Engine Ultra Sky)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTimeOfDay('sunset')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                timeOfDay === 'sunset' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Golden Hour Sunset Sinematik"
            >
              <Sunset className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTimeOfDay('night')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                timeOfDay === 'night' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Malam Hari dengan Lampu Jalan & Interior Menyala"
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

          {/* Tombol Bandingkan Foto Lapangan Asli */}
          <button
            onClick={() => setShowPhotoModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
            title="Bandingkan langsung dengan 5 foto asli lapangan"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bandingkan Foto Asli</span>
          </button>
        </div>
      </div>

      {/* 2. WebGL 3D Canvas Viewport */}
      <div className="relative w-full h-[580px] sm:h-[680px] bg-slate-950 select-none overflow-hidden">
        
        {/* Kanvas Three.js */}
        <div ref={containerRef} className="w-full h-full touch-none" />

        {/* 🎮 Unreal Engine 5 Realtime Performance Overlay (Kanan Bawah Viewport) */}
        <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-black/60 backdrop-blur-xl text-white text-[10px] font-bold border border-white/15 shadow-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 uppercase tracking-wider font-black">LUMEN IBL</span>
          </div>
          <span className="opacity-40">|</span>
          <span className="text-slate-300">4K VSM SHADOWS</span>
          <span className="opacity-40">|</span>
          <span className="text-amber-300">ACES FILMIC HDR</span>
        </div>

        {/* 🏷️ Floating Building Pills di Kiri Atas */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto max-w-[280px]">
          
          <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
            <span>Pilih Bangunan Kampus:</span>
          </div>

          {/* Gedung Dekanat FT (Fasad Depan Utama) */}
          <button
            onClick={() => {
              const def = ALL_CAMPUS_BUILDINGS.find(b => b.id === 'dekanat-ft')!;
              setSelectedCampusBuilding(def);
              applyCameraPreset('front');
            }}
            className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl backdrop-blur-md text-xs font-extrabold transition-all shadow-lg cursor-pointer border text-left ${
              selectedCampusBuilding.id === 'dekanat-ft'
                ? 'bg-blue-700 text-white border-blue-400 ring-2 ring-blue-400/40 translate-x-1'
                : 'bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedCampusBuilding.id === 'dekanat-ft' ? 'bg-amber-300 animate-ping' : 'bg-blue-500'}`} />
              <div>
                <span className="block font-bold">Gedung Dekanat FT</span>
                <span className="text-[10px] font-normal opacity-80 block">SBSN 2022-2023 & Kanopi</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-100 shrink-0">
              Detail Depan
            </span>
          </button>

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

          {/* Gedung FT.2 */}
          <button
            onClick={() => {
              const def = ALL_CAMPUS_BUILDINGS.find(b => b.id === 'gedung-ft2')!;
              setSelectedCampusBuilding(def);
              applyCameraPreset('road_side');
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

        {/* 📋 Floating Bottom Inspector Card untuk Bangunan Terpilih */}
        <div className="absolute bottom-4 left-4 right-4 z-20 max-w-2xl mx-auto p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-200 dark:border-slate-700 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-modal-spring">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-md shrink-0 ${
              selectedCampusBuilding.hasFloorPlan
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                : selectedCampusBuilding.isDekanat
                ? 'bg-gradient-to-tr from-blue-700 to-indigo-800'
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

      {/* 3. Modal Lightbox Foto Asli Lapangan Lengkap */}
      {showPhotoModal && (
        <div 
          className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setShowPhotoModal(false)}
        >
          <div 
            className="relative max-w-5xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-modal-spring flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-white text-sm sm:text-base font-extrabold">
                    Galeri Foto Asli Lapangan Fakultas Teknik UNSIL
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Bandingkan langsung setiap detail arsitektur 3D dengan foto dokumentasi asli
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-white/70 hover:text-white px-3 py-1.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="p-2.5 bg-slate-900 border-b border-white/10 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
              {CAMPUS_REAL_PHOTOS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activePhotoIndex === idx
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}. {item.title.split('&')[0]}
                </button>
              ))}
            </div>

            <div className="relative p-3 bg-slate-950 flex flex-col items-center justify-center overflow-y-auto flex-1">
              <img 
                src={CAMPUS_REAL_PHOTOS[activePhotoIndex].image} 
                alt={CAMPUS_REAL_PHOTOS[activePhotoIndex].title} 
                className="max-h-[58vh] w-auto object-contain rounded-2xl shadow-xl border border-white/10"
              />
              <div className="mt-3 text-center max-w-2xl px-4">
                <h5 className="text-white font-extrabold text-sm sm:text-base">
                  {CAMPUS_REAL_PHOTOS[activePhotoIndex].title}
                </h5>
                <p className="text-xs text-amber-300 font-medium mt-0.5">
                  {CAMPUS_REAL_PHOTOS[activePhotoIndex].subtitle}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {CAMPUS_REAL_PHOTOS[activePhotoIndex].description}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border-t border-white/10 text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2 shrink-0">
              <button
                onClick={() => {
                  applyCameraPreset(CAMPUS_REAL_PHOTOS[activePhotoIndex].presetKey);
                  setShowPhotoModal(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all shadow-md cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Lihat Sudut Ini di Model 3D</span>
              </button>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all cursor-pointer"
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
