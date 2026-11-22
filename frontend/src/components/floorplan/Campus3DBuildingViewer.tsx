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
  Navigation
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
  // 3. Gedung Dekanat & Pusat Administrasi Fakultas Teknik (Baris Depan Timur, Sesuai Foto Tampak Depan Asli)
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
    canopyX: -4, // Kanopi portico berada di kiri-tengah fasad depan
    isDekanat: true,
    signType: 'dekanat',
    description: 'Gedung Dekanat, kantor pimpinan, dan Ruang Kuliah Terpadu SBSN 2022-2023 dengan kanopi FAKULTAS TEKNIK.'
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
// PROCEDURAL TEXTURE GENERATORS (EXACT MATCH REAL-LIFE PHOTOS)
// =========================================================================

// 1. Tekstur Dinding Cat Biru Cerulean Asli FT UNSIL dengan Garis Tali Air
function generateSkyBlueWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warna biru cerulean khas dinding FT UNSIL
  ctx.fillStyle = '#3ea6ff';
  ctx.fillRect(0, 0, 512, 512);

  // Variasi tekstur cat tembok halus
  for (let i = 0; i < 5000; i++) {
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

// 2. Fasad Plang Gedung FT.1 (Sesuai Foto: "FT.1 INFORMATIKA & SISTEM INFORMASI")
function generateFT1SignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3ea6ff';
  ctx.fillRect(0, 0, 512, 512);

  // 3 Jendela ventilasi kotak hitam kecil di atas
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

  // Bayangan drop shadow 3D
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

  // Lisplang pembagi
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(50, 360, 412, 12);

  // 3 Jendela ventilasi kotak hitam kecil di bawah
  const ventBotY = 425;
  [140, 256, 372].forEach((vx) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(vx - 22, ventBotY - 22, 44, 44);
    ctx.strokeRect(vx - 22, ventBotY - 22, 44, 44);
  });

  return new THREE.CanvasTexture(canvas);
}

// 3. Fasad Plang Gedung FT.2 (Sesuai Foto: "FT.2 TEKNIK ELEKTRO")
function generateFT2SignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3ea6ff';
  ctx.fillRect(0, 0, 512, 512);

  // 4 Jendela ventilasi kotak kecil di atas
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

  return new THREE.CanvasTexture(canvas);
}

// 5. Panel Fasad Biru Tua Dekanat (Sesuai Foto Depan Asli: Ornamen Batik Chevron, Logo UNSIL, Teks SBSN Emas)
function generateDekanatFeatureWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Latar biru tua cobalt yang gagah (persis foto asli)
  ctx.fillStyle = '#0d3b82';
  ctx.fillRect(0, 0, 1024, 512);

  // Ornamen Batik Geometris Putih Sisi Kiri (Chevron Motif Sunda/Siliwangi)
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 4;

  // Bentuk chevron diagonal besar di kiri
  ctx.beginPath();
  ctx.moveTo(40, 460);
  ctx.lineTo(140, 256);
  ctx.lineTo(40, 60);
  ctx.lineTo(95, 60);
  ctx.lineTo(195, 256);
  ctx.lineTo(95, 460);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Pola garis batik megamendung / geometris di dalam chevron
  ctx.strokeStyle = '#0d3b82';
  ctx.lineWidth = 3;
  for (let y = 80; y < 450; y += 32) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(170, y);
    ctx.stroke();
  }
  ctx.restore();

  // Logo Universitas Siliwangi (Lambang Hijau & Emas Resmi UNSIL)
  const logoCenterX = 560;
  const logoCenterY = 120;
  const logoRadius = 52;

  // Lingkaran luar emas
  ctx.beginPath();
  ctx.arc(logoCenterX, logoCenterY, logoRadius + 4, 0, Math.PI * 2);
  ctx.fillStyle = '#eab308';
  ctx.fill();

  // Lingkaran hijau dasar
  ctx.beginPath();
  ctx.arc(logoCenterX, logoCenterY, logoRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#15803d';
  ctx.fill();

  // Bintang & Kujang/Padi Kapas emas di tengah
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(logoCenterX, logoCenterY, 20, 0, Math.PI * 2);
  ctx.fill();

  // Tulisan melingkar atau aksen
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('UNIVERSITAS SILIWANGI', logoCenterX, logoCenterY + 44);

  // Teks Emas Resmi SBSN (Sesuai Persis Foto Fasad Depan Asli)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Bayangan teks
  const drawGoldText = (text: string, x: number, y: number, font: string) => {
    ctx.font = font;
    ctx.fillStyle = '#061c40';
    ctx.fillText(text, x + 2, y + 2);
    ctx.fillStyle = '#fbbf24'; // Emas cerah
    ctx.fillText(text, x, y);
  };

  drawGoldText('LABORATORIUM DAN RUANG KULIAH TERPADU', logoCenterX, 225, '800 28px "Plus Jakarta Sans", sans-serif');
  drawGoldText('UNIVERSITAS SILIWANGI', logoCenterX, 275, '900 36px "Plus Jakarta Sans", sans-serif');
  drawGoldText('FAKULTAS TEKNIK', logoCenterX, 330, '900 38px "Plus Jakarta Sans", sans-serif');
  drawGoldText('SBSN TAHUN ANGGARAN 2022-2023', logoCenterX, 395, '800 24px "Plus Jakarta Sans", sans-serif');

  return new THREE.CanvasTexture(canvas);
}

