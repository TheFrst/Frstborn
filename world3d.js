// FRSTBORN 3D renderer: turns the game state (G) into a lit 3D dungeon with a third-person camera.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { loadBase, buildCharacter, cloneActor } from "./hero3d.js";
import { MONSTERS } from "./data.js";

export const U = 0.02;            // game units → metres
const v3 = (x, y, h = 0) => new THREE.Vector3(x * U, h, y * U);
let renderer, scene, camera, composer, bloom, clock;
let level = null, heroActor = null, heroLight = null, moon = null;
const actors = new Map();         // enemy object → { actor | mesh }
const shotMeshes = new Map(), zoneMeshes = new Map(), pickupMeshes = new Map(), teleMeshes = new Map();
const monsterTpl = new Map();
let fxPoints = null, fxGeo = null, ringPool = [], textLayer = null, textEls = new Map();
export const cam = { yaw: Math.PI, pitch: 0.5, dist: 5.0, tx: 0, tz: 0, focus: null };
let ready = false, view = null;

// ---------------------------------------------------------------- setup
export async function init(container) {
  view = container;
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.prepend(renderer.domElement);
  renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environmentIntensity = 0.12;
  camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);
  scene.add(new THREE.HemisphereLight(0x8f86c9, 0x1a1428, 0.55));
  moon = new THREE.DirectionalLight(0xbfc6ff, 1.0);
  moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024);
  Object.assign(moon.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 0.5, far: 40 });
  moon.shadow.bias = -0.0005;
  scene.add(moon, moon.target);
  heroLight = new THREE.PointLight(0xffb06a, 14, 11, 1.6); heroLight.castShadow = false; scene.add(heroLight);
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.42, 0.45, 0.9);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  clock = new THREE.Clock();
  // particles
  const N = 1500;
  fxGeo = new THREE.BufferGeometry();
  fxGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  fxGeo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  fxPoints = new THREE.Points(fxGeo, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, map: dotTexture() }));
  fxPoints.frustumCulled = false; scene.add(fxPoints);
  textLayer = document.createElement("div");
  textLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:2";
  container.append(textLayer);
  resize();
  addEventListener("resize", resize);
  await loadBase();
  ready = true;
}
export function resize() {
  if (!renderer) return;
  const w = view.clientWidth || innerWidth, h = view.clientHeight || innerHeight;
  renderer.setSize(w, h, false); composer.setSize(w, h);
  camera.aspect = w / h; camera.fov = w < h ? 65 : 52; camera.updateProjectionMatrix();
}

