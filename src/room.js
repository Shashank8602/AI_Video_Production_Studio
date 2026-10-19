import * as THREE from 'three';
import * as P from './props.js';

const { mat } = P;

function box(w, h, d, color, x, y, z, opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  m.position.set(x, y, z);
  return m;
}
function at(obj, x, y, z, s = 1, ry = 0) {
  obj.position.set(x, y, z);
  obj.scale.setScalar(s);
  obj.rotation.y = ry;
  return obj;
}

// One fixed cozy low-poly night room. Floor at y = 0, back wall at z = -3, camera looks from +z.
// Layers: back wall decor -> furniture (z -2..-1) -> characters (z ~0..1) -> foreground (z ~5.5, wide shot only).
export function buildRoom(scene) {
  const room = new THREE.Group();
  const animated = [];

  // ---- Shell ----
  room.add(box(10, 0.2, 18, 0x9a6a45, 0, -0.1, 5)); // wood floor
  for (let i = 0; i < 9; i++) room.add(box(0.03, 0.01, 18, 0x7b5133, -4.4 + i * 1.1, 0.005, 5)); // plank lines
  room.add(box(10, 10, 0.2, 0x5a3fa0, 0, 5, -3)); // back wall (violet)
  room.add(box(0.2, 10, 18, 0x4a3590, -5, 5, 5)); // left wall
  room.add(box(0.2, 10, 18, 0x4a3590, 5, 5, 5)); // right wall
  room.add(box(10, 0.18, 0.12, 0xf5e6c8, 0, 0.09, -2.9)); // skirting boards
  room.add(box(0.12, 0.18, 18, 0xf5e6c8, -4.9, 0.09, 5));
  room.add(box(0.12, 0.18, 18, 0xf5e6c8, 4.9, 0.09, 5));

  // Rug
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 0.04, 14), mat(0xd1495b));
  rug.position.set(0, 0.02, 0.4);
  room.add(rug);
  const rug2 = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.05, 14), mat(0xedae49));
  rug2.position.set(0, 0.025, 0.4);
  room.add(rug2);
  const rug3 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.06, 14), mat(0x00798c));
  rug3.position.set(0, 0.03, 0.4);
  room.add(rug3);

  // ---- Window with starry sky (shifted left so the wall screen fits in the wide shot) ----
  const win = new THREE.Group();
  win.position.x = -0.6;
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.6), new THREE.MeshBasicMaterial({ color: 0x0a0d2e }));
  sky.position.set(0, 3.6, -2.88);
  win.add(sky);
  const starGeo = new THREE.BufferGeometry();
  const pts = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 110; i++) pts.push((rnd() - 0.5) * 3.0, 3.6 + (rnd() - 0.5) * 2.4, -2.86);
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  win.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 })));
  const moon = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), new THREE.MeshBasicMaterial({ color: 0xfff1c9 }));
  moon.position.set(0.95, 4.35, -2.85);
  win.add(moon);
  win.add(box(3.4, 0.14, 0.2, 0xf5e6c8, 0, 4.95, -2.85));
  win.add(box(3.4, 0.14, 0.2, 0xf5e6c8, 0, 2.25, -2.85));
  win.add(box(0.14, 2.8, 0.2, 0xf5e6c8, -1.65, 3.6, -2.85));
  win.add(box(0.14, 2.8, 0.2, 0xf5e6c8, 1.65, 3.6, -2.85));
  win.add(box(0.08, 2.8, 0.2, 0xf5e6c8, 0, 3.6, -2.85));
  win.add(box(3.6, 0.1, 0.35, 0xf5e6c8, 0, 2.18, -2.75)); // sill
  room.add(win);
  // Items on the window sill
  room.add(at(P.succulent(0x7bd88f, 0xf25f5c), -2.3, 2.23, -2.7, 1.2));
  room.add(at(P.succulent(0xa7e8bd, 0x4cc9f0), -0.2, 2.23, -2.7, 1.0));

  // ---- Wall screen (topic visuals draw here) ----
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 512;
  screenCanvas.height = 384;
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.425), new THREE.MeshBasicMaterial({ map: screenTex }));
  screen.position.set(2.2, 3.5, -2.88);
  room.add(screen);
  room.add(box(2.1, 1.65, 0.08, 0x15182a, 2.2, 3.5, -2.93));

  // ---- Posters and string lights ----
  room.add(at(P.poster(0.9, 1.25, P.posterArt.starMap), -4.0, 4.6, -2.88));
  room.add(at(P.poster(0.85, 1.2, P.posterArt.circuit), 4.15, 4.5, -2.88));
  room.add(at(P.poster(0.8, 1.1, P.posterArt.rocket), 4.15, 3.0, -2.88));
  room.add(P.stringLights(-4.8, 4.8, 5.6, -2.8, 26, 0.55));

  // ---- Bookshelf (left) with science/space showcase on top ----
  room.add(box(1.8, 3.2, 0.5, 0x7a4a2e, -3.6, 1.6, -2.6));
  const bookColors = [0xe4572e, 0x29a0b1, 0xf3c13a, 0x4aa37a, 0x8a5ac2, 0xef476f];
  for (let shelf = 0; shelf < 3; shelf++) {
    for (let i = 0; i < 6; i++) {
      room.add(box(0.2, 0.5 + (i % 3) * 0.05, 0.36, bookColors[(i + shelf) % 6], -4.2 + i * 0.24, 0.55 + shelf * 1.0, -2.4));
    }
  }
  room.add(at(P.plant(0.8, 6), -4.2, 3.2, -2.55));
  room.add(at(P.globe(), -3.55, 3.2, -2.5, 1.2));
  const atom = P.atomModel();
  room.add(at(atom, -2.95, 3.55, -2.5, 1.2));
  animated.push(atom);
  room.add(at(P.succulent(0xb8f2c8, 0xff6b9d), -3.0, 1.0, -2.4, 1.1));
  room.add(at(P.beaker(0xff7bd5, 0.26), -3.9, 2.0, -2.4));

  // ---- Planet mobile hangs in front of the window ----
  const mobile = P.planetMobile();
  mobile.position.set(-1.4, 7.8, -1.4);
  room.add(mobile);
  animated.push({ userData: { update: (t) => (mobile.rotation.y = Math.sin(t * 0.5) * 0.25) } });

  // ---- Science table (left) ----
  const tbl = new THREE.Group();
  tbl.add(box(1.5, 0.1, 0.9, 0xd9a066, 0, 1.0, 0));
  for (const sx of [-0.65, 0.65]) for (const sz of [-0.38, 0.38]) tbl.add(box(0.08, 1.0, 0.08, 0x8a5a36, sx, 0.5, sz));
  tbl.add(at(P.microscope(), -0.4, 1.05, -0.05, 1.3, 0.4));
  tbl.add(at(P.beaker(0x7cff6b, 0.3), 0.05, 1.05, 0.2));
  tbl.add(at(P.beaker(0x4cc9f0, 0.38), 0.28, 1.05, -0.12));
  tbl.add(at(P.beaker(0xffb703, 0.24), 0.5, 1.05, 0.22));
  tbl.add(at(P.dnaHelix(), 0.6, 1.05, -0.25, 1.1));
  tbl.position.set(-3.5, 0, -0.9);
  tbl.rotation.y = 0.35;
  room.add(tbl);

  // ---- Tech desk (right) with UFO, retro computer, lamp, toys ----
  const desk = new THREE.Group();
  desk.add(box(2.7, 0.12, 1.0, 0x8a5a36, 0, 1.2, 0));
  desk.add(box(0.12, 1.2, 0.9, 0x6a4326, -1.25, 0.6, 0));
  desk.add(box(0.12, 1.2, 0.9, 0x6a4326, 1.25, 0.6, 0));
  desk.add(box(2.5, 0.5, 0.05, 0x6a4326, 0, 0.9, -0.42));
  const ufo = P.ufo();
  ufo.userData.baseY = 1.75;
  at(ufo, -0.85, 1.75, 0.0, 1.0);
  desk.add(ufo);
  animated.push(ufo);
  desk.add(at(P.crtComputer(P.codeCanvas()), 0.3, 1.26, -0.15, 1.1, -0.2));
  desk.add(at(P.toyRobot(0xff9f1c), 0.95, 1.26, 0.15, 1.2, -0.5));
  desk.add(at(P.toyRobot(0x06d6a0), 0.7, 1.26, 0.3, 0.8, 0.2));
  desk.add(at(P.mug(0xf25f5c), -0.15, 1.26, 0.3));
  desk.add(at(P.succulent(0x7bd88f, 0xffe066), -1.1, 1.26, 0.25, 1.1));
  desk.add(at(P.bookStack([0x29a0b1, 0xf3c13a, 0xe4572e]), -1.0, 1.26, -0.2, 0.7));
  desk.add(box(0.4, 0.06, 0.4, 0x222222, 1.0, 1.29, -0.3));
  desk.add(box(0.06, 0.9, 0.06, 0x222222, 1.0, 1.75, -0.3));
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.4, 7, 1, true), mat(0xffc86b, { emissive: 0xffa535, emissiveIntensity: 1.0, side: THREE.DoubleSide }));
  lampShade.position.set(1.0, 2.3, -0.3);
  desk.add(lampShade);
  desk.position.set(2.9, 0, -1.9);
  room.add(desk);
  room.add(at(P.rocket(), 4.45, 0, -0.9, 1.5, 0.3));

  // ---- Seating used by the poses ----
  const bean = P.beanbag();
  room.add(at(bean, -1.9, 0, 0.1, 1.0, 0.4));
  room.add(at(P.cushion(0x29a0b1), -2.65, 0.45, 0.0, 1.0, 0.8));
  const stool = P.stool();
  room.add(at(stool, 2.3, 0, 0.2));

  // Floor plants and extras
  room.add(at(P.plant(1.4, 9, 0x3fb36a, 0x4cc9f0), -4.35, 0, 0.9));
  room.add(at(P.plant(1.1, 7, 0x58c47a, 0xf4a259), 4.4, 0, 1.4));
  room.add(at(P.bookStack(), 3.6, 0, 0.3, 1.0, 0.4));
  room.add(at(P.mug(0x06d6a0), 3.6, 0.34, 0.3, 1.0));
  room.add(at(P.planet(0.35, 0x4cc9f0, true), -4.2, 0.45, -0.2));

  // ---- Foreground (wide shot only): plant left, books and mug right, close to the camera ----
  const fg = new THREE.Group();
  fg.add(at(P.plant(1.9, 11, 0x2fb36a, 0xe85d75), -1.35, 0, 0));
  fg.add(at(P.bookStack([0xf3c13a, 0xef476f, 0x29a0b1, 0x7d5ba6, 0xe4572e]), 1.25, 0, 0, 1.6, 0.3));
  fg.add(at(P.mug(0x06d6a0), 1.25, 0.52, 0, 1.7));
  fg.add(at(P.succulent(0x9ae89f, 0xffe066), 0.85, 0, 0.4, 2.4));
  room.add(fg);

  scene.add(room);
  return {
    room,
    fg,
    screenCanvas,
    screenTex,
    update(t) {
      animated.forEach((a) => a.userData.update?.(t));
    },
  };
}

