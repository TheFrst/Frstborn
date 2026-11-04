// FRSTBORN: a fantasy life & career simulator. Everything runs on your phone and saves in your browser.
import { RACES, RACE_STATS, HAIR_STYLES, HAIR_COLORS, EYE_COLORS, MARKS, ORDERS, OATH, CALLINGS, TALENTS, TALENT_RANKS, STATS, HEIRLOOMS, PETS } from "./data.js";
import { EVENTS, NAMES1, NAMES2, TEACHERS, GUILDS, RANKS, PLACES, QUEST_TYPES, QUEST_MONSTERS, LEGENDS, MAGIC, WEAPON_NOUN, TIER, TIER_PRICE, APPROACHES, TWISTS, PERKS, HOMES, SIGNATURE } from "./events.js";
import { figureEl, portraitEl } from "./figure.js";

const $ = s => document.querySelector(s);
const el = (tag, text, cls) => { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; return e; };
const load = (k, d) => { try { const v = localStorage[k]; return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k, v) => { try { localStorage[k] = JSON.stringify(v); } catch {} };
const pick = a => a[Math.floor(Math.random() * a.length)];
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const heroLine = p => `${RACES[p.race]?.name} ${CALLINGS[p.calling]?.name} · ${ORDERS[p.order]?.icon} ${ORDERS[p.order]?.name}`;
const SEASONS = ["🍂 Autumn", "❄️ Winter", "🌱 Spring", "☀️ Summer"];
const STAT_KEYS = Object.keys(STATS);
const LIFE = { elf: 1.6, vampire: 1.8, revenant: 1.6, celestial: 1.5, fae: 1.3, dwarf: 1.25, gnome: 1.3, dragonkin: 1.2, merfolk: 1.15 };
const FAME_TIERS = [[0, "Unknown"], [60, "Local name"], [180, "Known in the Realm"], [500, "Famous"], [1200, "Renowned"], [2500, "Legendary"], [5000, "Mythic"]];
const fameTier = f => FAME_TIERS.filter(t => f >= t[0]).pop()[1];

// =====================================================================
// CHARACTER CREATOR
// =====================================================================
function randomProfile() {
  const race = pick(Object.keys(RACES)), calling = pick(Object.keys(CALLINGS));
  return { name: "", race, skin: pick(RACES[race].skins), hair: pick(HAIR_STYLES), hairColor: pick(HAIR_COLORS), eyes: pick(EYE_COLORS),
    mark: pick(Object.keys(MARKS)), order: pick(Object.keys(ORDERS)), calling, talents: [...CALLINGS[calling].talents],
    heirloom: pick(Object.keys(HEIRLOOMS)), pet: pick(Object.keys(PETS)) };
}
let profile = load("frstHero", null);
if (profile && (!CALLINGS[profile.calling] || !HEIRLOOMS[profile.heirloom])) { profile.calling = CALLINGS[profile.calling] ? profile.calling : "elementalist"; profile.heirloom = HEIRLOOMS[profile.heirloom] ? profile.heirloom : "emberring"; }
if (profile && !Array.isArray(profile.talents)) profile.talents = [...CALLINGS[profile.calling].talents];
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
  $("#preview").replaceChildren(figureEl(p, 84));
  $("#pvname").textContent = $("#name").value.trim() || "Your legend";
  $("#pvline").textContent = heroLine(p);
  $("#pvtal").textContent = p.talents.map(t => TALENTS[t].icon + " " + TALENTS[t].name).join(" · ");
  $("#races").replaceChildren(...Object.entries(RACES).map(([k, r]) => choiceBtn("race", k, r.icon, r.name, null, p.race === k)));
  $("#raceperk").textContent = `${RACES[p.race].name}: ${RACES[p.race].perk}`;
  $("#skins").replaceChildren(...RACES[p.race].skins.map(c => swatch("skin", c, p.skin === c)));
  $("#hairs").replaceChildren(...HAIR_STYLES.map(h => textBtn("hair", h, h[0].toUpperCase() + h.slice(1), p.hair === h)));
  $("#haircolors").replaceChildren(...HAIR_COLORS.map(c => swatch("hairColor", c, p.hairColor === c)));
  $("#eyecolors").replaceChildren(...EYE_COLORS.map(c => swatch("eyes", c, p.eyes === c)));
  $("#marks").replaceChildren(...Object.entries(MARKS).map(([k, n]) => textBtn("mark", k, n, p.mark === k)));
  $("#orders").replaceChildren(...Object.entries(ORDERS).map(([k, o]) => choiceBtn("order", k, o.icon, o.name, `${o.trait}`, p.order === k)));
  $("#callings").replaceChildren(...Object.entries(CALLINGS).map(([k, c]) => choiceBtn("calling", k, c.icon, c.name, c.role, p.calling === k)));
  $("#talcount").textContent = `(${p.talents.length}/3 picked)`;
  $("#talents").replaceChildren(...Object.entries(TALENTS).map(([k, t]) => { const b = choiceBtn("talent", k, t.icon, t.name, t.desc, p.talents.includes(k)); return b; }));
  $("#heirlooms").replaceChildren(...Object.entries(HEIRLOOMS).map(([k, h]) => choiceBtn("heirloom", k, h.icon, h.name, h.perk, p.heirloom === k)));
  $("#pets").replaceChildren(...Object.entries(PETS).map(([k, h]) => choiceBtn("pet", k, h.icon, h.name, h.perk, p.pet === k)));
}
function showPage(id) { document.querySelectorAll("section").forEach(s => s.hidden = s.id !== id); scrollTo(0, 0); }
function renderHome() {
  showPage("home"); delete document.body.dataset.season;
  $("#name").value = profile.name || $("#name").value;
  $("#creator").hidden = saved; $("#play").hidden = !saved; $("#herosummary").hidden = !saved;
  if (saved) {
    const box = $("#herosummary");
    box.style.setProperty("--house", ORDERS[profile.order].color);
    const t = el("div");
    t.append(el("div", profile.name, "title"), el("div", heroLine(profile), "muted small"),
      el("div", profile.talents.map(k => TALENTS[k].icon + " " + TALENTS[k].name).join(" · "), "muted small"),
      el("div", `${HEIRLOOMS[profile.heirloom].icon} ${HEIRLOOMS[profile.heirloom].name} · ${PETS[profile.pet].icon} ${PETS[profile.pet].name}`, "muted small"));
    box.replaceChildren(figureEl(C && C.phase !== "over" ? lookOf(C) : profile, 70), t);
    const live = C && C.phase !== "over";
    $("#playsolo").textContent = live ? `▶ Continue: age ${C.age}, ${C.phase === "academy" ? `Year ${C.schoolYear} at Aldermoor` : C.guild ? `${RANKS[C.rank]} of ${GUILDS[C.guild].name}` : "Free adventurer"}` : "📜 Begin your Legend";
    $("#newlife").hidden = !live;
    renderHall();
  } else renderCreator();
}
function renderHall() {
  const hall = load("frstLegends", []);
  const box = $("#hall");
  if (!hall.length) { box.replaceChildren(el("p", "No legend yet. Will you be the first?", "muted small center")); return; }
  box.replaceChildren(el("h3", "🏛️ Hall of Legends"), ...hall.slice(0, 8).map((h, i) => {
    const row = el("div", null, "hallrow");
    const t = el("div"); t.append(el("b", `${i + 1}. ${h.name}, ${h.title}`), el("div", `${h.line} · lived to ${h.age} · ${h.trophies} trophies`, "muted small"));
    row.append(portraitEl(h.look, 42), t, el("div", String(h.legacy), "legacy"));
    return row;
  }));
}
function startOath() { oath = { i: 0, score: {} }; showPage("sorting"); renderOath(); }
function renderOath() {
  const q = OATH[oath.i];
  $("#sortresult").hidden = !!q; $("#sortbox").hidden = !q;
  if (q) {
    $("#sortstep").textContent = `Question ${oath.i + 1} of ${OATH.length}`;
    $("#sortq").textContent = q.q;
    $("#sorta").replaceChildren(...shuffle(q.a).map(([t, o]) => { const b = el("button", t, "alt"); b.dataset.oath = o; return b; }));
    return;
  }
  const best = Object.entries(oath.score).sort((a, b) => b[1] - a[1] || Math.random() - 0.5)[0][0];
  profile.order = best;
  const o = ORDERS[best];
  $("#sortstep").textContent = "The Oath is sworn…";
  const r = $("#sortresult");
  r.replaceChildren(el("div", o.icon, "bigtxt"), el("div", o.name.toUpperCase() + "!", "bigtxt"), el("p", `${o.trait}.`, "muted"));
  r.style.color = o.color;
}

// =====================================================================
// THE LIFE
// =====================================================================
let C = load("frstCareer", null);
if (C && C.v !== 2) C = null;
if (C) { C.perks = C.perks || []; C.home = C.home || 0; C.arc = C.arc || 0; C.perkAt = C.perkAt || 30; }   // older saves
const has = k => !!C?.perks?.includes(k);
const persist = () => save("frstCareer", C);
const fullName = () => NAMES1[ri(0, NAMES1.length - 1)] + " " + NAMES2[ri(0, NAMES2.length - 1)];
function npcLook() { const p = randomProfile(); return p; }
function lookOf(c) {
  const ea = effAge(c), l = { ...c.look, cape: c.rank >= 3 || c.gear.a >= 3, crown: c.awards > 0 || c.rank >= 5 };
  if (ea >= 68) l.hairColor = "#eeeeee"; else if (ea >= 54) l.hairColor = "#9ca3af";   // going grey
  return l;
}
const mainStat = c => Object.entries(CALLINGS[c.calling].w).sort((a, b) => b[1] - a[1])[0][0];
function ovr(c) {
  const w = CALLINGS[c.calling].w; let s = 0, t = 0;
  for (const k of STAT_KEYS) { const wk = (w[k] || 0) + 0.5; s += c.st[k] * wk; t += wk; }
  const lv = Object.values(c.tal).map(x => x.l).sort((a, b) => b - a).slice(0, 3);
  return Math.round(clamp(s / t * 0.85 + lv.reduce((a, b) => a + b, 0) * 0.6, 1, 99));
}
const expected = c => c.phase === "academy" ? 16 + (c.age - 11) * 3.8 : 40 + Math.min(c.rank * 6, 30) + Math.min((c.age - 18) * 1.2, 18);
const effAge = c => 18 + (c.age - 18) / (LIFE[c.race] || 1);