// ---------------------------------------------------------------- textures
function dotTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,0.6)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
function stoneTexture(base, tile, seed = 1) {
  const S = 512, c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d");
  g.fillStyle = base; g.fillRect(0, 0, S, S);
  let r = seed * 9301 % 233280; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  const n = 4, s = S / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const off = y % 2 ? s / 2 : 0, l = 38 + rnd() * 22;
    g.fillStyle = `hsl(${255 + rnd() * 20}, ${12 + rnd() * 10}%, ${l * 0.35}%)`;
    g.fillRect(x * s + off + 3, y * s + 3, s - 6, s - 6);
    if (off) g.fillRect(off - s + 3, y * s + 3, s - 6, s - 6);
    for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(${rnd() < 0.5 ? "255,255,255" : "0,0,0"},${rnd() * 0.06})`; g.fillRect(x * s + rnd() * s, y * s + rnd() * s, rnd() * 18, rnd() * 18); }
    if (rnd() < 0.3) { g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1.5; g.beginPath(); let px = x * s + rnd() * s, py = y * s + rnd() * s; g.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (rnd() - 0.5) * 40; py += (rnd() - 0.5) * 40; g.lineTo(px, py); } g.stroke(); }
  }
  g.strokeStyle = tile; g.lineWidth = 6;
  for (let y = 0; y <= n; y++) { g.beginPath(); g.moveTo(0, y * s); g.lineTo(S, y * s); g.stroke(); }
  for (let y = 0; y < n; y++) for (let x = 0; x <= n; x++) { const off = y % 2 ? s / 2 : 0; g.beginPath(); g.moveTo(x * s + off, y * s); g.lineTo(x * s + off, (y + 1) * s); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function brickTexture(color) {
  const c = document.createElement("canvas"); c.width = 256; c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#0d0a14"; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 8; y++) for (let x = -1; x < 5; x++) {
    const off = y % 2 ? 32 : 0;
    const col = new THREE.Color(color).offsetHSL(0, 0, (Math.random() - 0.5) * 0.08);
    g.fillStyle = "#" + col.getHexString();
    g.fillRect(x * 64 + off + 2, y * 32 + 2, 60, 28);
    g.fillStyle = "rgba(255,255,255,0.06)"; g.fillRect(x * 64 + off + 2, y * 32 + 2, 60, 4);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------------------------------------------------------------- level
export function buildLevel(G) {
  if (level) { scene.remove(level.group); level.group.traverse(o => { o.geometry?.dispose?.(); }); }
  for (const [e, a] of actors) scene.remove(a.root || a.mesh); actors.clear();
  for (const m of [shotMeshes, zoneMeshes, pickupMeshes, teleMeshes]) { for (const [, o] of m) scene.remove(o); m.clear(); }
  const z = G.zone, m = G.map, grp = new THREE.Group();
  const W = m.w * U, H = m.h * U;
  scene.background = new THREE.Color(z.floor).multiplyScalar(0.35);
  scene.fog = new THREE.FogExp2(new THREE.Color(z.floor).multiplyScalar(0.3), 0.045);
  const ft = stoneTexture(z.tile, "#08060d", G.floor); ft.repeat.set(W / 4, H / 4);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.82, metalness: 0.05, bumpMap: ft, bumpScale: 0.6 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(W / 2, 0, H / 2); floor.receiveShadow = true; grp.add(floor);
  const bt = brickTexture(z.wall);
  const wallMat = new THREE.MeshStandardMaterial({ map: bt, roughness: 0.9, bumpMap: bt, bumpScale: 1.2 });
  const wallH = 3.2, th = 0.4;
  const wall = (x, y, w, d) => {
    const geo = new THREE.BoxGeometry(w, wallH, d);
    const mt = wallMat.clone(); mt.map = bt.clone(); mt.map.needsUpdate = true; mt.map.repeat.set(Math.max(w, d) / 2, wallH / 2); mt.bumpMap = mt.map;
    const b = new THREE.Mesh(geo, mt); b.position.set(x, wallH / 2, y); b.castShadow = b.receiveShadow = true; grp.add(b);
  };
  wall(W / 2, 0, W + th, th); wall(W / 2, H, W + th, th); wall(0, H / 2, th, H); wall(W, H / 2, th, H);
  // pillars: stone columns with a base and a capital
  const colMatBase = new THREE.MeshStandardMaterial({ map: bt, roughness: 0.85, bumpMap: bt, bumpScale: 1 });
  const pillars = [];
  for (const p of m.pillars) {
    const cx = (p.x + p.w / 2) * U, cy = (p.y + p.h / 2) * U, w = p.w * U, d = p.h * U;
    const g = new THREE.Group();
    const colMat = colMatBase.clone(); colMat.transparent = true;
    pillars.push({ g, mat: colMat, x0: p.x * U - 0.3, x1: (p.x + p.w) * U + 0.3, z0: p.y * U - 0.3, z1: (p.y + p.h) * U + 0.3, op: 1 });
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, wallH, d * 0.82), colMat); shaft.position.y = wallH / 2;
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), colMat); b1.position.y = 0.15;
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), colMat); b2.position.y = wallH - 0.15;
    for (const o of [shaft, b1, b2]) { o.castShadow = o.receiveShadow = true; g.add(o); }
    g.position.set(cx, 0, cy); grp.add(g);
  }
  // torches on the walls: a few real lights + glowing flames
  const torches = [];
  m.torches.forEach((t, i) => {
    const g = new THREE.Group();
    const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, metalness: 0.6, roughness: 0.4 }));
    bracket.rotation.x = t.y < m.h / 2 ? 0.5 : -0.5; g.add(bracket);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(z.light).multiplyScalar(2.2) }));
    flame.position.y = 0.25; flame.scale.y = 1.6; g.add(flame);
    if (i < 4) { const L = new THREE.PointLight(z.light, 6, 7, 1.8); L.position.y = 0.35; g.add(L); g.userData.light = L; }
    g.position.set(t.x * U, 2.1, (t.y < m.h / 2 ? 0.3 : H - 0.3));
    g.userData.flame = flame; grp.add(g); torches.push(g);
  });
  // floor clutter for atmosphere: bones, rubble, banners
  const rub = new THREE.MeshStandardMaterial({ color: new THREE.Color(z.wall).multiplyScalar(0.8), roughness: 1 });
  for (let i = 0; i < 40; i++) {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.05 + Math.random() * 0.12, 0), rub);
    const edge = Math.random() < 0.5;
    r.position.set(edge ? (Math.random() < 0.5 ? 0.5 + Math.random() : W - 0.5 - Math.random()) : 1 + Math.random() * (W - 2), 0.04, edge ? 1 + Math.random() * (H - 2) : (Math.random() < 0.5 ? 0.5 + Math.random() : H - 0.5 - Math.random()));
    r.rotation.set(Math.random() * 3, Math.random() * 3, 0); r.castShadow = true; grp.add(r);
  }
  for (let i = 0; i < 4; i++) {
    const ban = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.6, 1, 6), new THREE.MeshStandardMaterial({ color: ["#7f1d1d", "#1e3a8a", "#14532d", "#581c87"][i], roughness: 0.9, side: THREE.DoubleSide }));
    ban.position.set((0.2 + i * 0.2) * W, 2.0, i % 2 ? H - 0.22 : 0.22); grp.add(ban);
  }
  scene.add(grp);
  level = { group: grp, torches, pillars, W, H };
}

// ---------------------------------------------------------------- actors
const CREATURES = new Set(["slime", "bat", "wolf", "spider", "mimic", "dragon"]);
const MONSTER_LOOKS = {
  goblin:   { race: "orc", skin: "#6b8e23", hair: "bald", hairColor: "#1c1917", eyes: "#facc15", mark: "none", calling: "shadowblade", cloth: "#5b4636", trim: "#3f2a1d", s: 0.72 },
  skeleton: { race: "revenant", skin: "#e7e5e4", hair: "bald", hairColor: "#e7e5e4", eyes: "#22d3ee", mark: "none", calling: "warden", cloth: "#3f3f46", trim: "#52525b", s: 1.0 },
  orc:      { race: "orc", skin: "#4a6e3a", hair: "mohawk", hairColor: "#1c1917", eyes: "#ef4444", mark: "warpaint", calling: "warden", cloth: "#44403c", trim: "#7f1d1d", s: 1.15 },
  darkmage: { race: "human", skin: "#cbd5e1", hair: "hood", hairColor: "#000000", eyes: "#a855f7", mark: "runes", calling: "elementalist", cloth: "#3b0764", trim: "#a855f7", s: 1.0 },
  imp:      { race: "dragonkin", skin: "#b91c1c", hair: "bald", hairColor: "#000000", eyes: "#fde047", mark: "none", calling: "elementalist", cloth: "#450a0a", trim: "#f97316", demonWings: true, s: 0.62 },
  troll:    { race: "orc", skin: "#78716c", hair: "bald", hairColor: "#44403c", eyes: "#fde047", mark: "scar", calling: "warden", cloth: "#57534e", trim: "#3f3f46", s: 1.5 },
  wraith:   { race: "revenant", skin: "#94a3b8", hair: "hood", hairColor: "#000000", eyes: "#22d3ee", mark: "none", calling: "shadowblade", cloth: "#0f172a", trim: "#334155", ghost: true, s: 1.05 },
  demon:    { race: "dragonkin", skin: "#991b1b", hair: "spiky", hairColor: "#1c1917", eyes: "#fde047", mark: "runes", calling: "warden", cloth: "#1c1917", trim: "#dc2626", demonWings: true, s: 1.3 },
  golem:    { race: "dwarf", skin: "#78716c", hair: "bald", hairColor: "#57534e", eyes: "#38bdf8", mark: "runes", calling: "warden", cloth: "#57534e", trim: "#38bdf8", s: 1.55 },
  gking:    { race: "orc", skin: "#65a30d", hair: "bald", hairColor: "#1c1917", eyes: "#facc15", mark: "warpaint", calling: "warden", cloth: "#7c2d12", trim: "#facc15", crown: true, s: 2.1 },
  lich:     { race: "revenant", skin: "#d6d3d1", hair: "hood", hairColor: "#000000", eyes: "#4ade80", mark: "runes", calling: "elementalist", cloth: "#14532d", trim: "#4ade80", crown: true, s: 2.0 },
};
function monsterActor(key) {
  if (!monsterTpl.has(key)) monsterTpl.set(key, buildCharacter({ order: "emberclaw", ...MONSTER_LOOKS[key] }));
  const a = cloneActor(monsterTpl.get(key));
  a.root.scale.setScalar(MONSTER_LOOKS[key].s);
  return a;
}
export function setHero(profile) {
  if (heroActor) scene.remove(heroActor.root);
  heroActor = buildCharacter(profile);
  scene.add(heroActor.root);
  return heroActor;
}
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.6, metalness: o.m ?? 0, emissive: o.e ?? 0, emissiveIntensity: o.ei ?? 1, transparent: !!o.t, opacity: o.op ?? 1, side: o.side || THREE.FrontSide });
function creatureMesh(key, r) {
  const g = new THREE.Group(), R = r * U * 1.1;
  const eye = (x, y, z, c = 0xff3b30, s = 0.035) => { const e = new THREE.Mesh(new THREE.SphereGeometry(s, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(3) })); e.position.set(x, y, z); return e; };
  const cast = o => { o.traverse(m => { if (m.isMesh) m.castShadow = true; }); return o; };
  if (key === "slime") {
    const b = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 24), new THREE.MeshPhysicalMaterial({ color: 0x65a30d, roughness: 0.15, transmission: 0.4, thickness: 0.5, clearcoat: 1, emissive: 0x1a3d00, emissiveIntensity: 0.5 }));
    b.scale.y = 0.75; b.position.y = R * 0.75; g.add(b); g.userData.body = b;
    g.add(eye(-R * 0.35, R * 1.0, R * 0.8, 0x111111, 0.05), eye(R * 0.35, R * 1.0, R * 0.8, 0x111111, 0.05));
  } else if (key === "bat") {
    const body = new THREE.Mesh(new THREE.SphereGeometry(R * 0.6, 16, 12), M(0x2e2238, { r: 0.8 })); g.add(body);
    for (const sx of [-1, 1]) {
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(R * 1.2, R * 1.0, R * 2.3, R * 0.2); sh.lineTo(R * 1.7, -R * 0.1); sh.lineTo(R * 1.3, R * 0.05); sh.lineTo(R * 0.9, -R * 0.3); sh.lineTo(0, -R * 0.1);
      const w = new THREE.Mesh(new THREE.ShapeGeometry(sh), M(0x3b2a4d, { side: THREE.DoubleSide, r: 0.9 })); w.scale.x = sx;
      const piv = new THREE.Group(); piv.add(w); piv.userData.sx = sx; g.add(piv); (g.userData.wings ||= []).push(piv);
    }
    g.add(eye(-R * 0.2, R * 0.15, R * 0.55, 0xff2222), eye(R * 0.2, R * 0.15, R * 0.55, 0xff2222));
    g.userData.fly = 1.4;
  } else if (key === "wolf") {
    const fur = M(0x6b7280, { r: 0.9 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(R * 0.45, R * 1.3, 8, 16), fur); body.rotation.x = Math.PI / 2; body.position.y = R * 0.95; g.add(body);
    const head = new THREE.Group(); head.position.set(0, R * 1.25, R * 1.0);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(R * 0.42, 16, 12), fur); head.add(skull);
    const snout = new THREE.Mesh(new THREE.ConeGeometry(R * 0.24, R * 0.6, 10), M(0x4b5563)); snout.rotation.x = Math.PI / 2; snout.position.z = R * 0.42; head.add(snout);
    for (const sx of [-1, 1]) { const ear = new THREE.Mesh(new THREE.ConeGeometry(R * 0.12, R * 0.35, 4), fur); ear.position.set(sx * R * 0.22, R * 0.42, -R * 0.05); head.add(ear); head.add(eye(sx * R * 0.18, R * 0.12, R * 0.35, 0xfacc15, 0.03)); }
    g.add(head);
    g.userData.legs = [];
    for (const [x, z] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.11, R * 0.08, R * 0.9, 8), M(0x4b5563)); l.geometry.translate(0, -R * 0.45, 0); l.position.set(x * R * 0.3, R * 0.9, z * R * 0.6); g.add(l); g.userData.legs.push(l); }
    const tail = new THREE.Mesh(new THREE.ConeGeometry(R * 0.15, R * 0.9, 8), fur); tail.position.set(0, R * 1.1, -R * 1.2); tail.rotation.x = -2.2; g.add(tail);
  } else if (key === "spider") {
    const chit = new THREE.MeshPhysicalMaterial({ color: 0x1c1917, roughness: 0.3, clearcoat: 0.8 });
    const abd = new THREE.Mesh(new THREE.SphereGeometry(R * 0.75, 20, 16), chit); abd.position.set(0, R * 0.8, -R * 0.5); g.add(abd);
    const mark = new THREE.Mesh(new THREE.OctahedronGeometry(R * 0.25), M(0xdc2626, { e: 0x7f1d1d })); mark.position.set(0, R * 1.4, -R * 0.55); mark.scale.y = 0.4; g.add(mark);
    const ceph = new THREE.Mesh(new THREE.SphereGeometry(R * 0.45, 16, 12), chit); ceph.position.set(0, R * 0.7, R * 0.4); g.add(ceph);
    for (const sx of [-1, 1]) for (const k of [0, 1]) g.add(eye(sx * R * (0.12 + k * 0.12), R * 0.9, R * 0.78, 0xff2222, 0.025));
    g.userData.legs = [];
    for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) {
      const leg = new THREE.Group(); leg.position.set(sx * R * 0.3, R * 0.75, R * (0.5 - i * 0.3));
      const up = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.05, R * 0.06, R * 0.9, 6), chit); up.geometry.translate(0, R * 0.45, 0); up.rotation.z = -sx * 1.1; leg.add(up);
      const lo = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.03, R * 0.05, R * 1.1, 6), chit); lo.geometry.translate(0, -R * 0.55, 0); lo.position.set(sx * R * 0.8, R * 0.4, 0); lo.rotation.z = sx * 0.4; leg.add(lo);
      leg.rotation.y = sx * (0.6 - i * 0.4); leg.userData.ph = i * 1.6 + (sx > 0 ? 0.8 : 0); g.add(leg); g.userData.legs.push(leg);
    }
  } else if (key === "mimic") {
    const wood = M(0x78350f, { r: 0.8 }), band = M(0xd4a017, { m: 0.9, r: 0.3 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(R * 2, R * 1.1, R * 1.3), wood); box.position.y = R * 0.55; g.add(box);
    const lid = new THREE.Group(); lid.position.set(0, R * 1.1, -R * 0.65);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.65, R * 0.65, R * 2, 16, 1, false, 0, Math.PI), wood); top.rotation.z = Math.PI / 2; top.position.z = R * 0.65; lid.add(top);
    for (let i = 0; i < 7; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(R * 0.08, R * 0.25, 4), M(0xfafaf9)); t.position.set(-R * 0.85 + i * R * 0.28, -R * 0.1, R * 1.25); t.rotation.x = Math.PI; lid.add(t); }
    g.add(lid); g.userData.lid = lid;
    for (const y of [0.2, 0.9]) { const b2 = new THREE.Mesh(new THREE.BoxGeometry(R * 2.05, R * 0.1, R * 1.35), band); b2.position.y = R * y; g.add(b2); }
    g.add(eye(-R * 0.4, R * 1.3, R * 0.5, 0xfacc15, 0.05), eye(R * 0.4, R * 1.3, R * 0.5, 0xfacc15, 0.05));
  } else if (key === "dragon") {
    const scale = new THREE.MeshPhysicalMaterial({ color: 0x8b1a1a, roughness: 0.45, metalness: 0.2, clearcoat: 0.5, sheen: 0.5, sheenColor: new THREE.Color(0xff7a3a) });
    const belly = M(0xb45309, { r: 0.6 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(R * 0.9, 32, 24), scale); body.scale.set(1, 0.8, 1.5); body.position.y = R * 1.1; g.add(body);
    const bel = new THREE.Mesh(new THREE.SphereGeometry(R * 0.8, 24, 16), belly); bel.scale.set(0.85, 0.6, 1.3); bel.position.set(0, R * 0.85, R * 0.1); g.add(bel);
    const neckCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, R * 1.3, R * 1.0), new THREE.Vector3(0, R * 2.0, R * 1.5), new THREE.Vector3(0, R * 2.4, R * 2.1)]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(neckCurve, 16, R * 0.35, 12), scale));
    const head = new THREE.Group(); head.position.set(0, R * 2.45, R * 2.3);
    const cap = (r, l, sx, sy, sz, x, y, z, m = scale, rx = Math.PI / 2) => { const c = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 8, 16), m); c.rotation.x = rx; c.scale.set(sx, sy, sz); c.position.set(x, y, z); return c; };
    head.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.42, 24, 18), scale)).scale.set(1, 0.85, 1.1);
    head.add(cap(R * 0.24, R * 0.7, 1.15, 1, 0.75, 0, -R * 0.02, R * 0.5));
    const jaw = cap(R * 0.2, R * 0.6, 1.05, 1, 0.5, 0, -R * 0.2, R * 0.42, belly); head.add(jaw); g.userData.jaw = jaw;
    for (const sx of [-1, 1]) {
      head.add(cap(R * 0.07, R * 0.45, 1, 1, 1, sx * R * 0.2, R * 0.2, R * 0.2, scale, Math.PI / 2 - 0.25));
      for (let i = 0; i < 4; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(R * 0.03, R * 0.12, 6), M(0xf5f0e0, { r: 0.3 })); t.rotation.x = Math.PI; t.position.set(sx * R * 0.17, -R * 0.13, R * (0.35 + i * 0.14)); head.add(t); }
      const nost = new THREE.Mesh(new THREE.SphereGeometry(R * 0.035, 8, 6), M(0x1a0505)); nost.position.set(sx * R * 0.09, R * 0.12, R * 0.92); head.add(nost);
    }
    const mouthGlow = new THREE.PointLight(0xff6a00, 0, 6, 2); mouthGlow.position.set(0, -R * 0.2, R * 0.7); head.add(mouthGlow); g.userData.mouth = mouthGlow;
    g.add(head); g.userData.head = head;
    g.userData.wings = []; const ridge0 = M(0x2a0606, { r: 0.5 });
    for (const sx of [-1, 1]) {
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(R * 1.2, R * 2.4); sh.lineTo(R * 3.6, R * 1.6); sh.lineTo(R * 3.0, R * 0.6); sh.lineTo(R * 3.8, -R * 0.2); sh.lineTo(R * 2.2, -R * 0.3); sh.lineTo(R * 2.4, -R * 1.0); sh.lineTo(0, -R * 0.4);
      const w = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: 0x5b0f0f, roughness: 0.7, side: THREE.DoubleSide, emissive: 0x200000 }));
      w.scale.x = sx; w.rotation.x = -Math.PI / 2 + 0.3;
      const piv = new THREE.Group(); piv.position.set(sx * R * 0.5, R * 1.6, R * 0.2); piv.add(w);
      for (const [px, py] of [[1.2, 2.4], [3.6, 1.6], [3.8, -0.2], [2.4, -1.0]]) { const a = new THREE.Vector3(0, 0, 0), b2 = new THREE.Vector3(sx * px * R, 0, -py * R).applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.3); const bone = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.035, R * 0.07, a.distanceTo(b2), 6), ridge0); bone.position.copy(b2).multiplyScalar(0.5); bone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b2.clone().normalize()); piv.add(bone); } piv.userData.sx = sx; g.add(piv); g.userData.wings.push(piv);
    }
    const tailCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, R * 1.0, -R * 1.2), new THREE.Vector3(R * 0.3, R * 0.5, -R * 2.4), new THREE.Vector3(-R * 0.2, R * 0.25, -R * 3.6), new THREE.Vector3(0, R * 0.2, -R * 4.4)]);
    const ridge = M(0x3b0a0a, { r: 0.5 });
    for (let i = 0; i <= 30; i++) { const t = i / 30, p = tailCurve.getPoint(t), rr = R * (0.36 - 0.3 * t); const b = new THREE.Mesh(new THREE.SphereGeometry(rr, 14, 10), scale); b.position.copy(p); g.add(b); if (i % 3 === 0) { const sp = new THREE.Mesh(new THREE.ConeGeometry(rr * 0.4, rr * 1.2, 5), ridge); sp.position.set(p.x, p.y + rr * 0.9, p.z); sp.rotation.x = -0.5; g.add(sp); } }
    for (let i = 0; i < 9; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(R * 0.09, R * 0.35, 5), ridge); sp.position.set(0, R * (1.78 - Math.abs(i - 4) * 0.035), R * (-1.0 + i * 0.28)); sp.rotation.x = -0.4; g.add(sp); }
    for (const [x, z] of [[-1, 0.8], [1, 0.8], [-1, -0.7], [1, -0.7]]) {
      const th = new THREE.Mesh(new THREE.SphereGeometry(R * 0.32, 16, 12), scale); th.scale.set(0.8, 1.1, 1); th.position.set(x * R * 0.72, R * 0.85, z * R); g.add(th);
      const l = new THREE.Mesh(new THREE.CapsuleGeometry(R * 0.15, R * 0.55, 6, 12), scale); l.position.set(x * R * 0.72, R * 0.4, z * R + R * 0.05); g.add(l);
      for (const c of [-1, 0, 1]) { const cl = new THREE.Mesh(new THREE.ConeGeometry(R * 0.04, R * 0.18, 6), M(0xe7e0d0, { r: 0.35 })); cl.rotation.x = Math.PI / 2; cl.position.set(x * R * 0.72 + c * R * 0.08, R * 0.05, z * R + R * 0.22); g.add(cl); }
    }
  }
  return cast(g);
}
function enemyVisual(e) {
  let a = actors.get(e);
  if (a) return a;
  const key = e.boss ? e.key : e.key;
  if (CREATURES.has(key)) { const mesh = creatureMesh(key, e.r); scene.add(mesh); a = { mesh, creature: key }; }
  else if (MONSTER_LOOKS[key]) { const actor = monsterActor(key); if (e.elite) actor.root.scale.multiplyScalar(1.3); scene.add(actor.root); a = { actor, root: actor.root }; }
  else { const mesh = creatureMesh("slime", e.r); scene.add(mesh); a = { mesh, creature: "slime" }; }
  if (e.elite || e.boss) {
    const aura = new THREE.Mesh(new THREE.RingGeometry(e.r * U * 1.1, e.r * U * 1.5, 40), new THREE.MeshBasicMaterial({ color: e.boss ? 0xff3030 : 0xf5c542, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    aura.rotation.x = -Math.PI / 2; aura.position.y = 0.03; (a.root || a.mesh).add(aura); a.aura = aura;
  }
  a.yaw = 0; a.lx = e.x; a.ly = e.y; a.hitT = 0;
  actors.set(e, a);
  return a;
}

// ---------------------------------------------------------------- per-frame render
const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
const angLerp = (a, b, t) => { let d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return a + d * t; };
export function render(G, dt) {
  if (!ready || !level) return;
  const h = G.hero, time = G.time;
  // ---- hero
  if (heroActor) {
    const a = heroActor;
    const sp = Math.hypot(h.x - (a.lx ?? h.x), h.y - (a.ly ?? h.y)) / Math.max(dt, 1e-4);
    a.lx = h.x; a.ly = h.y;
    a.speedS = (a.speedS || 0) + (Math.min(sp, 400) - (a.speedS || 0)) * Math.min(1, dt * 10);
    const moving = a.speedS > 25;
    a.play(G.over ? "idle" : !moving ? "idle" : a.speedS > 150 ? "run" : "walk", 0.18, moving ? Math.max(0.8, a.speedS / 175) : 1);
    a.root.position.copy(v3(h.x, h.y));
    const want = h.faceA != null ? h.faceA : a.root.rotation.y;
    a.root.rotation.y = angLerp(a.root.rotation.y, want, Math.min(1, dt * 12));
    a.update(dt, time, Math.min(1, a.speedS / 300));
    poseHero(a, h, G);
    // death: fall over
    if (G.over && h.hp <= 0) { a.dieT = Math.min(1, (a.dieT || 0) + dt * 1.6); a.root.rotation.x = -a.dieT * 1.45; a.root.position.y = a.dieT * 0.15; }
    else { a.dieT = 0; a.root.rotation.x = 0; }
    // hurt flash
    a.root.visible = !(h.inv > 0 && h.dashT <= 0 && Math.floor(time * 18) % 2 && h.inv < 0.5);
    // where the hand is (in game units) so spells come out of it
    a.handWorld(false, tmp); h.handX = tmp.x / U; h.handY = tmp.z / U; h.handH = tmp.y;
    a.tipWorld(tmp); h.tipX = tmp.x / U; h.tipY = tmp.z / U; h.tipH = tmp.y;
    // the hero's torch light hangs a little towards the camera so faces and fronts are lit
    heroLight.position.set(h.x * U - Math.sin(cam.yaw) * 0.9, 2.6, h.y * U - Math.cos(cam.yaw) * 0.9);
    heroLight.intensity = (G.cleared ? 10 : 6) * (0.95 + Math.sin(time * 13) * 0.05);
    if (!G.shieldMesh && h.shield > 0) { G.shieldMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 2), new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.18, wireframe: true, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(G.shieldMesh); }
    if (G.shieldMesh) { G.shieldMesh.visible = h.shield > 0; G.shieldMesh.position.set(h.x * U, 0.9, h.y * U); G.shieldMesh.rotation.y += dt; }
  }
  // ---- orbiting blades
  if (h.orbit) {
    G.orbitMeshes ||= [];
    while (G.orbitMeshes.length < h.orbit) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 6, 24, Math.PI * 1.3), new THREE.MeshStandardMaterial({ color: 0xc4b5fd, emissive: 0x7c3aed, emissiveIntensity: 2, metalness: 0.8, roughness: 0.2 })); scene.add(b); G.orbitMeshes.push(b); }
    G.orbitMeshes.forEach((b, i) => { const an = G.orbitA + i * Math.PI * 2 / h.orbit; b.position.set((h.x + Math.cos(an) * 62) * U, 0.9, (h.y + Math.sin(an) * 62) * U); b.rotation.set(Math.PI / 2, 0, an * 4); });
  }
  // ---- pet
  if (!G.petMesh) { G.petMesh = petMesh(G.pet.petType); scene.add(G.petMesh); }
  G.petMesh.position.set(G.pet.x * U, 0.6 + Math.sin(time * 5) * 0.08, G.pet.y * U);
  G.petMesh.rotation.y = heroActor ? heroActor.root.rotation.y : 0;

  // ---- enemies
  const seen = new Set();
  for (const e of G.enemies) {
    if (e.hp <= 0) continue;
    seen.add(e);
    const a = enemyVisual(e);
    const obj = a.root || a.mesh;
    const dx = e.x - a.lx, dy = e.y - a.ly, sp = Math.hypot(dx, dy) / Math.max(dt, 1e-4);
    a.lx = e.x; a.ly = e.y;
    const toHero = Math.atan2(h.x - e.x, h.y - e.y);
    a.yaw = angLerp(a.yaw, sp > 10 ? Math.atan2(dx, dy) : toHero, Math.min(1, dt * 8));
    obj.position.set(e.x * U, (a.mesh?.userData.fly || 0) + (e.boss && e.key === "dragon" ? 0 : 0), e.y * U);
    obj.rotation.y = a.yaw;
    if (a.actor) {
      a.actor.play(sp > 20 ? (e.spd > 100 ? "run" : "walk") : "idle", 0.2, Math.max(0.7, Math.min(1.6, sp / 90)));
      a.actor.update(dt * (e.freeze > 0 || e.stun > 0 ? 0 : 1), time, 0.3);
      // attack pose: swing at the hero when close or shooting
      const close = Math.hypot(h.x - e.x, h.y - e.y) < e.r + 40;
      if (e.cool < 0.25 || close) {
        const k = close ? (Math.sin(time * 9) * 0.5 + 0.5) : 1;
        tmp.set(Math.sin(toHero), 0.3 - k * 0.6, Math.cos(toHero));
        a.actor.aimBone(a.actor.bones.RightArm, tmp, 0.9); a.actor.aimBone(a.actor.bones.RightForeArm, tmp, 0.9); a.actor.placeWeapons();
      }
    } else animateCreature(a, e, time, sp);
    // hit flash: tint emissive briefly
    const flash = e.flash > 0 ? 1 : 0;
    if (flash !== a.flashOn) { a.flashOn = flash; obj.traverse(m => { if (m.isMesh && m.material && m.material.emissive && !m.material.userData.keep) { m.material = m.material.clone(); m.material.userData.keep = false; m.material.emissive.setHex(flash ? 0x662222 : 0x000000); } }); }
    if (a.aura) a.aura.rotation.z += dt;
    obj.visible = true;
    if (e.freeze > 0 && !a.ice) { a.ice = new THREE.Mesh(new THREE.IcosahedronGeometry(e.r * U * 1.6, 1), new THREE.MeshPhysicalMaterial({ color: 0xbae6fd, transmission: 0.6, roughness: 0.1, transparent: true, opacity: 0.55, flatShading: true })); a.ice.position.y = e.r * U * 1.4; obj.add(a.ice); }
    if (a.ice) a.ice.visible = e.freeze > 0;
  }
  for (const [e, a] of actors) if (!seen.has(e)) { const o = a.root || a.mesh; scene.remove(o); actors.delete(e); deathBurst(G, e); }

  // ---- projectiles
  syncMap(shotMeshes, G.shots, s => {
    const col = new THREE.Color(s.color);
    const g = new THREE.Group();
    if (s.dagger) { const d = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.3, 4), new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 0.9, roughness: 0.2, emissive: col, emissiveIntensity: 1.5 })); d.rotation.x = Math.PI / 2; g.add(d); }
    else { const core = new THREE.Mesh(new THREE.SphereGeometry(s.r * U * 1.4, 16, 12), new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(s.from === "hero" ? 3 : 2.2) })); g.add(core);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(s.r * U * 2.6, 16, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(halo); }
    if (s.explode || s.glow > 20) { const L = new THREE.PointLight(col, 4, 5, 2); g.add(L); }
    scene.add(g); return g;
  }, (s, g) => {
    const H = s.h ?? (s.from === "hero" ? 1.25 : 1.0);
    g.position.set(s.x * U, H, s.y * U);
    g.rotation.y = Math.atan2(s.vx, s.vy);
    // trail
    if (Math.random() < 0.9) G.fx3.push({ x: s.x, y: s.y, h: H, vx: -s.vx * 0.05, vy: -s.vy * 0.05, vh: (Math.random() - 0.3) * 0.6, life: 0.35, max: 0.35, color: s.color, size: s.explode ? 1.6 : 1 });
  });
  // ---- zones (telegraphs, holy circles, poison clouds)
  syncMap(zoneMeshes, G.zones, z => {
    const g = new THREE.Group();
    const col = new THREE.Color(z.color);
    const ring = new THREE.Mesh(new THREE.RingGeometry(z.r * U * 0.94, z.r * U, 64), new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(2), transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    ring.rotation.x = -Math.PI / 2; g.add(ring);
    const fill = new THREE.Mesh(new THREE.CircleGeometry(z.r * U, 64), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: z.warn ? 0.25 : 0.18, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    fill.rotation.x = -Math.PI / 2; g.add(fill); g.userData.fill = fill;
    if (z.holy) { const pillar = new THREE.Mesh(new THREE.CylinderGeometry(z.r * U, z.r * U, 5, 48, 1, true), new THREE.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0.08, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); pillar.position.y = 2.5; g.add(pillar); const L = new THREE.PointLight(0xfde68a, 6, 7); L.position.y = 1.5; g.add(L); }
    if (z.poison || z.acid) { for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(z.r * U * (0.3 + Math.random() * 0.25), 12, 8), new THREE.MeshStandardMaterial({ color: col, transparent: true, opacity: 0.35, emissive: col, emissiveIntensity: 0.6, depthWrite: false })); const an = Math.random() * 6.3, d = Math.random() * z.r * U * 0.6; b.position.set(Math.cos(an) * d, 0.2 + Math.random() * 0.3, Math.sin(an) * d); g.add(b); } }
    scene.add(g); return g;
  }, (z, g) => {
    g.position.set(z.x * U, 0.04, z.y * U);
    if (z.warn) { const p = 1 - z.t / z.delay; g.userData.fill.scale.setScalar(Math.max(0.02, p)); g.userData.fill.material.opacity = 0.2 + p * 0.35; }
    else g.rotation.y += dt * 0.6;
  });
  // ---- spawn portals
  syncMap(teleMeshes, G.tele, t => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.05, 8, 32), new THREE.MeshBasicMaterial({ color: t.elite ? 0xffd34d : 0xb18cff })); m.rotation.x = -Math.PI / 2; scene.add(m); return m; },
    (t, m) => { m.position.set(t.x * U, 0.1, t.y * U); m.rotation.z += dt * 8; m.scale.setScalar(1.2 - t.t); if (Math.random() < 0.6) G.fx3.push({ x: t.x + (Math.random() - 0.5) * 30, y: t.y + (Math.random() - 0.5) * 30, h: 0.1, vx: 0, vy: 0, vh: 1.5, life: 0.6, max: 0.6, color: t.elite ? "#ffd34d" : "#b18cff", size: 1 }); });
  // ---- pickups
  syncMap(pickupMeshes, G.pickups, p => {
    let m;
    if (p.kind === "xp") m = new THREE.Mesh(new THREE.OctahedronGeometry(0.08), new THREE.MeshBasicMaterial({ color: new THREE.Color(p.v >= 3 ? 0xf0abfc : 0x818cf8).multiplyScalar(2.5) }));
    else if (p.kind === "gold") m = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16), new THREE.MeshStandardMaterial({ color: 0xffcc33, metalness: 1, roughness: 0.25, emissive: 0x553300 }));
    else m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), new THREE.MeshBasicMaterial({ color: 0xff4d6d }));
    scene.add(m); return m;
  }, (p, m) => { m.position.set(p.x * U, 0.35 + Math.sin(time * 4 + p.x) * 0.06, p.y * U); m.rotation.y += dt * 3; if (p.kind === "gold") m.rotation.x = Math.PI / 2; });
  // ---- portal & merchant
  if (G.portal && !G.portalMesh) {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.6 + i * 0.12, 0.04, 8, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color([0xa78bfa, 0x60a5fa, 0xf0abfc][i]).multiplyScalar(2.5) })); r.userData.i = i; g.add(r); }
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.6, 48), new THREE.MeshBasicMaterial({ color: 0x3b1d7a, transparent: true, opacity: 0.85 })); g.add(disc);
    const L = new THREE.PointLight(0xa78bfa, 10, 9); g.add(L);
    g.position.set(G.portal.x * U, 1.0, G.portal.y * U); scene.add(g); G.portalMesh = g;
  }
  if (G.portalMesh) { if (!G.portal) { scene.remove(G.portalMesh); G.portalMesh = null; } else { G.portalMesh.children.forEach(c => { if (c.userData.i != null) c.rotation.set(time * (0.6 + c.userData.i * 0.4), time * (0.3 + c.userData.i * 0.2), 0); }); G.portalMesh.rotation.y = cam.yaw; } }
  if (G.merchant && !G.merchantActor) { G.merchantActor = cloneActor(monsterTpl.get("__merchant") || (monsterTpl.set("__merchant", buildCharacter({ race: "dwarf", skin: "#dba582", hair: "hood", hairColor: "#888888", eyes: "#facc15", mark: "none", calling: "lifebinder", cloth: "#4c1d95", trim: "#facc15", order: "duskraven" })), monsterTpl.get("__merchant"))); scene.add(G.merchantActor.root); }
  if (G.merchantActor) { if (!G.merchant) { scene.remove(G.merchantActor.root); G.merchantActor = null; } else { G.merchantActor.root.position.copy(v3(G.merchant.x, G.merchant.y)); G.merchantActor.root.rotation.y = Math.atan2(h.x - G.merchant.x, h.y - G.merchant.y); G.merchantActor.update(dt, time); } }

  // ---- effects from the game (rings, bolts, arcs, sparks)
  for (const f of G.fx) {
    if (f._3d) continue;
    f._3d = true;
    if (f.ring) spawnRing(f.x, f.y, f.r, f.color, f.max);
    else if (f.bolt) spawnBolt(f);
    else if (f.arc) spawnArc(f);
    else if (f.vx != null && !f.ghost) G.fx3.push({ x: f.x, y: f.y, h: 0.3 + Math.random() * 1.2, vx: f.vx, vy: f.vy, vh: (Math.random() - 0.2) * 3, life: f.life, max: f.max, color: f.color, size: f.size / 3 });
  }
  updateRings(dt);
  updateParticles(G, dt);
  // torches flicker
  for (const t of level.torches) { const s = 1 + Math.sin(time * 17 + t.position.x) * 0.12 + Math.random() * 0.06; t.userData.flame.scale.set(s, 1.6 * s, s); if (t.userData.light) t.userData.light.intensity = 5.5 * s; }

  // ---- camera: behind the hero, drag to turn; flies to bosses during their entrance
  let fx = h.x * U, fz = h.y * U, dist = cam.dist, pitch = cam.pitch;
  if (G.focus && G.focus.t > 0) {
    const t = G.focus.t, p = t > 1.8 ? (2.4 - t) / 0.6 : t > 0.6 ? 1 : t / 0.6, ease = p * p * (3 - 2 * p);
    fx += (G.focus.e.x * U - fx) * ease; fz += (G.focus.e.y * U - fz) * ease; dist *= 1 - 0.35 * ease; pitch -= 0.25 * ease;
  }
  if (G.over) { dist *= 0.7; pitch = 0.45; cam.yaw += dt * 0.25; }
  cam.tx += (fx - cam.tx) * Math.min(1, dt * 8); cam.tz += (fz - cam.tz) * Math.min(1, dt * 8);
  const sh = G.shake * U * 0.6;
  camera.position.set(cam.tx - Math.sin(cam.yaw) * Math.cos(pitch) * dist + (Math.random() - 0.5) * sh, 0.9 + Math.sin(pitch) * dist + (Math.random() - 0.5) * sh, cam.tz - Math.cos(cam.yaw) * Math.cos(pitch) * dist);
  camera.lookAt(cam.tx, 1.2, cam.tz);
  // columns between the camera and the hero turn see-through
  const ax = camera.position.x, az = camera.position.z, bx = h.x * U, bz = h.y * U;
  for (const pl of level.pillars) {
    let hit = false;
    for (let k = 0; k <= 10 && !hit; k++) { const x = ax + (bx - ax) * k / 10, z = az + (bz - az) * k / 10; hit = x > pl.x0 && x < pl.x1 && z > pl.z0 && z < pl.z1; }
    pl.op += ((hit ? 0.18 : 1) - pl.op) * Math.min(1, dt * 10);
    pl.mat.opacity = pl.op; pl.mat.depthWrite = pl.op > 0.9;
    pl.g.children.forEach(c => { c.castShadow = pl.op > 0.9; });
  }
  moon.position.set(cam.tx + 4, 12, cam.tz + 3); moon.target.position.set(cam.tx, 0, cam.tz);
  // floating damage numbers
  syncTexts(G);
  quality(dt);
  if (useBloom) composer.render(); else renderer.render(scene, camera);
}
let useBloom = true, slowT = 0, fastT = 0, qLevel = 2;
function quality(dt) {
  if (dt <= 0) return;
  if (dt > 0.045) { slowT += dt; fastT = 0; } else { fastT += dt; slowT = Math.max(0, slowT - dt * 0.5); }
  if (slowT > 2.5 && qLevel > 0) {   // step down: bloom off → shadows off & lower resolution
    qLevel--; slowT = 0;
    if (qLevel === 1) useBloom = false;
    if (qLevel === 0) { renderer.shadowMap.enabled = false; renderer.setPixelRatio(1); resize(); scene.traverse(o => { if (o.material) o.material.needsUpdate = true; }); }
  }
}
export function setQuality(level) { qLevel = level; useBloom = level >= 2; renderer.shadowMap.enabled = level >= 1; renderer.setPixelRatio(level >= 2 ? Math.min(1.5, devicePixelRatio || 1) : 1); resize(); }
function syncMap(map, list, make, upd) {
  const seen = new Set(list);
  for (const it of list) { let o = map.get(it); if (!o) { o = make(it); map.set(it, o); } upd(it, o); }
  for (const [it, o] of map) if (!seen.has(it)) { scene.remove(o); o.traverse?.(c => { if (c.isLight) c.dispose?.(); }); map.delete(it); }
}
function petMesh(type) {
  const g = new THREE.Group();
  const col = { owl: 0x8b6b4a, cat: 0x1f1f1f, toad: 0x4d7c0f, fox: 0xea580c, raven: 0x111111, drake: 0xb91c1c }[type] || 0x888888;
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), new THREE.MeshStandardMaterial({ color: col, roughness: 0.7 })); body.scale.y = 0.9; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), body.material); head.position.set(0, 0.14, 0.08); g.add(head);
  for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), new THREE.MeshBasicMaterial({ color: type === "drake" ? 0xffd34d : 0xfff2a8 })); e.position.set(sx * 0.04, 0.17, 0.17); g.add(e);
    if (type === "fox" || type === "cat") { const ear = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 4), body.material); ear.position.set(sx * 0.05, 0.25, 0.06); g.add(ear); }
    if (type === "owl" || type === "raven" || type === "drake") { const w = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), body.material); w.scale.set(0.3, 0.8, 1); w.position.set(sx * 0.14, 0.02, 0); g.add(w); } }
  if (type === "drake") { const L = new THREE.PointLight(0xff6a00, 1.5, 2.5); L.position.z = 0.25; g.add(L); }
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return g;
}
function animateCreature(a, e, time, sp) {
  const m = a.mesh, u = m.userData;
  if (a.creature === "slime" && u.body) { const sq = 1 + Math.sin(time * 8 + e.x) * 0.12; u.body.scale.set(1 / Math.sqrt(sq), 0.75 * sq, 1 / Math.sqrt(sq)); }
  if (u.wings) u.wings.forEach(w => { w.rotation.z = w.userData.sx * Math.sin(time * (a.creature === "dragon" ? 2.6 : 20) + e.x) * (a.creature === "dragon" ? 0.45 : 0.7); });
  if (a.creature === "bat") m.position.y = 1.3 + Math.sin(time * 3 + e.x) * 0.25;
  if (u.legs) u.legs.forEach((l, i) => { if (a.creature === "spider") l.rotation.x = Math.sin(time * 14 + (l.userData.ph || 0)) * 0.35 * Math.min(1, sp / 40 + 0.15); else l.rotation.x = Math.sin(time * 12 + i * Math.PI) * 0.6 * Math.min(1, sp / 60); });
  if (u.lid) u.lid.rotation.x = -(Math.sin(time * 6) * 0.5 + 0.5) * 0.7;
  if (a.creature === "dragon") {
    if (u.head) u.head.rotation.x = Math.sin(time * 1.5) * 0.1 - (e.breath > 0 ? 0.25 : 0);
    if (u.jaw) u.jaw.rotation.x = e.breath > 0 ? 0.5 : 0.05;
    if (u.mouth) u.mouth.intensity = e.breath > 0 ? 12 : 0;
    m.position.y = e.phase === 2 ? 0.6 + Math.sin(time * 2) * 0.3 : 0;
  }
}

// ---------------------------------------------------------------- hero poses (casting / swinging / blocking)
function poseHero(a, h, G) {
  const b = a.bones, an = h.anim;
  const yaw = a.root.rotation.y;
  const fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const dirTo = (tx, ty, lift = 0.1) => tmp2.set((tx - h.x), 0, (ty - h.y)).normalize().setY(lift).normalize();
  a.grip.staffLean = 0; a.grip.shieldUp = h.shield > 0 ? 1 : 0;
  if (h.shield > 0 && a.calling === "warden") { a.aimBone(b.LeftArm, fwd.clone().add(right.clone().multiplyScalar(0.35)).setY(-0.1), 0.95); a.aimBone(b.LeftForeArm, right.clone().multiplyScalar(0.9).add(fwd.clone().multiplyScalar(0.3)).setY(0.3), 0.9); }
  if (!an) { a.placeWeapons(); return; }
  const p = Math.min(1, an.t / an.dur), up = new THREE.Vector3(0, 1, 0);
  const env = p < 0.35 ? p / 0.35 : p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;   // raise, hold, lower
  const target = an.tx != null ? dirTo(an.tx, an.ty, 0.12) : fwd.clone().setY(0.1).normalize();
  if (an.type === "cast") {
    a.aimBone(b.RightArm, target, env); a.aimBone(b.RightForeArm, target, env);
    a.grip.staffLean = env * 1.6;
  } else if (an.type === "twohand") {
    // both arms raise overhead, then thrust towards the target at the release
    const over = up.clone().add(fwd.clone().multiplyScalar(0.25)).normalize();
    const dir = p < 0.5 ? over : target;
    const k = p < 0.5 ? p / 0.5 : 1 - Math.max(0, (p - 0.75) / 0.25);
    a.aimBone(b.RightArm, dir.clone().add(right.clone().multiplyScalar(0.25)).normalize(), k); a.aimBone(b.RightForeArm, dir, k);
    a.aimBone(b.LeftArm, dir.clone().add(right.clone().multiplyScalar(-0.25)).normalize(), k); a.aimBone(b.LeftForeArm, dir, k);
    a.grip.staffLean = k * 1.2;
  } else if (an.type === "nova") {
    const k = p < 0.4 ? p / 0.4 : 1 - Math.max(0, (p - 0.7) / 0.3);
    const outR = right.clone().setY(p < 0.4 ? 0.9 : -0.35).normalize(), outL = right.clone().negate().setY(p < 0.4 ? 0.9 : -0.35).normalize();
    a.aimBone(b.RightArm, outR, k); a.aimBone(b.RightForeArm, outR, k); a.aimBone(b.LeftArm, outL, k); a.aimBone(b.LeftForeArm, outL, k);
  } else if (an.type === "swing") {
    // hammer: wind up over the shoulder, smash down in front
    const s = p < 0.45 ? p / 0.45 : 1;
    const wind = up.clone().add(fwd.clone().multiplyScalar(-0.35)).normalize();
    const hit = target.clone().setY(-0.45).normalize();
    const dir = p < 0.45 ? wind : wind.clone().lerp(hit, Math.min(1, (p - 0.45) / 0.2)).normalize();
    const k = p < 0.85 ? Math.min(1, s * 1.5) : 1 - (p - 0.85) / 0.15;
    a.aimBone(b.RightArm, dir, k); a.aimBone(b.RightForeArm, dir, k);
  } else if (an.type === "slam") {
    const dir = p < 0.5 ? up : fwd.clone().setY(-0.6).normalize();
    const k = p < 0.85 ? 1 : 1 - (p - 0.85) / 0.15;
    for (const [arm, fore, sx] of [[b.RightArm, b.RightForeArm, 0.2], [b.LeftArm, b.LeftForeArm, -0.2]]) { const d = dir.clone().add(right.clone().multiplyScalar(sx)).normalize(); a.aimBone(arm, d, k); a.aimBone(fore, d, k); }
    a.root.position.y = p < 0.5 ? Math.sin(p / 0.5 * Math.PI / 2) * 0.55 : Math.max(0, 0.55 * (1 - (p - 0.5) / 0.12));
  } else if (an.type === "throw") {
    // daggers: alternate hands, quick forward throw
    const left = an.left;
    const k = p < 0.4 ? p / 0.4 : 1 - (p - 0.4) / 0.6;
    const back = target.clone().multiplyScalar(-0.4).setY(0.6).normalize();
    const dir = p < 0.3 ? back : target;
    a.aimBone(left ? b.LeftArm : b.RightArm, dir, k); a.aimBone(left ? b.LeftForeArm : b.RightForeArm, dir, k);
  } else if (an.type === "heal") {
    const k = env, sky = up.clone().add(fwd.clone().multiplyScalar(0.4)).normalize();
    a.aimBone(b.RightArm, sky.clone().add(right.clone().multiplyScalar(0.5)).normalize(), k); a.aimBone(b.RightForeArm, sky, k);
    a.aimBone(b.LeftArm, sky.clone().add(right.clone().multiplyScalar(-0.5)).normalize(), k); a.aimBone(b.LeftForeArm, sky, k);
  }
  a.placeWeapons();
}

// ---------------------------------------------------------------- effects
const RINGS = [];
function spawnRing(x, y, r, color, life) {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2.5), transparent: true, opacity: 1, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x * U, 0.06, y * U); scene.add(m);
  const wave = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.8, 48, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.5), transparent: true, opacity: 0.35, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  wave.position.set(x * U, 0.4, y * U); scene.add(wave);
  RINGS.push({ m, wave, r: r * U, t: 0, life: Math.max(0.3, life) });
}
function spawnBolt(f) {
  const pts = [];
  for (let i = 0; i <= 6; i++) pts.push(new THREE.Vector3((f.x + (f.x2 - f.x) * i / 6) * U + (i % 6 ? (Math.random() - 0.5) * 0.2 : 0), 1.0 + (i % 6 ? (Math.random() - 0.5) * 0.25 : 0), (f.y + (f.y2 - f.y) * i / 6) * U + (i % 6 ? (Math.random() - 0.5) * 0.2 : 0)));
  const line = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.02, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(f.color || "#bfdbfe").multiplyScalar(3), transparent: true }));
  scene.add(line); RINGS.push({ m: line, t: 0, life: f.max, fade: true });
}
function spawnArc(f) {
  const arc = new THREE.Mesh(new THREE.RingGeometry(f.r * U * 0.55, f.r * U, 32, 1, -1.1, 2.2), new THREE.MeshBasicMaterial({ color: 0xe5e7eb, transparent: true, opacity: 0.6, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  arc.rotation.x = -Math.PI / 2; arc.rotation.z = -f.a; arc.position.set(f.x * U, 1.0, f.y * U); scene.add(arc);
  RINGS.push({ m: arc, t: 0, life: 0.22, fade: true });
}
function updateRings(dt) {
  for (let i = RINGS.length - 1; i >= 0; i--) {
    const R = RINGS[i]; R.t += dt; const p = R.t / R.life;
    if (R.r) { const s = R.r * (0.3 + 0.75 * Math.min(1, p * 1.6)); R.m.scale.set(s, s, 1); R.m.material.opacity = 1 - p; R.wave.scale.set(s, 1 + p, s); R.wave.material.opacity = 0.35 * (1 - p); }
    else if (R.fade) R.m.material.opacity = 1 - p;
    if (p >= 1) { scene.remove(R.m); if (R.wave) scene.remove(R.wave); R.m.geometry.dispose(); RINGS.splice(i, 1); }
  }
}
function deathBurst(G, e) {
  for (let i = 0; i < (e.boss ? 120 : 22); i++) { const an = Math.random() * 6.3, s = Math.random() * (e.boss ? 260 : 120); G.fx3.push({ x: e.x, y: e.y, h: 0.4 + Math.random() * (e.boss ? 3 : 1), vx: Math.cos(an) * s, vy: Math.sin(an) * s, vh: Math.random() * 3, life: 0.8, max: 0.8, color: e.boss ? "#ff5050" : e.elite ? "#f5c542" : "#c4b5fd", size: 1.2 }); }
}
const _c = new THREE.Color();
function updateParticles(G, dt) {
  const pos = fxGeo.attributes.position.array, col = fxGeo.attributes.color.array, N = pos.length / 3;
  let n = 0;
  G.fx3 = G.fx3.filter(f => (f.life -= dt) > 0);
  if (G.fx3.length > N) G.fx3.splice(0, G.fx3.length - N);
  for (const f of G.fx3) {
    f.x += f.vx * dt; f.y += f.vy * dt; f.h += f.vh * dt; f.vx *= 0.94; f.vy *= 0.94; f.vh -= dt * 1.5;
    if (f.h < 0.02) { f.h = 0.02; f.vh *= -0.3; }
    pos[n * 3] = f.x * U; pos[n * 3 + 1] = f.h; pos[n * 3 + 2] = f.y * U;
    _c.set(f.color).multiplyScalar(2 * (f.life / f.max) * (f.size || 1));
    col[n * 3] = _c.r; col[n * 3 + 1] = _c.g; col[n * 3 + 2] = _c.b;
    n++;
  }
  fxGeo.setDrawRange(0, n);
  fxGeo.attributes.position.needsUpdate = true; fxGeo.attributes.color.needsUpdate = true;
}
function syncTexts(G) {
  const seen = new Set();
  for (const t of G.texts) {
    seen.add(t);
    let el = textEls.get(t);
    if (!el) {
      el = document.createElement("div");
      el.textContent = t.t;
      el.style.cssText = `position:absolute;left:0;top:0;font:${t.big ? 900 : 800} ${t.big ? 20 : 15}px Inter,sans-serif;color:${t.color};text-shadow:0 2px 3px #000,0 0 6px #000;white-space:nowrap;will-change:transform`;
      textLayer.append(el); textEls.set(t, el);
      t.h0 = t.big ? 2.4 : 2.0;
    }
    tmp.set(t.x * U, t.h0 + (0.9 - t.life) * 0.9, t.y * U).project(camera);
    const w = renderer.domElement.clientWidth, hh = renderer.domElement.clientHeight;
    el.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w}px, ${(-tmp.y * 0.5 + 0.5) * hh}px) translate(-50%, -50%) scale(${t.big ? 1.15 : 1})`;
    el.style.opacity = Math.min(1, t.life * 2.2);
    el.style.display = tmp.z < 1 ? "" : "none";
  }
  for (const [t, el] of textEls) if (!seen.has(t)) { el.remove(); textEls.delete(t); }
}
export function clearAll() {
  for (const [, el] of textEls) el.remove(); textEls.clear();
}

// ---------------------------------------------------------------- creator preview (a turning 3D hero)
let pv = null;
export async function preview(container, profile) {
  await loadBase();
  if (!pv) {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.toneMapping = THREE.ACESFilmicToneMapping; r.outputColorSpace = THREE.SRGBColorSpace;
    const sc = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(r); sc.environment = pm.fromScene(new RoomEnvironment(r), 0.04).texture; sc.environmentIntensity = 0.15;
    sc.add(new THREE.HemisphereLight(0xc7c2ff, 0x221a33, 1.0));
    const key = new THREE.DirectionalLight(0xfff1dd, 2.2); key.position.set(2, 3, 3); sc.add(key);
    const rim = new THREE.DirectionalLight(0x9f8bff, 1.8); rim.position.set(-2, 2, -3); sc.add(rim);
    const c = new THREE.PerspectiveCamera(30, 0.75, 0.1, 50); c.position.set(0, 1.25, 4.2); c.lookAt(0, 0.95, 0);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.7, 48), new THREE.MeshBasicMaterial({ color: 0xf5c542, transparent: true, opacity: 0.15 })); disc.rotation.x = -Math.PI / 2; sc.add(disc);
    pv = { r, sc, c, actor: null, clock: new THREE.Clock(), t: 0 };
    const loop = () => { requestAnimationFrame(loop); if (!pv.actor || !pv.r.domElement.isConnected) return; const dt = Math.min(0.05, pv.clock.getDelta()); pv.t += dt; pv.actor.root.rotation.y = Math.sin(pv.t * 0.5) * 0.7; pv.actor.update(dt, pv.t); pv.r.render(pv.sc, pv.c); };
    loop();
  }
  if (pv.r.domElement.parentElement !== container) container.replaceChildren(pv.r.domElement);
  const w = container.clientWidth || 150, h = container.clientHeight || 200;
  pv.r.setSize(w, h); pv.c.aspect = w / h; pv.c.updateProjectionMatrix();
  if (pv.actor) pv.sc.remove(pv.actor.root);
  pv.actor = buildCharacter(profile);
  pv.sc.add(pv.actor.root);
}
