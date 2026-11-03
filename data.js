// FRSTBORN game data: everything you might want to tweak lives here.

// ---------- RACES (each has a perk and its own look) ----------
export const RACES = {
  human:     { name: "Human",     icon: "🧑", perk: "+15% XP. Learns fast", skins: ["#f6d7c3", "#e8b896", "#c98e66", "#a0673f", "#6e4527", "#3f2716"] },
  elf:       { name: "Elf",       icon: "🧝", perk: "+2 speed, +5% crit", skins: ["#f8e3d1", "#e9c4a4", "#c79a73", "#8d5f3d", "#d9e8f0", "#c8d6a8"] },
  dwarf:     { name: "Dwarf",     icon: "⛏️", perk: "+3 defence, +10% HP", skins: ["#f2cdb4", "#dba582", "#b67b55", "#7d5032", "#5a3a24", "#e7b9a1"] },
  orc:       { name: "Orc",       icon: "👹", perk: "+12% damage", skins: ["#7fa35b", "#5e8a46", "#4a6e3a", "#8a9a5b", "#6b7f8c", "#9b7b5a"] },
  fae:       { name: "Fae",       icon: "🧚", perk: "+20% healing done, 8% dodge", skins: ["#e9d5ff", "#c7f0ff", "#ffd6e7", "#d9f99d", "#fde68a", "#c4b5fd"] },
  dragonkin: { name: "Dragonkin", icon: "🐲", perk: "+15 HP, burns enemies it hits", skins: ["#c2410c", "#0f766e", "#b45309", "#7c2d12", "#1e3a8a", "#4d7c0f"] },
  revenant:  { name: "Revenant",  icon: "💀", perk: "Once per battle, survives a killing blow", skins: ["#cbd5e1", "#a3b1c2", "#94a3b8", "#d6d3d1", "#b8c4b0", "#c7c2d8"] },
  beastkin:  { name: "Beastkin",  icon: "🐺", perk: "+3 speed, acts first", skins: ["#b7834f", "#8b5a2b", "#d4a373", "#6b6b6b", "#e0e0e0", "#c26b2b"] },
  merfolk:   { name: "Merfolk",   icon: "🧜", perk: "Heals 5% HP every turn", skins: ["#7dd3c8", "#93c5fd", "#a7f3d0", "#c4b5fd", "#5eead4", "#bae6fd"] },
  gnome:     { name: "Gnome",     icon: "🍄", perk: "+Wits, tinkers and invents", skins: ["#f6d7c3", "#e8b896", "#c98e66", "#a0673f", "#f2c9b0", "#d9b38c"] },
  vampire:   { name: "Vampire",   icon: "🧛", perk: "+Charm, lives for centuries", skins: ["#f1f1f4", "#e2dde6", "#d7cfd9", "#c9c3cf", "#b9b0bd", "#a89fae"] },
  celestial: { name: "Celestial", icon: "😇", perk: "+Spirit, blessed by the stars", skins: ["#fff4d6", "#f6e0b5", "#e9c99a", "#cbd5f5", "#e0e7ff", "#c49a6c"] },
  halfgiant: { name: "Half-Giant",icon: "🗿", perk: "+Might, huge and hard to stop", skins: ["#d8b49a", "#b98d6a", "#8d6748", "#9aa3a8", "#7b8a8f", "#a57e5c"] },
};
// race stat bonuses for the career sim: might, arcana, agility, spirit, charm, wits
export const RACE_STATS = {
  human: { charm: 3, wits: 3 }, elf: { agility: 5, arcana: 3 }, dwarf: { might: 5, wits: 2 }, orc: { might: 7 }, fae: { spirit: 4, charm: 3 },
  dragonkin: { might: 3, arcana: 4 }, revenant: { arcana: 4, spirit: -2, wits: 4 }, beastkin: { agility: 6 }, merfolk: { spirit: 4, agility: 2 },
  gnome: { wits: 7, might: -2 }, vampire: { charm: 6, arcana: 2 }, celestial: { spirit: 6, charm: 1 }, halfgiant: { might: 9, agility: -2 },
};
export const HAIR_STYLES = ["short", "long", "spiky", "bun", "braids", "mohawk", "hood", "bald"];
export const HAIR_COLORS = ["#1c1917", "#4a2c17", "#8b5a2b", "#d6a756", "#f1e5c8", "#b91c1c", "#e5e7eb", "#7c3aed", "#0ea5e9", "#16a34a", "#f472b6"];
export const EYE_COLORS = ["#3b2a1a", "#2563eb", "#16a34a", "#9ca3af", "#f59e0b", "#a855f7", "#ef4444", "#22d3ee"];
export const MARKS = { none: "None", scar: "Battle scar", runes: "Glowing runes", freckles: "Freckles", warpaint: "War paint", stars: "Starmarks" };

