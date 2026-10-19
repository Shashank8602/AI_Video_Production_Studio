import * as THREE from 'three';

export const mat = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0, ...opts });
const glow = (color, k = 1) => mat(color, { emissive: color, emissiveIntensity: k });
const glass = (color, opacity = 0.35) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, transparent: true, opacity, roughness: 0.2 });

function put(parent, mesh, x = 0, y = 0, z = 0) {
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}
const box = (w, h, d, color, opts) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
const cyl = (rt, rb, h, seg, color, opts) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color, opts));
const ico = (r, color, detail = 1, opts) => new THREE.Mesh(new THREE.IcosahedronGeometry(r, detail), mat(color, opts));

// ---- Cozy ----
export function plant(scale = 1, leaves = 7, leafColor = 0x3fb36a, potColor = 0xd9694a) {
  const g = new THREE.Group();
  put(g, cyl(0.28, 0.22, 0.4, 7, potColor), 0, 0.2, 0);
  put(g, cyl(0.26, 0.26, 0.04, 7, 0x3b2a20), 0, 0.41, 0);
  for (let i = 0; i < leaves; i++) {
    const a = (i / leaves) * Math.PI * 2;
    const h = 0.7 + (i % 3) * 0.25;
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.13, h, 4), mat(i % 2 ? leafColor : 0x2f9a58));
    leaf.position.set(Math.cos(a) * 0.12, 0.4 + h / 2, Math.sin(a) * 0.12);
    leaf.rotation.set(Math.sin(a) * 0.45, 0, -Math.cos(a) * 0.45);
    g.add(leaf);
  }
  g.scale.setScalar(scale);
  return g;
}

export function succulent(color = 0x7bd88f, potColor = 0xf2c14e) {
  const g = new THREE.Group();
  put(g, cyl(0.12, 0.09, 0.14, 6, potColor), 0, 0.07, 0);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const p = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 4), mat(color));
    p.position.set(Math.cos(a) * 0.06, 0.24, Math.sin(a) * 0.06);
    p.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7);
    g.add(p);
  }
  put(g, ico(0.06, 0xb8f2c8), 0, 0.22, 0);
  return g;
}

export function mug(color = 0xf25f5c) {
  const g = new THREE.Group();
  put(g, cyl(0.1, 0.09, 0.18, 8, color), 0, 0.09, 0);
  put(g, new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.016, 5, 8), mat(color)), 0.115, 0.09, 0);
  put(g, cyl(0.085, 0.085, 0.01, 8, 0x3b2a20), 0, 0.175, 0);
  return g;
}

export function bookStack(colors = [0xe4572e, 0x29a0b1, 0xf3c13a, 0x7d5ba6]) {
  const g = new THREE.Group();
  let y = 0;
  colors.forEach((c, i) => {
    const h = 0.09 + (i % 2) * 0.03;
    const b = put(g, box(0.5 - i * 0.04, h, 0.36, c), 0, y + h / 2, 0);
    b.rotation.y = (i - 1.5) * 0.18;
    y += h;
  });
  return g;
}

export function beanbag(color = 0xe85d75) {
  const g = new THREE.Group();
  const body = put(g, ico(0.85, color, 1), 0, 0.42, 0);
  body.scale.set(1.1, 0.62, 1.1);
  const top = put(g, ico(0.5, 0xf08a9b, 1), 0, 0.55, 0.05);
  top.scale.set(1, 0.5, 1);
  return g;
}

export function stool(color = 0xf4a259) {
  const g = new THREE.Group();
  put(g, cyl(0.5, 0.5, 0.12, 10, color), 0, 0.78, 0);
  for (const a of [0, 2.1, 4.2]) {
    const l = put(g, cyl(0.045, 0.06, 0.78, 5, 0x5b3a29), Math.cos(a) * 0.32, 0.39, Math.sin(a) * 0.32);
    l.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12);
  }
  return g;
}

export function cushion(color) {
  const c = box(0.5, 0.42, 0.14, color);
  c.rotation.set(-0.3, 0.2, 0.1);
  return c;
}

