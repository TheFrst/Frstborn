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

// ---------- CALLINGS (classes) ----------
export const CALLINGS = {
  elementalist: { name: "Elementalist", icon: "🔥", color: "#f97316", role: "Big damage to every enemy", hp: 72, atk: 5, mag: 18, def: 3, spd: 6, main: "mag", spells: ["spark", "fireball", "frostnova"] },
  warden:       { name: "Warden",       icon: "🛡️", color: "#64748b", role: "Shields the party, takes the hits", hp: 130, atk: 14, mag: 4, def: 8, spd: 4, main: "atk", spells: ["slam", "bulwark", "quake"] },
  lifebinder:   { name: "Lifebinder",   icon: "✨", color: "#facc15", role: "Heals and brings friends back", hp: 92, atk: 6, mag: 13, def: 5, spd: 5, main: "mag", spells: ["lightray", "mend", "rebirth"] },
  shadowblade:  { name: "Shadowblade",  icon: "🗡️", color: "#6d28d9", role: "Poison and huge critical hits", hp: 86, atk: 16, mag: 4, def: 4, spd: 9, main: "atk", spells: ["shadowdart", "venom", "voidrend"] },
};

export const SPELLS = {
  spark:      { name: "Spark Bolt",  icon: "⚡", cd: 0, tgt: "enemy", desc: "Zap one enemy" },
  fireball:   { name: "Fireball",    icon: "🔥", cd: 3, tgt: "none",  desc: "Hit ALL enemies + burn" },
  frostnova:  { name: "Frost Nova",  icon: "❄️", cd: 4, tgt: "none",  desc: "Hit all + freeze them" },
  slam:       { name: "Shield Slam", icon: "🔨", cd: 0, tgt: "enemy", desc: "Heavy blow" },
  bulwark:    { name: "Bulwark",     icon: "🛡️", cd: 3, tgt: "none",  desc: "Party takes half damage, enemies must hit you" },
  quake:      { name: "Quake",       icon: "💥", cd: 2, tgt: "none",  desc: "Hit all enemies" },
  lightray:   { name: "Light Ray",   icon: "🌟", cd: 0, tgt: "enemy", desc: "Burn one enemy with light" },
  mend:       { name: "Mend",        icon: "💚", cd: 1, tgt: "ally",  desc: "Big heal on one ally" },
  rebirth:    { name: "Rebirth",     icon: "🕊️", cd: 4, tgt: "none",  desc: "Heal everyone, revive the fallen" },
  shadowdart: { name: "Shadow Dart", icon: "🗡️", cd: 0, tgt: "enemy", desc: "30% chance of a double crit" },
  venom:      { name: "Venom",       icon: "🐍", cd: 2, tgt: "enemy", desc: "Poison for 3 turns" },
  voidrend:   { name: "Void Rend",   icon: "🌌", cd: 3, tgt: "enemy", desc: "Huge hit, bigger on poisoned foes" },
  potion:     { name: "Potion",      icon: "🧪", cd: 0, tgt: "ally",  desc: "Heal an ally 45%" },
};

// ---------- HEIRLOOMS & COMPANIONS ----------
export const HEIRLOOMS = {
  emberring:  { icon: "💍", name: "Ember Ring",        perk: "+8% damage" },
  locket:     { icon: "📿", name: "Moonsilver Locket", perk: "+15 max HP" },
  stormeye:   { icon: "🔮", name: "Stormglass Eye",    perk: "+8% crit chance" },
  ironbark:   { icon: "🪵", name: "Ironbark Charm",    perk: "+2 defence" },
  swiftboots: { icon: "🥾", name: "Swiftwind Boots",   perk: "+2 speed" },
  lifeseed:   { icon: "🌱", name: "Lifeseed",          perk: "+20% healing done" },
  pouch:      { icon: "👝", name: "Starthread Pouch",  perk: "The party starts with +1 potion" },
};
export const PETS = {
  owl:   { icon: "🦉", name: "Owl",         perk: "+15% XP" },
  cat:   { icon: "🐈‍⬛", name: "Black Cat",   perk: "10% chance to dodge attacks" },
  toad:  { icon: "🐸", name: "Toad",        perk: "Potions heal 50% more" },
  fox:   { icon: "🦊", name: "Fox",         perk: "+2 speed" },
  raven: { icon: "🐦‍⬛", name: "Raven",       perk: "+10 gold after every battle" },
  drake: { icon: "🐲", name: "Baby Dragon", perk: "Breathes fire on an enemy every turn" },
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
export const TIERS = [
  ["slime", "goblin", "bat", "wolf", "imp"],            // floors 1–4
  ["skeleton", "orc", "darkmage", "spider", "wolf"],    // floors 6–9
  ["troll", "wraith", "demon", "golem", "darkmage"],    // floors 11–14
];
export const BOSSES = { 5: "gking", 10: "lich", 15: "dragon" };

export const ROOMS_INFO = {
  battle:   { icon: "⚔️", name: "Monsters", desc: "A fight. XP, gold, maybe loot" },
  elite:    { icon: "💀", name: "Elite",    desc: "A tough fight. Better loot" },
  treasure: { icon: "💰", name: "Treasure", desc: "Gold and supplies" },
  campfire: { icon: "🔥", name: "Campfire", desc: "Rest and heal 40%" },
  shop:     { icon: "🛒", name: "Merchant", desc: "Buy potions and gear" },
  mystery:  { icon: "❓", name: "Mystery",  desc: "Who knows…" },
  boss:     { icon: "👑", name: "BOSS",     desc: "The guardian of this level" },
};

export const ITEM_WORDS = {
  weapon: ["Blade", "Staff", "Hammer", "Bow", "Wand", "Axe"],
  armor:  ["Cloak", "Mail", "Robe", "Plate", "Mantle"],
  charm:  ["Amulet", "Ring", "Talisman", "Totem"],
  adj:    ["Gleaming", "Ancient", "Whispering", "Starlit", "Smouldering", "Frostbound", "Moonlit", "Cursed", "Runed", "Stormforged"],
  of:     ["the Owl", "Embers", "the Deep", "the First Realm", "the Void", "Dawn", "Thorns", "the Tide", "Kings", "the Kampung"],
};
export const RARITY = [
  { key: "common",    name: "Common",    mult: 1,   weight: 55 },
  { key: "rare",      name: "Rare",      mult: 1.6, weight: 28 },
  { key: "epic",      name: "Epic",      mult: 2.4, weight: 13 },
  { key: "legendary", name: "Legendary", mult: 3.5, weight: 4 },
];

export const EVENTS = [
  { key: "shrine",   title: "🗿 A Forgotten Shrine",  text: "Strange runes glow on a stone altar. Pray at the shrine?" },
  { key: "chest",    title: "📦 A Lonely Chest",      text: "A chest sits alone in a dark room. Suspicious… Open it?" },
  { key: "fountain", title: "⛲ The Silver Fountain",  text: "The water shimmers with old magic. Drink from it?" },
  { key: "book",     title: "📕 A Whispering Book",   text: "A spellbook whispers your names. Read it?" },
  { key: "gambler",  title: "🎲 The Grinning Imp",    text: "An imp offers a game: win up to 150 gold, or lose half your gold. Play?" },
];