// ---------- ORDERS (the 4 houses of the First Realm) ----------
export const ORDERS = {
  emberclaw: { name: "Emberclaw", icon: "🔥", color: "#ef4444", trait: "Brave",   perk: "+10% damage" },
  tidewyrm:  { name: "Tidewyrm",  icon: "🌊", color: "#3b82f6", trait: "Wise",    perk: "+25% XP" },
  thornveil: { name: "Thornveil", icon: "🌿", color: "#22c55e", trait: "Loyal",   perk: "+12% max HP, +15% healing received" },
  duskraven: { name: "Duskraven", icon: "🌙", color: "#a855f7", trait: "Cunning", perk: "+10% crit chance, +20% gold" },
};

// The Oath: each answer leans towards one Order.
export const OATH = [
  { q: "A sealed door blocks the way. What do you do?", a: [
    ["Break it down", "emberclaw"], ["Read the runes around it", "tidewyrm"], ["Wait for your friends so you can open it together", "thornveil"], ["Find a secret way round", "duskraven"]] },
  { q: "How do you want the songs to remember you?", a: [
    ["The Bold", "emberclaw"], ["The Wise", "tidewyrm"], ["The Kind", "thornveil"], ["The Legend nobody saw coming", "duskraven"]] },
  { q: "Where would you spend a free afternoon in the city?", a: [
    ["The fighting pits", "emberclaw"], ["The great library", "tidewyrm"], ["The market with friends", "thornveil"], ["The rooftops at night", "duskraven"]] },
  { q: "A troll blocks the bridge. Your plan?", a: [
    ["Fight it", "emberclaw"], ["Riddle it into confusion", "tidewyrm"], ["Share your food and make a friend", "thornveil"], ["Trick it into the river", "duskraven"]] },
  { q: "Choose a treasure:", a: [
    ["A sword that never dulls", "emberclaw"], ["A map of every road", "tidewyrm"], ["A cup that always has food for everyone", "thornveil"], ["A cloak of shadows", "duskraven"]] },
];

