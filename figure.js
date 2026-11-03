// Full-body standing hero figures, drawn as SVG.
// figureSVG(look, { pose, size, crop }) — pose 0 = standing, 1/2 = walking steps, crop "head" = portrait.
import { ORDERS, CALLINGS, RACES, HAIR_STYLES, MARKS } from "./data.js";

let uid = 0;
const okColor = c => /^#[0-9a-fA-F]{6}$/.test(c || "") ? c : null;
const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const f = c => Math.max(0, Math.min(255, Math.round(c + amt * 255)));
  return "#" + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, "0")).join("");
};

export function figureSVG(look, opt = {}) {
  const id = "f" + (uid++);
  const pose = opt.pose || 0;
  const race = RACES[look.race] ? look.race : "human";
  const calling = CALLINGS[look.calling] ? look.calling : "elementalist";
  const skin = okColor(look.skin) || "#e8b896";
  const hc = okColor(look.hairColor) || "#4a2c17";
  const eye = okColor(look.eyes) || "#3b2a1a";
  const ord = okColor(look.trim) || ORDERS[look.order]?.color || "#f5c542";
  const cloth = okColor(look.cloth) || CALLINGS[calling].color;
  const style = HAIR_STYLES.includes(look.hair) ? look.hair : "short";
  const mk = MARKS[look.mark] ? look.mark : "none";
  const glowEyes = race === "revenant" || race === "dragonkin" || mk === "runes";
  const O = "#14101f";               // outline colour
  const ow = 1.6;                    // outline width
  const out = [];
  // Each drawing goes into a "part" bucket so the game can animate arms and legs separately.
  const parts = { back: [], legL: [], legR: [], torso: [], armL1: [], armL2: [], armR1: [], armR2: [], head: [] };
  let cur = "torso";
  const s = { push: (...x) => parts[cur].push(...x) };
  const part = p => { cur = p; };

  // body type per race
  const body = { dwarf: [1.14, 0.82], orc: [1.12, 1.05], fae: [0.9, 0.97], elf: [0.95, 1.03], beastkin: [1, 1], revenant: [0.95, 1], dragonkin: [1.06, 1.04], merfolk: [1, 1], human: [1, 1] }[race];
  const swing = opt.part ? 0 : pose === 1 ? 14 : pose === 2 ? -14 : 0;      // leg swing in degrees (static poses only)
  const arm = -swing * 0.7;

  const vb = opt.crop === "head" ? "28 8 64 64" : "0 0 120 240";
  const W = opt.size || 120, H = opt.crop === "head" ? W : W * 2;
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${W}" height="${H}" style="display:block;overflow:visible">`);
  out.push(`<defs>
    <linearGradient id="${id}sk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(skin, 0.08)}"/><stop offset="1" stop-color="${shade(skin, -0.14)}"/></linearGradient>
    <linearGradient id="${id}cl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(cloth, 0.12)}"/><stop offset=".55" stop-color="${cloth}"/><stop offset="1" stop-color="${shade(cloth, -0.25)}"/></linearGradient>
    <linearGradient id="${id}or" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(ord, 0.15)}"/><stop offset="1" stop-color="${shade(ord, -0.2)}"/></linearGradient>
    <linearGradient id="${id}st" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e5e7eb"/><stop offset=".5" stop-color="#9ca3af"/><stop offset="1" stop-color="#4b5563"/></linearGradient>
    <linearGradient id="${id}hr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(hc, 0.12)}"/><stop offset="1" stop-color="${shade(hc, -0.18)}"/></linearGradient>
    <linearGradient id="${id}lt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b4636"/><stop offset="1" stop-color="#2b2019"/></linearGradient>
    <radialGradient id="${id}orb"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${calling === "lifebinder" ? "#a5f3fc" : "#fde047"}"/><stop offset="1" stop-color="${calling === "lifebinder" ? "#22d3ee" : "#f97316"}" stop-opacity="0"/></radialGradient>
    <filter id="${id}g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`);
  if (opt.crop !== "head" && !opt.part) out.push(`<ellipse cx="60" cy="233" rx="30" ry="6" fill="#000" opacity=".35"/>`);
  out.push(`<g transform="translate(60 232) scale(${body[0]} ${body[1]}) translate(-60 -232)" stroke="${O}" stroke-width="${ow}" stroke-linejoin="round" stroke-linecap="round">`);

  // ---- behind the body: wings, cape, tail, long hair ----
  part("back");
  if (look.demonWings) s.push(`<g fill="#450a0a"><path d="M52 80 L4 30 L14 62 L0 70 L18 92 L8 108 L50 100 Z"/><path d="M68 80 L116 30 L106 62 L120 70 L102 92 L112 108 L70 100 Z"/></g>`);
  if (race === "fae") s.push(`<g opacity=".7" stroke="#bae6fd" stroke-width="1"><path d="M54 78 C20 30 0 60 8 96 C14 116 40 104 54 92 Z" fill="#e0f2fe"/><path d="M66 78 C100 30 120 60 112 96 C106 116 80 104 66 92 Z" fill="#e0f2fe"/><path d="M54 96 C30 110 22 140 34 150 C46 154 54 120 56 102 Z" fill="#f0f9ff"/><path d="M66 96 C90 110 98 140 86 150 C74 154 66 120 64 102 Z" fill="#f0f9ff"/></g>`);
  if (calling === "warden") s.push(`<path d="M38 68 L82 68 L92 196 Q60 206 28 196 Z" fill="url(#${id}or)"/>`);
  if (race === "beastkin") s.push(`<path d="M68 130 Q100 150 96 190 Q94 200 88 196 Q92 160 64 140 Z" fill="${shade(skin, -0.1)}"/>`);
  if (race === "dragonkin") s.push(`<path d="M66 132 Q104 160 104 210 Q100 216 96 206 Q92 170 62 146 Z" fill="${shade(skin, -0.15)}"/>`);
  if (style === "long" || style === "braids") s.push(`<path d="M42 34 Q36 70 40 98 L80 98 Q84 70 78 34 Z" fill="url(#${id}hr)"/>`);

  // ---- legs ----
  const leg = (hx, ang, front) => {
    const pants = calling === "warden" ? "url(#" + id + "st)" : calling === "shadowblade" ? "#1f1b2e" : calling === "lifebinder" ? "#e7e5e4" : "#3b2a4d";
    return `<g transform="rotate(${ang} ${hx} 130)">
      <path d="M${hx - 8} 128 L${hx + 8} 128 L${hx + 7} 176 L${hx + 6} 214 L${hx - 6} 214 L${hx - 7} 176 Z" fill="${pants}"/>
      ${calling === "warden" ? `<circle cx="${hx}" cy="176" r="6" fill="url(#${id}st)"/>` : ""}
      <path d="M${hx - 7} 206 L${hx + 7} 206 L${hx + 8} 222 Q${hx + 16} 224 ${hx + 15} 230 L${hx - 8} 230 Z" fill="${calling === "warden" ? "url(#" + id + "st)" : "url(#" + id + "lt)"}"/>
    </g>`;
  };
  part("legL"); s.push(leg(52, swing, false));
  part("legR"); s.push(leg(68, -swing, true));

  // ---- torso & outfit ----
  part("torso");
  if (calling === "elementalist") {
    s.push(`<path d="M40 68 Q60 62 80 68 L84 120 L96 204 Q60 214 24 204 L36 120 Z" fill="url(#${id}cl)"/>`);   // long robe
    s.push(`<path d="M56 70 L60 204 M64 70 L60 204" stroke="${shade(cloth, -0.3)}" stroke-width="1" fill="none"/>`);
    s.push(`<path d="M24 204 Q60 214 96 204 L94 196 Q60 206 26 196 Z" fill="${ord}"/>`);   // hem trim
    s.push(`<path d="M38 118 L82 118 L82 126 L38 126 Z" fill="#7c2d12"/><rect x="56" y="116" width="8" height="12" rx="2" fill="#fbbf24"/>`);   // belt
    s.push(`<path d="M48 66 L60 92 L72 66 Q60 72 48 66 Z" fill="${shade(cloth, 0.2)}"/>`);
  }
  if (calling === "lifebinder") {
    s.push(`<path d="M40 68 Q60 62 80 68 L84 120 L94 206 Q60 214 26 206 L36 120 Z" fill="#f5f5f4"/>`);
    s.push(`<path d="M26 206 Q60 214 94 206 L92 198 Q60 206 28 198 Z" fill="#facc15"/>`);
    s.push(`<path d="M42 70 L78 120 L72 126 L38 78 Z" fill="${ord}"/>`);   // order sash
    s.push(`<path d="M50 66 L60 86 L70 66" fill="none" stroke="#facc15" stroke-width="2.5"/>`);
    s.push(`<circle cx="60" cy="98" r="5" fill="#fde047" filter="url(#${id}g)"/>`);
  }
  if (calling === "shadowblade") {
    s.push(`<path d="M40 68 Q60 62 80 68 L82 132 Q60 138 38 132 Z" fill="url(#${id}cl)"/>`);
    s.push(`<path d="M38 124 L82 124 L82 132 L38 132 Z" fill="#111"/><rect x="45" y="122" width="7" height="12" fill="#6b7280"/>`);
    s.push(`<path d="M44 70 L76 70 L74 84 Q60 90 46 84 Z" fill="${shade(cloth, -0.35)}"/>`);   // cowl scarf
    s.push(`<path d="M52 92 L68 92 M50 102 L70 102 M52 112 L68 112" stroke="${shade(cloth, -0.4)}" stroke-width="1.2"/>`);
    s.push(`<path d="M38 132 L46 158 L54 134 Z M82 132 L74 158 L66 134 Z" fill="${shade(cloth, -0.2)}"/>`);   // coat tails
  }
  if (calling === "warden") {
    s.push(`<path d="M38 70 Q60 62 82 70 L84 128 Q60 134 36 128 Z" fill="url(#${id}st)"/>`);   // breastplate
    s.push(`<path d="M50 72 L70 72 L70 140 L60 150 L50 140 Z" fill="url(#${id}or)"/>`);   // tabard
    s.push(`<path d="M60 92 l4 8 l-4 8 l-4 -8 Z" fill="#fff" stroke-width="1"/>`);
    s.push(`<path d="M36 124 L84 124 L84 132 L36 132 Z" fill="#3f2a1d"/><rect x="56" y="122" width="8" height="12" rx="1" fill="#d4d4d8"/>`);
  }
  // order brooch
  s.push(`<circle cx="${calling === "warden" ? 44 : 46}" cy="76" r="3.5" fill="${ord}" stroke="#fff" stroke-width="1"/>`);

  // ---- arms (with sleeves) ----
  const sleeve = calling === "warden" ? `url(#${id}st)` : calling === "lifebinder" ? "#f5f5f4" : `url(#${id}cl)`;
  const wide = calling === "elementalist" || calling === "lifebinder";
  const armUp = (sx, ang, side) => {
    const dir = side < 0 ? -1 : 1;
    return `<g transform="rotate(${ang} ${sx} 72)"><path d="M${sx - 7} 68 L${sx + 7} 68 L${sx + 6 + dir * 2} 101 L${sx - 6 + dir * 2} 101 Z" fill="${sleeve}"/>
      ${calling === "warden" ? `<circle cx="${sx}" cy="70" r="11" fill="url(#${id}st)"/>` : ""}</g>`;
  };
  const armLow = (sx, ang, side) => {
    const dir = side < 0 ? -1 : 1;
    return `<g transform="rotate(${ang} ${sx} 72)"><circle cx="${sx + dir * 2}" cy="99" r="6" fill="${sleeve}"/>
      <path d="M${sx - 6 + dir * 2} 98 L${sx + 6 + dir * 2} 98 L${sx + (wide ? 9 : 5) + dir * 3} 124 L${sx - (wide ? 9 : 5) + dir * 3} 124 Z" fill="${sleeve}"/>
      <circle cx="${sx + dir * 3}" cy="128" r="5.5" fill="url(#${id}sk)"/></g>`;
  };
  // left arm (+ shield for the Warden)
  part("armL1"); s.push(armUp(36, arm, -1));
  part("armL2"); s.push(armLow(36, arm, -1));
  if (calling === "warden") s.push(`<g transform="rotate(${arm} 36 72)"><path d="M14 98 L44 98 L44 124 Q44 146 29 156 Q14 146 14 124 Z" fill="url(#${id}or)"/><path d="M18 102 L40 102 L40 124 Q40 140 29 149 Q18 140 18 124 Z" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/><path d="M29 112 l5 9 l-5 9 l-5 -9 Z" fill="#fff" stroke-width="1"/></g>`);
  if (calling === "shadowblade") s.push(`<g transform="rotate(${arm} 36 72)"><path d="M33 128 L27 156 L31 157 L37 130 Z" fill="#e5e7eb" filter="url(#${id}g)"/><path d="M28 126 L40 132" stroke-width="3" stroke="#4c1d95"/></g>`);

  // ---- head ----
  part("head");
  s.push(`<path d="M54 54 L66 54 L66 66 L54 66 Z" fill="${shade(skin, -0.12)}"/>`);   // neck
  // ears
  if (race === "elf" || race === "fae") s.push(`<path d="M45 40 L28 26 L45 48 Z" fill="url(#${id}sk)"/><path d="M75 40 L92 26 L75 48 Z" fill="url(#${id}sk)"/>`);
  else if (race === "orc") s.push(`<path d="M45 38 L34 32 L45 48 Z" fill="url(#${id}sk)"/><path d="M75 38 L86 32 L75 48 Z" fill="url(#${id}sk)"/>`);
  else if (race === "merfolk") s.push(`<path d="M45 36 L32 30 L36 40 L30 44 L45 48 Z" fill="${shade(skin, -0.15)}"/><path d="M75 36 L88 30 L84 40 L90 44 L75 48 Z" fill="${shade(skin, -0.15)}"/>`);
  else if (race !== "beastkin") s.push(`<ellipse cx="45" cy="42" rx="3.5" ry="5" fill="url(#${id}sk)"/><ellipse cx="75" cy="42" rx="3.5" ry="5" fill="url(#${id}sk)"/>`);
  // head shape with jaw
  const jaw = race === "orc" || race === "dwarf" ? "M45 30 Q45 18 60 18 Q75 18 75 30 L76 44 Q74 58 60 60 Q46 58 44 44 Z" : "M46 30 Q46 18 60 18 Q74 18 74 30 L74 44 Q72 56 60 58 Q48 56 46 44 Z";
  s.push(`<path d="${jaw}" fill="url(#${id}sk)"/>`);
  if (race === "dragonkin") s.push(`<path d="M49 46 q2 -2 4 0 M51 50 q2 -2 4 0 M66 46 q2 -2 4 0 M64 50 q2 -2 4 0" stroke="${shade(skin, -0.3)}" stroke-width="1" fill="none"/>`);
  if (race === "revenant") s.push(`<path d="M50 26 l3 5 l-2 4 M70 48 l-3 3 l1 4" stroke="${shade(skin, -0.4)}" stroke-width=".9" fill="none"/>`);
  if (race === "merfolk") s.push(`<path d="M55 60 q2 1 0 2 M65 60 q-2 1 0 2" stroke="${shade(skin, -0.3)}" stroke-width=".8" fill="none"/>`);
  // markings
  if (mk === "freckles") s.push(`<g stroke="none" fill="${shade(skin, -0.32)}"><circle cx="52" cy="46" r=".8"/><circle cx="54" cy="48" r=".8"/><circle cx="50" cy="48" r=".8"/><circle cx="68" cy="46" r=".8"/><circle cx="66" cy="48" r=".8"/><circle cx="70" cy="48" r=".8"/></g>`);
  if (mk === "warpaint") s.push(`<path d="M49 44 L55 44 M49 47 L54 47 M65 44 L71 44 M66 47 L71 47" stroke="${ord}" stroke-width="1.8"/>`);
  if (mk === "runes") s.push(`<g filter="url(#${id}g)" stroke="${ord}" stroke-width="1" fill="none"><path d="M50 45 l1.5 3 l1.5 -3 M68 44 v4 M66.5 46 h3"/></g>`);
  if (mk === "stars") s.push(`<g stroke="none" fill="#fde68a"><path d="M68 46 l1 2 l2 .3 l-1.5 1.4 l.4 2 l-1.9 -1 l-1.9 1 l.4 -2 l-1.5 -1.4 l2 -.3z"/><circle cx="72" cy="44" r=".7"/></g>`);
  // eyes
  for (const x of [54, 66]) {
    if (race === "revenant") s.push(`<path d="M${x - 3.5} 38 Q${x} 35.5 ${x + 3.5} 38 Q${x} 40.5 ${x - 3.5} 38 Z" fill="#0b0b10" stroke="none"/><circle cx="${x}" cy="38" r="1.6" fill="${eye}" stroke="none" filter="url(#${id}g)"/>`);
    else s.push(`<path d="M${x - 3.6} 38 Q${x} 35 ${x + 3.6} 38 Q${x} 40.6 ${x - 3.6} 38 Z" fill="#fff" stroke="${O}" stroke-width=".7"/><circle cx="${x}" cy="38" r="1.8" fill="${eye}" stroke="none"${glowEyes ? ` filter="url(#${id}g)"` : ""}/><circle cx="${x}" cy="38" r=".8" fill="#000" stroke="none"/><circle cx="${x + .6}" cy="37.3" r=".45" fill="#fff" stroke="none"/>`);
  }
  if (mk === "scar") s.push(`<path d="M64 31 L70 46" stroke="#b4535a" stroke-width="1.5"/>`);
  const browC = style === "bald" || style === "hood" ? shade(skin, -0.3) : shade(hc, -0.15);
  s.push(`<path d="M50.5 ${race === "orc" ? 33 : 34} Q54 32 57.5 33.5 M62.5 33.5 Q66 32 69.5 ${race === "orc" ? 33 : 34}" stroke="${browC}" stroke-width="1.6" fill="none"/>`);
  s.push(`<path d="M60 40 Q58.5 45 60.5 46" stroke="${shade(skin, -0.28)}" stroke-width=".9" fill="none"/>`);   // nose
  s.push(`<path d="M56 51 Q60 53 64 51" stroke="${shade(skin, -0.42)}" stroke-width="1.2" fill="none"/>`);   // mouth
  if (race === "orc") s.push(`<path d="M55 52 L56 47 L57.5 52 Z M62.5 52 L64 47 L65 52 Z" fill="#fffbeb" stroke-width=".7"/>`);
  if (race === "beastkin") s.push(`<path d="M52 47 L42 45 M52 49 L42 50 M68 47 L78 45 M68 49 L78 50" stroke="${shade(skin, -0.35)}" stroke-width=".6"/><path d="M58.5 45 L61.5 45 L60 47 Z" fill="#3f2a20" stroke="none"/>`);
  if (race === "dwarf") s.push(`<path d="M45 42 Q46 66 60 74 Q74 66 75 42 Q72 54 66 53 Q60 56 54 53 Q48 54 45 42 Z" fill="url(#${id}hr)"/><path d="M56 51 Q60 53 64 51" stroke="${shade(skin, -0.42)}" stroke-width="1.2" fill="none"/>`);
  if (calling === "shadowblade" && style !== "hood") s.push(`<path d="M47 50 Q60 58 73 50 L72 58 Q60 64 48 58 Z" fill="${shade(cloth, -0.35)}"/>`);   // face mask

  // hair (front)
  const cap = "M45 34 Q43 14 60 13 Q77 14 75 34 Q72 24 60 23 Q48 24 45 34 Z";
  if (["short", "long", "bun", "braids"].includes(style)) s.push(`<path d="${cap}" fill="url(#${id}hr)"/>`);
  if (style === "long") s.push(`<path d="M45 34 Q42 56 46 66 L49 66 Q46 50 48 30 Z M75 34 Q78 56 74 66 L71 66 Q74 50 72 30 Z" fill="url(#${id}hr)"/>`);
  if (style === "bun") s.push(`<circle cx="60" cy="10" r="7" fill="url(#${id}hr)"/>`);
  if (style === "braids") s.push(`<path d="M46 32 Q42 54 46 80" stroke="${hc}" stroke-width="5" fill="none" stroke-dasharray="4 1.5"/><path d="M74 32 Q78 54 74 80" stroke="${hc}" stroke-width="5" fill="none" stroke-dasharray="4 1.5"/>`);
  if (style === "spiky") s.push(`<path d="M44 34 L45 18 L50 24 L52 10 L57 20 L60 6 L63 20 L68 10 L70 24 L75 18 L76 34 Q72 24 60 24 Q48 24 44 34 Z" fill="url(#${id}hr)"/>`);
  if (style === "mohawk") s.push(`<path d="M56 24 L55 4 L60 9 L65 4 L64 24 Q60 22 56 24 Z" fill="url(#${id}hr)"/>`);
  if (style === "hood") s.push(`<path d="M41 44 Q40 10 60 9 Q80 10 79 44 Q80 60 72 66 L76 40 Q72 20 60 20 Q48 20 44 40 L48 66 Q40 60 41 44 Z" fill="${calling === "lifebinder" ? "#e7e5e4" : shade(cloth, -0.15)}"/><path d="M44 40 Q48 20 60 20 Q72 20 76 40" stroke="${ord}" stroke-width="1.3" fill="none"/>`);
  // horns, beast ears, fae glow
  if (race === "dragonkin") s.push(`<path d="M48 20 Q38 8 38 -2 Q46 6 53 16 Z" fill="#e7e5e4"/><path d="M72 20 Q82 8 82 -2 Q74 6 67 16 Z" fill="#e7e5e4"/>`);
  if (race === "beastkin") s.push(`<path d="M46 24 L43 4 L56 16 Z" fill="${skin}"/><path d="M47.5 20 L46 9 L53 16 Z" fill="#f9a8d4" stroke="none"/><path d="M74 24 L77 4 L64 16 Z" fill="${skin}"/><path d="M72.5 20 L74 9 L67 16 Z" fill="#f9a8d4" stroke="none"/>`);
  if (race === "fae") s.push(`<circle cx="60" cy="6" r="2.2" fill="#fde68a" stroke="none" filter="url(#${id}g)"/>`);
  if (look.crown) s.push(`<path d="M46 18 L48 4 L54 12 L60 2 L66 12 L72 4 L74 18 Z" fill="#facc15"/><circle cx="60" cy="10" r="2" fill="#ef4444" stroke="none"/>`);

  // ---- right arm & main weapon ----
  part("armR1"); s.push(armUp(84, -arm, 1));
  part("armR2"); s.push(armLow(84, -arm, 1));
  const R = `transform="rotate(${-arm} 84 72)"`;
  if (calling === "elementalist") s.push(`<g ${R}><path d="M95 30 L91 226" stroke="#5b3a1e" stroke-width="4"/><path d="M89 34 Q95 18 101 34 Q95 30 89 34 Z" fill="#78350f"/><circle cx="95" cy="22" r="11" fill="url(#${id}orb)" stroke="none" filter="url(#${id}g)"/><circle cx="95" cy="24" r="4" fill="#fff7ed" stroke="none"/></g>`);
  if (calling === "lifebinder") s.push(`<g ${R}><path d="M95 32 L92 226" stroke="#f5f5f4" stroke-width="4"/><path d="M95 32 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0" fill="none" stroke="#facc15" stroke-width="2"/><path d="M95 14 L100 24 L95 34 L90 24 Z" fill="#a5f3fc" filter="url(#${id}g)"/><circle cx="95" cy="24" r="12" fill="url(#${id}orb)" stroke="none" opacity=".6"/></g>`);
  if (calling === "warden") s.push(`<g ${R}><path d="M87 128 L94 84" stroke="#5b3a1e" stroke-width="4"/><path d="M86 78 L102 84 L98 96 L82 90 Z" fill="url(#${id}st)"/></g>`);
  if (calling === "shadowblade") s.push(`<g ${R}><path d="M87 128 L93 156 L89 157 L83 130 Z" fill="#e5e7eb" filter="url(#${id}g)"/><path d="M80 132 L92 126" stroke-width="3" stroke="#4c1d95"/></g>`);

  // compose: the whole figure, or just one part for the animation rig
  const order = ["back", "legL", "legR", "torso", "armL1", "armL2", "head", "armR1", "armR2"];
  const want = opt.part ? [opt.part] : order;
  for (const k of want) out.push(...parts[k]);
  out.push(`</g></svg>`);
  return out.join("");
}