// ---- Space ----
export function ufo() {
  const g = new THREE.Group();
  const saucer = put(g, ico(0.5, 0xb5bccb, 1), 0, 0.2, 0);
  saucer.scale.set(1, 0.28, 1);
  put(g, new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), glass(0x7ef9ff, 0.75)), 0, 0.28, 0);
  put(g, ico(0.07, 0x7bd88f), 0, 0.3, 0);
  const lights = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const l = put(g, ico(0.045, i % 2 ? 0xffe066 : 0xff6b9d, 0, { emissive: i % 2 ? 0xffe066 : 0xff6b9d, emissiveIntensity: 1.2 }), Math.cos(a) * 0.42, 0.17, Math.sin(a) * 0.42);
    lights.push(l);
  }
  const beam = put(g, new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0x7ef9ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false })), 0, -0.25, 0);
  const light = new THREE.PointLight(0x7ef9ff, 3.5, 3.5, 1.8);
  light.position.set(0, -0.1, 0);
  g.add(light);
  g.userData.update = (t) => {
    g.position.y = (g.userData.baseY ?? 0) + Math.sin(t * 1.6) * 0.04;
    g.rotation.y = t * 0.6;
    lights.forEach((l, i) => (l.material.emissiveIntensity = 0.7 + 0.6 * Math.abs(Math.sin(t * 3 + i))));
  };
  return g;
}

export function rocket() {
  const g = new THREE.Group();
  put(g, cyl(0.12, 0.14, 0.6, 8, 0xf5f5f5), 0, 0.5, 0);
  put(g, new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 8), mat(0xef476f)), 0, 0.92, 0);
  put(g, ico(0.055, 0x4cc9f0), 0, 0.58, 0.12);
  for (const a of [0, 2.09, 4.19]) {
    const f = put(g, box(0.04, 0.22, 0.16, 0xef476f), Math.cos(a) * 0.15, 0.3, Math.sin(a) * 0.15);
    f.rotation.y = -a;
  }
  put(g, new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 6), glow(0xffb703, 1.4)), 0, 0.12, 0).rotation.x = Math.PI;
  return g;
}

export function planet(r, color, ring = false, ringColor = 0xf2d49b) {
  const g = new THREE.Group();
  put(g, ico(r, color, 1), 0, 0, 0);
  if (ring) {
    const t = put(g, new THREE.Mesh(new THREE.TorusGeometry(r * 1.6, r * 0.08, 4, 14), mat(ringColor)), 0, 0, 0);
    t.rotation.x = Math.PI / 2.6;
    t.scale.z = 0.3;
  }
  return g;
}

// Hanging planet mobile; strings go up out of frame.
export function planetMobile() {
  const g = new THREE.Group();
  const defs = [
    { x: 0, h: 1.8, r: 0.28, c: 0xff7b54, ring: false },
    { x: 0.7, h: 2.6, r: 0.2, c: 0x4cc9f0, ring: false },
    { x: -0.6, h: 3.3, r: 0.22, c: 0xf2c14e, ring: true },
    { x: 0.2, h: 4.2, r: 0.15, c: 0xb388eb, ring: false },
  ];
  defs.forEach((d, i) => {
    const p = planet(d.r, d.c, d.ring);
    put(g, p, d.x, -d.h, i * 0.1);
    put(g, cyl(0.008, 0.008, d.h + 6, 3, 0xdddddd), d.x, -d.h + (d.h + 6) / 2, i * 0.1);
  });
  return g;
}

// ---- Science ----
export function globe() {
  const g = new THREE.Group();
  put(g, cyl(0.2, 0.24, 0.05, 8, 0x5b3a29), 0, 0.03, 0);
  put(g, cyl(0.02, 0.02, 0.22, 5, 0x5b3a29), 0, 0.17, 0);
  const s = put(g, ico(0.22, 0x2a7de1, 1), 0, 0.42, 0);
  s.rotation.z = 0.4;
  put(g, ico(0.12, 0x4cc36a, 0), 0.1, 0.45, 0.12);
  put(g, ico(0.09, 0x4cc36a, 0), -0.12, 0.38, -0.1);
  const ring = put(g, new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.012, 4, 16), mat(0xd9b44a)), 0, 0.42, 0);
  ring.rotation.set(Math.PI / 2 - 0.4, 0, 0);
  return g;
}