function newLife() {
  const p = profile, st = {};
  for (const k of STAT_KEYS) st[k] = 12 + ri(0, 4) + (RACE_STATS[p.race]?.[k] || 0) + (HEIRLOOMS[p.heirloom].b?.[k] || 0) + (PETS[p.pet].b?.[k] || 0) + ((CALLINGS[p.calling].w[k] || 0) >= 3 ? 4 : 0);
  const tal = {}; for (const t of p.talents) tal[t] = { l: 1, x: 0 };
  const rival = { name: fullName(), look: npcLook(), ovr: 22 };
  C = { v: 2, look: { ...p }, name: p.name, race: p.race, calling: p.calling, order: p.order, pet: p.pet, heirloom: p.heirloom,
    age: 11, worldYear: 1043, season: 0, phase: "academy", schoolYear: 1,
    st, tal, energy: 100, gold: 40, fame: 0, injury: null, gear: { w: 0, a: 0, r: 0 },
    guild: null, rank: 0, rep: 0, flags: {}, seen: {}, onTeam: false,
    rival, friends: [fullName()], teacher: pick(TEACHERS), partner: null, kids: [],
    trophies: [], log: [], perks: [], home: 0, arc: 0, perkAt: 30, awards: 0, orderCups: 0, grades: [], orderPts: {},
    yr: null, totals: { quests: 0, triumphs: 0, fails: 0, gold: 0, legends: [] }, heroes: [], best: { rating: 0 } };
  resetYear();
  for (const k in ORDERS) C.orderPts[k] = 0;
  logIt(`✉️ A letter sealed with dragon wax: ${C.name} is accepted to Aldermoor Academy, Order of ${ORDERS[C.order].name}.`);
  persist();
  queue.push({ intro: true });
  openCareer();
}
function resetYear() { C.yr = { quests: 0, ratings: [], fame0: C.fame, gold0: C.gold, triumphs: 0, studied: 0, skyW: 0, skyL: 0, promo: null }; }
function logIt(t, big) { C.log.unshift({ a: C.age, s: C.season, t, big: !!big }); if (C.log.length > 220) C.log.length = 220; }
function trophy(icon, name) { C.trophies.push({ icon, name, age: C.age, y: C.worldYear }); logIt(`${icon} Trophy: ${name}`, true); }

// ---------- effects ----------
function gainStat(k, n) {
  if (n > 0) n = Math.max(1, Math.round(n * (1 - C.st[k] / 130)));
  C.st[k] = clamp(C.st[k] + n, 1, 100); return n;
}
function talXp(k, n) {
  if (!TALENTS[k]) return null;
  const isNew = !C.tal[k];
  if (isNew) C.tal[k] = { l: has("polymath") ? 2 : 1, x: 0 };
  const t = C.tal[k]; let up = 0;
  t.x += n * (1 + (PETS[C.pet].train || 0) + (has("scholar") ? 0.25 : 0));
  while (t.l < 10 && t.x >= 10 + t.l * 7) { t.x -= 10 + t.l * 7; t.l++; up++; for (const s of TALENTS[k].s) gainStat(s, 1); }
  if (t.l >= 10) t.x = 0;
  if (up && t.l >= 7) logIt(`${TALENTS[k].icon} ${TALENTS[k].name} reached ${TALENT_RANKS[t.l]}!`, t.l >= 9);
  return { isNew, up, l: t.l };
}
function resolveTal(k) {
  if (k === "main") { const mine = Object.keys(C.tal); return pick(mine); }
  if (k === "rand") { const not = Object.keys(TALENTS).filter(t => !C.tal[t]); return not.length && Math.random() < 0.6 ? pick(not) : pick(Object.keys(TALENTS)); }
  if (k === "magic") return pick(MAGIC);
  return k;
}
function fill(t) {
  return t.replace(/\{N\}/g, C.name).replace(/\{R\}/g, C.rival.name).replace(/\{F\}/g, C.friends[0] || "your friend").replace(/\{O\}/g, ORDERS[C.order].name)
    .replace(/\{G\}/g, C.guild ? GUILDS[C.guild].name : "your company").replace(/\{P\}/g, PETS[C.pet].name.toLowerCase()).replace(/\{M\}/g, C._m || (C._m = pick(QUEST_MONSTERS)))
    .replace(/\{Pa\}/g, C.partner || "your love").replace(/\{T\}/g, C.teacher);
}
function apply(fx) {
  const chips = [];
  if (!fx) return chips;
  for (const tok of fx.split(/\s+/).filter(Boolean)) {
    let m;
    if ((m = tok.match(/^(might|arcana|agility|spirit|charm|wits|main)([+-]\d+)$/))) { const k = m[1] === "main" ? mainStat(C) : m[1]; const n = gainStat(k, +m[2]); chips.push([`${n > 0 ? "+" : ""}${n} ${STATS[k]}`, n > 0]); }
    else if ((m = tok.match(/^(fame|gold|energy|op|rep)([+-]\d+)$/))) {
      let n = +m[2];
      if (m[1] === "fame") { if (n > 0) n = Math.round(n * (1 + (HEIRLOOMS[C.heirloom].fame || 0) + C.gear.r * 0.08 + (has("star") ? 0.25 : 0))); C.fame = Math.max(0, C.fame + n); chips.push([`${n > 0 ? "+" : ""}${n} ⭐ Fame`, n > 0]); }
      if (m[1] === "gold") { C.gold = Math.max(0, C.gold + n); if (n > 0) C.totals.gold += n; chips.push([`${n > 0 ? "+" : ""}${n} 💰`, n > 0]); }
      if (m[1] === "energy") { C.energy = clamp(C.energy + n, 0, 100); chips.push([`${n > 0 ? "+" : ""}${n} ⚡ Energy`, n > 0]); }
      if (m[1] === "op" && C.phase === "academy") { C.orderPts[C.order] += n; chips.push([`${n > 0 ? "+" : ""}${n} ${ORDERS[C.order].icon} Order points`, n > 0]); }
      if (m[1] === "rep" && C.guild) { if (n > 0 && has("beloved")) n = Math.round(n * 1.3); C.rep += n; chips.push([`${n > 0 ? "+" : ""}${n} 🏰 Guild standing`, n > 0]); }
    }
    else if ((m = tok.match(/^tal:(\w+)\+(\d+)$/))) { const k = resolveTal(m[1]); const r = talXp(k, +m[2]); if (r) chips.push([r.isNew ? `NEW TALENT: ${TALENTS[k].icon} ${TALENTS[k].name}!` : r.up ? `${TALENTS[k].icon} ${TALENTS[k].name} ↑ ${TALENT_RANKS[r.l]}` : `+${m[2]} ${TALENTS[k].icon} ${TALENTS[k].name} xp`, true]); if (r?.isNew) logIt(`✨ Learned a new talent: ${TALENTS[k].icon} ${TALENTS[k].name}`); }
    else if ((m = tok.match(/^injury:(.+):(\d+)$/))) { if (Math.random() < C.gear.a * 0.1 + (has("iron") ? 0.3 : 0)) chips.push(["🛡️ You shrug off the injury", true]); else { const t = Math.max(1, Math.ceil(+m[2] / (1 + (PETS[C.pet].heal || 0))) - (has("iron") ? 1 : 0)); C.injury = { n: m[1].replace(/_/g, " "), t }; chips.push([`🩹 ${C.injury.n} (${t} season${t > 1 ? "s" : ""})`, false]); logIt(`🩹 Injured: ${C.injury.n}`); } }
    else if ((m = tok.match(/^arc:(\d)$/))) { C.arc = +m[1]; C.arcY = C.worldYear; if (+m[1] === 2) logIt("🌑 The Shadow King has retreated to his fortress. The final battle is coming…", true); }
    else if ((m = tok.match(/^flag:(\w+)$/))) { C.flags[m[1]] = true; if (m[1] === "team") { C.onTeam = true; logIt("🧹 Made the Skyball team!"); } }
    else if ((m = tok.match(/^unflag:(\w+)$/))) delete C.flags[m[1]];
    else if (tok === "friend") { const f = fullName(); C.friends.unshift(f); chips.push([`🤝 New friend: ${f}`, true]); }
    else if (tok === "partner") { C.partner = fullName(); chips.push([`❤️ ${C.partner}`, true]); logIt(`❤️ Fell in love with ${C.partner}`); }
    else if (tok === "kid") { const k = NAMES1[ri(0, NAMES1.length - 1)]; C.kids.push(k); chips.push([`👶 ${k} is born!`, true]); logIt(`👶 Your child ${k} is born`, true); }
    else if ((m = tok.match(/^trophy:([^:]+):(.+)$/))) { trophy(m[1], fill(m[2].replace(/_/g, " "))); chips.push([`${m[1]} ${fill(m[2].replace(/_/g, " "))}`, true]); }
    else if ((m = tok.match(/^(weapon|armor|relic)\+1$/))) { const s = m[1][0] === "w" ? "w" : m[1][0] === "a" ? "a" : "r"; C.gear[s] = Math.min(5, C.gear[s] + 1); chips.push([`🎁 ${m[1]} upgraded`, true]); }
  }
  return chips;
}
// "might:+5" | "main:-5" | "tal:lockpicking:3"
function chance(ck) {
  const [k, off] = ck.split(":");
  const key = k === "main" ? mainStat(C) : k;
  const val = C.st[key];
  return clamp(0.55 + (val - (expected(C) + +off)) / 32 + (PETS[C.pet].luck || 0) * 0.5 - (C.injury ? 0.1 : 0) + (has("lucky") ? 0.06 : 0) + (key === "charm" && has("silver") ? 0.08 : 0), 0.08, 0.95);
}

