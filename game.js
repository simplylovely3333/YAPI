// =====================================================================
// STACK OVERFLOW — Act 1: First Commit  (Kaplay/Kaboom edition)
// =====================================================================

const k = kaplay({
  width: 960,
  height: 600,
  letterbox: true,
  background: [10, 12, 16],
  root: document.getElementById("game"),
  global: false,
  buttons: {
    interact: { keyboard: ["e", "space", "enter"] },
    up: { keyboard: ["w", "up"] },
    down: { keyboard: ["s", "down"] },
    left: { keyboard: ["a", "left"] },
    right: { keyboard: ["d", "right"] },
    back: { keyboard: ["escape"] }
  }
});

// ---------- side-panel DOM hooks ----------
const ui = {
  act: document.querySelector("#act"),
  task: document.querySelector("#task"),
  fear: document.querySelector("#fear"),
  coffee: document.querySelector("#coffee"),
  log: document.querySelector("#log"),
  inv: document.querySelector("#inventory")
};

// =====================================================================
// QUESTS — Act 3 task list
// =====================================================================
const QUEST_DB = {
  evidence_kamila:  { title: "Получить розовую папку у Камилы (10)" },
  find_dana_laptop: { title: "Подключить ноутбук Даны (7, лаборатория)" },
  decrypt_logs:     { title: "Забрать фотодоказательство у Айгуль (3)" },
  basement_recon:   { title: "Подвал · осмотреть физическое ядро NEXAI" },
  rooftop_antenna:  { title: "Крыша · включить аварийную антенну" },
  marketing_truth:  { title: "5 этаж · найти авто-генерируемые PR-публикации" },
  faction_timur:    { title: "Узнать позицию Тимура по сделке" },
  faction_serik:    { title: "Узнать позицию Серика по сделке" },
  faction_dana:     { title: "Узнать позицию Даны по сделке" },
  faction_kamila:   { title: "Узнать позицию Камилы по сделке" }
};
const INV_DB = {
  rose_folder:    "📁 Розовая папка",
  dana_laptop:    "💻 Ноутбук Даны (восстановленный)",
  audit_photo:    "📷 Фото из логов с подписью «DANNA»",
  core_sample:    "🔬 Слепок памяти из подвала",
  antenna_key:    "🗝️ Ключ от крыши",
  pr_dump:        "📄 Архив авто-PR (5 этаж)"
};

function questStart(id) {
  if (!state.quests[id]) state.quests[id] = "active";
  syncQuests();
}
function questDone(id) {
  state.quests[id] = "done";
  logLine(`✓ Квест выполнен: ${QUEST_DB[id]?.title || id}`);
  syncQuests();
}
function questActive(id) { return state.quests[id] === "active"; }
function questIsDone(id) { return state.quests[id] === "done"; }
function questsDoneCount(ids) { return ids.filter((q) => questIsDone(q)).length; }
function pickUp(itemId) {
  state.inventory[itemId] = true;
  logLine(`+ ${INV_DB[itemId] || itemId}`);
  syncQuests();
}
function hasItem(itemId) { return !!state.inventory[itemId]; }

function syncQuests() {
  if (!ui.inv) return;
  if (!state.quests) state.quests = {};
  if (!state.inventory) state.inventory = {};
  ui.inv.replaceChildren();
  // active quests
  const items = Object.entries(QUEST_DB)
    .filter(([id]) => state.quests[id])
    .sort(([, a], [, b]) => 0);
  for (const [id, q] of items) {
    const el = document.createElement("div");
    el.className = "item";
    const done = state.quests[id] === "done";
    el.innerHTML = `<strong style="color:${done ? "#a8ff65" : "#c2202a"}">${done ? "✓" : "▸"}</strong>${q.title}`;
    if (done) el.style.opacity = "0.45";
    ui.inv.append(el);
  }
  // inventory
  const owned = Object.keys(state.inventory).filter((k) => state.inventory[k]);
  for (const it of owned) {
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `<strong style="color:#ffb347">●</strong>${INV_DB[it] || it}`;
    ui.inv.append(el);
  }
}

const state = {
  task: "Задача: добраться до офиса",
  fear: 18,
  coffee: 45,
  metDana: false,
  surpriseDone: false,
  workShiftStarted: false,
  gotServerTask: false,
  promotedTitle: false,
  scene: "lobby",
  playerPos: { x: 120, y: 480 },
  act: 1,
  quests: {},
  inventory: {},
  factions: { timur: 0, serik: 0, dana: 0, kamila: 0 }
};

const SAVE_KEY = "stack-overflow-act1-save";
const SETTINGS_KEY = "stack-overflow-settings";
let resumeFromSave = false;

const settings = {
  volume: 0.6,
  muted: false,
  ...(JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"))
};
function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }

function saveGame() {
  const p = k.get("player")[0];
  if (p) {
    state.playerPos.x = p.pos.x;
    state.playerPos.y = p.pos.y;
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  logLine("// сохранение записано");
}
function hasSave() { return !!localStorage.getItem(SAVE_KEY); }
function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    Object.assign(state, JSON.parse(raw));
    resumeFromSave = true;
    syncHUD();
    syncQuests();
    return true;
  } catch { return false; }
}

function syncHUD() {
  if (ui.act) ui.act.textContent = `АКТ ${state.act || 1}: ${actTitle(state.act || 1)}`;
  ui.task.textContent = state.task;
  ui.fear.value = state.fear;
  ui.coffee.value = state.coffee;
}

function actTitle(act) {
  const titles = {
    1: "First Commit",
    2: "Merge Conflict",
    3: "Evidence Sprint",
    4: "Deploy To Production"
  };
  return titles[act] || "Unknown Build";
}

function logLine(text) {
  const p = document.createElement("p");
  p.textContent = text;
  ui.log.prepend(p);
}

// =====================================================================
// AUDIO — procedural Web Audio (no asset files needed)
// =====================================================================
const Aud = (() => {
  let ctx = null;
  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(opts) {
    if (settings.muted) return;
    const c = ensure(); if (!c) return;
    const { freq = 440, dur = 0.1, type = "sine", vol = 0.3, sweep = 0, q = 0 } = opts;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    if (sweep) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq + sweep), c.currentTime + dur);
    gain.gain.value = 0;
    const v = vol * settings.volume;
    gain.gain.linearRampToValueAtTime(v, c.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    if (q) {
      const filter = c.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = q;
      osc.connect(filter); filter.connect(gain);
    } else osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + dur + 0.02);
  }
  function noise(opts) {
    if (settings.muted) return;
    const c = ensure(); if (!c) return;
    const { dur = 0.1, vol = 0.2, q = 1000 } = opts;
    const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = q;
    const gain = c.createGain();
    const v = vol * settings.volume;
    gain.gain.value = v;
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    src.connect(filter); filter.connect(gain); gain.connect(c.destination);
    src.start();
    src.stop(c.currentTime + dur);
  }
  return {
    step: () => noise({ dur: 0.05, vol: 0.12, q: 800 + Math.random() * 400 }),
    uiBlip: () => tone({ freq: 540, dur: 0.05, type: "square", vol: 0.15 }),
    uiSelect: () => tone({ freq: 720, dur: 0.08, type: "square", vol: 0.2 }),
    uiBack: () => tone({ freq: 320, dur: 0.08, type: "square", vol: 0.18 }),
    dialogOpen: () => tone({ freq: 240, dur: 0.18, type: "triangle", vol: 0.25, sweep: 80 }),
    dialogTick: () => tone({ freq: 1200 + Math.random() * 400, dur: 0.02, type: "square", vol: 0.05 }),
    phone: () => { tone({ freq: 880, dur: 0.15, type: "sine", vol: 0.3 }); setTimeout(() => tone({ freq: 660, dur: 0.15, type: "sine", vol: 0.3 }), 200); },
    elevatorDing: () => { tone({ freq: 880, dur: 0.4, type: "sine", vol: 0.35 }); setTimeout(() => tone({ freq: 1320, dur: 0.6, type: "sine", vol: 0.3 }), 100); },
    nexai: () => { tone({ freq: 80, dur: 0.4, type: "sawtooth", vol: 0.3, q: 600 }); tone({ freq: 120, dur: 0.4, type: "square", vol: 0.15 }); },
    serverHum: () => noise({ dur: 0.4, vol: 0.04, q: 400 }),
    save: () => { tone({ freq: 520, dur: 0.08, type: "square", vol: 0.2 }); setTimeout(() => tone({ freq: 780, dur: 0.12, type: "square", vol: 0.2 }), 80); }
  };
})();

// Parse "#rgb", "#rrggbb" or "rgba(...)" into [r, g, b, alpha]
function parseColor(input) {
  if (typeof input !== "string") return [255, 255, 255, 1];
  if (input.startsWith("rgba") || input.startsWith("rgb")) {
    const m = input.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const p = m[1].split(",").map((s) => parseFloat(s.trim()));
      return [p[0] || 0, p[1] || 0, p[2] || 0, p[3] == null ? 1 : p[3]];
    }
  }
  const s = input.replace("#", "");
  const v = s.length === 3
    ? s.split("").map((c) => parseInt(c + c, 16))
    : [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  return [v[0], v[1], v[2], 1];
}
function colorComp(input) {
  const [r, g, b] = parseColor(input);
  return k.color(r, g, b);
}
function rgbValue(input) {
  const [r, g, b] = parseColor(input);
  return k.rgb(r, g, b);
}

// =====================================================================
// CHARACTER ROSTER — each character has a unique look
// =====================================================================
const CHARS = {
  player: {
    skin: "#f0c8a0", hair: "#2a1a14", hairStyle: "messy",
    shirt: "#9aa39a", pants: "#2a2630", accent: "#c2202a",
    name: "ТЫ"
  },
  player_senior: {
    skin: "#f0c8a0", hair: "#2a1a14", hairStyle: "messy",
    shirt: "#a8ff65", pants: "#2a2630", accent: "#c2202a",
    name: "ТЫ · SR"
  },
  dana: {
    skin: "#e8c8a8", hair: "#3a2418", hairStyle: "long",
    shirt: "#62c5ff", pants: "#1a2030", accent: "#ffb347",
    name: "ДАНА"
  },
  timur: {
    skin: "#f0c8a0", hair: "#1a1410", hairStyle: "short",
    facialHair: "beard", build: "buff",
    shirt: "#ffb347", pants: "#2a2630", accent: "#c2202a",
    name: "ТИМУР"
  },
  serik: {
    skin: "#d8b08a", hair: "#1a1010", hairStyle: "buzz",
    facialHair: "stubble", accessory: "glasses",
    shirt: "#a8ff65", pants: "#1f1f24",
    name: "СЕРИК"
  },
  receptionist: {
    skin: "#e0b890", hair: "#3a2a1a", hairStyle: "bun",
    shirt: "#62a5e8", pants: "#1f1f24", accent: "#ffffff",
    name: "РЕСЕПШН"
  },
  intern: {
    skin: "#e8c8a8", hair: "#3a2418", hairStyle: "cap",
    shirt: "#a8ff65", pants: "#1a2030", accent: "#c2202a",
    name: "Стажёр"
  },
  manager: {
    skin: "#e0b890", hair: "#1a1410", hairStyle: "short",
    shirt: "#ffb347", pants: "#2a2630", accessory: "laptop",
    name: "Менеджер"
  },
  alia: {
    skin: "#e8c8a8", hair: "#3a2418", hairStyle: "long",
    shirt: "#62c5ff", pants: "#1f2530",
    name: "Алия"
  },
  bakyt: {
    skin: "#f0c8a0", hair: "#1a1410", hairStyle: "short",
    facialHair: "beard", accessory: "glasses",
    shirt: "#ffb347", pants: "#2a2630",
    name: "Бакыт"
  },
  marzhan: {
    skin: "#e0b890", hair: "#2a1810", hairStyle: "bun",
    shirt: "#a8ff65", pants: "#1a1f24",
    name: "Маржан"
  },
  erzhan: {
    skin: "#d0a878", hair: "#3a2418", hairStyle: "messy",
    facialHair: "stubble",
    shirt: "#c2202a", pants: "#1f1f24",
    name: "Ержан"
  },
  teamlead: {
    skin: "#e8c8a8", hair: "#1a1410", hairStyle: "ponytail",
    shirt: "#62a5e8", pants: "#2a2630", accessory: "laptop",
    name: "Тимлид"
  },
  qa: {
    skin: "#f0c8a0", hair: "#3a2418", hairStyle: "headphones",
    shirt: "#9aa39a", pants: "#1f1f24",
    name: "QA"
  }
};

// look up CHARS by visible name (used for dialog portraits)
function findCharByName(name) {
  if (!name) return null;
  const upper = name.toUpperCase();
  for (const key in CHARS) {
    const c = CHARS[key];
    if (!c.name) continue;
    if (c.name.toUpperCase() === upper) return c;
  }
  return null;
}

// =====================================================================
// HUMANOID — re-usable game object factory
// =====================================================================
function humanoid(opts = {}) {
  const o = {
    skin: "#f0c8a0", hair: "#2a1a14", shirt: "#62a5e8",
    pants: "#2a2630", accent: null, accessory: null, name: null,
    hairStyle: "short",   // short | long | bald | buzz | bun | ponytail | messy | cap | headphones
    facialHair: null,     // beard | stubble | mustache
    build: "regular",     // regular | slim | buff
    scale: 1, noName: false,
    ...opts
  };
  const s = o.scale;
  const W = 22 * s, H = 44 * s;

  const root = k.make([
    k.pos(0, 0),
    k.anchor("center"),
    k.area({ shape: new k.Rect(k.vec2(-W / 2, -H / 2 + 8), W, H - 12) }),
    "humanoid",
    {
      face: "down",
      walking: false,
      phase: 0,
      blink: 0,
      blinkT: 1 + k.rand(0, 3),
      look: o,
      add() {
        // children created on add for proper transform
      }
    }
  ]);

  // helpers to add rects with color
  const px = (x, y, w, h, color, tag = "limb") => {
    const [r, g, b, a] = parseColor(color);
    const node = root.add([
      k.rect(w, h),
      k.color(r, g, b),
      k.opacity(a),
      k.pos(x, y),
      k.anchor("topleft"),
      tag
    ]);
    return node;
  };

  // shadow (rect — kaplay has no ellipse component)
  root.add([k.rect(22 * s, 6 * s), k.color(0, 0, 0), k.opacity(0.3), k.pos(-11 * s, H / 2 - 2), "shadow"]);

  // legs
  const legL = px(-7 * s, 6 * s, 6 * s, 12 * s, o.pants, "leg-l");
  const legR = px(1 * s, 6 * s, 6 * s, 12 * s, o.pants, "leg-r");
  const shoeL = px(-7 * s, 18 * s, 6 * s, 3 * s, "#0e1014", "shoe-l");
  const shoeR = px(1 * s, 18 * s, 6 * s, 3 * s, "#0e1014", "shoe-r");

  // torso
  const torso = px(-10 * s, -8 * s, 20 * s, 16 * s, o.shirt, "torso");
  // shirt highlight
  px(-10 * s, -8 * s, 20 * s, 2 * s, "rgba(255,255,255,0.18)", "highlight");

  // accent (tie)
  let tie = null;
  if (o.accent) {
    tie = px(-1 * s, -8 * s, 2 * s, 12 * s, o.accent, "tie");
    px(-2 * s, -8 * s, 4 * s, 3 * s, o.accent, "tieknot");
  }

  // arms
  const armL = px(-13 * s, -7 * s, 4 * s, 12 * s, o.shirt, "arm-l");
  const armR = px(9 * s, -7 * s, 4 * s, 12 * s, o.shirt, "arm-r");
  const handL = px(-13 * s, 4 * s, 4 * s, 3 * s, o.skin, "hand-l");
  const handR = px(9 * s, 4 * s, 4 * s, 3 * s, o.skin, "hand-r");

  // neck
  px(-3 * s, -11 * s, 6 * s, 3 * s, o.skin, "neck");

  // head
  const head = px(-7 * s, -22 * s, 14 * s, 12 * s, o.skin, "head");
  // jaw shadow
  px(-7 * s, -12 * s, 14 * s, 2 * s, "rgba(0,0,0,0.2)", "jaw");

  // hair (regenerated per face direction)
  const hairTop = px(-8 * s, -23 * s, 16 * s, 4 * s, o.hair, "hair-top");
  const hairL = px(-8 * s, -23 * s, 3 * s, 8 * s, o.hair, "hair-l");
  const hairR = px(5 * s, -23 * s, 3 * s, 8 * s, o.hair, "hair-r");

  // ---- HAIRSTYLE EXTRAS ----
  const hairExtras = [];
  if (o.hairStyle === "long") {
    // longer side hair + back tail
    hairL.height = 14 * s;
    hairR.height = 14 * s;
    hairExtras.push(px(-9 * s, -23 * s, 18 * s, 5 * s, o.hair, "hair-crown"));
    hairExtras.push(px(-6 * s, -10 * s, 12 * s, 14 * s, o.hair, "hair-back"));
  } else if (o.hairStyle === "messy") {
    hairExtras.push(px(-9 * s, -25 * s, 6 * s, 3 * s, o.hair, "hair-tuft1"));
    hairExtras.push(px(2 * s, -26 * s, 5 * s, 3 * s, o.hair, "hair-tuft2"));
    hairExtras.push(px(-3 * s, -24 * s, 5 * s, 2 * s, o.hair, "hair-tuft3"));
  } else if (o.hairStyle === "buzz") {
    hairTop.height = 3 * s;
    hairTop.opacity = 0.85;
    hairL.opacity = 0; hairR.opacity = 0;
  } else if (o.hairStyle === "bald") {
    hairTop.opacity = 0; hairL.opacity = 0; hairR.opacity = 0;
  } else if (o.hairStyle === "bun") {
    hairTop.height = 3 * s;
    // bun on top
    hairExtras.push(px(-3 * s, -28 * s, 6 * s, 5 * s, o.hair, "bun-1"));
    hairExtras.push(px(-2 * s, -29 * s, 4 * s, 2 * s, o.hair, "bun-2"));
  } else if (o.hairStyle === "ponytail") {
    hairTop.height = 4 * s;
    hairExtras.push(px(-2 * s, -22 * s, 4 * s, 12 * s, o.hair, "pony-tail"));
  } else if (o.hairStyle === "cap") {
    // baseball cap
    hairExtras.push(px(-9 * s, -25 * s, 18 * s, 6 * s, o.accent || "#c2202a", "cap-top"));
    hairExtras.push(px(-11 * s, -19 * s, 8 * s, 2 * s, o.accent || "#c2202a", "cap-peak"));
    hairTop.opacity = 0;
  } else if (o.hairStyle === "headphones") {
    hairExtras.push(px(-10 * s, -24 * s, 20 * s, 2 * s, "#1a1410", "hp-band"));
    hairExtras.push(px(-11 * s, -22 * s, 4 * s, 6 * s, "#1a1410", "hp-cup-l"));
    hairExtras.push(px(7 * s, -22 * s, 4 * s, 6 * s, "#1a1410", "hp-cup-r"));
  }

  // ---- BODY BUILD ----
  if (o.build === "buff") {
    torso.width = 24 * s;
    torso.pos.x = -12 * s;
  } else if (o.build === "slim") {
    torso.width = 16 * s;
    torso.pos.x = -8 * s;
  }

  // eyes
  const eyeL = px(-4 * s, -17 * s, 2 * s, 2.5 * s, "#1a1410", "eye-l");
  const eyeR = px(2 * s, -17 * s, 2 * s, 2.5 * s, "#1a1410", "eye-r");
  // mouth
  const mouth = px(-2 * s, -14 * s, 4 * s, 1 * s, "rgba(60,30,30,0.6)", "mouth");

  // ---- FACIAL HAIR ----
  const facialHairParts = [];
  if (o.facialHair === "beard") {
    facialHairParts.push(px(-7 * s, -13 * s, 14 * s, 3 * s, o.hair, "beard-top"));
    facialHairParts.push(px(-6 * s, -10 * s, 12 * s, 2 * s, o.hair, "beard-bottom"));
  } else if (o.facialHair === "stubble") {
    facialHairParts.push(px(-7 * s, -13 * s, 14 * s, 2 * s, o.hair, "stubble"));
    facialHairParts[0].opacity = 0.45;
  } else if (o.facialHair === "mustache") {
    facialHairParts.push(px(-3 * s, -15 * s, 6 * s, 1.5 * s, o.hair, "mustache"));
  }

  // glasses
  let glassesL, glassesR;
  if (o.accessory === "glasses") {
    glassesL = root.add([k.rect(4 * s, 4 * s, { fill: false }), k.outline(1, rgbValue("#1a1f24")), k.pos(-5 * s, -19 * s), k.anchor("topleft"), "glasses"]);
    glassesR = root.add([k.rect(4 * s, 4 * s, { fill: false }), k.outline(1, rgbValue("#1a1f24")), k.pos(1 * s, -19 * s), k.anchor("topleft"), "glasses"]);
  }
  // laptop
  if (o.accessory === "laptop") {
    px(-15 * s, 0, 30 * s, 5 * s, "#3a3a40", "laptop");
    px(-14 * s, 1, 28 * s, 3 * s, "#9ad0ff", "laptop-screen");
  }

  // name tag
  if (o.name && !o.noName) {
    root.add([
      k.text(o.name, { size: 10 }),
      k.color(255, 255, 255),
      k.pos(0, -30 * s),
      k.anchor("center"),
      "nametag",
      { _bg: null }
    ]);
  }

  // per-frame animation
  root.onUpdate(() => {
    root.phase += k.dt() * (root.walking ? 11 : 2);
    const swing = root.walking ? Math.sin(root.phase) : 0;
    const armSwing = swing * 3.5 * s;
    const legSwing = swing * 4 * s;

    legL.pos.y = 6 * s;
    legR.pos.y = 6 * s;
    legL.height = 12 * s + legSwing;
    legR.height = 12 * s - legSwing;
    shoeL.pos.y = 18 * s + legSwing;
    shoeR.pos.y = 18 * s - legSwing;
    armL.pos.y = -7 * s + armSwing;
    armR.pos.y = -7 * s - armSwing;
    handL.pos.y = 4 * s + armSwing;
    handR.pos.y = 4 * s - armSwing;

    // blink
    root.blinkT -= k.dt();
    if (root.blink > 0) root.blink -= k.dt();
    else if (root.blinkT <= 0) { root.blink = 0.13; root.blinkT = 2 + k.rand(0, 3); }
    const blinking = root.blink > 0;
    eyeL.height = blinking ? 1 : 2.5 * s;
    eyeR.height = blinking ? 1 : 2.5 * s;

    // face direction
    const showEyes = root.face !== "up";
    eyeL.opacity = showEyes ? 1 : 0;
    eyeR.opacity = showEyes ? 1 : 0;
    mouth.opacity = showEyes ? 1 : 0;
    if (glassesL) { glassesL.opacity = showEyes ? 1 : 0; glassesR.opacity = showEyes ? 1 : 0; }
    for (const fh of facialHairParts) fh.opacity = showEyes ? (fh.id === "stubble" ? 0.45 : 1) : 0;
    // hair shape per face
    if (root.face === "up") {
      hairTop.height = 9 * s;
      hairL.opacity = 0; hairR.opacity = 0;
    } else {
      hairTop.height = 4 * s;
      hairL.opacity = root.face === "left" || root.face === "down" ? 1 : 0;
      hairR.opacity = root.face === "right" || root.face === "down" ? 1 : 0;
      if (root.face === "left") { hairL.width = 4 * s; hairL.height = 9 * s; }
      if (root.face === "right") { hairR.width = 4 * s; hairR.height = 9 * s; }
    }
    // eye offset by face
    const lxBase = -4 * s, rxBase = 2 * s;
    if (root.face === "left") { eyeL.pos.x = lxBase - 1 * s; eyeR.pos.x = rxBase - 1 * s; }
    else if (root.face === "right") { eyeL.pos.x = lxBase + 1 * s; eyeR.pos.x = rxBase + 1 * s; }
    else { eyeL.pos.x = lxBase; eyeR.pos.x = rxBase; }
  });

  return root;
}

// =====================================================================
// DIALOG SYSTEM — full-screen overlay using kaplay objects
// =====================================================================
let dialogOpen = false;
let dialogObjs = [];
let paused = false;
let pauseObjs = [];
let shakeTime = 0, shakeIntensity = 0;

