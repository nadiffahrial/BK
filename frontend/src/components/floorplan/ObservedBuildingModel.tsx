import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Building, Room } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  building: Building;
  activeFloorNumber: number;
  showOtherFloors: boolean;
  cameraMode: 'iso' | 'top' | 'side';
  selectedRoom?: Room | null;
  onSelectRoom: (room: Room) => void;
}

const MAP_WIDTH = 44;
const MAP_DEPTH = 20;
const SCALE = MAP_WIDTH / 1100;
const FLOOR_HEIGHT = 3.5;
const WALL_HEIGHT = 1.45;
const SLAB = 0.16;

function planRect(room: Room) {
  const { x, y, w, h } = room.coordinates;
  const depthScale = 0.82;
  const adjustedY = y < 250 ? 35 + (y - 35) * depthScale : 310 + (y - 270) * depthScale;
  const adjustedH = h * depthScale;
  const width = w * SCALE;
  const depth = adjustedH * SCALE;
  const left = -MAP_WIDTH / 2 + x * SCALE;
  const back = MAP_DEPTH / 2 - adjustedY * SCALE;
  return {
    left,
    right: left + width,
    back,
    front: back - depth,
    width,
    depth,
    centerX: left + width / 2,
    centerZ: back - depth / 2
  };
}

function makeMaterial(color: THREE.ColorRepresentation, opacity = 1, roughness = 0.78) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.02,
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity >= 1
  });
}

function addBox(
  parent: THREE.Group,
  size: [number, number, number],
  position: [number, number, number],
  material: THREE.Material,
  room?: Room
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  if (room) mesh.userData.room = room;
  parent.add(mesh);
  return mesh;
}

function addWall(
  group: THREE.Group,
  room: Room,
  side: 'top' | 'bottom' | 'left' | 'right',
  floorY: number,
  plan: ReturnType<typeof planRect>,
  wallMaterial: THREE.Material,
  trimMaterial: THREE.Material,
  doorMaterial: THREE.Material
) {
  const horizontal = side === 'top' || side === 'bottom';
  const length = horizontal ? plan.width : plan.depth;
  const centerX = horizontal ? plan.centerX : side === 'left' ? plan.left : plan.right;
  const centerZ = horizontal ? side === 'top' ? plan.back : plan.front : plan.centerZ;
  const opening = room.coordinates.doorPosition === side ? Math.min(0.92, length * 0.36) : 0;
  const thickness = 0.11;
  const wallH = WALL_HEIGHT;

  const segment = (offset: number, span: number) => {
    if (span < 0.08) return;
    const x = horizontal ? centerX + offset : centerX;
    const z = horizontal ? centerZ : centerZ + offset;
    const size: [number, number, number] = horizontal
      ? [span, wallH, thickness]
      : [thickness, wallH, span];
    const capSize: [number, number, number] = horizontal
      ? [span, 0.08, thickness + 0.035]
      : [thickness + 0.035, 0.08, span];
    addBox(group, size, [x, floorY + wallH / 2, z], wallMaterial, room);
    addBox(group, capSize, [x, floorY + wallH + 0.025, z], trimMaterial, room);
  };

  if (!opening) {
    segment(0, length);
    return;
  }

  const gap = opening + 0.11;
  segment(-(length - gap) / 4 - gap / 2, (length - gap) / 2);
  segment((length - gap) / 4 + gap / 2, (length - gap) / 2);

  const jambHeight = 2.08;
  for (const direction of [-1, 1]) {
    const jambOffset = direction * opening / 2;
    const jambX = horizontal ? centerX + jambOffset : centerX;
    const jambZ = horizontal ? centerZ : centerZ + jambOffset;
    addBox(group, horizontal ? [0.085, jambHeight, thickness + 0.04] : [thickness + 0.04, jambHeight, 0.085], [jambX, floorY + jambHeight / 2, jambZ], trimMaterial, room);
  }

  addBox(group, horizontal ? [opening + 0.08, 0.09, thickness + 0.04] : [thickness + 0.04, 0.09, opening + 0.08], [centerX, floorY + jambHeight, centerZ], trimMaterial, room);

  // A slightly open leaf makes the entrance legible in the cutaway view.
  const leaf = addBox(group, horizontal ? [opening * 0.84, 0.045, 0.045] : [0.045, 0.045, opening * 0.84], [centerX, floorY + 1.0, centerZ], doorMaterial, room);
  leaf.rotation.y = horizontal ? -0.45 : 0.45;
}

