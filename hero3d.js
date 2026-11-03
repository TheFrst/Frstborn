// 3D characters: a motion-captured body (Xbot) dressed up with a custom head, race features, outfit and weapons.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
// weld the sphere seam so sculpted shapes shade smoothly
const smooth = g => { g.deleteAttribute("normal"); g.deleteAttribute("uv"); const m = mergeVertices(g, 1e-5); m.computeVertexNormals(); return m; };
import { ORDERS, CALLINGS, RACES, HAIR_STYLES } from "./data.js";

const okColor = c => /^#[0-9a-fA-F]{6}$/.test(c || "") ? c : null;
let base = null;
export async function loadBase() {
  if (base) return base;
  const loader = new GLTFLoader();
  const urls = ["./Xbot.glb", "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/models/gltf/Xbot.glb"];
  let err;
  for (const u of urls) { try { base = await loader.loadAsync(u); return base; } catch (e) { err = e; } }
  throw err;
}


// ---------- materials & sculpting helpers ----------
let _fabric = null;
function fabricTexture() {   // a fine woven pattern used as a bump map so cloth doesn't look like plastic
  if (_fabric) return _fabric;
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d"), img = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const w = (Math.sin(x * 1.6) * Math.sin(y * 1.6) * 0.5 + 0.5) * 70 + Math.random() * 60 + 60;
    const i = (y * 256 + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = w; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  _fabric = new THREE.CanvasTexture(c); _fabric.wrapS = _fabric.wrapT = THREE.RepeatWrapping; _fabric.repeat.set(6, 6);
  return _fabric;
}
function clothMat(color, o = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: o.r ?? 0.86, metalness: 0, bumpMap: fabricTexture(), bumpScale: o.bump ?? 0.5,
    sheen: 0.3, sheenColor: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.1), sheenRoughness: 0.8,
    transparent: !!o.ghost, opacity: o.ghost ? 0.55 : 1, side: o.side || THREE.FrontSide });
}
const Ga = (x, y, z, cx, cy, cz, sx, sy, sz) => Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2 + ((z - cz) / sz) ** 2));
const HEAD_R = [0.104, 0.124, 0.108];
function headShape(race) {
  const wide = race === "orc" || race === "dwarf" ? 1.08 : race === "elf" || race === "fae" ? 0.94 : 1;
  return (x, y, z) => {   // unit-sphere direction → sculpted point (before scaling to metres)
    let sx = 0.82 * wide, sy = 1.0, sz = 0.93;
    if (y < -0.1) { const t = (-y - 0.1) / 0.9; sx *= 1 - (race === "orc" ? 0.18 : race === "elf" ? 0.45 : 0.36) * t * t; sz *= 1 - 0.08 * t; }
    if (z < -0.2 && y > -0.3) sz *= 1.07;
    let X = x * sx, Y = y * sy, Z = z * sz, d = 0;
    if (z > 0) {
      d += 0.13 * Ga(x, y, z, 0, -0.1, 1, 0.085, 0.22, 0.3);                        // nose
      d += 0.06 * Ga(x, y, z, 0, -0.27, 0.96, 0.13, 0.07, 0.2);                     // nose tip & nostrils
      d -= 0.06 * (Ga(x, y, z, 0.35, 0.1, 0.93, 0.16, 0.1, 0.3) + Ga(x, y, z, -0.35, 0.1, 0.93, 0.16, 0.1, 0.3));   // eye sockets
      d += (race === "orc" ? 0.085 : 0.04) * Ga(x, y, z, 0, 0.27, 0.95, 0.5, 0.08, 0.3); // brow ridge
      d += (race === "revenant" ? -0.06 : 0.035) * (Ga(x, y, z, 0.55, -0.1, 0.82, 0.18, 0.12, 0.3) + Ga(x, y, z, -0.55, -0.1, 0.82, 0.18, 0.12, 0.3));   // cheekbones
      d += 0.033 * Ga(x, y, z, 0, -0.5, 0.97, 0.17, 0.05, 0.2) + 0.03 * Ga(x, y, z, 0, -0.62, 0.95, 0.14, 0.05, 0.2);   // lips
      d -= 0.02 * Ga(x, y, z, 0, -0.56, 0.98, 0.17, 0.015, 0.2);                     // mouth line
      d += 0.05 * Ga(x, y, z, 0, -0.9, 0.42, 0.25, 0.15, 0.4);                       // chin
    }
    const L = Math.hypot(X, Y, Z) || 1;
    return new THREE.Vector3((X + X / L * d) * HEAD_R[0], (Y + Y / L * d) * HEAD_R[1], (Z + Z / L * d) * HEAD_R[2]);
  };
}
function sculptHead(race) {
  const f = headShape(race);
  const geo = new THREE.SphereGeometry(1, 72, 54), p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const q = f(v.x, v.y, v.z); p.setXYZ(i, q.x, q.y, q.z); }
  const smoothGeo = smooth(geo);
  // at(): a point on the face surface for direction (x,y,z), pushed out by `off` metres
  const at = (x, y, z, off = 0) => { const n = new THREE.Vector3(x, y, z).normalize(); const q = f(n.x, n.y, n.z); return q.add(q.clone().normalize().multiplyScalar(off)); };
  return { geo: smoothGeo, at };
}
function sculptHair(style, race) {
  if (style === "bald") return null;
  const f = headShape(race), out = [];
  const shell = (scale, keep, ripple = 1) => {   // a hair shell following the skull, trimmed by keep(x,y,z)
    const geo = new THREE.SphereGeometry(1, 64, 48), p = geo.attributes.position, v = new THREE.Vector3();
    const idx = geo.index.array, keepIdx = [];
    const ok = [];
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      ok[i] = keep(v.x, v.y, v.z);
      const q = f(v.x, v.y, v.z).multiplyScalar(scale);
      const a = Math.atan2(v.x, v.z), strand = 1 + ripple * (0.012 * Math.sin(a * 46 + v.y * 6) + 0.006 * Math.sin(a * 97));
      p.setXYZ(i, q.x * strand, q.y * (1 + 0.004 * Math.sin(a * 46)), q.z * strand);
    }
    for (let t = 0; t < idx.length; t += 3) if (ok[idx[t]] && ok[idx[t + 1]] && ok[idx[t + 2]]) keepIdx.push(idx[t], idx[t + 1], idx[t + 2]);
    geo.setIndex(keepIdx);
    return smooth(geo);
  };
  // hairline: covers the top & back, leaves the face and ears free; a little fringe dips at the forehead
  const hairline = (x, y, z) => y > 0.42 - (z > 0.4 ? -0.08 * Math.cos(x * 9) : 0) || (z < 0.15 && y > -0.05 && Math.abs(x) < 0.92) || (z < -0.3 && y > -0.45);
  if (style === "short" || style === "long" || style === "bun" || style === "braids") out.push(shell(1.075, hairline));
  if (style === "long") {
    // flowing locks: tapered tubes that start on the scalp and fall over the back and shoulders
    const N = 34;
    for (let k = 0; k < N; k++) {
      const az = Math.PI * (0.38 + 1.24 * (k / (N - 1))) + Math.sin(k * 7.3) * 0.05;   // around the back, ear to ear
      const el = 0.25 + (k % 3) * 0.12;
      const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
      const st = f(dir.x, dir.y, dir.z).multiplyScalar(1.07);
      const out2 = new THREE.Vector3(dir.x, 0, dir.z).normalize();
      const side = Math.abs(Math.sin(az));
      const len = 0.24 + 0.06 * Math.sin(k * 3.1) - side * 0.05;
      const pts = [];
      for (let j = 0; j <= 6; j++) { const t = j / 6;
        pts.push(st.clone().add(out2.clone().multiplyScalar(0.012 + t * (0.02 + side * 0.035))).add(new THREE.Vector3(Math.sin(k * 2.1 + t * 4) * 0.006, -len * t * t * 0.4 - len * t * 0.6, -t * 0.02 * (1 - side)))); }
      const curve = new THREE.CatmullRomCurve3(pts), TS = 18, RS = 6, rad = 0.016 + 0.004 * Math.sin(k * 5.7);
      const g = new THREE.TubeGeometry(curve, TS, rad, RS);
      const pp = g.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
      for (let i = 0; i <= TS; i++) { const t = i / TS; curve.getPointAt(t, c); const tap = (1 - 0.8 * t) * (t < 0.1 ? 0.7 + 3 * t : 1);
        for (let r = 0; r <= RS; r++) { const n = i * (RS + 1) + r; v.fromBufferAttribute(pp, n).sub(c); v.y *= 1; v.multiplyScalar(tap); const flat = out2.clone().multiplyScalar(v.dot(out2) * -0.45); v.add(flat); pp.setXYZ(n, c.x + v.x, c.y + v.y, c.z + v.z); } }
      g.computeVertexNormals(); out.push(g);
    }
  }
  if (style === "bun") { const b = new THREE.SphereGeometry(0.05, 24, 16); b.translate(0, 0.115, -0.075); out.push(b); }
  if (style === "braids") for (const sx of [-1, 1]) {
    const pts = []; for (let k = 0; k <= 10; k++) pts.push(new THREE.Vector3(sx * (0.09 - k * 0.002) + Math.sin(k * 1.9) * 0.006, -0.02 - k * 0.028, -0.03 + Math.cos(k * 1.9) * 0.006));
    out.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.017, 8));
  }
  if (style === "spiky") {
    out.push(shell(1.06, (x, y, z) => y > 0.35 || (z < 0 && y > -0.1)));
    for (let k = 0; k < 14; k++) {
      const a = k / 14 * Math.PI * 2, el = 0.55 + (k % 3) * 0.12;
      const dir = new THREE.Vector3(Math.sin(a) * Math.cos(el), Math.sin(el), Math.cos(a) * Math.cos(el) - 0.15).normalize();
      const c = new THREE.ConeGeometry(0.022, 0.1, 6); c.translate(0, 0.05, 0);
      c.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir));
      const base = f(dir.x, dir.y, dir.z); c.translate(base.x, base.y, base.z); out.push(c);
    }
  }
  if (style === "mohawk") {
    out.push(shell(1.03, (x, y, z) => Math.abs(x) < 0.16 && y > 0.1, 0.5));
    for (let k = 0; k < 7; k++) { const el = 0.2 + k * 0.38; const dir = new THREE.Vector3(0, Math.sin(el), Math.cos(el)); const c = new THREE.ConeGeometry(0.016, 0.09, 4); c.scale(1, 1, 0.5); c.translate(0, 0.045, 0); c.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)); const base = f(dir.x, dir.y, dir.z); c.translate(base.x, base.y, base.z); out.push(c); }
  }
  if (style === "hood") {
    out.push(shell(1.28, (x, y, z) => !(z > 0.45 && y < 0.55 && y > -0.75 && Math.abs(x) < 0.8) && y > -0.9, 0.3));
    const drape = new THREE.CylinderGeometry(0.13, 0.2, 0.16, 32, 2, true); drape.translate(0, -0.15, -0.01); out.push(drape);
  }
  return out;
}
function sculptBeard() {
  const g = new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const a = Math.atan2(x, z); const s = 1 + 0.06 * Math.sin(a * 24 + y * 8); p.setXYZ(i, x * 0.085 * s, y * 0.13 - (y < 0 ? 0.04 * -y : 0), (z * 0.06 + 0.01) * s); }
  g.computeVertexNormals();
  return g;
}

