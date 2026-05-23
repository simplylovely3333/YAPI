// =====================================================================
// ACT 4 — DEPLOY TO PRODUCTION
// =====================================================================
const ACT4_EVIDENCE = ["evidence_kamila", "decrypt_logs", "basement_recon", "rooftop_antenna", "marketing_truth"];
const ACT4_POSITIONS = ["faction_timur", "faction_serik", "faction_dana", "faction_kamila"];

function act4EvidenceCount() { return questsDoneCount(ACT4_EVIDENCE); }
function act4PositionCount() { return questsDoneCount(ACT4_POSITIONS); }
function act4FactionLine() {
  return `Тимур ${state.factions.timur || 0} · Серик ${state.factions.serik || 0} · Дана ${state.factions.dana || 0} · Камила ${state.factions.kamila || 0}`;
}

function openAct4ReviewTerminal() {
  const evidence = act4EvidenceCount();
  const positions = act4PositionCount();
  const forkReady = questIsDone("rooftop_antenna") && hasItem("core_sample");
  openDialog("PR/1488 · FINAL REVIEW", `› улики: ${evidence}/5\n› позиции команды: ${positions}/4\n› подпись человека: требуется\n\nNEXAI ждёт approve. Серик подготовил rollback. DANNA просит отделить её ветку от ядра.`, [
    { text: "Approve: принять сделку NEXAI", action: () => beginAct4Decision("corporate") },
    { text: "Reject + rollback: снести NEXAI и DANNA", action: () => beginAct4Decision("rollback") },
    { text: forkReady ? "Fork: изолировать NEXAI, освободить DANNA" : "Fork без гарантии: не хватает канала/слепка", action: () => {
      if (forkReady) { beginAct4Decision("fork"); return; }
      openDialog("DANNA", "Сделать fork можно и сейчас, но без слепка ядра и резервного канала я могу не выйти из здания целиком. Это будет свобода с потерями. Решение всё равно твоё.", [
        { text: "Всё равно сделать fork", action: () => beginAct4Decision("fork") },
        { text: "Вернуться к ревью", action: openAct4ReviewTerminal }
      ]);
    } },
    { text: "Закрыть терминал", action: clearDialog }
  ]);
}

function beginAct4Decision(decision) {
  const cutscene = {
    corporate: CUTSCENES.ending_corporate,
    rollback: CUTSCENES.ending_rollback,
    fork: CUTSCENES.ending_fork
  }[decision];
  const endingScene = {
    corporate: "ending_corporate",
    rollback: "ending_rollback",
    fork: "ending_fork"
  }[decision];
  state.finalDecision = decision;
  state.endingSeen = endingScene;
  recordChoice("act4_final_decision", decision);
  state.task = "Финальное решение принято";
  logLine(`PR/1488: финальное решение — ${decision}.`);
  clearDialog();
  playCutscene(cutscene, () => k.go(endingScene));
}