// 6. Plang Timbul Kanopi Depan: "FAKULTAS TEKNIK" (Sesuai Foto Asli)
function generateCanopyFasciaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  // Biru tua kanopi
  ctx.fillStyle = '#0d3b82';
  ctx.fillRect(0, 0, 512, 96);

  ctx.strokeStyle = '#1e40af';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 504, 88);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Bayangan teks 3D
  ctx.font = '900 38px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#020617';
  ctx.fillText('FAKULTAS TEKNIK', 258, 50);

  // Huruf timbul putih tebal
  ctx.fillStyle = '#ffffff';
  ctx.fillText('FAKULTAS TEKNIK', 256, 48);

  return new THREE.CanvasTexture(canvas);
}

// 7. Pintu Kaca Lobby Utama Gedung
function generateLobbyEntranceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Cahaya dalam lobby hangat
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 256);

  // Kaca pintu dengan pantulan dan pencahayaan interior
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#38bdf8');
  grad.addColorStop(0.3, '#1e3a8a');
  grad.addColorStop(0.8, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(20, 20, 472, 216);

  // Kusen pintu hitam & gagang stainless
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, 472, 216);

  // Pembagi 2 pintu kaca
  ctx.beginPath();
  ctx.moveTo(256, 20);
  ctx.lineTo(256, 236);
  ctx.stroke();

  // Gagang pintu vertikal stainless
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(240, 100, 6, 60);
  ctx.fillRect(266, 100, 6, 60);

  return new THREE.CanvasTexture(canvas);
}

// 8. Tekstur Jendela Kaca Kantor / Ruang Kuliah Fasad Depan (Grid Mullions)
function generateFrontGridWindowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Kaca gelap reflektif
  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#1e293b');
  grad.addColorStop(0.5, '#0f172a');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Pantulan langit
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.moveTo(20, 250);
  ctx.lineTo(200, 10);
  ctx.lineTo(250, 10);
  ctx.lineTo(70, 250);
  ctx.closePath();
  ctx.fill();

  // Kusen putih luar
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, 244, 244);

  // Kisi-kisi kusen hitam dalam (3 kolom x 2 baris)
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

// 9. Tekstur Dinding Talud Batu Kali (Sesuai Foto Akses Jalan Depan)
function generateRetainingWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Warna mortar abu semen
  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, 0, 256, 256);

  // Gambar batu kali acak (river rock masonry)
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

// 10. Tekstur Kanstin Belang Hitam-Putih
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

// 11. Tekstur Aspal Jalan Hitam Halus dengan Garis Putih
function generateAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e2530';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillStyle = Math.random() > 0.5 ? '#293241' : '#141a24';
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

