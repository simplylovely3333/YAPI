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
  place: document.querySelector("#place"),
  lastAction: document.querySelector("#last-action"),
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

function defaultState() {
  return {
    task: "Задача: добраться до офиса",
    fear: 18,
    coffee: 45,
    // Act 0 — onboarding
    interviewDone: false,
    fd7Started: false,
    fd7Nexai: false,
    fd7Floors: false,
    fd7Team: false,
    act0Done: false,
    // Act 1
    metDana: false,
    surpriseDone: false,
    workShiftStarted: false,
    dannaIntroSeen: false,
    aigerimTask: false,
    aigerimLaptopFixed: false,
    danaOfficeInvite: false,
    danaAgentSeen: false,
    gotServerTask: false,
    promotedTitle: false,
    // Act 2
    act2HauntCount: 0,
    act2ElevatorLieSeen: false,
    act2ArgueSeen: false,
    floor8RepairBriefed: false,
    floor8Fixed: false,
    pcRepairStep: 0,
    askedDana: false,
    askedSerik: false,
    sawAftermath: false,
    // Act 3
    visitedFloor3: false,
    visitedFloor10: false,
    talkedToHR: false,
    talkedToBreakroom: false,
    foundDanaLaptop: false,
    // general
    scene: "lobby",
    playerPos: { x: 120, y: 480 },
    act: 1,
    quests: {},
    inventory: {},
    factions: { timur: 0, serik: 0, dana: 0, kamila: 0 }
  };
}

const state = defaultState();

// normalize state.task strings — every assignment should look like "Задача: …"
function setTask(t) {
  if (!t) return;
  state.task = /^Задача:|^Акт\s+\d/i.test(t) ? t : "Задача: " + t;
  syncHUD && syncHUD();
}

// ---- save slots ----
const SAVE_KEY = "stack-overflow-act1-save";   // legacy single-save key (migrated once)
const SAVES_KEY = "stack-overflow-saves";       // array of { state, ts, label }
const NUM_SAVE_SLOTS = 3;
const SETTINGS_KEY = "stack-overflow-settings";
let resumeFromSave = false;

const settings = {
  volume: 0.6,
  muted: false,
  ...(JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"))
};
function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }

function _readSaves() {
  let raw = localStorage.getItem(SAVES_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* corrupt */ }
  }
  // one-time migration of the legacy single-save into slot 0
  const legacy = localStorage.getItem(SAVE_KEY);
  if (legacy) {
    try {
      const parsed = JSON.parse(legacy);
      const slots = new Array(NUM_SAVE_SLOTS).fill(null);
      slots[0] = { state: parsed, ts: Date.now(), label: "(перенесено)" };
      localStorage.setItem(SAVES_KEY, JSON.stringify(slots));
      localStorage.removeItem(SAVE_KEY);
      return slots;
    } catch { /* fallthrough */ }
  }
  return new Array(NUM_SAVE_SLOTS).fill(null);
}
function _writeSaves(slots) { localStorage.setItem(SAVES_KEY, JSON.stringify(slots)); }

function getSaveSlots() { return _readSaves(); }
function hasAnySave() { return _readSaves().some((s) => s); }

function saveToSlot(i) {
  if (i < 0 || i >= NUM_SAVE_SLOTS) return false;
  const p = k.get("player")[0];
  if (p) { state.playerPos.x = p.pos.x; state.playerPos.y = p.pos.y; }
  const slots = _readSaves();
  slots[i] = {
    state: JSON.parse(JSON.stringify(state)), // deep clone
    ts: Date.now(),
    label: `Акт ${state.act || 1} · ${state.scene || "?"}`
  };
  _writeSaves(slots);
  logLine(`// сохранение записано в слот ${i + 1}`);
  return true;
}
function loadFromSlot(i) {
  const slots = _readSaves();
  const slot = slots[i];
  if (!slot || !slot.state) return false;
  // wipe state completely so removed flags don't linger
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, defaultState(), slot.state);
  resumeFromSave = true;
  syncHUD();
  syncQuests();
  return true;
}
function deleteSlot(i) {
  const slots = _readSaves();
  slots[i] = null;
  _writeSaves(slots);
}

// legacy alias used in dialog.js / cutscenes.js so we don't have to touch every site
function saveGame() { return saveToSlot(0); } // quick-save → slot 1
function hasSave() { return hasAnySave(); }
function loadGame() { // legacy: loads most-recent slot
  const slots = _readSaves();
  let bestI = -1, bestTs = -1;
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] && slots[i].ts > bestTs) { bestTs = slots[i].ts; bestI = i; }
  }
  return bestI >= 0 ? loadFromSlot(bestI) : false;
}

function syncHUD() {
  const a = state.act == null ? 1 : state.act;
  if (ui.act) ui.act.textContent = `АКТ ${a}: ${actTitle(a)}`;
  ui.task.textContent = state.task;
  if (ui.place) ui.place.textContent = `Локация: ${sceneTitle(state.scene)}`;
  ui.fear.value = state.fear;
  ui.coffee.value = state.coffee;
}

function actTitle(act) {
  const titles = {
    0: "Onboarding",
    1: "First Commit",
    2: "Merge Conflict",
    3: "Evidence Sprint",
    4: "Deploy To Production"
  };
  return titles[act] || "Unknown Build";
}

function sceneTitle(scene) {
  const titles = {
    interview: "собеседование · HR",
    firstday7: "7 этаж · первый день",
    menu: "главное меню",
    lobby: "1 этаж · холл",
    elevator: "лифт",
    floor7: "7 этаж · разработка",
    floor8: "8 этаж · офис Даны",
    floor12: "12 этаж · серверная",
    floor12_aftermath: "12 этаж · после сбоя",
    pc_arrival: "userland",
    pc_corridor: "цифровой коридор",
    pc_memory: "архив памяти",
    pc_kernel: "ядро",
    pc_battle: "kernel panic",
    floor3: "3 этаж · HR",
    floor10: "10 этаж · комната отдыха",
    floor7_lab: "7 этаж · war room",
    basement: "подвал · ядро NEXAI",
    floor5: "5 этаж · PR",
    floor14: "14 этаж · крыша",
    act4_placeholder: "акт 4"
  };
  return titles[scene] || scene || "—";
}

function logLine(text) {
  const p = document.createElement("p");
  p.textContent = text;
  ui.log.prepend(p);
  if (ui.lastAction) ui.lastAction.textContent = `Последнее: ${text}`;
}
