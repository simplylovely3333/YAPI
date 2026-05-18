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

      <section class="rotate-prompt" id="rotate-prompt" aria-hidden="true">
        <div class="rotate-prompt-inner">
          <div class="rotate-icon">⟲</div>
          <p>Поверни телефон<br>горизонтально</p>
        </div>
      </section>
    </main>
  `;
}

ensureGameShell();

// =====================================================================
// MOBILE ORIENTATION — lock to landscape, show prompt if portrait.
// =====================================================================
function isTouchDevice() {
  return (window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse)").matches)
      || ("ontouchstart" in window);
}

function tryLockLandscape() {
  // Screen Orientation API — works inside a fullscreen context on Android.
  if (screen.orientation && typeof screen.orientation.lock === "function") {
    screen.orientation.lock("landscape").catch(() => { /* ignore — needs fullscreen on iOS / unsupported on Safari */ });
  }
}

function requestMobileFullscreen() {
  if (!isTouchDevice()) return;
  const el = document.documentElement;
  if (document.fullscreenElement || document.webkitFullscreenElement) return;
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (req) {
    try {
      const r = req.call(el);
      if (r && typeof r.catch === "function") r.catch(() => {});
    } catch { /* fullscreen is best-effort on mobile browsers */ }
  }
}

function updateRotatePrompt() {
  const prompt = document.getElementById("rotate-prompt");
  if (!prompt) return;
  const portrait = window.innerHeight > window.innerWidth;
  const touch = isTouchDevice();
  prompt.classList.toggle("show", touch && portrait);
}

window.addEventListener("resize", updateRotatePrompt);
window.addEventListener("orientationchange", updateRotatePrompt);
updateRotatePrompt();

// Attempt orientation lock after the first user gesture (browsers require it).
function onFirstGesture() {
  if (isTouchDevice()) tryLockLandscape();
  requestMobileFullscreen();
  window.removeEventListener("touchstart", onFirstGesture);
  window.removeEventListener("click", onFirstGesture);
}
window.addEventListener("touchstart", onFirstGesture, { once: false });
window.addEventListener("click", onFirstGesture, { once: false });

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
const mobileInput = {
  x: 0,
  y: 0,
  interactQueued: false,
  presses: { interact: 0, laptop: 0, menu: 0 }
};
let mobileSceneTouch = null;
let mobileSceneBack = null;

function queueMobilePress(which) {
  if (!mobileInput.presses[which] && mobileInput.presses[which] !== 0) mobileInput.presses[which] = 0;
  mobileInput.presses[which]++;
}

function takeMobilePress(which) {
  if (!mobileInput.presses || !mobileInput.presses[which]) return false;
  mobileInput.presses[which]--;
  return true;
}

// =====================================================================
// IN-CANVAS TOUCH HUD — joystick + 3 buttons drawn as kaplay objects.
// Lives in game coordinates (960×600), so it scales with the canvas and
// is automatically rotated with the game when device is landscape.
// =====================================================================

// game-coord layout (960×600)
const JOY = { cx: 130, cy: 470, r: 70, stickR: 28 };
const BTN_INTERACT = { cx: 838, cy: 470, r: 54, label: "E" };
const BTN_LAPTOP   = { cx: 740, cy: 392, r: 32, label: "T" };
const BTN_MENU     = { cx: 836, cy: 372, r: 32, label: "☰" };

const joyTouch = { id: null, dx: 0, dy: 0 };
let touchHudListenersAttached = false;

// Per-scene visuals: re-added every time createGameHUD runs (world.js:17).
function createTouchHudVisuals() {
  if (!isTouchDevice()) return;
  // tag "game-hud" so refreshGameHUD destroys these alongside the rest of HUD.
  const layer = k.add([k.pos(0, 0), k.fixed(), k.z(995), "game-hud", "touch-hud"]);

  layer.add([k.circle(JOY.r), k.color(5, 7, 10), k.opacity(0.55), k.pos(JOY.cx, JOY.cy), k.anchor("center")]);
  layer.add([k.circle(JOY.r), k.color(98, 197, 255), k.opacity(0.2), k.outline(2, k.rgb(98, 197, 255)), k.pos(JOY.cx, JOY.cy), k.anchor("center")]);
  const stick = layer.add([k.circle(JOY.stickR), k.color(12, 22, 34), k.outline(2, k.rgb(98, 197, 255)), k.pos(JOY.cx, JOY.cy), k.anchor("center"), "touch-stick"]);
  stick.onUpdate(() => {
    stick.pos.x = JOY.cx + joyTouch.dx;
    stick.pos.y = JOY.cy + joyTouch.dy;
  });

  function btn(spec, color) {
    layer.add([k.circle(spec.r), k.color(8, 10, 14), k.opacity(0.75), k.pos(spec.cx, spec.cy), k.anchor("center")]);
    layer.add([k.circle(spec.r), k.color(color[0], color[1], color[2]), k.opacity(0.18), k.outline(2, k.rgb(color[0], color[1], color[2])), k.pos(spec.cx, spec.cy), k.anchor("center")]);
    layer.add([k.text(spec.label, { size: spec.r > 40 ? 26 : 18 }), k.color(248, 244, 232), k.pos(spec.cx, spec.cy), k.anchor("center")]);
  }
  btn(BTN_INTERACT, [194, 32, 42]);
  btn(BTN_LAPTOP,   [255, 179, 71]);
  btn(BTN_MENU,     [232, 226, 212]);
}

// Canvas-level touch listeners: attached once, survive scene transitions.
function setupTouchHud() {
  if (!isTouchDevice()) return;
  if (touchHudListenersAttached) return;
  const canvas = document.querySelector("#game canvas");
  if (!canvas) return;
  touchHudListenersAttached = true;

  function toGame(touch) {
    const rect = canvas.getBoundingClientRect();
    const sx = (touch.clientX - rect.left) / rect.width;
    const sy = (touch.clientY - rect.top) / rect.height;
    return { x: sx * 960, y: sy * 600 };
  }
  function inCircle(p, c) { return (p.x - c.cx) ** 2 + (p.y - c.cy) ** 2 <= c.r ** 2; }

  function buttonHit(p) {
    if (inCircle(p, BTN_INTERACT)) return "interact";
    if (inCircle(p, BTN_LAPTOP))   return "laptop";
    if (inCircle(p, BTN_MENU))     return "menu";
    return null;
  }
  function hasPlayerInScene() {
    try { return typeof k.get === "function" && k.get("player").length > 0; }
    catch { return false; }
  }

  function pressButton(which) {
    Aud.uiBlip && Aud.uiBlip();
    if (which === "interact") {
      if (typeof dialogOpen !== "undefined" && dialogOpen && typeof confirmDialogSelection === "function") {
        confirmDialogSelection();
        return;
      }
      queueMobilePress("interact");
      if (hasPlayerInScene() && !isBlockedNow()) mobileInput.interactQueued = true;
    } else if (which === "laptop") {
      if (typeof toggleLaptop === "function") toggleLaptop();
      queueMobilePress("laptop");
    } else if (which === "menu") {
      if (typeof dialogOpen !== "undefined" && dialogOpen && typeof clearDialog === "function") clearDialog();
      else if (typeof mobileSceneBack === "function" && mobileSceneBack()) return;
      else if (typeof togglePause === "function") togglePause();
      queueMobilePress("menu");
    }
  }

  function updateJoy(p) {
    let dx = p.x - JOY.cx;
    let dy = p.y - JOY.cy;
    const dist = Math.hypot(dx, dy);
    if (dist > JOY.r) { dx = dx / dist * JOY.r; dy = dy / dist * JOY.r; }
    joyTouch.dx = dx;
    joyTouch.dy = dy;
    mobileInput.x = Math.abs(dx) < 6 ? 0 : dx / JOY.r;
    mobileInput.y = Math.abs(dy) < 6 ? 0 : dy / JOY.r;
  }
  function releaseJoy() {
    joyTouch.id = null;
    joyTouch.dx = 0;
    joyTouch.dy = 0;
    mobileInput.x = 0;
    mobileInput.y = 0;
  }

  function safePreventDefault(e) {
    if (e.cancelable) {
      try { e.preventDefault(); } catch { /* ignore intervention */ }
    }
  }

  // active joystick zone: visible circle + moderate buffer (not the whole left half),
  // so other parts of the canvas are free for "tap to interact".
  const JOY_TOUCH_R = JOY.r + 60;
  function inJoyZone(p) {
    return (p.x - JOY.cx) ** 2 + (p.y - JOY.cy) ** 2 <= JOY_TOUCH_R ** 2;
  }
  function isBlockedNow() {
    // best-effort — these globals live in dialog.js
    if (typeof isInputBlocked === "function") {
      try { return isInputBlocked(); } catch { /* */ }
    }
    return (typeof dialogOpen !== "undefined" && dialogOpen)
        || (typeof laptopOpen !== "undefined" && laptopOpen)
        || (typeof codePuzzleOpen !== "undefined" && codePuzzleOpen)
        || (typeof paused !== "undefined" && paused);
  }

  canvas.addEventListener("touchstart", (e) => {
    requestMobileFullscreen();
    tryLockLandscape();
    for (const t of e.changedTouches) {
      const p = toGame(t);

      // 1) hit on a control button — always wins
      const which = buttonHit(p);
      if (which) {
        pressButton(which);
        safePreventDefault(e);
        continue;
      }

      // Dialogs have multiple answers: tap the exact answer row instead of
      // blindly confirming the currently selected first option.
      if (typeof dialogOpen !== "undefined" && dialogOpen) {
        if (typeof handleDialogTouch === "function") handleDialogTouch(p.x, p.y);
        safePreventDefault(e);
        continue;
      }

      if (typeof paused !== "undefined" && paused && typeof handlePauseTouch === "function") {
        handlePauseTouch(p.x, p.y);
        safePreventDefault(e);
        continue;
      }

      if (typeof laptopOpen !== "undefined" && laptopOpen && typeof handleLaptopTouch === "function") {
        handleLaptopTouch(p.x, p.y);
        safePreventDefault(e);
        continue;
      }

      if (typeof mobileSceneTouch === "function" && mobileSceneTouch(p.x, p.y)) {
        safePreventDefault(e);
        continue;
      }

      // 2) dialog / cutscene / menu open → ANY remaining tap advances ("interact")
      if (isBlockedNow()) {
        pressButton("interact");
        safePreventDefault(e);
        continue;
      }

      // 3) joystick zone (only when nothing modal is up)
      if (joyTouch.id == null && inJoyZone(p)) {
        joyTouch.id = t.identifier;
        updateJoy(p);
        safePreventDefault(e);
        continue;
      }

      // 4) free tap in the play area → also count as "interact"
      pressButton("interact");
      safePreventDefault(e);
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === joyTouch.id) {
        updateJoy(toGame(t));
        safePreventDefault(e);
      }
    }
  }, { passive: false });

  function endTouch(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === joyTouch.id) releaseJoy();
    }
  }
  canvas.addEventListener("touchend", endTouch);
  canvas.addEventListener("touchcancel", endTouch);
}

// initialise once kaplay has actually mounted its canvas
setTimeout(setupTouchHud, 0);

// Re-create touch HUD visuals on every scene by hooking into k.go.
// Cutscenes / menu / saves don't use roomFloor, so without this they'd
// lose the touch buttons after a scene transition.
if (typeof k.go === "function" && !k._touchHudPatched) {
  k._touchHudPatched = true;
  const origGo = k.go.bind(k);
  k.go = function (name, ...rest) {
    mobileSceneTouch = null;
    mobileSceneBack = null;
    const r = origGo(name, ...rest);
    // give the new scene one frame to set up, then ensure our HUD exists
    if (isTouchDevice()) setTimeout(() => createTouchHudVisuals(), 0);
    return r;
  };
}

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
    log: [],

    // =================================================================
    // FOUNDATION: trust / dialog memory / surveillance
    //
    // trust[char]  — hidden 0..100, starts ~50; nudged by dialog choices.
    //                Drives Act 4 vote: characters with trust>=60 vote with
    //                the player, below — against.
    // choices[id]  — record of important choices ("dialogId" → value).
    //                Lets NPCs reference past answers in later scenes.
    // surveillance — 0..100; rises when player antagonises NEXAI / asks
    //                too many questions / collects evidence. High values
    //                trigger visual glitches and tag the player "in base".
    // =================================================================
    trust: { timur: 50, serik: 50, dana: 50, aigerim: 50, kamila: 50 },
    choices: {},
    surveillance: 0,
    inBaseFlagged: false
  };
}

const state = defaultState();

// =====================================================================
// FOUNDATION HELPERS — trust / choices / surveillance
// =====================================================================
const TRUST_CHARS = ["timur", "serik", "dana", "aigerim", "kamila"];

function _ensureFoundation() {
  if (!state.trust) state.trust = { timur: 50, serik: 50, dana: 50, aigerim: 50, kamila: 50 };
  if (!state.choices) state.choices = {};
  if (state.surveillance == null) state.surveillance = 0;
  if (state.inBaseFlagged == null) state.inBaseFlagged = false;
}

// nudgeTrust("serik", +5) — clamp to [0..100]. Pass an object to nudge several at once.
function nudgeTrust(charOrMap, delta) {
  _ensureFoundation();
  const apply = (c, d) => {
    if (!(c in state.trust)) state.trust[c] = 50;
    state.trust[c] = Math.max(0, Math.min(100, state.trust[c] + d));
  };
  if (typeof charOrMap === "object" && charOrMap) {
    for (const c in charOrMap) apply(c, charOrMap[c]);
  } else {
    apply(charOrMap, delta);
  }
}

function getTrust(char) {
  _ensureFoundation();
  return state.trust[char] == null ? 50 : state.trust[char];
}

function trustTier(char) {
  const t = getTrust(char);
  if (t >= 75) return "high";
  if (t >= 60) return "with";  // votes with you in Act 4
  if (t >= 40) return "neutral";
  if (t >= 25) return "cool";
  return "against";
}

function recordChoice(id, value) {
  _ensureFoundation();
  state.choices[id] = value == null ? true : value;
}
function hasChoice(id, value) {
  _ensureFoundation();
  if (value == null) return id in state.choices;
  return state.choices[id] === value;
}
function getChoice(id) {
  _ensureFoundation();
  return state.choices[id];
}

function nudgeSurveillance(delta) {
  _ensureFoundation();
  state.surveillance = Math.max(0, Math.min(100, state.surveillance + delta));
  if (state.surveillance >= 30 && !state.inBaseFlagged) {
    state.inBaseFlagged = true;
    logLine("NEXAI ● добавил тебя в наблюдение.");
  }
}

// Convenience for dialog choices: record the choice + nudge trust + nudge surveillance in one call.
// usage: choose("interview_experience", "honest", { serik: +6, timur: -3 }, { surveillance: +1 })
function choose(id, value, trustMap, extras) {
  recordChoice(id, value);
  if (trustMap) nudgeTrust(trustMap);
  if (extras && extras.surveillance) nudgeSurveillance(extras.surveillance);
}

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
  k.add([k.text(label, { size: 13 }), k.color(232, 226, 212), k.opacity(0.9), k.pos(x, y), k.fixed(), k.z(990), "game-hud"]);
  k.add([k.rect(w, 11), k.color(12, 14, 18), k.outline(1, k.rgb(65, 51, 54)), k.pos(x + 76, y + 3), k.fixed(), k.z(990), "game-hud"]);
  k.add([k.rect(Math.max(2, (w - 2) * pct), 9), k.color(fillColor[0], fillColor[1], fillColor[2]), k.pos(x + 77, y + 4), k.fixed(), k.z(991), "game-hud"]);
}

function createGameHUD() {
  gameHud = { nodes: [] };
  const a = state.act == null ? 1 : state.act;
  const hud = k.add([k.pos(0, 0), k.fixed(), k.z(980), "game-hud"]);
  gameHud.root = hud;

  hud.add([k.rect(960, 96), k.color(5, 7, 10), k.opacity(0.82), k.pos(0, 0)]);
  // surveillance bar: hidden when low, intensifies as NEXAI focuses on the player
  const surv = Math.max(0, Math.min(100, state.surveillance || 0));
  const barColor = surv >= 60 ? [255, 60, 70] : surv >= 30 ? [220, 90, 60] : [194, 32, 42];
  hud.add([k.rect(960, 2), k.color(barColor[0], barColor[1], barColor[2]), k.opacity(0.78), k.pos(0, 96)]);
  // a faint surveillance overlay (only visible when threshold crossed)
  if (surv >= 30) {
    const flicker = k.add([k.rect(960, 600), k.color(194, 32, 42), k.opacity(0.04 + (surv - 30) / 500), k.pos(0, 0), k.fixed(), k.z(995), "game-hud"]);
    flicker.onUpdate(() => { flicker.opacity = 0.03 + (surv / 1800) + (Math.sin(k.time() * 7) > 0.96 ? 0.06 : 0); });
  }
  // "в базе" marker
  if (state.inBaseFlagged) {
    hud.add([k.text("◉ NEXAI", { size: 13 }), k.color(194, 32, 42), k.opacity(0.85), k.pos(862, 8)]);
  }
  hud.add([k.text(`АКТ ${a}: ${actTitle(a)}`, { size: 17 }), k.color(255, 179, 71), k.pos(20, 10)]);
  hud.add([k.text(shortText(state.task, 62), { size: 17, width: 560 }), k.color(232, 226, 212), k.pos(20, 34)]);
  hud.add([k.text(`Локация: ${shortText(sceneTitle(state.scene), 34)}`, { size: 14 }), k.color(154, 147, 132), k.pos(20, 72)]);

  addHudBar(640, 12, 160, "ТРЕВОГА", state.fear || 0, [194, 32, 42]);
  addHudBar(640, 38, 160, "КОФЕИН", state.coffee || 0, [255, 179, 71]);
  addHudBar(640, 64, 160, "HP", state.hp == null ? 100 : state.hp, [168, 255, 101]);

  const items = getHudItems();
  const invTitle = items.length ? "ИНВЕНТАРЬ / КВЕСТЫ" : "ИНВЕНТАРЬ: пусто";
  hud.add([k.text(invTitle, { size: 13 }), k.color(168, 255, 101), k.opacity(0.9), k.pos(620, 106)]);

  const panel = k.add([k.pos(620, 124), k.fixed(), k.z(980), "game-hud"]);
  panel.add([k.rect(320, 138), k.color(5, 7, 10), k.opacity(0.64), k.outline(1, k.rgb(64, 38, 42)), k.pos(0, 0)]);
  const visibleItems = items.length ? items : ["нет предметов"];
  visibleItems.forEach((line, i) => {
    panel.add([k.text(shortText(line, 34), { size: 13, width: 300 }), k.color(i < items.length ? 232 : 154, i < items.length ? 226 : 147, i < items.length ? 212 : 132), k.pos(10, 10 + i * 25)]);
  });

  const logLines = (state.log || []).slice(0, 3);
  const logPanel = k.add([k.pos(20, 108), k.fixed(), k.z(980), "game-hud"]);
  logPanel.add([k.rect(460, 98), k.color(5, 7, 10), k.opacity(logLines.length ? 0.58 : 0), k.outline(1, k.rgb(64, 38, 42)), k.pos(0, 0)]);
  logLines.forEach((line, i) => {
    logPanel.add([k.text(shortText(line, 48), { size: 13, width: 440 }), k.color(154, 147, 132), k.pos(10, 10 + i * 29)]);
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