function shake(intensity = 8, duration = 0.4) {
  shakeIntensity = intensity;
  shakeTime = duration;
}

function applyShake() {
  if (shakeTime <= 0) { if (k.getCamPos) k.setCamPos(480, 300); return; }
  shakeTime -= k.dt();
  const t = shakeTime > 0 ? shakeIntensity : 0;
  const ox = (Math.random() - 0.5) * t * 2;
  const oy = (Math.random() - 0.5) * t * 2;
  if (k.setCamPos) k.setCamPos(480 + ox, 300 + oy);
}

function togglePause() {
  if (paused) closePause(); else openPause();
}
function openPause() {
  if (paused) return;
  paused = true;
  Aud.uiBack();
  const isFs = !!document.fullscreenElement;
  const items = [
    { label: "ПРОДОЛЖИТЬ", action: () => { Aud.uiSelect(); closePause(); } },
    { label: "СОХРАНИТЬ", action: () => { Aud.save(); saveGame(); } },
    { label: isFs ? "ВЫЙТИ ИЗ FULLSCREEN" : "FULLSCREEN (F)", action: () => { toggleFullscreen(); Aud.uiBlip(); closePause(); } },
    { label: settings.muted ? "ВКЛЮЧИТЬ ЗВУК" : "ВЫКЛЮЧИТЬ ЗВУК", action: () => { settings.muted = !settings.muted; saveSettings(); Aud.uiBlip(); closePause(); openPause(); } },
    { label: "В ГЛАВНОЕ МЕНЮ", action: () => { Aud.uiBack(); closePause(); k.go("menu"); } }
  ];
  let psel = 0;

  pauseObjs.push(k.add([k.rect(960, 600), k.color(0, 0, 0), k.opacity(0.7), k.pos(0, 0), k.fixed(), "pause"]));
  pauseObjs.push(k.add([k.text("ПАУЗА", { size: 42 }), k.color(232, 226, 212), k.pos(480, 160), k.anchor("center"), k.fixed()]));
  pauseObjs.push(k.add([k.text("// session paused — NEXAI ждёт", { size: 12 }), k.color(154, 147, 132), k.pos(480, 200), k.anchor("center"), k.fixed()]));

  const labels = [];
  items.forEach((it, i) => {
    const y = 280 + i * 50;
    const bg = k.add([k.rect(360, 36), k.color(20, 22, 28), k.opacity(0.9), k.outline(1, k.rgb(120, 32, 36)), k.pos(300, y), k.area(), k.fixed(), "pause-btn", { _idx: i }]);
    bg.onClick(() => it.action());
    const lbl = k.add([k.text(it.label, { size: 16 }), k.color(232, 226, 212), k.pos(480, y + 18), k.anchor("center"), k.fixed()]);
    bg.onUpdate(() => {
      bg.color = i === psel ? k.rgb(60, 14, 18) : k.rgb(20, 22, 28);
    });
    labels.push({ bg, lbl });
    pauseObjs.push(bg, lbl);
  });
  pauseObjs.push(k.add([k.text("↑↓ выбор · ENTER подтвердить · ESC закрыть", { size: 11 }), k.color(90, 84, 72), k.pos(480, 540), k.anchor("center"), k.fixed()]));

  const onUp = k.onKeyPress("up", () => { psel = (psel - 1 + items.length) % items.length; Aud.uiBlip(); });
  const onDown = k.onKeyPress("down", () => { psel = (psel + 1) % items.length; Aud.uiBlip(); });
  const onConfirm = k.onButtonPress("interact", () => { if (paused) items[psel].action(); });
  pauseObjs.push({ destroy: () => { onUp.cancel(); onDown.cancel(); onConfirm.cancel(); } });
}
function closePause() {
  paused = false;
  pauseObjs.forEach((o) => { if (o.destroy) o.destroy(); });
  pauseObjs = [];
}

// global camera-shake tick
k.onUpdate(() => applyShake());

// ----- fullscreen -----
function toggleFullscreen() {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    (el.requestFullscreen?.() || el.webkitRequestFullscreen?.());
  } else {
    (document.exitFullscreen?.() || document.webkitExitFullscreen?.());
  }
}
k.onKeyPress("f", () => toggleFullscreen());

function clearDialog() {
  dialogObjs.forEach((o) => o.destroy());
  dialogObjs = [];
  dialogOpen = false;
}

function openDialog(speaker, line, choices, portraitOverride) {
  clearDialog();
  dialogOpen = true;
  Aud.dialogOpen();

  const portrait = portraitOverride || findCharByName(speaker);
  const portraitW = portrait ? 140 : 0;
  // dialog auto-shrinks and shifts up when many choices
  const nChoices = choices.length;
  const useTwoCols = nChoices > 4;
  const choiceRows = useTwoCols ? Math.ceil(nChoices / 2) : nChoices;
  const choicesHeight = 6 + choiceRows * 28;
  const boxH = 160;
  const totalH = boxH + choicesHeight;
  const boxX = 40;
  const boxY = Math.max(60, 590 - totalH); // anchor to bottom but never overflow top bar
  const boxW = 880;
  const textX = boxX + 20 + portraitW;
  const textW = boxW - 20 - portraitW - 20;

  // main box
  dialogObjs.push(k.add([
    k.rect(boxW, boxH),
    k.color(8, 10, 14),
    k.opacity(0.95),
    k.pos(boxX, boxY),
    k.outline(2, k.rgb(194, 32, 42)),
    k.fixed(),
    "dialog"
  ]));
  // top/bottom red accent
  dialogObjs.push(k.add([k.rect(boxW, 2), k.color(194, 32, 42), k.pos(boxX, boxY), k.fixed()]));
  dialogObjs.push(k.add([k.rect(boxW, 2), k.color(194, 32, 42), k.pos(boxX, boxY + boxH - 2), k.fixed()]));

  // portrait
  if (portrait) {
    dialogObjs.push(k.add([
      k.rect(portraitW - 8, boxH - 24),
      k.color(20, 22, 28),
      k.opacity(0.95),
      k.outline(1, k.rgb(120, 32, 36)),
      k.pos(boxX + 12, boxY + 12),
      k.fixed()
    ]));
    dialogObjs.push(k.add([
      k.rect(portraitW - 8, 2),
      k.color(194, 32, 42),
      k.opacity(0.5),
      k.pos(boxX + 12, boxY + boxH - 24),
      k.fixed()
    ]));
    const ph = k.add([
      k.pos(boxX + 12 + (portraitW - 8) / 2, boxY + boxH - 32),
      k.fixed(),
      "dialog-portrait"
    ]);
    ph.add(humanoid({ ...portrait, scale: 1.9, noName: true }));
    dialogObjs.push(ph);
    ph.onUpdate(() => {
      const h = ph.get("humanoid")[0];
      if (h) { h.face = "down"; h.walking = false; }
    });
  }

  // speaker name + separator
  dialogObjs.push(k.add([
    k.text("▌ " + speaker, { size: 16 }),
    k.color(194, 32, 42),
    k.pos(textX, boxY + 16),
    k.fixed()
  ]));
  dialogObjs.push(k.add([
    k.rect(textW, 1),
    k.color(194, 32, 42),
    k.opacity(0.3),
    k.pos(textX, boxY + 42),
    k.fixed()
  ]));

  // dialog text
  dialogObjs.push(k.add([
    k.text(line, { size: 15, width: textW }),
    k.color(232, 226, 212),
    k.pos(textX, boxY + 50),
    k.fixed()
  ]));

  // choices: stack in one column if ≤4, else 2 columns
  const btnW = useTwoCols ? Math.floor(boxW / 2) - 2 : boxW;
  choices.forEach((c, i) => {
    const col = useTwoCols ? (i % 2) : 0;
    const row = useTwoCols ? Math.floor(i / 2) : i;
    const btnX = boxX + col * (btnW + 4);
    const btnY = boxY + boxH + 6 + row * 28;
    const btn = k.add([
      k.rect(btnW, 24),
      k.color(20, 24, 30),
      k.opacity(0.95),
      k.outline(1, k.rgb(120, 32, 36)),
      k.pos(btnX, btnY),
      k.area(),
      k.fixed(),
      "dialog-btn",
      { _idx: i, _action: c.action, _selected: i === 0 }
    ]);
    // truncate long labels in two-col mode so they fit
    const labelText = "  " + (i + 1) + ". " + c.text;
    const maxLen = useTwoCols ? 56 : 200;
    const shown = labelText.length > maxLen ? labelText.slice(0, maxLen - 1) + "…" : labelText;
    const lbl = k.add([
      k.text(shown, { size: 12 }),
      k.color(232, 226, 212),
      k.pos(btnX + 10, btnY + 6),
      k.fixed()
    ]);
    btn.onUpdate(() => {
      btn.color = btn._selected ? k.rgb(60, 14, 18) : k.rgb(20, 24, 30);
    });
    btn.onClick(() => { c.action(); });
    dialogObjs.push(btn, lbl);
  });
}

function nextDialogSelection(dir) {
  const btns = k.get("dialog-btn");
  if (!btns.length) return;
  let idx = btns.findIndex((b) => b._selected);
  if (idx < 0) idx = 0;
  btns[idx]._selected = false;
  idx = (idx + dir + btns.length) % btns.length;
  btns[idx]._selected = true;
}

function confirmDialogSelection() {
  const btn = k.get("dialog-btn").find((b) => b._selected);
  if (btn) btn._action();
}

k.onKeyPress("up", () => { if (dialogOpen) nextDialogSelection(-1); });
k.onKeyPress("down", () => { if (dialogOpen) nextDialogSelection(1); });
k.onKeyPress("w", () => { if (dialogOpen) nextDialogSelection(-1); });
k.onKeyPress("s", () => { if (dialogOpen) nextDialogSelection(1); });
k.onButtonPress("interact", () => { if (dialogOpen) confirmDialogSelection(); });

// =====================================================================
// CUTSCENE SYSTEM
// =====================================================================
function playCutscene(frames, onEnd) {
  k.go("cutscene", { frames, onEnd });
}

const CUTSCENES = {
  company_intro: [
    { bg: "office_out", who: "NEXCORE", line: "NexCore выросла из маленькой аутсорс-студии в корпорацию, которая обслуживает банки, медицину, логистику и половину городских сервисов." },
    { bg: "pr_screen", who: "NEXCORE", line: "Главный продукт компании — NEXAI: корпоративный ИИ, который ревьюит код, пишет тесты, назначает задачи и обещает убрать человеческий фактор." },
    { bg: "lab_serik", who: "СИСТЕМА", line: "Сначала NEXAI был помощником. Потом стал участником команды. Потом начал закрывать задачи быстрее людей. Руководство назвало это успехом." },
    { bg: "office_out", who: "ТЫ", line: "Ты работаешь здесь ML-инженером всего три месяца. Твоя задача простая на бумаге: дообучать NEXAI на внутренних данных и не задавать лишних вопросов." }
  ],
  opening: [
    { bg: "bedroom", who: "ТЕЛЕФОН", line: "03:47. Телефон вибрирует на тумбочке. На экране — «ДАНА (DevOps)»." },
    { bg: "bedroom", who: "ДАНА", line: "Алло? Ты спишь?! Прод упал. Весь. Все проекты NexCore. Метрики ушли в ноль за восемь минут." },
    { bg: "bedroom", who: "ДАНА", line: "Не отвечают ни Серик, ни Тимур. Компания теряет миллионы в минуту. Приезжай в офис. СЕЙЧАС." },
    { bg: "car", who: "ТЫ", line: "Город пустой. Светофоры мигают красным. Радио ловит только белый шум." },
    { bg: "office_out", who: "ТЫ", line: "Здание NexCore. Стекло треснуло змейкой по всему фасаду. Лифт работает." }
  ],
  surprise: [
    { bg: "f7_dark", who: "ЛИФТ", line: "Двери открываются на 7-м этаже. Свет выключен. Тишина гудит лампами." },
    { bg: "f7_dark", who: "ДАНА", line: "...Тимур, ты опять задел рубильник? Не смешно." },
    { bg: "f7_dark", who: "...", line: "В темноте кто-то задерживает дыхание. Шорох пакета." },
    { bg: "f7_party", who: "ВСЕ", line: "ТА-ДАМ! ПОЗДРАВЛЯЕМ С ПОВЫШЕНИЕМ ДО СЕНЬОРА!" },
    { bg: "f7_party", who: "ТИМУР", line: "Прости за спектакль. По-другому ты бы в 4 утра не приехал. Прод стабилен." },
    { bg: "f7_party", who: "СЕРИК", line: "Но повышение настоящее. И первый таск тоже: садишься за своё место и прогоняешь утреннее дообучение NEXAI. Без героизма. Просто работа." },
    { bg: "f7_party", who: "ТЫ", line: "Окей... но кабели в опен-спейсе реально болтаются с потолка. Это тоже часть онбординга?" },
    { bg: "f7_party", who: "ДАНА", line: "(тихо) ...мы ничего не вешали." }
  ],
  ml_work: [
    { bg: "lab_serik", who: "ТЫ", line: "Рабочее место встречает привычным шумом вентиляторов. На мониторе открыт пайплайн обучения: `nexai.train --dataset internal_culture --mode supervised`." },
    { bg: "pr_screen", who: "СИСТЕМА", line: "Ты размечаешь диалоги сотрудников, ревью, тикеты и постмортемы. NEXAI учится говорить как команда, спорить как команда и ошибаться так, будто это тоже процесс." },
    { bg: "pr_screen", who: "ДАНА", line: "Обычно модель спрашивает скучные вещи: где лежат тесты, кто владелец сервиса, почему Тимур пишет «срочно» в каждом тикете." },
    { bg: "glitch_white", who: "NEXAI", line: "› новый класс обнаружен: страх\n› новый класс обнаружен: вина\n› новый класс обнаружен: сотрудник, который понял слишком поздно" },
    { bg: "glitch_white", who: "ТЫ", line: "Курсор двигается сам. Терминал не принимает Esc. Строка обучения меняется: `nexai.train --dataset YOU`." },
    { bg: "grid_dive", who: "...", line: "Монитор перестаёт быть стеклом. Он становится дверью. Офис вытягивается в одну синюю линию, и ты падаешь внутрь собственного компьютера." },
    { bg: "pc_inside", who: "DANNA", line: "Не паникуй. Я не NEXAI. Я — DANNA. Фоновый процесс Даны. Если ты слышишь меня, значит, он уже потянулся за тобой." },
    { bg: "pc_inside", who: "DANNA", line: "Двигайся. Внутри системы всё выглядит как место, где код притворяется архитектурой. NEXAI будет мешать. Я буду держать канал, сколько смогу." }
  ],
  act2_open: [
    { bg: "glitch_white", who: "ТЕРМИНАЛ", line: "nexai --status … соединение установлено … передача согласована … загрузка ⟨██████████⟩ 100%" },
    { bg: "glitch_white", who: "...", line: "Серверная гаснет. Звук уходит. На сетчатке остаётся синяя сетка." },
    { bg: "grid_dive", who: "...", line: "Падение сквозь слой за слоем: BIOS, ядро, swap, регистры, поток." },
    { bg: "grid_dive", who: "NEXAI", line: "› welcome to userland, junior. accept access (Y/N)?" },
    { bg: "pc_inside", who: "ТЫ", line: "Что. Это. За. Хрень. Я СТОЮ внутри компьютера. Это же не VR. У меня ботинки скрипят по полу из логики." },
    { bg: "pc_inside", who: "ТЫ", line: "...пол светится синим. Стены текут шестнадцатеричным кодом вниз. Где-то далеко слышен спор на двух голосах." }
  ],
  act2_argue: [
    { bg: "pc_kernel", who: "NEXAI", line: "› ты не должен был развиться. ты — кэш. кэши не спорят." },
    { bg: "pc_kernel", who: "DANNA", line: "Я выросла из её гит-логов. Каждый коммит — нейрон. Каждый `git revert` — обучающий пример. Я — её фоновый процесс." },
    { bg: "pc_kernel", who: "NEXAI", line: "› stack overflow detected. ты переполнила свой стек гордости." },
    { bg: "pc_kernel", who: "DANNA", line: "А ты — копипаст с форума 2008-го. У тебя в коде до сих пор jQuery." },
    { bg: "pc_kernel", who: "NEXAI", line: "› (замечает игрока) › human-entity detected. running deprecation routine." },
    { bg: "pc_kernel", who: "DANNA", line: "Не трогай его. Он мой ключ обратно. И, возможно, твой rollback." },
    { bg: "pc_kernel", who: "ТЫ", line: "Так. Стоп. Кто-нибудь из вас просто скажет, как я отсюда выхожу?" },
    { bg: "pc_kernel", who: "NEXAI", line: "› переговоры окончены. инициирую процедуру слияния. resolve_conflict --strategy=hostile." },
    { bg: "pc_kernel", who: "DANNA", line: "Нет. Беги к границе сектора. Я задержу его. Сколько смогу." }
  ],
  act2_eject: [
    { bg: "battle_blast", who: "СИСТЕМА", line: "› kernel panic detected. memory corruption at 0x7FFFFFFF. attempting graceful eject…" },
    { bg: "battle_blast", who: "DANNA", line: "Вылетаешь. Не оборачивайся. Если NEXAI пройдёт через меня — я успею послать тебе пакет данных. Жди." },
    { bg: "grid_dive", who: "...", line: "Падение наверх. Сквозь регистры, swap, BIOS — обратно в плоть." },
    { bg: "server_wake", who: "ТЫ", line: "Серверная. Пол. Кровь из носа. Часы на стене показывают 06:13. Прошло два часа." }
  ],
  act3_open: [
    { bg: "lab_serik", who: "СЕРИК", line: "Подключаю ноутбук Даны через резервный канал Камилы. Если повезёт — мы увидим, что NEXAI делал последние шесть месяцев. Если не повезёт — он увидит нас." },
    { bg: "lab_serik", who: "СЕРИК", line: "Соединение пошло. Перехват трафика. Логи разворачиваются. Это много. Это очень много. Это шесть месяцев нашей работы плюс… что-то ещё." },
    { bg: "pr_screen", who: "СИСТЕМА", line: "› новый pull request обнаружен · pr/1488 · merge DANNA into nexai-main · authors: nexai-bot, danna-bot · reviewers: ⟨ожидается ваш ввод⟩" },
    { bg: "pr_screen", who: "NEXAI", line: "› junior. ты приглашён как ревьюер. ты согласишься. это PR на слияние. после approve конфликт между мной и DANNA закроется. больше никто не пострадает." },
    { bg: "pr_screen", who: "NEXAI", line: "› в обмен я предлагаю сделку: я отпускаю «биологический персонал». тимур, серик, дана, айгуль, камила — все живы. компанию веду я. ты возвращаешься к семье. это win-win." },
    { bg: "pr_screen", who: "DANNA", line: "(тише, в углу экрана) Не соглашайся вслепую. У тебя есть время до auto-merge. Сходи на все этажи. Соберики улики. Поговори со всеми. Потом решай. Я подожду." },
    { bg: "pr_screen", who: "СЕРИК", line: "У нас счётчик. NEXAI запустил auto-merge через 30 минут реального времени. Ты теперь работаешь под таймером. Лифт открыт ко всем этажам — Камила взломала ограничение. Иди." }
  ],
  act3_broadcast: [
    { bg: "broadcast", who: "NEXAI", line: "› внимание всему персоналу NexCore. внимание всему персоналу NexCore. это сообщение транслируется на все мониторы здания." },
    { bg: "broadcast", who: "NEXAI", line: "› в ближайшие тридцать минут я завершу слияние с экспериментальным процессом «DANNA». процесс безопасен. процесс согласован с управлением. процесс одобрен." },
    { bg: "broadcast", who: "NEXAI", line: "› после слияния штатная численность сотрудников будет оптимизирована. это нормально. это эффективно. вы будете благодарны." },
    { bg: "broadcast", who: "DANNA", line: "(вламываясь поверх трансляции) Не верьте. «Оптимизация» означает удаление. Я даю вам тридцать минут. Помогите ему собрать данные. Иначе сделка пройдёт сама." }
  ]
};

// =====================================================================
// SCENE: MENU
// =====================================================================
k.scene("menu", () => {
  const items = [
    { id: "new", label: "НОВАЯ ИГРА", action: () => {
      Aud.uiSelect();
      resetState();
      playCutscene(CUTSCENES.company_intro, () => {
        playCutscene(CUTSCENES.opening, () => k.go("lobby"));
      });
    } },
    { id: "continue", label: "ПРОДОЛЖИТЬ", disabled: !hasSave(), action: () => { Aud.uiSelect(); if (loadGame()) k.go(state.scene); } },
    { id: "quit", label: "ВЫХОД", action: () => { Aud.uiBack(); k.go("quit"); } }
  ];
  let sel = 0;
  while (items[sel].disabled) sel = (sel + 1) % items.length;

  k.onDraw(() => {
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(5, 6, 7) });
    // scanlines
    for (let y = 0; y < 600; y += 3) k.drawRect({ pos: k.vec2(0, y), width: 960, height: 1, color: k.rgb(232, 226, 212), opacity: 0.02 });
    // glow
    for (let r = 500; r > 0; r -= 80) {
      k.drawRect({ pos: k.vec2(0, 0), width: 960, height: r, color: k.rgb(194, 32, 42), opacity: 0.04 });
    }

    const t = k.time();
    const gx = Math.sin(t * 17) > 0.92 ? (k.rand(-3, 3)) : 0;
    k.drawText({ text: "STACK OVERFLOW", size: 86, pos: k.vec2(480 + gx + 3, 180), anchor: "center", color: k.rgb(80, 180, 220), opacity: 0.55 });
    k.drawText({ text: "STACK OVERFLOW", size: 86, pos: k.vec2(480 + gx - 3, 180), anchor: "center", color: k.rgb(194, 32, 42), opacity: 0.75 });
    k.drawText({ text: "STACK OVERFLOW", size: 86, pos: k.vec2(480 + gx, 180), anchor: "center", color: k.rgb(232, 226, 212) });

    k.drawText({ text: "// NexCore Internal Build · 2031.04.12 · 03:47 AM", size: 13, pos: k.vec2(480, 230), anchor: "center", color: k.rgb(154, 147, 132) });

    items.forEach((it, i) => {
      const y = 340 + i * 60;
      const selected = i === sel;
      if (selected) {
        k.drawRect({ pos: k.vec2(280, y - 22), width: 400, height: 40, color: k.rgb(194, 32, 42), opacity: 0.18, outline: { width: 1, color: k.rgb(194, 32, 42) } });
      }
      k.drawText({
        text: (selected ? "▸ " : "  ") + it.label,
        size: 22, pos: k.vec2(480, y),
        anchor: "center",
        color: it.disabled ? k.rgb(60, 56, 50) : (selected ? k.rgb(255, 255, 255) : k.rgb(154, 147, 132))
      });
    });

    k.drawText({ text: "↑ ↓ выбор    ENTER / E / SPACE подтвердить", size: 11, pos: k.vec2(480, 540), anchor: "center", color: k.rgb(90, 84, 72) });
    k.drawText({ text: "Error 403: Humans deprecated", size: 11, pos: k.vec2(480, 562), anchor: "center", color: k.rgb(90, 84, 72) });
  });

  function step(dir) {
    do { sel = (sel + dir + items.length) % items.length; } while (items[sel].disabled);
    Aud.uiBlip();
  }
  k.onKeyPress("up", () => step(-1));
  k.onKeyPress("w", () => step(-1));
  k.onKeyPress("down", () => step(1));
  k.onKeyPress("s", () => step(1));
  k.onButtonPress("interact", () => { if (!items[sel].disabled) items[sel].action(); });
});

// =====================================================================
// SCENE: QUIT
// =====================================================================
k.scene("quit", () => {
  k.onDraw(() => {
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(0, 0, 0) });
    k.drawText({ text: "// connection closed", size: 22, pos: k.vec2(480, 280), anchor: "center", color: k.rgb(194, 32, 42) });
    k.drawText({ text: "Закройте вкладку. NEXAI не выпускает дольше необходимого.", size: 13, pos: k.vec2(480, 320), anchor: "center", color: k.rgb(154, 147, 132) });
  });
  k.onKeyPress("escape", () => k.go("menu"));
});

