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
  dannaIntroSeen: false,
  aigerimTask: false,
  aigerimLaptopFixed: false,
  danaOfficeInvite: false,
  danaAgentSeen: false,
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
