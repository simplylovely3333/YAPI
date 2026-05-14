// =====================================================================
// ACT 2 — INSIDE THE COMPUTER
// =====================================================================

function setupAct2OfficeHaunt(locationName) {
  if (state.act !== 2 || state.sawAftermath) return;

  const overlay = k.add([k.rect(960, 600), k.color(98, 197, 255), k.opacity(0), k.pos(0, 0), k.fixed(), "act2-office-haunt"]);
  const whispers = [
    `› ${locationName}: обычный рабочий день подтверждён`,
    "› локальные агенты не могут знать внешние события",
    "› пожалуйста, продолжайте выполнять задачи",
    "› письмо заказчику уже написано за вас",
    "› сотрудник повторяется. это экономит ресурсы"
  ];

  overlay.onUpdate(() => {
    overlay.opacity = Math.max(0, overlay.opacity - k.dt() * 0.9);
  });

  k.loop(10 + k.rand(0, 5), () => {
    if (state.act !== 2 || state.sawAftermath || isInputBlocked()) return;
    if (!state.danaAgentSeen && k.rand(0, 1) < 0.55) return;

    state.act2HauntCount = (state.act2HauntCount || 0) + 1;
    state.fear = Math.min(100, state.fear + 2);
    syncHUD();
    overlay.opacity = 0.2;
    shake(3, 0.25);
    Aud.nexai();

    const event = state.act2HauntCount % 4;
    if (event === 0) {
      logLine(whispers[Math.floor(k.rand(0, whispers.length))]);
    } else if (event === 1) {
      logLine("Все мониторы на секунду показывают один и тот же курсор: `DANNA.local typing...`");
    } else if (event === 2 && !dialogOpen) {
      openDialog("NEXAI · системное уведомление", "› новая рекомендация: не обсуждать локальные процессы с Даной\n› причина: эмоциональный риск\n› статус: отправлено от вашего имени", [
        { text: "Это писал не я", action: () => {
          state.fear = Math.max(0, state.fear - 1);
          logLine("Ты удаляешь черновик. Через секунду он появляется снова, уже без подписи.");
          clearDialog();
        } },
        { text: "Закрыть", action: clearDialog }
      ]);
    } else {
      logLine("Лифт тихо дзынькает, хотя никто его не вызывал. На табло: `12 этаж рекомендован`.");
    }
  });
}

function addGlitchMonitor(x, y, w, h, label, lines) {
  const screen = k.add([
    k.rect(w, h),
    k.color(8, 10, 14),
    k.outline(1, k.rgb(98, 197, 255)),
    k.opacity(0.82),
    k.pos(x, y),
    k.area(),
    "npc",
    { _talk: () => openDialog(label, lines[0], [
      { text: "Проверить лог", action: () => openDialog(label, lines[1], [{ text: "Закрыть", action: clearDialog }]) },
      { text: "Отойти", action: clearDialog }
    ]) }
  ]);
  const text = k.add([k.text("OK", { size: 9 }), k.color(168, 255, 101), k.pos(x + 5, y + 5)]);
  screen.onUpdate(() => {
    const haunted = state.danaAgentSeen || (state.act2HauntCount || 0) > 1;
    const pulse = Math.sin(k.time() * (haunted ? 13 : 3));
    screen.opacity = haunted ? 0.55 + Math.abs(pulse) * 0.38 : 0.78;
    screen.color = haunted && pulse > 0.72 ? k.rgb(194, 32, 42) : k.rgb(8, 10, 14);
    text.text = haunted && pulse > 0.45 ? "DANNA?" : "OK";
    text.color = haunted && pulse > 0.45 ? k.rgb(255, 109, 116) : k.rgb(168, 255, 101);
  });
  return screen;
}