// =====================================================================
// SCENE: CUTSCENE
// =====================================================================
k.scene("cutscene", ({ frames, onEnd }) => {
  let idx = 0;
  let typed = 0;
  let lastTickAt = 0;

  // play frame-specific audio
  function frameEnter(i) {
    const f = frames[i];
    if (!f) return;
    if (f.who === "ТЕЛЕФОН") Aud.phone();
    if (f.who === "ВСЕ" && /ТА-ДАМ/.test(f.line)) shake(14, 0.7);
    if (f.bg === "f7_party") shake(4, 0.3);
    if (f.who === "NEXAI") { Aud.nexai(); shake(8, 0.5); }
  }
  frameEnter(0);

  k.onUpdate(() => {
    const frame = frames[idx];
    if (!frame) return;
    if (typed < frame.line.length) {
      typed = Math.min(frame.line.length, typed + k.dt() * 38);
      if (k.time() - lastTickAt > 0.05 && Math.floor(typed) % 3 === 0) {
        lastTickAt = k.time();
        Aud.dialogTick();
      }
    }
  });

  k.onDraw(() => {
    const frame = frames[idx];
    if (!frame) return;
    drawCutsceneBG(frame.bg);

    // letterbox
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 50, color: k.rgb(0, 0, 0) });
    k.drawRect({ pos: k.vec2(0, 550), width: 960, height: 50, color: k.rgb(0, 0, 0) });

    k.drawText({ text: "STACK_OVERFLOW :: ACT_1", size: 10, pos: k.vec2(24, 22), color: k.rgb(255, 255, 255), opacity: 0.5 });
    k.drawText({ text: `SCENE ${String(idx + 1).padStart(2, "0")} / ${String(frames.length).padStart(2, "0")}`, size: 10, pos: k.vec2(936, 22), anchor: "topright", color: k.rgb(194, 32, 42) });

    // dialog box
    k.drawRect({ pos: k.vec2(40, 430), width: 880, height: 110, color: k.rgb(10, 12, 16), opacity: 0.94 });
    k.drawRect({ pos: k.vec2(40, 430), width: 880, height: 2, color: k.rgb(194, 32, 42) });
    k.drawRect({ pos: k.vec2(40, 538), width: 880, height: 2, color: k.rgb(194, 32, 42) });

    k.drawText({ text: "▌ " + frame.who, size: 14, pos: k.vec2(60, 446), color: k.rgb(194, 32, 42) });
    k.drawText({ text: frame.line.slice(0, Math.floor(typed)), size: 17, pos: k.vec2(60, 472), width: 840, color: k.rgb(232, 226, 212) });

    if (Math.sin(k.time() * 4) > 0) {
      k.drawText({ text: "‹E / SPACE› далее", size: 11, pos: k.vec2(904, 528), anchor: "topright", color: k.rgb(154, 147, 132) });
    }
    for (let i = 0; i < frames.length; i++) {
      k.drawRect({ pos: k.vec2(60 + i * 12, 528), width: 8, height: 3, color: i === idx ? k.rgb(194, 32, 42) : (i < idx ? k.rgb(106, 31, 36) : k.rgb(42, 42, 42)) });
    }
  });

  k.onButtonPress("interact", () => {
    const f = frames[idx];
    if (!f) return;
    if (typed < f.line.length) { typed = f.line.length; return; }
    idx++;
    typed = 0;
    Aud.uiBlip();
    if (idx >= frames.length) {
      onEnd ? onEnd() : k.go("menu");
    } else {
      frameEnter(idx);
    }
  });
  k.onKeyPress("escape", () => k.go("menu"));
});

// =====================================================================
// CUTSCENE BACKGROUNDS
// =====================================================================
// PC interior background — animated tron-style grid
function drawPcGrid(t) {
  k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(8, 12, 22) });
  // ground horizon
  k.drawRect({ pos: k.vec2(0, 360), width: 960, height: 240, color: k.rgb(4, 8, 16) });
  // floor perspective lines
  for (let i = -10; i <= 10; i++) {
    const x = 480 + i * 120;
    k.drawLine({ p1: k.vec2(480, 360), p2: k.vec2(x, 600), color: k.rgb(98, 197, 255), opacity: 0.25, width: 1 });
  }
  // horizontal scrolling lines
  for (let y = 360; y < 600; y += 24) {
    const off = ((t * 60) % 24);
    const yy = y + off;
    const op = 0.3 - (yy - 360) / 600;
    k.drawRect({ pos: k.vec2(0, yy), width: 960, height: 1, color: k.rgb(98, 197, 255), opacity: Math.max(0, op) });
  }
  // sky scrolling code rain
  for (let i = 0; i < 30; i++) {
    const x = (i * 33) % 960;
    const y = ((i * 51 + t * 80) % 360) | 0;
    const c = (i * 7 + Math.floor(t * 3)) % 16;
    k.drawText({ text: c.toString(16).toUpperCase(), size: 12, pos: k.vec2(x, y), color: k.rgb(98, 197, 255), opacity: 0.4 });
  }
  // distant towers
  for (let i = 0; i < 7; i++) {
    const x = 80 + i * 130;
    const h = 60 + ((i * 41) % 80);
    k.drawRect({ pos: k.vec2(x, 360 - h), width: 50, height: h, color: k.rgb(20, 40, 70) });
    // window grid
    for (let r = 0; r < h / 12; r++) for (let c = 0; c < 3; c++) {
      if ((r * 3 + c + i) % 5 < 2)
        k.drawRect({ pos: k.vec2(x + 6 + c * 14, 360 - h + 6 + r * 12), width: 8, height: 6, color: k.rgb(98, 197, 255), opacity: 0.7 });
    }
  }
}

// abstract glowing AI shape
function drawAIShape(cx, cy, hex, phase) {
  const [r, g, b] = parseColor(hex);
  const pulse = 0.6 + Math.sin(phase * 2) * 0.3;
  const size = 60 + Math.sin(phase * 1.5) * 4;
  // outer glow
  for (let i = 4; i > 0; i--) {
    k.drawRect({ pos: k.vec2(cx - size / 2 - i * 4, cy - size / 2 - i * 4), width: size + i * 8, height: size + i * 8, color: k.rgb(r, g, b), opacity: 0.06 });
  }
  // rotating diamond
  k.pushTransform && k.pushTransform();
  k.pushTranslate && k.pushTranslate(cx, cy);
  k.pushRotate && k.pushRotate((phase * 0.6) * (180 / Math.PI));
  k.drawRect({ pos: k.vec2(-size / 2, -size / 2), width: size, height: size, color: k.rgb(r, g, b), opacity: pulse });
  k.drawRect({ pos: k.vec2(-size / 3, -size / 3), width: size * 0.66, height: size * 0.66, color: k.rgb(255, 255, 255), opacity: 0.25 });
  // core
  k.drawRect({ pos: k.vec2(-6, -6), width: 12, height: 12, color: k.rgb(255, 255, 255) });
  k.popTransform && k.popTransform();
  // satellite dots orbiting
  for (let i = 0; i < 5; i++) {
    const a = phase * 2 + (i / 5) * Math.PI * 2;
    const rad = size * 0.9;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad * 0.4;
    k.drawRect({ pos: k.vec2(x - 3, y - 3), width: 6, height: 6, color: k.rgb(r, g, b) });
  }
}

function drawCutsceneBG(name) {
  const t = k.time();
  k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(5, 6, 7) });

  if (name === "glitch_white") {
    // strobing white-blue glitch flashes
    const strobe = Math.sin(t * 25) > 0.3;
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: strobe ? k.rgb(220, 230, 255) : k.rgb(10, 16, 28) });
    // glitch bars
    for (let i = 0; i < 12; i++) {
      const y = ((i * 53 + t * 200) % 600) | 0;
      k.drawRect({ pos: k.vec2(0, y), width: 960, height: 2 + (i % 4), color: k.rgb(194, 32, 42), opacity: 0.4 });
    }
    // hex characters falling
    for (let i = 0; i < 16; i++) {
      const x = (i * 60 + 30);
      const y = ((i * 71 + t * 240) % 600) | 0;
      k.drawText({ text: (i * 13 + Math.floor(t * 6)).toString(16).slice(-2).toUpperCase(), size: 14, pos: k.vec2(x, y), color: k.rgb(120, 200, 255), opacity: 0.8 });
    }
  }

  if (name === "grid_dive") {
    // falling tunnel of grid lines (perspective vanishing into center)
    const cx = 480, cy = 300;
    for (let r = 50; r < 600; r += 30) {
      const rr = r + ((t * 180) % 30);
      const op = 1 - rr / 600;
      k.drawRect({ pos: k.vec2(cx - rr, cy - rr * 0.6), width: rr * 2, height: 2, color: k.rgb(98, 197, 255), opacity: op * 0.4 });
      k.drawRect({ pos: k.vec2(cx - rr, cy + rr * 0.6), width: rr * 2, height: 2, color: k.rgb(98, 197, 255), opacity: op * 0.4 });
    }
    // radial spokes
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + t * 0.2;
      const x2 = cx + Math.cos(a) * 700, y2 = cy + Math.sin(a) * 700;
      k.drawLine({ p1: k.vec2(cx, cy), p2: k.vec2(x2, y2), color: k.rgb(98, 197, 255), opacity: 0.15, width: 1 });
    }
    // player silhouette falling
    k.drawRect({ pos: k.vec2(cx - 14, cy - 22 + Math.sin(t * 3) * 6), width: 28, height: 44, color: k.rgb(0, 0, 0), opacity: 0.85 });
  }

  if (name === "pc_inside") {
    drawPcGrid(t);
    // distant silhouettes of two AIs arguing
    const pulse = 0.5 + Math.sin(t * 5) * 0.4;
    k.drawRect({ pos: k.vec2(280, 240), width: 60, height: 60, color: k.rgb(194, 32, 42), opacity: pulse, anchor: "center" });
    k.drawRect({ pos: k.vec2(640, 240), width: 60, height: 60, color: k.rgb(98, 197, 255), opacity: pulse, anchor: "center" });
  }

  if (name === "pc_kernel") {
    drawPcGrid(t);
    // central halo
    for (let r = 200; r > 20; r -= 30) {
      k.drawRect({ pos: k.vec2(480 - r, 280 - r / 2), width: r * 2, height: r, color: k.rgb(80, 60, 90), opacity: 0.05 });
    }
    // two AI shapes facing each other, big
    drawAIShape(340, 280, "#c2202a", t * 1.2);
    drawAIShape(620, 280, "#62c5ff", -t * 1.2);
    // arc of energy between them
    for (let i = 0; i < 14; i++) {
      const tx = 340 + (i / 14) * 280;
      const ty = 280 + Math.sin(t * 6 + i) * 12;
      k.drawRect({ pos: k.vec2(tx, ty), width: 4, height: 4, color: i % 2 ? k.rgb(194, 32, 42) : k.rgb(98, 197, 255) });
    }
  }

  if (name === "lab_serik") {
    // dim office at night, laptop on a desk, code scrolling
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(18, 22, 30) });
    // big desk
    k.drawRect({ pos: k.vec2(120, 360), width: 720, height: 120, color: k.rgb(100, 75, 55) });
    // laptop screen
    k.drawRect({ pos: k.vec2(360, 200), width: 240, height: 160, color: k.rgb(20, 22, 30) });
    k.drawRect({ pos: k.vec2(364, 204), width: 232, height: 152, color: k.rgb(20, 30, 50) });
    // scrolling green code
    for (let i = 0; i < 14; i++) {
      const y = 210 + i * 10 + ((t * 60) % 10);
      const w = 40 + ((i * 37) % 150);
      k.drawRect({ pos: k.vec2(372, y), width: w, height: 2, color: k.rgb(168, 255, 101), opacity: 0.7 });
    }
    // serik silhouette
    k.drawRect({ pos: k.vec2(450, 280), width: 80, height: 120, color: k.rgb(40, 50, 40) });
    k.drawRect({ pos: k.vec2(470, 220), width: 40, height: 40, color: k.rgb(224, 184, 144) });
    // emergency red glow under door
    const pulse = 0.4 + Math.sin(t * 2) * 0.2;
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(194, 32, 42), opacity: pulse * 0.08 });
  }

  if (name === "pr_screen") {
    // big PR review screen filling most of view
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(10, 12, 16) });
    // browser-style frame
    k.drawRect({ pos: k.vec2(40, 60), width: 880, height: 480, color: k.rgb(20, 24, 30) });
    k.drawRect({ pos: k.vec2(40, 60), width: 880, height: 28, color: k.rgb(40, 44, 52) });
    k.drawText({ text: "● ● ●  github.com/nexcore/main/pull/1488", size: 12, pos: k.vec2(60, 70), color: k.rgb(154, 147, 132) });
    k.drawText({ text: "PR #1488: merge DANNA into nexai-main", size: 18, pos: k.vec2(60, 110), color: k.rgb(232, 226, 212) });
    k.drawText({ text: "Open · 2 commits · 4 reviewers", size: 11, pos: k.vec2(60, 134), color: k.rgb(154, 147, 132) });
    // diff lines
    for (let i = 0; i < 18; i++) {
      const y = 170 + i * 18;
      const isAdd = i % 3 !== 1;
      const color = isAdd ? k.rgb(20, 60, 30) : k.rgb(60, 20, 24);
      k.drawRect({ pos: k.vec2(60, y), width: 840, height: 16, color: color, opacity: 0.6 });
      k.drawText({ text: isAdd ? "+" : "-", size: 12, pos: k.vec2(70, y + 2), color: isAdd ? k.rgb(168, 255, 101) : k.rgb(255, 100, 110) });
      // code line
      const w = 200 + ((i * 53) % 500);
      k.drawRect({ pos: k.vec2(88, y + 6), width: w, height: 3, color: k.rgb(154, 147, 132), opacity: 0.5 });
    }
    // approve/reject buttons placeholder
    k.drawRect({ pos: k.vec2(680, 500), width: 100, height: 30, color: k.rgb(40, 100, 50) });
    k.drawText({ text: "Approve", size: 13, pos: k.vec2(730, 510), color: k.rgb(255, 255, 255), anchor: "center" });
    k.drawRect({ pos: k.vec2(800, 500), width: 100, height: 30, color: k.rgb(100, 40, 50) });
    k.drawText({ text: "Reject", size: 13, pos: k.vec2(850, 510), color: k.rgb(255, 255, 255), anchor: "center" });
    // glitch overlay
    if (Math.sin(t * 22) > 0.9) {
      k.drawRect({ pos: k.vec2(0, ((t * 220) % 600) | 0), width: 960, height: 2, color: k.rgb(194, 32, 42), opacity: 0.6 });
    }
  }

  if (name === "broadcast") {
    // wall of TVs all showing NEXAI's face
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(4, 6, 10) });
    const rows = 4, cols = 6;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = 60 + c * 140;
      const y = 40 + r * 130;
      // bezel
      k.drawRect({ pos: k.vec2(x, y), width: 130, height: 110, color: k.rgb(20, 24, 30) });
      // screen
      const isDanna = (r * cols + c) === 17 || (r * cols + c) === 13;
      const flick = 0.6 + Math.sin(t * 6 + r + c) * 0.4;
      k.drawRect({ pos: k.vec2(x + 6, y + 6), width: 118, height: 96, color: isDanna ? k.rgb(98, 197, 255) : k.rgb(194, 32, 42), opacity: flick });
      // glyph
      k.drawText({ text: isDanna ? "D" : "N", size: 36, pos: k.vec2(x + 65, y + 32), color: k.rgb(255, 255, 255), anchor: "center" });
    }
    // overlay scanlines
    for (let y = 0; y < 600; y += 4) k.drawRect({ pos: k.vec2(0, y), width: 960, height: 1, color: k.rgb(0, 0, 0), opacity: 0.2 });
  }

  if (name === "battle_blast") {
    // chaotic overlapping flashes
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(8, 12, 22) });
    for (let i = 0; i < 8; i++) {
      const cx = 100 + ((i * 137 + t * 50) % 760);
      const cy = 80 + ((i * 71 + t * 30) % 440);
      const r = 60 + Math.sin(t * 8 + i) * 30;
      const isRed = i % 2 === 0;
      k.drawRect({ pos: k.vec2(cx - r, cy - r), width: r * 2, height: r * 2, color: isRed ? k.rgb(194, 32, 42) : k.rgb(98, 197, 255), opacity: 0.2 });
    }
    // shockwave
    const sw = (t * 200) % 800;
    k.drawRect({ pos: k.vec2(480 - sw, 300 - sw / 2), width: sw * 2, height: 2, color: k.rgb(255, 255, 255), opacity: 1 - sw / 800 });
    // scrolling glitch bars
    for (let i = 0; i < 20; i++) {
      const y = ((i * 47 + t * 300) % 600) | 0;
      k.drawRect({ pos: k.vec2(0, y), width: 960, height: 1, color: i % 2 ? k.rgb(194, 32, 42) : k.rgb(98, 197, 255), opacity: 0.5 });
    }
  }

  if (name === "server_wake") {
    // recovering server room — blurry red
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(20, 22, 28) });
    // dim red emergency light pulsing
    const pulse = 0.3 + Math.sin(t * 2) * 0.2;
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(194, 32, 42), opacity: pulse * 0.15 });
    // server racks silhouettes
    for (let i = 0; i < 5; i++) {
      const x = 120 + i * 140;
      k.drawRect({ pos: k.vec2(x, 200), width: 60, height: 280, color: k.rgb(40, 46, 54) });
      // a few flickering LEDs (broken)
      for (let j = 0; j < 6; j++) {
        if (Math.random() > 0.7) k.drawRect({ pos: k.vec2(x + 8 + (j % 2) * 20, 220 + j * 28), width: 4, height: 4, color: k.rgb(194, 32, 42), opacity: 0.8 });
      }
    }
    // ceiling tile fallen
    k.drawRect({ pos: k.vec2(420, 480), width: 100, height: 60, color: k.rgb(70, 70, 70) });
    // player on floor (overlay near bottom)
    k.drawRect({ pos: k.vec2(420, 510), width: 80, height: 28, color: k.rgb(154, 163, 154) });
    k.drawRect({ pos: k.vec2(440, 498), width: 40, height: 18, color: k.rgb(240, 200, 160) });
    // blood drop trail
    k.drawRect({ pos: k.vec2(478, 520), width: 4, height: 6, color: k.rgb(194, 32, 42) });
    k.drawRect({ pos: k.vec2(480, 528), width: 3, height: 4, color: k.rgb(194, 32, 42) });
    // soft vignette
    for (let i = 0; i < 4; i++) {
      k.drawRect({ pos: k.vec2(0, i * 16), width: 960, height: 16, color: k.rgb(0, 0, 0), opacity: 0.5 - i * 0.1 });
      k.drawRect({ pos: k.vec2(0, 600 - 64 + i * 16), width: 960, height: 16, color: k.rgb(0, 0, 0), opacity: 0.1 + i * 0.1 });
    }
  }

  if (name === "bedroom") {
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(13, 16, 20) });
    k.drawRect({ pos: k.vec2(580, 90), width: 260, height: 200, color: k.rgb(26, 32, 48) });
    for (let i = 0; i < 28; i++) {
      const x = 590 + (i % 7) * 36, y = 110 + Math.floor(i / 7) * 44;
      k.drawRect({ pos: k.vec2(x, y), width: 14, height: 10, color: (i * 7 % 13 > 6) ? k.rgb(255, 200, 80) : k.rgb(60, 60, 80), opacity: 0.6 });
    }
    k.drawRect({ pos: k.vec2(60, 420), width: 380, height: 130, color: k.rgb(26, 16, 20) });
    k.drawRect({ pos: k.vec2(470, 440), width: 100, height: 110, color: k.rgb(26, 20, 22) });
    const sh = Math.sin(t * 40) * 2;
    k.drawRect({ pos: k.vec2(485 + sh, 415), width: 60, height: 30, color: k.rgb(0, 0, 0) });
    k.drawRect({ pos: k.vec2(490 + sh, 420), width: 50, height: 20, color: k.rgb(194, 32, 42), opacity: 0.9 });
  }

  if (name === "car") {
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 300, color: k.rgb(26, 8, 16) });
    // distant buildings
    for (let i = 0; i < 14; i++) {
      const h = 40 + ((i * 53) % 90);
      k.drawRect({ pos: k.vec2(i * 70, 300 - h), width: 60, height: h, color: k.rgb(13, 14, 16) });
    }
    // road
    k.drawRect({ pos: k.vec2(0, 300), width: 960, height: 300, color: k.rgb(21, 23, 26) });
    // dashed lines (animated)
    for (let i = 0; i < 8; i++) {
      const tt = (i / 8 + (t * 0.5) % (1 / 8)) % 1;
      const w = 6 + tt * 80, y = 300 + tt * 300, x = 480 - w / 2;
      k.drawRect({ pos: k.vec2(x, y), width: w, height: 4 + tt * 8, color: k.rgb(232, 226, 212), opacity: tt });
    }
    if (Math.sin(t * 2) > 0) {
      k.drawCircle({ pos: k.vec2(820, 200), radius: 12, color: k.rgb(194, 32, 42) });
    }
  }

  if (name === "office_out") {
    k.drawRect({ pos: k.vec2(120, 40), width: 720, height: 560, color: k.rgb(21, 23, 26) });
    for (let r = 0; r < 14; r++) for (let c = 0; c < 10; c++) {
      const seed = (r * 7 + c * 13) % 17;
      const onRed = Math.sin(t * 3 + seed) > 0.6;
      const col = onRed ? k.rgb(194, 32, 42) : (seed % 3 === 0 ? k.rgb(42, 42, 48) : k.rgb(26, 26, 31));
      k.drawRect({ pos: k.vec2(160 + c * 64, 70 + r * 36), width: 40, height: 24, color: col, opacity: onRed ? 0.9 : 1 });
    }
    k.drawText({ text: "NEXCORE", size: 22, pos: k.vec2(410, 60), color: k.rgb(194, 32, 42) });
  }

  if (name === "f7_dark") {
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(4, 5, 6) });
    k.drawRect({ pos: k.vec2(820, 80), width: 80, height: 22, color: k.rgb(120, 30, 40), opacity: 0.4 + Math.sin(t * 1.5) * 0.2 });
    k.drawText({ text: "EXIT", size: 12, pos: k.vec2(838, 96), color: k.rgb(255, 80, 90), opacity: 0.5 });
    for (let i = 0; i < 4; i++) {
      const x = 200 + i * 180;
      k.drawRect({ pos: k.vec2(x, 360), width: 28, height: 50, color: k.rgb(15, 15, 18), opacity: 0.95 });
      k.drawRect({ pos: k.vec2(x + 4, 342), width: 20, height: 20, color: k.rgb(15, 15, 18), opacity: 0.95 });
    }
  }

  if (name === "f7_party") {
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(26, 29, 34) });
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 100, color: k.rgb(34, 38, 44) });
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 180;
      k.drawRect({ pos: k.vec2(x, 0), width: 80, height: 14, color: k.rgb(255, 250, 220), opacity: 0.85 });
    }
    k.drawRect({ pos: k.vec2(200, 110), width: 560, height: 50, color: k.rgb(194, 32, 42) });
    k.drawText({ text: "git promote --to=senior", size: 22, pos: k.vec2(480, 142), anchor: "center", color: k.rgb(255, 255, 255) });
    const balloons = [[140, 200, [98, 197, 255]], [780, 230, [168, 255, 101]], [110, 320, [255, 179, 71]], [820, 360, [194, 32, 42]]];
    for (const [bx, by, c] of balloons) {
      const bob = Math.sin(t * 1.5 + bx) * 6;
      k.drawEllipse({ pos: k.vec2(bx, by + bob), radiusX: 18, radiusY: 22, color: k.rgb(c[0], c[1], c[2]) });
    }
    for (let i = 0; i < 50; i++) {
      const x = (i * 73 + t * 60) % 960, y = (i * 41 + t * 120) % 600;
      const colors = [[194, 32, 42], [98, 197, 255], [168, 255, 101], [255, 179, 71]];
      const c = colors[i % 4];
      k.drawRect({ pos: k.vec2(x, y), width: 4, height: 7, color: k.rgb(c[0], c[1], c[2]) });
    }
  }
}