const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.8, metalness: o.m ?? 0, emissive: o.e || 0x000000, emissiveIntensity: o.ei ?? 1, transparent: !!o.t, opacity: o.op ?? 1, side: o.side || THREE.FrontSide });
const mesh = (geo, m, cast = true) => { const x = new THREE.Mesh(geo, m); x.castShadow = cast; x.receiveShadow = false; return x; };

// Attach an object to a bone. Offsets and rotations are in the character's own space (metres, +Y up, +Z forward),
// measured in the bind pose, so attachments line up no matter how each bone's axes are oriented.
const _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _v = new THREE.Vector3(), _rq = new THREE.Quaternion();
function attach(bone, obj, pos = [0, 0, 0], rot = [0, 0, 0], rootQ = null) {
  const holder = new THREE.Group();
  bone.getWorldQuaternion(_q); bone.getWorldScale(_s);
  const inv = _q.clone().invert();
  if (rootQ) inv.multiply(rootQ);
  holder.quaternion.copy(inv).multiply(_rq.setFromEuler(new THREE.Euler(...rot)));
  _v.set(...pos).applyQuaternion(rootQ || new THREE.Quaternion()).applyQuaternion(_q.clone().invert());
  holder.position.copy(_v).multiplyScalar(1 / _s.x);
  holder.scale.setScalar(1 / _s.x);
  holder.add(obj);
  bone.add(holder);
  return holder;
}

