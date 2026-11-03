// FRSTBORN: real-time action roguelite. Runs fully on your phone (no server needed for solo play).
import { RACES, HAIR_STYLES, HAIR_COLORS, EYE_COLORS, MARKS, ORDERS, OATH, CALLINGS, HEIRLOOMS, PETS, MONSTERS } from "./data.js";
import { figureEl, portraitEl } from "./figure.js";
import * as W from "./world3d.js";

const $ = s => document.querySelector(s);
const el = (tag, text, cls) => { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; return e; };
const load = (k, d) => { try { const v = localStorage[k]; return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k, v) => { try { localStorage[k] = JSON.stringify(v); } catch {} };
const pick = a => a[Math.floor(Math.random() * a.length)];
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
const TEST = location.hash.includes("tes");
const heroLine = p => `${RACES[p.race]?.name} ${CALLINGS[p.calling]?.name} · ${ORDERS[p.order]?.icon} ${ORDERS[p.order]?.name}`;

// =====================================================================
// CHARACTER CREATOR
// =====================================================================
function randomProfile() {
  const race = pick(Object.keys(RACES));
  return { name: "", race, skin: pick(RACES[race].skins), hair: pick(HAIR_STYLES), hairColor: pick(HAIR_COLORS), eyes: pick(EYE_COLORS),
    mark: pick(Object.keys(MARKS)), order: pick(Object.keys(ORDERS)), calling: pick(Object.keys(CALLINGS)),
    heirloom: pick(Object.keys(HEIRLOOMS)), pet: pick(Object.keys(PETS)) };
}
let profile = load("frstHero", null);
let saved = !!profile?.name;
if (!profile) profile = randomProfile();
let oath = null;

function choiceBtn(field, val, big, title, small, on) {
  const b = el("button", null, "choice" + (on ? " on" : ""));
  b.dataset.set = field; b.dataset.val = val;
  if (big) b.append(el("span", big, "big"));
  b.append(title);
  if (small) b.append(el("small", small));
  return b;
}
function swatch(field, color, on) { const b = el("button", null, "sw" + (on ? " on" : "")); b.style.background = color; b.dataset.set = field; b.dataset.val = color; return b; }
function textBtn(field, val, label, on) { const b = el("button", label, "alt" + (on ? " on" : "")); b.dataset.set = field; b.dataset.val = val; return b; }
function renderCreator() {
  const p = profile;
  clearTimeout(renderCreator.t); renderCreator.t = setTimeout(() => W.preview($("#preview"), { ...profile }).catch(() => $("#preview").replaceChildren(figureEl(profile, 64))), 60);
  $("#pvname").textContent = $("#name").value.trim() || "Your legend";
  $("#pvline").textContent = heroLine(p);
  $("#races").replaceChildren(...Object.entries(RACES).map(([k, r]) => choiceBtn("race", k, r.icon, r.name, null, p.race === k)));
  $("#raceperk").textContent = `${RACES[p.race].name}: ${RACES[p.race].perk}`;
  $("#skins").replaceChildren(...RACES[p.race].skins.map(c => swatch("skin", c, p.skin === c)));
  $("#hairs").replaceChildren(...HAIR_STYLES.map(h => textBtn("hair", h, h[0].toUpperCase() + h.slice(1), p.hair === h)));
  $("#haircolors").replaceChildren(...HAIR_COLORS.map(c => swatch("hairColor", c, p.hairColor === c)));
  $("#eyecolors").replaceChildren(...EYE_COLORS.map(c => swatch("eyes", c, p.eyes === c)));
  $("#marks").replaceChildren(...Object.entries(MARKS).map(([k, n]) => textBtn("mark", k, n, p.mark === k)));
  $("#orders").replaceChildren(...Object.entries(ORDERS).map(([k, o]) => choiceBtn("order", k, o.icon, o.name, `${o.trait} · ${o.perk}`, p.order === k)));
  $("#callings").replaceChildren(...Object.entries(CALLINGS).map(([k, c]) => choiceBtn("calling", k, c.icon, c.name, ABILITY_TEXT[k], p.calling === k)));
  $("#heirlooms").replaceChildren(...Object.entries(HEIRLOOMS).map(([k, h]) => choiceBtn("heirloom", k, h.icon, h.name, h.perk, p.heirloom === k)));
  $("#pets").replaceChildren(...Object.entries(PETS).map(([k, h]) => choiceBtn("pet", k, h.icon, h.name, h.perk, p.pet === k)));
}
function showPage(id) { document.querySelectorAll("section").forEach(s => s.hidden = s.id !== id); }
function renderHome() {
  showPage("home");
  $("#name").value = profile.name || $("#name").value;
  $("#creator").hidden = saved; $("#play").hidden = !saved; $("#herosummary").hidden = !saved;
  if (saved) {
    const box = $("#herosummary");
    box.style.setProperty("--house", ORDERS[profile.order].color);
    const t = el("div");
    t.append(el("div", profile.name, "title"), el("div", heroLine(profile), "muted small"),
      el("div", `${HEIRLOOMS[profile.heirloom].icon} ${HEIRLOOMS[profile.heirloom].name} · ${PETS[profile.pet].icon} ${PETS[profile.pet].name}`, "muted small"));
    box.replaceChildren(figureEl(profile, 70), t);
    const best = load("frstBest", null);
    $("#best").textContent = best ? `Your best: ${best.win ? "🏆 slew the First Dragon" : `floor ${best.floor}`} · level ${best.lvl} · ${best.kills} kills` : "No legend yet. Will you be the first?";
  } else renderCreator();
}
function startOath() { oath = { i: 0, score: {} }; showPage("sorting"); renderOath(); }
function renderOath() {
  const q = OATH[oath.i];
  $("#sortresult").hidden = !!q; $("#sortbox").hidden = !q;
  if (q) {
    $("#sortstep").textContent = `Question ${oath.i + 1} of ${OATH.length}`;
    $("#sortq").textContent = q.q;
    $("#sorta").replaceChildren(...[...q.a].sort(() => Math.random() - 0.5).map(([t, o]) => { const b = el("button", t, "alt"); b.dataset.oath = o; return b; }));
    return;
  }
  const best = Object.entries(oath.score).sort((a, b) => b[1] - a[1] || Math.random() - 0.5)[0][0];
  profile.order = best;
  const o = ORDERS[best];
  $("#sortstep").textContent = "The Oath is sworn…";
  const r = $("#sortresult");
  r.replaceChildren(el("div", o.icon, "bigtxt"), el("div", o.name.toUpperCase() + "!", "bigtxt"), el("p", `${o.trait}. ${o.perk}.`, "muted"));
  r.style.color = o.color;
}

// =====================================================================
// GAME DATA
// =====================================================================
const ABILITY_TEXT = {
  elementalist: "Fire bolts · Fireball · Frost Nova",
  warden: "Shield bash · Bulwark · Quake",
  lifebinder: "Light orbs · Mend · Sanctuary",
  shadowblade: "Twin daggers · Venom Cloud · Shadow Step",
};
const SKILLS = {
  elementalist: [{ name: "Fireball", icon: "🔥", cd: 4 }, { name: "Frost Nova", icon: "❄️", cd: 8 }],
  warden:       [{ name: "Bulwark",  icon: "🛡️", cd: 9 }, { name: "Quake",      icon: "💥", cd: 6 }],
  lifebinder:   [{ name: "Mend",     icon: "💚", cd: 6 }, { name: "Sanctuary",  icon: "🕊️", cd: 12 }],
  shadowblade:  [{ name: "Venom Cloud", icon: "🐍", cd: 7 }, { name: "Shadow Step", icon: "🌌", cd: 5 }],
};
// Monster behaviour in real time. hp/dmg are scaled by floor.
const AI = {
  slime: "chase", goblin: "chase", bat: "flit", wolf: "chase", imp: "shoot", skeleton: "chase", orc: "chase", darkmage: "shoot",
  spider: "spit", troll: "chase", wraith: "charge", demon: "shoot3", golem: "chase", mimic: "chase",
};
const SIZE = { slime: 14, goblin: 14, bat: 11, wolf: 15, imp: 13, skeleton: 15, orc: 19, darkmage: 15, spider: 16, troll: 24, wraith: 16, demon: 20, golem: 26, mimic: 18 };
const SPEED = { slime: 55, goblin: 85, bat: 125, wolf: 120, imp: 70, skeleton: 75, orc: 60, darkmage: 60, spider: 95, troll: 55, wraith: 90, demon: 70, golem: 40, mimic: 80 };
const TIER_POOL = [["slime", "goblin", "bat", "wolf", "imp"], ["skeleton", "orc", "darkmage", "spider", "wolf"], ["troll", "wraith", "demon", "golem", "darkmage"]];
const ZONES = [
  { name: "The Undercroft", floor: "#1d1830", tile: "#241e3b", wall: "#3d3266", light: "#ffb35c" },
  { name: "The Bone Halls", floor: "#18202a", tile: "#1f2a36", wall: "#40566b", light: "#9fd3ff" },
  { name: "The Abyss",      floor: "#250f14", tile: "#33141b", wall: "#6b2430", light: "#ff6a4d" },
];
const BOSS_FLOORS = { 5: "gking", 10: "lich", 15: "dragon" };
const LAST = 15;

const BOONS = [
  { k: "power",   e: "⚔️", n: "Power",          d: "+15% damage",                     r: "common" },
  { k: "haste",   e: "⚡", n: "Haste",          d: "+15% attack speed",               r: "common" },
  { k: "vital",   e: "❤️", n: "Vitality",       d: "+25 max HP and heal 25",          r: "common" },
  { k: "swift",   e: "👟", n: "Swiftness",      d: "+10% move speed",                 r: "common" },
  { k: "magnet",  e: "🧲", n: "Greed",          d: "+60% pickup range, +25% gold",    r: "common" },
  { k: "cool",    e: "⏳", n: "Focus",          d: "Spells recharge 15% faster",      r: "rare" },
  { k: "crit",    e: "🎯", n: "Precision",      d: "+8% critical hit chance",         r: "rare" },
  { k: "multi",   e: "🔱", n: "Multishot",      d: "+1 projectile on your basic attack", r: "epic" },
  { k: "pierce",  e: "🏹", n: "Piercing",       d: "Basic attacks pass through +1 enemy", r: "rare" },
  { k: "orbit",   e: "🌀", n: "Orbiting Blade", d: "A blade circles you, cutting enemies", r: "epic" },
  { k: "vamp",    e: "🩸", n: "Bloodthirst",    d: "Heal 3% of the damage you deal",  r: "rare" },
  { k: "boom",    e: "💣", n: "Volatile",       d: "Enemies explode when they die",   r: "epic" },
  { k: "chain",   e: "🌩️", n: "Chain Lightning", d: "20% chance a hit zaps 2 more enemies", r: "epic" },
  { k: "thorns",  e: "🌵", n: "Thorns",         d: "Enemies that touch you take damage", r: "common" },
  { k: "angel",   e: "😇", n: "Guardian Angel", d: "Survive death once with 40% HP",  r: "legendary", once: true },
  { k: "big",     e: "🔮", n: "Arcane Size",    d: "+25% spell & explosion size",     r: "rare" },
];

// =====================================================================
// ENGINE STATE
// =====================================================================
const cv = $("#view");
let G = null;            // the current run
let raf = 0, last = 0, paused = false;
const keys = {};
const joy = { id: null, ox: 0, oy: 0, x: 0, y: 0, on: false };

function newHero(p) {
  const c = CALLINGS[p.calling];
  const h = { x: 0, y: 0, r: 15, vx: 0, vy: 0, face: 1, hp: 0, max: c.hp * 1.4, pow: c[c.main], def: c.def, spd: 175,
    crit: 0.05, dmg: 1, heal: 1, xpm: 1, goldm: 1, dodge: 0, atkRate: 1, cdm: 1, size: 1, pickup: 95, regen: 0,
    pierce: 0, multi: 0, orbit: 0, vamp: 0, boom: 0, chain: 0, thorns: 0, angel: 0, burnOnHit: false, undying: false,
    lvl: 1, xp: 0, atkT: 0, cds: [0, 0], dashT: 0, dashCd: 0, inv: 0, shield: 0, boons: {}, calling: p.calling, look: p, bob: 0, walk: 0, moving: false, faceA: Math.PI };
  const race = p.race;
  if (race === "human") h.xpm += 0.15;
  if (race === "elf") { h.spd *= 1.08; h.crit += 0.05; }
  if (race === "dwarf") { h.def += 3; h.max *= 1.1; }
  if (race === "orc") h.dmg += 0.12;
  if (race === "fae") { h.heal += 0.2; h.dodge += 0.08; }
  if (race === "dragonkin") { h.max += 20; h.burnOnHit = true; }
  if (race === "revenant") h.undying = true;
  if (race === "beastkin") h.spd *= 1.15;
  if (race === "merfolk") h.regen = 0.008;
  if (p.order === "emberclaw") h.dmg += 0.1;
  if (p.order === "tidewyrm") h.xpm += 0.25;
  if (p.order === "thornveil") { h.max *= 1.12; h.heal += 0.15; }
  if (p.order === "duskraven") { h.crit += 0.1; h.goldm += 0.2; }
  if (p.heirloom === "emberring") h.dmg += 0.08;
  if (p.heirloom === "locket") h.max += 20;
  if (p.heirloom === "stormeye") h.crit += 0.08;
  if (p.heirloom === "ironbark") h.def += 2;
  if (p.heirloom === "swiftboots") h.spd *= 1.08;
  if (p.heirloom === "lifeseed") h.heal += 0.2;
  if (p.heirloom === "pouch") h.goldm += 0.3;
  if (p.pet === "owl") { h.xpm += 0.15; h.pickup += 30; }
  if (p.pet === "cat") h.dodge += 0.1;
  if (p.pet === "toad") h.heal += 0.25;
  if (p.pet === "fox") h.spd *= 1.08;
  h.max = Math.round(h.max); h.hp = h.max;
  return h;
}

function newRun() {
  const hero = newHero(profile);
  G = { hero, pet: { x: 0, y: 0, t: 0, petType: profile.pet }, floor: 0, zone: ZONES[0], map: null, enemies: [], shots: [], zones: [], fx: [], texts: [],
    pickups: [], tele: [], fx3: [], later: [], gold: 0, kills: 0, time: 0, toSpawn: 0, waveT: 0, cleared: false, portal: null, merchant: null,
    shake: 0, slow: 1, slowT: 0, hitstop: 0, boss: null, cine: 0, pendingLv: 0, over: false, flash: 0, orbitA: 0 };
  showPage("game");
  $("#hudav").replaceChildren(portraitEl(profile, 44));
  $("#hudname").textContent = profile.name;
  const sk = SKILLS[hero.calling];
  $("#s1 .ic").textContent = sk[0].icon; $("#s2 .ic").textContent = sk[1].icon;
  ["#levelup", "#shop", "#pause", "#end"].forEach(s => $(s).hidden = true);
  W.resize();
  W.clearAll();
  W.setHero(profile);
  const startAt = TEST ? +(new URLSearchParams(location.search).get("floor") || 1) : 1;
  G.floor = startAt - 1;
  if (startAt === 1 && !TEST) {
    // opening cinematic: three story cards, then the first floor
    G.story = 1; nextFloor(); G.cine = 0;
    const lines = [
      ["THE FIRST REALM", "Before the kingdoms, before the gods…", "#a78bfa"],
      ["THE FIRST DRAGON", "…something ancient slept beneath the world", "#ef4444"],
      [profile.name.toUpperCase(), `${RACES[profile.race].name} ${CALLINGS[profile.calling].name} of the ${ORDERS[profile.order].name}`, ORDERS[profile.order].color],
    ];
    lines.forEach(([a, b, c], i) => setTimeout(() => { if (G) cinematic(a, b, c, 2300, true); }, i * 2500));
    setTimeout(() => { if (G) { G.story = 0; cinematic(`FLOOR 1`, G.zone.name, ORDERS[profile.order].color, 1800); } }, lines.length * 2500);
  } else nextFloor();
  paused = false; last = performance.now();
  cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
}

// =====================================================================
// FLOORS & SPAWNING
// =====================================================================
function makeMap(floor) {
  const boss = !!BOSS_FLOORS[floor];
  const w = boss ? 1100 : 1300 + floor * 20, h = boss ? 1000 : 1100 + floor * 15;
  const pillars = [];
  if (!boss) for (let i = 0; i < 4 + Math.floor(rnd(0, 4)); i++) {
    const pw = rnd(50, 110), ph = rnd(50, 110), px = rnd(120, w - 120 - pw), py = rnd(120, h - 120 - ph);
    if (Math.abs(px + pw / 2 - w / 2) < 160 && Math.abs(py + ph / 2 - h / 2) < 160) continue;   // keep the centre clear
    pillars.push({ x: px, y: py, w: pw, h: ph });
  }
  const torches = [];
  for (let i = 0; i < 8; i++) torches.push({ x: rnd(60, w - 60), y: i % 2 ? 26 : h - 26, f: rnd(0, 6) });
  return { w, h, pillars, torches, boss };
}
function nextFloor() {
  const g = G;
  g.floor++;
  g.zone = ZONES[g.floor <= 5 ? 0 : g.floor <= 10 ? 1 : 2];
  g.map = makeMap(g.floor);
  g.enemies = []; g.shots = []; g.zones = []; g.tele = []; g.pickups = []; g.fx = []; g.texts = [];
  g.portal = null; g.merchant = null; g.cleared = false; g.boss = null; g.fx3 = []; g.later = [];
  const h = g.hero;
  h.x = g.map.w / 2; h.y = g.map.h * 0.75;
  g.pet.x = h.x - 30; g.pet.y = h.y + 10;
  if (g.floor > 1) heal(h, h.max * 0.15, true);
  W.buildLevel(g);
  W.cam.yaw = Math.PI; W.cam.tx = h.x * W.U; W.cam.tz = h.y * W.U;
  const bossKey = BOSS_FLOORS[g.floor];
  if (bossKey) {
    cinematic(MONSTERS[bossKey].name.toUpperCase(), `Floor ${g.floor} · Guardian of ${g.zone.name}`, "#ef4444", 2600);
    g.toSpawn = 0; g.waveT = 2.4;
    g.bossPending = bossKey;
  } else {
    cinematic(`FLOOR ${g.floor}`, g.zone.name, ORDERS[profile.order].color, 1900);
    g.toSpawn = Math.min(10 + g.floor * 4, 60);
    g.waveT = 1.6;
  }
  $("#bossbar").hidden = true;
}
function tierOf(f) { return f <= 5 ? 0 : f <= 10 ? 1 : 2; }
function scaleOf(f) { return 1 + 0.14 * (f - 1); }
function spawnEnemy(key, x, y, opt = {}) {
  const m = MONSTERS[key], f = G.floor, s = scaleOf(f) * (opt.mult || 1);
  const e = { key, icon: m.icon, name: (opt.elite ? "Elite " : "") + m.name, x, y, r: (SIZE[key] || 15) * (opt.elite ? 1.4 : 1),
    hp: m.hp * 0.9 * s * (opt.elite ? 3 : 1), atk: (m.atk * 0.9 + m.mag * 0.4) * (0.75 + 0.25 * scaleOf(f)) * (opt.elite ? 1.3 : 1),
    spd: (SPEED[key] || 70) * rnd(0.9, 1.1), ai: AI[key] || "chase", t: rnd(0, 2), cool: rnd(0.5, 2), xp: Math.ceil(m.xp / 4 * (opt.elite ? 4 : 1)),
    gold: Math.ceil(m.gold / 4 * (opt.elite ? 4 : 1)), elite: !!opt.elite, flash: 0, slow: 0, freeze: 0, stun: 0, burn: 0, poison: 0, kb: { x: 0, y: 0 } };
  e.max = e.hp;
  G.enemies.push(e);
  return e;
}
function spawnBoss(key) {
  const g = G, m = MONSTERS[key];
  const e = spawnEnemy(key === "gking" ? "goblin" : key === "lich" ? "darkmage" : "demon", g.map.w / 2, g.map.h * 0.3);
  Object.assign(e, { key, icon: m.icon, name: m.name, r: key === "dragon" ? 54 : 40, boss: true, ai: key, spd: key === "dragon" ? 85 : 70,
    hp: { gking: 2600, lich: 5200, dragon: 9500 }[key], atk: { gking: 22, lich: 30, dragon: 40 }[key], xp: 60, gold: 120, phase: 1, t: 0, cool: 2 });
  e.max = e.hp;
  g.boss = e;
  g.focus = { e, t: 2.4 };   // cinematic camera: swoop to the boss and zoom in
  $("#bossbar").hidden = false; $("#bossname").textContent = m.name;
  shake(18); burst(e.x, e.y, "#ff4040", 50, 260);
}
function spawnWave() {
  const g = G, f = g.floor, pool = TIER_POOL[tierOf(f)];
  const n = Math.min(g.toSpawn, 3 + Math.floor(f / 2) + Math.floor(rnd(0, 3)));
  for (let i = 0; i < n; i++) {
    let x, y, tries = 0;
    do { x = rnd(60, g.map.w - 60); y = rnd(60, g.map.h - 60); tries++; } while ((dist2({ x, y }, g.hero) < 260 ** 2 || solidAt(x, y, 20)) && tries < 30);
    const elite = f >= 3 && g.toSpawn - i === 1 && f % 2 === 1;
    const key = pick(pool);
    g.tele.push({ x, y, t: 0.9, key, elite });
  }
  g.toSpawn -= n;
}

// =====================================================================
// COLLISION
// =====================================================================
function solidAt(x, y, r) {
  const m = G.map;
  if (x < r + 20 || y < r + 20 || x > m.w - r - 20 || y > m.h - r - 20) return true;
  for (const p of m.pillars) if (x + r > p.x && x - r < p.x + p.w && y + r > p.y && y - r < p.y + p.h) return true;
  return false;
}
function moveBody(b, dx, dy) {
  if (!solidAt(b.x + dx, b.y, b.r)) b.x += dx;
  if (!solidAt(b.x, b.y + dy, b.r)) b.y += dy;
}

// =====================================================================
// COMBAT HELPERS
// =====================================================================
function shake(n) { G.shake = Math.max(G.shake, n); }
function burst(x, y, color, n = 12, sp = 160, life = 0.6, size = 3) {
  for (let i = 0; i < n; i++) { const a = rnd(0, Math.PI * 2), s = rnd(0.3, 1) * sp; G.fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.5, 1) * life, max: life, color, size: rnd(0.6, 1.4) * size }); }
}
function ring(x, y, r, color, life = 0.45) { G.fx.push({ ring: true, x, y, r, color, life, max: life }); }
function floatText(x, y, t, color = "#fff", big = false) { G.texts.push({ x, y, t, color, life: 0.9, big }); }
function heal(h, amt, quiet) {
  const a = Math.round(amt * h.heal);
  const before = h.hp; h.hp = Math.min(h.max, h.hp + a);
  if (!quiet && h.hp > before) floatText(h.x, h.y - 26, `+${Math.round(h.hp - before)}`, "#4ade80");
}
function nearestEnemy(x, y, range = 9999) {
  let best = null, bd = range * range;
  for (const e of G.enemies) { if (e.hp <= 0) continue; const d = (e.x - x) ** 2 + (e.y - y) ** 2; if (d < bd) { bd = d; best = e; } }
  return best;
}
function hurtEnemy(e, raw, opt = {}) {
  if (!e || e.hp <= 0) return;
  const h = G.hero;
  let d = raw * h.dmg * rnd(0.9, 1.1);
  const crit = !opt.noCrit && Math.random() < h.crit + (opt.crit || 0);
  if (crit) d *= 2;
  d = Math.max(1, Math.round(d));
  e.hp -= d; e.flash = 0.12;
  floatText(e.x + rnd(-8, 8), e.y - e.r - 6, crit ? `${d}!` : `${d}`, crit ? "#fde047" : opt.color || "#fff", crit);
  if (crit) { G.hitstop = Math.max(G.hitstop, 0.04); shake(4); }
  if (opt.kb) { const a = Math.atan2(e.y - h.y, e.x - h.x); e.kb.x += Math.cos(a) * opt.kb * (e.boss ? 0.1 : 1); e.kb.y += Math.sin(a) * opt.kb * (e.boss ? 0.1 : 1); }
  if (h.vamp) heal(h, d * h.vamp, true);
  if (h.burnOnHit && !opt.dot && Math.random() < 0.25) e.burn = Math.max(e.burn, 2.5);
  if (h.chain && !opt.chained && Math.random() < h.chain) {
    let from = e;
    for (let i = 0; i < 2; i++) {
      const n = G.enemies.filter(o => o !== e && o.hp > 0 && dist2(o, from) < 200 ** 2).sort((a, b) => dist2(a, from) - dist2(b, from))[0];
      if (!n) break;
      G.fx.push({ bolt: true, x: from.x, y: from.y, x2: n.x, y2: n.y, life: 0.18, max: 0.18 });
      hurtEnemy(n, raw * 0.6, { chained: true, color: "#93c5fd" }); from = n;
    }
  }
  if (e.hp <= 0) killEnemy(e);
}
function killEnemy(e) {
  const g = G, h = g.hero;
  e.hp = 0; g.kills++;
  burst(e.x, e.y, e.boss ? "#ff5050" : e.elite ? "#f5c542" : "#c4b5fd", e.boss ? 80 : 16, e.boss ? 320 : 150);
  if (h.boom && !e.boss) { g.zones.push({ x: e.x, y: e.y, r: 70 * h.size, t: 0.01, dmg: h.pow * 1.2 * h.boom, from: "hero", once: true, color: "#fb923c" }); ring(e.x, e.y, 70 * h.size, "#fb923c"); }
  const xpN = Math.min(6, e.xp);
  for (let i = 0; i < xpN; i++) g.pickups.push({ x: e.x + rnd(-12, 12), y: e.y + rnd(-12, 12), kind: "xp", v: e.xp / xpN });
  if (Math.random() < 0.6 || e.elite || e.boss) g.pickups.push({ x: e.x + rnd(-10, 10), y: e.y + rnd(-10, 10), kind: "gold", v: Math.ceil(e.gold * h.goldm) });
  if (Math.random() < 0.05 || e.elite) g.pickups.push({ x: e.x, y: e.y, kind: "heart", v: 0.2 });
  if (e.boss) {
    g.slow = 0.25; g.slowT = 1.6; shake(30); g.flash = 0.6;
    for (let i = 0; i < 40; i++) g.pickups.push({ x: e.x + rnd(-80, 80), y: e.y + rnd(-80, 80), kind: i % 3 ? "xp" : "gold", v: i % 3 ? 4 : 15 });
    $("#bossbar").hidden = true;
    for (const o of g.enemies) if (o !== e && o.hp > 0) { o.hp = 0; burst(o.x, o.y, "#c4b5fd", 10, 120); }
    if (g.floor >= LAST) setTimeout(() => endRun(true), 2600);
  }
}
function hurtHero(raw, src) {
  const h = G.hero;
  if (h.inv > 0 || G.over) return;
  if (Math.random() < h.dodge) { floatText(h.x, h.y - 28, "dodge!", "#93c5fd"); h.inv = 0.3; return; }
  let d = raw * (40 / (40 + h.def * 3)) * (h.shield > 0 ? 0.4 : 1);
  d = Math.max(1, Math.round(d));
  h.hp -= d; h.inv = 0.55;
  floatText(h.x, h.y - 28, `-${d}`, "#f87171", true);
  shake(8); G.flash = Math.max(G.flash, 0.25);
  try { navigator.vibrate?.(40); } catch {}
  if (h.thorns && src && src.hp > 0 && !src.boss) hurtEnemy(src, h.pow * 0.8 * h.thorns, { noCrit: true, color: "#86efac" });
  if (h.hp <= 0) {
    if (h.angel > 0) { h.angel--; h.hp = Math.round(h.max * 0.4); h.inv = 2; burst(h.x, h.y, "#fef08a", 60, 240); floatText(h.x, h.y - 40, "GUARDIAN ANGEL!", "#fef08a", true); G.slow = 0.3; G.slowT = 1; }
    else if (h.undying) { h.undying = false; h.hp = 1; h.inv = 1.5; floatText(h.x, h.y - 40, "REFUSES TO DIE", "#cbd5e1", true); }
    else { h.hp = 0; endRun(false); }
  }
}
function shoot(x, y, ang, sp, opt) {
  G.shots.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: opt.life || 1.4, r: opt.r || 5, ...opt, hit: new Set() });
}