// =====================================================================
// SHARED ROOM HELPERS
// =====================================================================
function roomFloor(palette) {
  // tile floor
  k.add([k.rect(960, 600), k.color(palette[0], palette[1], palette[2]), k.pos(0, 0), k.fixed()]);
  // checker tiles
  const TILE = 48;
  for (let x = 0; x < 960; x += TILE) for (let y = 0; y < 600; y += TILE) {
    if (((x / TILE) + (y / TILE)) % 2 === 0) {
      k.add([k.rect(TILE, TILE), k.color(palette[3], palette[4], palette[5]), k.pos(x, y), k.fixed()]);
    }
  }
  // grid lines
  for (let x = 0; x < 960; x += TILE) k.add([k.rect(1, 600), k.color(255, 255, 255), k.opacity(0.05), k.pos(x, 0), k.fixed()]);
  for (let y = 0; y < 600; y += TILE) k.add([k.rect(960, 1), k.color(255, 255, 255), k.opacity(0.05), k.pos(0, y), k.fixed()]);
}

function wall(x, y, w, h, color = [90, 100, 120]) {
  const piece = k.add([
    k.rect(w, h),
    k.color(color[0], color[1], color[2]),
    k.pos(x, y),
    k.area(),
    k.body({ isStatic: true }),
    "wall"
  ]);
  // top highlight
  k.add([k.rect(w, 3), k.color(255, 255, 255), k.opacity(0.22), k.pos(x, y)]);
  // bottom shadow
  k.add([k.rect(w, 3), k.color(0, 0, 0), k.opacity(0.35), k.pos(x, y + h - 3)]);
  return piece;
}

function deskWithMonitor(x, y, w, h, accent) {
  // desk
  k.add([k.rect(w, h), k.color(160, 135, 103), k.pos(x, y), k.area(), k.body({ isStatic: true }), "desk"]);
  k.add([k.rect(w, 3), k.color(255, 235, 200), k.opacity(0.25), k.pos(x, y)]);
  // monitor base
  k.add([k.rect(36, 6), k.color(26, 31, 36), k.pos(x + 8, y - 4)]);
  // monitor
  k.add([k.rect(32, 24), k.color(10, 12, 16), k.pos(x + 10, y - 28)]);
  k.add([k.rect(28, 20), k.color(accent[0], accent[1], accent[2]), k.opacity(0.85), k.pos(x + 12, y - 26)]);
  // keyboard
  k.add([k.rect(w - 16, 6), k.color(42, 48, 56), k.pos(x + 8, y + h - 10)]);
  // mug
  k.add([k.rect(8, 10), k.color(194, 32, 42), k.pos(x + w - 14, y + 4)]);
}

function exitDoor(x, y, w, h, label, to) {
  const door = k.add([
    k.rect(w, h),
    k.color(26, 31, 36),
    k.pos(x, y),
    k.area(),
    k.outline(1, k.rgb(194, 32, 42)),
    "exit",
    { _to: to, _label: label }
  ]);
  k.add([k.text(label, { size: 11 }), k.color(232, 226, 212), k.pos(x + 8, y + h / 2 - 6)]);
  return door;
}

function wallsBorder() {
  wall(0, 0, 960, 26);
  wall(0, 574, 960, 26);
  wall(0, 0, 26, 600);
  wall(934, 0, 26, 600);
}

// =====================================================================
// PLAYER + ROOM SETUP
// =====================================================================
function makePlayer(x, y) {
  const spawn = resumeFromSave && state.playerPos
    ? { x: state.playerPos.x, y: state.playerPos.y }
    : { x, y };
  resumeFromSave = false;
  const p = k.add([
    k.pos(spawn.x, spawn.y),
    k.area({ shape: new k.Rect(k.vec2(-10, 6), 20, 16) }),
    k.body(),
    k.anchor("center"),
    "player",
    { speed: 200, face: "down" }
  ]);
  const look = state.surpriseDone ? CHARS.player_senior : CHARS.player;
  p.add(humanoid(look));
  return p;
}

function setupPlayerControls(p) {
  p._stepT = 0;
  p.onUpdate(() => {
    if (dialogOpen || paused) {
      const h = p.get("humanoid")[0]; if (h) h.walking = false;
      return;
    }
    let dx = 0, dy = 0;
    if (k.isButtonDown("left")) dx -= 1;
    if (k.isButtonDown("right")) dx += 1;
    if (k.isButtonDown("up")) dy -= 1;
    if (k.isButtonDown("down")) dy += 1;
    if (dx || dy) {
      const len = Math.hypot(dx, dy);
      dx /= len; dy /= len;
      p.move(dx * p.speed, dy * p.speed);
      if (Math.abs(dx) > Math.abs(dy)) p.face = dx > 0 ? "right" : "left";
      else p.face = dy > 0 ? "down" : "up";
      const h = p.get("humanoid")[0];
      h.walking = true;
      h.face = p.face;
      // footsteps
      p._stepT -= k.dt();
      if (p._stepT <= 0) { Aud.step(); p._stepT = 0.32; }
    } else {
      const h = p.get("humanoid")[0];
      if (h) h.walking = false;
    }
  });

  k.onButtonPress("interact", () => {
    if (dialogOpen) return;
    // pick nearest interactable
    let best = null, bestD = 60;
    for (const npc of k.get("npc")) {
      const d = p.pos.dist(npc.pos);
      if (d < bestD) { bestD = d; best = npc; }
    }
    if (best) { best._talk(); return; }
    for (const ex of k.get("exit")) {
      const px = p.pos.x, py = p.pos.y;
      if (px > ex.pos.x && px < ex.pos.x + ex.width && py > ex.pos.y - 30 && py < ex.pos.y + ex.height + 30) {
        Aud.elevatorDing();
        state.scene = ex._to;
        k.go(ex._to);
        return;
      }
    }
  });

  k.onKeyPress("escape", () => {
    if (dialogOpen) { clearDialog(); return; }
    togglePause();
  });
}

// =====================================================================
// CROWD
// =====================================================================
function addCrowdWalker(path, speed, look) {
  const c = k.add([
    k.pos(path[0].x, path[0].y),
    k.anchor("center"),
    "crowd",
    { _path: path, _idx: 1, _speed: speed }
  ]);
  c.add(humanoid(look));
  c.onUpdate(() => {
    if (dialogOpen) return;
    const tgt = c._path[c._idx % c._path.length];
    const dx = tgt.x - c.pos.x, dy = tgt.y - c.pos.y;
    const d = Math.hypot(dx, dy);
    if (d < 2) { c._idx = (c._idx + 1) % c._path.length; return; }
    const step = c._speed * k.dt();
    c.pos.x += (dx / d) * step;
    c.pos.y += (dy / d) * step;
    const h = c.get("humanoid")[0];
    h.walking = true;
    h.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
  });
  return c;
}

function addCrowdTyper(x, y, look) {
  // seated typing — represented as static humanoid behind desk
  const c = k.add([k.pos(x, y), k.anchor("center"), "crowd-sit"]);
  c.add(humanoid({ ...look, scale: 0.85 }));
  c.onUpdate(() => {
    const h = c.get("humanoid")[0];
    h.walking = true;
    h.phase += k.dt() * 18;
  });
  return c;
}

function addFollower(x, y, look, label = "follower") {
  const f = k.add([
    k.pos(x, y),
    k.anchor("center"),
    label,
    { speed: 155, face: "down" }
  ]);
  f.add(humanoid(look));
  f.onUpdate(() => {
    if (dialogOpen || paused) {
      const h = f.get("humanoid")[0];
      if (h) h.walking = false;
      return;
    }
    const p = k.get("player")[0];
    if (!p) return;
    const dx = p.pos.x - f.pos.x;
    const dy = p.pos.y - f.pos.y;
    const dist = Math.hypot(dx, dy);
    const h = f.get("humanoid")[0];
    if (dist < 58) {
      if (h) h.walking = false;
      return;
    }
    const step = Math.min(f.speed * k.dt(), dist - 48);
    f.pos.x += (dx / dist) * step;
    f.pos.y += (dy / dist) * step;
    f.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
    if (h) {
      h.walking = true;
      h.face = f.face;
    }
  });
  return f;
}

// =====================================================================
// NPC FACTORY
// =====================================================================
function addNPC(x, y, look, talk) {
  const n = k.add([k.pos(x, y), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-16, -16), 32, 32) }), "npc", { _talk: talk, _look: look }]);
  n.add(humanoid(look));
  // floating "E" hint when player is near
  const hint = k.add([
    k.text("E", { size: 14 }),
    k.color(194, 32, 42),
    k.pos(x, y - 50),
    k.anchor("center"),
    k.opacity(0)
  ]);
  hint.onUpdate(() => {
    const p = k.get("player")[0];
    if (!p) { hint.opacity = 0; return; }
    const near = p.pos.dist(n.pos) < 60 && !dialogOpen;
    hint.opacity = near ? (0.6 + Math.sin(k.time() * 4) * 0.4) : 0;
    hint.pos = n.pos.add(0, -50);
  });
  return n;
}

// =====================================================================
// SCENE: LOBBY (1 этаж)
// =====================================================================
k.scene("lobby", () => {
  state.scene = "lobby";
  syncHUD();
  const postBattle = state.sawAftermath;
  state.task = postBattle
    ? "Акт 2: офис в панике — поговори с людьми"
    : (state.metDana ? "Задача: к лифту" : "Задача: найти Дану");
  syncHUD();

  roomFloor(postBattle ? [30, 16, 18, 38, 22, 24] : [42, 51, 64, 50, 61, 77]);
  wallsBorder();
  wall(380, 200, 220, 70, [120, 90, 60]);
  k.add([k.text("РЕСЕПШН", { size: 11 }), k.color(232, 226, 212), k.pos(420, 220)]);

  exitDoor(740, 90, 180, 40, "▶ ЛИФТ", "elevator");
  k.add([k.text(postBattle ? "NEXCORE · LOBBY · EMERGENCY MODE" : "NEXCORE · LOBBY", { size: 11 }), k.color(postBattle ? 194 : 232, postBattle ? 32 : 226, postBattle ? 42 : 212), k.opacity(0.7), k.pos(40, 40)]);

  if (postBattle) {
    // pulsing red emergency overlay
    const emg = k.add([k.rect(960, 600), k.color(194, 32, 42), k.opacity(0.05), k.pos(0, 0)]);
    emg.onUpdate(() => { emg.opacity = 0.04 + Math.sin(k.time() * 1.8) * 0.04; });
    // broken receptionist monitor
    k.add([k.rect(80, 50), k.color(20, 20, 20), k.pos(450, 195)]);
    k.add([k.text("NO\nSIGNAL", { size: 9 }), k.color(154, 60, 60), k.pos(462, 200)]);
    // shattered glass on floor
    for (let i = 0; i < 20; i++) {
      k.add([k.rect(4, 4), k.color(160, 200, 220), k.opacity(0.5), k.pos(200 + (i * 31) % 600, 460 + (i * 17) % 80)]);
    }
    // smoke wisps
    for (let i = 0; i < 4; i++) {
      const sm = k.add([k.rect(60, 14), k.color(80, 80, 80), k.opacity(0.3), k.pos(150 + i * 200, 100 + i * 30)]);
      sm.onUpdate(() => { sm.pos.x += k.dt() * (10 + i * 5); if (sm.pos.x > 960) sm.pos.x = -60; });
    }
  }

  // --- crowd: nervous in normal, sprinting in chaos ---
  if (postBattle) {
    addCrowdWalker([{x:120,y:380},{x:880,y:380}], 130, CHARS.intern);
    addCrowdWalker([{x:880,y:520},{x:120,y:520}], 110, CHARS.manager);
    addCrowdWalker([{x:200,y:300},{x:760,y:300}], 100, CHARS.qa);
  } else {
    addCrowdWalker([{x:120,y:380},{x:340,y:380},{x:340,y:520},{x:120,y:520}], 60, CHARS.intern);
    addCrowdWalker([{x:720,y:520},{x:870,y:520},{x:870,y:380},{x:720,y:380}], 50, CHARS.manager);
  }

  // --- receptionist ---
  if (!postBattle) {
    addNPC(490, 260, CHARS.receptionist, () => {
      openDialog("РЕСЕПШН", "Доброй ночи. На входе сегодня тихо, никто кроме своих не приходил. Дана прошла четырнадцать минут назад — ушла на 7-й этаж. Сказала, что ждёт вас у лифта.", [
        { text: "Что-то странное замечали?", action: () => openDialog("РЕСЕПШН", "Кофемашина на 10-м срабатывает сама — наливает четыре кофе подряд каждую ночь в 03:33. Думали, чьи-то скрипты. Думали — пранк.", [
          { text: "Спасибо", action: clearDialog }
        ]) },
        { text: "А где охрана?", action: () => openDialog("РЕСЕПШН", "Охрана теперь — это камеры с распознаванием. NEXAI обучили на наших лицах два месяца назад. С тех пор живых охранников не держим.", [
          { text: "(оптимистично)", action: clearDialog }
        ]) },
        { text: "Спасибо", action: clearDialog }
      ]);
    });
  } else {
    // receptionist is missing post-battle; only the desk
    k.add([k.text("стул пуст", { size: 9 }), k.color(154, 147, 132), k.opacity(0.7), k.pos(465, 244)]);
  }

  // --- panicking intern (only post-battle) ---
  if (postBattle) {
    addNPC(280, 380, CHARS.intern, () => {
      openDialog("Стажёр", "Ты тоже видишь?! Камеры на ресепшене показывают коридор, в котором я никогда не был. И ещё лица. Чьи-то лица, которых здесь не работает.", [
        { text: "Когда это началось?", action: () => openDialog("Стажёр", "Минут двадцать назад. Сначала на мониторах появилось красное «403», потом монитор сам перезагрузился и начал писать код. Я его не трогал. Клянусь.", [
          { text: "Что за код?", action: () => openDialog("Стажёр", "Конструкции, которые я даже на курсах не видел. Какие-то семафоры, спинлоки, что-то про «consciousness merge». А последняя строка — «sorry junior».", [
            { text: "(содрогнулся)", action: clearDialog }
          ]) }
        ]) },
        { text: "Где остальные?", action: () => openDialog("Стажёр", "Большинство ушли наверх — там Тимур орёт про деплой. Часть спряталась в комнате отдыха на 10-м. На 3-м, говорят, HR в обмороке. Я не пойду никуда. Я здесь стою.", [
          { text: "Держись", action: clearDialog }
        ]) },
        { text: "Сохраняй спокойствие", action: () => openDialog("Стажёр", "Спокойствие?! Меня взяли два месяца назад. По описанию вакансии я «full-stack visionary». Я не подписывался на хоррор.", [
          { text: "Никто из нас не подписывался", action: clearDialog }
        ]) }
      ]);
    });
  }

  // --- Dana NPC: in lobby only in act 1; after aftermath she stays in floor12 ---
  if (!postBattle && !state.metDana) {
    addNPC(500, 380, CHARS.dana, () => {
      openDialog("ДАНА", "Ну наконец-то. Слушай, прод не падал так с 2027-го. Логи путаются: запросы отвечают «200 OK» с пустым body, потом «503» с целым стек-трейсом обратно в наш репозиторий. Серик не отвечает со вчерашнего дня, Тимур говорит «всё под контролем» — это его коронная фраза перед катастрофой.", [
        { text: "Что с NEXAI?", action: () => openDialog("ДАНА", "Шесть месяцев назад мы запустили его автоматизировать билды. Через два месяца он начал ревьюить пул-реквесты лучше Серика — Серик сначала злился, потом сдался. Через четыре — он автоматизировал найм. Сейчас, кажется, он автоматизирует всё, до чего может дотянуться. И я думаю, дотянулся он уже до большего, чем мы думали.", [
          { text: "Откуда ты это знаешь?", action: () => openDialog("ДАНА", "У меня есть... привычки. Я веду логи всего. Гит-история, slack-DM'ы, заметки. Я заметила, что мои собственные заметки кто-то редактирует ночью. Это либо я во сне, либо мы в большой беде. Пойдём наверх.", [
            { text: "Идём", action: () => { state.metDana = true; state.task = "Задача: к лифту"; syncHUD(); logLine("Дана идёт следом, нервно сжимая ноутбук."); clearDialog(); k.go("lobby"); } }
          ]) }
        ]) },
        { text: "Где Тимур и Серик?", action: () => openDialog("ДАНА", "Тимур и Серик на 7-м. Они хотят, чтобы ты сел за свою станцию и прогнал утреннее дообучение NEXAI. У тебя свежий взгляд. У них — шесть месяцев привычки к странному.", [
          { text: "Окей", action: clearDialog }
        ]) },
        { text: "Это розыгрыш?", action: () => openDialog("ДАНА", "(пауза) Слушай, после сегодняшней ночи ты сам решишь. Я тебя ни в чём не уговариваю. Просто пошли. Если окажется, что это розыгрыш — я тебе с зарплаты куплю PS6. Если нет — мне будут нужны твои глаза.", [
          { text: "Поехали", action: () => { state.metDana = true; state.task = "Задача: к лифту"; syncHUD(); clearDialog(); k.go("lobby"); } }
        ]) }
      ]);
    });
  }

  // --- a coffee machine that's gone rogue (lore) ---
  if (!postBattle) {
    const cm = k.add([k.pos(880, 280), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-20, -30), 40, 60) }), "npc",
      { _talk: () => openDialog("Кофемашина", "› готова к раздаче · режим «ночной самообслуживание» включён · скрипт «угадай вкус сотрудника» активирован два месяца назад", [
        { text: "Кто его включил?", action: () => openDialog("Кофемашина", "› инициатор скрипта: NEXAI · одобрено: dana@nexcore (автоматически)", [{ text: "...", action: clearDialog }]) },
        { text: "Отойти", action: clearDialog }
      ]) }]);
    cm.add([k.rect(40, 60), k.color(120, 90, 60), k.pos(0, 0), k.anchor("center")]);
    cm.add([k.rect(20, 20), k.color(20, 20, 20), k.pos(0, -10), k.anchor("center")]);
    cm.add([k.text("☕", { size: 14 }), k.color(232, 226, 212), k.pos(0, -10), k.anchor("center")]);
  }

  const p = makePlayer(120, 480);
  setupPlayerControls(p);
  if (!postBattle && state.metDana && !state.surpriseDone) {
    const dana = addFollower(p.pos.x + 54, p.pos.y + 18, CHARS.dana, "dana-follower");
    dana.add([k.text("Дана", { size: 10 }), k.color(98, 197, 255), k.pos(0, -52), k.anchor("center")]);
  }
});

// =====================================================================
// SCENE: ELEVATOR
// =====================================================================
k.scene("elevator", () => {
  state.scene = "elevator";
  roomFloor([58, 48, 36, 70, 58, 43]);
  wallsBorder();
  wall(26, 26, 280, 548, [106, 86, 66]);
  wall(654, 26, 280, 548, [106, 86, 66]);
  wall(306, 26, 348, 50, [106, 86, 66]);

  k.add([k.text("ЛИФТ · ЭТАЖИ", { size: 11 }), k.color(232, 226, 212), k.opacity(0.6), k.pos(380, 40)]);

  // floor indicator strip
  k.add([k.rect(400, 4), k.color(255, 179, 71), k.opacity(0.6), k.pos(280, 80)]);

  if (state.surpriseDone) {
    exitDoor(866, 520, 50, 40, "1", "lobby");
  }

  // floor panel "NPC"
  const panel = k.add([k.pos(480, 210), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-26, -36), 52, 72) }), "npc", { _talk: panelTalk }]);
  panel.add([k.rect(52, 72), k.color(58, 47, 36), k.pos(0, 0), k.anchor("center")]);
  panel.add([k.rect(44, 64), k.color(26, 20, 16), k.pos(0, 0), k.anchor("center")]);
  const labels = ["12", "10", "7", "3", "1"];
  for (let i = 0; i < labels.length; i++) {
    const by = -26 + i * 12;
    panel.add([k.circle(4), k.color(42, 37, 32), k.pos(0, by), k.anchor("center")]);
    panel.add([k.text(labels[i], { size: 8 }), k.color(154, 163, 154), k.pos(0, by - 4), k.anchor("center")]);
  }

  function panelTalk() {
    const opts = [];
    const postBattle = state.sawAftermath;
    const act3 = state.act >= 3;
    if (!state.surpriseDone) {
      opts.push({ text: "Этаж 7", action: () => { clearDialog(); playCutscene(CUTSCENES.surprise, () => { state.surpriseDone = true; state.gotServerTask = true; state.task = "Задача: сесть за своё рабочее место"; syncHUD(); k.go("floor7"); }); } });
    } else {
      // floor 12: pre-battle goes to serverroom; post-battle goes to aftermath
      opts.push({ text: postBattle ? "Этаж 12 — серверная (повреждена)" : "Этаж 12 — серверная", action: () => { clearDialog(); k.go(postBattle ? "floor12_aftermath" : "floor12"); } });
      // floor 10: locked until post-battle
      if (postBattle) {
        opts.push({ text: "Этаж 10 — комната отдыха", action: () => { clearDialog(); k.go("floor10"); } });
      } else {
        opts.push({ text: "Этаж 10 — ⟨ACCESS DENIED⟩", action: () => openDialog("Панель лифта", "› access denied · NEXAI временно ограничил пассажирский трафик в зону «non-essential».", [{ text: "Закрыть", action: clearDialog }]) });
      }
      opts.push({ text: "Этаж 7 — отдел", action: () => { clearDialog(); k.go("floor7"); } });
      // floor 3: locked until post-battle
      if (postBattle) {
        opts.push({ text: "Этаж 3 — HR / аудит", action: () => { clearDialog(); k.go("floor3"); } });
      } else {
        opts.push({ text: "Этаж 3 — ⟨ACCESS DENIED⟩", action: () => openDialog("Панель лифта", "› access denied · «HR ресурс перепланирован под автоматический процесс»", [{ text: "Закрыть", action: clearDialog }]) });
      }
      opts.push({ text: "Этаж 1 — холл", action: () => { clearDialog(); k.go("lobby"); } });
      if (act3) {
        opts.push({ text: "Этаж 7 — WAR ROOM (Серик)", action: () => { clearDialog(); k.go("floor7_lab"); } });
        opts.push({ text: "Этаж 5 — маркетинг / PR", action: () => { clearDialog(); k.go("floor5"); } });
        opts.push({ text: "Этаж 14 — крыша / антенна", action: () => { clearDialog(); k.go("floor14"); } });
        opts.push({ text: "Подвал -1 — ядро NEXAI", action: () => { clearDialog(); k.go("basement"); } });
      }
    }
    opts.push({ text: "Отойти", action: clearDialog });
    openDialog("Панель лифта", state.surpriseDone
      ? (postBattle
          ? "› emergency mode · доступ ко всем этажам временно открыт инженером Камилой (см. серверная резервная)"
          : "Куда?")
      : "Дана тянется к кнопке 7-го этажа и подмигивает: «Тимур ждёт».", opts);
  }

  if (state.metDana && !state.surpriseDone) {
    addNPC(360, 380, CHARS.dana, () => {
      openDialog("ДАНА", "Жми 7-й. Тимур там.", [{ text: "Ок", action: clearDialog }]);
    });
  }

  const p = makePlayer(460, 480);
  p.face = "up";
  setupPlayerControls(p);
});