// Joint positions (in figure units) for the animation rig, after the race's body scaling.
export function rigJoints(look) {
  const race = RACES[look.race] ? look.race : "human";
  const b = { dwarf: [1.14, 0.82], orc: [1.12, 1.05], fae: [0.9, 0.97], elf: [0.95, 1.03], beastkin: [1, 1], revenant: [0.95, 1], dragonkin: [1.06, 1.04], merfolk: [1, 1], human: [1, 1] }[race];
  const T = (x, y) => [60 + (x - 60) * b[0], 232 + (y - 232) * b[1]];
  return { hipL: T(52, 130), hipR: T(68, 130), shL: T(36, 72), shR: T(84, 72), elL: T(34, 99), elR: T(86, 99), handL: T(33, 128), handR: T(87, 128),
    neck: T(60, 62), tipR: T(95, 22), scale: b };
}

export function figureEl(look, size = 120, opt = {}) {
  const span = document.createElement("span");
  span.className = "avatar";
  span.innerHTML = figureSVG(look, { ...opt, size });   // safe: built only from checked colours and fixed option lists
  return span;
}
export const portraitEl = (look, size = 48) => {
  const span = figureEl(look, size, { crop: "head" });
  span.style.cssText = `display:inline-block;width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 50% 35%, ${ORDERS[look.order]?.color || "#555"}, #0b0814);border:2px solid ${ORDERS[look.order]?.color || "#555"}`;
  return span;
};