// =====================================================================
// HERO ABILITIES
// =====================================================================
// play an attack animation, then run fn at the moment of release (so spells leave the hand on cue)
function act(type, dur, release, fn, t, extra = {}) {
  const h = G.hero;
  h.anim = { type, t: 0, dur, tx: t ? t.x : null, ty: t ? t.y : null, ...extra };
  if (t) h.faceA = Math.atan2(t.x - h.x, t.y - h.y);
  G.later.push({ t: release, fn });
}
const handO = () => { const h = G.hero; return h.handX != null ? { x: h.handX, y: h.handY, h: h.handH } : { x: h.x, y: h.y, h: 1.2 }; };
const tipO = () => { const h = G.hero; return h.tipX != null ? { x: h.tipX, y: h.tipY, h: h.tipH } : handO(); };
function basicAttack() {
  const h = G.hero, t = nearestEnemy(h.x, h.y, h.calling === "warden" ? 95 : 420);
  if (!t) return false;
  const a = Math.atan2(t.y - h.y, t.x - h.x);
  h.face = Math.cos(a) >= 0 ? 1 : -1;
  if (h.anim && h.anim.big && h.anim.t < h.anim.dur) return false;   // don't interrupt a big spell
  const n = 1 + h.multi, spread = 0.16;
  if (h.calling === "warden") act("swing", 0.42, 0.24, () => wardenSwing(t), t);
  else if (h.calling === "shadowblade") { h.alt = !h.alt; act("throw", 0.26, 0.1, () => fireBasic(t), t, { left: h.alt }); }
  else act("cast", 0.34, 0.13, () => fireBasic(t), t);
  return true;
}
function wardenSwing(t) {
  const h = G.hero, a = t ? Math.atan2(t.y - h.y, t.x - h.x) : 0;
  {
    const reach = 80 * h.size;
    for (const e of G.enemies) {
      if (e.hp <= 0) continue;
      const ea = Math.atan2(e.y - h.y, e.x - h.x), da = Math.abs(((ea - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (dist2(e, h) < (reach + e.r) ** 2 && da < 1.1 + 0.15 * h.multi) hurtEnemy(e, h.pow * 1.4, { kb: 220 });
    }
    G.fx.push({ arc: true, x: h.x, y: h.y, a, r: reach, life: 0.18, max: 0.18, color: "#cbd5e1" });
    burst(h.x + Math.cos(a) * 50, h.y + Math.sin(a) * 50, "#e5e7eb", 10, 140, 0.3);
    shake(3);
  }
}
function fireBasic(t) {
  const h = G.hero, o = h.calling === "shadowblade" ? handO() : tipO();
  const tx = t && t.hp > 0 ? t.x : o.x + Math.sin(h.faceA) * 100, ty = t && t.hp > 0 ? t.y : o.y + Math.cos(h.faceA) * 100;
  const a = Math.atan2(ty - o.y, tx - o.x);
  const n = 1 + h.multi, spread = 0.16;
  burst(o.x, o.y, h.calling === "elementalist" ? "#fb923c" : h.calling === "lifebinder" ? "#fde68a" : "#c4b5fd", 6, 60, 0.25);
  for (let i = 0; i < n; i++) {
    const aa = a + (i - (n - 1) / 2) * spread;
    if (h.calling === "elementalist") shoot(o.x, o.y, aa, 520, { from: "hero", h: o.h, dmg: h.pow * 1.0, color: "#fb923c", r: 6, pierce: h.pierce, glow: 14 });
    if (h.calling === "lifebinder") shoot(o.x, o.y, aa, 430, { from: "hero", h: o.h, dmg: h.pow * 1.05, color: "#fde68a", r: 7, pierce: h.pierce, homing: true, glow: 16 });
    if (h.calling === "shadowblade") for (const off of [-0.06, 0.06]) shoot(o.x, o.y, aa + off, 640, { from: "hero", h: o.h, dmg: h.pow * 0.55, color: "#c4b5fd", r: 4, pierce: h.pierce, dagger: true, crit: 0.1 });
  }
}
function castSkill(i) {
  const g = G, h = g.hero, sk = SKILLS[h.calling][i];
  if (h.cds[i] > 0 || g.over || paused) return;
  const t = nearestEnemy(h.x, h.y, 600);
  const R = s => s * h.size;
  const charge = (x, y, color, n = 24) => { for (let k = 0; k < n; k++) { const an = rnd(0, 6.3), d = rnd(40, 90); G.fx3.push({ x: x + Math.cos(an) * d, y: y + Math.sin(an) * d, h: rnd(0.3, 2), vx: -Math.cos(an) * d * 2.2, vy: -Math.sin(an) * d * 2.2, vh: 0.8, life: 0.4, max: 0.4, color, size: 1.3 }); } };
  if (h.calling === "elementalist" && i === 0) {   // Fireball: both hands overhead, then hurl it
    charge(h.x, h.y, "#f97316");
    act("twohand", 0.62, 0.34, () => {
      const o = tipO(), tt = t && t.hp > 0 ? t : nearestEnemy(h.x, h.y, 600);
      const a = tt ? Math.atan2(tt.y - o.y, tt.x - o.x) : Math.atan2(Math.cos(h.faceA), Math.sin(h.faceA));
      shoot(o.x, o.y, a, 420, { from: "hero", h: o.h, dmg: h.pow * 1.2, color: "#f97316", r: 12, glow: 30, explode: R(100), life: 1.2 });
      shake(5);
    }, t, { big: true });
  }
  if (h.calling === "elementalist" && i === 1) {   // Frost Nova: arms up, then thrown wide
    charge(h.x, h.y, "#7dd3fc", 30);
    act("nova", 0.6, 0.3, () => {
      ring(h.x, h.y, R(160), "#7dd3fc", 0.6); burst(h.x, h.y, "#bae6fd", 50, 300);
      for (const e of g.enemies) if (e.hp > 0 && dist2(e, h) < (R(160) + e.r) ** 2) { hurtEnemy(e, h.pow * 1.3, { color: "#bae6fd" }); e.freeze = e.boss ? 0.8 : 2.4; }
      shake(10);
    }, t, { big: true });
  }
  if (h.calling === "warden" && i === 0) { act("cast", 0.3, 0.05, () => { h.shield = 4.5; burst(h.x, h.y, "#93c5fd", 30, 200); ring(h.x, h.y, 60, "#93c5fd", 0.5); }, t); }
  if (h.calling === "warden" && i === 1) {   // Quake: leap up and smash the ground
    act("slam", 0.72, 0.42, () => {
      ring(h.x, h.y, R(170), "#fbbf24", 0.7); burst(h.x, h.y, "#a8a29e", 60, 320, 0.9, 6); shake(24);
      for (let k = 0; k < 8; k++) { const an = k / 8 * 6.28; G.fx.push({ bolt: true, x: h.x, y: h.y, x2: h.x + Math.cos(an) * R(150), y2: h.y + Math.sin(an) * R(150), life: 0.5, max: 0.5, color: "#fbbf24" }); }
      for (const e of g.enemies) if (e.hp > 0 && dist2(e, h) < (R(170) + e.r) ** 2) { hurtEnemy(e, h.pow * 2.4, { kb: 400 }); e.stun = e.boss ? 0.5 : 1.4; }
    }, t, { big: true });
  }
  if (h.calling === "lifebinder" && i === 0) act("heal", 0.6, 0.3, () => { heal(h, h.max * 0.35); burst(h.x, h.y, "#86efac", 50, 200); ring(h.x, h.y, 80, "#86efac", 0.6); for (let k = 0; k < 40; k++) G.fx3.push({ x: h.x + rnd(-30, 30), y: h.y + rnd(-30, 30), h: rnd(0, 0.5), vx: 0, vy: 0, vh: rnd(2, 4), life: 0.9, max: 0.9, color: "#86efac", size: 1.4 }); }, null, { big: true });
  if (h.calling === "lifebinder" && i === 1) act("heal", 0.7, 0.35, () => { g.zones.push({ x: h.x, y: h.y, r: R(150), t: 5, dmg: h.pow * 0.9, from: "hero", tick: 0, holy: true, color: "#fde68a" }); shake(6); }, null, { big: true });
  if (h.calling === "shadowblade" && i === 0) {   // Venom Cloud: lob a flask at the enemy
    act("throw", 0.42, 0.18, () => {
      const o = handO(), x = t && t.hp > 0 ? t.x : h.x, y = t && t.hp > 0 ? t.y : h.y;
      for (let k = 0; k < 14; k++) G.fx3.push({ x: o.x + (x - o.x) * k / 14, y: o.y + (y - o.y) * k / 14, h: o.h + Math.sin(k / 14 * Math.PI) * 1.2, vx: 0, vy: 0, vh: 0, life: 0.3 + k * 0.02, max: 0.6, color: "#a3e635", size: 1.2 });
      g.later.push({ t: 0.25, fn: () => { g.zones.push({ x, y, r: R(110), t: 4, dmg: h.pow * 0.7, from: "hero", tick: 0, poison: true, color: "#84cc16" }); burst(x, y, "#84cc16", 30, 160); } });
    }, t, { left: false });
  }
  if (h.calling === "shadowblade" && i === 1) {
    let dx = joyDir().x, dy = joyDir().y;
    if (!dx && !dy) { if (t) { dx = t.x - h.x; dy = t.y - h.y; } else { dx = Math.sin(h.faceA); dy = Math.cos(h.faceA); } }
    h.faceA = Math.atan2(dx, dy);
    const L = Math.hypot(dx, dy) || 1, sx = h.x, sy = h.y;
    for (let s = 0; s < 24; s++) moveBody(h, dx / L * 10, dy / L * 10);
    for (const e of g.enemies) {   // everyone along the path gets cut
      if (e.hp <= 0) continue;
      const px = h.x - sx, py = h.y - sy, len2 = px * px + py * py || 1;
      const tt = clamp(((e.x - sx) * px + (e.y - sy) * py) / len2, 0, 1);
      if ((sx + px * tt - e.x) ** 2 + (sy + py * tt - e.y) ** 2 < (e.r + 30) ** 2) hurtEnemy(e, h.pow * 2.6, { crit: 0.25 });
    }
    g.fx.push({ bolt: true, x: sx, y: sy, x2: h.x, y2: h.y, life: 0.25, max: 0.25, color: "#a78bfa" });
    burst(sx, sy, "#6d28d9", 20, 120); burst(h.x, h.y, "#a78bfa", 20, 160); h.inv = 0.4;
  }
  h.cds[i] = sk.cd * h.cdm;
}
function dash() {
  const h = G.hero;
  if (h.dashCd > 0 || G.over || paused) return;
  let { x, y } = joyDir();
  if (!x && !y) { x = Math.sin(h.faceA); y = Math.cos(h.faceA); }
  const L = Math.hypot(x, y) || 1;
  h.dashT = 0.17; h.dashV = { x: x / L * 720, y: y / L * 720 }; h.inv = Math.max(h.inv, 0.25); h.dashCd = 1.3;
  burst(h.x, h.y, "#93c5fd", 10, 80);
}

// =====================================================================
// BOSS BEHAVIOUR
// =====================================================================
function bossThink(e, dt) {
  const g = G, h = g.hero;
  e.cool -= dt; e.t += dt;
  const enr = e.hp < e.max * 0.5;
  if (enr && e.phase === 1) { e.phase = 2; shake(24); cinematic("ENRAGED", e.name, "#ef4444", 1300); burst(e.x, e.y, "#ff0000", 60, 300); }
  const a = Math.atan2(h.y - e.y, h.x - e.x);
  if (e.key === "gking") {
    if (dist2(e, h) > 60 ** 2) moveBody(e, Math.cos(a) * e.spd * (enr ? 1.3 : 1) * dt, Math.sin(a) * e.spd * (enr ? 1.3 : 1) * dt);
    if (e.cool <= 0) {
      const r = Math.random();
      if (r < 0.4) telegraph(e.x, e.y, 130, 0.9, e.atk * 1.6, "Ground Slam");
      else if (r < 0.7) { for (let i = -3; i <= 3; i++) shoot(e.x, e.y, a + i * 0.18, 260, { from: "enemy", dmg: e.atk * 0.7, color: "#fbbf24", r: 6, dagger: true }); }
      else { for (let i = 0; i < (enr ? 4 : 3); i++) g.tele.push({ x: e.x + rnd(-120, 120), y: e.y + rnd(-120, 120), t: 0.8, key: "goblin" }); floatText(e.x, e.y - 60, "📯 To me, goblins!", "#fbbf24", true); }
      e.cool = enr ? 1.6 : 2.4;
    }
  }
  if (e.key === "lich") {
    const want = 240;
    const d = Math.sqrt(dist2(e, h));
    moveBody(e, Math.cos(a) * (d > want ? 1 : -1) * e.spd * 0.6 * dt, Math.sin(a) * (d > want ? 1 : -1) * e.spd * 0.6 * dt);
    e.spin = (e.spin || 0) + dt * 0.8;
    if (e.cool <= 0) {
      const r = Math.random();
      if (r < 0.45) { const n = enr ? 22 : 16; for (let i = 0; i < n; i++) shoot(e.x, e.y, e.spin + i * Math.PI * 2 / n, 170, { from: "enemy", dmg: e.atk * 0.6, color: "#a78bfa", r: 7, glow: 12, life: 4 }); }
      else if (r < 0.7) { for (let i = 0; i < (enr ? 3 : 2); i++) g.tele.push({ x: e.x + rnd(-150, 150), y: e.y + rnd(-150, 150), t: 0.9, key: "skeleton" }); floatText(e.x, e.y - 60, "☠️ Rise!", "#a78bfa", true); }
      else { for (let i = 0; i < (enr ? 6 : 4); i++) telegraph(h.x + rnd(-110, 110), h.y + rnd(-110, 110), 60, 1.0, e.atk * 1.1, null, "#a78bfa"); telegraph(h.x, h.y, 60, 1.0, e.atk * 1.1, null, "#a78bfa"); }
      if (Math.random() < 0.3) { burst(e.x, e.y, "#6d28d9", 30, 160); let nx, ny, k = 0; do { nx = rnd(120, g.map.w - 120); ny = rnd(120, g.map.h - 120); k++; } while (dist2({ x: nx, y: ny }, h) < 220 ** 2 && k < 20); e.x = nx; e.y = ny; burst(e.x, e.y, "#a78bfa", 30, 160); }
      e.cool = enr ? 1.3 : 2.0;
    }
  }
  if (e.key === "dragon") {
    if (dist2(e, h) > 150 ** 2) moveBody(e, Math.cos(a) * e.spd * (enr ? 1.25 : 1) * dt, Math.sin(a) * e.spd * (enr ? 1.25 : 1) * dt);
    if (e.breath > 0) {   // fire breath stream
      e.breath -= dt;
      const ba = e.breathA + Math.sin(e.breath * 4) * 0.35;
      if (Math.random() < 0.9) shoot(e.x, e.y, ba + rnd(-0.18, 0.18), rnd(300, 380), { from: "enemy", dmg: e.atk * 0.35, color: pick(["#f97316", "#facc15", "#ef4444"]), r: rnd(6, 10), glow: 18, life: 0.9, fire: true });
    }
    if (e.cool <= 0 && !(e.breath > 0)) {
      const r = Math.random();
      if (r < 0.35) { e.breath = 1.6; e.breathA = a; floatText(e.x, e.y - 70, "🔥 FIRE BREATH", "#f97316", true); shake(10); }
      else if (r < 0.65) { const n = enr ? 9 : 6; for (let i = 0; i < n; i++) telegraph(h.x + rnd(-170, 170), h.y + rnd(-170, 170), 70, rnd(0.9, 1.4), e.atk * 1.2, null, "#f97316"); telegraph(h.x, h.y, 70, 1.1, e.atk * 1.2, null, "#f97316"); floatText(e.x, e.y - 70, "☄️ METEORS", "#f97316", true); }
      else if (r < 0.85) telegraph(e.x, e.y, 190, 1.0, e.atk * 1.8, "Tail Sweep", "#ef4444");
      else { for (let i = 0; i < 2; i++) g.tele.push({ x: e.x + rnd(-150, 150), y: e.y + rnd(-150, 150), t: 0.9, key: "imp" }); }
      e.cool = enr ? 1.5 : 2.3;
    }
  }
}
function telegraph(x, y, r, delay, dmg, label, color = "#ef4444") {
  G.zones.push({ x, y, r, t: delay, delay, dmg, from: "enemy", warn: true, color });
  if (label) floatText(x, y - r - 10, label, color, true);
}

// =====================================================================
// UPDATE
// =====================================================================
// joystick / keys give a screen direction; turn it into a world direction using the camera's angle
function joyDir() {
  const s = screenDir(), yaw = W.cam.yaw;
  if (!s.x && !s.y) return s;
  return { x: s.x * -Math.cos(yaw) + (-s.y) * Math.sin(yaw), y: s.x * Math.sin(yaw) + (-s.y) * Math.cos(yaw) };
}
function screenDir() {
  let x = 0, y = 0;
  if (keys.KeyA || keys.ArrowLeft) x -= 1; if (keys.KeyD || keys.ArrowRight) x += 1;
  if (keys.KeyW || keys.ArrowUp) y -= 1; if (keys.KeyS || keys.ArrowDown) y += 1;
  if (joy.on) { const dx = joy.x - joy.ox, dy = joy.y - joy.oy, L = Math.hypot(dx, dy); if (L > 6) { const m = Math.min(1, L / 55); x = dx / L * m; y = dy / L * m; } }
  const L = Math.hypot(x, y);
  return L > 1 ? { x: x / L, y: y / L } : { x, y };
}
function update(dt) {
  const g = G, h = g.hero;
  g.time += dt;
  // cinematics hold the action for a moment
  if (g.focus && g.focus.t > 0) { g.focus.t -= dt; if (g.focus.t > 0.4) return; }   // freeze the fight during the boss entrance
  if (g.endZoom != null) g.endZoom += dt * 0.6;
  if (g.story > 0) return;
  if (g.cine > 0) { g.cine -= dt; if (g.cine > 0.6) return; }

  // hero movement
  const d = joyDir();
  if (h.dashT > 0) { h.dashT -= dt; moveBody(h, h.dashV.x * dt, h.dashV.y * dt); if (Math.random() < 0.8) g.fx.push({ ghost: true, x: h.x, y: h.y, life: 0.25, max: 0.25 }); }
  else moveBody(h, d.x * h.spd * dt, d.y * h.spd * dt);
  if (d.x) h.face = d.x > 0 ? 1 : -1;
  if (Math.abs(d.x) + Math.abs(d.y) > 0.1 && !(h.anim && h.anim.t < h.anim.dur)) h.faceA = Math.atan2(d.x, d.y);
  // attack animations & delayed spell releases
  if (h.anim) { h.anim.t += dt; if (h.anim.t >= h.anim.dur) h.anim = null; }
  for (const l of g.later) { l.t -= dt; if (l.t <= 0 && !l.done) { l.done = true; l.fn(); } }
  g.later = g.later.filter(l => !l.done);
  h.moving = Math.abs(d.x) + Math.abs(d.y) > 0.1 || h.dashT > 0;
  h.bob += (h.moving ? 12 : 2.5) * dt;
  if (h.moving) h.walk += dt;
  h.inv = Math.max(0, h.inv - dt); h.shield = Math.max(0, h.shield - dt); h.dashCd = Math.max(0, h.dashCd - dt);
  h.cds = h.cds.map(c => Math.max(0, c - dt));
  if (h.regen) h.hp = Math.min(h.max, h.hp + h.max * h.regen * dt);
  h.atkT -= dt;
  if (h.atkT <= 0) { if (basicAttack()) h.atkT = (h.calling === "shadowblade" ? 0.34 : h.calling === "warden" ? 0.55 : 0.45) / h.atkRate; else h.atkT = 0.1; }

  // orbiting blades
  if (h.orbit) {
    g.orbitA += dt * 3.2;
    for (let i = 0; i < h.orbit; i++) {
      const a = g.orbitA + i * Math.PI * 2 / h.orbit, ox = h.x + Math.cos(a) * 62, oy = h.y + Math.sin(a) * 62;
      for (const e of g.enemies) if (e.hp > 0 && (e.ox_t || 0) <= g.time && (e.x - ox) ** 2 + (e.y - oy) ** 2 < (e.r + 10) ** 2) { hurtEnemy(e, h.pow * 0.7, { kb: 120 }); e.ox_t = g.time + 0.35; }
    }
  }
  // pet
  const p = g.pet;
  p.x += (h.x - 26 * h.face - p.x) * Math.min(1, dt * 4); p.y += (h.y + 16 - p.y) * Math.min(1, dt * 4);
  p.t -= dt;
  if (profile.pet === "drake" && p.t <= 0) { const t = nearestEnemy(p.x, p.y, 360); if (t) { shoot(p.x, p.y, Math.atan2(t.y - p.y, t.x - p.x), 380, { from: "hero", dmg: h.pow * 0.5, color: "#f97316", r: 5, glow: 10 }); p.t = 1.2; } }

  // spawning
  if (g.bossPending) { g.waveT -= dt; if (g.waveT <= 0) { spawnBoss(g.bossPending); g.bossPending = null; } }
  else if (g.toSpawn > 0) {
    g.waveT -= dt;
    const alive = g.enemies.filter(e => e.hp > 0).length;
    if (g.waveT <= 0 || alive === 0 && !g.tele.length) { spawnWave(); g.waveT = Math.max(3.5, 7 - g.floor * 0.2); }
  }
  for (const t of g.tele) { t.t -= dt; if (t.t <= 0) { spawnEnemy(t.key, t.x, t.y, { elite: t.elite }); burst(t.x, t.y, t.elite ? "#f5c542" : "#a78bfa", 14, 120); } }
  g.tele = g.tele.filter(t => t.t > 0);

  // enemies
  for (const e of g.enemies) {
    if (e.hp <= 0) continue;
    e.flash = Math.max(0, e.flash - dt);
    if (e.burn > 0) { e.burn -= dt; e.dotT = (e.dotT || 0) - dt; if (e.dotT <= 0) { e.dotT = 0.5; hurtEnemy(e, h.pow * 0.25, { noCrit: true, dot: true, color: "#fb923c" }); } }
    if (e.hp <= 0) continue;
    if (e.freeze > 0) { e.freeze -= dt; continue; }
    if (e.stun > 0) { e.stun -= dt; continue; }
    if (e.kb.x || e.kb.y) { moveBody(e, e.kb.x * dt, e.kb.y * dt); e.kb.x *= 0.86; e.kb.y *= 0.86; if (Math.abs(e.kb.x) + Math.abs(e.kb.y) < 5) e.kb.x = e.kb.y = 0; }
    if (e.boss) { bossThink(e, dt); }
    else {
      const a = Math.atan2(h.y - e.y, h.x - e.x), dd = Math.sqrt(dist2(e, h));
      e.cool -= dt; e.t += dt;
      if (e.ai === "chase") moveBody(e, Math.cos(a) * e.spd * dt, Math.sin(a) * e.spd * dt);
      if (e.ai === "flit") { const w = Math.sin(e.t * 5) * 1.2; moveBody(e, Math.cos(a + w) * e.spd * dt, Math.sin(a + w) * e.spd * dt); }
      if (e.ai === "shoot" || e.ai === "shoot3" || e.ai === "spit") {
        const want = e.ai === "spit" ? 160 : 230;
        const dir = dd > want + 40 ? 1 : dd < want - 40 ? -1 : 0;
        moveBody(e, (Math.cos(a) * dir + Math.cos(a + 1.57) * 0.4 * Math.sin(e.t)) * e.spd * dt, (Math.sin(a) * dir + Math.sin(a + 1.57) * 0.4 * Math.sin(e.t)) * e.spd * dt);
        if (e.cool <= 0 && dd < 480) {
          if (e.ai === "shoot") shoot(e.x, e.y, a, 230, { from: "enemy", dmg: e.atk * 0.8, color: "#f472b6", r: 6, glow: 10 });
          if (e.ai === "shoot3") for (const o of [-0.25, 0, 0.25]) shoot(e.x, e.y, a + o, 240, { from: "enemy", dmg: e.atk * 0.6, color: "#ef4444", r: 6, glow: 10 });
          if (e.ai === "spit") shoot(e.x, e.y, a, 260, { from: "enemy", dmg: e.atk * 0.6, color: "#84cc16", r: 6, puddle: true });
          e.cool = rnd(1.6, 2.6);
        }
      }
      if (e.ai === "charge") {
        if (e.chg > 0) { e.chg -= dt; moveBody(e, e.cv.x * dt, e.cv.y * dt); }
        else if (e.cool <= 0 && dd < 320) { e.warnT = 0.6; e.cool = 3; e.ca = a; }
        else if (!(e.warnT > 0)) moveBody(e, Math.cos(a) * e.spd * 0.6 * dt, Math.sin(a) * e.spd * 0.6 * dt);
        if (e.warnT > 0) { e.warnT -= dt; if (e.warnT <= 0) { e.chg = 0.45; e.cv = { x: Math.cos(e.ca) * 520, y: Math.sin(e.ca) * 520 }; } }
      }
    }
    // touching the hero hurts
    if (dist2(e, h) < (e.r + h.r) ** 2) hurtHero(e.atk * (e.boss ? 1.1 : 1), e);
  }
  // push enemies apart a little
  const live = g.enemies.filter(e => e.hp > 0);
  for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
    const a = live[i], b = live[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy, rr = a.r + b.r;
    if (d2 > 0 && d2 < rr * rr) { const dd = Math.sqrt(d2), push = (rr - dd) / 2; if (!a.boss) moveBody(a, -dx / dd * push, -dy / dd * push); if (!b.boss) moveBody(b, dx / dd * push, dy / dd * push); }
  }
  g.enemies = g.enemies.filter(e => e.hp > 0);

  // projectiles
  for (const s of g.shots) {
    s.life -= dt;
    if (s.homing) { const t = nearestEnemy(s.x, s.y, 260); if (t) { const a = Math.atan2(t.y - s.y, t.x - s.x), sp = Math.hypot(s.vx, s.vy), cur = Math.atan2(s.vy, s.vx); let da = ((a - cur + Math.PI * 3) % (Math.PI * 2)) - Math.PI; const na = cur + clamp(da, -4 * dt, 4 * dt); s.vx = Math.cos(na) * sp; s.vy = Math.sin(na) * sp; } }
    s.x += s.vx * dt; s.y += s.vy * dt;
    if (solidAt(s.x, s.y, 2)) { s.life = 0; if (s.explode) explode(s); else burst(s.x, s.y, s.color, 5, 60, 0.3); if (s.puddle) g.zones.push({ x: s.x, y: s.y, r: 40, t: 3, dmg: s.dmg * 0.5, from: "enemy", tick: 0, color: "#65a30d", acid: true }); continue; }
    if (s.from === "hero") {
      for (const e of g.enemies) {
        if (e.hp <= 0 || s.hit.has(e) || dist2(e, s) > (e.r + s.r) ** 2) continue;
        s.hit.add(e);
        if (s.explode) { explode(s); s.life = 0; break; }
        hurtEnemy(e, s.dmg, { crit: s.crit, kb: 60 });
        burst(s.x, s.y, s.color, 4, 80, 0.25);
        if ((s.pierce || 0) < s.hit.size) { s.life = 0; break; }
      }
    } else {
      if (h.shield > 0 && h.calling === "warden" && dist2(h, s) < 46 ** 2) { s.life = 0; burst(s.x, s.y, "#93c5fd", 5, 80); continue; }
      if (dist2(h, s) < (h.r + s.r) ** 2) { hurtHero(s.dmg); s.life = 0; if (s.puddle) g.zones.push({ x: s.x, y: s.y, r: 40, t: 3, dmg: s.dmg * 0.5, from: "enemy", tick: 0, color: "#65a30d", acid: true }); }
    }
  }
  g.shots = g.shots.filter(s => s.life > 0);

  // zones: telegraphed attacks, healing circles, poison clouds
  for (const z of g.zones) {
    z.t -= dt;
    if (z.warn) { if (z.t <= 0) { ring(z.x, z.y, z.r, z.color, 0.4); burst(z.x, z.y, z.color, 24, z.r * 2, 0.5, 4); shake(9); if (dist2(z, h) < (z.r + h.r * 0.5) ** 2) hurtHero(z.dmg); } continue; }
    if (z.once) { for (const e of g.enemies) if (e.hp > 0 && dist2(e, z) < (z.r + e.r) ** 2) hurtEnemy(e, z.dmg, { noCrit: true, color: "#fb923c" }); z.t = 0; continue; }
    z.tick -= dt;
    if (z.tick <= 0) {
      z.tick = 0.5;
      if (z.from === "hero") {
        for (const e of g.enemies) if (e.hp > 0 && dist2(e, z) < (z.r + e.r) ** 2) { hurtEnemy(e, z.dmg * 0.5, { noCrit: true, dot: true, color: z.poison ? "#a3e635" : "#fde68a" }); if (z.poison) e.slow = 1; }
        if (z.holy && dist2(z, h) < z.r ** 2) heal(h, h.max * 0.03);
      } else if (dist2(z, h) < z.r ** 2) hurtHero(z.dmg);
    }
  }
  g.zones = g.zones.filter(z => z.t > 0);

  // pickups (pulled in by your magnet)
  for (const k of g.pickups) {
    const d2 = dist2(k, h), R = h.pickup;
    if (d2 < R * R || g.cleared) { const a = Math.atan2(h.y - k.y, h.x - k.x), sp = g.cleared ? 700 : 420; k.x += Math.cos(a) * sp * dt; k.y += Math.sin(a) * sp * dt; }
    if (d2 < (h.r + 6) ** 2) {
      k.taken = true;
      if (k.kind === "xp") gainXp(k.v);
      if (k.kind === "gold") { g.gold += k.v; floatText(h.x, h.y - 30, `+${k.v}💰`, "#fde047"); }
      if (k.kind === "heart") { heal(h, h.max * k.v); burst(h.x, h.y, "#f87171", 10, 80); }
    }
  }
  g.pickups = g.pickups.filter(k => !k.taken);

  // floor cleared → portal (and sometimes a merchant)
  if (!g.cleared && !g.bossPending && g.toSpawn <= 0 && !g.tele.length && !g.enemies.length && g.floor < LAST + 1) {
    if (!(g.floor >= LAST)) {
      g.cleared = true;
      g.portal = { x: g.map.w / 2, y: g.map.h / 2, t: 0 };
      if (g.floor % 3 === 0 || BOSS_FLOORS[g.floor]) g.merchant = { x: g.map.w / 2 + 130, y: g.map.h / 2 - 20, used: false };
      cinematic("FLOOR CLEARED", g.merchant ? "A merchant has appeared…" : "Step into the portal", "#4ade80", 1400, true);
    }
  }
  if (g.portal) { g.portal.t += dt; if (dist2(g.portal, h) < 34 ** 2 && !g.pendingLv) { burst(h.x, h.y, "#a78bfa", 40, 240); nextFloor(); } }
  if (g.merchant && !g.merchant.used && dist2(g.merchant, h) < 40 ** 2) { g.merchant.used = true; openShop(); }

  // effects
  for (const f of g.fx) { f.life -= dt; if (f.vx != null) { f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= 0.92; f.vy *= 0.92; } }
  g.fx = g.fx.filter(f => f.life > 0);
  for (const t of g.texts) { t.life -= dt; t.y -= 30 * dt; }
  g.texts = g.texts.filter(t => t.life > 0);
  g.shake *= Math.pow(0.0015, dt); g.flash = Math.max(0, g.flash - dt);
  if (g.slowT > 0) { g.slowT -= dt / Math.max(0.2, g.slow); if (g.slowT <= 0) g.slow = 1; }
}
function explode(s) {
  const g = G, h = g.hero;
  ring(s.x, s.y, s.explode, "#fb923c", 0.5); burst(s.x, s.y, "#f97316", 36, s.explode * 2.4, 0.6, 5); shake(12);
  for (const e of g.enemies) if (e.hp > 0 && dist2(e, s) < (s.explode + e.r) ** 2) { hurtEnemy(e, s.dmg * 2, { kb: 200 }); e.burn = 3; }
}
function gainXp(v) {
  const h = G.hero;
  h.xp += v * h.xpm;
  const need = () => 6 + h.lvl * 5;
  while (h.xp >= need()) { h.xp -= need(); h.lvl++; G.pendingLv++; }
  if (G.pendingLv && $("#levelup").hidden && !G.over) openLevelUp();
}

// =====================================================================
// LEVEL UP / SHOP / END
// =====================================================================
function rollBoons() {
  const weights = { common: 10, rare: 6, epic: 3, legendary: 1 };
  const opts = BOONS.filter(b => !(b.once && G.hero.boons[b.k]));
  const out = [];
  while (out.length < 3 && out.length < opts.length) {
    let x = rnd(0, opts.reduce((a, b) => a + (out.includes(b) ? 0 : weights[b.r]), 0));
    for (const b of opts) { if (out.includes(b)) continue; x -= weights[b.r]; if (x <= 0) { out.push(b); break; } }
  }
  return out;
}
function openLevelUp() {
  paused = true;
  const h = G.hero;
  $("#lvtxt").textContent = `Level ${h.lvl - G.pendingLv + 1}! Choose a blessing`;
  $("#boons").replaceChildren(...rollBoons().map(b => {
    const btn = el("button", null, "boon " + b.r);
    const t = el("div"); t.append(el("b", b.n + (h.boons[b.k] ? ` (${h.boons[b.k] + 1})` : "")), el("small", b.d));
    btn.append(el("span", b.e, "e"), t); btn.dataset.boon = b.k;
    return btn;
  }));
  $("#levelup").hidden = false;
}
function applyBoon(k) {
  const h = G.hero;
  h.boons[k] = (h.boons[k] || 0) + 1;
  if (k === "power") h.dmg += 0.15;
  if (k === "haste") h.atkRate += 0.15;
  if (k === "vital") { h.max += 25; heal(h, 25, true); }
  if (k === "swift") h.spd *= 1.1;
  if (k === "magnet") { h.pickup *= 1.6; h.goldm += 0.25; }
  if (k === "cool") h.cdm *= 0.85;
  if (k === "crit") h.crit += 0.08;
  if (k === "multi") h.multi++;
  if (k === "pierce") h.pierce++;
  if (k === "orbit") h.orbit++;
  if (k === "vamp") h.vamp += 0.03;
  if (k === "boom") h.boom++;
  if (k === "chain") h.chain = Math.min(0.8, h.chain + 0.2);
  if (k === "thorns") h.thorns++;
  if (k === "angel") h.angel++;
  if (k === "big") h.size *= 1.25;
  G.pendingLv--;
  burst(h.x, h.y, "#c084fc", 40, 220);
  if (G.pendingLv > 0) openLevelUp();
  else { $("#levelup").hidden = true; paused = false; last = performance.now(); }
}
const SHOP = [
  { k: "heal", e: "🧪", n: "Greater Potion", d: "Heal 60%", cost: f => 30 + f * 4 },
  { k: "boon", e: "🎁", n: "Mystery Blessing", d: "A random blessing", cost: f => 60 + f * 8 },
  { k: "maxhp", e: "💖", n: "Heart Crystal", d: "+40 max HP", cost: f => 50 + f * 6 },
  { k: "sharpen", e: "🗡️", n: "Runestone", d: "+4 power", cost: f => 55 + f * 7 },
];
function openShop() { paused = true; renderShop(); $("#shop").hidden = false; }
function renderShop() {
  const f = G.floor;
  $("#shopgold").textContent = `You have ${G.gold} 💰`;
  $("#shopitems").replaceChildren(...SHOP.map(s => {
    const c = el("div", null, "card shopitem"), t = el("div");
    t.append(el("b", `${s.e} ${s.n}`), el("div", s.d, "muted small"));
    const b = el("button", `${s.cost(f)} 💰`); b.style.width = "auto"; b.dataset.shop = s.k; b.disabled = G.gold < s.cost(f);
    c.append(t, b); return c;
  }));
}
function buy(k) {
  const s = SHOP.find(x => x.k === k), cost = s.cost(G.floor), h = G.hero;
  if (G.gold < cost) return;
  G.gold -= cost;
  if (k === "heal") heal(h, h.max * 0.6);
  if (k === "maxhp") { h.max += 40; h.hp += 40; }
  if (k === "sharpen") h.pow += 4;
  if (k === "boon") { const b = pick(BOONS.filter(b => !(b.once && h.boons[b.k]))); G.pendingLv++; applyBoon(b.k); paused = true; floatText(h.x, h.y - 40, `${b.e} ${b.n}!`, "#c084fc", true); }
  renderShop();
}
function endRun(win) {
  const g = G;
  if (g.over) return;
  g.over = true;
  const h = g.hero;
  const best = load("frstBest", null);
  const score = win ? 99 : g.floor;
  if (!best || score > (best.win ? 99 : best.floor)) save("frstBest", { win, floor: g.floor, lvl: h.lvl, kills: g.kills });
  setTimeout(() => {
    paused = true;
    $("#endtitle").textContent = win ? "🏆 LEGEND OF THE FIRST REALM" : "💀 YOU HAVE FALLEN";
    $("#endtext").textContent = win ? `${profile.name} slew the First Dragon. The bards will sing of this.` : `${profile.name} fell on floor ${g.floor} of ${g.zone.name}.`;
    const mm = Math.floor(g.time / 60), ss = String(Math.floor(g.time % 60)).padStart(2, "0");
    $("#endstats").replaceChildren(...[["Floor", g.floor], ["Level", h.lvl], ["Kills", g.kills], ["Time", `${mm}:${ss}`], ["Gold", g.gold], ["Blessings", Object.values(h.boons).reduce((a, b) => a + b, 0)]]
      .map(([k, v]) => { const d = el("div"); d.append(el("b", v), el("span", k, "muted small")); return d; }));
    $("#end").hidden = false;
  }, win ? 0 : 1400);
  if (!win) { g.slow = 0.25; g.slowT = 1.2; g.endZoom = 0; burst(h.x, h.y, "#f87171", 50, 200); cinematic("FALLEN", `${profile.name} · Floor ${g.floor}`, "#ef4444", 1400, true); }
  else { g.endZoom = 0; cinematic("VICTORY", "The First Dragon is slain", "#f5c542", 2600, true); }
}
function cinematic(a, b, glow, ms, light) {
  const c = $("#cine");
  $("#cinea").textContent = a; $("#cineb").textContent = b;
  c.style.setProperty("--glow", glow);
  $("#cinea").style.animation = "none"; void $("#cinea").offsetWidth; $("#cinea").style.animation = "";
  c.classList.add("on");
  if (!light) G.cine = ms / 1000;
  clearTimeout(cinematic.t);
  cinematic.t = setTimeout(() => c.classList.remove("on"), ms);
}

// =====================================================================
// RENDER
// =====================================================================
function hud() {
  const g = G, h = g.hero;
  $("#hphp").style.width = `${100 * Math.max(0, h.hp) / h.max}%`;
  $("#hpxp").style.width = `${100 * h.xp / (6 + h.lvl * 5)}%`;
  $("#hudname").textContent = `${profile.name} · Lv ${h.lvl} · ${Math.max(0, Math.ceil(h.hp))}/${h.max}`;
  $("#hudinfo").innerHTML = "";
  $("#hudinfo").append(el("div", `Floor ${g.floor}/${LAST}`), el("div", `💰 ${g.gold} · 💀 ${g.kills}`));
  const sk = SKILLS[h.calling];
  [["#s1", h.cds[0], sk[0].cd * h.cdm], ["#s2", h.cds[1], sk[1].cd * h.cdm], ["#dash", h.dashCd, 1.3]].forEach(([s, c, tot]) => {
    const b = $(s); b.querySelector(".cd").style.setProperty("--p", `${100 * c / tot}%`); b.classList.toggle("ready", c <= 0);
  });
  if (g.boss && g.boss.hp > 0) $("#bosshp").style.width = `${100 * g.boss.hp / g.boss.max}%`;
}
function loop(t) {
  raf = requestAnimationFrame(loop);
  let dt = Math.min(0.05, (t - last) / 1000); last = t;
  if (!G) return;
  if (!paused) {
    if (G.hitstop > 0) { G.hitstop -= dt; dt = 0; }
    update(dt * G.slow);
  }
  W.render(G, paused ? 0 : dt * G.slow); hud();
}

// =====================================================================
// INPUT
// =====================================================================
addEventListener("keydown", e => {
  keys[e.code] = true;
  if (!G || $("#game").hidden) return;
  if (e.code === "KeyQ" || e.code === "Digit1" || e.code === "KeyJ") castSkill(0);
  if (e.code === "KeyE" || e.code === "Digit2" || e.code === "KeyK") castSkill(1);
  if (e.code === "Space" || e.code === "ShiftLeft" || e.code === "KeyL") { dash(); e.preventDefault(); }
  if (e.code === "Escape" || e.code === "KeyP") togglePause();
});
addEventListener("keyup", e => { keys[e.code] = false; });
const look = { id: null, x: 0, y: 0 };
cv.addEventListener("pointerdown", e => {
  if (e.target.closest("button")) return;
  if (e.clientX < innerWidth * 0.5 && !joy.on) {
    joy.id = e.pointerId; joy.on = true; joy.ox = joy.x = e.clientX; joy.oy = joy.y = e.clientY;
    $("#hint").hidden = true;
  } else if (look.id == null) { look.id = e.pointerId; look.x = e.clientX; look.y = e.clientY; }
  cv.setPointerCapture(e.pointerId);
});
cv.addEventListener("pointermove", e => {
  if (joy.on && e.pointerId === joy.id) { joy.x = e.clientX; joy.y = e.clientY; }
  if (e.pointerId === look.id) {   // drag to turn the camera
    W.cam.yaw -= (e.clientX - look.x) * 0.007;
    W.cam.pitch = clamp(W.cam.pitch + (e.clientY - look.y) * 0.004, 0.25, 1.15);
    look.x = e.clientX; look.y = e.clientY;
  }
});
const endJoy = e => { if (e.pointerId === joy.id) { joy.on = false; joy.id = null; } if (e.pointerId === look.id) look.id = null; };
cv.addEventListener("pointerup", endJoy); cv.addEventListener("pointercancel", endJoy);
for (const [id, fn] of [["#s1", () => castSkill(0)], ["#s2", () => castSkill(1)], ["#dash", dash]])
  $(id).addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); fn(); });