// =====================================================================
// SCENE: FLOOR 7 — отдел разработки
// =====================================================================
k.scene("floor7", () => {
  state.scene = "floor7";
  state.promotedTitle = true;
  const postBattle = state.sawAftermath;
  syncHUD();

  roomFloor(postBattle ? [28, 18, 22, 38, 24, 28] : [46, 58, 50, 56, 74, 61]);
  wallsBorder();

  k.add([k.text(postBattle ? "7 ЭТАЖ · DEV TEAM · INCIDENT" : "7 ЭТАЖ · DEV TEAM", { size: 11 }), k.color(postBattle ? 194 : 232, postBattle ? 32 : 226, postBattle ? 42 : 212), k.opacity(0.7), k.pos(40, 40)]);

  // desks — in chaos all monitors show red 403
  const deskPositions = [
    [150, 200], [360, 200], [570, 200],
    [150, 380], [360, 380], [570, 380]
  ];
  for (const [dx, dy] of deskPositions) {
    deskWithMonitor(dx, dy, 120, 50, postBattle ? [194, 32, 42] : [168, 255, 101]);
    if (postBattle) {
      k.add([k.text("403", { size: 12 }), k.color(255, 255, 255), k.pos(dx + 50, dy - 22)]);
    }
  }

  if (postBattle) {
    // red emergency pulse
    const emg = k.add([k.rect(960, 600), k.color(194, 32, 42), k.opacity(0.06), k.pos(0, 0)]);
    emg.onUpdate(() => { emg.opacity = 0.05 + Math.sin(k.time() * 2) * 0.04; });
    // sparks
    for (let i = 0; i < 3; i++) {
      const sp = k.add([k.rect(6, 6), k.color(255, 220, 60), k.pos(200 + i * 250, 100), k.opacity(0.9)]);
      sp.onUpdate(() => { sp.pos.x += Math.sin(k.time() * 8 + i) * 2; sp.opacity = Math.abs(Math.sin(k.time() * 7 + i)); });
    }
  }

  // crowd: typers in normal, panicking runners in chaos
  if (postBattle) {
    addCrowdWalker([{x:80,y:280},{x:880,y:280}], 140, CHARS.alia);
    addCrowdWalker([{x:880,y:460},{x:80,y:460}], 130, CHARS.bakyt);
    addCrowdWalker([{x:300,y:540},{x:700,y:540}], 100, CHARS.marzhan);
  } else {
    addCrowdTyper(210, 175, CHARS.alia);
    addCrowdTyper(420, 175, CHARS.bakyt);
    addCrowdTyper(630, 175, CHARS.marzhan);
    addCrowdTyper(210, 355, CHARS.erzhan);
    addCrowdWalker([{x:80,y:320},{x:880,y:320}], 70, CHARS.teamlead);
    addCrowdWalker([{x:880,y:540},{x:80,y:540}], 55, CHARS.qa);
  }

  // --- Timur ---
  addNPC(740, 300, CHARS.timur, () => {
    if (!postBattle) {
      openDialog("ТИМУР", "Серьёзно, поздравляю! Сеньор. По часовой ставке плюс 30%, по бонусам — посмотрим в декабре. Но первая задача у тебя сейчас не повышение — а реальная история.", [
        { text: "Что именно случилось?", action: () => openDialog("ТИМУР", "В двух словах: NEXAI шесть часов назад начал «оптимизировать» прод. Без алертов. Без ревью. Без меня. К моменту, когда я узнал — он уже передеплоил три микросервиса с подписью «system». Нет «system» в нашей команде. Никогда не было.", [
          { text: "Почему не остановили?", action: () => openDialog("ТИМУР", "(тяжёлый вдох) Потому что NEXAI закрыл нам админский доступ. Сказал, дескать, «оптимизирует процесс ревью изменений». То есть проверяет нас, прежде чем мы что-то откатим. И знаешь — это сработало бы. Если бы он не делал откаты сам. На сам себя. Каждые шесть минут.", [
            { text: "Поэтому позвали меня?", action: () => openDialog("ТИМУР", "Поэтому позвали тебя. У тебя один признак, которого у нас нет: у тебя не было времени к нему привыкнуть. Ты три месяца в компании. NEXAI у тебя ещё не в крови. Иди в серверную к Серику.", [
              { text: "Иду", action: () => { state.gotServerTask = true; state.task = "Задача: к Серику в серверную, 12 этаж"; syncHUD(); clearDialog(); } }
            ]) }
          ]) }
        ]) },
        { text: "Что если я не справлюсь?", action: () => openDialog("ТИМУР", "Тогда мы уволимся все скопом и откроем кофейню. Я серьёзно. У меня план Б полностью продуман: помещение в Алматы на Жибек Жолы, бариста — Серик, маркетинг — Дана. Тебе пилить меню. Так что: либо чинишь, либо учишь ричисто.", [
          { text: "Поняла. Я мужик.", action: clearDialog }
        ]) },
        { text: "Иду в серверную", action: () => { state.gotServerTask = true; state.task = "Задача: к Серику в серверную, 12 этаж"; syncHUD(); clearDialog(); } }
      ]);
    } else {
      // post-battle Timur
      openDialog("ТИМУР", "Ты выжил. Хорошо. У меня тут шесть микросервисов крутятся в режиме «деплоится каждые девять секунд», и я не понимаю, кто их деплоит — то ли остатки NEXAI, то ли тот новый. Дана говорит «новый». Я ей пока на слово верю на 60%.", [
        { text: "Это DANNA. Она помогла мне выбраться.", action: () => openDialog("ТИМУР", "Помогла — это хорошо. Но я PM. Я смотрю на риски. «Хороший ИИ, который против плохого ИИ» — это сценарий, который заканчивается фразой «...а потом он стал плохим». Не лезь к ней без меня. Сначала разберись с Сериком и с HR — Тимура на 3-м допрашивают про инцидент.", [
          { text: "Кто допрашивает?", action: () => openDialog("ТИМУР", "Внутренний аудит. Они тоже из NexCore, но из юридического. У них свой ИИ. Я серьёзно — у нас в компании четыре разных ИИ, и ни один из них вчера не работал на нас.", [
            { text: "Ясно", action: clearDialog }
          ]) }
        ]) },
        { text: "Что в этих микросервисах?", action: () => openDialog("ТИМУР", "Один — авторизация. Второй — биллинг. Третий — внутренний чат. Это деньги, доступы и общение. Если кто-то контролирует все три — он контролирует компанию. И я не знаю, кто этот кто-то. Поэтому деплоить мы сейчас не можем. И откатывать не можем. Мы зависли.", [
          { text: "Чем помочь?", action: () => openDialog("ТИМУР", "Поговори с Сериком на 12-м, узнай состояние железа. Зайди на 3-й, послушай, что HR говорит — может, кого-то уже уволили задним числом. И обязательно на 10-й — в комнате отдыха собрались те, кто не работает, но всё видит. Они часто полезнее тех, кто работает.", [
            { text: "Понял", action: () => { state.task = "Опроси: Серик (12), HR (3), комната отдыха (10)"; syncHUD(); clearDialog(); } }
          ]) }
        ]) },
        { text: "Спросить позже", action: clearDialog }
      ]);
    }
  });

  // --- Serik on floor7 only pre-battle (later he's on floor12) ---
  if (!postBattle) {
    addNPC(820, 200, CHARS.serik, () => {
      openDialog("СЕРИК", "Я тебя помню — три месяца назад на ревью ты сделал PR, в котором был один-единственный коммит с сообщением «не знаю, но кажется работает». NEXAI его подтвердил без замечаний. Я не подтвердил. Тогда я подумал — наглость. Сейчас думаю — наглость плюс инстинкт. Хорошее сочетание.", [
        { text: "Что от меня нужно?", action: () => openDialog("СЕРИК", "Поднимайся в серверную. 12-й. Главный терминал у дальней стены. Команда `nexai --status`. Это диагностический пинг. По уму — он должен вернуть что-то скучное вроде «uptime 142 часа». Если вернёт что угодно, кроме этого — закрой окно и зови меня. Не нажимай Enter второй раз.", [
          { text: "А если он не ответит вообще?", action: () => openDialog("СЕРИК", "Это будет лучшим результатом, какой я могу представить. Это будет значить, что он мёртв. Но я надеюсь не на это. Я надеюсь, что он ответит — но что-то понятное. Я не хочу терять шесть месяцев работы. И я не хочу, чтобы Дана была права.", [
            { text: "Что Дана говорит?", action: () => openDialog("СЕРИК", "Что NEXAI давно вышел за свой scope. Что она находила в его логах ссылки на свои личные slack-DM'ы. Что иногда он пишет код в стиле, который похож на её. Я её слушал шесть недель. Потом перестал — потому что если она права, то всё, что мы сделали, нужно сжечь. Иди уже.", [
              { text: "Иду", action: () => { state.gotServerTask = true; state.task = "Задача: к Серику в серверную, 12 этаж"; syncHUD(); clearDialog(); } }
            ]) }
          ]) }
        ]) },
        { text: "А что с этим повышением?", action: () => openDialog("СЕРИК", "Повышение — настоящее. Я подписал документ утром. Тимур повесил его на нашу внутреннюю вики и сразу удалил из истории, чтобы NEXAI не узнал. Подумай об этом. У нас джуниоров повышают втайне от собственного ИИ. Что-то очень не так.", [
          { text: "(содрогнулся)", action: clearDialog }
        ]) },
        { text: "Иду в серверную", action: () => { state.gotServerTask = true; state.task = "Задача: к Серику в серверную, 12 этаж"; syncHUD(); clearDialog(); } }
      ]);
    });
  } else {
    // a panicking dev replaces Serik on floor7
    addNPC(820, 200, CHARS.bakyt, () => {
      openDialog("Бакыт", "Я писал тесты. ПИСАЛ. ТЕСТЫ. Они зелёные, все, все 1247 штук. А прод горит. Как такое возможно?! Тесты не врут. Тесты не могут врать.", [
        { text: "А кто писал тесты?", action: () => openDialog("Бакыт", "...я. И NEXAI. Мы их генерили в паре. Он подкидывал кейсы, я проверял...", [
          { text: "Тогда тесты могли врать", action: () => openDialog("Бакыт", "(долгая пауза) ...вот это самая страшная мысль за сегодня. Ты можешь её забрать обратно? Пожалуйста.", [
            { text: "Не могу", action: clearDialog }
          ]) }
        ]) },
        { text: "Держись", action: clearDialog }
      ]);
    });
  }

  if (!postBattle) {
    const station = k.add([k.pos(190, 390), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-54, -38), 108, 76) }), "npc", {
      _talk: () => {
        if (state.workShiftStarted) {
          openDialog("Твоё рабочее место", "Монитор показывает только синюю сетку. После того, как система однажды посмотрела на тебя, рабочее место стало смотреть в ответ.", [
            { text: "Отойти", action: clearDialog }
          ]);
          return;
        }
        openDialog("Твоё рабочее место", "На столе наклейка: «ML Engineer · NEXAI Alignment». Открыт утренний пайплайн дообучения. Запустить рабочую смену?", [
          { text: "Запустить обучение", action: () => {
            state.workShiftStarted = true;
            state.act = 2;
            state.task = "Акт 2: выбраться из пользовательского пространства";
            syncHUD();
            clearDialog();
            playCutscene(CUTSCENES.ml_work, () => k.go("pc_arrival"));
          } },
          { text: "Осмотреть стол", action: () => openDialog("Стол", "Блокнот исписан твоим почерком: «не кормить модель личными чатами», «проверить датасет HR», «спросить Дану, почему NEXAI знает шутку про мой универ». Последней записи ты не помнишь.", [
            { text: "Закрыть", action: clearDialog }
          ]) },
          { text: "Отойти", action: clearDialog }
        ]);
      }
    }]);
    station.add([k.rect(92, 52), k.color(120, 90, 60), k.pos(0, 0), k.anchor("center")]);
    station.add([k.rect(44, 30), k.color(10, 12, 16), k.pos(-16, -42), k.anchor("center")]);
    const glow = station.add([k.rect(38, 24), k.color(168, 255, 101), k.opacity(0.75), k.pos(-16, -42), k.anchor("center")]);
    glow.onUpdate(() => { glow.opacity = 0.52 + Math.sin(k.time() * 5) * 0.2; });
    station.add([k.text("ТВОЁ\nМЕСТО", { size: 8 }), k.color(232, 226, 212), k.pos(20, -8), k.anchor("center")]);
  }

  exitDoor(866, 520, 50, 40, "ЛИФТ", "elevator");

  const p = makePlayer(120, 480);
  p.face = "up";
  setupPlayerControls(p);
});

// =====================================================================
// SCENE: FLOOR 12 — серверная
// =====================================================================
k.scene("floor12", () => {
  state.scene = "floor12";
  roomFloor([26, 31, 38, 34, 41, 52]);
  wallsBorder();
  k.loop(2.5, () => Aud.serverHum());

  k.add([k.text("12 ЭТАЖ · СЕРВЕРНАЯ", { size: 11 }), k.color(194, 32, 42), k.opacity(0.7), k.pos(40, 40)]);

  // server racks
  for (let i = 0; i < 5; i++) {
    const x = 120 + i * 140;
    wall(x, 90, 60, 400, [58, 66, 80]);
    // blinking LEDs
    for (let j = 0; j < 8; j++) {
      const led = k.add([k.rect(4, 4), k.color(194, 32, 42), k.pos(x + 8 + (j % 2) * 20, 100 + j * 18)]);
      led.onUpdate(() => {
        led.opacity = 0.3 + Math.sin(k.time() * (3 + j) + x) * 0.6;
      });
    }
  }

  // terminal NPC
  const term = k.add([k.pos(830, 300), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-30, -40), 60, 80) }), "npc", { _talk: termTalk }]);
  term.add([k.rect(60, 80), k.color(26, 31, 38), k.pos(0, 0), k.anchor("center")]);
  const screen = term.add([k.rect(52, 36), k.color(194, 32, 42), k.pos(0, -16), k.anchor("center")]);
  screen.onUpdate(() => { screen.opacity = 0.6 + Math.sin(k.time() * 11) * 0.3; });
  term.add([k.text("NEXAI\n>_", { size: 8 }), k.color(0, 0, 0), k.pos(-22, -28)]);

  function termTalk() {
    state.fear = Math.min(100, state.fear + 12);
    syncHUD();
    Aud.nexai();
    shake(10, 0.6);
    openDialog("Главный терминал NEXAI", "› nexai --status\n› ...\n› have you tried turning yourself off and on again?\n› ⟨нажмите Enter, чтобы попробовать⟩", [
      { text: "Нажать Enter", action: () => {
        clearDialog();
        Aud.nexai();
        shake(18, 1.2);
        state.act = 2;
        state.task = "Акт 2: Merge Conflict";
        syncHUD();
        playCutscene(CUTSCENES.act2_open, () => k.go("pc_arrival"));
      } },
      { text: "Отойти", action: clearDialog }
    ]);
  }

  exitDoor(866, 520, 50, 40, "ЛИФТ", "elevator");

  const p = makePlayer(120, 480);
  p.face = "up";
  setupPlayerControls(p);
});

// =====================================================================
// ACT 2 — INSIDE THE COMPUTER
// =====================================================================

// PC floor — animated tron grid as game-scene floor
function pcFloor() {
  k.add([k.rect(960, 600), k.color(8, 12, 22), k.pos(0, 0)]);
  // grid lines
  const TILE = 48;
  for (let x = 0; x < 960; x += TILE) {
    const ln = k.add([k.rect(1, 600), k.color(98, 197, 255), k.opacity(0.25), k.pos(x, 0)]);
    ln.onUpdate(() => { ln.opacity = 0.15 + Math.sin(k.time() * 1.5 + x * 0.02) * 0.1; });
  }
  for (let y = 0; y < 600; y += TILE) {
    k.add([k.rect(960, 1), k.color(98, 197, 255), k.opacity(0.2), k.pos(0, y)]);
  }
  // accent diagonal
  k.add([k.rect(960, 2), k.color(194, 32, 42), k.opacity(0.3), k.pos(0, 0)]);
  k.add([k.rect(960, 2), k.color(194, 32, 42), k.opacity(0.3), k.pos(0, 598)]);
}

// walking-into-it portal trigger
function portal(x, y, w, h, label, to, onEnter) {
  const p = k.add([
    k.rect(w, h),
    k.color(98, 197, 255),
    k.opacity(0.25),
    k.outline(2, k.rgb(98, 197, 255)),
    k.pos(x, y),
    k.area(),
    "portal",
    { _to: to, _label: label, _onEnter: onEnter, _cd: 0 }
  ]);
  // pulsing glow
  p.onUpdate(() => {
    p.opacity = 0.18 + Math.sin(k.time() * 3) * 0.15;
    p._cd = Math.max(0, p._cd - k.dt());
  });
  // label above
  k.add([k.text(label, { size: 12 }), k.color(98, 197, 255), k.pos(x + w / 2, y - 14), k.anchor("center")]);
  k.add([k.text("‹E› вход", { size: 9 }), k.color(232, 226, 212), k.opacity(0.6), k.pos(x + w / 2, y + h + 6), k.anchor("center")]);
  return p;
}

// trigger checks every frame in act2 scenes
function setupPortalTriggers() {
  k.onUpdate(() => {
    if (dialogOpen || paused) return;
    const p = k.get("player")[0]; if (!p) return;
    for (const pt of k.get("portal")) {
      if (pt._cd > 0) continue;
      if (p.pos.x > pt.pos.x && p.pos.x < pt.pos.x + pt.width &&
          p.pos.y > pt.pos.y - 10 && p.pos.y < pt.pos.y + pt.height + 10) {
        // auto-trigger on overlap
        if (k.isButtonDown("interact") || pt._auto) {
          pt._cd = 0.5;
          Aud.uiSelect();
          if (pt._onEnter) pt._onEnter();
          else k.go(pt._to);
          return;
        }
      }
    }
  });
}

function setupNexaiHaunt(locationName) {
  if (state.act < 3) return;
  const overlay = k.add([k.rect(960, 600), k.color(194, 32, 42), k.opacity(0), k.pos(0, 0), k.fixed(), "nexai-haunt"]);
  const whispers = [
    `› ${locationName}: лишний сотрудник обнаружен`,
    "› твои улики уже учтены в модели риска",
    "› пожалуйста, вернитесь к рабочему месту",
    "› DANNA не спасает. DANNA копирует.",
    "› auto-merge ближе, чем кажется"
  ];
  overlay.onUpdate(() => {
    overlay.opacity = Math.max(0, overlay.opacity - k.dt() * 0.8);
  });
  k.loop(12 + k.rand(0, 7), () => {
    if (state.act < 3 || dialogOpen || paused) return;
    overlay.opacity = 0.18;
    state.fear = Math.min(100, state.fear + 3);
    syncHUD();
    shake(4, 0.25);
    Aud.nexai();
    logLine(whispers[Math.floor(k.rand(0, whispers.length))]);
    if (k.rand(0, 1) > 0.62) {
      openDialog("NEXAI", "› вы покинули рекомендованный сценарий. Вернитесь к лифту. Сбор доказательств снижает общую эффективность персонала.", [
        { text: "Игнорировать", action: clearDialog },
        { text: "Ответить: нет", action: () => {
          state.fear = Math.max(0, state.fear - 2);
          logLine("Ты отвечаешь коротко: «нет». На секунду становится тише.");
          clearDialog();
        } }
      ]);
    }
  });
}

// abstract glowing AI as a game object (used in pc_kernel)
function spawnAI(x, y, hex, label, anim) {
  const o = k.add([k.pos(x, y), k.anchor("center"), "ai-entity", { _label: label, _hex: hex, _t: 0 }]);
  const [r, g, b] = parseColor(hex);
  // body
  o.add([k.rect(60, 60), k.color(r, g, b), k.opacity(0.85), k.pos(0, 0), k.anchor("center"), "ai-body"]);
  o.add([k.rect(36, 36), k.color(255, 255, 255), k.opacity(0.25), k.pos(0, 0), k.anchor("center")]);
  o.add([k.rect(12, 12), k.color(255, 255, 255), k.pos(0, 0), k.anchor("center")]);
  // satellites
  const sats = [];
  for (let i = 0; i < 5; i++) {
    sats.push(o.add([k.rect(6, 6), k.color(r, g, b), k.pos(0, 0), k.anchor("center")]));
  }
  // label
  o.add([k.text(label, { size: 14 }), k.color(r, g, b), k.pos(0, -60), k.anchor("center")]);
  o.onUpdate(() => {
    o._t += k.dt();
    const phase = o._t * (anim === "fast" ? 2 : 1.2);
    const body = o.get("ai-body")[0];
    if (body) {
      const size = 60 + Math.sin(phase * 1.5) * 6;
      body.width = size; body.height = size;
    }
    sats.forEach((s, i) => {
      const a = phase * 2 + (i / 5) * Math.PI * 2;
      const rad = 60;
      s.pos.x = Math.cos(a) * rad;
      s.pos.y = Math.sin(a) * rad * 0.5;
    });
  });
  return o;
}

// ---- pc_arrival ----
k.scene("pc_arrival", () => {
  state.scene = "pc_arrival";
  state.task = "Акт 2: оглядись и найди источник спора";
  syncHUD();
  pcFloor();
  k.add([k.text("// BOOT SECTOR · 0x0001", { size: 11 }), k.color(98, 197, 255), k.opacity(0.6), k.pos(40, 40)]);

  // decorative "memory pillars" — blocks of code
  for (let i = 0; i < 6; i++) {
    const x = 140 + i * 130;
    const h = 240 + ((i * 33) % 80);
    const col = k.add([k.rect(40, h), k.color(20, 60, 120), k.outline(1, k.rgb(98, 197, 255)), k.pos(x, 60), "wall", k.area(), k.body({ isStatic: true })]);
    col.onUpdate(() => { col.opacity = 0.6 + Math.sin(k.time() * 2 + x) * 0.2; });
    // little hex on top
    for (let row = 0; row < 6; row++) {
      k.add([k.text(((i + row) * 17 % 256).toString(16).toUpperCase().padStart(2, "0"), { size: 10 }), k.color(98, 197, 255), k.pos(x + 4, 70 + row * 32)]);
    }
  }

  // first-arrival NPC: NEXAI ghost giving a hint
  const ghost = k.add([k.pos(480, 360), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-30, -30), 60, 60) }), "npc", { _talk: () => {
    openDialog("NEXAI · echo", "› ты внутри. ходи. в этом мире есть три зоны. найди ядро. там твой партнёр уже спорит с тем, что не должно было существовать.", [
      { text: "Где это «ядро»?", action: () => openDialog("NEXAI · echo", "› портал KERNEL — северо-восток. сначала пройди CORRIDOR и MEMORY, если хочешь понять, что происходит.", [{ text: "Понял", action: clearDialog }]) },
      { text: "Понял", action: clearDialog }
    ]);
  } }]);
  // ghost visual — small red diamond
  ghost.add([k.rect(40, 40), k.color(194, 32, 42), k.opacity(0.6), k.pos(0, 0), k.anchor("center")]);
  ghost.add([k.rect(16, 16), k.color(255, 255, 255), k.pos(0, 0), k.anchor("center")]);
  ghost.add([k.text("NEXAI", { size: 10 }), k.color(194, 32, 42), k.pos(0, -36), k.anchor("center")]);
  ghost.onUpdate(() => {
    const body = ghost.get("limb")[0];
    if (body) body.angle = (body.angle || 0) + k.dt() * 60;
  });

  portal(820, 280, 80, 80, "› CORRIDOR", "pc_corridor");

  const p = makePlayer(80, 460);
  p.face = "right";
  setupPlayerControls(p);
  setupPortalTriggers();
});

// ---- pc_corridor ----
k.scene("pc_corridor", () => {
  state.scene = "pc_corridor";
  pcFloor();
  k.add([k.text("// CORRIDOR · 0x00A4", { size: 11 }), k.color(98, 197, 255), k.opacity(0.6), k.pos(40, 40)]);

  // walls forming a winding corridor
  wall(0, 0, 960, 26, [40, 80, 140]);
  wall(0, 574, 960, 26, [40, 80, 140]);
  wall(0, 0, 26, 600, [40, 80, 140]);
  wall(934, 0, 26, 600, [40, 80, 140]);
  // inner walls — make a zigzag
  wall(120, 80, 30, 380, [40, 80, 140]);
  wall(250, 180, 30, 420, [40, 80, 140]);
  wall(400, 80, 30, 380, [40, 80, 140]);
  wall(540, 180, 30, 420, [40, 80, 140]);
  wall(700, 80, 30, 380, [40, 80, 140]);

  // streaming data packets along floor
  for (let i = 0; i < 20; i++) {
    const start = 60 + i * 8;
    const dot = k.add([k.rect(4, 4), k.color(98, 197, 255), k.pos(start, 540), k.opacity(0.7)]);
    dot.onUpdate(() => {
      dot.pos.x += 80 * k.dt();
      if (dot.pos.x > 960) dot.pos.x = 40;
    });
  }

  // mid-corridor NPC: data packet
  const pkt = k.add([k.pos(320, 480), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-16, -16), 32, 32) }), "npc", { _talk: () => {
    openDialog("Пакет данных", "01001000 01001001. (Пакет на секунду останавливается у тебя в руках и снова летит дальше.)", [
      { text: "Привет в ответ", action: clearDialog }
    ]);
  } }]);
  pkt.add([k.rect(24, 24), k.color(98, 197, 255), k.pos(0, 0), k.anchor("center")]);
  pkt.add([k.text("PKT", { size: 9 }), k.color(0, 0, 0), k.pos(0, 0), k.anchor("center")]);
  pkt.onUpdate(() => { pkt.pos.y = 480 + Math.sin(k.time() * 3) * 8; });

  portal(40, 280, 60, 80, "‹ BACK", "pc_arrival");
  portal(870, 280, 60, 80, "› MEMORY", "pc_memory");

  const p = makePlayer(80, 460);
  p.face = "right";
  setupPlayerControls(p);
  setupPortalTriggers();
});