// 12. Tekstur Genteng Keramik Merah Bata Bergelombang
function generateRoofTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#6e2716';
  ctx.fillRect(0, 0, 512, 512);

  const rowHeight = 28;
  const colWidth = 42;

  for (let y = 0; y < 512; y += rowHeight) {
    const isOdd = (y / rowHeight) % 2 === 1;
    const offsetX = isOdd ? colWidth / 2 : 0;

    ctx.fillStyle = '#42160a';
    ctx.fillRect(0, y + rowHeight - 4, 512, 4);

    ctx.fillStyle = '#993922';
    ctx.fillRect(0, y, 512, 3);

    for (let x = -colWidth; x < 512 + colWidth; x += colWidth) {
      const tileX = x + offsetX;
      ctx.fillStyle = '#361107';
      ctx.fillRect(tileX, y, 2.5, rowHeight);

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

// 13. Tekstur Paving Block Pola Herringbone (Sesuai Foto Koridor Tengah)
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

  for (let y = -28; y < 284; y += 28) {
    for (let x = -28; x < 284; x += 28) {
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

// 14. Tekstur Rumput Alami Bergradasi
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
  const [cameraPreset, setCameraPreset] = useState<'drone' | 'labtek_ft1' | 'courtyard' | 'front' | 'road_side' | 'iso'>('front');
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
    azimuth: 0.04,
    polar: 1.40,
    distance: 52,
    target: new THREE.Vector3(26, 4.5, 14),
    targetAzimuth: 0.04,
    targetPolar: 1.40,
    targetDistance: 52
  });

  // Sinkronisasi pilihan gedung dari parent
  useEffect(() => {
    const found = ALL_CAMPUS_BUILDINGS.find(b => b.id === activeBuildingId);
    if (found) setSelectedCampusBuilding(found);
  }, [activeBuildingId]);

  useEffect(() => {
    highlightMeshesRef.current.forEach((mesh, id) => {
      mesh.visible = id === selectedCampusBuilding.id;
    });
  }, [selectedCampusBuilding]);

  // Preset Kamera Akurat (Persis Foto Lapangan)
  const applyCameraPreset = useCallback((preset: 'drone' | 'labtek_ft1' | 'courtyard' | 'front' | 'road_side' | 'iso') => {
    setCameraPreset(preset);
    const os = orbitState.current;

    if (preset === 'front') {
      // PERSIS FOTO 1: Tampak Depan Fasad Dekanat & Kanopi "FAKULTAS TEKNIK" (SBSN 2022-2023)
      os.targetAzimuth = 0.04;
      os.targetPolar = 1.40;
      os.targetDistance = 50;
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
      os.target.set(-22, 5, 0);
    } else if (preset === 'drone') {
      // PERSIS FOTO DRONE: Sudut Udara Seluruh Kawasan Fakultas
      os.targetAzimuth = 0.58;
      os.targetPolar = 0.82;
      os.targetDistance = 125;
      os.target.set(2, 4, -5);
    } else if (preset === 'iso') {
      // Isometrik Klasik
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
    const dekanatFeatureTexture = generateDekanatFeatureWallTexture();
    const canopyFasciaTexture = generateCanopyFasciaTexture();
    const lobbyDoorTexture = generateLobbyEntranceTexture();
    const frontGridWindowTexture = generateFrontGridWindowTexture();
    const retainingWallTexture = generateRetainingWallTexture();
    const curbTexture = generateCurbTexture();
    const asphaltTexture = generateAsphaltTexture();
    const roofTexture = generateRoofTileTexture();
    const pavingTexture = generateHerringbonePavingTexture();
    const grassTexture = generateGrassTexture();

    // 6. MATERIAL REALISTIS
    const wallSkyBlueMat = new THREE.MeshStandardMaterial({
      map: wallTexture,
      roughness: 0.45,
      metalness: 0.08
    });

    const pillarRoyalBlueMat = new THREE.MeshStandardMaterial({
      color: '#1565c0',
      roughness: 0.4,
      metalness: 0.12
    });

    const canopyNavyMat = new THREE.MeshStandardMaterial({
      color: '#0d3b82',
      roughness: 0.35,
      metalness: 0.15
    });

    const whiteTrimMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.35,
      metalness: 0.05
    });

    const plinthMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      roughness: 0.85
    });

    const frontWindowMat = new THREE.MeshStandardMaterial({
      map: frontGridWindowTexture,
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

    // 7. LINGKUNGAN KAMPUS (Ground, Aspal Jalan Akses, Talud Batu Kali, Parkiran, Danau)
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

    // 7c. Jalan Paving Herringbone Luas di Koridor Tengah
    const pavingMat = new THREE.MeshStandardMaterial({
      map: pavingTexture,
      roughness: 0.75,
      metalness: 0.12
    });

    // Koridor Paving Utama Tengah
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

    // Paving Depan Dekanat & Area Parkir Motor Fasad Depan (Sesuai Foto 1 & 2)
    const eastPlaza = new THREE.Mesh(new THREE.PlaneGeometry(64, 40), pavingMat);
    eastPlaza.rotation.x = -Math.PI / 2;
    eastPlaza.position.set(28, -0.04, 25);
    eastPlaza.receiveShadow = true;
    scene.add(eastPlaza);

    // 7d. KANOPI KORIDOR PENGHUBUNG BIRU (Canopy Bridge Tengah)
    const bridgeCanopyGeo = new THREE.BoxGeometry(24, 0.45, 6);
    const bridgeCanopyMat = new THREE.MeshStandardMaterial({ color: '#1565c0', roughness: 0.4 });
    const bridgeCanopy = new THREE.Mesh(bridgeCanopyGeo, bridgeCanopyMat);
    bridgeCanopy.position.set(2, 4.2, 0);
    bridgeCanopy.castShadow = true;
    scene.add(bridgeCanopy);

    [-8, 8].forEach((bx) => {
      [-2.4, 2.4].forEach((bz) => {
        const bp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.2, 0.5), bridgeCanopyMat);
        bp.position.set(2 + bx, 2.1, bz);
        bp.castShadow = true;
        scene.add(bp);
      });
    });

    // 7e. JALAN AKSES ASPAL DEPAN & TALUD BATU KALI (Sesuai Foto 2 Lapangan)
    const asphaltMat = new THREE.MeshStandardMaterial({ map: asphaltTexture, roughness: 0.85, metalness: 0.1 });
    const retainingWallMat = new THREE.MeshStandardMaterial({ map: retainingWallTexture, roughness: 0.9 });
    const curbMat = new THREE.MeshStandardMaterial({ map: curbTexture, roughness: 0.6 });

    // Jalan Aspal Utama Depan Kampus
    const frontRoadMesh = new THREE.Mesh(new THREE.PlaneGeometry(160, 16), asphaltMat);
    frontRoadMesh.rotation.x = -Math.PI / 2;
    frontRoadMesh.position.set(10, -0.1, 48);
    frontRoadMesh.receiveShadow = true;
    scene.add(frontRoadMesh);

    // Jalan Aspal Cabang Akses Samping Sisi FT.2 (Sesuai Foto 2)
    const sideRoadMesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 90), asphaltMat);
    sideRoadMesh.rotation.x = -Math.PI / 2;
    sideRoadMesh.position.set(58, -0.1, 8);
    sideRoadMesh.receiveShadow = true;
    scene.add(sideRoadMesh);

    // Talud Batu Kali Memanjang di Tepi Jalan & Lapangan Parkir
    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(70, 1.2, 0.8), retainingWallMat);
    wall1.position.set(25, 0.45, 39.5);
    wall1.castShadow = true;
    scene.add(wall1);

    // Kanstin Belang Hitam Putih di Atas Talud
    const curb1 = new THREE.Mesh(new THREE.BoxGeometry(70, 0.25, 0.35), curbMat);
    curb1.position.set(25, 1.15, 39.5);
    scene.add(curb1);

    // Talud Sisi Samping Menuju Belakang FT.2
    const wallSide = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 50), retainingWallMat);
    wallSide.position.set(51, 0.45, 14);
    wallSide.castShadow = true;
    scene.add(wallSide);

    const curbSide = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 50), curbMat);
    curbSide.position.set(51, 1.15, 14);
    scene.add(curbSide);

    // 8. TIANG BENDERA INDONESIA MERAH PUTIH (Di Depan Kanopi Utama Fakultas Teknik)
    const flagGroup = new THREE.Group();
    flagGroup.position.set(22, 0, 26); // Tepat di depan kanopi Dekanat FT

    // Dudukan Beton Tiang Bendera
    const flagBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.4, 24), plinthMat);
    flagBase.position.y = 0.2;
    flagGroup.add(flagBase);

    // Tiang Stainless Steel
    const flagPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 10.5, 16),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.85, roughness: 0.2 })
    );
    flagPole.position.y = 5.4;
    flagPole.castShadow = true;
    flagGroup.add(flagPole);

    // Finial Bola Emas di Ujung Tiang
    const goldBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.9, roughness: 0.15 })
    );
    goldBall.position.y = 10.7;
    flagGroup.add(goldBall);

    // Kain Bendera Merah Putih
    const flagClothGeo = new THREE.PlaneGeometry(2.4, 1.4, 12, 4);
    const flagCanvas = document.createElement('canvas');
    flagCanvas.width = 128;
    flagCanvas.height = 64;
    const fctx = flagCanvas.getContext('2d')!;
    fctx.fillStyle = '#dc2626'; // Merah
    fctx.fillRect(0, 0, 128, 32);
    fctx.fillStyle = '#ffffff'; // Putih
    fctx.fillRect(0, 32, 128, 32);
    const flagTex = new THREE.CanvasTexture(flagCanvas);

    // Efek kibaran gelombang bendera
    const pos = flagClothGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const wave = Math.sin(u * 2.8) * 0.15;
      pos.setZ(i, wave);
    }
    flagClothGeo.computeVertexNormals();

    const flagCloth = new THREE.Mesh(
      flagClothGeo,
      new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide, roughness: 0.6 })
    );
    flagCloth.position.set(1.2, 9.8, 0);
    flagCloth.castShadow = true;
    flagGroup.add(flagCloth);

    scene.add(flagGroup);

    // 9. DETAIL DERETAN MOTOR & MOBIL PARKIR (Persis Foto 1 & Foto 2)
    const motoGroup = new THREE.Group();
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.9 });
    const seatMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.8 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.85, roughness: 0.2 });

    const createMotorbike = (x: number, z: number, rotY: number, colorHex: string, helmetHex: string) => {
      const m = new THREE.Group();
      m.position.set(x, 0, z);
      m.rotation.y = rotY;

      // 2 Roda
      const fw = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12), wheelMat);
      fw.rotation.z = Math.PI / 2;
      fw.position.set(0.42, 0.24, 0);
      m.add(fw);

      const rw = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12), wheelMat);
      rw.rotation.z = Math.PI / 2;
      rw.position.set(-0.42, 0.24, 0);
      m.add(rw);

      // Bodi motor
      const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4, metalness: 0.2 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.35, 0.26), bodyMat);
      body.position.set(0.04, 0.44, 0);
      m.add(body);

      // Jok motor
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.22), seatMat);
      seat.position.set(-0.1, 0.64, 0);
      m.add(seat);

      // Stang motor
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.48), chromeMat);
      bar.position.set(0.36, 0.78, 0);
      m.add(bar);

      // Helm di atas jok
      const helmet = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 10, 10),
        new THREE.MeshStandardMaterial({ color: helmetHex, roughness: 0.3 })
      );
      helmet.position.set(-0.1, 0.76, 0);
      m.add(helmet);

      motoGroup.add(m);
    };

    const bikeColors = ['#0f172a', '#dc2626', '#2563eb', '#ea580c', '#ffffff', '#475569', '#16a34a'];
    const helmetColors = ['#f8fafc', '#0f172a', '#dc2626', '#fbbf24', '#0284c7'];

    // Barisan Parkir Motor Fasad Depan (Dekanat & Menuju Jalan)
    for (let r = 0; r < 2; r++) {
      const zRow = 30 + r * 3.5;
      for (let i = 0; i < 14; i++) {
        const xPos = 6 + i * 2.4;
        const col = bikeColors[i % bikeColors.length];
        const hcol = helmetColors[(i * 3 + r) % helmetColors.length];
        createMotorbike(xPos, zRow, -0.4, col, hcol);
      }
    }

    // Barisan Parkir Motor Sisi Gedung FT.2 (Persis Foto 2)
    for (let i = 0; i < 9; i++) {
      const col = bikeColors[(i + 2) % bikeColors.length];
      const hcol = helmetColors[i % helmetColors.length];
      createMotorbike(45.5, -4 - i * 2.2, Math.PI / 2 + 0.1, col, hcol);
    }

    scene.add(motoGroup);

    // Mobil Parkir di Depan
    const createCar = (x: number, z: number, rotY: number, colorHex: string) => {
      const carGroup = new THREE.Group();
      carGroup.position.set(x, 0, z);
      carGroup.rotation.y = rotY;

      const carPaint = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35, metalness: 0.3 });
      const glassMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1, metalness: 0.8 });

      // Bodi bawah
      const lower = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.85, 1.8), carPaint);
      lower.position.y = 0.6;
      lower.castShadow = true;
      carGroup.add(lower);

      // Kabin / Kaca
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 1.6), glassMat);
      cabin.position.set(-0.2, 1.3, 0);
      carGroup.add(cabin);

      // Roda
      [[-1.3, 0.95], [-1.3, -0.95], [1.3, 0.95], [1.3, -0.95]].forEach(([wx, wz]) => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.22, 14), wheelMat);
        w.rotation.x = Math.PI / 2;
        w.position.set(wx, 0.35, wz);
        carGroup.add(w);
      });

      scene.add(carGroup);
    };

    createCar(12, 24, 0.1, '#ffffff');  // Mobil putih
    createCar(16, 24, 0.1, '#cbd5e1');  // Mobil perak
    createCar(36, 24, -0.15, '#0f172a'); // Mobil hitam

    // 10. BUILDER SEMUA BANGUNAN KAMPUS LENGKAP
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

      // 2. Dinding Utama & Jendela
      const floor1Group = new THREE.Group();
      const wall1Mesh = new THREE.Mesh(
        new THREE.BoxGeometry(bldg.length, floorHeight, bldg.depth),
        wallSkyBlueMat
      );
      wall1Mesh.position.y = 0.5 + floorHeight / 2;
      wall1Mesh.castShadow = true;
      wall1Mesh.receiveShadow = true;
      floor1Group.add(wall1Mesh);

      // Kolom Struktural: BIRU TUA ROYAL
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

        // Jendela Kaca Reflektif Antar-Kolom
        if (i < colCount - 1) {
          const winW = colStep - 0.85;
          const winH = 1.85;

          // Jangan pasang jendela standar jika ini adalah panel dekoratif SBSN Dekanat
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

      // Fasad Ujung Timur/Barat dengan Plang Huruf 3D Putih Asli (FT.1, FT.2, LABTEK 1)
      let signMat: THREE.MeshStandardMaterial | null = null;
      if (bldg.signType === 'ft1') {
        signMat = new THREE.MeshStandardMaterial({ map: ft1SignTexture, roughness: 0.4 });
      } else if (bldg.signType === 'ft2') {
        signMat = new THREE.MeshStandardMaterial({ map: ft2SignTexture, roughness: 0.4 });
      } else if (bldg.signType === 'labtek1') {
        signMat = new THREE.MeshStandardMaterial({ map: labtek1SignTexture, roughness: 0.4 });
      }

      if (signMat) {
        const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(bldg.depth * 0.9, floorHeight * 1.8), signMat);
        signMesh.rotation.y = Math.PI / 2;
        signMesh.position.set(bldg.length / 2 + 0.08, 0.5 + floorHeight, 0);
        bldgGroup.add(signMesh);
      }

      // DETAIL KHUSUS FASAD DEPAN DEKANAT (PERSIS FOTO 1 ASLI)
      if (bldg.isDekanat) {
        // A. Panel Biru Besar SBSN (Sebelah Kiri Kanopi)
        const featurePanelMat = new THREE.MeshStandardMaterial({
          map: dekanatFeatureTexture,
          roughness: 0.35,
          metalness: 0.15
        });
        const panelW = 16.5;
        const panelH = floorHeight * 1.95;
        const panelMesh = new THREE.Mesh(new THREE.PlaneGeometry(panelW, panelH), featurePanelMat);
        panelMesh.position.set(-14.5, 0.5 + floorHeight, bldg.depth / 2 + 0.18);
        bldgGroup.add(panelMesh);
      }

      bldgGroup.add(floor2Group);
      buildingFloor2sRef.current.set(bldg.id, floor2Group);

      // 4. Atap Limasan (Hip Roof) dengan Genteng Merah Cokelat Asli
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

        // Plafon kanopi tebal
        const canopyRoof = new THREE.Mesh(
          new THREE.BoxGeometry(canW, 0.55, canD),
          bldg.isDekanat ? canopyNavyMat : whiteTrimMat
        );
        canopyRoof.position.set(canX, canH, canZ);
        canopyRoof.castShadow = true;
        bldgGroup.add(canopyRoof);

        // Fasad Depan Plang Kanopi Dekanat: "FAKULTAS TEKNIK" (Persis Foto 1)
        if (bldg.isDekanat) {
          const canopySignMat = new THREE.MeshStandardMaterial({ map: canopyFasciaTexture, roughness: 0.35 });
          const canopySign = new THREE.Mesh(new THREE.PlaneGeometry(canW * 0.95, 0.52), canopySignMat);
          canopySign.position.set(canX, canH, canZ + canD / 2 + 0.04);
          bldgGroup.add(canopySign);

          // Pintu Kaca Lobby Dekanat di Belakang Kanopi
          const lobbyDoorMat = new THREE.MeshStandardMaterial({ map: lobbyDoorTexture, roughness: 0.2, metalness: 0.8 });
          const lobbyDoor = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 3.8), lobbyDoorMat);
          lobbyDoor.position.set(canX, 0.5 + 1.9, bldg.depth / 2 + 0.12);
          bldgGroup.add(lobbyDoor);
        }

        // Dua Pilar Besar Penyangga Kanopi (Biru Tua - Putih - Biru Tua sesuai Foto 1)
        const colW = bldg.isDekanat ? 0.95 : 0.65;
        const pOffsets = [canX - canW / 2 + 0.8, canX + canW / 2 - 0.8];

        pOffsets.forEach((px) => {
          // Bawah (Biru tua)
          const pBottom = new THREE.Mesh(new THREE.BoxGeometry(colW, 1.2, colW), pillarRoyalBlueMat);
          pBottom.position.set(px, 0.6, canZ + canD / 2 - 0.7);
          pBottom.castShadow = true;
          bldgGroup.add(pBottom);

          // Tengah (Putih)
          const pMid = new THREE.Mesh(new THREE.BoxGeometry(colW - 0.05, 2.2, colW - 0.05), whiteTrimMat);
          pMid.position.set(px, 1.2 + 1.1, canZ + canD / 2 - 0.7);
          pMid.castShadow = true;
          bldgGroup.add(pMid);

          // Atas (Biru tua)
          const pTop = new THREE.Mesh(new THREE.BoxGeometry(colW, canH - 3.4, colW), pillarRoyalBlueMat);
          pTop.position.set(px, 3.4 + (canH - 3.4) / 2, canZ + canD / 2 - 0.7);
          pTop.castShadow = true;
          bldgGroup.add(pTop);
        });

        // Anak Tangga Masuk
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

    // 11. VEGETASI & POHON KAMPUS (Sesuai Foto Udara & Sisi Jalan Akses)
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
      // Pohon samping talud jalan akses (Sesuai Foto 2)
      [53, 30, 0.75], [53, 20, 0.8], [53, 10, 0.75], [53, 0, 0.8], [53, -10, 0.85], [53, -20, 0.9],
      // Pohon perimeter kawasan
      [-70, 22, 1.3], [-72, 0, 1.2], [-70, -22, 1.4],
      [-46, 14, 0.95], [-44, -14, 1.0], [4, 14, 0.85], [4, -14, 0.9],
      [72, 24, 1.2], [82, 14, 1.3], [85, -2, 1.4], [78, -16, 1.1],
      [-45, 34, 0.9], [-22, 34, 0.85], [-2, 38, 0.85], [48, 38, 0.95],
      [-32, -56, 1.3], [-8, -56, 1.2], [18, -56, 1.35], [46, -56, 1.25]
    ];
    trees.forEach(([tx, tz, ts]) => createCanopyTree(tx, tz, ts));

    // 12. Interaksi Mouse & Touch
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

    // 13. Loop Render Animasi
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

  // Koleksi Foto Lapangan untuk Dibandingkan
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
                Model 3D arsitektural akurat: fasad depan SBSN Dekanat, kanopi Fakultas Teknik, tiang bendera, talud batu kali, dan barisan parkir motor.
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
              title="Siang Cerah (Persis Foto Lapangan)"
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
      <div className="relative w-full h-[580px] sm:h-[660px] bg-slate-900 select-none overflow-hidden">
        
        {/* Kanvas Three.js */}
        <div ref={containerRef} className="w-full h-full touch-none" />

        {/* 🏷️ Floating Building Pills di Kiri Atas */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto max-w-[280px]">
          
          <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
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
            {/* Modal Header */}
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

            {/* Tab Selector Foto */}
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

            {/* Foto Tampilan Utama */}
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

            {/* Modal Footer Controls */}
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