export function atomModel() {
  const g = new THREE.Group();
  put(g, ico(0.07, 0xff6b6b), 0, 0, 0);
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.01, 4, 20), mat(0x9bdcff));
    r.rotation.set((i * Math.PI) / 3, (i * Math.PI) / 5, 0);
    g.add(r);
    const e = put(r, ico(0.035, 0xffe066, 0, { emissive: 0xffe066, emissiveIntensity: 1 }), 0.22, 0, 0);
    rings.push({ r, e });
  }
  g.userData.update = (t) => rings.forEach(({ r }, i) => (r.rotation.z = t * (0.8 + i * 0.3)));
  return g;
}

export function beaker(liquid = 0x7cff6b, h = 0.3) {
  const g = new THREE.Group();
  put(g, new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, h, 8, 1, true), glass(0xd6f2ff, 0.3)), 0, h / 2, 0);
  put(g, cyl(0.095, 0.095, h * 0.6, 8, liquid, { emissive: liquid, emissiveIntensity: 0.5 }), 0, h * 0.3, 0);
  return g;
}

export function microscope() {
  const g = new THREE.Group();
  put(g, box(0.4, 0.05, 0.3, 0x2f3e46), 0, 0.03, 0);
  const arm = put(g, box(0.07, 0.5, 0.07, 0x2f3e46), -0.08, 0.28, -0.05);
  arm.rotation.z = -0.1;
  const tube = put(g, cyl(0.04, 0.04, 0.34, 6, 0xcad2c5), 0.02, 0.4, 0.02);
  tube.rotation.z = 0.35;
  put(g, cyl(0.03, 0.03, 0.1, 6, 0x84a98c), 0.12, 0.22, 0.02);
  put(g, box(0.22, 0.02, 0.18, 0x52796f), 0.08, 0.14, 0.02);
  return g;
}

export function dnaHelix() {
  const g = new THREE.Group();
  put(g, cyl(0.12, 0.15, 0.04, 8, 0x2f3e46), 0, 0.02, 0);
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a = i * 0.55;
    const y = 0.1 + i * 0.045;
    put(g, ico(0.03, 0xff6b9d, 0), Math.cos(a) * 0.09, y, Math.sin(a) * 0.09);
    put(g, ico(0.03, 0x4cc9f0, 0), -Math.cos(a) * 0.09, y, -Math.sin(a) * 0.09);
    if (i % 2 === 0) {
      const rung = put(g, cyl(0.007, 0.007, 0.18, 3, 0xf5f5f5), 0, y, 0);
      rung.rotation.set(0, 0, Math.PI / 2);
      rung.rotation.y = -a;
      rung.rotation.order = 'YXZ';
    }
  }
  return g;
}

// ---- Tech and AI ----
export function crtComputer(textureCanvas) {
  const g = new THREE.Group();
  put(g, box(0.62, 0.52, 0.5, 0xe8dcc5), 0, 0.3, 0);
  put(g, box(0.5, 0.4, 0.04, 0x1a1c2c), 0, 0.31, 0.26);
  const tex = new THREE.CanvasTexture(textureCanvas);
  const scr = put(g, new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.34), new THREE.MeshBasicMaterial({ map: tex })), 0, 0.31, 0.285);
  put(g, box(0.5, 0.025, 0.2, 0xd8cbb0), 0, 0.012, 0.42);
  put(g, box(0.2, 0.05, 0.2, 0xe8dcc5), 0, 0.03, 0);
  g.userData.tex = tex;
  g.userData.screen = scr;
  return g;
}

export function toyRobot(color = 0xff9f1c) {
  const g = new THREE.Group();
  put(g, box(0.16, 0.18, 0.12, color), 0, 0.2, 0);
  put(g, box(0.14, 0.12, 0.11, 0xcfd8dc), 0, 0.35, 0);
  put(g, box(0.1, 0.03, 0.02, 0x57e3ff, { emissive: 0x57e3ff, emissiveIntensity: 1 }), 0, 0.36, 0.06);
  put(g, cyl(0.008, 0.008, 0.08, 4, 0x455a64), 0, 0.45, 0);
  put(g, ico(0.018, 0xff4d6d, 0), 0, 0.5, 0);
  for (const s of [-1, 1]) {
    put(g, box(0.04, 0.12, 0.04, 0x455a64), s * 0.11, 0.2, 0);
    put(g, box(0.05, 0.1, 0.05, 0x455a64), s * 0.04, 0.05, 0);
  }
  return g;
}

