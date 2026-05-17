// =====================================================================
// DIALOG SYSTEM — full-screen overlay using kaplay objects
// =====================================================================
let dialogOpen = false;
let dialogObjs = [];
let paused = false;
let pauseObjs = [];
let pauseTouchHandler = null;
let laptopOpen = false;
let laptopObjs = [];
let laptopTouchHandler = null;
let codePuzzleOpen = false;
let activeCodePuzzle = null;
let dialogReadyAt = 0;
let dialogChoiceCols = 1;

// single source of truth — any UI modal that should freeze movement & interactions
function isInputBlocked() {
  return dialogOpen || paused || laptopOpen || codePuzzleOpen;
}
function isOverlayOnly() {
  // ignores `paused` — used where we still want the game to *render* under pause
  return dialogOpen || laptopOpen || codePuzzleOpen;
}
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
    { label: "ОТНОШЕНИЯ", action: () => { Aud.uiSelect(); closePause(); openTrustReport(); } },
    { label: "СОХРАНИТЬ (выбрать слот)", action: () => { Aud.uiSelect(); const here = state.scene; closePause(); k.go("saves", { mode: "save", returnTo: here }); } },
    { label: "ЗАГРУЗИТЬ", action: () => { if (!hasAnySave()) { Aud.uiBack(); return; } Aud.uiSelect(); const here = state.scene; closePause(); k.go("saves", { mode: "load", returnTo: here }); } },
    { label: isFs ? "ВЫЙТИ ИЗ FULLSCREEN" : "FULLSCREEN (F)", action: () => { toggleFullscreen(); Aud.uiBlip(); closePause(); } },
    { label: settings.muted ? "ВКЛЮЧИТЬ ЗВУК" : "ВЫКЛЮЧИТЬ ЗВУК", action: () => { settings.muted = !settings.muted; saveSettings(); Aud.uiBlip(); closePause(); openPause(); } },
    { label: "В ГЛАВНОЕ МЕНЮ", action: () => { Aud.uiBack(); closePause(); k.go("menu"); } }
  ];
  let psel = 0;

  pauseObjs.push(k.add([k.rect(960, 600), k.color(0, 0, 0), k.opacity(0.7), k.pos(0, 0), k.fixed(), "pause"]));
  pauseObjs.push(k.add([k.text("ПАУЗА", { size: 48 }), k.color(232, 226, 212), k.pos(480, 132), k.anchor("center"), k.fixed()]));
  pauseObjs.push(k.add([k.text("// session paused — NEXAI ждёт", { size: 16 }), k.color(154, 147, 132), k.pos(480, 172), k.anchor("center"), k.fixed()]));

  const labels = [];
  items.forEach((it, i) => {
    const y = 220 + i * 52;
    const bg = k.add([k.rect(520, 42), k.color(20, 22, 28), k.opacity(0.9), k.outline(1, k.rgb(120, 32, 36)), k.pos(220, y), k.area(), k.fixed(), "pause-btn", { _idx: i, _action: it.action }]);
    bg.onClick(() => it.action());
    const lbl = k.add([k.text(it.label, { size: 19 }), k.color(232, 226, 212), k.pos(480, y + 21), k.anchor("center"), k.fixed()]);
    bg.onUpdate(() => {
      bg.color = i === psel ? k.rgb(60, 14, 18) : k.rgb(20, 22, 28);
    });
    labels.push({ bg, lbl });
    pauseObjs.push(bg, lbl);
  });
  pauseObjs.push(k.add([k.text("Стик: выбор · E/тап: подтвердить · ☰ закрыть", { size: 15 }), k.color(90, 84, 72), k.pos(480, 570), k.anchor("center"), k.fixed()]));
  pauseTouchHandler = (x, y) => {
    const hit = k.get("pause-btn").find((b) => (
      x >= b.pos.x && x <= b.pos.x + b.width
      && y >= b.pos.y && y <= b.pos.y + b.height
    ));
    if (!hit) return false;
    psel = hit._idx;
    Aud.uiSelect();
    hit._action();
    return true;
  };

  const onUp = k.onKeyPress("up", () => { psel = (psel - 1 + items.length) % items.length; Aud.uiBlip(); });
  const onDown = k.onKeyPress("down", () => { psel = (psel + 1) % items.length; Aud.uiBlip(); });
  const onConfirm = k.onButtonPress("interact", () => { if (paused) items[psel].action(); });
  let nextMobileNavAt = 0;
  const onTouchConfirm = k.onUpdate(() => {
    if (paused && typeof takeMobilePress === "function" && takeMobilePress("interact")) items[psel].action();
    if (paused && typeof mobileInput !== "undefined" && Math.abs(mobileInput.y) > 0.55 && k.time() >= nextMobileNavAt) {
      psel = (psel + (mobileInput.y > 0 ? 1 : -1) + items.length) % items.length;
      nextMobileNavAt = k.time() + 0.22;
      Aud.uiBlip();
    }
  });
  pauseObjs.push({ destroy: () => { onUp.cancel(); onDown.cancel(); onConfirm.cancel(); onTouchConfirm.cancel(); } });
}
function closePause() {
  paused = false;
  pauseTouchHandler = null;
  pauseObjs.forEach((o) => { if (o.destroy) o.destroy(); });
  pauseObjs = [];
}

