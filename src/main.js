import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildRoom, buildLights } from './room.js';
import { buildZib, buildBolt } from './characters.js';

const W = 1080;
const H = 1920;

const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x120d2b);
buildLights(scene);
const room = buildRoom(scene);

const zib = buildZib();
const bolt = buildBolt();
scene.add(zib.object, bolt.object);

// Shadows on everything lit; skip unlit helpers (screens, sky, light beams)
scene.traverse((o) => {
  if (o.isMesh && !(o.material instanceof THREE.MeshBasicMaterial) && !o.material.transparent) {
    o.castShadow = true;
    o.receiveShadow = true;
  }
});

const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 60);

// Depth of field + MSAA
const target = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, target);
composer.setPixelRatio(1);
composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const bokeh = new BokehPass(scene, camera, { focus: 8, aperture: 0.0025, maxblur: 0.014 });
composer.addPass(bokeh);
composer.addPass(new OutputPass());

// Poses: where each character stands / sits / lies in the room
const POSES = {
  zib: {
    stand: { x: -1.0, y: 0, z: 0.9, ry: 0.45, rz: 0 },
    sit: { x: -1.9, y: 0.4, z: 0.1, ry: 0.55, rz: 0 },
    lie: { x: -0.36, y: 0.7, z: 1.3, ry: 0, rz: 1.45 },
  },
  bolt: {
    stand: { x: 0.95, y: 0, z: -0.2, ry: -0.4, rz: 0 },
    sit: { x: 2.3, y: 0, z: 0.2, ry: -0.6, rz: 0 },
  },
};

function applyPose(char, table, name) {
  const p = table[name] || table.stand;
  char.object.position.set(p.x, p.y, p.z);
  char.object.rotation.set(0, p.ry, p.rz);
  char.setPose(table[name] ? name : 'stand');
}

const box = new THREE.Box3();
function focusOf(char) {
  char.object.updateMatrixWorld(true);
  box.setFromObject(char.object);
  const c = box.getCenter(new THREE.Vector3());
  c.y = box.min.y + (box.max.y - box.min.y) * 0.62;
  return c;
}

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// Shots are relative to wherever the characters currently are
function setShot(name, push = 0) {
  const zc = focusOf(zib);
  const bc = focusOf(bolt);
  let pos, look, fov = 36, wide = false;
  switch (name) {
    case 'zibClose':
      look = zc.clone();
      pos = zc.clone().add(V(0.7, 0.15, 4.8));
      break;
    case 'boltClose':
      look = bc.clone();
      pos = bc.clone().add(V(-0.7, 0.15, 5.2));
      break;
    case 'zibOts': // over Bolt's shoulder toward Zib
      look = zc.clone();
      pos = bc.clone().add(V(1.7, 0.7, 5.2));
      break;
    case 'boltOts': // over Zib's shoulder toward Bolt
      look = bc.clone();
      pos = zc.clone().add(V(-1.8, 0.6, 5.2));
      break;
    default: {
      wide = true;
      fov = 52;
      const mid = zc.clone().add(bc).multiplyScalar(0.5);
      const half = Math.abs(zc.x - bc.x) / 2 + 1.8;
      const dist = Math.max(10, half / (Math.tan(THREE.MathUtils.degToRad(fov / 2)) * (W / H)) + 0.5);
      look = V(mid.x, 2.1, 0.3);
      pos = V(mid.x, 2.9, 0.3 + dist);
    }
  }
  // push = 0..1 slow dolly toward the subject
  pos.lerp(look, push * 0.1);
  camera.position.copy(pos);
  camera.fov = fov;
  camera.updateProjectionMatrix();
  camera.lookAt(look);

  // Foreground pieces ride along only on the wide shot
  room.fg.visible = wide;
  if (wide) room.fg.position.set(pos.x, 0, pos.z - 4.9);

  // Focus on the subject; background and foreground go soft
  bokeh.uniforms.focus.value = pos.distanceTo(look);
  bokeh.uniforms.aperture.value = wide ? 0.0016 : 0.0028;
  bokeh.uniforms.maxblur.value = wide ? 0.010 : 0.016;
}

function drawScreen(text) {
  const ctx = room.screenCanvas.getContext('2d');
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
  room.screenTex.needsUpdate = true;
}

const state = {
  t: 0, shot: 'wide', push: 0, screen: 'WHY THOUGH?',
  zib: {}, bolt: {}, poses: { zib: 'sit', bolt: 'stand' },
};
let appliedPoses = '';

function render() {
  const key = state.poses.zib + '|' + state.poses.bolt;
  if (key !== appliedPoses) {
    applyPose(zib, POSES.zib, state.poses.zib);
    applyPose(bolt, POSES.bolt, state.poses.bolt);
    appliedPoses = key;
  }
  room.update(state.t);
  zib.update(state.t, state.zib);
  bolt.update(state.t, state.bolt);
  setShot(state.shot, state.push);
  drawScreen(state.screen);
  composer.render();
}

// API for the frame-capture script
window.__scene = {
  W,
  H,
  set(patch) {
    Object.assign(state, patch);
    render();
  },
  shots: ['wide', 'zibClose', 'boltClose', 'zibOts', 'boltOts'],
};

function fit() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  canvas.style.transform = `translate(-50%, -50%) scale(${s})`;
}
addEventListener('resize', fit);
fit();

// Live preview: cycle shots and poses when opened by a human (not during capture)
const params = new URLSearchParams(location.search);
if (!params.has('capture')) {
  const names = window.__scene.shots;
  const zibPoses = ['sit', 'stand', 'lie', 'sit'];
  const boltPoses = ['stand', 'stand', 'sit', 'stand'];
  const loop = (ms) => {
    const t = ms / 1000;
    state.t = t;
    state.shot = names[Math.floor(t / 3) % names.length];
    state.push = (t % 3) / 3;
    const cycle = Math.floor(t / 6) % 4;
    state.poses = { zib: zibPoses[cycle], bolt: boltPoses[cycle] };
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
