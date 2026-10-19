import * as THREE from 'three';

const mat = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.9, metalness: 0, ...opts });

function box(w, h, d, color, x, y, z, opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  m.position.set(x, y, z);
  return m;
}

// One fixed low-poly night room. Origin is floor centre; back wall at z = -3.
export function buildRoom(scene) {
  const room = new THREE.Group();

  // Shell
  room.add(box(10, 0.2, 18, 0x3a2f4a, 0, -0.1, 5)); // floor
  room.add(box(10, 10, 0.2, 0x252a4a, 0, 5, -3)); // back wall
  room.add(box(0.2, 10, 18, 0x2a2f52, -5, 5, 5)); // left wall
  room.add(box(0.2, 10, 18, 0x2a2f52, 5, 5, 5)); // right wall
  
  // Rug
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.04, 12), mat(0x7a4a6a));
  rug.position.set(0, 0.02, 0.2);
  room.add(rug);

  // Window with starry sky (shifted left so the wall screen fits in the wide shot)
  const win = new THREE.Group();
  win.position.x = -0.6;
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.6), new THREE.MeshBasicMaterial({ color: 0x07091c }));
  sky.position.set(0, 3.6, -2.88);
  win.add(sky);
  const starGeo = new THREE.BufferGeometry();
  const pts = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 90; i++) pts.push((rnd() - 0.5) * 3.0, 3.6 + (rnd() - 0.5) * 2.4, -2.86);
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  win.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 })));
  const moon = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), new THREE.MeshBasicMaterial({ color: 0xfff1c9 }));
  moon.position.set(0.95, 4.35, -2.85);
  win.add(moon);
  // Window frame
  win.add(box(3.4, 0.14, 0.2, 0x6b5a4a, 0, 4.95, -2.85));
  win.add(box(3.4, 0.14, 0.2, 0x6b5a4a, 0, 2.25, -2.85));
  win.add(box(0.14, 2.8, 0.2, 0x6b5a4a, -1.65, 3.6, -2.85));
  win.add(box(0.14, 2.8, 0.2, 0x6b5a4a, 1.65, 3.6, -2.85));
  win.add(box(0.08, 2.8, 0.2, 0x6b5a4a, 0, 3.6, -2.85));

  room.add(win);

  // Wall screen / whiteboard (right of window) - topic visuals draw here
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 512;
  screenCanvas.height = 384;
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.425), new THREE.MeshBasicMaterial({ map: screenTex }));
  screen.position.set(2.2, 3.5, -2.88);
  room.add(screen);
  room.add(box(2.1, 1.65, 0.08, 0x15182a, 2.2, 3.5, -2.93));

  // Bookshelf (left)
  room.add(box(1.8, 3.2, 0.5, 0x5a3f2e, -3.6, 1.6, -2.6));
  const bookColors = [0xc2553d, 0x3d7fc2, 0xd9b44a, 0x4aa37a, 0x8a5ac2];
  for (let shelf = 0; shelf < 3; shelf++) {
    for (let i = 0; i < 6; i++) {
      room.add(box(0.2, 0.55, 0.36, bookColors[(i + shelf) % 5], -4.2 + i * 0.24, 0.55 + shelf * 1.0, -2.4));
    }
  }

  // Desk with lamp (right)
  room.add(box(2.4, 0.12, 1.0, 0x6b4a34, 3.0, 1.2, -1.9));
  room.add(box(0.12, 1.2, 0.9, 0x4a3324, 1.9, 0.6, -1.9));
  room.add(box(0.12, 1.2, 0.9, 0x4a3324, 4.1, 0.6, -1.9));
  const lampBase = box(0.4, 0.06, 0.4, 0x222222, 3.8, 1.29, -1.9);
  room.add(lampBase);
  room.add(box(0.06, 0.9, 0.06, 0x222222, 3.8, 1.75, -1.9));
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.4, 6, 1, true), mat(0xffc86b, { emissive: 0xffa535, emissiveIntensity: 0.9, side: THREE.DoubleSide }));
  lampShade.position.set(3.8, 2.3, -1.9);
  room.add(lampShade);

  // Telescope on tripod (left of window)
  const tele = new THREE.Group();
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.2, 6), mat(0xd8d8e0));
  tube.rotation.z = Math.PI / 2.8;
  tube.position.y = 1.5;
  tele.add(tube);
  for (const a of [0, 2.1, 4.2]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 4), mat(0x555566));
    leg.position.set(Math.cos(a) * 0.25, 0.7, Math.sin(a) * 0.25);
    leg.rotation.set(Math.sin(a) * 0.2, 0, -Math.cos(a) * 0.2);
    tele.add(leg);
  }
  tele.position.set(-1.9, 0, -2.1);
  room.add(tele);

  // Plant (front left) and beanbag
  room.add(box(0.5, 0.5, 0.5, 0xb5654a, -4.2, 0.25, 1.4));
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.9, 4), mat(0x3f9a5a));
    leaf.position.set(-4.2 + (i - 2) * 0.1, 0.95, 1.4 + (i % 2) * 0.08);
    leaf.rotation.z = (i - 2) * 0.28;
    room.add(leaf);
  }

  scene.add(room);
  return { room, screenCanvas, screenTex };
}

export function buildLights(scene) {
  scene.add(new THREE.HemisphereLight(0x6c7bd1, 0x2a1f3a, 0.9));
  const moonLight = new THREE.DirectionalLight(0x8fa8ff, 0.9);
  moonLight.position.set(-1, 4, 4);
  scene.add(moonLight);
  const lamp = new THREE.PointLight(0xffb45a, 14, 9, 1.6);
  lamp.position.set(3.4, 2.3, -1.3);
  scene.add(lamp);
  const fill = new THREE.PointLight(0xfff0dd, 6, 12, 1.8);
  fill.position.set(0, 3.2, 3.5);
  scene.add(fill);
}