function handlePauseTouch(x, y) {
  return !!(pauseTouchHandler && pauseTouchHandler(x, y));
}

// ---------------------------------------------------------------------
// TRUST REPORT — read-only overlay showing relationship state.
// Hidden underlying numbers (0..100), but presented qualitatively so the
// player still has to read between the lines.
// ---------------------------------------------------------------------
let trustReportObjs = [];
function closeTrustReport() {
  paused = false;
  trustReportObjs.forEach((o) => { if (o.destroy) o.destroy(); });
  trustReportObjs = [];
}
function openTrustReport() {
  paused = true;
  trustReportObjs.push(k.add([k.rect(960, 600), k.color(0, 0, 0), k.opacity(0.85), k.pos(0, 0), k.fixed(), "trust-report"]));
  trustReportObjs.push(k.add([k.text("ОТНОШЕНИЯ", { size: 32 }), k.color(232, 226, 212), k.pos(480, 60), k.anchor("center"), k.fixed()]));
  trustReportObjs.push(k.add([k.text("// невидимая шкала. цифр нет — есть ощущение.", { size: 11 }), k.color(154, 147, 132), k.pos(480, 96), k.anchor("center"), k.fixed()]));

  const names = {
    timur: "ТИМУР · менеджер",
    serik: "СЕРИК · старший разработчик",
    dana: "ДАНА · DevOps",
    aigerim: "АЙГЕРИМ · HR",
    kamila: "КАМИЛА · бухгалтер"
  };
  // qualitative labels — игрок видит описание, не число
  function describe(t) {
    if (t >= 80) return { txt: "ДОВЕРЯЕТ ПОЛНОСТЬЮ", col: [120, 220, 140] };
    if (t >= 60) return { txt: "на твоей стороне",   col: [168, 255, 101] };
    if (t >= 40) return { txt: "нейтрально",          col: [200, 200, 210] };
    if (t >= 25) return { txt: "относится прохладно", col: [255, 179, 71] };
    return                  { txt: "не доверяет",     col: [255, 100, 110] };
  }
  const keys = ["serik", "timur", "dana", "aigerim", "kamila"];
  keys.forEach((key, i) => {
    const y = 150 + i * 60;
    const t = getTrust(key);
    const d = describe(t);
    trustReportObjs.push(k.add([k.rect(800, 50), k.color(15, 17, 22), k.opacity(0.95), k.outline(1, k.rgb(80, 30, 36)), k.pos(80, y), k.fixed()]));
    trustReportObjs.push(k.add([k.text(names[key] || key, { size: 14 }), k.color(232, 226, 212), k.pos(100, y + 8), k.fixed()]));
    trustReportObjs.push(k.add([k.text(d.txt, { size: 14 }), k.color(d.col[0], d.col[1], d.col[2]), k.pos(100, y + 28), k.fixed()]));
    // hidden bar on the right (a vague indicator, no number)
    const barW = Math.max(8, Math.floor(t * 2.4));
    trustReportObjs.push(k.add([k.rect(240, 6), k.color(40, 30, 36), k.pos(620, y + 22), k.fixed()]));
    trustReportObjs.push(k.add([k.rect(barW, 6), k.color(d.col[0], d.col[1], d.col[2]), k.opacity(0.85), k.pos(620, y + 22), k.fixed()]));
  });

  // surveillance line
  const surv = state.surveillance || 0;
  const survLabel = surv >= 60 ? "NEXAI наблюдает за тобой пристально"
                   : surv >= 30 ? "ты у NEXAI в списке"
                   : surv >= 10 ? "NEXAI поглядывает"
                   : "NEXAI пока тебя не выделяет";
  trustReportObjs.push(k.add([k.text("// " + survLabel, { size: 12 }), k.color(194, 32, 42), k.opacity(0.9), k.pos(480, 470), k.anchor("center"), k.fixed()]));
  trustReportObjs.push(k.add([k.text("ESC / E — закрыть", { size: 11 }), k.color(154, 147, 132), k.pos(480, 562), k.anchor("center"), k.fixed()]));

  const onClose = k.onKeyPress("escape", () => { closeTrustReport(); onClose.cancel(); });
  const onTouchClose = k.onUpdate(() => {
    if (paused && typeof takeMobilePress === "function" && takeMobilePress("interact")) closeTrustReport();
  });
  trustReportObjs.push({ destroy: () => { onClose.cancel(); onTouchClose.cancel(); } });
}