// ---------- turn flow ----------
let queue = [];           // cards waiting to be shown in the modal
let turnOpen = false;     // true once this season's action has started: when all its cards are read, time moves on
function actions() {
  const A = [];
  const ac = C.phase === "academy", summer = C.season === 3, hurt = !!C.injury;
  if (ac && summer) {
    A.push({ k: "adventure", ic: "🗺️", t: "Summer adventure", s: `Explore the Realm with ${C.friends[0]}`, cost: 25 });
    A.push({ k: "camp", ic: "🏕️", t: "Training camp", s: "Lots of talent practice", cost: 25 });
    A.push({ k: "work", ic: "🧺", t: "Summer job", s: "Earn some gold", cost: 15 });
    A.push({ k: "rest", ic: "🏡", t: "Rest at home", s: "Full energy, heal faster", cost: 0 });
    return A;
  }
  if (ac) {
    A.push({ k: "study", ic: "📖", t: "Study hard", s: "Raise your stats, better exam grades", cost: 15 });
    A.push({ k: "train", ic: "🎯", t: "Train a talent", s: "Level up a skill", cost: 20, pickTal: true });
    A.push({ k: "duelclub", ic: "⚔️", t: "Duelling Club", s: "Fight classmates", cost: 20, block: hurt });
    A.push({ k: "friends", ic: "🤝", t: "Hang out", s: "Charm, friends, fun", cost: 5 });
    A.push({ k: "sneak", ic: "🌙", t: "Explore at night", s: "Secrets… or detention", cost: 15 });
    A.push({ k: "rest", ic: "💤", t: "Rest", s: "Get your energy back", cost: 0 });
  } else {
    A.push({ k: "quest", ic: "🗺️", t: "Take a quest", s: hurt ? "You're injured" : "Adventure, gold and fame", cost: 30, block: hurt });
    A.push({ k: "train", ic: "🎯", t: "Train a talent", s: "Level up a skill", cost: 20, pickTal: true });
    A.push({ k: "study", ic: "📚", t: "Study & research", s: "Raise your stats", cost: 15 });
    A.push({ k: "tavern", ic: "🍻", t: "The tavern", s: "Rumours, friends, love", cost: 5 });
    if (C.age >= 30) A.push({ k: "teach", ic: "👨‍🏫", t: "Teach at Aldermoor", s: "Gold and respect", cost: 15 });
    A.push({ k: "rest", ic: "💤", t: "Rest", s: hurt ? "Heal your injury" : "Get your energy back", cost: 0 });
  }
  return A;
}
function doAction(k, talKey) {
  const A = actions().find(a => a.k === k); if (!A || A.block) return;
  if (A.pickTal && !talKey) return openTalentPicker(k);
  turnOpen = true;
  const lowE = C.energy < A.cost;
  const mult = lowE ? 0.5 : 1;
  C.energy = clamp(C.energy - A.cost, 0, 100);
  const out = { title: `${A.ic} ${A.t}`, text: "", chips: [] };
  const g = n => Math.max(1, Math.round(n * mult));
  if (k === "study") {
    const w = CALLINGS[C.calling].w, keys = Object.keys(w).sort((a, b) => w[b] - w[a]);
    const a = Math.random() < 0.7 ? keys[0] : pick(STAT_KEYS), b = pick(keys);
    out.chips.push(...apply(`${a}+${g(ri(3, 5) + (has("scholar") ? 1 : 0))} ${b}+${g(ri(1, 3))}`));
    C.yr.studied++;
    out.text = pick(["Hours in the library. Your head hurts, but it's worth it.", "You fill three notebooks. Your quill is worn down to a stub.", `${C.teacher} gives you extra reading. You actually enjoy it.`]);
    if (C.phase === "academy") out.chips.push(...apply("op+5"));
  }
  if (k === "train") {
    const r = talXp(talKey, g(ri(9, 14)));
    const T = TALENTS[talKey];
    out.text = `You practise ${T.name} until your hands shake. ${pick(["It's starting to feel natural.", "Your teacher nods. High praise.", "You break a training dummy. Good sign."])}`;
    out.chips.push([r.up ? `${T.icon} ${T.name} ↑ ${TALENT_RANKS[r.l]}!` : `${T.icon} ${T.name} xp +`, true]);
    if (Math.random() < 0.5) out.chips.push(...apply(`${pick(T.s)}+${g(2)}`));
  }
  if (k === "duelclub") {
    const riv = Math.random() < 0.35;
    queue.push({ fight: { title: "⚔️ Duelling Club", opp: riv ? { name: C.rival.name, look: C.rival.look } : npc(), pow: oppPow(riv ? 1.02 : 0.9),
      win: { fx: `main+${g(3)} fame+3 op+10 tal:main+6`, t: "The whole club cheers. You bow." }, lose: { fx: `main+${g(1)} tal:main+4`, t: "You'll remember that move next time." } } });
    C.duels = C.duels || { w: 0, l: 0 };
    return afterAction();
  }
  if (k === "friends") {
    out.text = pick([`You and ${C.friends[0]} sneak into Hogsbreath Village for butterbeer… er, honeymead.`, `A snowball fight with enchanted snow. ${C.friends[0]} still has some in their ear.`, `You spend the afternoon by the lake with ${C.friends[0]}, talking about everything.`]);
    out.chips.push(...apply(`charm+${g(3)} energy+15` + (Math.random() < 0.35 ? " friend" : "")));
  }
  if (k === "sneak") {
    if (Math.random() < chance("agility:+0")) { out.text = pick(["You find a secret passage behind a painting of a sleeping troll.", "The restricted library is yours for a night.", "On the roof of the Astronomy Tower you watch a comet and learn its secret."]); out.chips.push(...apply(`tal:rand+12 wits+${g(2)}`)); }
    else { out.text = "The caretaker's cat finds you. Detention: scrubbing cauldrons for a week."; out.chips.push(...apply("op-15")); }
  }
  if (k === "rest") { out.text = C.injury ? "You rest and let your wounds heal." : "You sleep in, eat well and feel like yourself again."; out.chips.push(...apply("energy+45")); if (C.injury) { C.injury.t--; out.chips.push(["🩹 Healing faster", true]); } }
  if (k === "adventure") {
    if (Math.random() < chance("main:+0")) { out.text = `You and ${C.friends[0]} find a ${pick(["hidden waterfall cave", "sunken pirate ship", "wild pegasus herd", "witch's abandoned tower"])}. Best summer ever.`; out.chips.push(...apply(`tal:rand+10 main+${g(2)} gold+${ri(10, 40)} fame+4`)); }
    else { out.text = "It rains the whole time and you get chased by geese. Still fun."; out.chips.push(...apply("charm+2")); }
  }
  if (k === "camp") { const t = pick(Object.keys(C.tal)); talXp(t, 16); out.text = `A summer at the ${pick(["Highpine", "Saltrock", "Emberglen"])} training camp.`; out.chips.push([`${TALENTS[t].icon} ${TALENTS[t].name} +16 xp`, true], ...apply(`main+${g(2)}`)); }
  if (k === "work") { const n = ri(40, 90); out.text = pick(["You sell potions in the market.", "You help at your uncle's griffon stables.", "You copy scrolls for the library."]); out.chips.push(...apply(`gold+${n} wits+1`)); }
  if (k === "tavern") {
    out.text = pick(["The Gilded Goose is loud tonight. You hear rumours of treasure in the north.", "You arm-wrestle a dwarf and lose. Everybody buys you a drink anyway.", "A bard sings a song you swear is about you."]);
    out.chips.push(...apply(`charm+${g(2)} energy+10 fame+${ri(1, 6)}` + (Math.random() < 0.3 ? " friend" : "")));
  }
  if (k === "teach") { out.text = `Students crowd into your class at Aldermoor. ${pick(["One sets their eyebrows on fire.", "They hang on your every word.", "You tell them the story of your first quest."])}`; out.chips.push(...apply(`gold+${ri(60, 120) * (has("beloved") ? 2 : 1)} fame+8 wits+1 tal:leadership+5`)); C.flags.taught = (C.flags.taught || 0) + 1; }
  if (lowE) out.chips.push(["😴 Too tired: half gains", false]);
  queue.push({ result: out });
  afterAction();
}
function afterAction() {
  // scheduled happenings
  if (C.phase === "academy") {
    if (C.onTeam && (C.season === 0 || C.season === 2)) queue.push({ skyball: true });
    if (C.season === 1) queue.push({ fight: tourneyFight(0) });
    if (C.season === 2) queue.push({ exams: true });
  }
  // a random event
  const evChance = C.phase === "academy" ? 0.55 : 0.5;
  const arcEv = C.phase === "career" && EVENTS.find(e => e.id.startsWith("arc") && !C.seen[e.id] && e.if(C));
  if (arcEv && Math.random() < 0.6) queue.push({ event: arcEv });
  else if (C.phase === "career" && !C.injury && Math.random() < 0.09) queue.push({ fight: { title: `⚔️ ${C.rival.name} challenges you!`, opp: { name: C.rival.name, look: C.rival.look }, pow: myPower() * clamp((C.heroes[0]?.ovr || ovr(C)) / ovr(C), 0.85, 1.25),
    win: { fx: "fame+40 main+1", t: `${C.rival.name} kneels in the dust. The crowd chants your name.` }, lose: { fx: "fame-10", t: `${C.rival.name} laughs and walks away. Next time.` } } });
  else if (Math.random() < evChance) { const e = pickEvent(); if (e) queue.push({ event: e }); }
  showNext();
}
function pickEvent() {
  const ph = C.phase === "academy" ? "a" : "c";
  const list = EVENTS.filter(e => !e.id.startsWith("arc") && (e.ph === ph || e.ph === "*") && (!e.if || e.if(C)) && !(e.once && C.seen[e.id]));
  if (!list.length) return null;
  const w = list.map(e => 1 / (1 + (C.seen[e.id] || 0) * 2));
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) { r -= w[i]; if (r <= 0) return list[i]; }
  return list[0];
}
function advance() {
  // season ends
  C._m = null;
  C.energy = clamp(C.energy + 15 + (has("tireless") ? 10 : 0) + C.home * 4, 0, 100);
  if (C.injury) { C.injury.t--; if (C.injury.t <= 0) { logIt(`💪 Recovered from ${C.injury.n}`); C.injury = null; } }
  if (C.phase === "academy") for (const k in ORDERS) if (k !== C.order) C.orderPts[k] += ri(10, 32);
  if (C.phase === "academy") { const w = CALLINGS[C.calling].w; gainStat(Math.random() < 0.6 ? pick(Object.keys(w)) : pick(STAT_KEYS), 2); }
  C.season++;
  if (C.season > 3) { C.season = 0; yearEnd(); }
  if (ovr(C) >= C.perkAt && C.phase !== "over" && Object.keys(PERKS).some(k => !has(k))) { C.perkAt += 10; queue.push({ perk: true }); }
  persist();
}

