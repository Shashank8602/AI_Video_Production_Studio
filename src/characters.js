import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const flat = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.7, metalness: 0.05, ...opts });
const smooth = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.15, ...opts });
const basic = (color) => new THREE.MeshBasicMaterial({ color });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat);

// Expression presets shared by both characters (moods match the voice moods).
// brow: [left, right] lift; tilt: [left, right] (positive = outer end up, negative = inner end up)
// eye: vertical eye scale; blush / glow: 0..1.5 intensity
const EXPR = {
  neutral:  { brow: [0, 0],        tilt: [0, 0],         eye: 1.0,  blush: 0.15, glow: 0.5 },
  excited:  { brow: [0.1, 0.1],    tilt: [-0.1, -0.1],   eye: 1.15, blush: 0.95, glow: 1.6 },
  wowed:    { brow: [0.17, 0.17],  tilt: [0, 0],         eye: 1.3,  blush: 0.6,  glow: 1.3 },
  confused: { brow: [0.12, -0.03], tilt: [-0.2, 0.25],   eye: 0.9,  blush: 0.2,  glow: 0.4 },
  doubtful: { brow: [0.13, -0.04], tilt: [0.1, 0.3],     eye: 0.75, blush: 0.1,  glow: 0.3 },
  thinking: { brow: [0.05, 0.0],   tilt: [-0.1, 0],      eye: 0.9,  blush: 0.1,  glow: 0.6 },
  sincere:  { brow: [0.04, 0.04],  tilt: [-0.25, -0.25], eye: 1.05, blush: 0.6,  glow: 1.0 },
  deadpan:  { brow: [-0.02, -0.02], tilt: [0, 0],        eye: 0.7,  blush: 0.0,  glow: 0.3 },
};
const expr = (e) => EXPR[e] || EXPR.neutral;
const HIGH_ENERGY = new Set(['excited', 'wowed']);