function toggleLaptop() {
  if (dialogOpen || paused || codePuzzleOpen) return;
  if (laptopOpen) closeLaptop(); else openLaptop();
}

function openLaptop() {
  if (laptopOpen) return;
  laptopOpen = true;
  Aud.uiBlip();
  const rows = [
    ["Локация", sceneTitle(state.scene)],
    ["Задача", state.task],
    ["Акт", `АКТ ${state.act || 1}: ${actTitle(state.act || 1)}`],
    ["Тревога", `${Math.round(state.fear)}/100`]
  ];

  laptopObjs.push(k.add([k.rect(960, 600), k.color(0, 0, 0), k.opacity(0.72), k.pos(0, 0), k.fixed(), "laptop"]));
  laptopObjs.push(k.add([k.rect(620, 390), k.color(8, 10, 14), k.opacity(0.96), k.outline(2, k.rgb(98, 197, 255)), k.pos(170, 100), k.fixed()]));
  laptopObjs.push(k.add([k.text("NEXCORE LAPTOP", { size: 34 }), k.color(98, 197, 255), k.pos(480, 134), k.anchor("center"), k.fixed()]));
  laptopObjs.push(k.add([k.text("// local session · manual save", { size: 16 }), k.color(154, 147, 132), k.pos(480, 174), k.anchor("center"), k.fixed()]));

  rows.forEach(([label, value], i) => {
    const y = 220 + i * 34;
    laptopObjs.push(k.add([k.text(`${label}:`, { size: 16 }), k.color(255, 179, 71), k.pos(220, y), k.fixed()]));
    laptopObjs.push(k.add([k.text(String(value), { size: 16, width: 420 }), k.color(232, 226, 212), k.pos(330, y), k.fixed()]));
  });

  const saveBtn = k.add([k.rect(240, 48), k.color(20, 42, 52), k.outline(1, k.rgb(98, 197, 255)), k.pos(230, 392), k.area(), k.fixed(), "laptop-btn"]);
  const closeBtn = k.add([k.rect(240, 48), k.color(42, 20, 24), k.outline(1, k.rgb(194, 32, 42)), k.pos(490, 392), k.area(), k.fixed(), "laptop-btn"]);
  laptopObjs.push(saveBtn, closeBtn);
  laptopObjs.push(k.add([k.text("СОХРАНИТЬ", { size: 18 }), k.color(232, 226, 212), k.pos(350, 416), k.anchor("center"), k.fixed()]));
  laptopObjs.push(k.add([k.text("ЗАКРЫТЬ", { size: 18 }), k.color(232, 226, 212), k.pos(610, 416), k.anchor("center"), k.fixed()]));
  laptopObjs.push(k.add([k.text("T / ESC закрыть · сохранение запоминает текущую сцену, позицию и прогресс", { size: 13, width: 620 }), k.color(90, 84, 72), k.pos(480, 462), k.anchor("center"), k.fixed()]));

  saveBtn.onClick(() => {
    Aud.save();
    saveGame();
    closeLaptop();
  });
  closeBtn.onClick(closeLaptop);
  laptopTouchHandler = (x, y) => {
    const hit = k.get("laptop-btn").find((b) => (
      x >= b.pos.x && x <= b.pos.x + b.width
      && y >= b.pos.y && y <= b.pos.y + b.height
    ));
    if (!hit) return false;
    if (hit === saveBtn) {
      Aud.save();
      saveGame();
      closeLaptop();
    } else {
      closeLaptop();
    }
    return true;
  };
}