// ---------- the academy ----------
function skyballCard() {
  const opp = pick(Object.keys(ORDERS).filter(k => k !== C.order));
  const me = C.st.agility * 0.6 + C.st.might * 0.4 + (C.tal.dragonriding?.l || 0) * 2;
  const score = me + rnd(-18, 18), them = expected(C) + rnd(-15, 15);
  const win = score > them;
  const rating = clamp(6.5 + (score - them) / 10, 3, 10).toFixed(1);
  const a = ri(2, 6) * 10, b = ri(1, 5) * 10, sA = win ? Math.max(a, b) + 150 : Math.min(a, b), sB = win ? Math.min(a, b) : Math.max(a, b) + 150;
  C.yr[win ? "skyW" : "skyL"]++;
  const chips = apply(win ? "op+30 fame+6 agility+1" : "agility+1");
  logIt(`🧹 Skyball: ${ORDERS[C.order].name} ${sA}–${sB} ${ORDERS[opp].name} (rating ${rating})`);
  return { title: "🧹 Skyball match", text: `${ORDERS[C.order].icon} ${ORDERS[C.order].name} vs ${ORDERS[opp].icon} ${ORDERS[opp].name}. ${win ? "You catch the Snapwing to win the match!" : "They catch the Snapwing first. So close."}`, big: `${sA} – ${sB}`, chips: [[`Your rating: ${rating}/10`, +rating >= 6], ...chips] };
}
const npc = () => ({ name: fullName(), look: npcLook() });
const oppPow = f => myPower() * f * clamp(expected(C) / Math.max(1, ovr(C)), 0.85, 1.15);
function tourneyFight(r) {
  const opp = r === 2 ? { name: C.rival.name, look: C.rival.look } : npc();
  return { title: `⚔️ Winter Tournament: ${["Round 1", "Semi-final", "FINAL"][r]}`, opp, pow: oppPow([0.86, 0.96, 1.06][r]),
    win: r < 2 ? { fx: "op+10 main+1", t: `${opp.name} is out. On to the ${["semi-final", "FINAL"][r]}!`, next: () => tourneyFight(r + 1) }
      : { fx: `fame+20 op+50 main+2 trophy:⚔️:Duelling_Champion,_Year_${C.schoolYear}`, t: `🏆 You beat ${C.rival.name} in the final. CHAMPION!` },
    lose: { fx: "main+1", t: r === 2 ? `So close. ${C.rival.name} lifts the trophy… this year.` : "Knocked out. There's always next winter." } };
}
// ---------- duels you fight yourself: Strike beats Spell, Spell beats Guard, Guard beats Strike ----------
const BEATS = { strike: "spell", spell: "guard", guard: "strike" };
const MOVES = { strike: ["⚔️", "Strike"], guard: ["🛡️", "Guard"], spell: ["✨", "Spell"] };
let F = null, curQ = null;
function myPower() { const best = Math.max(...Object.values(C.tal).map(t => t.l)); return (C.st[mainStat(C)] * 0.5 + ovr(C) * 0.5 + best * 1.5 + C.gear.w * 2) * (has("duelist") ? 1.15 : 1); }
function startFight(o) {
  F = { ...o, me: myPower(), hp: 100, ohp: 100, round: 0, sig: true, last: null, line: `${o.opp.name} steps into the circle.`, oppMove: null };
  nextOppMove(); renderFight();
}
function nextOppMove() {
  const m = Object.keys(BEATS);
  let mv = pick(m);
  if (BEATS[F.last] && Math.random() < 0.35) mv = Object.keys(BEATS).find(k => BEATS[k] === F.last);   // they read your habits
  F.oppMove = mv;
  const acc = clamp(0.5 + (C.st.wits - expected(C)) / 80 + (has("lucky") ? 0.05 : 0), 0.35, 0.85);
  const shown = Math.random() < acc ? mv : pick(m.filter(x => x !== mv));
  F.tell = { strike: `${F.opp.name} grips their weapon and leans forward…`, guard: `${F.opp.name} plants their feet and raises a guard…`, spell: `${F.opp.name}'s hands begin to glow…` }[shown];
}
function hpBar(v) { const b = el("div", null, "hp"); const i = el("div"); i.style.width = Math.max(0, v) + "%"; if (v < 30) i.className = "low"; b.append(i); return b; }
function renderFight(anim) {
  const ar = el("div", null, "arena" + (anim ? " " + anim : ""));
  const L = el("div", null, "fighter me"); L.append(hpBar(F.hp), figureEl(lookOf(C), 62, { pose: anim === "hitme" ? 2 : 0 }), el("b", C.name));
  const R = el("div", null, "fighter foe"); R.append(hpBar(F.ohp), figureEl(F.opp.look, 62, { pose: anim === "hitfoe" ? 2 : 0 }), el("b", F.opp.name));
  ar.append(L, el("div", "VS", "vs"), R);
  const btns = el("div", null, "moves");
  for (const [k, [ic, n]] of Object.entries(MOVES)) { const b = el("button", null, "mv"); b.dataset.fm = k; b.append(el("span", ic), el("b", n), el("small", { strike: "beats Spell", guard: "beats Strike", spell: "beats Guard" }[k])); btns.append(b); }
  const sig = el("button", null, "mv sig"); sig.dataset.fm = "sig"; sig.disabled = !F.sig; sig.append(el("span", CALLINGS[C.calling].icon), el("b", SIGNATURE[C.calling]), el("small", F.sig ? "Big hit, once per duel" : "Used")); btns.append(sig);
  modal([el("h2", F.title), ar, el("p", F.line, "fightline"), el("p", "👁️ " + F.tell, "tell"), btns]);
}
function fightMove(me) {
  const op = F.oppMove, r = F.me / F.pow;
  const dmg = (a, b, k = 1) => Math.round(22 * Math.sqrt(a / b) * rnd(0.85, 1.15) * k);
  let line, anim = null;
  const on = MOVES[op][1].toLowerCase();
  if (me === "sig") {
    F.sig = false;
    const d = op === "guard" ? dmg(F.me, F.pow, 0.55) : dmg(F.me, F.pow, 1.5);
    F.ohp -= d; anim = "hitfoe";
    line = `${CALLINGS[C.calling].icon} ${SIGNATURE[C.calling].toUpperCase()}! ${op === "guard" ? "They block most of it" : "It hits hard"}: −${d}`;
    if (op !== "guard") { const d2 = dmg(F.pow, F.me, 0.45); F.hp -= d2; line += `. Their ${on} catches you too: −${d2}`; }
  } else if (BEATS[me] === op) {
    const d = dmg(F.me, F.pow, me === "guard" ? 0.85 : 1); F.ohp -= d; anim = "hitfoe";
    line = { strike: `⚔️ Your strike breaks their spell before it lands! −${d}`, guard: `🛡️ You parry their strike and counter! −${d}`, spell: `✨ Your spell blasts straight through their guard! −${d}` }[me];
  } else if (BEATS[op] === me) {
    const d = dmg(F.pow, F.me, op === "guard" ? 0.85 : 1); F.hp -= d; anim = "hitme";
    line = { strike: `They parry your strike and counter! −${d}`, guard: `Their spell smashes through your guard! −${d}`, spell: `They hit you before your spell is ready! −${d}` }[me];
  } else { const d1 = Math.round(7 * Math.sqrt(1 / r)), d2 = Math.round(7 * Math.sqrt(r)); F.hp -= d1; F.ohp -= d2; line = `You both ${me === "guard" ? "hold your guard and circle" : "clash"}: −${d1} / −${d2}`; anim = "clash"; }
  F.last = me; F.round++; F.line = line;
  const over = F.hp <= 0 || F.ohp <= 0 || F.round >= 9;
  if (!over) { nextOppMove(); return renderFight(anim); }
  const won = F.ohp <= 0 ? F.hp > 0 || F.ohp < F.hp : F.hp <= 0 ? false : F.hp >= F.ohp;
  const o = won ? F.win : F.lose;
  C.duels = C.duels || { w: 0, l: 0 }; C.duels[won ? "w" : "l"]++;
  const chips = apply(o.fx);
  logIt(`⚔️ Duel vs ${F.opp.name}: ${won ? "WON" : "lost"}`);
  queue.unshift({ result: { title: won ? `🏆 You beat ${F.opp.name}!` : `💥 ${F.opp.name} wins`, text: line + "\n\n" + fill(o.t), chips } });
  if (won && o.next) queue.splice(1, 0, { fight: o.next() });
  F = null; persist(); showNext();
}
const GRADES = [["Exceptional", "🌟"], ["Outstanding", "🥇"], ["Good", "👍"], ["Pass", "✔️"], ["Fail", "❌"]];
function examCard() {
  const cl = CALLINGS[C.calling].w, keys = Object.keys(cl);
  const avg = keys.reduce((a, k) => a + C.st[k], 0) / keys.length;
  let score = avg - expected(C) + C.yr.studied * 5 + rnd(-8, 8) + (C.flags.cheated ? 14 : 0);
  delete C.flags.cheated;
  const gi = score > 18 ? 0 : score > 8 ? 1 : score > -2 ? 2 : score > -12 ? 3 : 4;
  C.grades.push(gi);
  const chips = apply(["op+60 fame+10", "op+35 fame+5", "op+15", "", "op-20"][gi]);
  logIt(`📜 Year ${C.schoolYear} exams: ${GRADES[gi][1]} ${GRADES[gi][0]}`);
  return { title: `📜 Year ${C.schoolYear} Exams`, big: `${GRADES[gi][1]} ${GRADES[gi][0]}`, text: gi <= 1 ? `${C.teacher} reads your grade out loud to the whole hall.` : gi === 4 ? "Ouch. You'll have to work harder next year." : "Not bad at all.", chips };
}