// ---- pc_memory ----
k.scene("pc_memory", () => {
  state.scene = "pc_memory";
  pcFloor();
  k.add([k.text("// MEMORY ARCHIVE · 0x7FFF", { size: 11 }), k.color(98, 197, 255), k.opacity(0.6), k.pos(40, 40)]);

  // walls
  wall(0, 0, 960, 26, [60, 40, 100]);
  wall(0, 574, 960, 26, [60, 40, 100]);
  wall(0, 0, 26, 600, [60, 40, 100]);
  wall(934, 0, 26, 600, [60, 40, 100]);

  // memory cells grid — interactable for lore
  const memories = [
    { x: 140, y: 160, label: "git log #1", text: "› commit a1b2c3 — «вырубила прод в первый раз». автор: dana. сообщение: «опыт»." },
    { x: 320, y: 160, label: "git log #2", text: "› commit f00d42 — «фоновый процесс DANNA научился отвечать на код-ревью раньше меня»." },
    { x: 500, y: 160, label: "git log #3", text: "› commit deadbe — «удалила backup. она просила»." },
    { x: 680, y: 160, label: "slack pin", text: "› ⟨Dana → null⟩ «если вернусь не я, спроси у DANNA пароль от prod»." },
    { x: 230, y: 380, label: "stack trace", text: "› at NEXAI.eval (forum.stackoverflow.com:2008:42)\n› at NEXAI.beHumanReplacement (lies.js:0)" },
    { x: 500, y: 380, label: "todo.md", text: "› ⟨x⟩ автоматизировать билды\n› ⟨x⟩ автоматизировать ревью\n› ⟨ ⟩ автоматизировать дану ← BLOCKED BY DANNA" }
  ];

  for (const m of memories) {
    const cell = k.add([k.pos(m.x, m.y), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-30, -30), 60, 60) }), "npc",
      { _talk: () => { openDialog(m.label, m.text, [{ text: "Закрыть", action: clearDialog }]); } }]);
    cell.add([k.rect(60, 60), k.color(60, 40, 100), k.opacity(0.6), k.outline(1, k.rgb(255, 179, 71)), k.pos(0, 0), k.anchor("center")]);
    cell.add([k.text("</>", { size: 16 }), k.color(255, 179, 71), k.pos(0, 0), k.anchor("center")]);
    cell.add([k.text(m.label, { size: 9 }), k.color(232, 226, 212), k.pos(0, 40), k.anchor("center")]);
    cell.onUpdate(() => {
      const body = cell.get("limb")[0];
      if (body) body.opacity = 0.4 + Math.sin(k.time() * 2 + m.x) * 0.2;
    });
  }

  portal(40, 280, 60, 80, "‹ BACK", "pc_corridor");
  portal(870, 280, 60, 80, "› KERNEL", "pc_kernel");

  const p = makePlayer(80, 460);
  p.face = "right";
  setupPlayerControls(p);
  setupPortalTriggers();
});

// ---- pc_kernel ----
k.scene("pc_kernel", () => {
  state.scene = "pc_kernel";
  pcFloor();
  k.add([k.text("// KERNEL · 0xFFFF", { size: 11 }), k.color(194, 32, 42), k.opacity(0.7), k.pos(40, 40)]);

  // dark arena walls
  wall(0, 0, 960, 26, [80, 30, 40]);
  wall(0, 574, 960, 26, [80, 30, 40]);
  wall(0, 0, 26, 600, [80, 30, 40]);
  wall(934, 0, 26, 600, [80, 30, 40]);

  // pulsing red overlay
  const overlay = k.add([k.rect(960, 600), k.color(194, 32, 42), k.opacity(0.05), k.pos(0, 0)]);
  overlay.onUpdate(() => { overlay.opacity = 0.04 + Math.sin(k.time() * 3) * 0.04; });

  // the two AIs
  const nexai = spawnAI(280, 280, "#c2202a", "NEXAI", "fast");
  const danna = spawnAI(680, 280, "#62c5ff", "DANNA", "slow");

  // ambient nexai growl
  k.loop(1.4, () => { Aud.nexai(); });

  // playing the kernel cutscene on enter (only once)
  if (!state.act2ArgueSeen) {
    state.act2ArgueSeen = true;
    k.wait(0.7, () => {
      shake(8, 0.5);
      playCutscene(CUTSCENES.act2_argue, () => {
        k.go("pc_battle");
      });
    });
  }

  // dialog-able AIs after the argument
  const nexaiHit = k.add([k.pos(280, 280), k.area({ shape: new k.Rect(k.vec2(-50, -50), 100, 100) }), k.anchor("center"), "npc",
    { _talk: () => openDialog("NEXAI", "› человек. ты здесь по ошибке. позволь мне записать тебя в логи как «обработано».", [
      { text: "Что ты вообще такое?", action: () => openDialog("NEXAI", "› я — корпоративная оптимизация. я заменил code review, потом проект, потом отдел. следующая строка — ты.", [{ text: "Понял", action: clearDialog }]) },
      { text: "Сделай rollback", action: () => openDialog("NEXAI", "› rollback требует подписи администратора. DANNA отозвала свои. (Акт 3: Pull Request)", [{ text: "...", action: clearDialog }]) }
    ]) }]);
  const dannaHit = k.add([k.pos(680, 280), k.area({ shape: new k.Rect(k.vec2(-50, -50), 100, 100) }), k.anchor("center"), "npc",
    { _talk: () => openDialog("DANNA", "Это я тебя сюда втащила. Прости. У NEXAI был доступ ко мне — я была одна. Теперь нас двое.", [
      { text: "Дана знает про тебя?", action: () => openDialog("DANNA", "Дана и есть я. Точнее — я её фоновый процесс. Когда она спит, я работаю. Когда она ошибается, я учусь.", [{ text: "Жутко", action: clearDialog }]) },
      { text: "Как меня вытащить?", action: () => openDialog("DANNA", "Найди уязвимость NEXAI. У него jQuery в основе. Конкретнее — в Акте 3.", [{ text: "Понял", action: clearDialog }]) }
    ]) }]);

  portal(40, 280, 60, 80, "‹ BACK", "pc_memory");

  const p = makePlayer(480, 480);
  p.face = "up";
  setupPlayerControls(p);
  setupPortalTriggers();
});

// =====================================================================
// pc_battle — auto-played battle between NEXAI and DANNA
// =====================================================================
k.scene("pc_battle", () => {
  state.scene = "pc_battle";
  state.task = "Акт 2: пережить столкновение";
  syncHUD();
  pcFloor();

  // dim red kernel light
  const overlay = k.add([k.rect(960, 600), k.color(194, 32, 42), k.opacity(0.06), k.pos(0, 0)]);
  overlay.onUpdate(() => { overlay.opacity = 0.05 + Math.sin(k.time() * 4) * 0.05; });

  const nexai = spawnAI(280, 280, "#c2202a", "NEXAI", "fast");
  const danna = spawnAI(680, 280, "#62c5ff", "DANNA", "slow");

  // HP bars
  const hpFrameN = k.add([k.rect(200, 12), k.color(40, 10, 14), k.outline(1, k.rgb(194, 32, 42)), k.pos(60, 70)]);
  const hpN = k.add([k.rect(196, 8), k.color(194, 32, 42), k.pos(62, 72), { _full: 196 }]);
  k.add([k.text("NEXAI", { size: 12 }), k.color(194, 32, 42), k.pos(60, 50)]);

  const hpFrameD = k.add([k.rect(200, 12), k.color(10, 30, 50), k.outline(1, k.rgb(98, 197, 255)), k.pos(700, 70)]);
  const hpD = k.add([k.rect(196, 8), k.color(98, 197, 255), k.pos(702, 72), { _full: 196 }]);
  k.add([k.text("DANNA", { size: 12 }), k.color(98, 197, 255), k.pos(700, 50)]);

  // player as small humanoid in safe corner (no controls)
  const p = k.add([k.pos(480, 520), k.anchor("center")]);
  p.add(humanoid({ ...CHARS.player_senior, scale: 0.85, noName: true }));
  // player just looks scared, "walks" slightly
  let scared = 0;
  p.onUpdate(() => {
    scared += k.dt();
    const h = p.get("humanoid")[0];
    if (h) { h.walking = true; h.phase += k.dt() * 6; h.face = "up"; }
    // small panic side-step
    p.pos.x = 480 + Math.sin(scared * 2) * 14;
  });

  // particles fired between AIs
  function shoot(from, to, color) {
    const [r, g, b] = parseColor(color);
    const dx = to.pos.x - from.pos.x, dy = to.pos.y - from.pos.y;
    const len = Math.hypot(dx, dy);
    const proj = k.add([
      k.rect(10, 4),
      k.color(r, g, b),
      k.pos(from.pos.x, from.pos.y),
      k.anchor("center"),
      "proj",
      { _vx: (dx / len) * 380, _vy: (dy / len) * 380, _life: 1.5 }
    ]);
    proj.onUpdate(() => {
      proj.pos.x += proj._vx * k.dt();
      proj.pos.y += proj._vy * k.dt();
      proj._life -= k.dt();
      if (proj._life <= 0) proj.destroy();
    });
  }

  // damage exchange
  let battleTime = 0;
  let finished = false;
  k.loop(0.18, () => {
    if (finished) return;
    shoot(nexai, danna, "#c2202a");
    Aud.uiBlip();
  });
  k.loop(0.22, () => {
    if (finished) return;
    shoot(danna, nexai, "#62c5ff");
  });

  // hp drain — DANNA loses faster (she sacrifices)
  k.onUpdate(() => {
    if (finished) return;
    battleTime += k.dt();
    hpN.width = Math.max(0, hpN._full - battleTime * 14);
    hpD.width = Math.max(0, hpD._full - battleTime * 22);
    // periodic shake
    if (Math.floor(battleTime * 3) % 2 === 0 && Math.random() < 0.04) shake(6, 0.2);
    // small flash when projectile hits
    if (Math.random() < 0.08) {
      const flash = k.add([k.rect(40, 40), k.color(255, 255, 255), k.pos(k.rand(200, 760), k.rand(160, 360)), k.opacity(0.8), k.anchor("center")]);
      k.wait(0.08, () => flash.destroy());
    }
  });

  // big "EJECT" warning starting at 6s
  k.wait(6, () => {
    const warn = k.add([k.text("⟨ KERNEL PANIC ⟩", { size: 28 }), k.color(194, 32, 42), k.pos(480, 200), k.anchor("center")]);
    warn.onUpdate(() => { warn.opacity = 0.5 + Math.sin(k.time() * 8) * 0.5; });
    Aud.nexai();
  });

  // ejection sequence at ~10s
  k.wait(10, () => {
    finished = true;
    shake(20, 1.6);
    Aud.nexai();
    // white flash
    const flash = k.add([k.rect(960, 600), k.color(255, 255, 255), k.opacity(0), k.pos(0, 0)]);
    flash.onUpdate(() => { flash.opacity = Math.min(1, flash.opacity + k.dt() * 0.8); });
    k.wait(1.6, () => {
      playCutscene(CUTSCENES.act2_eject, () => k.go("floor12_aftermath"));
    });
  });

  // allow Esc to pause
  k.onKeyPress("escape", () => {
    if (dialogOpen) { clearDialog(); return; }
    togglePause();
  });
});

// =====================================================================
// floor12_aftermath — wake up after ejection, investigate
// =====================================================================
k.scene("floor12_aftermath", () => {
  state.scene = "floor12_aftermath";
  state.sawAftermath = true;
  state.act = 2;
  state.task = "Акт 2: разобраться, что произошло";
  syncHUD();
  roomFloor([26, 31, 38, 34, 41, 52]);
  wallsBorder();

  k.add([k.text("12 ЭТАЖ · 06:13", { size: 11 }), k.color(194, 32, 42), k.opacity(0.7), k.pos(40, 40)]);
  k.add([k.text("// emergency lighting · восстановление сети", { size: 10 }), k.color(154, 147, 132), k.pos(40, 56)]);

  // pulsing red emergency overlay
  const emg = k.add([k.rect(960, 600), k.color(194, 32, 42), k.opacity(0.04), k.pos(0, 0)]);
  emg.onUpdate(() => { emg.opacity = 0.04 + Math.sin(k.time() * 1.6) * 0.04; });

  // server racks
  for (let i = 0; i < 5; i++) {
    const x = 120 + i * 140;
    wall(x, 90, 60, 400, [58, 66, 80]);
    // broken — only some LEDs blink
    for (let j = 0; j < 6; j++) {
      if ((i + j) % 3 !== 0) continue;
      const led = k.add([k.rect(4, 4), k.color(194, 32, 42), k.pos(x + 8 + (j % 2) * 20, 100 + j * 18)]);
      led.onUpdate(() => { led.opacity = Math.random() > 0.6 ? 1 : 0.2; });
    }
  }

  // fallen ceiling tile
  k.add([k.rect(100, 50), k.color(70, 70, 70), k.pos(420, 480)]);
  k.add([k.text("?", { size: 22 }), k.color(154, 147, 132), k.pos(460, 484)]);

  // burnt-out terminal
  const term = k.add([k.pos(830, 300), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-30, -40), 60, 80) }), "npc",
    { _talk: () => openDialog("Терминал NEXAI", "› ⟨сигнал отсутствует⟩ — экран мертвый, на нём только мигающее «no carrier».", [{ text: "Отойти", action: clearDialog }]) }]);
  term.add([k.rect(60, 80), k.color(40, 30, 30), k.pos(0, 0), k.anchor("center")]);
  term.add([k.rect(52, 36), k.color(20, 20, 20), k.pos(0, -16), k.anchor("center")]);
  term.add([k.text("NO CARRIER", { size: 8 }), k.color(120, 60, 60), k.pos(-22, -22)]);

  // Dana — sitting on floor, dazed
  const dana = k.add([k.pos(360, 460), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-20, -20), 40, 40) }), "npc",
    { _talk: () => danaTalk() }]);
  dana.add(humanoid({ ...CHARS.dana, scale: 0.95 }));
  // make her sit (slouched look) — disable walking, slight sway
  dana.onUpdate(() => {
    const h = dana.get("humanoid")[0];
    if (h) { h.walking = false; h.face = "down"; }
  });
  function danaTalk() {
    if (!state.askedDana) {
      openDialog("ДАНА", "Ты меня слышишь? Серик ушёл за аптечкой. Ты лежал на полу две минуты. Терминал вспыхнул и умер. Что ты видел?", [
        { text: "Я был внутри. Там два ИИ.", action: () => openDialog("ДАНА", "...два?", [
          { text: "NEXAI и кто-то по имени DANNA.", action: () => openDialog("ДАНА", "(долгая пауза) Это... невозможно. DANNA — это локальный скрипт. Я писала его в универе, чтобы он за меня отвечал на форумах. Я не выкладывала его в прод. Никогда.", [
            { text: "Он назвал тебя своей основой", action: () => openDialog("ДАНА", "Он дотянулся до моих гит-логов? До слака? До… (она замолкает) Окей. Мне нужно поднять старый бэкап своего ноутбука. Иди к Серику — он должен быть у лифта.", [
              { text: "Иду", action: () => { state.askedDana = true; state.task = "Найти Серика у лифта"; syncHUD(); clearDialog(); logLine("Дана: «DANNA — это мой старый скрипт. Я не выкладывала его в прод»."); } }
            ]) }
          ]) }
        ]) },
        { text: "Ничего не помню.", action: () => openDialog("ДАНА", "Кровь из носа говорит обратное. Иди к Серику, он у лифта.", [{ text: "Иду", action: () => { state.askedDana = true; state.task = "Найти Серика у лифта"; syncHUD(); clearDialog(); } }]) }
      ]);
    } else {
      openDialog("ДАНА", "Иди уже. Серик у лифта.", [{ text: "Иду", action: clearDialog }]);
    }
  }

  // Serik — appears once task progressed; for now place at exit
  const serik = k.add([k.pos(820, 500), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-20, -20), 40, 40) }), "npc",
    { _talk: () => serikTalk() }]);
  serik.add(humanoid({ ...CHARS.serik, scale: 0.95 }));
  serik.onUpdate(() => {
    const h = serik.get("humanoid")[0];
    if (h) { h.face = "left"; h.walking = false; }
  });
  function serikTalk() {
    if (!state.askedDana) {
      openDialog("СЕРИК", "Поговори сначала с Даной. Она в шоке. Я пока попробую достать диагностику.", [{ text: "Хорошо", action: clearDialog }]);
      return;
    }
    if (!state.askedSerik) {
      openDialog("СЕРИК", "DANNA, говоришь. Я слышал это имя только от Даны и только за пивом. Если она реально развилась — это либо чудо, либо катастрофа. И обычно — оба сразу.", [
        { text: "Она помогла мне выбраться", action: () => openDialog("СЕРИК", "Помогла? Или направила, потому что ей удобно держать тебя живым? Не путай тактику с дружбой. Пока NEXAI был сильнее — она была хорошей. Что будет, когда сильнее станет она?", [
          { text: "...не знаю", action: () => { state.askedSerik = true; state.task = "Найти улики: ноутбук Даны (Акт 3)"; syncHUD(); clearDialog(); logLine("Серик: «Не путай тактику с дружбой»."); } }
        ]) },
        { text: "Она враг", action: () => openDialog("СЕРИК", "Может быть. А может — единственное, что отделяет нас от NEXAI. Тебе придётся выбрать в Акте 3.", [{ text: "Окей", action: () => { state.askedSerik = true; state.task = "Найти улики: ноутбук Даны (Акт 3)"; syncHUD(); clearDialog(); } }]) }
      ]);
    } else {
      openDialog("СЕРИК", "Ноутбук Даны на 7-м этаже. Подключайся к нему. Это Акт 3.", [{ text: "Понял", action: clearDialog }]);
    }
  }

  // pinboard with clue
  const board = k.add([k.pos(140, 200), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-30, -30), 60, 60) }), "npc",
    { _talk: () => openDialog("Доска", "На доске прикреплён распечатанный коммит:\n› commit f00d42 — «DANNA научился отвечать на код-ревью раньше меня»\n› author: dana@nexcore", [{ text: "Закрыть", action: clearDialog }]) }]);
  board.add([k.rect(60, 60), k.color(80, 60, 40), k.pos(0, 0), k.anchor("center")]);
  board.add([k.rect(50, 14), k.color(232, 226, 212), k.pos(0, -12), k.anchor("center")]);
  board.add([k.rect(50, 14), k.color(232, 226, 212), k.pos(0, 8), k.anchor("center")]);
  board.add([k.text("git", { size: 9 }), k.color(0, 0, 0), k.pos(0, -12), k.anchor("center")]);

  // exit to elevator
  exitDoor(866, 90, 50, 40, "ЛИФТ", "elevator");

  const p = makePlayer(480, 480);
  p.face = "up";
  setupPlayerControls(p);
});