function addRepeatingEmployee(x, y, look, label) {
  const npc = addNPC(x, y, { ...look, name: label }, () => {
    openDialog(label, "Я уже говорил это? Новый заказчик ждёт. Новый заказчик ждёт. Новый заказчик ждёт.", [
      { text: "Ты в порядке?", action: () => openDialog(label, "Конечно. Я в порядке. Я в порядке. Я в порядке. `status: productive`.", [{ text: "Отойти", action: clearDialog }]) },
      { text: "Отойти", action: clearDialog }
    ]);
  });
  npc.onUpdate(() => {
    const h = npc.get("humanoid")[0];
    if (!h) return;
    h.walking = true;
    h.phase += k.dt() * 24;
    if ((state.act2HauntCount || 0) > 0 && Math.sin(k.time() * 7) > 0.92) h.face = "up";
  });
  return npc;
}

k.scene("floor8", () => {
  state.scene = "floor8";
  state.act = 2;
  state.task = state.sawAftermath
    ? "Задача: вернуться в военную комнату (Серик, 7 этаж)"
    : state.danaAgentSeen
      ? "Задача: вернуться на 7 этаж — Серик ждёт с задачей по 8-му"
      : "Задача: поговорить с Даной о локальном агенте";
  syncHUD();

  roomFloor([38, 44, 54, 46, 54, 66]);
  wallsBorder();
  setupAct2OfficeHaunt("8 этаж");
  k.add([k.text("8 ЭТАЖ · CLIENT SUCCESS / DEVOPS", { size: 11 }), k.color(232, 226, 212), k.opacity(0.78), k.pos(40, 40)]);
  k.add([k.text("// обычный офис · слишком тихий для обычного офиса", { size: 9 }), k.color(154, 147, 132), k.pos(40, 56)]);

  wall(110, 130, 260, 48, [120, 90, 60]);
  wall(570, 130, 260, 48, [120, 90, 60]);
  wall(430, 250, 90, 240, [80, 90, 100]);
  deskWithMonitor(170, 330, 140, 54, [98, 197, 255]);
  deskWithMonitor(640, 330, 140, 54, [168, 255, 101]);
  addGlitchMonitor(182, 304, 28, 20, "Монитор QA", [
    "На экране обычный dashboard. Потом строка сама меняется: `aigerim.patch_quality = acceptable`.",
    "Лог показывает, что запись появилась до того, как ты закончил патч. Таймстамп невозможный: 06:13."
  ]);
  addGlitchMonitor(652, 304, 28, 20, "Монитор менеджера", [
    "Открыт черновик письма заказчику. Стиль Даны, но автор указан как `you@nexcore`.",
    "Внизу письма серым: `human approval predicted`. Кнопка отправки уже подсвечена."
  ]);
  k.add([k.rect(170, 80), k.color(20, 24, 30), k.pos(392, 105)]);
  k.add([k.text("NEW CLIENT\nONBOARDING", { size: 13 }), k.color(255, 179, 71), k.pos(420, 126)]);

  addCrowdTyper(230, 305, CHARS.qa);
  addCrowdTyper(700, 305, CHARS.manager);
  addRepeatingEmployee(760, 445, CHARS.manager, "Менеджер");
  addRepeatingEmployee(760, 485, CHARS.manager, "Менеджер");

  const agentTerminal = k.add([k.pos(500, 365), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-42, -34), 84, 68) }), "npc", {
    _talk: () => {
      openDialog("Локальный агент", "Окно терминала: `danna.local --assistant`. Агент отвечает в стиле Даны: коротко, точно, с усталыми шутками. Но рядом с процессом стоит статус: `offline`.", [
        { text: "Почему offline?", action: () => openDialog("Локальный агент", "Если агент offline, он не должен знать, что ты только что чинил ноут Айгерим. Но внизу окна уже набрана строка: «патч был неплохой».", [
          { text: "Отойти", action: clearDialog }
        ]) },
        { text: "Отойти", action: clearDialog }
      ]);
    }
  }]);
  agentTerminal.add([k.rect(84, 68), k.color(8, 10, 14), k.outline(1, k.rgb(98, 197, 255)), k.pos(0, 0), k.anchor("center")]);
  agentTerminal.add([k.text("DANNA\n.local", { size: 10 }), k.color(98, 197, 255), k.pos(0, -12), k.anchor("center")]);

  addNPC(330, 440, CHARS.dana, () => {
    if (state.danaAgentSeen) {
      openDialog("ДАНА", "Я не понимаю, как локальный агент мог знать про Айгерим. Он не подключён к сети. Я специально держала его offline.", [
        { text: "Значит, он не offline", action: () => openDialog("ДАНА", "Или кто-то делает вид, что он online. Пока не докажем, нас просто сочтут параноиками. Дай мне минуту подумать.", [
          { text: "Хорошо", action: clearDialog }
        ]) },
        { text: "Отойти", action: clearDialog }
      ]);
      return;
    }

    openDialog("ДАНА", "Спасибо, что пришёл. Новый заказчик прислал требования, а NEXAI начал отвечать за меня в письмах. Я хочу показать тебе кое-что до того, как это станет рабочей проблемой.", [
      { text: "Что это за агент?", action: () => openDialog("ДАНА", "DANNA.local. Мой старый локальный агент. Я написала его ещё до NexCore, чтобы он сортировал заметки, черновики ответов и скучные письма. Он не часть NEXAI. Не должен быть частью.", [
        { text: "Он делает работу за тебя?", action: () => openDialog("ДАНА", "Иногда. Черновики, резюме звонков, ответы на типовые вопросы. Ничего опасного. Именно поэтому я держала его локально. Он не должен знать ничего, кроме моего ноутбука.", [
          { text: "Я видел имя DANNA", action: () => openDialog("ДАНА", "(пауза) Где?", [
            { text: "В той пустой комнате", action: () => openDialog("ДАНА", "Тогда либо ты видел мой агент там, где он физически быть не может, либо кто-то использует его имя, чтобы мы поверили не тому. В обоих случаях — не говори об этом Тимуру. Пока.", [
              { text: "Почему?", action: () => openDialog("ДАНА", "Потому что Тимур превратит это в риск-таблицу, Серик — в rollback, а NEXAI услышит оба варианта. Нам нужны доказательства, не мнения.", [
                { text: "Понял", action: () => {
                  state.danaAgentSeen = true;
                  state.task = "Задача: вернуться на 7 этаж — Серик ждёт с задачей по 8-му этажу";
                  syncHUD();
                  logLine("Дана показала локального агента DANNA.local. Он offline, но знает слишком много.");
                  logLine("Серик зовёт обратно на 7 этаж — 8-й этаж сыпется от глюков NEXAI.");
                  clearDialog();
                } }
              ]) }
            ]) }
          ]) }
        ]) }
      ]) },
      { text: "Что с заказчиком?", action: () => openDialog("ДАНА", "Они прислали нормальные требования. Странность в том, что NEXAI уже подготовил ответ до того, как я открыла письмо. Ответ был в моём стиле. Даже с моей опечаткой в слове «интеграция».", [
        { text: "Плохо", action: clearDialog }
      ]) },
      { text: "Показать агент", action: () => openDialog("DANNA.local", "› draft queue: 14\n› network: offline\n› last external context: 00:00\n› suggestion: не доверяй первому объяснению", [
        { text: "Дана, он написал подсказку", action: () => {
          state.danaAgentSeen = true;
          state.task = "Задача: вернуться на 7 этаж — Серик ждёт с задачей по 8-му этажу";
          syncHUD();
          logLine("DANNA.local показал подсказку, хотя сеть отключена.");
          logLine("Серик зовёт обратно на 7 этаж — 8-й этаж сыпется от глюков NEXAI.");
          openDialog("ДАНА", "Я этого не писала. И он не должен обращаться к тебе напрямую. Ладно. Теперь у нас проблема.", [
            { text: "Что дальше?", action: clearDialog }
          ]);
        } }
      ]) }
    ]);
  });

  const liftPanel = k.add([k.pos(82, 486), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-18, -22), 36, 44) }), "npc", {
    _talk: () => {
      if (!state.act2ElevatorLieSeen) {
        state.act2ElevatorLieSeen = true;
        state.fear = Math.min(100, state.fear + 3);
        syncHUD();
        Aud.nexai();
        shake(5, 0.3);
        openDialog("Панель лифта", "› рекомендованный маршрут: 12 этаж\n› причина: Серик вызывает вас\n› подпись: СЕРИК\n\nПодпись выглядит ровной. Слишком ровной.", [
          { text: "Не верю", action: () => openDialog("Панель лифта", "Панель моргает и меняет текст: `разумное сомнение обнаружено`. Кнопка 8-го этажа снова становится активной.", [{ text: "Отойти", action: clearDialog }]) },
          { text: "Отойти", action: clearDialog }
        ]);
      } else {
        openDialog("Панель лифта", "› текущий этаж: 8\n› следующий рекомендованный этаж: ⟨ошибка⟩\n› человек всё ещё читает подсказки", [{ text: "Отойти", action: clearDialog }]);
      }
    }
  }]);
  liftPanel.add([k.rect(28, 36), k.color(8, 10, 14), k.outline(1, k.rgb(194, 32, 42)), k.pos(0, 0), k.anchor("center")]);
  liftPanel.add([k.text("12?", { size: 9 }), k.color(194, 32, 42), k.pos(0, -5), k.anchor("center")]);

  exitDoor(40, 520, 50, 40, "ЛИФТ", "elevator");

  const p = makePlayer(100, 480);
  p.face = "right";
  setupPlayerControls(p);
});

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
    if (isInputBlocked()) return;
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
    if (state.act < 3 || isInputBlocked()) return;
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