export function buildLights(scene) {
  // Cool ambient from the night window, warm pools from lamps and string lights
  scene.add(new THREE.HemisphereLight(0x9a8be8, 0x6a4a3a, 1.35));
  const key = new THREE.DirectionalLight(0xffe2c0, 1.5);
  key.position.set(-3, 7, 6);
  key.target.position.set(0, 1, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -7;
  key.shadow.camera.right = 7;
  key.shadow.camera.top = 7;
  key.shadow.camera.bottom = -7;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 25;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  scene.add(key, key.target);

  const rim = new THREE.DirectionalLight(0x7aa2ff, 0.7);
  rim.position.set(2, 4, -4);
  scene.add(rim);

  const lamp = new THREE.PointLight(0xffa94d, 16, 10, 1.5);
  lamp.position.set(4.0, 2.3, -2.2);
  scene.add(lamp);
  const warmL = new THREE.PointLight(0xff8fa3, 7, 9, 1.6);
  warmL.position.set(-2.5, 5.0, -1.5);
  scene.add(warmL);
  const fill = new THREE.PointLight(0xfff0dd, 9, 16, 1.6);
  fill.position.set(0, 3.4, 4.5);
  scene.add(fill);
  const spot = new THREE.SpotLight(0xfff3e0, 60, 14, 0.6, 0.6, 1.4);
  spot.position.set(0, 6.5, 6);
  spot.target.position.set(0, 1, 0.4);
  scene.add(spot, spot.target);
}