/**
 * look: { race, skin, hair, hairColor, eyes, mark, order, calling, cloth?, trim?, crown?, demonWings?, ghost? }
 * returns { root, mixer, bones, play(name), aim(...), handWorld(v), update(dt) }
 */
export function buildCharacter(look, opt = {}) {
  const race = RACES[look.race] ? look.race : "human";
  const calling = CALLINGS[look.calling] ? look.calling : "elementalist";
  const skinC = okColor(look.skin) || "#e8b896";
  const hairC = okColor(look.hairColor) || "#4a2c17";
  const eyeC = okColor(look.eyes) || "#3b2a1a";
  const ordC = okColor(look.trim) || ORDERS[look.order]?.color || "#f5c542";
  const clothC = okColor(look.cloth) || CALLINGS[calling].color;
  // the base suit (sleeves & legs) uses the outfit's undercloth colour
  const suitC = okColor(look.cloth) || { lifebinder: "#b9ad97", shadowblade: "#2a2236", warden: "#3a3f4a", elementalist: "#7a2e12" }[calling];
  const style = HAIR_STYLES.includes(look.hair) ? look.hair : "short";

  const model = SkeletonUtils.clone(base.scene);
  const root = new THREE.Group();
  root.add(model);
  const body = { dwarf: [1.12, 0.82], orc: [1.12, 1.06], fae: [0.92, 0.96], elf: [0.96, 1.04], dragonkin: [1.05, 1.04], revenant: [0.95, 1] }[race] || [1, 1];
  model.scale.multiply(new THREE.Vector3(body[0], body[1], body[0]));
  if (opt.scale) root.scale.setScalar(opt.scale);

  const ghost = !!look.ghost;
  const suit = clothMat(suitC, { ghost });
  const joints = clothMat(new THREE.Color(suitC).multiplyScalar(0.8), { ghost });
  model.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true;
      o.frustumCulled = false;
      o.material = /Joints/i.test(o.material.name) ? joints : suit;
    }
  });
  const bones = {};
  model.traverse(o => { if (o.isBone) bones[o.name.replace(/^mixamorig:?/, "")] = o; });
  model.updateMatrixWorld(true);

  const skin = new THREE.MeshPhysicalMaterial({ color: skinC, roughness: 0.52, sheen: 0.35, sheenColor: new THREE.Color(skinC).lerp(new THREE.Color(0xff9a8a), 0.4), sheenRoughness: 0.6 });
  const hairM = new THREE.MeshPhysicalMaterial({ color: hairC, roughness: 0.48, sheen: 1, sheenColor: new THREE.Color(hairC).lerp(new THREE.Color(0xffffff), 0.35), sheenRoughness: 0.35 });
  const trim = mat(ordC, { r: 0.35, m: 0.55 });
  const gold = mat(0xd4a017, { r: 0.3, m: 0.95 });
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xc3c8d1, roughness: 0.27, metalness: 0.95, clearcoat: 0.4, clearcoatRoughness: 0.3 });
  const darkMetal = new THREE.MeshPhysicalMaterial({ color: 0x5b6270, roughness: 0.35, metalness: 0.9 });
  const leather = clothMat(0x3b2a1f, { r: 0.7, bump: 0.25 });
  const darkLeather = clothMat(0x1c1622, { r: 0.65, bump: 0.25 });
  const wood = clothMat(0x5b3a1e, { r: 0.75, bump: 0.4 });

  // ---------- head: a sculpted skull (not a ball) ----------
  bones.Head.scale.setScalar(0.001);   // hide the mannequin head; we build our own
  const head = new THREE.Group();
  const { geo: headGeo, at } = sculptHead(race);
  head.add(mesh(headGeo, skin));
  const lipM = mat(new THREE.Color(skinC).lerp(new THREE.Color(0xb4535a), 0.35), { r: 0.45 });
  const lips = mesh(new THREE.SphereGeometry(1, 20, 10), lipM, false); lips.scale.set(0.017, 0.0055, 0.006); lips.position.copy(at(0, -0.53, 0.97, -0.002)); head.add(lips);
  const glow = race === "revenant" || race === "dragonkin" || look.mark === "runes";
  const eyeWhite = mat(race === "revenant" ? 0x0b0b10 : 0xf6f1ea, { r: 0.15 });
  const irisM = mat(eyeC, { r: 0.25, e: glow ? eyeC : 0x000000, ei: glow ? 3 : 0 });
  const pupilM = mat(0x050505, { r: 0.1 });
  const browM = style === "bald" || style === "hood" ? mat(new THREE.Color(skinC).multiplyScalar(0.62)) : hairM;
  for (const sx of [-1, 1]) {
    const c = at(sx * 0.35, 0.1, 0.93, -0.012);
    const eye = new THREE.Group(); eye.position.copy(c);
    eye.add(mesh(new THREE.SphereGeometry(0.0145, 20, 14), eyeWhite, false));
    const iris = mesh(new THREE.CircleGeometry(0.0078, 20), irisM, false); iris.position.z = 0.0142; eye.add(iris);
    const pupil = mesh(new THREE.CircleGeometry(0.0034, 14), pupilM, false); pupil.position.z = 0.0145; eye.add(pupil);
    const lid = mesh(new THREE.SphereGeometry(0.0158, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), skin, false); lid.rotation.x = 0.35; eye.add(lid);
    const low = mesh(new THREE.SphereGeometry(0.0152, 20, 6, 0, Math.PI * 2, Math.PI * 0.78, Math.PI * 0.22), skin, false); eye.add(low);
    eye.rotation.y = sx * 0.12;
    head.add(eye);
    // eyebrow: a thin curved strand along the brow ridge
    const b0 = at(sx * 0.18, 0.27, 0.97, 0.003), b1 = at(sx * 0.35, 0.31, 0.93, 0.004), b2 = at(sx * 0.52, 0.26, 0.85, 0.002);
    if (race === "orc") { b0.y -= 0.004; }
    head.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([b0, b1, b2]), 12, race === "dwarf" || race === "orc" ? 0.0042 : 0.003, 6), browM, false));
    // ears
    const ear = new THREE.Group(); ear.position.copy(at(sx * 0.99, 0.02, 0.0, -0.004));
    if (race === "elf" || race === "fae") {
      const e = mesh(new THREE.ConeGeometry(0.02, 0.12, 12), skin); e.scale.z = 0.35; e.rotation.set(0.25, 0, -sx * 1.05); e.position.set(sx * 0.035, 0.035, -0.012); ear.add(e);
    } else if (race === "orc") {
      const e = mesh(new THREE.ConeGeometry(0.024, 0.075, 12), skin); e.scale.z = 0.4; e.rotation.set(0.2, 0, -sx * 1.25); e.position.set(sx * 0.02, 0.015, 0); ear.add(e);
    } else if (race === "merfolk") {
      const e = mesh(new THREE.ConeGeometry(0.035, 0.1, 5), mat(new THREE.Color(skinC).multiplyScalar(0.78), { r: 0.35 })); e.scale.z = 0.25; e.rotation.set(0.6, 0, -sx * 1.4); e.position.set(sx * 0.03, 0.01, -0.02); ear.add(e);
    } else if (race !== "beastkin") {
      const e = mesh(new THREE.SphereGeometry(0.024, 16, 12), skin); e.scale.set(0.38, 1, 0.75); ear.add(e);
      const fold = mesh(new THREE.TorusGeometry(0.014, 0.003, 6, 14, Math.PI * 1.4), skin); fold.rotation.set(0, sx * Math.PI / 2, 0.6); fold.position.x = sx * 0.006; ear.add(fold);
    }
    head.add(ear);
    if (race === "beastkin") {
      const e = new THREE.Group(); e.position.copy(at(sx * 0.55, 0.78, -0.05, 0));
      const outer = mesh(new THREE.ConeGeometry(0.038, 0.09, 4), hairM); outer.scale.z = 0.45; e.add(outer);
      const inner = mesh(new THREE.ConeGeometry(0.024, 0.06, 3), mat(0xf9a8d4, { r: 0.6 }), false); inner.position.set(0, -0.006, 0.012); inner.scale.z = 0.3; e.add(inner);
      e.rotation.z = -sx * 0.35; head.add(e);
    }
    if (race === "orc") { const t = mesh(new THREE.ConeGeometry(0.006, 0.028, 8), mat(0xfffbeb, { r: 0.3 })); t.position.copy(at(sx * 0.12, -0.6, 0.97, 0.004)); t.rotation.x = -0.2; head.add(t); }
    if (race === "dragonkin") {
      const curve = new THREE.CatmullRomCurve3([at(sx * 0.4, 0.75, 0.1, -0.01), at(sx * 0.55, 0.95, -0.35, 0.03), at(sx * 0.5, 1.05, -0.85, 0.09)]);
      head.add(mesh(new THREE.TubeGeometry(curve, 16, 0.014, 8, false), mat(0xe7e0d0, { r: 0.35 })));
      for (let k = 0; k < 3; k++) { const sc = mesh(new THREE.SphereGeometry(0.009, 8, 6), mat(new THREE.Color(skinC).multiplyScalar(0.75), { r: 0.3, m: 0.3 }), false); sc.position.copy(at(sx * (0.62 + k * 0.08), -0.05 - k * 0.12, 0.7, 0.002)); sc.scale.z = 0.4; head.add(sc); }
    }
    if (look.mark === "warpaint" || look.mark === "runes") { const pm = mat(ordC, { r: 0.6, e: look.mark === "runes" ? ordC : 0x000000, ei: 2.5 }); for (let k = 0; k < 2; k++) { const st = mesh(new THREE.BoxGeometry(0.03, 0.004, 0.003), pm, false); st.position.copy(at(sx * 0.42, -0.08 - k * 0.07, 0.9, 0.002)); st.rotation.y = sx * 0.4; head.add(st); } }
    if (look.mark === "scar" && sx > 0) { const sc = mesh(new THREE.BoxGeometry(0.003, 0.05, 0.003), mat(0xa34a52, { r: 0.5 }), false); sc.position.copy(at(0.33, 0.12, 0.95, 0.004)); sc.rotation.z = 0.35; head.add(sc); }
    if (look.mark === "freckles") for (let k = 0; k < 5; k++) { const f = mesh(new THREE.CircleGeometry(0.0017, 6), mat(new THREE.Color(skinC).multiplyScalar(0.7)), false); const pp = at(sx * (0.3 + (k % 3) * 0.08), -0.12 - Math.floor(k / 3) * 0.06, 0.92, 0.0015); f.position.copy(pp); f.lookAt(pp.clone().multiplyScalar(2)); head.add(f); }
  }
  if (race === "dwarf") {
    const beard = mesh(sculptBeard(), hairM); beard.position.copy(at(0, -0.62, 0.7, 0)); head.add(beard);
    const mo = mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 16, Math.PI), hairM); mo.position.copy(at(0, -0.43, 0.99, 0.004)); mo.rotation.z = Math.PI; head.add(mo);
  }
  // hair
  const hairGeo = sculptHair(style, race);
  if (hairGeo) for (const g of hairGeo) head.add(mesh(g, style === "hood" ? clothMat(calling === "lifebinder" ? 0xcfc5b2 : new THREE.Color(clothC).multiplyScalar(0.72), { side: THREE.DoubleSide }) : hairM));
  if (look.crown) {
    const crown = new THREE.Group();
    crown.add(mesh(new THREE.CylinderGeometry(0.098, 0.104, 0.035, 24, 1, true), gold));
    for (let k = 0; k < 8; k++) { const sp = mesh(new THREE.ConeGeometry(0.014, 0.05, 6), gold); const a = k / 8 * Math.PI * 2; sp.position.set(Math.sin(a) * 0.1, 0.04, Math.cos(a) * 0.1); crown.add(sp); }
    const gem = mesh(new THREE.OctahedronGeometry(0.012), mat(0xef4444, { e: 0xef4444, ei: 1.5, r: 0.1 })); gem.position.set(0, 0.01, 0.104); crown.add(gem);
    crown.position.y = 0.105; head.add(crown);
  }
  if (calling === "shadowblade" && style !== "hood") { const m = mesh(new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, Math.PI * 0.56, Math.PI * 0.3), clothMat(0x16121d)); m.scale.set(0.11, 0.13, 0.12); head.add(m); }
  const neck = mesh(new THREE.CylinderGeometry(0.046, 0.058, 0.12, 20), skin); neck.position.y = -0.11;
  head.add(neck);
  attach(bones.Neck, head, [0, 0.125, 0.015]);

  // ---------- outfit ----------
  const folds = (geo, amount, n, from = 0) => {   // ripple a lathe/cylinder into cloth folds
    const p = geo.attributes.position, v = new THREE.Vector3();
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < p.count; i++) { minY = Math.min(minY, p.getY(i)); maxY = Math.max(maxY, p.getY(i)); }
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const t = Math.max(0, ((maxY - v.y) / (maxY - minY) - from) / (1 - from));
      const a = Math.atan2(v.x, v.z), k = 1 + amount * t * (Math.sin(a * n) * 0.7 + Math.sin(a * n * 2.3 + 1) * 0.3);
      p.setXYZ(i, v.x * k, v.y, v.z * k);
    }
    geo.computeVertexNormals();
    return geo;
  };
  // lathe profiles are written top→bottom; three.js wants bottom→top so the outside faces outward
  const lathe = (pts, seg = 40) => new THREE.LatheGeometry(pts.slice().sort((p, q) => p[1] - q[1]).map(([x, y]) => new THREE.Vector2(x, y)), seg);
  const robe = (c, long = true) => {
    const g = new THREE.Group();
    const skirt = mesh(folds(lathe([[0.15, 0.1], [0.162, 0.02], [0.17, -0.12], [0.195, -0.32], [0.225, -0.52], [0.26, long ? -0.74 : -0.45]]), 0.06, 11, 0.15), clothMat(c, { side: THREE.DoubleSide }));
    skirt.scale.z = 0.85; g.add(skirt);
    const hem = mesh(new THREE.TorusGeometry(0.26, 0.012, 6, 48), trim); hem.rotation.x = Math.PI / 2; hem.position.y = long ? -0.74 : -0.45; hem.scale.y = 0.85; g.add(hem);
    const belt = mesh(new THREE.TorusGeometry(0.168, 0.016, 8, 40), leather); belt.rotation.x = Math.PI / 2; belt.scale.y = 0.85; belt.position.y = 0.07; g.add(belt);
    const buckle = mesh(new THREE.BoxGeometry(0.045, 0.035, 0.012), gold); buckle.position.set(0, 0.07, 0.145); g.add(buckle);
    const panel = mesh(folds(new THREE.CylinderGeometry(0.06, 0.09, 0.62, 12, 6, true, -0.5, 1), 0.04, 6), clothMat(ordC, { side: THREE.DoubleSide })); panel.position.set(0, -0.26, 0.04); panel.scale.z = 2.2; g.add(panel);
    return g;
  };
  const mantle = (c) => {   // a shoulder mantle with a high collar
    const g = new THREE.Group();
    const m = mesh(folds(lathe([[0.065, 0.13], [0.1, 0.1], [0.16, 0.05], [0.2, -0.01], [0.215, -0.07]], 40), 0.04, 9), clothMat(c, { side: THREE.DoubleSide }));
    m.scale.set(1.08, 0.9, 0.8); g.add(m);
    const edge = mesh(new THREE.TorusGeometry(0.215, 0.009, 6, 48), trim); edge.rotation.x = Math.PI / 2; edge.scale.set(1.08, 0.8, 1); edge.position.y = -0.063; g.add(edge);
    return g;
  };
  const boots = (m, plate) => {
    for (const [b, sx] of [[bones.LeftLeg, 1], [bones.RightLeg, -1]]) {
      const g = new THREE.Group();
      const shin = mesh(lathe([[0.052, 0.06], [0.06, 0], [0.058, -0.2], [0.05, -0.3], [0.058, -0.36]], 24), m); g.add(shin);
      const cuff = mesh(new THREE.TorusGeometry(0.062, 0.01, 6, 24), plate ? gold : leather); cuff.rotation.x = Math.PI / 2; cuff.position.y = 0.05; g.add(cuff);
      if (plate) { const knee = mesh(new THREE.SphereGeometry(0.052, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), metal); knee.position.set(0, 0.08, 0.03); knee.rotation.x = 1.2; g.add(knee); }
      attach(b, g, [0, -0.12, 0.005]);
    }
  };
  const bracers = (m) => {
    for (const [b, sx] of [[bones.LeftForeArm, 1], [bones.RightForeArm, -1]]) {
      const br = mesh(lathe([[0.042, 0.08], [0.048, 0.04], [0.05, -0.06], [0.044, -0.1]], 20), m); br.rotation.z = sx * Math.PI / 2;
      attach(b, br, [sx * 0.14, 0, 0]);
    }
  };
  const bodice = (c) => {   // the upper robe, from chest to waist
    const b = mesh(folds(lathe([[0.09, 0.25], [0.135, 0.2], [0.152, 0.1], [0.138, 0.0], [0.118, -0.1], [0.128, -0.17], [0.15, -0.23]], 40), 0.012, 9), clothMat(c));
    b.scale.set(1.08, 1, 1.12); b.position.z = 0.015; return b;
  };
  if (calling === "elementalist") {
    attach(bones.Spine1, bodice(clothC), [0, 0.02, 0.0]);
    attach(bones.Hips, robe(clothC), [0, 0.02, 0]);
    attach(bones.Spine2, mantle(new THREE.Color(clothC).multiplyScalar(0.7)), [0, 0.13, -0.01]);
    boots(leather); bracers(trim);
  }
  if (calling === "lifebinder") {
    attach(bones.Spine1, bodice(0xd6ccb8), [0, 0.02, 0.0]);
    attach(bones.Hips, robe(0xc9bea8), [0, 0.02, 0]);
    attach(bones.Spine2, mantle(new THREE.Color(ordC).multiplyScalar(0.8)), [0, 0.13, -0.01]);
    const sash = mesh(new THREE.TorusGeometry(0.19, 0.022, 6, 40, Math.PI * 1.1), clothMat(ordC)); sash.rotation.set(0.1, 0, 0.75); attach(bones.Spine1, sash, [0, 0.05, 0.02]);
    boots(clothMat(0x8a7b66)); bracers(gold);
  }
  if (calling === "warden" || look.cape) {
    // cape with folds that sways
    const capeGeo = new THREE.PlaneGeometry(0.56, 1.08, 10, 18);
    { const p = capeGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, Math.sin(x * 22) * 0.015 * (0.6 - y) - (0.54 - y) * 0.05); p.setX(i, x * (1 + (0.54 - y) * 0.35)); } capeGeo.computeVertexNormals(); }
    capeGeo.translate(0, -0.54, 0);
    const capeMat = clothMat(new THREE.Color(ordC).multiplyScalar(0.7), { side: THREE.DoubleSide, r: 0.95 }); capeMat.sheen = 0.15;
    const cape = mesh(capeGeo, capeMat);
    cape.userData.base = capeGeo.attributes.position.array.slice();
    const capeG = new THREE.Group(); capeG.add(cape); capeG.rotation.x = 0.1;
    attach(bones.Spine2, capeG, [0, 0.14, -0.12]);
    root.userData.cape = cape;
  }
  if (calling === "warden") {
    // layered pauldrons
    for (const [b, sx] of [[bones.LeftArm, 1], [bones.RightArm, -1]]) {
      const g = new THREE.Group();
      for (let k = 0; k < 3; k++) { const p = mesh(new THREE.SphereGeometry(0.105 - k * 0.012, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), k === 0 ? metal : darkMetal); p.position.y = -k * 0.03; p.scale.set(1.05, 0.62, 1.05); g.add(p); }
      const rim = mesh(new THREE.TorusGeometry(0.105, 0.008, 6, 32), gold); rim.rotation.x = Math.PI / 2; g.add(rim);
      g.rotation.z = -sx * 0.25;
      attach(b, g, [sx * 0.03, 0.04, 0]);
    }
    // curved breastplate
    const plate = mesh(lathe([[0.1, 0.2], [0.145, 0.15], [0.16, 0.04], [0.155, -0.08], [0.14, -0.17]], 40), metal); plate.scale.set(1.1, 1, 1.18); plate.position.z = 0.02;
    const plateG = new THREE.Group(); plateG.add(plate);
    const ridge = mesh(new THREE.BoxGeometry(0.012, 0.3, 0.02), gold); ridge.position.set(0, -0.01, 0.205); plateG.add(ridge);
    const crest = mesh(new THREE.CircleGeometry(0.042, 24), trim, false); crest.position.set(0, 0.05, 0.212); plateG.add(crest);
    attach(bones.Spine1, plateG, [0, 0.08, 0.02]);
    // tassets (hip plates)
    const tass = new THREE.Group();
    for (let k = 0; k < 5; k++) { const a = -0.9 + k * 0.45; const t = mesh(new THREE.BoxGeometry(0.1, 0.16, 0.012), k % 2 ? darkMetal : metal); t.position.set(Math.sin(a) * 0.18, -0.08, Math.cos(a) * 0.15); t.rotation.set(0.15, a, 0); tass.add(t); }
    const belt = mesh(new THREE.TorusGeometry(0.17, 0.018, 8, 40), leather); belt.rotation.x = Math.PI / 2; belt.scale.y = 0.85; tass.add(belt);
    attach(bones.Hips, tass, [0, 0.05, 0]);
    boots(metal, true); bracers(metal);
  }
  if (calling === "shadowblade") {
    const jerkin = mesh(folds(lathe([[0.15, 0.3], [0.185, 0.22], [0.19, 0.05], [0.17, -0.12], [0.2, -0.32]], 40), 0.03, 8, 0.6), darkLeather);
    jerkin.scale.set(0.92, 1, 1.0); attach(bones.Spine, jerkin, [0, 0.02, 0.015]);
    const strap = mesh(new THREE.TorusGeometry(0.2, 0.012, 6, 40), leather); strap.rotation.set(0.15, 0, 0.8); strap.scale.y = 0.78; attach(bones.Spine1, strap, [0, 0.05, 0]);
    const scarf = mesh(new THREE.TorusGeometry(0.075, 0.028, 10, 24), clothMat(0x241b30)); scarf.rotation.x = Math.PI / 2; attach(bones.Neck, scarf, [0, 0.03, 0.005]);
    const tails = mesh(folds(new THREE.CylinderGeometry(0.2, 0.24, 0.32, 24, 4, true, Math.PI * 0.6, Math.PI * 0.8), 0.05, 7), clothMat(0x16121d, { side: THREE.DoubleSide }));
    tails.scale.z = 0.8; attach(bones.Hips, tails, [0, -0.12, 0]);
    boots(darkLeather); bracers(leather);
  }
  const emblem = mesh(new THREE.CircleGeometry(0.03, 24), mat(ordC, { e: ordC, ei: 0.8, m: 0.6, r: 0.3 }), false);
  if (calling !== "warden") attach(bones.Spine2, emblem, [-0.09, 0.09, 0.15]);

  // ---------- race extras ----------
  let wings = null;
  if (race === "fae" || look.demonWings) {
    wings = new THREE.Group();
    const wm = look.demonWings ? mat(0x450a0a, { r: 0.7, side: THREE.DoubleSide }) : mat(0xe0f2fe, { t: true, op: 0.5, e: 0x7dd3fc, ei: 0.4, side: THREE.DoubleSide });
    for (const sx of [-1, 1]) {
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.bezierCurveTo(0.2, 0.5, 0.55, 0.45, 0.5, 0.1); sh.bezierCurveTo(0.45, -0.2, 0.2, -0.3, 0, 0);
      const w = mesh(new THREE.ShapeGeometry(sh), wm); w.scale.set(sx, 1, 1); w.rotation.y = -sx * 0.5;
      const pivot = new THREE.Group(); pivot.add(w); pivot.userData.sx = sx; wings.add(pivot);
    }
    attach(bones.Spine2, wings, [0, 0.1, -0.12]);
  }
  if (race === "beastkin" || race === "dragonkin") {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.15, -0.2), new THREE.Vector3(0, -0.05, -0.45), new THREE.Vector3(0, 0.12, -0.55)]);
    const tail = mesh(new THREE.TubeGeometry(curve, 20, race === "dragonkin" ? 0.045 : 0.03, 8), race === "dragonkin" ? mat(new THREE.Color(skinC).multiplyScalar(0.85)) : hairM);
    attach(bones.Hips, tail, [0, 0, -0.1]);
  }

  // ---------- weapons (held in the hands) ----------
  // Weapons live in the character's space and are placed every frame from the real hand/elbow positions.
  const handR = new THREE.Group(), handL = new THREE.Group();
  root.add(handR, handL);
  let orb = null, light = null;
  if (calling === "elementalist" || calling === "lifebinder") {
    const staff = new THREE.Group();
    const pole = mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.6, 10), calling === "lifebinder" ? mat(0xf5f5f4, { r: 0.4 }) : wood);
    staff.add(pole);
    const color = calling === "lifebinder" ? 0x67e8f9 : 0xff7a1a;
    orb = mesh(calling === "lifebinder" ? new THREE.OctahedronGeometry(0.07) : new THREE.SphereGeometry(0.065, 20, 16), mat(color, { e: color, ei: 3, r: 0.2 }), false);
    orb.position.y = 0.86; staff.add(orb);
    const claw = mesh(new THREE.TorusGeometry(0.08, 0.012, 6, 16, Math.PI * 1.4), calling === "lifebinder" ? trim : wood); claw.position.y = 0.84; claw.rotation.z = Math.PI * 1.2; staff.add(claw);
    light = new THREE.PointLight(color, 1.2, 4, 2); light.position.y = 0.86; staff.add(light);
    staff.position.y = 0.1;
    handR.add(staff);
  }
  if (calling === "warden") {
    const hammer = new THREE.Group();
    const handle = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8), wood); hammer.add(handle);
    const headM = mesh(new THREE.BoxGeometry(0.22, 0.12, 0.12), metal); headM.position.y = 0.35; hammer.add(headM);
    hammer.position.y = 0.25;
    handR.add(hammer);
    const shield = new THREE.Group();
    const sh = new THREE.Shape(); sh.moveTo(-0.22, 0.25); sh.lineTo(0.22, 0.25); sh.lineTo(0.22, -0.05); sh.quadraticCurveTo(0.2, -0.3, 0, -0.38); sh.quadraticCurveTo(-0.2, -0.3, -0.22, -0.05); sh.closePath();
    const face = mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 }), trim); shield.add(face);
    const boss = mesh(new THREE.SphereGeometry(0.06, 16, 12), metal); boss.position.z = 0.06; shield.add(boss);
    shield.position.set(0, 0, 0.05);
    handL.add(shield);
  }
  if (calling === "shadowblade") for (const h of [handR, handL]) {
    const d = new THREE.Group();
    const blade = mesh(new THREE.ConeGeometry(0.025, 0.32, 4), mat(0xd4d4d8, { m: 0.9, r: 0.2, e: 0x7c3aed, ei: 0.5 })); blade.position.y = 0.2; blade.scale.z = 0.3; d.add(blade);
    const grip = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 6), mat(0x4c1d95)); d.add(grip);
    d.position.y = 0.04; h.add(d);
  }

  // name the moving parts so clones can find them
  handR.name = "__handR"; handL.name = "__handL";
  if (wings) wings.name = "__wings";
  if (orb) orb.name = "__orb";
  if (light) light.name = "__light";
  if (root.userData.cape) root.userData.cape.name = "__cape";
  root.userData.calling = calling;
  return makeActor(root, look);
}