// ---------- CALLINGS (what you are trained as) ----------
// kit = which outfit the figure wears; w = how much each stat counts towards your Rating
export const CALLINGS = {
  elementalist: { name: "Elementalist", icon: "🔥", color: "#f97316", kit: "elementalist", role: "Fire, frost and storm", w: { arcana: 5, wits: 2, spirit: 1 }, talents: ["pyromancy", "cryomancy", "stormcalling"] },
  warden:       { name: "Warden",       icon: "🛡️", color: "#64748b", kit: "warden", role: "Shield-bearer, protector of the Realm", w: { might: 5, spirit: 2, agility: 1 }, talents: ["warding", "swordplay", "leadership"] },
  lifebinder:   { name: "Lifebinder",   icon: "✨", color: "#facc15", kit: "lifebinder", role: "Healer who can call back the fallen", w: { spirit: 5, arcana: 2, charm: 1 }, talents: ["healing", "herbalism", "warding"] },
  shadowblade:  { name: "Shadowblade",  icon: "🗡️", color: "#6d28d9", kit: "shadowblade", role: "Spy, thief, silent killer", w: { agility: 5, wits: 2, charm: 1 }, talents: ["stealth", "lockpicking", "swordplay"] },
  ranger:       { name: "Ranger",       icon: "🏹", color: "#3f6212", kit: "shadowblade", role: "Hunter of the wild roads", w: { agility: 5, wits: 1, spirit: 2 }, talents: ["archery", "beasttaming", "herbalism"] },
  necromancer:  { name: "Necromancer",  icon: "💀", color: "#14532d", kit: "elementalist", role: "Talks to the dead, and they answer", w: { arcana: 5, wits: 2, spirit: 1 }, talents: ["necromancy", "runecraft", "divination"] },
  bard:         { name: "Bard",         icon: "🎵", color: "#be185d", kit: "shadowblade", role: "Songs that charm kings and break curses", w: { charm: 5, wits: 2, arcana: 1 }, talents: ["bardsong", "diplomacy", "illusion"] },
  alchemist:    { name: "Alchemist",    icon: "⚗️", color: "#0e7490", kit: "elementalist", role: "Potions, bombs and gold from lead", w: { wits: 5, arcana: 2, spirit: 1 }, talents: ["alchemy", "herbalism", "enchanting"] },
  beastmaster:  { name: "Beastmaster",  icon: "🐺", color: "#92400e", kit: "shadowblade", role: "Commands beasts, even dragons", w: { spirit: 3, might: 3, agility: 2 }, talents: ["beasttaming", "dragonriding", "shapeshifting"] },
  runeknight:   { name: "Runeknight",   icon: "⚔️", color: "#1e40af", kit: "warden", role: "Blade and spell together", w: { might: 3, arcana: 3, agility: 2 }, talents: ["swordplay", "runecraft", "enchanting"] },
  illusionist:  { name: "Illusionist",  icon: "🌀", color: "#7e22ce", kit: "elementalist", role: "Nothing you see is real", w: { wits: 3, arcana: 3, charm: 2 }, talents: ["illusion", "divination", "timemagic"] },
  monk:         { name: "Storm Monk",   icon: "👊", color: "#b45309", kit: "shadowblade", role: "Fists faster than lightning", w: { might: 3, agility: 3, spirit: 2 }, talents: ["brawling", "stormcalling", "shapeshifting"] },
};