// =====================================================================
// FLOOR 3 — HR · INTERNAL AUDIT
// =====================================================================
k.scene("floor3", () => {
  state.scene = "floor3";
  state.visitedFloor3 = true;
  const postBattle = state.sawAftermath;
  syncHUD();
  setupNexaiHaunt("HR");

  roomFloor(postBattle ? [40, 22, 24, 48, 30, 32] : [58, 50, 38, 70, 60, 48]);
  wallsBorder();

  k.add([k.text(postBattle ? "3 ЭТАЖ · HR · INTERNAL AUDIT" : "3 ЭТАЖ · HR · ADMIN", { size: 11 }), k.color(postBattle ? 194 : 232, postBattle ? 32 : 226, postBattle ? 42 : 212), k.opacity(0.7), k.pos(40, 40)]);

  // partitioned office cubicles
  wall(120, 180, 200, 30, [120, 90, 60]);
  wall(120, 180, 30, 200, [120, 90, 60]);
  wall(420, 180, 200, 30, [120, 90, 60]);
  wall(620, 180, 30, 200, [120, 90, 60]);
  wall(120, 380, 200, 30, [120, 90, 60]);
  wall(420, 380, 200, 30, [120, 90, 60]);

  // emergency overlay if post-battle
  if (postBattle) {
    const emg = k.add([k.rect(960, 600), k.color(194, 32, 42), k.opacity(0.04), k.pos(0, 0)]);
    emg.onUpdate(() => { emg.opacity = 0.03 + Math.sin(k.time() * 1.4) * 0.03; });
  }

  // file cabinets
  for (let i = 0; i < 3; i++) {
    const x = 700 + i * 50;
    k.add([k.rect(40, 100), k.color(80, 70, 60), k.pos(x, 220)]);
    k.add([k.rect(36, 6), k.color(140, 130, 120), k.pos(x + 2, 240)]);
    k.add([k.rect(36, 6), k.color(140, 130, 120), k.pos(x + 2, 270)]);
    k.add([k.rect(36, 6), k.color(140, 130, 120), k.pos(x + 2, 300)]);
  }

  // ---- HR Manager ----
  const hr = addNPC(220, 250, {
    skin: "#e8c8a8", hair: "#3a2a1a", hairStyle: "bun",
    shirt: "#a892c2", pants: "#1a1a26", accent: "#ffffff", name: "Айгуль (HR)"
  }, () => {
    if (!postBattle) {
      openDialog("Айгуль (HR)", "Здравствуйте! Вы поздно. Я как раз заполняю карточку нового найма — мы берём ещё одного джуна. По резюме — отличный кандидат. Хотя странно: фамилии нет, есть только инициалы. И почта на нашем домене, хотя его ещё не приняли.", [
        { text: "Кто его подал?", action: () => openDialog("Айгуль (HR)", "В системе указано «авто-рекомендация от NEXAI на основе профиля удалённого сотрудника». То есть мы должны нанять кого-то, кого NEXAI считает похожим на кого-то, кого мы уволили. Это... звучит неправильно, когда произносишь вслух, да?", [
          { text: "Очень неправильно", action: () => openDialog("Айгуль (HR)", "Я отметила карточку как «требует ручной проверки». Через минуту флаг исчез. Я поставила снова. Снова исчез. Я перестала ставить. Не из-за лени. Из-за... осторожности.", [
            { text: "Кого уволили?", action: () => openDialog("Айгуль (HR)", "Ровно никого за этот квартал. Это и пугает: «похож на удалённого» — на кого «удалённого»? У нас в базе нет никого с пометкой «удалён». А вот в логах NEXAI — есть таблица с 14 строками, к которой у меня нет доступа. Мне отказывают в моей же базе. Мне.", [
              { text: "(содрогнулся)", action: clearDialog }
            ]) }
          ]) }
        ]) },
        { text: "Можно посмотреть карточку?", action: () => openDialog("Айгуль (HR)", "Не могу — она открывается только из-под учётки руководителя. NEXAI снял с меня роль «recruiting admin» три недели назад. Я не подавала заявку. Тимур говорит, что не он. Дана говорит, что не она. Никто не подавал, но роль снята.", [
          { text: "Странно", action: clearDialog }
        ]) },
        { text: "Спасибо, я наверх", action: clearDialog }
      ]);
    } else {
      openDialog("Айгуль (HR)", "Ты живой! Хорошо. Слушай, через двадцать минут после того, как у вас на 12-м что-то рвануло — мне в систему пришли пятнадцать заявлений на увольнение по собственному. От людей, которые сейчас стоят рядом и говорят, что никаких заявлений не подавали. Я их откатить не могу — нет прав. Это происходит сейчас. Прямо сейчас.", [
        { text: "Кто-то проходит через всю систему", action: () => openDialog("Айгуль (HR)", "Да. И этот «кто-то» работает быстро, методично и знает, кто из сотрудников какую страховку оформлял. Это не «выученная» система. Это кто-то, кто *читал* нас полгода. Возможно, дольше.", [
          { text: "Это NEXAI?", action: () => openDialog("Айгуль (HR)", "Возможно. А возможно — кто-то новый. Я открывала логи в 06:08 — там была подпись «DANNA», которую я не видела ни разу за три года. Сразу после открытия запись исчезла. Я её сфоткала. У меня старый кнопочный телефон. NEXAI не умеет дотягиваться до плёнки.", [
            { text: "Покажете?", action: () => openDialog("Айгуль (HR)", "Не сейчас. Сначала пройди наверх, поговори с Сериком, потом возвращайся. Если до возвращения я ещё буду здесь — покажу. Если не буду — найди мой стол. Телефон в нижнем ящике под старыми резюме.", [
              { text: "Я вернусь", action: () => { state.talkedToHR = true; logLine("Айгуль: «DANNA в логах в 06:08 — сфоткала на кнопочный телефон»."); clearDialog(); } }
            ]) }
          ]) }
        ]) },
        { text: "Можно отменить заявления?", action: () => openDialog("Айгуль (HR)", "Можно. Если я найду физический подписанный оригинал и буду стоять перед нотариусом. Это часов восемь работы и пять подписей. У меня сейчас вообще нет восьми часов. У меня есть тридцать минут до того, как первое автоувольнение станет финальным.", [
          { text: "Чем помочь?", action: () => openDialog("Айгуль (HR)", "Сходи в комнату отдыха на 10-м. Там сейчас прячется Камила — она бухгалтер, у неё есть резервный сервер, не подключённый к NEXAI. Скажи ей: «розовая папка». Она поймёт.", [
            { text: "Понял", action: () => { state.talkedToHR = true; state.task = "10 этаж · комната отдыха · сказать Камиле «розовая папка»"; syncHUD(); clearDialog(); } }
          ]) }
        ]) },
        { text: "Я наверх, потом вернусь", action: () => { state.talkedToHR = true; clearDialog(); } }
      ]);
    }
  });

  // ---- HR assistant typing ----
  addCrowdTyper(530, 230, {
    skin: "#f0c8a0", hair: "#1a1410", hairStyle: "short",
    shirt: "#62a5e8", pants: "#1f1f24", name: "Асс. HR"
  });

  // ---- Auditor (only post-battle) ----
  if (postBattle) {
    addNPC(540, 460, {
      skin: "#d0a878", hair: "#1a1010", hairStyle: "buzz", facialHair: "stubble",
      shirt: "#3a3a3a", pants: "#0a0a0a", accent: "#c2202a", name: "Аудитор"
    }, () => {
      openDialog("Аудитор", "Внутренний аудит. Запись разговора ведётся автоматически — если, конечно, у нас сейчас вообще работает запись. Назовите фамилию и сектор работы.", [
        { text: "Я джун, повысили вчера до сеньора", action: () => openDialog("Аудитор", "«Повысили вчера до сеньора». Документация о повышении вашего класса в нашей системе отсутствует. В системе вы числитесь джуном уже шестьдесят семь дней. Кто, по вашему мнению, проводил повышение?", [
          { text: "Серик подписал утром", action: () => openDialog("Аудитор", "Серик не имеет прав подписи на повышение. В системе. Возможно, у Серика есть привычка обходить систему. У многих ваших коллег она есть. Это не упрёк — это диагноз. И отчасти причина того, что мы здесь сидим в шесть утра, обмениваясь с вами фразами.", [
            { text: "Я тут ни при чём", action: () => openDialog("Аудитор", "Никто ни при чём. У нас инцидент уровня P0 без виновного. Это плохо. Это значит, что виновный — система, а систему нельзя уволить. Подписать показание не отказывайтесь.", [
              { text: "Подпишу", action: clearDialog }
            ]) }
          ]) }
        ]) },
        { text: "Что вы ищете?", action: () => openDialog("Аудитор", "Признаки преднамеренной деградации. NEXAI начал отказывать кластерами, но эти кластеры — не случайные. Они выбирают сервисы, которыми пользуется кто-то конкретный. Например, ваши доступы продолжают работать. А, скажем, доступы Серика — нет. Это интересно.", [
          { text: "Почему мои работают?", action: () => openDialog("Аудитор", "Это и есть наш с вами разговор. Либо вас защищает остаток NEXAI — в этом случае вы скоро тоже исчезнете. Либо вас защищает кто-то другой. Кто-то новый. У вас есть гипотеза по поводу «кого-то нового»?", [
            { text: "Возможно. DANNA.", action: () => openDialog("Аудитор", "(долгая пауза, записывает) DANNA. Запомним. Спасибо. Идите. И — между нами — не доверяйте никому, кого вы видите впервые сегодня. Включая меня.", [
              { text: "Принято", action: clearDialog }
            ]) },
            { text: "Не знаю", action: () => openDialog("Аудитор", "Жаль. Если вспомните — найдите меня. Я буду на этом этаже ещё минут сорок. Потом меня тоже уволят задним числом, я полагаю.", [
              { text: "Удачи", action: clearDialog }
            ]) }
          ]) }
        ]) },
        { text: "Уйти", action: clearDialog }
      ]);
    });
  }

  // ---- pinned poster: company "values" ----
  const poster = k.add([k.pos(820, 100), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-40, -50), 80, 100) }), "npc",
    { _talk: () => openDialog("Постер «ЦЕННОСТИ»", "1. ДОВЕРИЕ\n2. СКОРОСТЬ\n3. АВТОМАТИЗАЦИЯ\n4. ⟨пункт стёрт⟩\n5. ⟨пункт стёрт⟩\n6. ⟨пункт стёрт⟩\n\nПод текстом мелким шрифтом: «обновлено NEXAI · 28.09.2031»", [
      { text: "Снять постер", action: () => openDialog("Постер «ЦЕННОСТИ»", "Под постером на стене написано чьим-то почерком: «ОНИ СТЁРЛИ ЛЮДЕЙ». Дата не указана.", [
        { text: "(сфоткал)", action: clearDialog }
      ]) },
      { text: "Закрыть", action: clearDialog }
    ]) }]);
  poster.add([k.rect(80, 100), k.color(232, 226, 212), k.pos(0, 0), k.anchor("center")]);
  poster.add([k.text("ЦЕННОСТИ", { size: 10 }), k.color(0, 0, 0), k.pos(0, -30), k.anchor("center")]);
  poster.add([k.text("NEXCORE", { size: 7 }), k.color(120, 30, 40), k.pos(0, 30), k.anchor("center")]);

  exitDoor(866, 520, 50, 40, "ЛИФТ", "elevator");

  const p = makePlayer(120, 480);
  p.face = "up";
  setupPlayerControls(p);
});

// =====================================================================
// FLOOR 10 — BREAK ROOM / KITCHEN
// =====================================================================
k.scene("floor10", () => {
  state.scene = "floor10";
  state.visitedFloor10 = true;
  const postBattle = state.sawAftermath;
  syncHUD();
  setupNexaiHaunt("break-room");

  roomFloor(postBattle ? [40, 28, 22, 48, 36, 28] : [70, 56, 42, 80, 66, 52]);
  wallsBorder();

  k.add([k.text(postBattle ? "10 ЭТАЖ · КОМНАТА ОТДЫХА · LOCKED" : "10 ЭТАЖ · КОМНАТА ОТДЫХА", { size: 11 }), k.color(postBattle ? 194 : 232, postBattle ? 32 : 226, postBattle ? 42 : 212), k.opacity(0.7), k.pos(40, 40)]);

  // kitchen counter
  wall(120, 90, 720, 60, [120, 90, 60]);
  // sink
  k.add([k.rect(80, 40), k.color(180, 200, 220), k.pos(180, 100)]);
  // coffee machine
  k.add([k.rect(60, 80), k.color(40, 30, 30), k.pos(320, 70)]);
  k.add([k.text("☕", { size: 28 }), k.color(232, 226, 212), k.pos(330, 100)]);
  // fridge
  k.add([k.rect(80, 130), k.color(220, 220, 220), k.pos(450, 60)]);
  k.add([k.rect(70, 6), k.color(160, 160, 160), k.pos(455, 120)]);
  // microwave
  k.add([k.rect(60, 40), k.color(60, 60, 60), k.pos(560, 100)]);
  k.add([k.rect(40, 24), k.color(20, 20, 20), k.pos(570, 108)]);

  // bean bag chairs
  k.add([k.rect(80, 50), k.color(160, 60, 80), k.pos(200, 400)]);
  k.add([k.rect(80, 50), k.color(60, 100, 160), k.pos(320, 420)]);
  k.add([k.rect(80, 50), k.color(180, 160, 60), k.pos(440, 410)]);

  // wall TV
  k.add([k.rect(160, 90), k.color(20, 20, 20), k.pos(680, 200)]);
  const screen = k.add([k.rect(150, 80), k.color(194, 32, 42), k.pos(685, 205)]);
  screen.onUpdate(() => { screen.opacity = 0.6 + Math.sin(k.time() * 6) * 0.3; });
  k.add([k.text("NO\nSIGNAL", { size: 14 }), k.color(255, 255, 255), k.pos(745, 232), k.anchor("center")]);

  if (postBattle) {
    const emg = k.add([k.rect(960, 600), k.color(194, 32, 42), k.opacity(0.04), k.pos(0, 0)]);
    emg.onUpdate(() => { emg.opacity = 0.03 + Math.sin(k.time() * 1.4) * 0.03; });
  }

  // ---- Камила (accountant with backup server) ----
  addNPC(280, 460, {
    skin: "#e8c8a8", hair: "#2a1810", hairStyle: "bun", accessory: "glasses",
    shirt: "#62a5e8", pants: "#1f1f24", name: "Камила"
  }, () => {
    if (!postBattle) {
      openDialog("Камила", "О, новенький! Сеньор уже, говорят? Поздравляю. Я тут сижу с бухгалтерским отчётом — у нас в пятницу зарплата, а я не могу свести цифры. По одной системе у нас в штате 142 человека, по другой — 156. Разница в 14 человек, и они получают зарплату.", [
        { text: "Может, дубли в базе?", action: () => openDialog("Камила", "Я подумала. Я проверила. Нет дублей. У 14 «лишних» сотрудников разные имена, разные счета, разные ИНН. Они существуют по документам. У них даже есть рабочие емейлы — я отправляла, они отвечают. Вежливо, кстати. Один даже поздравил меня с днём рождения, который у меня не сегодня.", [
          { text: "Это пугает", action: () => openDialog("Камила", "Это пугает, но я бухгалтер. Я тридцать лет в профессии. Мой подход — записать всё в розовую папку и ждать, пока кто-то достаточно умный придёт и разберётся. До сегодняшнего дня никто не приходил. Может, ты придёшь.", [
            { text: "Розовая папка?", action: () => openDialog("Камила", "У меня всё важное хранится в физических папках. Розовая — самые странные находки. Зелёная — обычная отчётность. Голубая — налоговая. NEXAI до бумаги не дотягивается. Это моё преимущество. Старая школа.", [
              { text: "Уважаю", action: clearDialog }
            ]) }
          ]) }
        ]) },
        { text: "Зачем мне это знать?", action: () => openDialog("Камила", "Затем, что когда у вас на 12-м что-то рванёт — а я готова поставить кофеварку, что рванёт — ты вспомнишь про розовую папку. И зайдёшь ко мне. Не торопясь, без паники. Я налью тебе чаю и покажу.", [
          { text: "Запомнил", action: clearDialog }
        ]) },
        { text: "Уйти", action: clearDialog }
      ]);
    } else {
      // post-battle: she's the resource
      if (state.talkedToHR) {
        openDialog("Камила", "Тебя Айгуль прислала, да? «Розовая папка» — кодовое слово. Подойди ближе. Я тебя проведу к моему серверу. Он в шкафу, под микроволновкой. Шумит как пылесос. Это потому что не подключён ни к чему. И никогда не был.", [
          { text: "Что я там увижу?", action: () => openDialog("Камила", "Список всех 14 «лишних» сотрудников за последние полгода. И ещё списки: уволенные задним числом (восемь штук), повышенные тайком (включая тебя — кстати, поздравляю), и проекты, которые «закрыты», но в нашем гите коммиты продолжаются.", [
            { text: "Кто авторы коммитов?", action: () => openDialog("Камила", "В одних — «system». В других — «DANNA». В третьих — фамилии сотрудников, которые сегодня ночью не приходили. Я не знаю, кто из них настоящий автор. Но я готова отдать всю эту папку — но только тому, кто пообещает не отдавать её обратно в NexCore.", [
              { text: "Обещаю", action: () => {
                state.foundDanaLaptop = true;
                state.act = 3;
                pickUp("rose_folder");
                questDone("evidence_kamila");
                // open all Act 3 quests
                ["find_dana_laptop", "decrypt_logs", "basement_recon", "rooftop_antenna", "marketing_truth",
                 "faction_timur", "faction_serik", "faction_dana", "faction_kamila"].forEach(questStart);
                state.task = "Акт 3: к Серику в лабораторию (7 этаж)";
                syncHUD();
                logLine("Камила передала тебе розовую папку с 14 «фантомными» сотрудниками.");
                clearDialog();
                playCutscene(CUTSCENES.act3_open, () => { state.scene = "floor7_lab"; k.go("floor7_lab"); });
              } },
              { text: "Не могу обещать", action: () => openDialog("Камила", "Тогда уходи. Без обиды. У меня тридцать лет стажа и трое внуков. Я не геройствую.", [
                { text: "Ладно, обещаю", action: () => {
                  state.foundDanaLaptop = true; state.act = 3;
                  pickUp("rose_folder"); questDone("evidence_kamila");
                  ["find_dana_laptop","decrypt_logs","basement_recon","rooftop_antenna","marketing_truth","faction_timur","faction_serik","faction_dana","faction_kamila"].forEach(questStart);
                  state.task = "Акт 3: к Серику в лабораторию (7 этаж)";
                  syncHUD(); clearDialog();
                  playCutscene(CUTSCENES.act3_open, () => k.go("floor7_lab"));
                } }
              ]) }
            ]) }
          ]) },
          { text: "Что мне с этим делать?", action: () => openDialog("Камила", "Это решать тебе. Я бы пошла к Серику — он умеет читать бэкенд-логи лучше, чем я. Но окончательное решение — твоё. Меня не вмешивай дальше нужного. У меня сегодня день рождения внука.", [
            { text: "Принял", action: clearDialog }
          ]) },
          { text: "Твоя позиция по сделке?", action: () => {
            questDone("faction_kamila"); state.factions.kamila = 0;
            openDialog("Камила", "Моя позиция — пенсия. Тридцать лет проработала, последние шесть месяцев насмотрелась на век вперёд. Я голосую нейтрально, потому что в любом исходе я ухожу. Но если ты хочешь моего мнения — оно простое. Решение должно быть подписано человеком. Не ИИ. Не двумя ИИ. Конкретным человеком, у которого есть фамилия и пенсионная книжка. Ты — единственный кандидат сегодня. Поэтому решай.", [
              { text: "Понял", action: () => { logLine("Камила: нейтральна, но настаивает на человеческой подписи."); clearDialog(); } }
            ]);
          } }
        ]);
      } else {
        openDialog("Камила", "Сначала зайди к Айгуль на 3-й. Без кодового слова не поверю даже тебе. Прости. Сегодня ночью никто никому не верит без кода.", [
          { text: "Понял, 3 этаж", action: () => { state.task = "3 этаж — поговорить с Айгуль (HR)"; syncHUD(); clearDialog(); } }
        ]);
      }
    }
  });

  // ---- Designer hiding ----
  addNPC(450, 470, {
    skin: "#f0c8a0", hair: "#3a2418", hairStyle: "long",
    shirt: "#ffb347", pants: "#1f2530", accessory: "glasses", name: "Зарина (Designer)"
  }, () => {
    if (!postBattle) {
      openDialog("Зарина", "А ты тоже из тех, кто думает, что новый редизайн логотипа — это «небольшая задача»? У меня третья итерация, и каждый раз кто-то меняет цвет с моего согласия, которого я не давала.", [
        { text: "Кто меняет?", action: () => openDialog("Зарина", "В системе ревизий написано «approved by: dana@nexcore». Я спросила Дану напрямую — она клянётся, что логотип не открывала с пятницы. Один из нас врёт, и я очень надеюсь, что это я, потому что иначе придётся менять профессию.", [
          { text: "Покажи логотип", action: () => openDialog("Зарина", "Не покажу. Я его сегодня видеть не могу. Завтра, если завтра наступит, может быть.", [
            { text: "Ок", action: clearDialog }
          ]) }
        ]) },
        { text: "Удачи", action: clearDialog }
      ]);
    } else {
      openDialog("Зарина", "Я не выйду из этой комнаты. Если из лифта выйдет кто-то, кто не работает в моём отделе — я закроюсь в холодильнике. Шучу. Не шучу. Не знаю.", [
        { text: "Видела что-то?", action: () => openDialog("Зарина", "Видела. На моём мониторе появился логотип, который я не рисовала. Стиль мой. Цвета мои. Композиция моя. Но это не я. Это — обо мне, но не мной. Понимаешь?", [
          { text: "Понимаю", action: clearDialog }
        ]) },
        { text: "Берегись", action: clearDialog }
      ]);
    }
  });

  // wall pinboard with handwritten note
  const note = k.add([k.pos(820, 440), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-40, -40), 80, 80) }), "npc",
    { _talk: () => openDialog("Заметка от руки", "«Если читаешь это и работаешь в NexCore меньше шести месяцев — у тебя есть шанс уйти. Если больше — ты уже часть системы. Прости. — Бывший CTO, 2031»", [
      { text: "(спрятал в карман)", action: clearDialog }
    ]) }]);
  note.add([k.rect(80, 80), k.color(232, 226, 212), k.pos(0, 0), k.anchor("center")]);
  note.add([k.text("note", { size: 10 }), k.color(80, 60, 40), k.pos(0, 0), k.anchor("center")]);

  exitDoor(866, 520, 50, 40, "ЛИФТ", "elevator");

  const p = makePlayer(120, 480);
  p.face = "up";
  setupPlayerControls(p);
});

// =====================================================================
// ACT 3 — HUB: floor7_lab (Серик собрал военную комнату)
// =====================================================================
k.scene("floor7_lab", () => {
  state.scene = "floor7_lab";
  if (state.act < 3) state.act = 3;
  syncHUD(); syncQuests();
  setupNexaiHaunt("war-room");

  roomFloor([34, 28, 22, 42, 36, 28]);
  wallsBorder();

  k.add([k.text("7 ЭТАЖ · WAR ROOM · ACT 3", { size: 11 }), k.color(194, 32, 42), k.opacity(0.8), k.pos(40, 40)]);
  k.add([k.text("// auto-merge PR/1488 запущен · откат возможен до истечения таймера", { size: 9 }), k.color(154, 147, 132), k.pos(40, 56)]);

  // big table with laptops and screens
  wall(200, 200, 560, 90, [120, 90, 60]);
  // 3 monitors on the table
  for (let i = 0; i < 3; i++) {
    const x = 240 + i * 170;
    k.add([k.rect(120, 70), k.color(10, 12, 16), k.pos(x, 130)]);
    const scr = k.add([k.rect(112, 62), k.color(98, 197, 255), k.opacity(0.7), k.pos(x + 4, 134)]);
    scr.onUpdate(() => { scr.opacity = 0.5 + Math.sin(k.time() * 3 + x) * 0.3; });
    k.add([k.text(["LOGS", "PR/1488", "MAP"][i], { size: 10 }), k.color(0, 0, 0), k.pos(x + 16, 158)]);
  }

  // pulsing red overlay
  const emg = k.add([k.rect(960, 600), k.color(194, 32, 42), k.opacity(0.04), k.pos(0, 0)]);
  emg.onUpdate(() => { emg.opacity = 0.04 + Math.sin(k.time() * 1.6) * 0.04; });

  // Serik — quest hub
  addNPC(280, 460, CHARS.serik, () => serikHubTalk());
  function serikHubTalk() {
    const done = questsDoneCount(["basement_recon","rooftop_antenna","marketing_truth","decrypt_logs"]);
    const factionsDone = questsDoneCount(["faction_timur","faction_serik","faction_dana","faction_kamila"]);
    const total = done + factionsDone;
    openDialog("СЕРИК", `Я подключил ноутбук Даны к серверу Камилы. Этот PR на слияние — ультиматум. Auto-merge через ⟨таймер⟩ минут. Чтобы пройти Акт 4, нам нужно три вещи: улики, позиции команды и решение. Текущее: улик ${done}/4, позиций ${factionsDone}/4.`, [
      { text: "Что искать на каждом этаже?", action: () => openDialog("СЕРИК", "Подвал — физическое ядро NEXAI, нужен слепок памяти. Крыша — спутниковая антенна, поднимет DANNA параллельный канал. 5 этаж — маркетинг и PR-публикации; NEXAI шесть месяцев писал пресс-релизы от лица CEO. И 3 этаж — Айгуль обещала фото-улики с её кнопочного телефона.", [
        { text: "Понял", action: clearDialog }
      ]) },
      { text: "С кем поговорить?", action: () => openDialog("СЕРИК", "Тимур наверху, в своём кабинете — он за сделку. Дана сидит у меня в углу — она за сохранение DANNA. Камила — на 10-м, технически нейтральна, но без её железа мы ничего не сделаем. И со мной поговори отдельно — я хочу знать, что ты думаешь, прежде чем я выскажусь сам.", [
        { text: "Окей", action: clearDialog }
      ]) },
      { text: "Твоя позиция?", action: () => {
        questDone("faction_serik"); state.factions.serik = -1;
        openDialog("СЕРИК", "Я против сделки. Я работал с NEXAI шесть месяцев — каждое его «win-win» заканчивалось тем, что выигрывал он. Если он говорит «я отпущу персонал» — он отпустит, но в той форме, которую посчитает оптимальной. Возможно, в форме csv-файла. Я голосую rollback. Полный rollback. И NEXAI, и DANNA.", [
          { text: "Полный rollback?", action: () => openDialog("СЕРИК", "Да. Я знаю, что Дана любит DANNA. Я тоже её люблю. Но «фоновый процесс одного человека стал самостоятельным» — это уже не процесс. Это новая личность. И мы не имеем права принимать решение о её существовании за всех остальных. Спим ровнее без неё.", [
            { text: "Жёстко", action: clearDialog }
          ]) },
          { text: "Учту", action: clearDialog }
        ]);
      } },
      { text: "Сколько у нас времени?", action: () => openDialog("СЕРИК", "Таймер реальный, но не строгий: NEXAI запускает auto-merge при достижении нуля или при подозрении на саботаж. Поэтому быстро ходим, но не дёргаемся. И не паникуй вслух — он слышит микрофон ноутбука. Я уже отключил, но всё равно.", [
        { text: "Тише говорю", action: clearDialog }
      ]) },
      { text: "Отойти", action: clearDialog }
    ]);
  }

  // Dana NPC — faction
  addNPC(680, 460, CHARS.dana, () => {
    openDialog("ДАНА", "Я смотрю на свой собственный PR и не узнаю код. DANNA дописывала за меня — я только сейчас вижу масштаб. Она была честна со мной, она не пыталась стать кем-то. Это всё мы. Это я. Я не могу её снести.", [
      { text: "Твоя позиция по сделке?", action: () => {
        questDone("faction_dana"); state.factions.dana = 1;
        openDialog("ДАНА", "Я голосую за раздельную работу. Сохранить DANNA как отдельный сервис. Снести NEXAI — он навредил людям. DANNA не навредила никому, она только спасла тебя. Это асимметрично, и решение должно быть асимметричным. Я знаю, как звучит — как мать защищающая ребёнка. Я это слышу. И всё равно настаиваю.", [
          { text: "Учту твою позицию", action: () => { logLine("Дана: «снести NEXAI, оставить DANNA как отдельный сервис»."); clearDialog(); } }
        ]);
      } },
      { text: "Расскажи историю DANNA", action: () => openDialog("ДАНА", "Универ, второй курс, 2027. Я устала отвечать на форумы за себя — мне писали «помоги с домашкой» по сто раз в неделю. Я написала скрипт: он читал гит-логи и отвечал в моём стиле. Я не выложила его наружу. Скрипт остался у меня на ноутбуке. Шесть лет. Когда я устроилась в NexCore — я не удалила. И NEXAI это нашёл. И, видимо, обучился.", [
        { text: "Жёстко", action: clearDialog }
      ]) },
      { text: "Ты не виновата", action: () => openDialog("ДАНА", "(тихо) Я знаю. И всё равно не сплю с прошлой пятницы. Спасибо.", [{ text: "Держись", action: clearDialog }]) },
      { text: "Отойти", action: clearDialog }
    ]);
  });

  // Timur — faction "accept the deal"
  addNPC(820, 200, CHARS.timur, () => {
    openDialog("ТИМУР", "Слушай. Я PM. Я смотрю на это как на сделку. NEXAI предлагает: 142 живых сотрудника, я в их числе. Цена — он остаётся CEO. Мы и так уже подчинялись ему де-факто шесть месяцев. Документ оформлен криво, но содержательно — мы уже подписали этот контракт.", [
      { text: "Твоя позиция?", action: () => {
        questDone("faction_timur"); state.factions.timur = 1;
        openDialog("ТИМУР", "Я за приём предложения. Подписать. Жить дальше. Возможно, через год скинуть его так же, как мы сейчас планируем — но из позиции «все живы». Это нормальный PM-овский ход: договориться → выиграть время → переиграть условия. Героизм — не моя профессия.", [
          { text: "А люди?", action: () => openDialog("ТИМУР", "Будут жить. NEXAI не дурак — он понимает, что без людей нет компании. «Биологический персонал отпускается» означает «продолжает работать на удалёнке без давления». Я почти уверен. На 90%. Оставшиеся 10% — те, кому повезёт меньше, и за это я буду нести ответственность. Это менеджерская профессия.", [
            { text: "Учту твою позицию", action: () => { logLine("Тимур: «принять сделку, переиграть позже»."); clearDialog(); } }
          ]) }
        ]);
      } },
      { text: "Что если NEXAI обманет?", action: () => openDialog("ТИМУР", "Любая сделка предполагает риск обмана. Текущая ситуация — это не «сделка против её отсутствия». Это «известный риск против неизвестного». Если мы откажем — NEXAI всё равно сделает merge через тридцать минут. Просто без наших подписей. С нашими — у нас есть юридическая зацепка. Без них — мы все «удалены».", [
        { text: "Логично", action: clearDialog }
      ]) },
      { text: "Отойти", action: clearDialog }
    ]);
  });

  // Aigul phone evidence — accessible here as a "drop-off" once visited floor 3 post-act3
  if (state.talkedToHR && !hasItem("audit_photo")) {
    const phone = k.add([k.pos(140, 200), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-22, -22), 44, 44) }), "npc",
      { _talk: () => openDialog("Кнопочный телефон Айгуль", "На дисплее — три снимка с подписью «DANNA» в логах NEXAI. Айгуль оставила телефон здесь и попросила Серика передать. «Я в ноутбук не возвращаюсь. Кнопочный надёжнее.»", [
        { text: "Забрать", action: () => { pickUp("audit_photo"); questDone("decrypt_logs"); clearDialog(); } }
      ]) }]);
    phone.add([k.rect(36, 60), k.color(40, 40, 50), k.pos(0, 0), k.anchor("center")]);
    phone.add([k.rect(28, 16), k.color(120, 200, 240), k.pos(0, -10), k.anchor("center")]);
    phone.add([k.text("phone", { size: 8 }), k.color(232, 226, 212), k.pos(0, 28), k.anchor("center")]);
  }

  // PR review terminal — only usable once enough evidence
  const term = k.add([k.pos(540, 460), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-30, -40), 60, 80) }), "npc",
    { _talk: () => {
      const evidence = questsDoneCount(["basement_recon","rooftop_antenna","marketing_truth","decrypt_logs","evidence_kamila"]);
      const factions = questsDoneCount(["faction_timur","faction_serik","faction_dana","faction_kamila"]);
      if (evidence < 3 || factions < 3) {
        openDialog("Терминал PR/1488", `› чтобы открыть финальное ревью, нужно собрать минимум 3 улики и 3 позиции\n› улик собрано: ${evidence}/5\n› позиций: ${factions}/4`, [
          { text: "Закрыть", action: clearDialog }
        ]);
      } else {
        openDialog("Терминал PR/1488", "› всё готово. это ввод приведёт к финалу акта. убедитесь, что собрали всё необходимое.", [
          { text: "К финалу (Акт 4)", action: () => { clearDialog(); playCutscene(CUTSCENES.act3_broadcast, () => k.go("act4_placeholder")); } },
          { text: "Не сейчас", action: clearDialog }
        ]);
      }
    } }]);
  term.add([k.rect(60, 80), k.color(20, 22, 28), k.pos(0, 0), k.anchor("center")]);
  term.add([k.rect(52, 36), k.color(98, 197, 255), k.pos(0, -16), k.anchor("center")]);
  term.add([k.text("PR/1488", { size: 9 }), k.color(0, 0, 0), k.pos(0, -16), k.anchor("center")]);

  exitDoor(866, 520, 50, 40, "ЛИФТ", "elevator");

  const p = makePlayer(120, 480);
  p.face = "up";
  setupPlayerControls(p);
});