function closeLaptop() {
  laptopOpen = false;
  laptopTouchHandler = null;
  laptopObjs.forEach((o) => { if (o.destroy) o.destroy(); });
  laptopObjs = [];
}

function handleLaptopTouch(x, y) {
  return !!(laptopTouchHandler && laptopTouchHandler(x, y));
}

const codeTerminal = document.querySelector("#code-terminal");
const codeTerminalTitle = document.querySelector("#code-terminal-title");
const codeTerminalKicker = document.querySelector("#code-terminal-kicker");
const codeTerminalLog = document.querySelector("#code-terminal-log");
const codeTerminalForm = document.querySelector("#code-terminal-form");
const codeTerminalInput = document.querySelector("#code-terminal-input");
const codeTerminalClose = document.querySelector("#code-terminal-close");

function normalizeCodeLine(line) {
  return String(line || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*;\s*$/, "");
}

function appendCodeLine(text, kind = "system") {
  if (!codeTerminalLog) return;
  const p = document.createElement("p");
  p.className = `terminal-line ${kind}`;
  p.textContent = text;
  codeTerminalLog.appendChild(p);
  codeTerminalLog.scrollTop = codeTerminalLog.scrollHeight;
}

function codeStepMatches(step, value) {
  const normalized = normalizeCodeLine(value);
  const answers = [step.answer].concat(step.aliases || []);
  return answers.some((answer) => normalizeCodeLine(answer) === normalized);
}

function renderCodeStep() {
  const puzzle = activeCodePuzzle;
  if (!puzzle) return;
  const step = puzzle.steps[puzzle.stepIndex];
  appendCodeLine("");
  appendCodeLine(`[${puzzle.stepIndex + 1}/${puzzle.steps.length}] ${step.prompt}`, "system");
  if (step.example) appendCodeLine(`ожидается: ${step.example}`, "hint");
}

function openCodePuzzle(config) {
  if (!codeTerminal || !codeTerminalInput || !codeTerminalForm) {
    openDialog(config.title || "Терминал", "Терминал ввода кода не найден. Нужен игровой shell с #code-terminal.", [
      { text: "Закрыть", action: clearDialog }
    ]);
    return;
  }
  clearDialog();
  closeLaptop();
  codePuzzleOpen = true;
  activeCodePuzzle = {
    title: config.title || "PATCH CONSOLE",
    kicker: config.kicker || "// remote laptop session",
    steps: config.steps || [],
    onComplete: config.onComplete || (() => {}),
    onCancel: config.onCancel || (() => {}),
    stepIndex: 0,
    mistakes: 0
  };
  codeTerminalTitle.textContent = activeCodePuzzle.title;
  codeTerminalKicker.textContent = activeCodePuzzle.kicker;
  codeTerminalLog.innerHTML = "";
  codeTerminal.hidden = false;
  appendCodeLine("Соединение с ноутбуком Айгерим установлено.", "ok");
  appendCodeLine("Пиши код сам. Enter запускает строку, RUN делает то же самое.", "system");
  renderCodeStep();
  codeTerminalInput.value = "";
  setTimeout(() => codeTerminalInput.focus(), 0);
  Aud.uiBlip();
}

function closeCodePuzzle(cancelled = true) {
  if (!codePuzzleOpen) return;
  const puzzle = activeCodePuzzle;
  codePuzzleOpen = false;
  activeCodePuzzle = null;
  if (codeTerminal) codeTerminal.hidden = true;
  if (cancelled && puzzle) puzzle.onCancel(puzzle);
}