function addRoomLabel(scene: THREE.Scene, room: Room, floorY: number, plan: ReturnType<typeof planRect>) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#10212b';
  ctx.beginPath();
  ctx.roundRect(8, 8, 624, 144, 18);
  ctx.fill();
  ctx.strokeStyle = '#d7e7df';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#b8f3d5';
  ctx.font = 'bold 42px Arial';
  ctx.fillText(room.code.slice(0, 18), 28, 63);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  const name = room.name.length > 31 ? `${room.name.slice(0, 29)}…` : room.name;
  ctx.fillText(name, 28, 116);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, sizeAttenuation: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(Math.min(3.6, Math.max(1.35, plan.width * 0.82)), 0.9, 1);
  sprite.position.set(plan.centerX, floorY + 1.72, plan.centerZ);
  sprite.renderOrder = 10;
  sprite.userData.texture = texture;
  sprite.userData.material = material;
  scene.add(sprite);
}

function addFurniture(group: THREE.Group, room: Room, floorY: number, plan: ReturnType<typeof planRect>, material: THREE.Material) {
  if (room.code === 'TANGGA' || room.code.startsWith('WC') || room.code === 'WUDHU' || room.type === 'facility') return;
  const topY = floorY + 0.22;
  const isOffice = room.type === 'office';
  const columns = isOffice ? 2 : plan.width > 5 ? 3 : 2;
  const rows = isOffice ? 1 : plan.depth > 4 ? 2 : 1;
  const deskW = Math.min(0.86, (plan.width - 0.72) / columns * 0.72);
  const deskD = Math.min(0.55, (plan.depth - 0.75) / rows * 0.72);
  const gapX = Math.max(deskW + 0.28, (plan.width - 0.7) / columns);
  const gapZ = Math.max(deskD + 0.36, (plan.depth - 0.7) / rows);
  const count = Math.min(isOffice ? 2 : 6, Math.max(1, Math.round((room.currentOccupancy || room.capacity * 0.45) / Math.max(1, room.capacity) * (isOffice ? 2 : 6))));

  for (let i = 0; i < count; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = plan.centerX - ((columns - 1) * gapX) / 2 + col * gapX;
    const z = plan.centerZ - ((rows - 1) * gapZ) / 2 + row * gapZ;
    addBox(group, [deskW, 0.08, deskD], [x, topY, z], material, room);
    if (room.type === 'laboratory') {
      const monitor = new THREE.Mesh(new THREE.BoxGeometry(deskW * 0.34, 0.23, 0.045), makeMaterial('#263949', 1, 0.4));
      monitor.position.set(x, topY + 0.18, z - deskD * 0.25);
      monitor.castShadow = true;
      group.add(monitor);
    }
  }
}