function togglePause() {
  if (!G || G.over || !$("#levelup").hidden || !$("#shop").hidden) return;
  paused = !paused;
  $("#pause").hidden = !paused;
  if (paused) {
    const b = G.hero.boons;
    $("#pauseboons").replaceChildren(el("b", "Your blessings"), el("p", Object.keys(b).length ? Object.entries(b).map(([k, n]) => { const x = BOONS.find(y => y.k === k); return `${x.e} ${x.n}${n > 1 ? " ×" + n : ""}`; }).join(" · ") : "None yet", "muted small"));
  } else last = performance.now();
}
$("#pausebtn").addEventListener("click", togglePause);
$("#resume").addEventListener("click", togglePause);
$("#quit").addEventListener("click", () => { $("#pause").hidden = true; paused = false; endRun(false); });
$("#again").addEventListener("click", () => newRun());
$("#tomenu").addEventListener("click", () => { cancelAnimationFrame(raf); G = null; renderHome(); });
$("#shopclose").addEventListener("click", () => { $("#shop").hidden = true; paused = false; last = performance.now(); });
document.addEventListener("visibilitychange", () => { if (document.hidden && G && !G.over && !paused) togglePause(); });

// creator buttons
$("#name").addEventListener("input", () => { $("#pvname").textContent = $("#name").value.trim() || "Your legend"; });
$("#savehero").addEventListener("click", () => {
  const n = $("#name").value.trim().slice(0, 16);
  if (!n) return alert("Give your hero a name first");
  profile.name = n; save("frstHero", profile); saved = true; renderHome();
});
$("#edithero").addEventListener("click", () => { saved = false; renderHome(); });
$("#randomize").addEventListener("click", () => { const n = profile.name; profile = randomProfile(); profile.name = n; renderCreator(); });
$("#sortme").addEventListener("click", startOath);
$("#sortback").addEventListener("click", () => renderHome());
$("#playsolo").addEventListener("click", () => newRun());
document.addEventListener("click", e => {
  const t = e.target.closest("[data-set],[data-oath],[data-boon],[data-shop]");
  if (!t) return;
  const d = t.dataset;
  if (d.set) { profile[d.set] = d.val; if (d.set === "race" && !RACES[d.val].skins.includes(profile.skin)) profile.skin = RACES[d.val].skins[0]; renderCreator(); }
  if (d.oath) { oath.score[d.oath] = (oath.score[d.oath] || 0) + 1; oath.i++; renderOath(); }
  if (d.boon) applyBoon(d.boon);
  if (d.shop) buy(d.shop);
});

// keyboard camera turning (Z / C) for computers
addEventListener("keydown", e => { if (!G) return; if (e.code === "KeyZ") W.cam.yaw += 0.15; if (e.code === "KeyC") W.cam.yaw -= 0.15; });
const playBtn = $("#playsolo");
W.init($("#view")).then(() => { playBtn.disabled = false; playBtn.textContent = "⚔️ Enter the Undercroft"; renderHome(); })
  .catch(err => { playBtn.textContent = "Couldn't load 3D (" + err.message + ")"; });
playBtn.disabled = true; playBtn.textContent = "Loading the realm…";
renderHome();
window.__frst = { get G() { return G; }, castSkill, dash, applyBoon, keys, joy, W };   // handy for testing