function submitCodePuzzleLine() {
  const puzzle = activeCodePuzzle;
  if (!puzzle || !codeTerminalInput) return;
  const value = codeTerminalInput.value;
  const step = puzzle.steps[puzzle.stepIndex];
  if (!normalizeCodeLine(value)) return;

  appendCodeLine(`> ${value}`, "input");
  codeTerminalInput.value = "";

  if (codeStepMatches(step, value)) {
    Aud.uiSelect();
    appendCodeLine(step.success || "ok", "ok");
    puzzle.stepIndex += 1;
    if (puzzle.stepIndex >= puzzle.steps.length) {
      const result = { mistakes: puzzle.mistakes, score: Math.max(0, puzzle.steps.length - puzzle.mistakes) };
      appendCodeLine("Патч собран. Применяю изменения...", "ok");
      setTimeout(() => {
        closeCodePuzzle(false);
        puzzle.onComplete(result);
      }, 260);
      return;
    }
    renderCodeStep();
    return;
  }

  puzzle.mistakes += 1;
  state.fear = Math.min(100, state.fear + 2);
  syncHUD();
  Aud.nexai();
  appendCodeLine("Syntax accepted, intent rejected. NEXAI пытается подставить свою строку.", "err");
  appendCodeLine(step.hint || "Подумай, как ограничить ИИ и защитить данные.", "hint");
  shake(4, 0.25);
}

if (codeTerminalForm) {
  codeTerminalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();
    submitCodePuzzleLine();
  });
}
if (codeTerminalInput) {
  codeTerminalInput.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (event.key === "Escape") closeCodePuzzle(true);
  });
}
if (codeTerminalClose) {
  codeTerminalClose.addEventListener("click", () => closeCodePuzzle(true));
}
if (codeTerminal) {
  codeTerminal.addEventListener("keydown", (event) => event.stopPropagation());
  codeTerminal.addEventListener("keyup", (event) => event.stopPropagation());
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
k.onKeyPress("t", () => toggleLaptop());
k.onKeyPress("escape", () => {
  if (codePuzzleOpen) return;
  if (laptopOpen) closeLaptop();
});

function clearDialog() {
  dialogObjs.forEach((o) => o.destroy());
  dialogObjs = [];
  dialogOpen = false;
  dialogReadyAt = k.time() + 0.08;
}

function openDialog(speaker, line, choices, portraitOverride) {
  clearDialog();
  dialogOpen = true;
  dialogReadyAt = k.time() + 0.18;
  Aud.dialogOpen();

  const portrait = portraitOverride || findCharByName(speaker);
  const portraitW = portrait ? 124 : 0;
  // dialog auto-shrinks and shifts up when many choices
  const nChoices = choices.length;
  const useTwoCols = nChoices > 4;
  dialogChoiceCols = useTwoCols ? 2 : 1;
  const choiceRows = useTwoCols ? Math.ceil(nChoices / 2) : nChoices;
  const choiceStep = 42;
  const choiceH = 38;
  const choicesHeight = 10 + choiceRows * choiceStep;
  const boxH = 220;
  const totalH = boxH + choicesHeight;
  const boxX = 30;
  const boxY = Math.max(40, 590 - totalH); // anchor to bottom but never overflow top bar
  const boxW = 900;
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
    k.text("▌ " + speaker, { size: 22 }),
    k.color(194, 32, 42),
    k.pos(textX, boxY + 16),
    k.fixed()
  ]));
  dialogObjs.push(k.add([
    k.rect(textW, 1),
    k.color(194, 32, 42),
    k.opacity(0.3),
    k.pos(textX, boxY + 46),
    k.fixed()
  ]));

  // dialog text
  dialogObjs.push(k.add([
    k.text(line, { size: 22, width: textW }),
    k.color(248, 244, 232),
    k.pos(textX, boxY + 58),
    k.fixed()
  ]));

  // choices: stack in one column if ≤4, else 2 columns
  const btnW = useTwoCols ? Math.floor(boxW / 2) - 2 : boxW;
  choices.forEach((c, i) => {
    const col = useTwoCols ? (i % 2) : 0;
    const row = useTwoCols ? Math.floor(i / 2) : i;
    const btnX = boxX + col * (btnW + 4);
    const btnY = boxY + boxH + 10 + row * choiceStep;
    const btn = k.add([
      k.rect(btnW, choiceH),
      k.color(20, 24, 30),
      k.opacity(0.95),
      k.outline(1, k.rgb(120, 32, 36)),
      k.pos(btnX, btnY),
      k.area(),
      k.fixed(),
      "dialog-btn",
      { _idx: i, _row: row, _col: col, _action: c.action, _selected: i === 0 }
    ]);
    // truncate long labels in two-col mode so they fit
    const labelText = "  " + (i + 1) + ". " + c.text;
    const maxLen = useTwoCols ? 48 : 150;
    const shown = labelText.length > maxLen ? labelText.slice(0, maxLen - 1) + "…" : labelText;
    const lbl = k.add([
      k.text(shown, { size: 17 }),
      k.color(248, 244, 232),
      k.pos(btnX + 14, btnY + 10),
      k.fixed()
    ]);
    btn.onUpdate(() => {
      btn.color = btn._selected ? k.rgb(60, 14, 18) : k.rgb(20, 24, 30);
    });
    btn.onClick(() => { if (k.time() >= dialogReadyAt) c.action(); });
    dialogObjs.push(btn, lbl);
  });
}