export function monitor(canvas, w = 0.9, h = 0.55) {
  const g = new THREE.Group();
  put(g, box(w + 0.08, h + 0.08, 0.06, 0x14151f), 0, h / 2 + 0.2, 0);
  const tex = new THREE.CanvasTexture(canvas);
  put(g, new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex })), 0, h / 2 + 0.2, 0.035);
  put(g, box(0.06, 0.2, 0.06, 0x14151f), 0, 0.1, -0.02);
  put(g, box(0.3, 0.03, 0.2, 0x14151f), 0, 0.015, 0);
  g.userData.tex = tex;
  return g;
}

// ---- Wall decor ----
export function poster(w, h, draw, frame = 0xfff4d6) {
  const g = new THREE.Group();
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = Math.round((256 * h) / w);
  draw(c.getContext('2d'), c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  put(g, box(w + 0.08, h + 0.08, 0.04, frame), 0, 0, 0);
  put(g, new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex })), 0, 0, 0.025);
  return g;
}

export const posterArt = {
  starMap(ctx, w, h) {
    ctx.fillStyle = '#10153d';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 2;
    const pts = [[40, 50], [90, 90], [140, 70], [190, 130], [150, 190], [80, 170], [60, 240]];
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.fillStyle = '#fff';
    pts.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); });
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath(); ctx.arc(200, 40, 18, 0, 7); ctx.fill();
    ctx.fillStyle = '#9bdcff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('STAR MAP', 60, h - 14);
  },
  circuit(ctx, w, h) {
    ctx.fillStyle = '#0c3b2e';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#5eead4';
    ctx.lineWidth = 3;
    for (let i = 0; i < 9; i++) {
      const x = 20 + i * 26;
      ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, 60 + (i % 3) * 30); ctx.lineTo(x + 26 * ((i % 2) ? 1 : -1), 100 + (i % 4) * 25); ctx.lineTo(x, h - 10); ctx.stroke();
      ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(x, 60 + (i % 3) * 30, 5, 0, 7); ctx.fill();
    }
  },
  formula(ctx, w, h) {
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 44px serif';
    ctx.textAlign = 'center';
    ctx.fillText('E = mc²', w / 2, h / 2);
    ctx.font = '18px sans-serif';
    ctx.fillText('WHY THOUGH?', w / 2, h - 18);
  },
  rocket(ctx, w, h) {
    ctx.fillStyle = '#ef476f';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(w / 2, 30); ctx.lineTo(w / 2 + 30, 130); ctx.lineTo(w / 2 - 30, 130); ctx.fill();
    ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.moveTo(w / 2 - 14, 130); ctx.lineTo(w / 2, 190); ctx.lineTo(w / 2 + 14, 130); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('TO THE MOON', w / 2, h - 16);
  },
};

export function stringLights(x0, x1, y, z, count = 22, sag = 0.45) {
  const g = new THREE.Group();
  const colors = [0xffd166, 0xff6b9d, 0x7ef9ff, 0xb8f27b, 0xffa94d];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const x = x0 + (x1 - x0) * t;
    const yy = y - Math.sin(t * Math.PI) * sag;
    const c = colors[i % colors.length];
    put(g, ico(0.045, c, 0, { emissive: c, emissiveIntensity: 1.4 }), x, yy, z);
    if (i) put(g, cyl(0.006, 0.006, (x1 - x0) / count + 0.02, 3, 0x222222), x - (x1 - x0) / count / 2, yy + 0.02, z).rotation.z = Math.PI / 2;
  }
  return g;
}

export function codeCanvas(lines = 8) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 192;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#071a12';
  ctx.fillRect(0, 0, 256, 192);
  ctx.fillStyle = '#5eead4';
  ctx.font = '14px monospace';
  const txt = ['> why_though.run()', 'loading universe...', '[#######   ] 70%', 'stars: 1e24', 'age: 13.8 Gyr', '> ask("why?")', 'answer: finite age', '> _'];
  for (let i = 0; i < lines; i++) ctx.fillText(txt[i % txt.length], 12, 24 + i * 20);
  return c;
}