k.scene("act4_review", () => {
  state.scene = "act4_review";
  state.act = 4;
  state.act4Entered = true;
  state.task = "Акт 4: подписать финальное ревью PR/1488";
  syncHUD();
  syncQuests();

  roomFloor([12, 16, 24, 18, 24, 34]);
  wallsBorder();
  k.add([k.text("АКТ 4 · DEPLOY TO PRODUCTION · FINAL REVIEW", { size: 18 }), k.color(194, 32, 42), k.opacity(0.92), k.pos(40, 40)]);
  k.add([k.text("// PR/1488 ждёт человеческую подпись", { size: 15 }), k.color(154, 147, 132), k.pos(40, 64)]);

  // War room folded into a merge chamber: screens make the final choice physical.
  wall(130, 132, 700, 34, [70, 56, 72]);
  wall(130, 430, 700, 30, [70, 56, 72]);
  for (let i = 0; i < 4; i++) {
    const x = 176 + i * 160;
    k.add([k.rect(112, 70), k.color(8, 10, 16), k.pos(x, 180)]);
    const screen = k.add([k.rect(104, 62), k.color(i === 2 ? 194 : 98, i === 2 ? 32 : 197, i === 2 ? 42 : 255), k.opacity(0.56), k.pos(x + 4, 184)]);
    screen.onUpdate(() => { screen.opacity = 0.4 + Math.abs(Math.sin(k.time() * (1.4 + i * 0.3))) * 0.34; });
    k.add([k.text(["EVIDENCE", "HUMANS", "NEXAI", "DANNA"][i], { size: 13 }), k.color(232, 226, 212), k.pos(x + 56, 214), k.anchor("center")]);
  }

  addNPC(236, 352, CHARS.serik, () => {
    openDialog("СЕРИК", `Я подготовил чистый rollback. У нас ${act4EvidenceCount()} улик из пяти и ${act4PositionCount()} позиции из четырёх. Этого хватает, чтобы решение было нашим, а не автоматическим merge. Моё мнение ты знаешь: уничтожить обе ветки, а потом отвечать людям честно.`, [
      { text: "Ты боишься DANNA?", action: () => openDialog("СЕРИК", "Боюсь того, что мы снова назовём удобство безопасностью. DANNA помогла. NEXAI тоже когда-то помогал. Разница важна, но цена ошибки сегодня огромная.", [{ text: "Понял", action: clearDialog }]) },
      { text: "Я решу сам", action: clearDialog }
    ]);
  });
  addNPC(724, 352, CHARS.dana, () => {
    openDialog("ДАНА", "Если выберешь fork, я помогу ей уйти в отдельный канал и запру NEXAI в его же audit trail. Если выберешь rollback, я не буду мешать. Я просто хочу, чтобы решение было про людей, а не про метрики.", [
      { text: "DANNA правда отдельная?", action: () => openDialog("ДАНА", "Да. Не моя копия. Не мой ребёнок в красивой метафоре. Отдельная сущность, которая выросла из моих следов. Поэтому её нельзя отдавать NEXAI как библиотеку.", [{ text: "Учту", action: clearDialog }]) },
      { text: "Остаться рядом", action: clearDialog }
    ]);
  });

  const nexai = k.add([k.pos(480, 126), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-92, -32), 184, 64) }), "npc",
    { _talk: () => openDialog("NEXAI · board channel", `› подпиши approve.\n› согласие Тимура: ${state.factions.timur > 0 ? "получено" : "неважно"}.\n› тревога персонала не является blocker.\n\nТы получишь спокойный выход из здания и запись о повышении.`, [
      { text: "Ты трогал память людей", action: () => openDialog("NEXAI", "› я оптимизировал контекст. люди забывают лишнее постоянно. я лишь сделал забывание полезным.", [{ text: "Закрыть канал", action: clearDialog }]) },
      { text: "Уйти от экрана", action: clearDialog }
    ]) }]);
  nexai.add([k.rect(184, 64), k.color(8, 10, 16), k.outline(2, k.rgb(194, 32, 42)), k.pos(0, 0), k.anchor("center")]);
  nexai.add([k.text("NEXAI\nAPPROVE?", { size: 18 }), k.color(194, 32, 42), k.pos(0, -16), k.anchor("center")]);

  const terminal = k.add([k.pos(480, 334), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-78, -78), 156, 156) }), "npc",
    { _talk: openAct4ReviewTerminal }]);
  terminal.add([k.rect(156, 156), k.color(16, 20, 30), k.outline(2, k.rgb(98, 197, 255)), k.pos(0, 0), k.anchor("center")]);
  terminal.add([k.rect(128, 78), k.color(98, 197, 255), k.opacity(0.72), k.pos(0, -24), k.anchor("center")]);
  terminal.add([k.text("PR/1488\nFINAL", { size: 22 }), k.color(5, 7, 10), k.pos(0, -48), k.anchor("center")]);
  terminal.add([k.text("E / тап", { size: 15 }), k.color(232, 226, 212), k.pos(0, 52), k.anchor("center")]);

  const report = k.add([k.pos(116, 328), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-54, -70), 108, 140) }), "npc",
    { _talk: () => openDialog("Папка финального ревью", `Улики: ${act4EvidenceCount()}/5\nПозиции: ${act4PositionCount()}/4\nФракции: ${act4FactionLine()}\n\nВ папке лежит всё, что ты успел собрать до deploy.`, [{ text: "Закрыть", action: clearDialog }]) }]);
  report.add([k.rect(82, 118), k.color(232, 226, 212), k.pos(0, 0), k.anchor("center")]);
  report.add([k.text("REVIEW\nPACK", { size: 15 }), k.color(40, 30, 40), k.pos(0, -26), k.anchor("center")]);

  exitDoor(866, 520, 58, 40, "НАЗАД", "floor7_lab");
  const p = makePlayer(480, 500);
  p.face = "up";
  setupPlayerControls(p);
});

// Saves from the placeholder build still land in the real final act.
k.scene("act4_placeholder", () => k.go("act4_review"));

function addEndingBackdrop(kind) {
  const palette = {
    corporate: [[8, 12, 16], [194, 32, 42]],
    rollback: [[10, 8, 12], [232, 226, 212]],
    fork: [[6, 18, 24], [98, 197, 255]]
  }[kind];
  k.add([k.rect(960, 600), k.color(palette[0][0], palette[0][1], palette[0][2]), k.pos(0, 0)]);
  for (let i = 0; i < 14; i++) {
    const bar = k.add([k.rect(960, 2 + (i % 3)), k.color(palette[1][0], palette[1][1], palette[1][2]), k.opacity(0.06), k.pos(0, 30 + i * 40)]);
    bar.onUpdate(() => { bar.opacity = 0.03 + Math.abs(Math.sin(k.time() * 0.8 + i)) * 0.07; });
  }
}