// ---------- TALENTS (skills that grow from Novice to Legendary) ----------
export const TALENTS = {
  pyromancy:    { name: "Pyromancy",     icon: "🔥", s: ["arcana"],           desc: "Fire magic" },
  cryomancy:    { name: "Cryomancy",     icon: "❄️", s: ["arcana"],           desc: "Ice and frost" },
  stormcalling: { name: "Stormcalling",  icon: "⚡", s: ["arcana", "agility"], desc: "Lightning and wind" },
  necromancy:   { name: "Necromancy",    icon: "💀", s: ["arcana", "wits"],    desc: "Raise and command the dead" },
  illusion:     { name: "Illusion",      icon: "🌀", s: ["wits", "charm"],     desc: "Tricks of the mind" },
  divination:   { name: "Divination",    icon: "🔮", s: ["wits", "spirit"],    desc: "See the future" },
  timemagic:    { name: "Time Magic",    icon: "⏳", s: ["arcana", "wits"],    desc: "Bend the seconds. Very rare" },
  enchanting:   { name: "Enchanting",    icon: "💎", s: ["arcana", "wits"],    desc: "Put magic into objects" },
  runecraft:    { name: "Runecraft",     icon: "🪨", s: ["arcana", "might"],   desc: "Ancient carved power" },
  healing:      { name: "Healing",       icon: "💚", s: ["spirit"],           desc: "Close wounds, cure curses" },
  warding:      { name: "Warding",       icon: "🛡️", s: ["spirit", "might"],   desc: "Shields and barriers" },
  herbalism:    { name: "Herbalism",     icon: "🌿", s: ["wits", "spirit"],    desc: "Plants, poisons, cures" },
  alchemy:      { name: "Alchemy",       icon: "⚗️", s: ["wits"],             desc: "Potions and explosives" },
  swordplay:    { name: "Swordplay",     icon: "⚔️", s: ["might", "agility"],  desc: "Blades of every kind" },
  archery:      { name: "Archery",       icon: "🏹", s: ["agility"],          desc: "Never miss" },
  brawling:     { name: "Brawling",      icon: "👊", s: ["might"],            desc: "Fists and grapples" },
  stealth:      { name: "Stealth",       icon: "🌑", s: ["agility", "wits"],   desc: "Unseen, unheard" },
  lockpicking:  { name: "Lockpicking",   icon: "🗝️", s: ["agility", "wits"],   desc: "No door stays shut" },
  beasttaming:  { name: "Beast Taming",  icon: "🐾", s: ["spirit", "charm"],   desc: "Wild things obey you" },
  dragonriding: { name: "Dragon Riding", icon: "🐉", s: ["agility", "might"],  desc: "Fly into battle" },
  shapeshifting:{ name: "Shapeshifting", icon: "🐻", s: ["might", "spirit"],   desc: "Become the beast" },
  bardsong:     { name: "Bardsong",      icon: "🎵", s: ["charm", "spirit"],   desc: "Music with magic in it" },
  diplomacy:    { name: "Diplomacy",     icon: "🤝", s: ["charm", "wits"],     desc: "Win without a fight" },
  leadership:   { name: "Leadership",    icon: "👑", s: ["charm", "might"],    desc: "Others follow you" },
};
export const TALENT_RANKS = ["Untrained", "Novice", "Apprentice", "Adept", "Skilled", "Expert", "Veteran", "Master", "Grandmaster", "Mythic", "Legendary"];
export const STATS = { might: "💪 Might", arcana: "🔮 Arcana", agility: "🏹 Agility", spirit: "✨ Spirit", charm: "🎭 Charm", wits: "🧠 Wits" };

// ---------- HEIRLOOMS & COMPANIONS (b = stat bonus) ----------
export const HEIRLOOMS = {
  emberring:  { icon: "💍", name: "Ember Ring",        perk: "+4 Arcana",          b: { arcana: 4 } },
  locket:     { icon: "📿", name: "Moonsilver Locket", perk: "+4 Spirit",          b: { spirit: 4 } },
  stormeye:   { icon: "🔮", name: "Stormglass Eye",    perk: "+4 Wits",            b: { wits: 4 } },
  ironbark:   { icon: "🪵", name: "Ironbark Charm",    perk: "+4 Might",           b: { might: 4 } },
  swiftboots: { icon: "🥾", name: "Swiftwind Boots",   perk: "+4 Agility",         b: { agility: 4 } },
  crownshard: { icon: "👑", name: "Crown Shard",       perk: "+4 Charm",           b: { charm: 4 } },
  pouch:      { icon: "👝", name: "Starthread Pouch",  perk: "+60 gold every year", b: {}, gold: 60 },
  oldmap:     { icon: "🗺️", name: "The Unfinished Map", perk: "Quests pay +20% fame", b: {}, fame: 0.2 },
};
export const PETS = {
  owl:   { icon: "🦉", name: "Owl",         perk: "Training is 20% faster", train: 0.2 },
  cat:   { icon: "🐈‍⬛", name: "Black Cat",   perk: "Luck: fewer bad events", luck: 0.15 },
  toad:  { icon: "🐸", name: "Toad",        perk: "Injuries heal twice as fast", heal: 1 },
  fox:   { icon: "🦊", name: "Fox",         perk: "+3 Wits, +3 Agility", b: { wits: 3, agility: 3 } },
  raven: { icon: "🐦‍⬛", name: "Raven",       perk: "+25% gold from quests", gold: 0.25 },
  drake: { icon: "🐲", name: "Baby Dragon", perk: "Grows up with you (+1 Might & Arcana a year)", grow: 1 },
  wolf:  { icon: "🐺", name: "Wolf Pup",    perk: "+3 Might, +3 Spirit", b: { might: 3, spirit: 3 } },
  phoenix:{ icon: "🐦‍🔥", name: "Phoenix Chick", perk: "Once, it saves you from death", phoenix: 1 },
};