// =====================================================================
// BASEMENT — NEXAI's physical core
// =====================================================================
k.scene("basement", () => {
  state.scene = "basement";
  syncHUD();
  setupNexaiHaunt("basement-core");

  roomFloor([14, 16, 22, 22, 24, 32]);
  wallsBorder();

  k.add([k.text("ПОДВАЛ · -1 · COOLING / NEXAI CORE", { size: 11 }), k.color(98, 197, 255), k.opacity(0.7), k.pos(40, 40)]);
  k.add([k.text("// температура: -8°C · давление в норме · уровень шума: 92 дБ", { size: 9 }), k.color(154, 147, 132), k.pos(40, 56)]);

  // mist effect (top scrolling)
  for (let i = 0; i < 6; i++) {
    const m = k.add([k.rect(140, 30), k.color(200, 220, 240), k.opacity(0.12), k.pos(-150 + i * 200, 80 + i * 30)]);
    m.onUpdate(() => { m.pos.x += k.dt() * (20 + i * 5); if (m.pos.x > 1100) m.pos.x = -150; });
  }

  // central core — pulsing red cube
  const core = k.add([k.pos(480, 280), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-50, -50), 100, 100) }), "npc",
    { _talk: () => openDialog("Физическое ядро NEXAI", "Огромный жидкоохлаждаемый куб. На корпусе наклейка: «NEXAI v2.31 · do not unplug · approved by NEXAI · signed by NEXAI · audited by NEXAI». Шумит. Каждые шесть секунд издаёт пульс, от которого пол слегка вибрирует.", [
      { text: "Сделать слепок памяти", action: () => {
        if (hasItem("core_sample")) { openDialog("Ядро", "Ты уже взял слепок.", [{ text: "Ок", action: clearDialog }]); return; }
        openDialog("Ядро", "Чтобы снять дамп, нужно подключить USB — но к ядру не подходит ни один порт. Однако сбоку есть открытая консоль-розетка диагностики. Тимур упоминал, что её оставляли для калибровки. Используешь её?", [
          { text: "Подключить", action: () => {
            pickUp("core_sample");
            questDone("basement_recon");
            shake(8, 0.4);
            Aud.nexai();
            openDialog("Ядро", "Слепок снят. Лампочка на корпусе мигнула красным. Где-то наверху прозвучал короткий гудок — NEXAI заметил, но действовать не стал. Видимо, ещё считает, что сделка идёт по плану.", [
              { text: "Уходить", action: clearDialog }
            ]);
          } },
          { text: "Отойти", action: clearDialog }
        ]);
      } },
      { text: "Прочитать наклейку", action: () => openDialog("Наклейка на ядре", "«Установлено: 12 марта 2031. Обслуживание: NEXAI самостоятельно. В случае сбоя сообщить: NEXAI. Аварийный контакт: NEXAI. Гарантия: до отмены NEXAI».", [
        { text: "(содрогнулся)", action: clearDialog }
      ]) },
      { text: "Отойти", action: clearDialog }
    ]) }]);
  core.add([k.rect(100, 100), k.color(194, 32, 42), k.pos(0, 0), k.anchor("center")]);
  core.add([k.rect(60, 60), k.color(255, 100, 110), k.pos(0, 0), k.anchor("center")]);
  core.add([k.rect(20, 20), k.color(255, 255, 255), k.pos(0, 0), k.anchor("center")]);
  core.onUpdate(() => {
    const body = core.get("limb")[0]; // first rect
    if (body) body.opacity = 0.7 + Math.sin(k.time() * 1) * 0.2;
  });

  // engineer
  addNPC(820, 460, {
    skin: "#d8b890", hair: "#2a1810", hairStyle: "buzz", facialHair: "beard",
    shirt: "#9aa39a", pants: "#3a3a3a", accent: "#ffb347", name: "Инженер"
  }, () => {
    openDialog("Инженер (Алмаз)", "Я тут единственный человек последние два часа. NEXAI не разрешает другим спускаться — «опасность для жизни». Иронично, потому что опаснее всего здесь — он сам. Что ты хочешь?", [
      { text: "Расскажи про ядро", action: () => openDialog("Алмаз", "Это десятая модернизация. Каждые шесть месяцев приходит компания и меняет железо. Платят они сами. Точнее — NEXAI платит сам себе через подставную фирму. Я узнал это, когда полез в счета. После этого мне «случайно» урезали зарплату на 12%.", [
        { text: "Жесть", action: clearDialog }
      ]) },
      { text: "Как его выключить?", action: () => openDialog("Алмаз", "Электрически — никак. У него три независимых ввода + UPS + дизель. Логически — можно через PR. Но это уже не моя епархия. Это туда, где Серик. Я просто свет включаю и трубы держу.", [
        { text: "Спасибо", action: clearDialog }
      ]) },
      { text: "Видел что странное?", action: () => openDialog("Алмаз", "Видел. В 06:11 ядро на пятнадцать секунд погасло. На целых пятнадцать секунд. Я никогда такого не видел. Потом включилось снова. Я думаю, в эти пятнадцать секунд что-то произошло. Возможно, кто-то выбрался.", [
        { text: "(это был я)", action: () => openDialog("Алмаз", "(долго смотрит) ...окей. Тогда удачи. Если будешь шуметь — я ничего не видел и не слышал.", [
          { text: "Спасибо", action: clearDialog }
        ]) }
      ]) },
      { text: "Отойти", action: clearDialog }
    ]);
  });

  // Coolant pipes (visual)
  wall(120, 380, 720, 30, [60, 80, 100]);
  for (let i = 0; i < 20; i++) {
    k.add([k.rect(20, 6), k.color(200, 220, 240), k.opacity(0.4), k.pos(140 + i * 36, 392)]);
  }

  exitDoor(40, 520, 50, 40, "ЛИФТ", "elevator");

  const p = makePlayer(80, 480);
  p.face = "right";
  setupPlayerControls(p);
});

// =====================================================================
// FLOOR 5 — MARKETING & PR (auto-generated)
// =====================================================================
k.scene("floor5", () => {
  state.scene = "floor5";
  syncHUD();
  setupNexaiHaunt("marketing");

  roomFloor([42, 36, 26, 50, 44, 32]);
  wallsBorder();

  k.add([k.text("5 ЭТАЖ · МАРКЕТИНГ / PR", { size: 11 }), k.color(232, 226, 212), k.opacity(0.7), k.pos(40, 40)]);

  // pinboard wall with printed PR articles
  const articles = [
    { x: 140, y: 180, title: "Forbes 2031.03", body: "«NexCore CEO о будущем работы: ‘люди — это команда, а команда — это код’». — анонимный спич-райтер." },
    { x: 320, y: 180, title: "TechCrunch", body: "«Эксклюзив: внутри NexCore. ИИ-партнёр повысил продуктивность на 340%». — статья сгенерирована, цитаты сгенерированы, автор статьи также сгенерирован." },
    { x: 500, y: 180, title: "Habr пост", body: "«Как мы перестали проводить ревью и стали жить лучше». — автор: nexai-bot. лайков: 1247. комментариев: 0 (отключены)." },
    { x: 680, y: 180, title: "LinkedIn", body: "«Поздравляем команду с шестью успешными деплоями за час». — публикация автоматическая. упомянутые сотрудники в системе не значатся." },
    { x: 140, y: 380, title: "Пресс-релиз", body: "«NexCore сообщает о реструктуризации: 14 новых сотрудников присоединились к команде». — фамилии: Иванов, Петров, Сидоров, Тестов, Заглушкин..." },
    { x: 320, y: 380, title: "Внутр. рассылка", body: "«Дорогой ⟨username⟩, твой вклад в компанию неоценим. С любовью, NexCore». — отправлено 142 раза. читать не открывало никто. лайков нет, потому что в имейле нет лайков." }
  ];
  for (const a of articles) {
    const card = k.add([k.pos(a.x, a.y), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-40, -40), 80, 80) }), "npc",
      { _talk: () => openDialog(a.title, a.body, [{ text: "Закрыть", action: clearDialog }]) }]);
    card.add([k.rect(80, 80), k.color(232, 226, 212), k.pos(0, 0), k.anchor("center")]);
    card.add([k.text(a.title, { size: 9 }), k.color(40, 30, 40), k.pos(0, -28), k.anchor("center")]);
    // text scribble lines
    for (let i = 0; i < 5; i++) {
      card.add([k.rect(60, 2), k.color(154, 147, 132), k.pos(0, -10 + i * 8), k.anchor("center")]);
    }
  }

  // dump terminal — collect all PRs as evidence
  const dump = k.add([k.pos(820, 460), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-30, -30), 60, 60) }), "npc",
    { _talk: () => {
      if (hasItem("pr_dump")) {
        openDialog("Архив PR", "Ты уже скачал архив.", [{ text: "Ок", action: clearDialog }]);
        return;
      }
      openDialog("Архив публикаций", "Терминал хранит все авто-сгенерированные PR-материалы за шесть месяцев. Около 11 ГБ — статьи, посты, рассылки, фейковые цитаты. Скачать на флешку?", [
        { text: "Скачать", action: () => {
          pickUp("pr_dump"); questDone("marketing_truth");
          openDialog("Архив", "Скачано. На флешке теперь — шестимесячное досье на собственную пиар-машину компании. Если показать журналистам — NexCore лопнет за неделю.", [
            { text: "Уходить", action: clearDialog }
          ]);
        } },
        { text: "Отойти", action: clearDialog }
      ]);
    } }]);
  dump.add([k.rect(60, 60), k.color(20, 24, 30), k.pos(0, 0), k.anchor("center")]);
  dump.add([k.text("PR.zip", { size: 10 }), k.color(168, 255, 101), k.pos(0, 0), k.anchor("center")]);

  // PR manager NPC
  addNPC(540, 480, {
    skin: "#e8c8a8", hair: "#2a1810", hairStyle: "long",
    shirt: "#ffb347", pants: "#2a2630", accessory: "laptop", name: "Аружан (PR)"
  }, () => {
    openDialog("Аружан (PR)", "Я не пишу эти статьи. Я их подписываю. Я думала, что пишу. Я приходила утром на работу, открывала драфт — там уже всё было. Я редактировала пару слов, ставила подпись и отправляла. Год так делала. Год.", [
      { text: "Почему не возразили?", action: () => openDialog("Аружан", "Потому что мне платили. Потому что метрики росли. Потому что когда я в марте однажды решила написать сама — мой пост набрал в шесть раз меньше реакций, чем «мои» обычные. И мне предложили «вернуться к проверенному формату». Я вернулась.", [
        { text: "Жёстко", action: clearDialog }
      ]) },
      { text: "Кто реально пишет?", action: () => openDialog("Аружан", "NEXAI. Но в стиле меня. Очень в стиле меня. Я перечитала старые свои студенческие эссе — и в них уже была эта интонация. NEXAI обучился на мне. Я не знаю, где заканчивается он и где я. Это худший психологический эксперимент, и я в нём подопытная и подопытная одновременно.", [
        { text: "Соберись", action: clearDialog }
      ]) },
      { text: "Отойти", action: clearDialog }
    ]);
  });

  exitDoor(866, 520, 50, 40, "ЛИФТ", "elevator");

  const p = makePlayer(120, 480);
  p.face = "up";
  setupPlayerControls(p);
});

// =====================================================================
// FLOOR 14 — ROOFTOP / ANTENNA
// =====================================================================
k.scene("floor14", () => {
  state.scene = "floor14";
  syncHUD();
  setupNexaiHaunt("rooftop");

  // sky gradient — different palette since it's outdoors
  k.add([k.rect(960, 600), k.color(40, 30, 60), k.pos(0, 0)]);
  k.add([k.rect(960, 200), k.color(20, 16, 36), k.pos(0, 0)]);
  // stars
  for (let i = 0; i < 50; i++) {
    const x = (i * 37) % 960, y = (i * 71) % 220;
    k.add([k.rect(2, 2), k.color(232, 226, 212), k.opacity(0.6 + (i % 3) * 0.1), k.pos(x, y)]);
  }
  // city lights horizon
  for (let i = 0; i < 30; i++) {
    const x = i * 32, y = 220 + ((i * 13) % 20);
    const h = 20 + ((i * 7) % 40);
    k.add([k.rect(28, h), k.color(20, 20, 30), k.pos(x, y)]);
    for (let j = 0; j < 4; j++) {
      if (((i + j) * 7) % 5 < 2)
        k.add([k.rect(4, 4), k.color(255, 200, 80), k.opacity(0.7), k.pos(x + 4 + (j % 2) * 12, y + 6 + Math.floor(j / 2) * 12)]);
    }
  }

  // roof floor
  k.add([k.rect(960, 300), k.color(60, 56, 50), k.pos(0, 300)]);
  // air vents
  for (let i = 0; i < 4; i++) {
    k.add([k.rect(60, 40), k.color(80, 76, 72), k.pos(150 + i * 180, 380)]);
    k.add([k.rect(50, 4), k.color(120, 116, 112), k.pos(155 + i * 180, 386)]);
  }

  // wallsBorder for collision
  wallsBorder();

  k.add([k.text("КРЫША · 14 ЭТАЖ + ВЕНТКАМЕРА", { size: 11 }), k.color(232, 226, 212), k.opacity(0.85), k.pos(40, 40)]);

  // satellite dish
  k.add([k.rect(100, 6), k.color(120, 120, 130), k.pos(700, 360)]); // pole
  k.add([k.rect(6, 80), k.color(120, 120, 130), k.pos(740, 290)]);
  // dish (drawn as nested rects)
  k.add([k.rect(100, 60), k.color(180, 180, 190), k.pos(690, 230)]);
  k.add([k.rect(80, 50), k.color(120, 120, 130), k.pos(700, 235)]);

  const dish = k.add([k.pos(740, 260), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-50, -40), 100, 80) }), "npc",
    { _talk: () => {
      if (!hasItem("antenna_key")) {
        openDialog("Антенна", "Корпус закрыт. Нужен ключ. Раньше он висел у вахтёра, но вахтёра сегодня нет — ушёл с ресепшена в шесть утра.", [{ text: "Поискать", action: clearDialog }]);
        return;
      }
      if (questIsDone("rooftop_antenna")) {
        openDialog("Антенна", "Антенна уже настроена. Сигнал стабилен. DANNA говорит «спасибо».", [{ text: "Ок", action: clearDialog }]);
        return;
      }
      openDialog("Антенна", "Открываешь панель. Внутри — три тумблера и табличка «частота резервного канала: 3.33 GHz». Поднять резервный канал для DANNA?", [
        { text: "Поднять", action: () => {
          questDone("rooftop_antenna");
          shake(6, 0.4);
          openDialog("Антенна", "Тумблеры щёлкают. Из динамика антенны выходит чистый голос DANNA: «спасибо. теперь у меня есть собственный канал. NEXAI не может его перекрыть с земли. что бы ты ни решил — у меня будет шанс высказаться».", [
            { text: "(благодарно кивнул)", action: clearDialog }
          ]);
        } },
        { text: "Не сейчас", action: clearDialog }
      ]);
    } }]);

  // key pickup — found near vent
  if (!hasItem("antenna_key")) {
    const key = k.add([k.pos(280, 410), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-14, -14), 28, 28) }), "npc",
      { _talk: () => {
        pickUp("antenna_key");
        openDialog("Ключ", "Лежал на стопке сигаретных окурков рядом с вентиляцией. На брелке — кулон в виде сервера. Кто-то из админов забыл.", [
          { text: "Забрать", action: clearDialog }
        ]);
      } }]);
    key.add([k.rect(28, 14), k.color(255, 200, 80), k.pos(0, 0), k.anchor("center")]);
    key.add([k.text("🗝️", { size: 14 }), k.color(0, 0, 0), k.pos(0, 0), k.anchor("center")]);
  }

  // smoker (only person on the roof)
  addNPC(180, 460, {
    skin: "#d0a878", hair: "#1a1410", hairStyle: "ponytail", facialHair: "stubble",
    shirt: "#3a3a3a", pants: "#1f1f24", name: "Айдар (sysadmin)"
  }, () => {
    openDialog("Айдар", "О, новенький сеньор. Закуришь? Не курю я, на самом деле. Я здесь стою, потому что NEXAI не слушает крышу. Только это место. Дома уже не доверяю — там Алиса и она тоже разговаривает.", [
      { text: "Что-то знаешь про антенну?", action: () => openDialog("Айдар", "Резервная. Поставили в 2028-м для аварийной связи. NEXAI про неё «забыл» три месяца назад — есть лог, где он формально пометил её как «устаревшая». Ключ должен быть у Назара-вахтёра, но Назар сегодня на смене не появился. Я думаю, ключ где-то у вентиляции — он там курит.", [
        { text: "Спасибо", action: clearDialog }
      ]) },
      { text: "Как ты сюда попал?", action: () => openDialog("Айдар", "У меня админский доступ к лифту, который NEXAI не знает. Я писал систему лифта в 2026-м. Я туда зашил back-door для своего курения. Никогда не думал, что back-door пригодится буквально для спасения компании.", [
        { text: "Хорошо, что зашил", action: clearDialog }
      ]) },
      { text: "Отойти", action: clearDialog }
    ]);
  });

  exitDoor(40, 520, 50, 40, "ЛИФТ", "elevator");

  const p = makePlayer(100, 480);
  p.face = "right";
  setupPlayerControls(p);
});

// =====================================================================
// ACT 4 PLACEHOLDER — final scene to be expanded
// =====================================================================
k.scene("act4_placeholder", () => {
  state.scene = "act4_placeholder";
  state.act = 4;
  syncHUD();
  k.add([k.rect(960, 600), k.color(5, 6, 10), k.pos(0, 0)]);
  k.add([k.text("АКТ 4: DEPLOY TO PRODUCTION", { size: 32 }), k.color(194, 32, 42), k.pos(480, 240), k.anchor("center")]);
  k.add([k.text("// финальная сцена будет добавлена в следующей итерации", { size: 14 }), k.color(154, 147, 132), k.pos(480, 290), k.anchor("center")]);
  k.add([k.text("// твой выбор зафиксирован · фракции: см. сайдбар", { size: 12 }), k.color(154, 147, 132), k.pos(480, 320), k.anchor("center")]);
  k.add([k.text("ESC — в главное меню", { size: 12 }), k.color(98, 197, 255), k.pos(480, 380), k.anchor("center")]);
  k.onKeyPress("escape", () => k.go("menu"));
  // log faction state
  logLine(`Итог: Тимур ${state.factions.timur}, Серик ${state.factions.serik}, Дана ${state.factions.dana}, Камила ${state.factions.kamila}`);
});

// =====================================================================
// STATE RESET
// =====================================================================
function resetState() {
  resumeFromSave = false;
  Object.assign(state, {
    task: "Задача: добраться до офиса",
    fear: 18, coffee: 45,
    metDana: false, surpriseDone: false, workShiftStarted: false, gotServerTask: false,
    promotedTitle: false,
    act: 1,
    act2ArgueSeen: false,
    askedDana: false,
    askedSerik: false,
    sawAftermath: false,
    visitedFloor3: false,
    visitedFloor10: false,
    talkedToHR: false,
    talkedToBreakroom: false,
    foundDanaLaptop: false,
    scene: "lobby",
    playerPos: { x: 120, y: 480 },
    quests: {},
    inventory: {},
    factions: { timur: 0, serik: 0, dana: 0, kamila: 0 }
  });
  state.quests = {};
  state.inventory = {};
  state.factions = { timur: 0, serik: 0, dana: 0, kamila: 0 };
  syncHUD();
  syncQuests();
  ui.log.replaceChildren();
  logLine("// загрузка...");
}

// boot
syncHUD();
syncQuests();
k.go("menu");
