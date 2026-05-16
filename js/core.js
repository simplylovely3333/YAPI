// =====================================================================
// STACK OVERFLOW — Act 1: First Commit  (Kaplay/Kaboom edition)
// =====================================================================

function ensureGameShell() {
  if (document.getElementById("game")) return;
  document.body.innerHTML = `
    <main class="shell" aria-label="STACK OVERFLOW">
      <div class="frame">
        <div id="game"></div>
      </div>

      <section class="code-terminal" id="code-terminal" aria-label="Мини-игра: ввод кода" hidden>
        <div class="terminal-window">
          <div class="terminal-head">
            <div>
              <p class="terminal-kicker" id="code-terminal-kicker">// remote laptop session</p>
              <h2 id="code-terminal-title">PATCH CONSOLE</h2>
            </div>
            <button type="button" id="code-terminal-close" aria-label="Закрыть терминал">×</button>
          </div>
          <div class="terminal-body">
            <div class="terminal-log" id="code-terminal-log" aria-live="polite"></div>
            <form class="terminal-input-row" id="code-terminal-form" autocomplete="off">
              <span>dev@aigerim:~$</span>
              <input id="code-terminal-input" name="code" type="text" spellcheck="false" autocomplete="off" aria-label="Введите строку кода">
              <button type="submit">RUN</button>
            </form>
          </div>
        </div>
      </section>

      <section class="mobile-controls" id="mobile-controls" aria-label="Мобильное управление">
        <div class="mobile-joystick" id="mobile-joystick" aria-label="Джойстик движения">
          <div class="mobile-stick" id="mobile-stick"></div>
        </div>
        <div class="mobile-actions">
          <button type="button" class="mobile-btn mobile-btn-small" id="mobile-menu" aria-label="Меню">☰</button>
          <button type="button" class="mobile-btn mobile-btn-small" id="mobile-laptop" aria-label="Ноутбук">T</button>
          <button type="button" class="mobile-btn mobile-btn-main" id="mobile-interact" aria-label="Действие">E</button>
        </div>
      </section>
    </main>
  `;
}

ensureGameShell();

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

let gameHud = null;
const mobileInput = { x: 0, y: 0, interactQueued: false };

function setupMobileControls() {
  const root = document.querySelector("#mobile-controls");
  const pad = document.querySelector("#mobile-joystick");
  const stick = document.querySelector("#mobile-stick");
  const interact = document.querySelector("#mobile-interact");
  const laptop = document.querySelector("#mobile-laptop");
  const menu = document.querySelector("#mobile-menu");
  if (!root || !pad || !stick || !interact || !laptop || !menu) return;

  let activePointer = null;
  const clampStick = (event) => {
    const rect = pad.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const max = rect.width * 0.34;
    let dx = event.clientX - cx;
    let dy = event.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > max) {
      dx = (dx / dist) * max;
      dy = (dy / dist) * max;
    }
    mobileInput.x = Math.abs(dx) < 5 ? 0 : dx / max;
    mobileInput.y = Math.abs(dy) < 5 ? 0 : dy / max;
    stick.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const releaseStick = () => {
    activePointer = null;
    mobileInput.x = 0;
    mobileInput.y = 0;
    stick.style.transform = "translate(0, 0)";
  };

  pad.addEventListener("pointerdown", (event) => {
    activePointer = event.pointerId;
    pad.setPointerCapture?.(event.pointerId);
    clampStick(event);
    event.preventDefault();
  });
  pad.addEventListener("pointermove", (event) => {
    if (activePointer !== event.pointerId) return;
    clampStick(event);
    event.preventDefault();
  });
  pad.addEventListener("pointerup", releaseStick);
  pad.addEventListener("pointercancel", releaseStick);

  const pressAction = (event, action) => {
    event.preventDefault();
    Aud.uiBlip?.();
    action();
  };
  interact.addEventListener("pointerdown", (event) => pressAction(event, () => {
    if (typeof dialogOpen !== "undefined" && dialogOpen && typeof confirmDialogSelection === "function") {
      confirmDialogSelection();
      return;
    }
    mobileInput.interactQueued = true;
  }));
  laptop.addEventListener("pointerdown", (event) => pressAction(event, () => {
    if (typeof toggleLaptop === "function") toggleLaptop();
  }));
  menu.addEventListener("pointerdown", (event) => pressAction(event, () => {
    if (typeof dialogOpen !== "undefined" && dialogOpen && typeof clearDialog === "function") {
      clearDialog();
      return;
    }
    if (typeof togglePause === "function") togglePause();
  }));
}

