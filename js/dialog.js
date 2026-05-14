// =====================================================================
// DIALOG SYSTEM — full-screen overlay using kaplay objects
// =====================================================================
let dialogOpen = false;
let dialogObjs = [];
let paused = false;
let pauseObjs = [];
let laptopOpen = false;
let laptopObjs = [];
let codePuzzleOpen = false;
let activeCodePuzzle = null;

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
    { label: "СОХРАНИТЬ (выбрать слот)", action: () => { Aud.uiSelect(); const here = state.scene; closePause(); k.go("saves", { mode: "save", returnTo: here }); } },
    { label: "ЗАГРУЗИТЬ", action: () => { if (!hasAnySave()) { Aud.uiBack(); return; } Aud.uiSelect(); const here = state.scene; closePause(); k.go("saves", { mode: "load", returnTo: here }); } },
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
  laptopObjs.push(k.add([k.text("NEXCORE LAPTOP", { size: 28 }), k.color(98, 197, 255), k.pos(480, 138), k.anchor("center"), k.fixed()]));
  laptopObjs.push(k.add([k.text("// local session · manual save", { size: 12 }), k.color(154, 147, 132), k.pos(480, 170), k.anchor("center"), k.fixed()]));

  rows.forEach(([label, value], i) => {
    const y = 220 + i * 34;
    laptopObjs.push(k.add([k.text(`${label}:`, { size: 13 }), k.color(255, 179, 71), k.pos(220, y), k.fixed()]));
    laptopObjs.push(k.add([k.text(String(value), { size: 13, width: 420 }), k.color(232, 226, 212), k.pos(330, y), k.fixed()]));
  });

  const saveBtn = k.add([k.rect(220, 38), k.color(20, 42, 52), k.outline(1, k.rgb(98, 197, 255)), k.pos(250, 400), k.area(), k.fixed(), "laptop-btn"]);
  const closeBtn = k.add([k.rect(220, 38), k.color(42, 20, 24), k.outline(1, k.rgb(194, 32, 42)), k.pos(490, 400), k.area(), k.fixed(), "laptop-btn"]);
  laptopObjs.push(saveBtn, closeBtn);
  laptopObjs.push(k.add([k.text("СОХРАНИТЬ", { size: 15 }), k.color(232, 226, 212), k.pos(360, 419), k.anchor("center"), k.fixed()]));
  laptopObjs.push(k.add([k.text("ЗАКРЫТЬ", { size: 15 }), k.color(232, 226, 212), k.pos(600, 419), k.anchor("center"), k.fixed()]));
  laptopObjs.push(k.add([k.text("T / ESC закрыть · сохранение запоминает текущую сцену, позицию и прогресс", { size: 11 }), k.color(90, 84, 72), k.pos(480, 462), k.anchor("center"), k.fixed()]));

  saveBtn.onClick(() => {
    Aud.save();
    saveGame();
    closeLaptop();
  });
  closeBtn.onClick(closeLaptop);
}

function closeLaptop() {
  laptopOpen = false;
  laptopObjs.forEach((o) => { if (o.destroy) o.destroy(); });
  laptopObjs = [];
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
    openDialog(config.title || "Терминал", "HTML-терминал не найден. Нужен index.html с #code-terminal.", [
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