// ---------- quests ----------
function makeQuests() {
  const base = clamp(1 + Math.floor((ovr(C) - 42) / 10), 1, 5);
  const list = [];
  for (const d of [-1, 0, 1]) {
    const stars = clamp(base + d, 1, 5);
    const T = pick(QUEST_TYPES);
    const mine = T.pool.filter(t => C.tal[t]);
    const t1 = mine.length && Math.random() < 0.7 ? pick(mine) : pick(T.pool);
    const t2 = pick(T.pool.filter(t => t !== t1)) || t1;
    const name = T.t.replace("{M}", pick(QUEST_MONSTERS)).replace("{P}", pick(PLACES));
    const gold = Math.round(stars ** 1.6 * 38 * (1 + C.rank * 0.15) * (C.guild ? 1 : 1.5));
    list.push({ name, ic: T.ic, stars, tal: [t1, t2], gold, fame: stars * stars * 4 + 4, need: 18 + stars * 12 });
  }
  if (C.arc === 2 && !C.totals.legends.includes("shadow")) list.push({ name: "Storm the Shadow King's fortress", ic: "🌑", stars: 6, legend: "shadow", tal: pick([["warding", "swordplay"], ["pyromancy", "leadership"], ["stealth", "illusion"]]), gold: 2000, fame: 400, need: 84 });
  for (const L of LEGENDS) if (C.fame >= L.fameReq && !C.totals.legends.includes(L.k)) { list.push({ name: L.t, ic: L.ic, stars: 6, legend: L.k, tal: pick([["pyromancy", "swordplay"], ["warding", "leadership"], ["stealth", "archery"]]), gold: L.gold, fame: L.fame, need: L.need }); break; }
  return list;
}
function questPower(q, ap = q.ap) {
  const ts = q.tal.map(t => C.tal[t]?.l || 0);
  const stats = q.tal.flatMap(t => TALENTS[t].s);
  const sAvg = stats.reduce((a, s) => a + C.st[s], 0) / stats.length;
  let p = ovr(C) * 0.55 + sAvg * 0.25 + (ts[0] + ts[1]) * 2.2 + C.gear.w * 2.6 + (C.energy < 30 ? -8 : 0) + (has("tactician") ? 5 : 0) + (q.mod || 0);
  if (ap) { const A = APPROACHES[ap]; p += (A.s.reduce((a, s) => a + C.st[s], 0) / A.s.length - expected(C)) * 0.35 + (A.fav.includes(q.ic) ? 6 : 0) + (ap === "words" && has("silver") ? 6 : 0); }
  if (q.legend) p += (has("dragonheart") ? 10 : 0) + (q.legend === "shadow" && C.flags.arcprep ? 8 : 0);
  return p;
}
function odds(q, ap) { const d = questPower(q, ap) - q.need; return d > 14 ? "Easy" : d > 4 ? "Good odds" : d > -6 ? "Risky" : "Very dangerous"; }
function runQuest(q) {
  C.energy = clamp(C.energy - 30, 0, 100);
  const margin = questPower(q) + rnd(-12, 12) - q.need;
  const rating = +clamp(6.5 + margin / 7, 3, 10).toFixed(1);
  const res = margin > 14 ? "triumph" : margin > 0 ? "success" : margin > -12 ? "partial" : "fail";
  const mult = { triumph: 1.3, success: 1, partial: 0.4, fail: 0 }[res];
  const T1 = TALENTS[q.tal[0]], T2 = TALENTS[q.tal[1]];
  const monster = q.legend ? q.name.replace(/^\w+ the /, "the ") : (q.name.match(/the (.+?) (of|nest|clans)/)?.[1] || pick(QUEST_MONSTERS));
  const lines = [
    pick([`You set out at dawn${C.friends.length > 1 ? " with " + C.friends[1] : ""}.`, "The road is long and the weather is awful.", `Your ${PETS[C.pet].name.toLowerCase()} senses danger before you do.`]),
    C.tal[q.tal[0]] ? `${T1.icon} Your ${T1.name} (${TALENT_RANKS[C.tal[q.tal[0]].l]}) ${pick(["turns the fight", "gets you past the first trap", "makes all the difference"])}.` : `${T1.icon} You don't know ${T1.name}, and it shows.`,
    C.tal[q.tal[1]] ? `${T2.icon} Then your ${T2.name} ${pick(["saves your life", "surprises everyone", "finishes the job"])}.` : `${T2.icon} Without ${T2.name} you have to improvise.`,
    ...(q.twistT ? [q.twistT] : []),
    { triumph: `🏆 A perfect quest. The ${monster} never stood a chance. Songs will be sung.`, success: "✅ Quest complete. You ride home tired but proud.", partial: "⚠️ You only half-finish the job. Half pay.", fail: "❌ It goes badly wrong. You barely escape." }[res],
  ];
  const fx = [`gold+${Math.round(q.gold * mult * (1 + (PETS[C.pet].gold || 0) + (has("hunter") ? 0.3 : 0)) * (q.half ? 0.5 : 1))}`, mult ? `fame+${Math.round(q.fame * mult)}` : "fame-6", ...q.tal.filter(t => C.tal[t] || Math.random() < 0.25).map(t => `tal:${t}+${ri(3, 8)}`), `main+${res === "fail" ? 0 : 1}`];
  if (C.guild) fx.push(`rep+${Math.round(q.stars * 3 * mult)}`);
  if (res === "fail" || (res === "partial" && Math.random() < 0.3)) fx.push(`injury:${pick(["Broken_ribs", "Deep_wound", "Cursed_arm", "Burns", "Poisoned"])}:${ri(1, 3)}`);
  const chips = apply(fx.join(" "));
  C.yr.quests++; C.yr.ratings.push(rating); C.totals.quests++;
  if (res === "triumph") { C.yr.triumphs++; C.totals.triumphs++; }
  if (res === "fail") C.totals.fails++;
  if (rating > C.best.rating) C.best = { rating, name: q.name };
  if (q.legend && (res === "triumph" || res === "success")) {
    C.totals.legends.push(q.legend);
    trophy(q.ic, { gking: "Slayer of the Goblin King", lich: "Destroyer of the Lich", dragon: "Slayer of the First Dragon", shadow: "Ended the Shadow War" }[q.legend]);
    if (q.legend === "shadow") { C.arc = 3; logIt("🌑 The Shadow King is defeated. The Shadow War is over!", true); }
    lines.push(q.legend === "dragon" ? "🐉 THE FIRST DRAGON IS DEAD. The whole Realm will remember this day forever." : q.legend === "shadow" ? "🌑 The black iron crown shatters. The Shadow War is over, and the Realm is free." : "👑 A legendary victory!");
  }
  logIt(`${q.ic} ${q.name}: ${res.toUpperCase()} (rating ${rating})`, res === "triumph" || !!q.legend);
  return { title: `${q.ic} ${q.name}`, scene: { q, res }, text: lines.join("\n"), big: `Rating ${rating}`, chips, res };
}

// ---------- career start, years ----------
function guildFit(gk) {
  const g = GUILDS[gk];
  const s = g.pref.reduce((a, k) => a + C.st[k], 0) / g.pref.length;
  const t = g.tal.reduce((a, k) => a + (C.tal[k]?.l || 0), 0);
  const gr = C.grades.length ? C.grades.reduce((a, b) => a + (4 - b), 0) / C.grades.length : 2;
  return s + t * 2.5 + gr * 4 + C.fame / 15;
}
function guildOffers(exclude) {
  return Object.keys(GUILDS).filter(k => k !== exclude).map(k => ({ k, fit: guildFit(k) + rnd(-6, 6) }))
    .filter(o => o.fit >= 34 + GUILDS[o.k].pr * 7 + (exclude ? 10 : 0)).sort((a, b) => b.fit - a.fit).slice(0, exclude ? 2 : 4).map(o => o.k);
}
const salary = c => c.guild ? Math.round(GUILDS[c.guild].pay * [1, 1.6, 2.5, 4, 6, 9][c.rank]) : 0;
function joinGuild(gk) {
  const old = C.guild;
  C.guild = gk; C.rep = 0; if (old) C.rank = Math.max(0, C.rank - 1);
  if (!old) { C.rank = 0; }
  logIt(`🏰 ${old ? "Transferred to" : "Joined"} ${GUILDS[gk].icon} ${GUILDS[gk].name} as ${RANKS[C.rank]}`, true);
}
function graduate() {
  C.phase = "career";
  const gi = C.grades.length ? C.grades.reduce((a, b) => a + b, 0) / C.grades.length : 3;
  trophy("🎓", `Graduated from Aldermoor (${GRADES[Math.round(gi)][0]})`);
  // the NPC heroes of your generation
  C.heroes = [{ name: C.rival.name, look: C.rival.look, ovr: Math.round(ovr(C) + rnd(-6, 8)), rival: true, awards: 0 }];
  for (let i = 0; i < 9; i++) C.heroes.push({ name: fullName(), look: npcLook(), ovr: ri(52, 86), awards: 0, age: ri(19, 45) });
}
function yearEnd() {
  const cards = [];
  const prevPhase = C.phase;
  if (C.phase === "academy") {
    // Order Cup
    const ranks = Object.entries(C.orderPts).sort((a, b) => b[1] - a[1]);
    const won = ranks[0][0] === C.order;
    if (won) { C.orderCups++; trophy("🏆", `Order Cup, Year ${C.schoolYear}`); }
    if (C.yr.skyW >= 2) trophy("🧹", `Skyball Cup, Year ${C.schoolYear}`);
    cards.push({ title: `🏆 The Order Cup: Year ${C.schoolYear}`, text: ranks.map(([k, v], i) => `${i + 1}. ${ORDERS[k].icon} ${ORDERS[k].name}: ${v}`).join("\n") + (won ? `\n\n${ORDERS[C.order].name} wins the Cup! The hall turns ${ORDERS[C.order].name} colours.` : ""), chips: won ? [["🏆 Order Cup!", true]] : [] });
    for (const k in ORDERS) C.orderPts[k] = 0;
    C.rival.ovr += ri(5, 8);
    if (C.schoolYear >= 7) { graduate(); cards.push({ graduation: true }); }
    else { C.schoolYear++; }
  } else {
    // salary, heirloom gold, aging
    const pay = salary(C) + (HEIRLOOMS[C.heirloom].gold || 0);
    const chips = pay ? apply(`gold+${pay}`) : [];
    if (PETS[C.pet].grow && C.age < 40) chips.push(...apply("might+1 arcana+1"));
    if (C.home) chips.push(...apply(`fame+${C.home * 8}`));
    // NPC heroes change
    for (const h of C.heroes) { h.age = (h.age || 18) + 1; h.ovr = clamp(h.ovr + (h.age < 32 ? ri(0, 4) : h.age > 45 ? -ri(1, 4) : ri(-2, 2)), 30, 97); }
    C.heroes = C.heroes.map(h => h.rival || h.age < 52 ? h : (logIt(`🌅 ${h.name} retires. A new hero rises: ` + (h = { name: fullName(), look: npcLook(), ovr: ri(62, 88), awards: 0, age: ri(20, 28) }).name), h));
    // Hero of the Realm award
    const avg = C.yr.ratings.length ? C.yr.ratings.reduce((a, b) => a + b, 0) / C.yr.ratings.length : 0;
    const myScore = avg * 6 + Math.min(C.yr.quests, 4) * 3 + C.yr.triumphs * 3 + ovr(C) * 0.45 + (C.yr.quests ? 0 : -30);
    const board = [{ me: true, name: C.name, look: lookOf(C), score: myScore }, ...C.heroes.map(h => ({ h, name: h.name, look: h.look, score: h.ovr * 0.5 + rnd(28, 78) }))].sort((a, b) => b.score - a.score);
    const winner = board[0];
    if (winner.me) { C.awards++; trophy("👑", `Hero of the Realm ${C.worldYear}`); chips.push(...apply("fame+120")); }
    else winner.h.awards++;
    cards.push({ title: `👑 Hero of the Realm ${C.worldYear}`, board: board.slice(0, 5), text: winner.me ? `YOU are the Hero of the Realm! The King places the golden laurel on your head.` : `${winner.name} wins this year.${board.findIndex(b => b.me) < 3 ? " You were close!" : ""}`, chips: [] });
    // promotion
    const need = [12, 30, 55, 85, 130][C.rank], ovrNeed = [0, 55, 65, 75, 85][C.rank];
    if (C.guild && C.rank < 5 && C.rep >= need && ovr(C) >= ovrNeed && (C.rank < 4 || C.fame >= 800)) {
      C.rank++; C.rep = 0; C.yr.promo = RANKS[C.rank];
      logIt(`⬆️ Promoted to ${RANKS[C.rank]} of ${GUILDS[C.guild].name}`, true);
      if (C.rank === 5) trophy("👑", `Grandmaster of ${GUILDS[C.guild].name}`);
      chips.push([`⬆️ PROMOTED: ${RANKS[C.rank]}!`, true]);
    }
    // aging
    const ea = effAge(C);
    if (ea > 38) { const d = ea > 55 ? 3 : ea > 46 ? 2 : 1; for (const k of ["might", "agility"]) C.st[k] = Math.max(5, C.st[k] - ri(0, d)); if (ea < 70) C.st.wits = Math.min(100, C.st.wits + ri(0, 1)); }
    cards.unshift({ title: `📅 ${C.worldYear}: your year`, text: `Age ${C.age} · ${C.guild ? `${RANKS[C.rank]}, ${GUILDS[C.guild].name}` : "Free adventurer"}\nQuests: ${C.yr.quests}${C.yr.quests ? ` · average rating ${avg.toFixed(1)}` : ""} · triumphs: ${C.yr.triumphs}\nFame: ${fameTier(C.fame)} (${C.fame}, ${C.fame - C.yr.fame0 >= 0 ? "+" : ""}${C.fame - C.yr.fame0})\nGold: ${C.gold}${pay ? ` (salary ${pay})` : ""}`, chips });
    // transfer offers
    if (C.fame > 120 && Math.random() < 0.6) { const offs = guildOffers(C.guild); if (offs.length) cards.push({ offers: offs }); }
    // the end?
    if (ea >= 70 && Math.random() < (ea - 68) * 0.03) {
      if (PETS[C.pet].phoenix && !C.flags.phoenixUsed) { C.flags.phoenixUsed = true; cards.push({ title: "🐦‍🔥 The Phoenix", text: "You fall gravely ill… but your Phoenix bursts into flame and its fire heals you. It will be reborn, but it can't save you again.", chips: [] }); }
      else cards.push({ death: true });
    }
  }
  C.age++; C.worldYear++;
  resetYear();
  queue.push(...cards);
  if (prevPhase === "academy" && C.phase === "academy") logIt(`🎒 Year ${C.schoolYear} at Aldermoor begins`);
}