function createSlabGeometry(floor: Building['floors'][number]) {
  const shape = new THREE.Shape();
  shape.moveTo(-MAP_WIDTH / 2, -MAP_DEPTH / 2);
  shape.lineTo(MAP_WIDTH / 2, -MAP_DEPTH / 2);
  shape.lineTo(MAP_WIDTH / 2, MAP_DEPTH / 2);
  shape.lineTo(-MAP_WIDTH / 2, MAP_DEPTH / 2);
  shape.closePath();

  floor.rooms.filter(room => room.code === 'TANGGA').forEach(room => {
    const plan = planRect(room);
    const hole = new THREE.Path();
    hole.moveTo(plan.left, -plan.back);
    hole.lineTo(plan.left, -plan.front);
    hole.lineTo(plan.right, -plan.front);
    hole.lineTo(plan.right, -plan.back);
    hole.closePath();
    shape.holes.push(hole);
  });

  const geometry = new THREE.ShapeGeometry(shape, 1);
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

function addStairRun(group: THREE.Group, room: Room, lowerY: number, upperY: number, plan: ReturnType<typeof planRect>) {
  const xWidth = Math.max(1.9, Math.min(2.7, plan.width - 0.28));
  const roomDepth = Math.max(4.7, plan.depth - 0.28);
  const landingDepth = 0.62;
  const flightDepth = (roomDepth - landingDepth) / 2;
  const steps = 9;
  const tread = flightDepth / steps;
  const midY = (lowerY + upperY) / 2;
  const rise = (upperY - lowerY) / (steps * 2);
  const stairMaterial = makeMaterial('#c7d1d8');
  const noseMaterial = makeMaterial('#8da0aa');
  const railMaterial = makeMaterial('#70838c', 1, 0.34);
  const flightX = [plan.centerX - xWidth * 0.25, plan.centerX + xWidth * 0.25];

  for (let i = 0; i < steps; i++) {
    const z = plan.front + tread * (i + 0.5);
    const y = lowerY + rise * (i + 0.5);
    addBox(group, [xWidth * 0.46, rise, tread * 0.96], [flightX[0], y, z], stairMaterial, room);
    addBox(group, [xWidth * 0.46, 0.035, tread * 0.96], [flightX[0], y + rise / 2 + 0.015, z], noseMaterial, room);
  }
  addBox(group, [xWidth, 0.12, landingDepth], [plan.centerX, midY, plan.centerZ], stairMaterial, room);
  for (let i = 0; i < steps; i++) {
    const z = plan.back - tread * (i + 0.5);
    const y = midY + rise * (i + 0.5);
    addBox(group, [xWidth * 0.46, rise, tread * 0.96], [flightX[1], y, z], stairMaterial, room);
    addBox(group, [xWidth * 0.46, 0.035, tread * 0.96], [flightX[1], y + rise / 2 + 0.015, z], noseMaterial, room);
  }

  // Sloped handrails on the two open sides of each flight.
  const beam = (from: THREE.Vector3, to: THREE.Vector3) => {
    const vector = new THREE.Vector3().subVectors(to, from);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, vector.length(), 8), railMaterial);
    bar.position.copy(from).add(to).multiplyScalar(0.5);
    bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vector.normalize());
    group.add(bar);
  };
  const sideX = [plan.centerX - xWidth * 0.48, plan.centerX + xWidth * 0.48];
  sideX.forEach(x => {
    beam(new THREE.Vector3(x, lowerY + 0.9, plan.front + 0.08), new THREE.Vector3(x, midY + 0.1, plan.centerZ - landingDepth * 0.5));
    beam(new THREE.Vector3(x, midY + 0.1, plan.centerZ + landingDepth * 0.5), new THREE.Vector3(x, upperY + 0.9, plan.back - 0.08));
  });
}