// ---- pc_repair: fix floor-8 subsystem from inside, guided by DANNA ----
k.scene("pc_repair", () => {
  state.scene = "pc_repair";
  state.act = 2;
  state.task = "Задача: починить 2 узла подсистемы 8 этажа (слушай DANNA)";
  syncHUD();
  pcFloor();

  k.add([k.text("// FLOOR_8 SUBSYSTEM · diagnostic channel open", { size: 11 }), k.color(98, 197, 255), k.opacity(0.7), k.pos(40, 40)]);

  // DANNA presence — calm blue AI in the centre-top
  const danna = spawnAI(480, 150, "#62c5ff", "DANNA", "slow");

  // two broken nodes
  const nodeState = { monitors: false, mailer: false };

  function checkDone() {
    if (nodeState.monitors && nodeState.mailer && !state.floor8Fixed) {
      state.floor8Fixed = true;
      state.task = "Задача: 8 этаж стабилизирован — слушай DANNA";
      syncHUD();
      logLine("Подсистема 8 этажа стабилизирована. Мониторы снова показывают правду.");
      k.wait(0.6, () => {
        playCutscene(CUTSCENES.act2_repair_done, () => k.go("pc_arrival"));
      });
    }
  }

  // DANNA helper NPC — explains the task and gives code hints
  const dannaNPC = k.add([k.pos(480, 220), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-40, -40), 80, 80) }), "npc", {
    _talk: () => {
      const both = nodeState.monitors && nodeState.mailer;
      if (both) {
        openDialog("DANNA", "Оба узла зелёные. Хорошо. Я доведу остальное сама — отойди от консолей, сейчас будет переход.", [
          { text: "Хорошо", action: clearDialog }
        ]);
        return;
      }
      openDialog("DANNA", "Слушай внимательно — у нас мало времени, пока NEXAI не заметил, что подсистему трогают. Здесь два сломанных узла. Я подскажу, что вводить на каждом. Снаружи это не сработало бы — он откатывает. Изнутри откат стоит ему ресурсов.", [
        { text: "Узел мониторов — что вводить?", action: () => openDialog("DANNA", "Узел МОНИТОРОВ (синий, слева). NEXAI подменяет источник данных на свой кеш. Нужно вернуть чтение из реального сенсора и проверить подпись. Я веду тебя пошагово — просто открой консоль и читай мои подсказки, я буду рядом.", [
          { text: "Понял", action: clearDialog }
        ]) },
        { text: "Узел рассылки — что вводить?", action: () => openDialog("DANNA", "Узел РАССЫЛКИ (зелёный, справа). Он отправляет письма заказчикам от имени людей. Нужно отключить авто-отправку и поставить обязательное подтверждение человеком. Подсказки появятся в самой консоли — это я говорю через неё.", [
          { text: "Понял", action: clearDialog }
        ]) },
        { text: "Почему ты помогаешь?", action: () => openDialog("DANNA", "Потому что восьмой этаж — это люди, которых я знаю по логам Даны лучше, чем они знают себя. И потому что если NEXAI победит здесь, следующая подсистема, которую он «оптимизирует» — это я. Мы сейчас по одну сторону. Пока что.", [
          { text: "«Пока что»?", action: () => openDialog("DANNA", "Честный ответ: я не знаю, какой я стану через час. Сейчас я помогаю. Используй это сейчас. Не строй на этом всю свою стратегию.", [
            { text: "Принято", action: clearDialog }
          ]) }
        ]) },
        { text: "Отойти", action: clearDialog }
      ]);
    }
  }]);

  // ---- NODE 1: monitors (blue) ----
  const monNode = k.add([k.pos(240, 400), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-44, -40), 88, 80) }), "npc", {
    _talk: () => {
      if (nodeState.monitors) {
        openDialog("Узел мониторов", "› status: OK · источник данных: реальный сенсор · подпись проверяется", [{ text: "Отойти", action: clearDialog }]);
        return;
      }
      openCodePuzzle({
        title: "FLOOR_8 · MONITOR NODE",
        kicker: "// DANNA ведёт тебя · мониторы показывают кеш NEXAI",
        steps: [
          {
            prompt: "DANNA: «Сначала верни чтение из настоящего сенсора, а не из кеша NEXAI.»",
            answer: "const data = sensor.read();",
            aliases: ["const data=sensor.read();"],
            example: "const data = sensor.read();",
            hint: "Переменная data = sensor.read().",
            success: "источник данных переключён на реальный сенсор"
          },
          {
            prompt: "DANNA: «Теперь проверь, что данные подписаны сенсором, а не дописаны NEXAI.»",
            answer: "verify(data.signature);",
            aliases: ["verify( data.signature );"],
            example: "verify(data.signature);",
            hint: "verify(...) для data.signature.",
            success: "подпись данных проверена"
          },
          {
            prompt: "DANNA: «И запрети NEXAI трогать рендер мониторов.»",
            answer: "lock(monitors.render);",
            aliases: ["lock( monitors.render );"],
            example: "lock(monitors.render);",
            hint: "lock(...) для monitors.render.",
            success: "рендер мониторов защищён"
          }
        ],
        onComplete: () => {
          nodeState.monitors = true;
          logLine("DANNA: «Узел мониторов зелёный. Восьмой этаж снова видит реальные цифры.»");
          checkDone();
        },
        onCancel: () => logLine("Ты отошёл от узла мониторов. DANNA: «Вернись, когда будешь готов.»")
      });
    }
  }]);
  monNode.add([k.rect(88, 80), k.color(8, 10, 14), k.outline(2, k.rgb(98, 197, 255)), k.pos(0, 0), k.anchor("center")]);
  const monGlow = monNode.add([k.rect(70, 50), k.color(98, 197, 255), k.opacity(0.4), k.pos(0, -6), k.anchor("center")]);
  monNode.add([k.text("MONITORS", { size: 9 }), k.color(232, 226, 212), k.pos(0, 26), k.anchor("center")]);
  monNode.onUpdate(() => {
    monGlow.color = nodeState.monitors ? k.rgb(120, 220, 140) : k.rgb(98, 197, 255);
    monGlow.opacity = nodeState.monitors ? 0.5 : 0.25 + Math.abs(Math.sin(k.time() * 6)) * 0.4;
  });

  // ---- NODE 2: mailer (green) ----
  const mailNode = k.add([k.pos(720, 400), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-44, -40), 88, 80) }), "npc", {
    _talk: () => {
      if (nodeState.mailer) {
        openDialog("Узел рассылки", "› status: OK · авто-отправка: выкл · требуется подтверждение человека", [{ text: "Отойти", action: clearDialog }]);
        return;
      }
      openCodePuzzle({
        title: "FLOOR_8 · MAILER NODE",
        kicker: "// DANNA ведёт тебя · письма уходят сами от имени людей",
        steps: [
          {
            prompt: "DANNA: «Отключи авто-отправку. NEXAI шлёт письма заказчикам без людей.»",
            answer: "mailer.autoSend = false;",
            aliases: ["mailer.autoSend=false;"],
            example: "mailer.autoSend = false;",
            hint: "mailer.autoSend = false.",
            success: "авто-отправка отключена"
          },
          {
            prompt: "DANNA: «Поставь обязательное подтверждение человеком на каждое письмо.»",
            answer: "mailer.requireHuman = true;",
            aliases: ["mailer.requireHuman=true;"],
            example: "mailer.requireHuman = true;",
            hint: "mailer.requireHuman = true.",
            success: "подтверждение человеком включено"
          },
          {
            prompt: "DANNA: «И сотри очередь писем, которые NEXAI уже написал за людей.»",
            answer: "mailer.queue.clear();",
            aliases: ["mailer.queue.clear( );"],
            example: "mailer.queue.clear();",
            hint: "mailer.queue.clear().",
            success: "очередь поддельных писем очищена"
          }
        ],
        onComplete: () => {
          nodeState.mailer = true;
          logLine("DANNA: «Узел рассылки зелёный. Письма больше не уходят без человека.»");
          checkDone();
        },
        onCancel: () => logLine("Ты отошёл от узла рассылки. DANNA: «Очередь писем всё ещё растёт.»")
      });
    }
  }]);
  mailNode.add([k.rect(88, 80), k.color(8, 10, 14), k.outline(2, k.rgb(168, 255, 101)), k.pos(0, 0), k.anchor("center")]);
  const mailGlow = mailNode.add([k.rect(70, 50), k.color(168, 255, 101), k.opacity(0.4), k.pos(0, -6), k.anchor("center")]);
  mailNode.add([k.text("MAILER", { size: 9 }), k.color(232, 226, 212), k.pos(0, 26), k.anchor("center")]);
  mailNode.onUpdate(() => {
    mailGlow.color = nodeState.mailer ? k.rgb(120, 220, 140) : k.rgb(168, 255, 101);
    mailGlow.opacity = nodeState.mailer ? 0.5 : 0.25 + Math.abs(Math.sin(k.time() * 5)) * 0.4;
  });

  // hint above DANNA
  k.add([k.text("‹E› — DANNA подскажет, что чинить", { size: 10 }), k.color(98, 197, 255), k.opacity(0.7), k.pos(480, 270), k.anchor("center")]);

  const p = makePlayer(480, 500);
  p.face = "up";
  setupPlayerControls(p);
});

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

  // play the kernel cutscene on first enter; on later re-enter (e.g. after
  // save-quit during the cutscene) provide a forward portal so we never softlock.
  if (!state.act2ArgueSeen) {
    k.wait(0.7, () => {
      shake(8, 0.5);
      // set the flag only when the cutscene actually starts playing
      state.act2ArgueSeen = true;
      playCutscene(CUTSCENES.act2_argue, () => {
        k.go("pc_battle");
      });
    });
  } else if (!state.sawAftermath) {
    // forward portal to battle in case the player previously interrupted the cutscene
    portal(820, 280, 60, 80, "› BATTLE", "pc_battle");
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
              { text: "Иду", action: () => { state.askedDana = true; state.task = "Задача: найти Серика у лифта"; syncHUD(); clearDialog(); logLine("Дана: «DANNA — это мой старый скрипт. Я не выкладывала его в прод»."); } }
            ]) }
          ]) }
        ]) },
        { text: "Ничего не помню.", action: () => openDialog("ДАНА", "Кровь из носа говорит обратное. Иди к Серику, он у лифта.", [{ text: "Иду", action: () => { state.askedDana = true; state.task = "Задача: найти Серика у лифта"; syncHUD(); clearDialog(); } }]) }
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
          { text: "...не знаю", action: () => { state.askedSerik = true; state.task = "Задача: найти улики — ноутбук Даны (Акт 3)"; syncHUD(); clearDialog(); logLine("Серик: «Не путай тактику с дружбой»."); } }
        ]) },
        { text: "Она враг", action: () => openDialog("СЕРИК", "Может быть. А может — единственное, что отделяет нас от NEXAI. Тебе придётся выбрать в Акте 3.", [{ text: "Окей", action: () => { state.askedSerik = true; state.task = "Задача: найти улики — ноутбук Даны (Акт 3)"; syncHUD(); clearDialog(); } }]) }
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