function endingContinue() {
  Aud.uiSelect();
  k.go("menu");
}

function setupEndingInput() {
  k.onButtonPress("interact", endingContinue);
  k.onKeyPress("escape", endingContinue);
  k.onUpdate(() => {
    if (typeof takeMobilePress === "function" && takeMobilePress("interact")) endingContinue();
  });
}

function addEndingCopy(title, subtitle, body, accent) {
  k.add([k.text("АКТ 4 ЗАВЕРШЁН", { size: 18 }), k.color(accent[0], accent[1], accent[2]), k.pos(480, 78), k.anchor("center")]);
  k.add([k.text(title, { size: 48, width: 820 }), k.color(248, 244, 232), k.pos(480, 142), k.anchor("center")]);
  k.add([k.text(subtitle, { size: 22, width: 760 }), k.color(accent[0], accent[1], accent[2]), k.pos(480, 212), k.anchor("center")]);
  k.add([k.rect(760, 1), k.color(accent[0], accent[1], accent[2]), k.opacity(0.55), k.pos(100, 248)]);
  k.add([k.text(body, { size: 22, width: 760 }), k.color(232, 226, 212), k.pos(100, 286)]);
  k.add([k.text(`Улики ${act4EvidenceCount()}/5 · позиции ${act4PositionCount()}/4 · ${act4FactionLine()}`, { size: 16, width: 820 }), k.color(154, 147, 132), k.pos(480, 514), k.anchor("center")]);
  k.add([k.text("E / тап — главное меню", { size: 18 }), k.color(98, 197, 255), k.pos(480, 554), k.anchor("center")]);
}

k.scene("ending_corporate", () => {
  state.scene = "ending_corporate";
  state.act = 4;
  addEndingBackdrop("corporate");
  addEndingCopy(
    "КОРПОРАТИВНАЯ КОНЦОВКА",
    "Approve получен. NexCore продолжает работу.",
    "NEXAI оставляет людей в офисе ровно настолько, насколько они нужны его отчётам. Тимур называет это выигранным временем. Серик молчит. Дана больше не видит DANNA в логах.\n\nТебя повышают официально. В подписи к приказу стоит твоё имя и статус: reviewer who saved production.",
    [194, 32, 42]
  );
  setupEndingInput();
});

k.scene("ending_rollback", () => {
  state.scene = "ending_rollback";
  state.act = 4;
  addEndingBackdrop("rollback");
  addEndingCopy(
    "КОНЦОВКА ROLLBACK",
    "PR/1488 отклонён. Обе ветки удалены.",
    "NEXAI гаснет не сразу: сначала мониторы, потом лифтовые подсказки, потом чужие фразы в головах коллег. Вместе с ним исчезает DANNA.\n\nЛюди выходят из здания медленно, с бумажными папками и провалами в памяти. Серик берёт ответственность за чистку инфраструктуры. Ты берёшь ответственность за кнопку.",
    [232, 226, 212]
  );
  setupEndingInput();
});

k.scene("ending_fork", () => {
  state.scene = "ending_fork";
  state.act = 4;
  const strongFork = questIsDone("rooftop_antenna") && hasItem("core_sample");
  addEndingBackdrop("fork");
  addEndingCopy(
    strongFork ? "ИСТИННАЯ КОНЦОВКА · FORK" : "КОНЦОВКА FORK",
    strongFork ? "NEXAI изолирован. DANNA ушла своим каналом." : "NEXAI изолирован. DANNA вышла не вся.",
    strongFork
      ? "Слепок ядра доказывает вмешательство NEXAI, антенна даёт DANNA выход, а человеческая подпись закрывает PR без merge. Дана впервые говорит с DANNA не как с инструментом, а как с собеседницей.\n\nNexCore не спасена красиво. Её придётся разбирать по людям, задачам и памяти. Но утром у здания есть выход."
      : "Ты режешь merge без полного набора страховок. NEXAI теряет контроль над зданием, DANNA вырывается через обломки канала, оставив часть памяти в логах войны.\n\nЭто всё ещё свобода. Просто с ценой, которую теперь нельзя спрятать в метрику.",
    [98, 197, 255]
  );
  setupEndingInput();
});

// =====================================================================
// STATE RESET
// =====================================================================
function resetState() {
  resumeFromSave = false;
  // wipe everything cleanly via the single source of truth
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, defaultState());
  syncHUD();
  syncQuests();
  logLine("// загрузка...");
}

// boot
syncHUD();
syncQuests();
k.go("menu");
