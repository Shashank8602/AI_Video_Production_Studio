import * as THREE from 'three';

const flat = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.7, metalness: 0.05, ...opts });
const basic = (color) => new THREE.MeshBasicMaterial({ color });

// Zib: small round teal alien with antennae. Faces +z; the scene positions/rotates it.
export function buildZib() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 1), flat(0x4fd1b8));
  body.scale.set(1, 1.05, 0.95);
  body.position.y = 0.95;
  g.add(body);

  const belly = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), flat(0xb8f2e4));
  belly.position.set(0, 0.85, 0.4);
  belly.scale.set(1, 1, 0.5);
  g.add(belly);

  // Eyes
  const eyes = [];
  for (const side of [-1, 1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), basic(0xffffff));
    white.position.set(side * 0.28, 1.2, 0.58);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), basic(0x14213d));
    pupil.position.set(0, 0, 0.17);
    white.add(pupil);
    g.add(white);
    eyes.push(white);
  }

  // Mouth (scaled by openness)
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), basic(0x3a0f1f));
  mouth.position.set(0, 0.78, 0.66);
  mouth.scale.set(1, 0.15, 0.4);
  g.add(mouth);

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
    g.add(a);
    antennae.push(a);
  }

  // Feet
  for (const side of [-1, 1]) {
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), flat(0x2a9d8f));
    foot.scale.set(1, 0.5, 1.2);
    foot.position.set(side * 0.3, 0.1, 0.1);
    g.add(foot);
  }

  const baseY = g.position.y;
  return {
    object: g,
    height: 2.0,
    // t seconds; mouth 0..1; emotion: 'neutral' | 'excited' | 'confused'
    update(t, { mouth: m = 0, emotion = 'neutral', talking = false } = {}) {
      const bounce = emotion === 'excited' ? Math.abs(Math.sin(t * 7)) * 0.1 : Math.sin(t * 1.8) * 0.02;
      g.position.y = baseY + bounce;
      mouth.scale.y = 0.15 + m * 0.9;
      const wob = emotion === 'excited' ? 0.35 : 0.12;
      antennae.forEach((a, i) => {
        const side = i === 0 ? -1 : 1;
        a.rotation.z = -side * 0.35 + Math.sin(t * (emotion === 'excited' ? 9 : 2.4) + i) * wob;
      });
      // Blink every ~3.5s
      const blink = (t % 3.5) > 3.38 ? 0.1 : 1;
      eyes.forEach((e) => (e.scale.y = emotion === 'confused' ? 0.7 : blink));
      body.rotation.z = emotion === 'confused' ? 0.1 : 0;
      g.rotation.z = talking ? Math.sin(t * 3) * 0.015 : 0;
    },
  };
}

// Bolt: boxy grey robot with a visor display. Faces +z.
export function buildBolt() {
  const g = new THREE.Group();
  const steel = 0x8a93a6;
  const dark = 0x3d4455;

  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 0.8), flat(steel));
  torso.position.y = 1.0;
  g.add(torso);
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.05), flat(0xff8c42, { emissive: 0xff6a13, emissiveIntensity: 0.7 }));
  chest.position.set(0, 1.0, 0.42);
  g.add(chest);

  const head = new THREE.Group();
  head.position.y = 1.95;
  const skull = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.8), flat(steel));
  head.add(skull);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.5, 0.05), flat(0x0b1020));
  visor.position.set(0, 0.02, 0.42);
  head.add(visor);

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x57e3ff });
  const eyes = [];
  for (const side of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.03), eyeMat);
    e.position.set(side * 0.2, 0.08, 0.45);
    head.add(e);
    eyes.push(e);
  }
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.03), eyeMat);
  mouth.position.set(0, -0.14, 0.45);
  head.add(mouth);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 5), flat(dark));
  antenna.position.y = 0.6;
  const bulb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), flat(0xff8c42, { emissive: 0xff6a13, emissiveIntensity: 0.9 }));
  bulb.position.y = 0.85;
  head.add(antenna, bulb);
  g.add(head);

  // Arms and legs
  const arms = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.8, 0.22), flat(dark));
    upper.position.y = -0.4;
    arm.add(upper);
    arm.position.set(side * 0.7, 1.5, 0);
    g.add(arm);
    arms.push(arm);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.35), flat(dark));
    leg.position.set(side * 0.28, 0.22, 0);
    g.add(leg);
  }

  return {
    object: g,
    height: 2.7,
    update(t, { mouth: m = 0, emotion = 'neutral', talking = false } = {}) {
      head.rotation.z = Math.sin(t * 0.7) * 0.03 + (emotion === 'confused' ? 0.15 : 0);
      head.rotation.y = Math.sin(t * 0.5) * 0.05;
      mouth.scale.set(1 + m * 0.2, 1 + m * 7, 1);
      const blink = (t % 4.2) > 4.1 ? 0.1 : emotion === 'excited' ? 1.2 : 1;
      eyes.forEach((e) => (e.scale.y = blink));
      arms.forEach((a, i) => {
        a.rotation.x = talking ? Math.sin(t * 2.2 + i * 2) * 0.12 : 0;
        a.rotation.z = (i === 0 ? 1 : -1) * 0.05;
      });
      bulb.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 3);
    },
  };
}