// ---------- the end ----------
function legacy() { return C.home * 100 + C.perks.length * 30 + C.fame + C.trophies.length * 40 + C.awards * 300 + C.rank * 120 + C.kids.length * 25 + C.totals.legends.length * 400; }
function legendTitle() {
  if (C.totals.legends.includes("dragon")) return "Slayer of the First Dragon";
  if (C.totals.legends.includes("shadow")) return "Breaker of the Shadow King";
  if (C.awards >= 3) return `${C.awards}× Hero of the Realm`;
  if (C.rank >= 5) return `Grandmaster of ${GUILDS[C.guild].name}`;
  if (C.awards) return "Hero of the Realm";
  if (C.flags.council) return "Councillor of the Realm";
  if (C.fame >= 700) return `the Renowned ${CALLINGS[C.calling].name}`;
  if (C.guild) return `${RANKS[C.rank]} of ${GUILDS[C.guild].name}`;
  return `the ${CALLINGS[C.calling].name}`;
}
function endLife(how) {
  C.phase = "over";
  const L = { name: C.name, look: lookOf(C), title: legendTitle(), legacy: legacy(), age: C.age, trophies: C.trophies.length, line: `${RACES[C.race].name} ${CALLINGS[C.calling].name}`, how };
  const hall = load("frstLegends", []); hall.push(L); hall.sort((a, b) => b.legacy - a.legacy); save("frstLegends", hall.slice(0, 20));
  logIt(how === "died" ? `🕯️ ${C.name} passed away at ${C.age}.` : `🌅 ${C.name} retired at ${C.age}.`, true);
  persist();
  queue.push({ ending: L });
}