// Build an actor once per monster type, then copy it cheaply.
export function cloneActor(tpl) { return makeActor(SkeletonUtils.clone(tpl.root), tpl.look); }

function makeActor(root, look) {
  const model = root.children.find(c => !c.name.startsWith("__")) || root.children[0];
  const calling = root.userData.calling;
  const find = n => root.getObjectByName(n);
  const handR = find("__handR"), handL = find("__handL"), wings = find("__wings"), orb = find("__orb"), light = find("__light"), cape = find("__cape");
  const bones = {};
  model.traverse(o => { if (o.isBone) bones[o.name.replace(/^mixamorig:?/, "")] = o; });
  const mixer = new THREE.AnimationMixer(model);
  const actions = {};
  for (const clip of base.animations) actions[clip.name] = mixer.clipAction(clip);
  let current = null;
  function play(name, fade = 0.2, speed = 1) {
    const a = actions[name];
    if (!a) return;
    a.timeScale = speed;
    if (current === a) return;
    a.reset().setEffectiveWeight(1).fadeIn(fade).play();
    if (current) current.fadeOut(fade);
    current = a;
  }
  play("idle", 0);
  mixer.update(Math.random() * 2);

  // Point a bone along a world direction (blend w): used for casting, swinging and blocking.
  const qa = new THREE.Quaternion(), qp = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0);
  function aimBone(bone, dir, w) {
    if (!bone || w <= 0) return;
    bone.parent.getWorldQuaternion(qp);
    qa.setFromUnitVectors(Y, dir.clone().normalize());
    qa.premultiply(qp.invert());
    bone.quaternion.slerp(qa, Math.min(1, w));
    bone.updateMatrixWorld(true);
  }
  const t0 = Math.random() * 10;
  const pH = new THREE.Vector3(), pE = new THREE.Vector3(), dirV = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), rq = new THREE.Quaternion();
  const grip = { staffLean: 0, shieldUp: 0 };
  function placeWeapons() {
    root.getWorldQuaternion(rq).invert();
    for (const [g, hand, fore, left] of [[handR, bones.RightHand, bones.RightForeArm, false], [handL, bones.LeftHand, bones.LeftForeArm, true]]) {
      if (!g) continue;
      hand.getWorldPosition(pH); fore.getWorldPosition(pE);
      dirV.subVectors(pH, pE).normalize();
      const lh = root.worldToLocal(pH.clone());
      g.position.copy(lh);
      const localDir = dirV.clone().applyQuaternion(rq);
      if (!left && (calling === "elementalist" || calling === "lifebinder")) {
        g.quaternion.setFromUnitVectors(up, new THREE.Vector3(0, 1, 0.25 + grip.staffLean).normalize());
        g.position.addScaledVector(localDir, 0.06);
      } else if (left && calling === "warden") {
        g.quaternion.setFromEuler(new THREE.Euler(0, -0.35 + grip.shieldUp * 0.35, 0));
        g.position.copy(root.worldToLocal(pE.clone()).lerp(lh, 0.55)).add(new THREE.Vector3(-0.03, 0, 0.1));
      } else g.quaternion.setFromUnitVectors(up, localDir);
    }
  }
  const capeBase = cape ? cape.geometry.attributes.position.array.slice() : null;
  if (cape) cape.geometry = cape.geometry.clone();   // each clone sways on its own
  function update(dt, time, speed = 0) {
    mixer.update(dt);
    bones.Head.scale.setScalar(0.001);
    if (wings) wings.children.forEach(p => { p.rotation.y = p.userData.sx * (0.15 + Math.sin((time + t0) * (look.demonWings ? 5 : 9)) * 0.35); });
    if (orb) { orb.rotation.y += dt * 2; if (light) light.intensity = 1.1 + Math.sin((time + t0) * 9) * 0.25; }
    if (cape) {   // cloth sway: more when running
      const p = cape.geometry.attributes.position, a = p.array;
      for (let i = 0; i < p.count; i++) { const y = capeBase[i * 3 + 1]; const k = Math.max(0, -y); a[i * 3 + 2] = capeBase[i * 3 + 2] - k * k * (0.25 + speed * 0.35) + Math.sin(time * 4 + y * 5 + capeBase[i * 3] * 3) * 0.02 * k; }
      p.needsUpdate = true; cape.geometry.computeVertexNormals();
    }
    model.updateMatrixWorld(true);
    placeWeapons();
  }
  const handWorld = (left, out = new THREE.Vector3()) => (left ? handL : handR).getWorldPosition(out);
  const tipWorld = (out = new THREE.Vector3()) => orb ? orb.getWorldPosition(out) : handR.getWorldPosition(out);
  return { root, model, mixer, bones, actions, play, aimBone, update, placeWeapons, grip, handWorld, tipWorld, light, calling, look };
}