setupMobileControls();

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
  if (!state.quests) state.quests = {};
  if (!state.inventory) state.inventory = {};
  refreshGameHUD();
}

function defaultState() {
  return {
    task: "Задача: добраться до офиса",
    fear: 18,
    coffee: 45,
    hp: 100,
    // Act 0 — onboarding
    interviewDone: false,
    act0ReceptionDone: false,
    act0EscortInterview: false,
    fd7Started: false,
    fd7BriefingDone: false,
    fd7Nexai: false,
    fd7Floors: false,
    fd7Team: false,
    act0DanaTask: false,
    act0DanaIntroStarted: false,
    act0DanaIntroDone: false,
    act0KnowledgeConsole: false,
    act0KnowledgePeople: false,
    act0KnowledgeDocs: false,
    act0DanaEscort: false,
    act0CoreTask: false,
    act0CoreBriefDone: false,
    act0CoreDiveDone: false,
    act0Done: false,
    // Act 1
    metDana: false,
    surpriseDone: false,
    workShiftStarted: false,
    dannaIntroSeen: false,
    act1DanaBriefed: false,
    act1WeaknessFound: false,
    act1LibraryTask: false,
    act1ManualFound: false,
    act1LibraryPuzzleStarted: false,
    act1LibraryClueShelf: false,
    act1LibraryClueCatalog: false,
    act1LibraryClueStamp: false,
    act1LibraryEscapeStarted: false,
    act1CounterPatchDone: false,
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
    arriveFromElevator: false,
    elevatorReturnTo: "lobby",
    act: 1,
    quests: {},
    inventory: {},
    factions: { timur: 0, serik: 0, dana: 0, kamila: 0 },
    log: []
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
  refreshGameHUD();
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
    floor2_tour: "2 этаж · библиотека",
    floor3_tour: "3 этаж · HR",
    floor4_tour: "4 этаж · data quality",
    floor5_tour: "5 этаж · marketing",
    floor6_tour: "6 этаж · QA",
    floor8_tour: "8 этаж · client success",
    floor9_tour: "9 этаж · security",
    floor10_tour: "10 этаж · финансы",
    floor11_tour: "11 этаж · management",
    floor0_core: "0 этаж · ядро NEXAI",
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

const ELEVATOR_SPAWNS = {
  lobby: { x: 760, y: 165, face: "down" },
  interview: { x: 840, y: 500, face: "left" },
  firstday7: { x: 840, y: 500, face: "left" },
  floor2_tour: { x: 840, y: 500, face: "left" },
  floor3_tour: { x: 840, y: 500, face: "left" },
  floor4_tour: { x: 840, y: 500, face: "left" },
  floor5_tour: { x: 840, y: 500, face: "left" },
  floor6_tour: { x: 840, y: 500, face: "left" },
  floor8_tour: { x: 840, y: 500, face: "left" },
  floor9_tour: { x: 840, y: 500, face: "left" },
  floor10_tour: { x: 840, y: 500, face: "left" },
  floor11_tour: { x: 840, y: 500, face: "left" },
  floor0_core: { x: 840, y: 500, face: "left" },
  floor7: { x: 840, y: 500, face: "left" },
  floor8: { x: 88, y: 500, face: "right" },
  floor12: { x: 840, y: 500, face: "left" },
  floor12_aftermath: { x: 840, y: 125, face: "down" },
  floor3: { x: 840, y: 500, face: "left" },
  floor5: { x: 840, y: 500, face: "left" },
  floor10: { x: 840, y: 500, face: "left" },
  floor7_lab: { x: 840, y: 500, face: "left" },
  basement: { x: 80, y: 500, face: "right" },
  floor14: { x: 80, y: 500, face: "right" }
};

function logLine(text) {
  if (!state.log) state.log = [];
  state.log.unshift(text);
  state.log = state.log.slice(0, 6);
  refreshGameHUD();
}

function shortText(text, max = 58) {
  const s = String(text || "");
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function getHudItems() {
  const quests = Object.entries(state.quests || {})
    .filter(([, status]) => status)
    .slice(0, 3)
    .map(([id, status]) => `${status === "done" ? "✓" : "▸"} ${QUEST_DB[id]?.title || id}`);
  const items = Object.keys(state.inventory || {})
    .filter((id) => state.inventory[id])
    .slice(0, 3)
    .map((id) => `● ${INV_DB[id] || id}`);
  return [...quests, ...items].slice(0, 5);
}

function addHudBar(x, y, w, label, value, fillColor) {
  const pct = Math.max(0, Math.min(1, value / 100));
  k.add([k.text(label, { size: 9 }), k.color(232, 226, 212), k.opacity(0.82), k.pos(x, y), k.fixed(), k.z(990), "game-hud"]);
  k.add([k.rect(w, 8), k.color(12, 14, 18), k.outline(1, k.rgb(65, 51, 54)), k.pos(x + 62, y + 2), k.fixed(), k.z(990), "game-hud"]);
  k.add([k.rect(Math.max(2, (w - 2) * pct), 6), k.color(fillColor[0], fillColor[1], fillColor[2]), k.pos(x + 63, y + 3), k.fixed(), k.z(991), "game-hud"]);
}

function createGameHUD() {
  gameHud = { nodes: [] };
  const a = state.act == null ? 1 : state.act;
  const hud = k.add([k.pos(0, 0), k.fixed(), k.z(980), "game-hud"]);
  gameHud.root = hud;

  hud.add([k.rect(960, 74), k.color(5, 7, 10), k.opacity(0.78), k.pos(0, 0)]);
  hud.add([k.rect(960, 2), k.color(194, 32, 42), k.opacity(0.78), k.pos(0, 74)]);
  hud.add([k.text(`АКТ ${a}: ${actTitle(a)}`, { size: 13 }), k.color(255, 179, 71), k.pos(20, 12)]);
  hud.add([k.text(shortText(state.task, 72), { size: 13 }), k.color(232, 226, 212), k.pos(20, 34)]);
  hud.add([k.text(`Локация: ${shortText(sceneTitle(state.scene), 28)}`, { size: 10 }), k.color(154, 147, 132), k.pos(20, 55)]);

  addHudBar(650, 14, 190, "ТРЕВОГА", state.fear || 0, [194, 32, 42]);
  addHudBar(650, 34, 190, "КОФЕИН", state.coffee || 0, [255, 179, 71]);
  addHudBar(650, 54, 190, "HP", state.hp == null ? 100 : state.hp, [168, 255, 101]);

  const items = getHudItems();
  const invTitle = items.length ? "ИНВЕНТАРЬ / КВЕСТЫ" : "ИНВЕНТАРЬ: пусто";
  hud.add([k.text(invTitle, { size: 9 }), k.color(168, 255, 101), k.opacity(0.86), k.pos(650, 69)]);

  const panel = k.add([k.pos(668, 86), k.fixed(), k.z(980), "game-hud"]);
  panel.add([k.rect(270, 116), k.color(5, 7, 10), k.opacity(0.58), k.outline(1, k.rgb(64, 38, 42)), k.pos(0, 0)]);
  const visibleItems = items.length ? items : ["нет предметов"];
  visibleItems.forEach((line, i) => {
    panel.add([k.text(shortText(line, 34), { size: 9 }), k.color(i < items.length ? 232 : 154, i < items.length ? 226 : 147, i < items.length ? 212 : 132), k.pos(10, 10 + i * 19)]);
  });

  const logLines = (state.log || []).slice(0, 3);
  const logPanel = k.add([k.pos(20, 86), k.fixed(), k.z(980), "game-hud"]);
  logPanel.add([k.rect(390, 82), k.color(5, 7, 10), k.opacity(logLines.length ? 0.5 : 0), k.outline(1, k.rgb(64, 38, 42)), k.pos(0, 0)]);
  logLines.forEach((line, i) => {
    logPanel.add([k.text(shortText(line, 54), { size: 9 }), k.color(154, 147, 132), k.pos(10, 10 + i * 21)]);
  });
}

function refreshGameHUD() {
  if (!gameHud || !gameHud.root) return;
  try {
    gameHud.root.destroy();
    for (const obj of k.get("game-hud")) obj.destroy();
  } catch {
    // Scene switches can leave stale HUD references; next room draw recreates it.
  }
  createGameHUD();
}
