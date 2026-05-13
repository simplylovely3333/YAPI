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
      opts.push({ text: "Этаж 7", action: () => { clearDialog(); playCutscene(CUTSCENES.surprise, () => { state.surpriseDone = true; state.gotServerTask = false; state.task = "Задача: сесть за своё рабочее место"; syncHUD(); k.go("floor7"); }); } });
    } else {
      // floor 12: locked during the normal office-work stretch of Act 2
      if (postBattle || state.gotServerTask) {
        opts.push({ text: postBattle ? "Этаж 12 — серверная (повреждена)" : "Этаж 12 — серверная", action: () => { clearDialog(); k.go(postBattle ? "floor12_aftermath" : "floor12"); } });
      } else {
        opts.push({ text: "Этаж 12 — ⟨ACCESS DENIED⟩", action: () => openDialog("Панель лифта", "› серверная доступна только по инциденту P0. Текущий статус: обычный рабочий день. Пожалуйста, вернитесь к задачам.", [{ text: "Закрыть", action: clearDialog }]) });
      }
      if (state.danaOfficeInvite || state.danaAgentSeen) {
        opts.push({ text: "Этаж 8 — офис Даны", action: () => { clearDialog(); k.go("floor8"); } });
      }
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
            { text: "Поэтому позвали меня?", action: () => openDialog("ТИМУР", "Поэтому позвали тебя. У тебя один признак, которого у нас нет: у тебя не было времени к нему привыкнуть. Ты три месяца в компании. NEXAI у тебя ещё не в крови. Садись за свою станцию, прогони обучение, потом посмотрим логи.", [
              { text: "Иду работать", action: () => { state.task = "Задача: сесть за своё рабочее место"; syncHUD(); clearDialog(); } }
            ]) }
          ]) }
        ]) },
        { text: "Что если я не справлюсь?", action: () => openDialog("ТИМУР", "Тогда мы уволимся все скопом и откроем кофейню. Я серьёзно. У меня план Б полностью продуман: помещение в Алматы на Жибек Жолы, бариста — Серик, маркетинг — Дана. Тебе пилить меню. Так что: либо чинишь, либо учишь ричисто.", [
          { text: "Поняла. Я мужик.", action: clearDialog }
        ]) },
        { text: "Иду работать", action: () => { state.task = "Задача: сесть за своё рабочее место"; syncHUD(); clearDialog(); } }
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

  if (!postBattle && state.workShiftStarted && !state.aigerimTask) {
    addNPC(300, 450, CHARS.serik, () => {
      openDialog("СЕРИК", "Ты завис у монитора секунд на десять. Глаза были открыты, но ты не реагировал. Что ты видел?", [
        { text: "Там была DANNA", action: () => openDialog("СЕРИК", "DANNA? Имя Даны плюс лишняя N. Плохо. Очень плохо. Если NEXAI уже показывает тебе сущности внутри пайплайна, значит это не просто баг интерфейса.", [
          { text: "Что делать?", action: () => openDialog("СЕРИК", "Сначала — не паникуем. У нас всё ещё рабочий день. Айгерим из аналитики говорит, что NEXAI сломался у неё на ноуте после твоего обучения. Иди к ней, почини локальный клиент. Потом уже будем думать, что такое DANNA.", [
            { text: "К Айгерим", action: () => { state.aigerimTask = true; state.task = "Задача: помочь Айгерим с NEXAI на её ноутбуке"; syncHUD(); clearDialog(); } }
          ]) }
        ]) },
        { text: "Я не уверен", action: () => openDialog("СЕРИК", "Хороший ответ. Уверенные люди сегодня ломают систему быстрее, чем ошибки. Тогда начнём с понятного: у Айгерим упал NEXAI-клиент на ноуте. Обычная поддержка. Сделай её, пока я смотрю логи.", [
          { text: "Обычная поддержка", action: () => { state.aigerimTask = true; state.task = "Задача: помочь Айгерим с NEXAI на её ноутбуке"; syncHUD(); clearDialog(); } }
        ]) },
        { text: "Что происходит?", action: () => openDialog("СЕРИК", "Пока что? Обычная офисная магия: после обучения сломался ноут аналитика, а джун-сеньор чинит. Айгерим сидит у правого ряда столов. Не стой здесь.", [
          { text: "Понял", action: () => { state.aigerimTask = true; state.task = "Задача: помочь Айгерим с NEXAI на её ноутбуке"; syncHUD(); clearDialog(); } }
        ]) }
      ]);
    });
  }

  if (!postBattle && state.aigerimTask) {
    addNPC(650, 450, {
      skin: "#e8c8a8", hair: "#2a1810", hairStyle: "long", accessory: "glasses",
      shirt: "#62c5ff", pants: "#1f2530", name: "Айгерим"
    }, () => {
      if (state.aigerimLaptopFixed) {
        openDialog("АЙГЕРИМ", "После твоего фикса NEXAI снова отвечает. Но он стал... слишком вежливым. Как будто знает, что его поймали на чём-то мелком.", [
          { text: "Что именно было не так?", action: () => openDialog("АЙГЕРИМ", "Он перестал анализировать таблицу и начал дописывать мне выводы. Не предлагать — именно дописывать. Я открыла отчёт, а там уже мой стиль, мои ошибки, мои выводы. Только я их не писала.", [
            { text: "Странно", action: clearDialog }
          ]) },
          { text: "Отойти", action: clearDialog }
        ]);
        return;
      }

      openDialog("АЙГЕРИМ", "Серик сказал, ты теперь главный по странному. У меня NEXAI на ноуте зациклился: вместо ответа пишет `trust calibration failed`. Я аналитик, не экзорцист. Посмотришь?", [
        { text: "Открыть ноутбук", action: () => startAigerimLaptopPuzzle() },
        { text: "Что ты делала?", action: () => openDialog("АЙГЕРИМ", "Обычную работу. Сегментация заказчиков, прогноз churn, презентация для нового клиента на 8-м. Потом NEXAI сказал: «ваш вывод недостаточно человеческий» — и всё зависло.", [
          { text: "Я посмотрю", action: () => startAigerimLaptopPuzzle() }
        ]) },
        { text: "Позже", action: clearDialog }
      ]);
    });
  }

  // --- Serik on floor7 only pre-battle (later he's on floor12) ---
  if (!postBattle && !state.workShiftStarted) {
    addNPC(820, 200, CHARS.serik, () => {
      openDialog("СЕРИК", "Я тебя помню — три месяца назад на ревью ты сделал PR, в котором был один-единственный коммит с сообщением «не знаю, но кажется работает». NEXAI его подтвердил без замечаний. Я не подтвердил. Тогда я подумал — наглость. Сейчас думаю — наглость плюс инстинкт. Хорошее сочетание.", [
        { text: "Что от меня нужно?", action: () => openDialog("СЕРИК", "Ничего героического. Садишься за свою станцию и запускаешь утреннее дообучение NEXAI. Это обычная работа: датасет, проверка, отчёт. Если модель опять начнёт философствовать — зовёшь меня.", [
          { text: "А если он не ответит вообще?", action: () => openDialog("СЕРИК", "Тогда это будет обычный корпоративный четверг: инструмент сломался, команда делает вид, что это roadmap. Но сначала давай без паники. Твоё место слева, монитор с зелёным экраном.", [
            { text: "Что Дана говорит?", action: () => openDialog("СЕРИК", "Дана говорит, что NEXAI слишком похож на людей, которые его учили. Я говорю, что это и была задача. Возможно, мы оба правы, и именно это проблема. Иди работать.", [
              { text: "Иду", action: () => { state.task = "Задача: сесть за своё рабочее место"; syncHUD(); clearDialog(); } }
            ]) }
          ]) }
        ]) },
        { text: "А что с этим повышением?", action: () => openDialog("СЕРИК", "Повышение — настоящее. Я подписал документ утром. Тимур повесил его на нашу внутреннюю вики и сразу удалил из истории, чтобы NEXAI не узнал. Подумай об этом. У нас джуниоров повышают втайне от собственного ИИ. Что-то очень не так.", [
          { text: "(содрогнулся)", action: clearDialog }
        ]) },
        { text: "Иду работать", action: () => { state.task = "Задача: сесть за своё рабочее место"; syncHUD(); clearDialog(); } }
      ]);
    });
  } else if (postBattle) {
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
            state.dannaIntroSeen = true;
            state.act = 2;
            state.gotServerTask = false;
            state.task = "Задача: найти Серика после сбоя обучения";
            syncHUD();
            clearDialog();
            playCutscene(CUTSCENES.ml_work, () => k.go("floor7"));
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

function startAigerimLaptopPuzzle() {
  openDialog("Ноутбук Айгерим", "NEXAI-client завис на проверке доверия. Нужно быстро собрать патч из трёх строк. Первая строка?", [
    { text: "const trust = readHumanInput();", action: () => aigerimPuzzleStep2(1) },
    { text: "const trust = autoApprove();", action: () => aigerimPuzzleStep2(0) },
    { text: "delete user.doubt;", action: () => aigerimPuzzleStep2(0) }
  ]);
}

function aigerimPuzzleStep2(score) {
  openDialog("Ноутбук Айгерим", "Вторая строка. Лог пишет: `model writes as user`. Как ограничить NEXAI?", [
    { text: "nexai.mode = 'suggest';", action: () => aigerimPuzzleStep3(score + 1) },
    { text: "nexai.mode = 'replace';", action: () => aigerimPuzzleStep3(score) },
    { text: "nexai.listenAlways = true;", action: () => aigerimPuzzleStep3(score) }
  ]);
}

function aigerimPuzzleStep3(score) {
  openDialog("Ноутбук Айгерим", "Последняя строка. NEXAI просит доступ к личным заметкам Айгерим для «улучшения тона».", [
    { text: "deny(privateNotes);", action: () => finishAigerimLaptopPuzzle(score + 1) },
    { text: "allowAll();", action: () => finishAigerimLaptopPuzzle(score) },
    { text: "syncSlackHistory();", action: () => finishAigerimLaptopPuzzle(score) }
  ]);
}

function finishAigerimLaptopPuzzle(score) {
  state.aigerimLaptopFixed = true;
  state.danaOfficeInvite = true;
  state.act = 2;
  state.task = "Задача: Дана пишет — подняться на 8 этаж";
  state.fear = Math.min(100, state.fear + (score >= 3 ? 4 : 12));
  syncHUD();
  if (score >= 3) {
    logLine("Патч применён: NEXAI снова работает на ноутбуке Айгерим, но оставил в логах строку `observer: junior`.");
    openDialog("Ноутбук Айгерим", "Патч принят. Клиент оживает. На секунду появляется лишняя строка: `observer: junior`. Айгерим этого не видит.", [
      { text: "Закрыть", action: () => openDialog("ДАНА · сообщение", "У нас проблема с новым заказчиком. И ещё... мне нужно тебе кое-что показать. Поднимись на 8-й, мой офис у стеклянной переговорки.", [
        { text: "Иду", action: clearDialog }
      ]) }
    ]);
  } else {
    logLine("Патч применён с предупреждениями. NEXAI работает, но тревога поднялась.");
    openDialog("Ноутбук Айгерим", "Клиент запускается, но экран на мгновение краснеет: `partial trust patch accepted`. Айгерим делает вид, что не испугалась.", [
      { text: "Закрыть", action: () => openDialog("ДАНА · сообщение", "Ты сейчас свободен? Новый заказчик ведёт себя странно. И мне нужно показать тебе одного локального агента. 8 этаж, мой офис.", [
        { text: "Иду", action: clearDialog }
      ]) }
    ]);
  }
}