export const ObservedBuildingModel: React.FC<Props> = ({ building, activeFloorNumber, showOtherFloors, cameraMode, selectedRoom, onSelectRoom }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch {
      canvas.dataset.webglError = 'true';
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.shadowMap.enabled = false;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? '#0b1220' : '#e8eef0');
    scene.fog = new THREE.Fog(scene.background, 58, 100);
    scene.add(new THREE.HemisphereLight(isDark ? '#c9e5f3' : '#ffffff', isDark ? '#18242b' : '#78877f', 2.2));
    const keyLight = new THREE.DirectionalLight('#fff2d8', 3.1);
    keyLight.position.set(-20, 34, 25);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.left = -32;
    keyLight.shadow.camera.right = 32;
    keyLight.shadow.camera.top = 25;
    keyLight.shadow.camera.bottom = -25;
    keyLight.shadow.bias = -0.0003;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(isDark ? '#87c6b1' : '#dce9ef', 1.0);
    fillLight.position.set(20, 12, -18);
    scene.add(fillLight);

    const ambientGround = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), makeMaterial(isDark ? '#101a27' : '#d8e0e1'));
    ambientGround.rotation.x = -Math.PI / 2;
    ambientGround.position.y = -0.55;
    ambientGround.receiveShadow = true;
    scene.add(ambientGround);
    const grid = new THREE.GridHelper(70, 44, isDark ? '#34454d' : '#aab8b9', isDark ? '#25353f' : '#c4cece');
    grid.position.y = -0.53;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.42;
    scene.add(grid);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 180);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.minDistance = 27;
    controls.maxDistance = 82;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, 2.0, 0);

    if (cameraMode === 'top') camera.position.set(0, 49, 0.01);
    else if (cameraMode === 'side') camera.position.set(43, 12, 6);
    else camera.position.set(34, 29, 37);
    camera.lookAt(0, 2, 0);
    controls.update();

    const floorGroups = new Map<number, THREE.Group>();
    const roomPickMeshes: THREE.Object3D[] = [];
    const levelY = (floorNumber: number) => (floorNumber - 1) * FLOOR_HEIGHT;

    building.floors.forEach(floor => {
      const floorY = levelY(floor.floorNumber);
      const isActive = floor.floorNumber === activeFloorNumber;
      const opacity = isActive ? 1 : showOtherFloors ? 0.14 : 0;
      const floorGroup = new THREE.Group();
      floorGroup.userData.floorNumber = floor.floorNumber;
      floorGroup.visible = opacity > 0;
      floorGroups.set(floor.floorNumber, floorGroup);
      scene.add(floorGroup);

      const slabMaterial = makeMaterial(isDark ? '#687a82' : '#cad2d3', opacity, 0.84);
      const slab = new THREE.Mesh(createSlabGeometry(floor), slabMaterial);
      slab.position.y = floorY - SLAB;
      slab.castShadow = true;
      slab.receiveShadow = true;
      floorGroup.add(slab);
      const slabEdge = new THREE.Mesh(new THREE.BoxGeometry(MAP_WIDTH, SLAB, MAP_DEPTH), makeMaterial(isDark ? '#30404a' : '#88999d', opacity));
      slabEdge.position.y = floorY - SLAB / 2;
      slabEdge.castShadow = true;
      slabEdge.receiveShadow = true;
      floorGroup.add(slabEdge);

      floor.rooms.forEach(room => {
        const plan = planRect(room);
        const isStair = room.code === 'TANGGA';
        const group = new THREE.Group();
        group.userData.room = room;
        floorGroup.add(group);
        const wallColor = isDark ? '#d6d5c9' : '#e9e5d9';
        const wallMaterial = makeMaterial(wallColor, opacity, 0.86);
        const trimMaterial = makeMaterial(isDark ? '#b8b7aa' : '#b9b9af', opacity, 0.68);
        const doorMaterial = makeMaterial(isDark ? '#795842' : '#8b6247', opacity, 0.7);
        const furnitureMaterial = makeMaterial(isDark ? '#806c57' : '#b18b64', opacity, 0.74);
        const statusColor = room.status === 'broken' ? '#e3c4c0' : room.status === 'maintenance' ? '#ead5c2' : room.status === 'occupied' ? '#e2e7e7' : room.status === 'reserved' ? '#e7e5dc' : '#e6ece7';
        if (!isStair) {
          const roomFloor = addBox(group, [Math.max(0.18, plan.width - 0.06), 0.025, Math.max(0.18, plan.depth - 0.06)], [plan.centerX, floorY + 0.004, plan.centerZ], makeMaterial(isDark ? '#74828a' : statusColor, opacity, 0.92), room);
          roomPickMeshes.push(roomFloor);
        }
        if (isActive) addRoomLabel(scene, room, floorY, plan);

        if (isStair) {
          const wellTrim = makeMaterial(isDark ? '#9baeb2' : '#9eadae', opacity);
          addBox(group, [0.12, 0.22, plan.depth], [plan.left, floorY + 0.1, plan.centerZ], wellTrim, room);
          addBox(group, [0.12, 0.22, plan.depth], [plan.right, floorY + 0.1, plan.centerZ], wellTrim, room);
        } else {
          addWall(group, room, 'top', floorY, plan, wallMaterial, trimMaterial, doorMaterial);
          addWall(group, room, 'bottom', floorY, plan, wallMaterial, trimMaterial, doorMaterial);
          addWall(group, room, 'left', floorY, plan, wallMaterial, trimMaterial, doorMaterial);
          addWall(group, room, 'right', floorY, plan, wallMaterial, trimMaterial, doorMaterial);
          addFurniture(group, room, floorY, plan, furnitureMaterial);
          if (room.type === 'classroom' || room.type === 'laboratory') {
            const board = new THREE.Mesh(new THREE.BoxGeometry(Math.min(1.55, plan.width * 0.55), 0.58, 0.055), makeMaterial('#31565a', opacity, 0.4));
            board.position.set(plan.centerX, floorY + 1.04, plan.back - 0.16);
            group.add(board);
          }
        }

      });
    });

    // Pair each measured stairwell to the nearest stairwell above it and build
    // one continuous two-flight stair with a shared landing between the slabs.
    for (let index = 0; index < building.floors.length - 1; index++) {
      const lowerFloor = building.floors[index];
      const upperFloor = building.floors[index + 1];
      const upperStairs = upperFloor.rooms.filter(room => room.code === 'TANGGA').map(room => ({ room, plan: planRect(room), used: false }));
      lowerFloor.rooms.filter(room => room.code === 'TANGGA').forEach(lowerRoom => {
        const lowerPlan = planRect(lowerRoom);
        const match = upperStairs.filter(item => !item.used).sort((a, b) => {
          const da = Math.hypot(a.plan.centerX - lowerPlan.centerX, a.plan.centerZ - lowerPlan.centerZ);
          const db = Math.hypot(b.plan.centerX - lowerPlan.centerX, b.plan.centerZ - lowerPlan.centerZ);
          return da - db;
        })[0];
        if (!match) return;
        match.used = true;
        const plan = {
          ...lowerPlan,
          centerX: (lowerPlan.centerX + match.plan.centerX) / 2,
          centerZ: (lowerPlan.centerZ + match.plan.centerZ) / 2,
          width: Math.min(lowerPlan.width, match.plan.width),
          depth: Math.min(lowerPlan.depth, match.plan.depth)
        };
        const stairGroup = new THREE.Group();
        stairGroup.userData.room = lowerRoom;
        scene.add(stairGroup);
        addStairRun(stairGroup, lowerRoom, levelY(lowerFloor.floorNumber) + 0.05, levelY(upperFloor.floorNumber) - 0.02, plan);
      });
    }

    if (selectedRoom) {
      const floor = building.floors.find(item => item.floorNumber === selectedRoom.floorNumber);
      const room = floor?.rooms.find(item => item.id === selectedRoom.id);
      if (room && selectedRoom.floorNumber === activeFloorNumber) {
        const target = roomPickMeshes.find(mesh => mesh.userData.room?.id === room.id);
        if (target instanceof THREE.Mesh && target.material instanceof THREE.MeshStandardMaterial) {
          target.material = target.material.clone();
          target.material.emissive = new THREE.Color('#1a7650');
          target.material.emissiveIntensity = 0.55;
        }
      }
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerStart: { x: number; y: number } | null = null;
    const findRoomAt = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(roomPickMeshes, false).find(hit => hit.object.userData.room?.floorNumber === activeFloorNumber)?.object.userData.room as Room | undefined;
    };
    const handlePointerDown = (event: PointerEvent) => { pointerStart = { x: event.clientX, y: event.clientY }; };
    const handlePointerUp = (event: PointerEvent) => {
      if (!pointerStart || Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 6) return;
      const room = findRoomAt(event);
      if (room) onSelectRoom(room);
    };
    const handlePointerMove = (event: PointerEvent) => { canvas.style.cursor = findRoomAt(event) ? 'pointer' : 'grab'; };
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointermove', handlePointerMove);

    const resize = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    let animationFrame = 0;
    const render = () => {
      animationFrame = requestAnimationFrame(render);
      controls.update();
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      controls.dispose();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointermove', handlePointerMove);
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Sprite) {
          object.geometry?.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(material => {
            if (material instanceof THREE.SpriteMaterial) material.map?.dispose();
            material.dispose();
          });
        }
      });
      renderer.dispose();
    };
  }, [building, activeFloorNumber, showOtherFloors, cameraMode, selectedRoom, onSelectRoom, isDark]);

  return <canvas ref={canvasRef} aria-label={`Model 3D potongan ${building.shortName}, pilih ruangan untuk melihat detail`} className="block h-full w-full touch-none" />;
};
