import * as THREE from 'three';
import { buildRoom, buildLights } from './room.js';
import { buildZib, buildBolt } from './characters.js';

const W = 1080;
const H = 1920;

const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0c1e);
buildLights(scene);
const { screenCanvas, screenTex } = buildRoom(scene);

const zib = buildZib();
zib.object.position.set(-1.05, 0, 0.6);
zib.object.rotation.y = 0.45;
scene.add(zib.object);

const bolt = buildBolt();
bolt.object.position.set(1.05, 0, 0.5);
bolt.object.rotation.y = -0.45;
bolt.object.scale.setScalar(1.0);
scene.add(bolt.object);

const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 50);

// Camera shots: [position, lookAt]
const SHOTS = {
  wide: { pos: [0, 2.7, 10.5], look: [0, 2.3, 0.3], fov: 48 },
  zibClose: { pos: [-0.2, 1.6, 5.2], look: [-1.0, 1.35, 0.6], fov: 36 },
  boltClose: { pos: [0.6, 2.2, 5.6], look: [1.0, 1.95, 0.5], fov: 36 },
  zibOts: { pos: [2.9, 2.2, 5.6], look: [-1.0, 1.3, 0.6], fov: 34 },
  boltOts: { pos: [-2.9, 2.4, 5.8], look: [1.0, 1.8, 0.5], fov: 34 },
};

function setShot(name, push = 0) {
  const s = SHOTS[name] || SHOTS.wide;
  const p = new THREE.Vector3(...s.pos);
  const l = new THREE.Vector3(...s.look);
  // push = 0..1 dolly toward the look-at point
  p.lerp(l, push * 0.12);
  camera.position.copy(p);
  camera.fov = s.fov;
  camera.updateProjectionMatrix();
  camera.lookAt(l);
}

function drawScreen(text) {
  const ctx = screenCanvas.getContext('2d');
  ctx.fillStyle = '#0d1226';
  ctx.fillRect(0, 0, 512, 384);
  ctx.strokeStyle = '#57e3ff';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 368);
  ctx.fillStyle = '#e8f6ff';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  const lines = String(text || 'WHY THOUGH?').split('\n');
  lines.forEach((ln, i) => ctx.fillText(ln, 256, 192 - (lines.length - 1) * 28 + i * 56));
  screenTex.needsUpdate = true;
}

// State used by preview and the renderer
const state = { t: 0, shot: 'wide', push: 0, zib: {}, bolt: {}, screen: 'WHY THOUGH?' };

function render() {
  setShot(state.shot, state.push);
  zib.update(state.t, state.zib);
  bolt.update(state.t, state.bolt);
  drawScreen(state.screen);
  renderer.render(scene, camera);
}

// API for the frame-capture script
window.__scene = {
  W,
  H,
  set(patch) {
    Object.assign(state, patch);
    render();
  },
  shots: Object.keys(SHOTS),
};

// Fit the 9:16 canvas to the window for live preview
function fit() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  canvas.style.transform = `translate(-50%, -50%) scale(${s})`;
}
addEventListener('resize', fit);
fit();

// Live preview: cycle shots when opened by a human (not during capture)
const params = new URLSearchParams(location.search);
if (!params.has('capture')) {
  const names = Object.keys(SHOTS);
  const loop = (ms) => {
    const t = ms / 1000;
    state.t = t;
    state.shot = names[Math.floor(t / 3) % names.length];
    state.push = (t % 3) / 3;
    const talkingZib = Math.floor(t / 2) % 2 === 0;
    state.zib = { talking: talkingZib, mouth: talkingZib ? Math.abs(Math.sin(t * 12)) : 0, emotion: talkingZib ? 'excited' : 'neutral' };
    state.bolt = { talking: !talkingZib, mouth: !talkingZib ? Math.abs(Math.sin(t * 10)) : 0 };
    render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
} else {
  render();
}