// =====================================================================
// UI
// =====================================================================
let tab = "season";
function openCareer() { showPage("career"); renderCareer(); if (queue.length) showNext(); }
function bar(v, max, cls) { const b = el("div", null, "mbar " + (cls || "")); const i = el("div"); i.style.width = clamp(v / max * 100, 0, 100) + "%"; b.append(i); return b; }
function renderCareer() {
  if (!C) return renderHome();
  document.body.dataset.season = C.season;
  const head = $("#chead");
  head.style.setProperty("--house", ORDERS[C.order].color);
  const fig = el("div", null, "bigfig"); fig.append(figureEl(lookOf(C), Math.round(92 * (C.age < 14 ? 0.82 : C.age < 17 ? 0.92 : 1))));
  const info = el("div", null, "hinfo");
  const where = C.phase === "academy" ? `🏰 Year ${C.schoolYear} at Aldermoor · ${ORDERS[C.order].icon} ${ORDERS[C.order].name}` : C.guild ? `${GUILDS[C.guild].icon} ${RANKS[C.rank]} · ${GUILDS[C.guild].name}` : "🧭 Free adventurer";
  info.append(el("div", C.name, "title"), el("div", `${RACES[C.race].icon} ${RACES[C.race].name} ${CALLINGS[C.calling].name} · age ${C.age}`, "muted small"), el("div", where, "small"));
  const stats = el("div", null, "hstats");
  const e1 = el("div"); e1.append(el("span", `⚡ ${C.energy}`), bar(C.energy, 100, "en"));
  const e2 = el("div"); e2.append(el("span", `⭐ ${fameTier(C.fame)}`), bar(C.fame, (FAME_TIERS.find(t => t[0] > C.fame) || [C.fame || 1])[0], "fm"));
  stats.append(e1, e2, el("div", `💰 ${C.gold}`, "gold"), el("div", C.phase === "academy" ? "🛏️ Dormitory" : `${HOMES[C.home].ic} ${HOMES[C.home].n}`, "homeline"));
  info.append(stats);
  if (C.injury) info.append(el("div", `🩹 ${C.injury.n}: ${C.injury.t} season${C.injury.t > 1 ? "s" : ""}`, "hurt"));
  const badge = el("div", null, "ovr"); badge.append(el("b", String(ovr(C))), el("small", "RATING"));
  head.replaceChildren(fig, info, badge);
  document.querySelectorAll(".tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
  const body = $("#tabbody");
  if (tab === "season") body.replaceChildren(...seasonView());
  if (tab === "skills") body.replaceChildren(...skillsView());
  if (tab === "trophies") body.replaceChildren(...trophyView());
  if (tab === "story") body.replaceChildren(...storyView());
}
function seasonView() {
  if (C.phase === "over") { const b = el("button", "🏛️ Back to the Hall of Legends"); b.onclick = () => { C = null; save("frstCareer", null); renderHome(); }; return [el("div", "This legend has ended.", "bigtxt"), b]; }
  const out = [];
  const t = el("div", null, "seasonhead");
  t.append(el("div", `${SEASONS[C.season]}, ${C.worldYear}`, "title"), el("div", C.phase === "academy" ? ["Skyball season starts" + (C.onTeam ? "" : " (not on the team yet)"), "The Duelling Tournament is this winter", "Exams at the end of spring", "Summer holidays!"][C.season] : `What will ${C.name} do this season?`, "muted small"));
  out.push(t);
  const grid = el("div", null, "acts");
  for (const a of actions()) {
    const b = el("button", null, "act" + (a.block ? " blocked" : ""));
    b.dataset.act = a.k; b.disabled = !!a.block;
    b.append(el("span", a.ic, "ic"), el("b", a.t), el("small", a.s + (a.cost ? ` · ⚡${a.cost}` : "")));
    grid.append(b);
  }
  out.push(grid);
  const row = el("div", null, "grid2");
  if (C.phase === "career") { const m = el("button", "🛒 Market", "alt"); m.dataset.ui = "market"; row.append(m); }
  if (C.phase === "career" && effAge(C) >= 45) { const r = el("button", "🌅 Retire", "alt"); r.dataset.ui = "retire"; row.append(r); }
  if (row.children.length) out.push(row);
  const latest = C.log.slice(0, 4).map(l => el("div", l.t, "logline" + (l.big ? " big" : "")));
  if (latest.length) { const c = el("div", null, "card"); c.append(el("b", "Latest"), ...latest); out.push(c); }
  return out;
}
function skillsView() {
  const out = [];
  const c1 = el("div", null, "card"); c1.append(el("b", "Stats"));
  for (const k of STAT_KEYS) { const r = el("div", null, "statrow"); r.append(el("span", STATS[k]), bar(C.st[k], 100, k === mainStat(C) ? "main" : ""), el("b", String(C.st[k]))); c1.append(r); }
  out.push(c1);
  const c2 = el("div", null, "card"); c2.append(el("b", "Talents"));
  for (const [k, t] of Object.entries(C.tal).sort((a, b) => b[1].l - a[1].l)) {
    const r = el("div", null, "talrow");
    r.append(el("span", TALENTS[k].icon, "tic"));
    const m = el("div"); m.append(el("div", `${TALENTS[k].name} · ${TALENT_RANKS[t.l]}`), bar(t.l >= 10 ? 1 : t.x, t.l >= 10 ? 1 : 10 + t.l * 7, "tx"));
    r.append(m, el("b", "Lv " + t.l)); c2.append(r);
  }
  out.push(c2);
  const cp = el("div", null, "card"); cp.append(el("b", `Perks (${C.perks.length})`), ...(C.perks.length ? C.perks.map(k => el("div", `${PERKS[k].ic} ${PERKS[k].n}: ${PERKS[k].d}`, "small")) : [el("div", `Reach rating ${C.perkAt} to unlock your next perk.`, "small muted")]));
  out.push(cp);
  const c3 = el("div", null, "card"); c3.append(el("b", "Gear"),
    el("div", `⚔️ ${TIER[C.gear.w]} ${WEAPON_NOUN[C.calling]}`, "small"), el("div", `🛡️ ${TIER[C.gear.a]} Armour`, "small"), el("div", `💎 ${C.gear.r ? TIER[C.gear.r] + " Relic" : "No relic"}`, "small"),
    el("div", `${HEIRLOOMS[C.heirloom].icon} ${HEIRLOOMS[C.heirloom].name}: ${HEIRLOOMS[C.heirloom].perk}`, "small muted"), el("div", `${PETS[C.pet].icon} ${PETS[C.pet].name}: ${PETS[C.pet].perk}`, "small muted"));
  out.push(c3);
  const c4 = el("div", null, "card small"); c4.append(el("b", "People"),
    el("div", `⚔️ Rival: ${C.rival.name}${C.flags.rivalsoft ? " (frenemy now)" : ""}`), el("div", `🤝 Friends: ${C.friends.slice(0, 6).join(", ")}`), el("div", `❤️ ${C.partner ? (C.flags.married ? "Married to " : "With ") + C.partner : "Single"}`), C.kids.length ? el("div", `👶 Children: ${C.kids.join(", ")}`) : el("span"));
  out.push(c4);
  return out;
}
function trophyView() {
  const out = [];
  const rec = el("div", null, "stats");
  for (const [n, v] of [["Trophies", C.trophies.length], ["Hero of the Realm", C.awards], ["Quests", C.totals.quests], ["Triumphs", C.totals.triumphs], ["Gold earned", C.totals.gold], ["Best rating", C.best.rating || "-"], ["Order Cups", C.orderCups], ["Legacy", legacy()]]) { const d = el("div"); d.append(el("b", String(v)), el("span", n, "muted small")); rec.append(d); }
  out.push(rec);
  const cab = el("div", null, "cabinet");
  if (!C.trophies.length) cab.append(el("p", "Your trophy cabinet is empty… for now.", "muted"));
  for (const t of [...C.trophies].reverse()) { const d = el("div", null, "tro"); d.append(el("span", t.icon, "ti"), el("b", t.name), el("small", `age ${t.age} · ${t.y}`)); cab.append(d); }
  out.push(cab);
  return out;
}
function storyView() { return [el("div", null, "card")].map(c => { c.append(...C.log.map(l => { const d = el("div", null, "logline" + (l.big ? " big" : "")); d.append(el("small", `Age ${l.a} · ${SEASONS[l.s]}  `), l.t); return d; })); return c; }); }

// ---------- modal cards ----------
function modal(nodes) { $("#sheet").replaceChildren(...nodes); $("#modal").hidden = false; $("#sheet").scrollTop = 0; }
function closeModal() { $("#modal").hidden = true; }
function cont(label = "Continue ▶") { const b = el("button", label); b.dataset.ui = "next"; return b; }
function chipsEl(chips) { const d = el("div", null, "chips"); for (const [t, good] of chips) d.append(el("span", t, "chip " + (good ? "good" : "bad"))); return d; }
function cardNodes(cd) {
  const n = [el("h2", cd.title)];
  if (cd.big) n.push(el("div", cd.big, "bigtxt"));
  if (cd.board) { const b = el("div", null, "board"); cd.board.forEach((r, i) => { const row = el("div", null, "hallrow" + (r.me ? " me" : "")); row.append(el("b", `${i + 1}`), portraitEl(r.look, 38), el("div", r.name + (r.me ? " (you)" : "")), el("div", String(Math.round(r.score)), "legacy")); b.append(row); }); n.push(b); }
  if (cd.text) n.push(el("p", cd.text, "story"));
  if (cd.chips?.length) n.push(chipsEl(cd.chips));
  return n;
}
function showNext() {
  if (!queue.length && turnOpen && C && C.phase !== "over") { turnOpen = false; advance(); }
  renderCareer();
  if (!queue.length) { closeModal(); return; }
  const cd = queue.shift();
  if (cd.intro) {
    const f = el("div", null, "center"); f.append(figureEl(lookOf(C), 90));
    return modal([el("h2", "✉️ A Letter Arrives"), f, el("p", `Dear ${C.name},\n\nWe are pleased to inform you that you have been accepted to ALDERMOOR ACADEMY of the First Realm. The Oath has placed you in the Order of ${ORDERS[C.order].icon} ${ORDERS[C.order].name}.\n\nYour first year begins this autumn. Bring your ${PETS[C.pet].name.toLowerCase()}. Do not bring dragons.\n\n${C.teacher}, Deputy Head`, "story letter"),
      el("p", `⚔️ Watch out for ${C.rival.name}, who is already telling everyone they'll be better than you.\n🤝 On the first night you meet ${C.friends[0]}.`, "muted small"), cont("🎒 Start Year 1")]);
  }
  if (cd.result) { const r = cd.result; return modal([...cardNodes(r), cont()]); }
  if (cd.skyball) return modal([...cardNodes(skyballCard()), cont()]);
  if (cd.fight) return startFight(cd.fight);
  if (cd.perk) {
    const opts = shuffle(Object.keys(PERKS).filter(k => !has(k))).slice(0, 3);
    const n = [el("h2", "🌟 Rating " + ovr(C) + "! Choose a perk"), el("p", "You've grown stronger. Pick one power to keep for life.", "muted small")];
    for (const k of opts) { const P = PERKS[k]; const b = el("button", null, "quest perkb"); b.dataset.perk = k; b.append(el("span", P.ic, "ic")); const m = el("div"); m.append(el("b", P.n), el("small", P.d)); b.append(m); n.push(b); }
    return modal(n);
  }
  if (cd.approach) {
    const q = cd.approach; curQ = { q };
    const n = [el("h2", `${q.ic} ${q.name}`), el("p", "How do you want to do this?", "muted")];
    for (const [k, A] of Object.entries(APPROACHES)) { const b = el("button", null, "quest"); b.dataset.ap = k; b.append(el("span", A.ic, "ic")); const m = el("div"); m.append(el("b", A.n + (A.fav.includes(q.ic) ? "  ⭐ good fit" : "")), el("small", `Uses ${A.s.map(x => STATS[x]).join(" + ")} · ${odds(q, k)}`)); b.append(m); n.push(b); }
    const back = el("button", "Back", "alt"); back.dataset.ui = "cancelq"; n.push(back);
    return modal(n);
  }
  if (cd.twist) {
    const T = cd.twist; curQ.tw = T;
    const n = [el("h2", "⚡ Something happens…"), el("p", fill(T.t), "story")];
    T.c.forEach((c, i) => { const b = el("button", c[0] + (typeof c[1] === "string" && c[1] !== "luck" ? `  (${Math.round(chance(c[1] + ":+0") * 100)}%)` : ""), "alt evc"); b.dataset.tw = i; n.push(b); });
    return modal(n);
  }
  if (cd.exams) return modal([...cardNodes(examCard()), cont()]);
  if (cd.event) {
    const e = cd.event; C.seen[e.id] = (C.seen[e.id] || 0) + 1;
    const n = [el("h2", "📜 " + SEASONS[C.season]), el("p", fill(e.t), "story")];
    e.c.forEach((c, i) => { if (c.if && !c.if(C)) return; const b = el("button", fill(c.t) + (c.ck ? `  (${Math.round(chance(c.ck) * 100)}%)` : ""), "alt evc"); b.dataset.ev = e.id; b.dataset.ch = i; n.push(b); });
    return modal(n);
  }
  if (cd.questpick) {
    const qs = makeQuests(); C._quests = qs;
    const n = [el("h2", "🗺️ The Quest Board"), el("p", "Pick a contract. Stars = danger and reward.", "muted small")];
    qs.forEach((q, i) => {
      const b = el("button", null, "quest" + (q.legend ? " legend" : "")); b.dataset.q = i;
      b.append(el("span", q.ic, "ic"));
      const m = el("div"); m.append(el("b", q.name), el("small", `${q.legend ? "👑 LEGENDARY" : "★".repeat(q.stars) + "☆".repeat(5 - q.stars)} · ${TALENTS[q.tal[0]].icon} ${TALENTS[q.tal[0]].name} + ${TALENTS[q.tal[1]].icon} ${TALENTS[q.tal[1]].name}`), el("small", `💰 ${q.gold} · ⭐ ${q.fame} · ${odds(q)}`));
      b.append(m); n.push(b);
    });
    const back = el("button", "Back", "alt"); back.dataset.ui = "cancelq"; n.push(back);
    return modal(n);
  }
  if (cd.quest) {
    const r = runQuest(cd.quest);
    const scene = el("div", null, "scene " + r.res);
    const hero = el("div", null, "sh"); hero.append(figureEl(lookOf(C), 60, { pose: 1 }));
    const foe = el("div", cd.quest.ic === "🤝" ? "🏰" : cd.quest.legend ? cd.quest.ic : pick(["👹", "🐺", "🧌", "🕷️", "👻", "🐲", "💀", "🦂"]), "sf");
    scene.append(hero, el("div", "⚡", "sfx"), foe);
    const rest = el("div", null, "reveal"); rest.append(...cardNodes(r).slice(1), cont());
    modal([el("h2", r.title), scene, rest]);
    let p = 1; const iv = setInterval(() => { p = 3 - p; hero.replaceChildren(figureEl(lookOf(C), 60, { pose: p })); }, 220); setTimeout(() => clearInterval(iv), 1500);
    persist(); return;
  }
  if (cd.graduation) {
    const offs = guildOffers(null);
    const f = el("div", null, "center"); f.append(figureEl(lookOf(C), 90));
    const n = [el("h2", "🎓 Graduation Day"), f, el("p", `Seven years at Aldermoor are over. ${C.name}, ${C.age} years old, rating ${ovr(C)}. Letters arrive from across the Realm…`, "story")];
    if (!offs.length) n.push(el("p", "No guild has offered you a place. You'll have to make your name on your own.", "muted"));
    for (const k of offs) { const g = GUILDS[k]; const b = el("button", null, "quest"); b.dataset.join = k; b.append(el("span", g.icon, "ic")); const m = el("div"); m.append(el("b", g.name), el("small", `${"🏅".repeat(g.pr)} prestige · salary ${g.pay}/year · likes ${g.tal.map(t => TALENTS[t].icon).join("")}`)); b.append(m); n.push(b); }
    const fr = el("button", null, "quest"); fr.dataset.join = "free"; fr.append(el("span", "🧭", "ic")); const m = el("div"); m.append(el("b", "Go freelance"), el("small", "No salary, but quests pay 50% more")); fr.append(m); n.push(fr);
    return modal(n);
  }
  if (cd.offers) {
    const n = [el("h2", "📨 Offers"), el("p", "Your fame has spread. Other guilds want you.", "muted")];
    for (const k of cd.offers) { const g = GUILDS[k]; const b = el("button", null, "quest"); b.dataset.join = k; b.append(el("span", g.icon, "ic")); const m = el("div"); m.append(el("b", "Join " + g.name), el("small", `${"🏅".repeat(g.pr)} prestige · salary ${g.pay}/year at Recruit`)); b.append(m); n.push(b); }
    const b = el("button", C.guild ? `Stay loyal to ${GUILDS[C.guild].name}` : "Stay freelance", "alt"); b.dataset.ui = "next"; n.push(b);
    return modal(n);
  }
  if (cd.market) return renderMarket();
  if (cd.talpick) {
    const n = [el("h2", "🎯 Train which talent?")];
    for (const [k, t] of Object.entries(C.tal).sort((a, b) => b[1].l - a[1].l)) { const b = el("button", `${TALENTS[k].icon} ${TALENTS[k].name} · ${TALENT_RANKS[t.l]}`, "alt"); b.dataset.tal = k; b.dataset.for = cd.talpick; b.disabled = t.l >= 10; n.push(b); }
    const back = el("button", "Back", "alt"); back.dataset.ui = "cancelq"; n.push(back);
    return modal(n);
  }
  if (cd.death) { endLife("died"); return showNext(); }
  if (cd.ending) {
    const L = cd.ending; const f = el("div", null, "center"); f.append(figureEl(L.look, 100));
    const st = el("div", null, "stats");
    for (const [a, b] of [["Lived to", L.age], ["Trophies", C.trophies.length], ["Hero of the Realm", C.awards], ["Legacy", L.legacy]]) { const d = el("div"); d.append(el("b", String(b)), el("span", a, "muted small")); st.append(d); }
    const b = el("button", "🏛️ To the Hall of Legends"); b.dataset.ui = "hall";
    return modal([el("h2", L.how === "died" ? "🕯️ The Legend Ends" : "🌅 A Well-Earned Rest"), f, el("div", `${L.name}, ${L.title}`, "bigtxt"), st, el("p", `${L.how === "died" ? `${C.name} passed away peacefully at ${C.age}` : `${C.name} hung up their ${WEAPON_NOUN[C.calling].toLowerCase()} at ${C.age}`}. ${C.kids.length ? `${C.kids.length} children carry on the name.` : ""}`, "story"), b]);
  }
  showNext();
}
function openTalentPicker(k) { queue.unshift({ talpick: k }); showNext(); }
function renderMarket() {
  const n = [el("h2", "🛒 The Market"), el("p", `You have 💰 ${C.gold}`, "muted")];
  for (const [s, nm, eff] of [["w", WEAPON_NOUN[C.calling], "Stronger on quests"], ["a", "Armour", "Fewer injuries, cape at Masterwork"], ["r", "Relic", "+8% fame per tier"]]) {
    const t = C.gear[s];
    if (t >= 5) { n.push(el("div", `${TIER[5]} ${nm}: the best there is`, "card small")); continue; }
    const price = TIER_PRICE[t + 1];
    const b = el("button", `${TIER[t + 1]} ${nm}: ${price} gold (${eff})`, "alt"); b.dataset.buy = s; b.disabled = C.gold < price; n.push(b);
  }
  if (C.home < 5) { const H = HOMES[C.home + 1]; const hb = el("button", `${H.ic} Buy a ${H.n}: ${H.price} gold (more energy & fame)`, "alt"); hb.dataset.buy = "home"; hb.disabled = C.gold < H.price; n.push(hb); }
  else n.push(el("div", "🏰 You own a castle. Nothing left to buy!", "card small"));
  const pot = el("button", "🧪 Energy potion: 60 gold (+50 energy)", "alt"); pot.dataset.buy = "pot"; pot.disabled = C.gold < 60; n.push(pot);
  const back = el("button", "Leave"); back.dataset.ui = "next"; n.push(back);
  modal(n);
}

// =====================================================================
// INPUT
// =====================================================================
document.addEventListener("click", e => {
  const t = e.target.closest("[data-set],[data-oath],[data-act],[data-ui],[data-ev],[data-q],[data-join],[data-tal],[data-buy],[data-tab],[data-ap],[data-tw],[data-fm],[data-perk]");
  if (!t || t.disabled) return;
  const d = t.dataset;
  if (d.set) {
    if (d.set === "talent") { const a = profile.talents; if (a.includes(d.val)) { if (a.length > 1) a.splice(a.indexOf(d.val), 1); } else { a.push(d.val); if (a.length > 3) a.shift(); } }
    else { profile[d.set] = d.val; if (d.set === "race" && !RACES[d.val].skins.includes(profile.skin)) profile.skin = RACES[d.val].skins[0]; if (d.set === "calling") profile.talents = [...CALLINGS[d.val].talents]; }
    renderCreator();
  }
  if (d.oath) { oath.score[d.oath] = (oath.score[d.oath] || 0) + 1; oath.i++; renderOath(); }
  if (d.tab) { tab = d.tab; renderCareer(); }
  if (d.act) { if (d.act === "quest") { queue.unshift({ questpick: true }); showNext(); } else doAction(d.act); }
  if (d.tal) { closeModal(); doAction(d.for, d.tal); }
  if (d.q != null && C._quests) { const q = C._quests[+d.q]; C._quests = null; queue.unshift({ approach: q }); showNext(); }
  if (d.ap && curQ) { curQ.q.ap = d.ap; queue.unshift({ twist: pick(TWISTS) }); showNext(); }
  if (d.tw != null && curQ?.tw) {
    const [label, mod, fx, txt] = curQ.tw.c[+d.tw], q = curQ.q;
    let m = 0, ok = true;
    if (typeof mod === "number") m = mod;
    else if (mod === "luck") { ok = Math.random() < (has("lucky") ? 0.7 : 0.5); m = ok ? 10 : -6; }
    else { ok = Math.random() < chance(mod + ":+0"); m = ok ? 8 : -5; }
    q.mod = m; q.half = fx.includes("halfgold");
    const clean = fx.replace("halfgold", "").replace("cursegold", Math.random() < 0.4 ? "injury:Gold_curse:1" : "");
    apply(clean);
    q.twistT = `⚡ ${label.replace(/^\S+ /, "")}: ${ok ? txt : "It doesn't go well."} (${m >= 0 ? "+" : ""}${m} power)`;
    curQ = null; queue.unshift({ quest: q }); afterQuest();
  }
  if (d.fm && F) fightMove(d.fm);
  if (d.perk) { C.perks.push(d.perk); logIt(`🌟 New perk: ${PERKS[d.perk].ic} ${PERKS[d.perk].n}`, true); persist(); showNext(); }
  if (d.ev) {
    const ev = EVENTS.find(x => x.id === d.ev), c = ev.c[+d.ch];
    const ok = !c.ck || Math.random() < chance(c.ck);
    const chips = apply(ok ? c.ok : c.no);
    queue.unshift({ result: { title: ok ? (c.ck ? "✅ Success" : "📜 " + SEASONS[C.season]) : "❌ It didn't work", text: fill(ok ? c.okT : c.noT), chips } });
    showNext();
  }
  if (d.join) {
    if (d.join === "free") { C.guild = null; C.rank = 0; logIt("🧭 Set out as a free adventurer", true); }
    else joinGuild(d.join);
    persist(); showNext();
  }
  if (d.buy) {
    if (d.buy === "home") { const H = HOMES[C.home + 1]; if (H && C.gold >= H.price) { C.gold -= H.price; C.home++; logIt(`${H.ic} Moved into a ${H.n}!`, true); if (C.home === 5) trophy("🏰", "Lord of a Castle"); } }
    else if (d.buy === "pot") { if (C.gold >= 60) { C.gold -= 60; C.energy = clamp(C.energy + 50, 0, 100); } }
    else { const t = C.gear[d.buy] + 1, p = TIER_PRICE[t]; if (C.gold >= p) { C.gold -= p; C.gear[d.buy] = t; logIt(`🛒 Bought ${TIER[t]} ${d.buy === "w" ? WEAPON_NOUN[C.calling] : d.buy === "a" ? "Armour" : "Relic"}`); } }
    persist(); renderCareer(); renderMarket();
  }
  if (d.ui) {
    const u = d.ui;
    if (u === "next") showNext();
    if (u === "cancelq") { C._quests = null; closeModal(); }
    if (u === "market") { queue.unshift({ market: true }); showNext(); }
    if (u === "retire") { if (confirm(`Retire ${C.name} and end this legend?`)) { endLife("retired"); showNext(); } }
    if (u === "hall") { closeModal(); C = null; save("frstCareer", null); renderHome(); }
  }
});
function afterQuest() { turnOpen = true; afterAction(); }

$("#name").addEventListener("input", () => { $("#pvname").textContent = $("#name").value.trim() || "Your legend"; });
$("#savehero").addEventListener("click", () => {
  const n = $("#name").value.trim().slice(0, 16);
  if (!n) return alert("Give your hero a name first");
  if (profile.talents.length < 3) return alert("Pick 3 talents first");
  profile.name = n; save("frstHero", profile); saved = true;
  if (C && C.phase !== "over") { C.look = { ...C.look, ...profile, race: C.race, calling: C.calling, order: C.order }; persist(); }
  renderHome();
});
$("#edithero").addEventListener("click", () => { saved = false; renderHome(); });
$("#randomize").addEventListener("click", () => { const n = profile.name; profile = randomProfile(); profile.name = n; renderCreator(); });
$("#sortme").addEventListener("click", startOath);
$("#sortback").addEventListener("click", () => renderHome());
$("#playsolo").addEventListener("click", () => { if (C && C.phase !== "over") openCareer(); else newLife(); });
$("#newlife").addEventListener("click", () => { if (confirm("Start a brand new life? Your current legend will be lost.")) { C = null; queue = []; save("frstCareer", null); newLife(); } });
$("#tohome").addEventListener("click", () => { closeModal(); renderHome(); });
renderHome();
window.__frst = { get C() { return C; }, ovr: () => ovr(C), queue: () => queue };

// ---------- title screen ----------
{
  const lu = $("#lineup");
  const picks = [["elf", "lifebinder"], ["orc", "warden"], [profile.race, profile.calling], ["vampire", "necromancer"], ["celestial", "ranger"]];
  picks.forEach(([race, calling], i) => { const p = i === 2 && saved ? profile : { ...randomProfile(), race, calling }; if (!(i === 2 && saved)) p.skin = RACES[race].skins[i % 3]; lu.append(figureEl(p, i === 2 ? 70 : 54)); });
  const go = () => { $("#splash").classList.add("gone"); setTimeout(() => $("#splash").remove(), 700); };
  $("#splash").addEventListener("click", go);
  addEventListener("keydown", function k(e) { if ($("#splash")) { go(); removeEventListener("keydown", k); } });
}