// ---------------------------------------------------------------------------------------------
// Zib: small round teal alien. Faces +z. Poses: 'stand' | 'sit' | 'lie'.
// The outer group carries the pose transform; the inner rig carries the idle animation.
// ---------------------------------------------------------------------------------------------
export function buildZib() {
  const g = new THREE.Group();
  const rig = new THREE.Group();
  g.add(rig);

  const teal = 0x4fd1b8;
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 1), flat(teal));
  body.scale.set(1, 1.05, 0.95);
  body.position.y = 0.95;
  rig.add(body);

  const belly = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), flat(0xb8f2e4));
  belly.position.set(0, 0.85, 0.4);
  belly.scale.set(1, 1, 0.5);
  rig.add(belly);

  // Glowing markings: spots on the head dome and sides that light up with excitement
  const spots = [];
  const spotMat = flat(0xffe066, { emissive: 0xffc233, emissiveIntensity: 0.5 });
  const spotDefs = [ // [azimuth deg, elevation deg] on the upper dome, above the brows
    [-48, 56], [-24, 66], [0, 73], [24, 66], [48, 56], [-66, 44], [66, 44],
  ];
  spotDefs.forEach(([az, el], i) => {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045 + (i % 3) * 0.008, 0), spotMat);
    const A = THREE.MathUtils.degToRad(az);
    const E = THREE.MathUtils.degToRad(el);
    s.position.set(0.76 * Math.cos(E) * Math.sin(A), 0.95 + 0.8 * Math.sin(E), 0.72 * Math.cos(E) * Math.cos(A));
    rig.add(s);
    spots.push(s);
  });

  // Eyes with eyebrows
  const eyes = [];
  const brows = [];
  for (const side of [-1, 1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), basic(0xffffff));
    white.position.set(side * 0.28, 1.2, 0.58);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), basic(0x14213d));
    pupil.position.set(0, 0, 0.17);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), basic(0xffffff));
    shine.position.set(0.035, 0.035, 0.1);
    pupil.add(shine);
    white.add(pupil);
    rig.add(white);
    eyes.push({ white, pupil });

    const brow = rbox(0.24, 0.055, 0.05, 0.02, basic(0x1d3557));
    brow.position.set(side * 0.29, 1.47, 0.62);
    rig.add(brow);
    brows.push({ brow, baseY: 1.47, side });
  }

  // Cheeks (blush)
  const cheeks = [];
  for (const side of [-1, 1]) {
    const m = new THREE.MeshBasicMaterial({ color: 0xff7aa2, transparent: true, opacity: 0.2 });
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), m);
    c.scale.set(1.2, 0.7, 0.3);
    c.position.set(side * 0.5, 0.95, 0.56);
    c.rotation.y = side * 0.5;
    rig.add(c);
    cheeks.push(m);
  }

  // Mouth (scaled by openness)
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), basic(0x3a0f1f));
  mouth.position.set(0, 0.78, 0.66);
  mouth.scale.set(1, 0.15, 0.4);
  rig.add(mouth);

  // Antennae
  const antennae = [];
  for (const side of [-1, 1]) {
    const a = new THREE.Group();
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 5), flat(0x2a9d8f));
    stalk.position.y = 0.35;
    const tip = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), flat(0xffd166, { emissive: 0xffa500, emissiveIntensity: 0.6 }));
    tip.position.y = 0.75;
    a.add(stalk, tip);
    a.position.set(side * 0.35, 1.7, 0);
    a.rotation.z = -side * 0.35;
    rig.add(a);
    antennae.push({ a, tip });
  }

  // Stubby arms: shoulder pivots that can wave, point, and clap
  const arms = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.4, 6), flat(0x3cbba3));
    upper.position.y = -0.2;
    const hand = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 1), flat(0x5fe0c7));
    hand.position.y = -0.46;
    for (const f of [-1, 0, 1]) {
      const fin = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 0), flat(0x5fe0c7));
      fin.position.set(f * 0.07, -0.58, 0.04);
      arm.add(fin);
    }
    arm.add(upper, hand);
    arm.position.set(side * 0.7, 1.0, 0.12);
    rig.add(arm);
    arms.push({ arm, side });
  }

  // Feet
  const feet = [];
  for (const side of [-1, 1]) {
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), flat(0x2a9d8f));
    foot.scale.set(1, 0.5, 1.2);
    foot.position.set(side * 0.3, 0.1, 0.1);
    rig.add(foot);
    feet.push(foot);
  }

  let pose = 'stand';
  return {
    object: g,
    rig,
    setPose(p) {
      pose = p;
      feet.forEach((f, i) => {
        const side = i === 0 ? -1 : 1;
        if (p === 'sit') f.position.set(side * 0.38, 0.2, 0.75);
        else f.position.set(side * 0.3, 0.1, 0.1);
      });
    },
    update(t, { mouth: m = 0, emotion = 'neutral', talking = false } = {}) {
      const x = expr(emotion);
      const hi = HIGH_ENERGY.has(emotion);
      const still = pose === 'lie';
      rig.position.y = still ? 0 : hi ? Math.abs(Math.sin(t * 7)) * (pose === 'sit' ? 0.05 : 0.1) : Math.sin(t * 1.8) * 0.02;
      mouth.scale.set(emotion === 'wowed' ? 0.8 : 1, 0.15 + m * (emotion === 'wowed' ? 1.3 : 0.9), 0.4);

      antennae.forEach(({ a, tip }, i) => {
        const side = i === 0 ? -1 : 1;
        a.rotation.z = -side * 0.35 + Math.sin(t * (hi ? 9 : 2.4) + i) * (hi ? 0.35 : 0.12);
        tip.material.emissiveIntensity = 0.4 + x.glow * 0.6;
      });
      spotMat.emissiveIntensity = x.glow * (0.75 + 0.25 * Math.sin(t * (hi ? 8 : 2)));
      cheeks.forEach((c) => (c.opacity = Math.min(x.blush, 1) * 0.85 + 0.1));

      const blink = (t % 3.5) > 3.38 ? 0.1 : 1;
      eyes.forEach(({ white, pupil }) => {
        white.scale.y = x.eye * blink;
        pupil.position.x = emotion === 'thinking' ? 0.06 : 0;
        pupil.position.y = emotion === 'thinking' ? 0.07 : 0;
      });
      brows.forEach(({ brow, baseY, side }, i) => {
        brow.position.y = baseY + x.brow[i] * 0.55;
        brow.rotation.z = side * x.tilt[i];
      });

      // Arms: wave when excited, shrug when doubtful, small gestures while talking
      arms.forEach(({ arm, side }, i) => {
        let a = 0.35 + Math.sin(t * 1.5 + i) * 0.04;
        let fwd = 0;
        if (hi) {
          a = 2.3 + Math.sin(t * 9 + i * 1.5) * 0.35;
        } else if (emotion === 'wowed') {
          a = 1.2;
        } else if (emotion === 'doubtful' || emotion === 'confused') {
          a = 0.9 + Math.sin(t * 2 + i) * 0.1;
          fwd = 0.35;
        } else if (emotion === 'thinking' && side === 1) {
          a = 1.0;
          fwd = 1.2; // hand toward face
        } else if (talking) {
          a = 0.6 + Math.sin(t * 3.2 + i * 2) * 0.25;
        }
        arm.rotation.z = side * a;
        arm.rotation.x = -fwd;
      });
      rig.rotation.z = (emotion === 'confused' ? 0.1 : 0) + (talking ? Math.sin(t * 3) * 0.015 : 0);
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Bolt: the original boxy grey robot (visor face, chest panel, antenna), now with expressions:
// eyebrow bars, eye shapes, mouth shapes, head tilts and arm gestures. Faces +z.
// Poses: 'stand' | 'sit'.
// ---------------------------------------------------------------------------------------------
export function buildBolt() {
  const g = new THREE.Group();
  const rig = new THREE.Group(); // idle animation
  g.add(rig);
  const upper = new THREE.Group(); // torso, head, arms (lowered/raised by pose)
  rig.add(upper);

  const steel = 0x9aa5bd;
  const dark = 0x3d4455;

  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 0.8), flat(steel));
  torso.position.y = 1.0;
  upper.add(torso);
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.05), flat(0xff8c42, { emissive: 0xff6a13, emissiveIntensity: 0.7 }));
  chest.position.set(0, 1.0, 0.42);
  upper.add(chest);

  const head = new THREE.Group();
  head.position.y = 1.95;
  const skull = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.8), flat(steel));
  head.add(skull);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.5, 0.05), flat(0x0b1020));
  visor.position.set(0, 0.02, 0.42);
  head.add(visor);

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x57e3ff });
  const eyes = [];
  const brows = [];
  for (const side of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.03), eyeMat);
    e.position.set(side * 0.2, 0.07, 0.45);
    head.add(e);
    eyes.push(e);
    // Thin eyebrow bars on the visor
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.045, 0.03), eyeMat);
    brow.position.set(side * 0.2, 0.2, 0.45);
    head.add(brow);
    brows.push({ brow, baseY: 0.2, side });
  }
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.03), eyeMat);
  mouth.position.set(0, -0.15, 0.45);
  head.add(mouth);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 5), flat(dark));
  antenna.position.y = 0.6;
  const bulb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), flat(0xff8c42, { emissive: 0xff6a13, emissiveIntensity: 0.9 }));
  bulb.position.y = 0.85;
  head.add(antenna, bulb);
  upper.add(head);

  const arms = [];
  const legs = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    const limb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.8, 0.22), flat(dark));
    limb.position.y = -0.4;
    arm.add(limb);
    arm.position.set(side * 0.7, 1.5, 0);
    upper.add(arm);
    arms.push({ arm, side });

    const leg = new THREE.Group(); // pivots at the hip
    const lm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.35), flat(dark));
    lm.position.y = -0.22;
    leg.add(lm);
    leg.position.set(side * 0.28, 0.45, 0);
    rig.add(leg);
    legs.push(leg);
  }

  let pose = 'stand';
  return {
    object: g,
    rig,
    setPose(p) {
      pose = p;
      const sit = p === 'sit';
      upper.position.y = sit ? 0.4 : 0; // torso sits on the stool
      legs.forEach((l) => {
        l.position.y = sit ? 0.85 : 0.45;
        l.rotation.x = sit ? -Math.PI / 2 : 0; // thighs forward
      });
    },
    update(t, { mouth: m = 0, emotion = 'neutral', talking = false } = {}) {
      const x = expr(emotion);
      head.rotation.z = Math.sin(t * 0.7) * 0.03 + (emotion === 'doubtful' || emotion === 'confused' ? 0.14 : 0);
      head.rotation.y = Math.sin(t * 0.5) * 0.05 + (emotion === 'thinking' ? 0.18 : 0);
      head.rotation.x = emotion === 'sincere' ? 0.08 : emotion === 'wowed' ? -0.08 : 0;

      // Eyes: height by mood, blink, and a squint for deadpan / doubtful
      const blink = (t % 4.2) > 4.1 ? 0.1 : 1;
      eyes.forEach((e) => {
        e.scale.y = Math.min(x.eye, 1.1) * blink;
        e.scale.x = emotion === 'wowed' ? 1.15 : emotion === 'sincere' ? 1.0 : 1;
        e.position.x = (e === eyes[0] ? -0.2 : 0.2) + (emotion === 'thinking' ? 0.04 : 0);
        e.position.y = 0.07 + (emotion === 'thinking' ? 0.03 : 0);
      });
      brows.forEach(({ brow, baseY, side }, i) => {
        brow.position.y = baseY + Math.min(x.brow[i] * 0.4, 0.045);
        brow.rotation.z = side * x.tilt[i] * 1.3;
      });

      // Mouth: opens with speech; wider for sincere, flat for deadpan, skewed for doubtful
      const wide = emotion === 'sincere' ? 1.2 : emotion === 'deadpan' ? 0.8 : 1;
      mouth.scale.set(wide * (1 + m * 0.15), 1 + m * 1.8, 1);
      mouth.rotation.z = emotion === 'doubtful' ? 0.18 : emotion === 'confused' ? -0.12 : emotion === 'excited' ? 0 : 0;
      mouth.position.y = -0.15;

      // Arms: small gestures while talking; hand on chest when sincere; open-palm shrug when doubtful
      arms.forEach(({ arm, side }, i) => {
        let ax = talking ? Math.sin(t * 2.2 + i * 2) * 0.14 : 0;
        let az = side * 0.05;
        if (emotion === 'sincere') { ax = -0.5; az = side * 0.2; }
        if (emotion === 'doubtful' && side === 1) { ax = -0.7; az = 0.4; }
        if (emotion === 'wowed' || emotion === 'excited') { ax = -0.3 + Math.sin(t * 5 + i) * 0.1; az = side * 0.5; }
        if (emotion === 'thinking' && side === 1) { ax = -1.3; az = 0.1; }
        arm.rotation.x = ax;
        arm.rotation.z = az;
      });
      bulb.material.emissiveIntensity = 0.5 + 0.5 * Math.sin(t * 3) * (0.4 + x.glow * 0.4);
      chest.material.emissiveIntensity = 0.5 + x.glow * 0.3 + 0.2 * Math.sin(t * 2);
      rig.position.y = pose === 'stand' ? Math.sin(t * 1.4) * 0.01 : 0;
    },
  };
}