// ---------- MONSTERS ----------
// ai: basic | caster (hits everyone) | poison | regen | pierce (ignores defence) | bosses
export const MONSTERS = {
  slime:    { name: "Gloop Slime",   icon: "🟢", hp: 40,  atk: 7,  mag: 0,  def: 1,  spd: 2,  xp: 12, gold: 6,  ai: "basic" },
  goblin:   { name: "Goblin",        icon: "👺", hp: 48,  atk: 10, mag: 0,  def: 2,  spd: 6,  xp: 15, gold: 9,  ai: "basic" },
  bat:      { name: "Cave Bat",      icon: "🦇", hp: 30,  atk: 8,  mag: 0,  def: 0,  spd: 10, xp: 10, gold: 5,  ai: "basic" },
  wolf:     { name: "Dire Wolf",     icon: "🐺", hp: 55,  atk: 12, mag: 0,  def: 2,  spd: 8,  xp: 18, gold: 8,  ai: "basic" },
  imp:      { name: "Ember Imp",     icon: "👿", hp: 38,  atk: 6,  mag: 9,  def: 1,  spd: 7,  xp: 16, gold: 10, ai: "caster" },
  skeleton: { name: "Skeleton",      icon: "💀", hp: 80,  atk: 16, mag: 0,  def: 6,  spd: 5,  xp: 28, gold: 14, ai: "basic" },
  orc:      { name: "Ravager",       icon: "👹", hp: 110, atk: 20, mag: 0,  def: 5,  spd: 3,  xp: 34, gold: 16, ai: "basic" },
  darkmage: { name: "Dark Sorcerer", icon: "🧙", hp: 65,  atk: 6,  mag: 15, def: 3,  spd: 7,  xp: 32, gold: 18, ai: "caster" },
  spider:   { name: "Giant Spider",  icon: "🕷️", hp: 75,  atk: 14, mag: 0,  def: 4,  spd: 9,  xp: 30, gold: 14, ai: "poison" },
  troll:    { name: "Cave Troll",    icon: "🧌", hp: 180, atk: 26, mag: 0,  def: 8,  spd: 3,  xp: 55, gold: 25, ai: "regen" },
  wraith:   { name: "Wraith",        icon: "👻", hp: 110, atk: 24, mag: 0,  def: 4,  spd: 9,  xp: 50, gold: 24, ai: "pierce" },
  demon:    { name: "Demon",         icon: "😈", hp: 140, atk: 22, mag: 20, def: 7,  spd: 7,  xp: 60, gold: 30, ai: "caster" },
  golem:    { name: "Stone Golem",   icon: "🗿", hp: 220, atk: 24, mag: 0,  def: 14, spd: 1,  xp: 58, gold: 26, ai: "basic" },
  mimic:    { name: "Mimic",         icon: "📦", hp: 90,  atk: 18, mag: 0,  def: 5,  spd: 6,  xp: 40, gold: 60, ai: "basic" },
  gking:    { name: "The Goblin King",    icon: "🤴", hp: 320, atk: 20, mag: 0,  def: 6,  spd: 5, xp: 120, gold: 80,  ai: "gking",  boss: true },
  lich:     { name: "The Lich",           icon: "☠️", hp: 520, atk: 22, mag: 26, def: 8,  spd: 6, xp: 220, gold: 150, ai: "lich",   boss: true },
  dragon:   { name: "The First Dragon",   icon: "🐉", hp: 900, atk: 34, mag: 34, def: 12, spd: 7, xp: 0,   gold: 0,   ai: "dragon", boss: true },
};
