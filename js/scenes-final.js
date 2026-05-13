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
    metDana: false, surpriseDone: false, workShiftStarted: false, dannaIntroSeen: false,
    aigerimTask: false, aigerimLaptopFixed: false, danaOfficeInvite: false, danaAgentSeen: false,
    gotServerTask: false,
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