function nextDialogSelection(dir) {
  const btns = k.get("dialog-btn");
  if (!btns.length) return;
  const sorted = btns.slice().sort((a, b) => a._idx - b._idx);
  let idx = sorted.findIndex((b) => b._selected);
  if (idx < 0) idx = 0;
  sorted[idx]._selected = false;
  idx = (idx + dir + sorted.length) % sorted.length;
  sorted[idx]._selected = true;
  Aud.uiBlip();
}

function moveDialogSelection(dx, dy) {
  const btns = k.get("dialog-btn");
  if (!btns.length) return;
  if (dialogChoiceCols === 1 || dx === 0) {
    nextDialogSelection(dy || dx);
    return;
  }
  const selected = btns.find((b) => b._selected) || btns[0];
  const target = btns.find((b) => b._row === selected._row && b._col === selected._col + dx);
  if (!target) return;
  selected._selected = false;
  target._selected = true;
  Aud.uiBlip();
}

function chooseDialogNumber(n) {
  if (k.time() < dialogReadyAt) return;
  const btn = k.get("dialog-btn").find((b) => b._idx === n - 1);
  if (btn) btn._action();
}

function confirmDialogSelection() {
  if (k.time() < dialogReadyAt) return;
  const btn = k.get("dialog-btn").find((b) => b._selected);
  if (btn) btn._action();
}

function handleDialogTouch(x, y) {
  if (!dialogOpen || k.time() < dialogReadyAt) return false;
  const btns = k.get("dialog-btn");
  const hit = btns.find((b) => (
    x >= b.pos.x && x <= b.pos.x + b.width
    && y >= b.pos.y && y <= b.pos.y + b.height
  ));
  if (!hit) return false;
  btns.forEach((b) => { b._selected = b === hit; });
  Aud.uiSelect();
  hit._action();
  return true;
}

k.onKeyPress("up", () => { if (dialogOpen) moveDialogSelection(0, -1); });
k.onKeyPress("down", () => { if (dialogOpen) moveDialogSelection(0, 1); });
k.onKeyPress("left", () => { if (dialogOpen) moveDialogSelection(-1, 0); });
k.onKeyPress("right", () => { if (dialogOpen) moveDialogSelection(1, 0); });
k.onKeyPress("w", () => { if (dialogOpen) moveDialogSelection(0, -1); });
k.onKeyPress("s", () => { if (dialogOpen) moveDialogSelection(0, 1); });
k.onKeyPress("a", () => { if (dialogOpen) moveDialogSelection(-1, 0); });
k.onKeyPress("d", () => { if (dialogOpen) moveDialogSelection(1, 0); });
for (let i = 1; i <= 9; i++) {
  k.onKeyPress(String(i), () => { if (dialogOpen) chooseDialogNumber(i); });
}
k.onButtonPress("interact", () => { if (dialogOpen) confirmDialogSelection(); });
let nextDialogMobileNavAt = 0;
k.onUpdate(() => {
  if (!dialogOpen || typeof mobileInput === "undefined") return;
  if (k.time() < nextDialogMobileNavAt) return;
  if (Math.abs(mobileInput.y) > 0.55) {
    moveDialogSelection(0, mobileInput.y > 0 ? 1 : -1);
    nextDialogMobileNavAt = k.time() + 0.22;
  } else if (Math.abs(mobileInput.x) > 0.55) {
    moveDialogSelection(mobileInput.x > 0 ? 1 : -1, 0);
    nextDialogMobileNavAt = k.time() + 0.22;
  }
});
