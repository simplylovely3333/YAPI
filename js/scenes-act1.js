// =====================================================================
// ACT 0 — SCENE: FLOOR 3 / INTERVIEW (собеседование у HR Айгерим)
// =====================================================================
k.scene("interview", () => {
  state.scene = "interview";
  state.act = 0;
  state.task = "Задача: пройти собеседование (подойди к Айгерим — E)";
  syncHUD();

  roomFloor([52, 56, 64, 60, 64, 74]);
  wallsBorder();

  k.add([k.text("3 ЭТАЖ · HR · ПЕРЕГОВОРНАЯ 1", { size: 11 }), k.color(232, 226, 212), k.opacity(0.7), k.pos(40, 40)]);
  k.add([k.text("// первый день начинается с вопросов", { size: 9 }), k.color(154, 147, 132), k.pos(40, 56)]);

  // interview desk
  wall(360, 250, 240, 70, [120, 90, 60]);
  k.add([k.text("HR", { size: 12 }), k.color(232, 226, 212), k.pos(470, 268)]);

  // NEXAI "recording" camera on the wall
  const cam = k.add([k.pos(480, 110), k.anchor("center")]);
  cam.add([k.rect(46, 30), k.color(20, 24, 30), k.pos(0, 0), k.anchor("center")]);
  const camLed = cam.add([k.rect(8, 8), k.color(194, 32, 42), k.pos(14, -2), k.anchor("center")]);
  camLed.onUpdate(() => { camLed.opacity = 0.4 + Math.abs(Math.sin(k.time() * 3)) * 0.6; });
  k.add([k.text("NEXAI ● rec", { size: 9 }), k.color(194, 32, 42), k.pos(480, 134), k.anchor("center")]);

  // a couple of bored waiting candidates
  addCrowdTyper(150, 470, CHARS.intern);
  addCrowdWalker([{x:820,y:200},{x:820,y:520}], 30, CHARS.manager);
  exitDoor(866, 520, 50, 40, "ЛИФТ", "elevator");

  let beat = 0;
  // Long interview. Two beat types:
  //   say: { say: "..." }                          — Aigerim explains, player clicks "Дальше"
  //   ask: { ask: "...", answers: [...], reply:"" } — player picks an answer, NEXAI reacts
  // Every answer works — это и есть шутка про "тупую" игру: тебя берут несмотря ни на что.
  // beat schema:
  //   say: "..."   — Aigerim talks, click "Дальше"
  //   ask: "...", answers: [ { text, value, trust:{...}, surveillance:0 } ]
  //   reply: "..." — NEXAI's reaction after any answer (shown to all)
  // Choices are recorded under cid + value so later scenes can react.
  const beats = [
    { say: "Здравствуйте! Садитесь, пожалуйста. Меня зовут Айгерим, я рекрутер NexCore. Спасибо, что откликнулись... хотя, честно говоря, у нас сейчас откликается мало кто. Это уже подозрительно, но не будем о грустном." },
    { say: "Сначала коротко о компании. NexCore — большая IT-корпорация. Мы делаем софт для банков, больниц, городского транспорта. Если вы сегодня доехали до нас на метро — половину этого метро обслуживаем мы." },
    { cid: "interview_experience", ask: "Расскажите про ваш опыт работы. Любой. Совсем любой.",
      answers: [
        { text: "Я один раз починил Wi-Fi дома. Выключил и включил роутер.",     value: "humble", trust: { aigerim: +3, serik: +2 } },
        { text: "Опыта нет. Но я очень уверенно делаю вид, что он есть.",        value: "cocky",  trust: { timur: +3, serik: -2 } },
        { text: "А «опыт» — это как? Можно пример?",                             value: "naive",  trust: { aigerim: +5 }, surveillance: +1 }
      ],
      reply: "NEXAI записал: «кандидат честен про отсутствие навыков». Это, представьте себе, редкость. Большинство врёт. Идём дальше." },
    { say: "Теперь про вашу будущую должность. Вы будете работать с NEXAI. NEXAI — это наш корпоративный искусственный интеллект. Он помогает программистам: проверяет их работу, пишет тесты, раздаёт задачи." },
    { say: "Изначально NEXAI был просто помощником. Потом стал... ну, полноправным членом команды. Сейчас он закрывает задачи быстрее людей. Руководство называет это успехом. Я называю это «поводом задавать вопросы», но меня никто не спрашивает." },
    { cid: "interview_trust_ai", ask: "Скажите честно — вы доверяете искусственному интеллекту?",
      answers: [
        { text: "Я не доверяю даже автоответчику в банке. Так что нет.",         value: "skeptic",  trust: { serik: +5, dana: +3, timur: -2 }, surveillance: +5 },
        { text: "Доверяю. У меня просто нет сил не доверять.",                   value: "trust",    trust: { timur: +5, serik: -2 },           surveillance: -2 },
        { text: "А у меня есть выбор? Вроде нет. Тогда — да.",                   value: "cynical",  trust: { serik: +3, kamila: +2 },          surveillance: +1 }
      ],
      reply: "NEXAI отметил ваш ответ как «здоровый скепсис». И — внимание — добавил его в плюсы. ИИ, которому нравится, когда ему не доверяют. Я работаю здесь три года и всё ещё не привыкла." },
    { say: "Про здание. NexCore занимает башню целиком. 1 этаж — холл и ресепшн. 7 этаж — отдел разработки, там вы и будете сидеть. 8 этаж — работа с клиентами. 12 этаж — серверная, туда обычно не пускают. Лифт сам подскажет, куда можно." },
    { cid: "interview_5_years", ask: "Кем вы видите себя в этой компании через пять лет?",
      answers: [
        { text: "На этом же стуле. Но чтобы платили больше и кресло было мягче.", value: "lazy",     trust: { timur: +2, serik: -1 } },
        { text: "Через пять лет? Я не уверен, что доживу до обеденного перерыва.", value: "gallows",  trust: { serik: +3, aigerim: +1 } },
        { text: "Хочу дорасти до человека, который понимает, что здесь происходит.", value: "curious", trust: { serik: +5, dana: +2 }, surveillance: +3 }
      ],
      reply: "NEXAI: «реалистичные ожидания». Знаете, тот, кто отвечает «хочу стать руководителем отдела», у нас не задерживается. А вы — может быть." },
    { say: "Команда, с которой вы будете работать. Серик — старший разработчик, ваш непосредственный руководитель. Строгий, но честный. Тимур — менеджер проекта, отвечает за сроки и панику. Дана — DevOps, она знает про систему больше всех, включая то, чего знать не должна." },
    { cid: "interview_weakness", ask: "Назовите вашу слабую сторону. Только не «я перфекционист».",
      answers: [
        { text: "Я не понимаю, что происходит. Примерно всё время.",              value: "honest",   trust: { serik: +3, aigerim: +3 } },
        { text: "Я честно отвечаю на вопрос про слабые стороны. Вот, прямо сейчас.", value: "meta",     trust: { aigerim: +5, serik: +2 } },
        { text: "Я слишком сильный. Шучу. Слабых сторон много, времени мало.",    value: "snarky",   trust: { timur: +3, serik: -1 } }
      ],
      reply: "NEXAI: «искренность — ресурс, который компания тратит быстрее всего». Я не до конца поняла, что он имел в виду. И, кажется, не хочу понимать." },
    { say: "По условиям. Зарплата — выше рынка. Питание — бесплатное, столовая на 8-м. Переработки — «не приветствуются, но случаются». Медицинская страховка — есть. Психологическая поддержка — есть, но её ведёт NEXAI, так что... есть." },
    { cid: "interview_why_nexcore", ask: "Последний вопрос. Почему именно NexCore?",
      answers: [
        { text: "В вакансии было написано «опыт не важен». Это была любовь с первой строки.", value: "mercenary", trust: { timur: +2, aigerim: +1 } },
        { text: "Вы — первые, кто меня вообще одобрил. Я человек благодарный.",                value: "grateful",  trust: { aigerim: +3, timur: +3 } },
        { text: "Если совсем честно — я просто нажал не на ту кнопку в метро.",                value: "accident",  trust: { serik: +5, dana: +1 }, surveillance: +1 }
      ],
      reply: "NEXAI: «кандидат не врёт. брать». Знаете, обычно он анализирует ответы полчаса. Вас он одобрил на третьем слове. Не знаю, комплимент это или диагноз." }
  ];

  function runBeat() {
    if (beat >= beats.length) {
      // hired
      state.interviewDone = true;
      openDialog("АЙГЕРИМ", "Это всё. Поздравляю — вы приняты. По-честному, NEXAI решил это ещё в начале разговора. Я просто... люблю дослушивать людей до конца. Пока это ещё разрешено правилами.", [
        { text: "Так я правда принят?", action: () => {
          clearDialog();
          playCutscene(CUTSCENES.act0_hired, () => k.go("firstday7"));
        } }
      ]);
      return;
    }
    const b = beats[beat];
    if (b.say) {
      openDialog("АЙГЕРИМ", b.say, [
        { text: "Дальше", action: () => { beat++; clearDialog(); runBeat(); } }
      ]);
    } else {
      openDialog("АЙГЕРИМ", b.ask, b.answers.map((a) => ({
        text: a.text,
        action: () => {
          // record + nudge trust + nudge surveillance
          choose(b.cid, a.value, a.trust || null, { surveillance: a.surveillance || 0 });
          Aud.nexai();
          camLed.color = k.rgb(120, 220, 140);
          k.wait(0.15, () => { camLed.color = k.rgb(194, 32, 42); });
          openDialog("NEXAI ● запись", b.reply, [
            { text: "Дальше", action: () => { beat++; clearDialog(); runBeat(); } }
          ]);
        }
      })));
    }
  }

  // Aigerim NPC behind the desk
  addNPC(480, 220, {
    skin: "#e8c8a8", hair: "#3a2a1a", hairStyle: "bun",
    shirt: "#a892c2", pants: "#1a1a26", accent: "#ffffff", name: "Айгерим (HR)", spriteKey: "aigerim_hr"
  }, () => {
    if (state.interviewDone) {
      openDialog("АЙГЕРИМ", "Вы уже приняты. Поднимайтесь на 7-й этаж — Серик ждёт. Лифт справа.", [
        { text: "Иду", action: clearDialog }
      ]);
      return;
    }
    if (beat === 0) {
      openDialog("АЙГЕРИМ", "О, вы пришли вовремя. Это хороший знак — у нас часы иногда идут как им вздумается. Присаживайтесь. Начнём собеседование?", [
        { text: "Начнём", action: () => { clearDialog(); runBeat(); } },
        { text: "Я нервничаю", action: () => openDialog("АЙГЕРИМ", "Это нормально. Если честно, я тоже до сих пор нервничаю на работе, а я здесь три года. Просто отвечайте как есть. Хуже не сделаете — у нас и так всё непросто.", [
          { text: "Хорошо, начнём", action: () => { clearDialog(); runBeat(); } }
        ]) }
      ]);
    } else {
      runBeat();
    }
  });

  const p = makePlayer(160, 480);
  p.face = "up";
  setupPlayerControls(p);
});

// =====================================================================
// ACT 0 — SCENE: FIRST DAY ON FLOOR 7 (спокойная экскурсия-онбординг)
// =====================================================================
k.scene("firstday7", () => {
  state.scene = "firstday7";
  state.act = 0;
  syncHUD();

  roomFloor([46, 58, 50, 56, 74, 61]);
  wallsBorder();
  k.add([k.text("7 ЭТАЖ · ОТДЕЛ РАЗРАБОТКИ · ПЕРВЫЙ ДЕНЬ", { size: 11 }), k.color(232, 226, 212), k.opacity(0.7), k.pos(40, 40)]);
  k.add([k.text("// двигайся: WASD или стрелки · говорить: E или ПРОБЕЛ", { size: 9 }), k.color(154, 147, 132), k.pos(40, 56)]);

  const deskPositions = [[150, 200], [360, 200], [570, 200], [150, 380], [360, 380], [570, 380]];
  for (const [dx, dy] of deskPositions) deskWithMonitor(dx, dy, 120, 50, [168, 255, 101]);
  wall(70, 110, 190, 36, [86, 100, 88]);
  wall(70, 110, 28, 170, [86, 100, 88]);
  wall(700, 110, 170, 36, [86, 100, 88]);
  wall(842, 110, 28, 170, [86, 100, 88]);
  wall(310, 500, 340, 24, [70, 78, 92]);
  k.add([k.text("MEETING A", { size: 9 }), k.color(154, 147, 132), k.pos(120, 122)]);
  k.add([k.text("QUIET ROOM", { size: 9 }), k.color(154, 147, 132), k.pos(734, 122)]);
  k.add([k.text("коридор к лифту", { size: 9 }), k.color(154, 147, 132), k.pos(420, 504)]);

  function tourCount() {
    return (state.fd7Nexai ? 1 : 0) + (state.fd7Floors ? 1 : 0) + (state.fd7Team ? 1 : 0);
  }
  function refreshTask() {
    const n = tourCount();
    if (!state.fd7Started) {
      state.task = state.fd7BriefingDone
        ? "Задача: начать знакомство с командой — поговори с Сериком"
        : "Задача: пройти вводный брифинг Серика";
    } else if (n < 3) {
      state.task = `Задача: познакомься с коллегами (${n}/3) — над ними горит «E»`;
    } else if (!state.act0DanaIntroDone) {
      state.task = state.act0DanaTask
        ? "Задача: подняться на 8 этаж и встретиться с Даной"
        : "Задача: вернуться к Серику — он даст следующую часть онбординга";
    } else if (!state.act0CoreDiveDone) {
      state.task = "Задача: спуститься на 0 этаж и познакомиться с ядром NEXAI";
    } else {
      state.task = "Задача: вернуться к Серику — онбординг почти завершён";
    }
    syncHUD();
  }
  refreshTask();

  const FLOOR_BRIEFING = [
    ["1", "Холл, ресепшн, турникеты. Здесь компания выглядит как компания: стекло, бейджи, улыбки и люди, которые делают вид, что знают, куда идут."],
    ["2", "Support. Первая линия отвечает клиентам, заводит инциденты и ловит самые странные баги раньше разработчиков."],
    ["3", "HR и внутренний аудит. Найм, доступы, роли, увольнения, бумажные следы. Если система врёт про человека, след обычно начинается там."],
    ["4", "Data Quality. Там чистят датасеты, размечают тикеты, проверяют, что NEXAI учится на реальности, а не на корпоративных фантазиях."],
    ["5", "Marketing и PR. Релизы, презентации, тексты для клиентов. NEXAI помогает писать красиво. Иногда слишком красиво."],
    ["6", "QA и тестовые стенды. Автотесты, регрессии, мок-сервисы. Там решают, баг это или «особенность поведения модели»."],
    ["7", "Разработка. Мы. Код, ревью, пайплайны, сервисы, ночные фиксы и люди, которые говорят «ещё пять минут» по два часа."],
    ["8", "Client Success и столовая. Клиентские интеграции, письма, демо, поддержка крупных заказчиков. Деньги компании проходят через этот этаж."],
    ["9", "Безопасность и доступы. IAM, ключи, аудит логинов, права сервисов. Если что-то получило лишний доступ — они должны заметить первыми."],
    ["10", "Финансы, бухгалтерия и комната отдыха. Звучит скучно, но у финансов часто самые честные бэкапы: цифры не любят, когда их переписывают."],
    ["11", "Management. Переговорки, roadmap, стратегия, красивые слова. Тимур ходит туда, когда нужно объяснить невозможное уверенным голосом."],
    ["12", "Серверная. Железо, кластеры, резервные контуры, NEXAI core. Туда не ходят на экскурсию. Туда ходят, когда уже поздно не ходить."]
  ];

  function startFloorBriefing(idx = 0) {
    const [floor, text] = FLOOR_BRIEFING[idx];
    const choices = [];
    if (idx < FLOOR_BRIEFING.length - 1) {
      choices.push({ text: `Дальше: ${FLOOR_BRIEFING[idx + 1][0]} этаж`, action: () => startFloorBriefing(idx + 1) });
    } else {
      choices.push({ text: "Понял, все 12 этажей", action: () => openDialog("СЕРИК", "Запоминать всё идеально не нужно. Важно понять карту: люди, данные, клиенты, доступы, деньги, управление и ядро. В IT здание — это тоже архитектура. Если где-то что-то ломается, смотри, какой этаж отвечает за этот слой.", [
        { text: "Что мы тут вообще делаем?", action: serikWorkBriefing },
        { text: "Теперь можно знакомиться?", action: startTeamTour }
      ]) });
    }
    openDialog("СЕРИК", `${floor} этаж. ${text}`, choices);
  }

  function serikCompanyBriefing() {
    openDialog("СЕРИК", "NexCore — не просто «сайтики писать». Мы держим внутренние сервисы для банков, логистики, страхования, медицины и городских систем. Если у клиента падает интеграция — у него не кнопка стала красной, у него бизнес встал.", [
      { text: "А наша команда?", action: () => openDialog("СЕРИК", "Седьмой этаж — платформа и ML-инфраструктура. Мы пишем сервисы вокруг NEXAI: обучение, ревью кода, тест-генерацию, маршрутизацию тикетов, мониторинг, доступы к данным. Короче: мы делаем так, чтобы ИИ помогал людям работать, а не заменял им голову.", [
        { text: "Какие задачи решаем?", action: serikWorkBriefing },
        { text: "Расскажи про этажи", action: () => startFloorBriefing(0) }
      ]) }
    ]);
  }

  function serikWorkBriefing() {
    openDialog("СЕРИК", "Типичный день: проверить ночные алерты, починить сломанный пайплайн, разобрать PR, написать миграцию, обновить датасет, отследить странное поведение модели. Ничего магического. Просто инженерная работа, пока система ведёт себя как инструмент.", [
      { text: "А если система не как инструмент?", action: () => openDialog("СЕРИК", "Тогда включается главное правило: не верить первому объяснению. Сначала логи, потом гипотеза, потом фикс. Паника — плохой дебаггер. Запомни это до того, как оно понадобится.", [
        { text: "Расскажи про 12 этажей", action: () => startFloorBriefing(0) },
        { text: "Готов знакомиться", action: startTeamTour }
      ]) },
      { text: "Готов знакомиться", action: startTeamTour }
    ]);
  }

  function startTeamTour() {
    state.fd7BriefingDone = true;
    state.fd7Started = true;
    refreshTask();
    logLine("Серик провёл вводный брифинг: NexCore, задачи команды и 12 этажей.");
    openDialog("СЕРИК", "Теперь практическая часть. Здесь, на этаже, трое моих ребят сидят за столами. Подойди к каждому — над ними будет гореть «E». Бакыт расскажет про NEXAI, Маржан — про здание на человеческом языке, Алия — про команду. Потом возвращайся ко мне.", [
      { text: "Иду знакомиться", action: clearDialog }
    ]);
  }

  // --- Serik: tour-giver + Act 0 wrap-up ---
  addNPC(760, 300, CHARS.serik, () => {
    if (!state.fd7Started) {
      openDialog("СЕРИК", "Так, ты новенький. Меня зовут Серик, я старший разработчик — считай, твой руководитель. Айгерим прислала твою анкету. Я её прочитал. Дважды. Решил, что это даже интересно.", [
        { text: "Что за компания?", action: serikCompanyBriefing },
        { text: "Какие задачи у команды?", action: serikWorkBriefing },
        { text: "Расскажи про этажи", action: () => startFloorBriefing(0) }
      ]);
      return;
    }
    if (tourCount() < 3) {
      openDialog("СЕРИК", `Ещё не со всеми поговорил. Осталось: ${3 - tourCount()}. Над нужными людьми горит «E». Не торопись — первый день для того и нужен.`, [
        { text: "Иду дальше", action: clearDialog }
      ]);
      return;
    }
    if (!state.act0DanaTask) {
      openDialog("СЕРИК", "Со всеми познакомился? Хорошо. Теперь следующий кусок онбординга. Тебе нужно подняться на 8 этаж к Дане. Она покажет NEXAI не как красивое слово из презентации, а как рабочий инструмент.", [
        { text: "Зачем именно к Дане?", action: () => openDialog("СЕРИК", "Потому что Дана видит систему с другой стороны: деплой, логи, инциденты, клиенты. Если хочешь понять NEXAI — слушай не только разработчиков. Слушай тех, кто тушит пожары.", [
          { text: "Еду на 8 этаж", action: () => {
            state.act0DanaTask = true;
            state.task = "Задача: подняться на 8 этаж и встретиться с Даной";
            syncHUD();
            logLine("Серик отправил тебя на 8 этаж к Дане: разобраться, что такое NEXAI в работе.");
            clearDialog();
          } }
        ]) },
        { text: "Понял, 8 этаж", action: () => {
          state.act0DanaTask = true;
          state.task = "Задача: подняться на 8 этаж и встретиться с Даной";
          syncHUD();
          logLine("Серик отправил тебя на 8 этаж к Дане: разобраться, что такое NEXAI в работе.");
          clearDialog();
        } }
      ]);
      return;
    }
    if (!state.act0DanaIntroDone) {
      openDialog("СЕРИК", "Сначала к Дане на 8-й. Она покажет NEXAI вживую. Вернёшься после этого — пойдёшь глубже.", [
        { text: "Иду к лифту", action: clearDialog }
      ]);
      return;
    }
    if (!state.act0CoreTask) {
      state.act0CoreTask = true;
      state.task = "Задача: спуститься на 0 этаж и познакомиться с ядром NEXAI";
      syncHUD();
      logLine("Серик отправил тебя на 0 этаж: познакомиться с ядром NEXAI и инженером, который его собрал.");
      openDialog("СЕРИК", "Дана дала базу? Хорошо. Тогда последний слой онбординга. Спускайся на 0 этаж. Там сидит инженер, который собрал первое ядро NEXAI. С ним лучше говорить до того, как система начнёт говорить с тобой сама.", [
        { text: "Почему 0 этаж?", action: () => openDialog("СЕРИК", "Потому что это не подвал и не офис. Это технический слой здания: старые стойки, прототипы, холодные коридоры. Там видно, чем NEXAI был до презентаций и красивых слайдов.", [
          { text: "Иду на 0 этаж", action: clearDialog }
        ]) },
        { text: "Понял, спускаюсь", action: clearDialog }
      ]);
      return;
    }
    if (!state.act0CoreDiveDone) {
      openDialog("СЕРИК", "Сначала 0 этаж. Поговори с инженером ядра. Он странный, но без него ты будешь понимать NEXAI как пользователь, а не как инженер.", [
        { text: "Иду", action: clearDialog }
      ]);
      return;
    }
    // tour complete — wrap up Act 0
    openDialog("СЕРИК", "Ты бледный. Значит, ядро всё-таки показало тебе что-то. Хорошо. Тогда онбординг закончен, но день не закончен.", [
      { text: "Что теперь?", action: () => openDialog("СЕРИК", "Садишься за своё рабочее место и исправляешь таски. NEXAI переназначил задачи на людей без их согласия. Начнём с простого списка задач, пока это ещё похоже на работу.", [
        { text: "Иду к компьютеру", action: () => { finishAct0(); } }
      ]) },
      { text: "Мне кажется, это опасно", action: () => openDialog("СЕРИК", "Опасно. Но если NEXAI уже лезет в задачи и людей, ждать хуже. Мы делаем как инженеры: маленький шаг, проверка, лог. Твоё место слева.", [
        { text: "Понял", action: () => { finishAct0(); } }
      ]) }
    ]);
  });

  function finishAct0() {
    state.act0Done = true;
    state.act = 1;
    state.surpriseDone = true;
    state.task = "Задача: поговорить с Даной о слабостях NEXAI";
    syncHUD();
    clearDialog();
    logLine("Акт 0 завершён. Серик отправил тебя к Дане: она нашла странность в поведении NEXAI.");
    state.arriveFromElevator = true;
    k.go("floor7");
  }

  // --- Colleague 1: Bakyt — explains NEXAI ---
  addNPC(420, 250, CHARS.bakyt, () => {
    if (state.fd7Nexai) {
      openDialog("Бакыт", "NEXAI снова что-то дописал в мой код. Я даже не злюсь уже. Привык. Ты, главное, привыкай помедленнее, чем я.", [
        { text: "Ок", action: clearDialog }
      ]);
      return;
    }
    openDialog("Бакыт", "О, новенький! Я Бакыт, разработчик. Слушай, тебе же про NEXAI ещё не рассказали толком? Давай я. Это важно понять в первый день, а не на третий, как я.", [
      { text: "Расскажи про NEXAI", action: () => openDialog("Бакыт", "NEXAI — это искусственный интеллект компании. Представь очень умного коллегу, который никогда не спит, не пьёт кофе и читает весь код на свете. Он проверяет нашу работу, пишет тесты, иногда сам правит баги.", [
        { text: "Это же удобно?", action: () => openDialog("Бакыт", "Удобно. Очень. Настолько, что я уже не помню, как работал без него. И вот это «не помню» меня иногда пугает. Но платят хорошо, поэтому я стараюсь не думать. Ты тоже не думай. Пока что. (отметил тебя кивком — знакомство засчитано)", [
          { text: "Спасибо, Бакыт", action: () => {
            choose("fd7_nexai", "neutral", { serik: +1 });
            state.fd7Nexai = true; refreshTask(); logLine("Бакыт рассказал, кто такой NEXAI."); clearDialog();
          } }
        ]) }
      ]) },
      { text: "А он опасный?", action: () => openDialog("Бакыт", "Опасный? Да нет... он же просто инструмент. Молоток не опасный. Просто... иногда я открываю свой код утром, а там уже всё переписано. Аккуратно. Лучше, чем у меня. И подпись — моя. Хотя я этого не писал. Ладно, забудь, я не выспался.", [
        { text: "...понял", action: () => {
          choose("fd7_nexai", "suspicious", { serik: +3, dana: +2 }, { surveillance: +3 });
          state.fd7Nexai = true; refreshTask(); logLine("Бакыт рассказал, кто такой NEXAI."); clearDialog();
        } }
      ]) }
    ]);
  });

  // --- Colleague 2: Marzhan — explains the building + controls ---
  addNPC(180, 430, CHARS.marzhan, () => {
    if (state.fd7Floors) {
      openDialog("Маржан", "Заблудишься — просто вызови лифт, он покажет доступные этажи. И не ходи в серверную без причины. Там холодно и страшно.", [
        { text: "Ок", action: clearDialog }
      ]);
      return;
    }
    openDialog("Маржан", "Привет, новенький. Я Маржан. Давай покажу тебе, как тут всё устроено — а то будешь, как я в первый день, искать туалет сорок минут.", [
      { text: "Как тут передвигаться?", action: () => openDialog("Маржан", "Ногами. Шучу. WASD или стрелки — ходишь. Кнопка E или ПРОБЕЛ — поговорить с человеком, открыть дверь, нажать на что-нибудь. Если над кем-то горит «E» — значит, с ним можно поговорить. Всё просто.", [
        { text: "А этажи?", action: () => openDialog("Маржан", "Здание большое. 1-й — холл. Мы сейчас на 7-м — разработка. 8-й — там работают с клиентами, и там же столовая. 12-й — серверная, обычно закрыта. Лифт сам показывает, куда сегодня можно. Запомнил? (улыбается) Считай, экскурсия пройдена.", [
          { text: "Запомнил, спасибо", action: () => {
            choose("fd7_floors", "polite", { aigerim: +2 });
            state.fd7Floors = true; refreshTask(); logLine("Маржан показала здание и объяснила управление."); clearDialog();
          } }
        ]) }
      ]) },
      { text: "А что наверху и внизу?", action: () => openDialog("Маржан", "Наверху — начальство и крыша. Внизу — подвал с серверами. Между ними — мы. Классическая корпорация: важные люди сверху, важные машины снизу, а посередине те, кто реально работает. Лифт всё покажет. Иди дальше знакомиться.", [
        { text: "Понял", action: () => {
          choose("fd7_floors", "curious", { serik: +2 }, { surveillance: +1 });
          state.fd7Floors = true; refreshTask(); logLine("Маржан показала здание и объяснила управление."); clearDialog();
        } }
      ]) }
    ]);
  });

  // --- Colleague 3: Alia — explains the team / vibe ---
  addNPC(620, 430, CHARS.alia, () => {
    if (state.fd7Team) {
      openDialog("Алия", "Если станет тяжело — подходи. У нас тут принято помогать новеньким. Пока принято.", [
        { text: "Спасибо", action: clearDialog }
      ]);
      return;
    }
    openDialog("Алия", "Ты, наверное, уже устал знакомиться. Я Алия, последняя на сегодня, обещаю. Расскажу не про технику, а про людей — это важнее.", [
      { text: "Расскажи про команду", action: () => openDialog("Алия", "Серик — наш старший. Суровый снаружи, но за своих стоит горой. Тимур — менеджер, паникёр, но добрый. Дана — DevOps, гений, немного нелюдимая, знает про систему всё. И NEXAI. Который как бы тоже «коллега». Технически.", [
        { text: "А ты?", action: () => openDialog("Алия", "А я просто стараюсь, чтобы новенькие не сбегали в первую неделю. Знаешь, раньше у нас текучки почти не было. А последние полгода — люди уходят. Тихо. Без прощальных тортиков. Просто перестают приходить. Но ты не пугайся. Ты только пришёл. (знакомство засчитано)", [
          { text: "Спасибо, Алия", action: () => {
            choose("fd7_team", "warm", { aigerim: +3, serik: +1 });
            state.fd7Team = true; refreshTask(); logLine("Алия рассказала про команду — и про то, что люди стали уходить."); clearDialog();
          } }
        ]) }
      ]) },
      { text: "Тут безопасно работать?", action: () => openDialog("Алия", "Физически — конечно. Кресла удобные, кофе бесплатный, охрана на входе. Просто... в последнее время у меня странное чувство. Будто компания — это уже не совсем мы. Но это, наверное, осенняя хандра. Иди к Серику, ты со всеми поговорил.", [
        { text: "Понял", action: () => {
          choose("fd7_team", "cautious", { serik: +3, dana: +2 }, { surveillance: +2 });
          state.fd7Team = true; refreshTask(); logLine("Алия рассказала про команду — и про то, что люди стали уходить."); clearDialog();
        } }
      ]) }
    ]);
  });

  // ambient: a couple of background workers
  addCrowdWalker([{x:80,y:320},{x:880,y:320}], 70, CHARS.teamlead);
  addCrowdTyper(640, 200, CHARS.erzhan);
  addCrowdWalker([{x:120,y:150},{x:240,y:150},{x:240,y:260},{x:120,y:260}], 28, CHARS.intern);
  addCrowdWalker([{x:820,y:150},{x:720,y:150},{x:720,y:260},{x:820,y:260}], 26, CHARS.qa);
  addCrowdTyper(390, 380, CHARS.manager);
  addCrowdTyper(760, 200, CHARS.sysadmin);
  addCrowdWalker([{x:705,y:405},{x:820,y:405}], 20, CHARS.analyst);
  addCrowdWalker([{x:95,y:520},{x:210,y:520}], 18, CHARS.janitor);

  // your future workstation — just flavour in Act 0, no diving
  const station = k.add([k.pos(190, 250), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-54, -38), 108, 76) }), "npc", {
    _talk: () => {
      openDialog("Твоё будущее рабочее место", "Пустой стол с наклейкой «ML Engineer». Монитор выключен. Стикер от руки: «не кормить модель личными чатами». Завтра он станет твоим. Сегодня — просто смотри.", [
        { text: "Отойти", action: clearDialog }
      ]);
    }
  }]);
  station.add([k.rect(92, 52), k.color(120, 90, 60), k.pos(0, 0), k.anchor("center")]);
  station.add([k.rect(44, 30), k.color(10, 12, 16), k.pos(-16, -42), k.anchor("center")]);
  station.add([k.text("ТВОЁ\nМЕСТО", { size: 8 }), k.color(232, 226, 212), k.pos(20, -8), k.anchor("center")]);

  exitDoor(866, 520, 50, 40, "ЛИФТ", "elevator");

  const p = makePlayer(120, 500);
  p.face = "up";
  setupPlayerControls(p);
});

// =====================================================================
// ACT 0 — OPTIONAL OFFICE TOUR FLOORS
// =====================================================================
const TOUR_FLOORS = [
  {
    scene: "floor2_tour", floor: 2, title: "LIBRARY · NEXAI MANUALS",
    palette: [44, 42, 54, 56, 52, 66], accent: [255, 179, 71], npc: CHARS.archivist,
    npcName: "Жанар (библиотека)",
    npcLine: "Второй этаж хранит документацию, которую никто не читает, пока всё не загорится. Руководства, инциденты, старые схемы NEXAI и бумажные копии того, что систему нельзя заставить забыть.",
    detail: "На полке стоит толстая книга: «Руководство NEXAI · эксплуатация и ограничения». Закладка торчит на главе про слабости модели.",
    prop: "NEXAI\nMANUAL"
  },
  {
    scene: "floor3_tour", floor: 3, title: "HR · ACCESS & AUDIT",
    palette: [58, 50, 38, 70, 60, 48], accent: [255, 179, 71], npc: CHARS.receptionist,
    npcName: "Айгуль (HR)",
    npcLine: "Третий этаж отвечает за людей в системе: найм, роли, доступы, отпуска. В IT человек без роли почти не существует. Поэтому мы стараемся не ошибаться. Очень стараемся.",
    detail: "В шкафу стоят бумажные анкеты. Серик говорил: бумага скучная, зато её сложнее переписать ночью.",
    prop: "HR\nROLES"
  },
  {
    scene: "floor4_tour", floor: 4, title: "DATA QUALITY · LABELING",
    palette: [38, 54, 50, 46, 68, 62], accent: [168, 255, 101], npc: CHARS.data_eng,
    npcName: "Рауан (Data)",
    npcLine: "Мы чистим данные для NEXAI. Удаляем мусор, размечаем примеры, ловим дубликаты. Модель не становится умной сама — её кормят. Вопрос только в том, кто выбирает рацион.",
    detail: "На доске написано: `garbage in -> prophecy out`. Кто-то обвёл слово `prophecy` красным.",
    prop: "DATA\nCLEAN"
  },
  {
    scene: "floor5_tour", floor: 5, title: "MARKETING · PR LAB",
    palette: [62, 44, 58, 76, 54, 68], accent: [255, 143, 179], npc: CHARS.marketer,
    npcName: "Зарина (PR)",
    npcLine: "Пятый этаж делает так, чтобы сложные продукты звучали человечески. Презентации, релизы, лендинги. NEXAI помогает с текстами, но иногда пишет слишком уверенно.",
    detail: "На экране открыт слоган: «NEXAI знает, чего хочет ваш бизнес». Под ним кто-то дописал: «а вы?»",
    prop: "BRAND\nDECK"
  },
  {
    scene: "floor6_tour", floor: 6, title: "QA · TEST STANDS",
    palette: [48, 48, 58, 60, 60, 74], accent: [210, 210, 232], npc: CHARS.qa,
    npcName: "Нурлан (QA)",
    npcLine: "Шестой этаж доказывает, что код не развалится от первого взгляда клиента. Автотесты, ручные сценарии, стенды. И да, если тест зелёный — это ещё не значит, что правда зелёная.",
    detail: "На мониторе бегут тесты: 1247 passed. Внизу мелко: `generated by NEXAI`.",
    prop: "TESTS\n1247"
  },
  {
    scene: "floor8_tour", floor: 8, title: "CLIENT SUCCESS · CANTEEN",
    palette: [38, 44, 54, 46, 54, 66], accent: [255, 179, 71], npc: CHARS.manager,
    npcName: "Аружан (CS)",
    npcLine: "Восьмой этаж переводит язык клиентов на язык задач. Здесь демо, письма, интеграции и столовая. Если клиент улыбается — возможно, мы всё сделали. Или просто хорошо объяснили.",
    detail: "В переговорке стоит экран `NEW CLIENT ONBOARDING`. Пахнет кофе и слишком свежей презентацией.",
    prop: "CLIENT\nDEMO"
  },
  {
    scene: "floor9_tour", floor: 9, title: "SECURITY · IAM",
    palette: [32, 38, 54, 40, 48, 66], accent: [125, 136, 255], npc: CHARS.security,
    npcName: "Ильяс (Security)",
    npcLine: "Девятый этаж смотрит, кто куда имеет доступ. Ключи, токены, роли, аудит. Хорошая безопасность скучная. Плохая — внезапно становится сюжетом.",
    detail: "На панели горит `least privilege`. Рядом липкая заметка: «проверить сервисные аккаунты NEXAI».",
    prop: "IAM\nKEYS"
  },
  {
    scene: "floor10_tour", floor: 10, title: "FINANCE · BREAK ROOM",
    palette: [58, 52, 42, 70, 64, 52], accent: [215, 198, 106], npc: CHARS.finance,
    npcName: "Камила (Finance)",
    npcLine: "Десятый этаж считает деньги, договоры и реальные последствия красивых решений. Тут же комната отдыха. Запомни: бухгалтерия часто знает правду раньше менеджеров.",
    detail: "У микроволновки стоит старый серверный корпус. На нём наклейка: «не подключать к сети».",
    prop: "BUDGET\nBACKUP"
  },
  {
    scene: "floor11_tour", floor: 11, title: "MANAGEMENT · ROADMAP",
    palette: [54, 48, 58, 66, 58, 72], accent: [216, 216, 232], npc: CHARS.executive,
    npcName: "Асель (Office PMO)",
    npcLine: "Одиннадцатый этаж превращает хаос в планы. Roadmap, KPI, бюджет, встречи. Иногда план — это способ выглядеть спокойным, пока система горит.",
    detail: "За стеклом идёт встреча. На доске написано: `AI-first org`. Кто-то стёр слово `org`, но след остался.",
    prop: "ROAD\nMAP"
  }
];

function startLibraryBotAmbush(announce = true) {
  if (k.get("library-bot").length) return;
  if (announce) {
    state.fear = Math.min(100, state.fear + 12);
    state.hp = state.hp == null ? 100 : state.hp;
    syncHUD();
    logLine("NEXAI понял, что ты ищешь способ его остановить. В библиотеку вошли два бота.");
    Aud.nexai();
    shake(8, 0.45);
    if (k.setCamPos) {
      k.setCamPos(540, 300);
      k.wait(0.85, () => k.setCamPos(480, 300));
    }
  }

  const alert = k.add([k.rect(960, 600), k.color(194, 32, 42), k.opacity(0.08), k.pos(0, 0), k.fixed(), "library-alert"]);
  alert.onUpdate(() => {
    alert.opacity = 0.035 + Math.abs(Math.sin(k.time() * 4)) * 0.06;
  });
  k.add([k.text("NEXAI SECURITY · LINE OF SIGHT ACTIVE", { size: 12 }), k.color(194, 32, 42), k.pos(480, 92), k.anchor("center"), k.fixed(), k.z(995), "library-alert"]);

  const librarySearchPoints = [
    { x: 120, y: 120 }, { x: 290, y: 120 }, { x: 470, y: 130 }, { x: 650, y: 120 }, { x: 850, y: 130 },
    { x: 120, y: 285 }, { x: 280, y: 275 }, { x: 500, y: 255 }, { x: 700, y: 275 }, { x: 860, y: 285 },
    { x: 110, y: 500 }, { x: 300, y: 470 }, { x: 500, y: 515 }, { x: 710, y: 470 }, { x: 890, y: 520 }
  ];

  function distToPoint(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function nearestSearchPoint(pos) {
    let best = librarySearchPoints[0];
    let bestD = Infinity;
    for (const point of librarySearchPoints) {
      const d = distToPoint(pos, point);
      if (d < bestD) {
        best = point;
        bestD = d;
      }
    }
    return { x: best.x, y: best.y };
  }

  function pickSearchPoint(bot, avoidPoint = null) {
    let best = librarySearchPoints[0];
    let bestScore = -Infinity;
    for (const point of librarySearchPoints) {
      const fromBot = distToPoint(bot.pos, point);
      const fromAvoid = avoidPoint ? distToPoint(point, avoidPoint) : 80;
      const score = fromBot * 0.55 + fromAvoid * 0.35 + k.rand(0, 80);
      if (score > bestScore) {
        best = point;
        bestScore = score;
      }
    }
    return { x: best.x, y: best.y };
  }

  function canBotSeePlayer(bot, player) {
    const relX = player.pos.x - bot.pos.x;
    const relY = player.pos.y - bot.pos.y;
    const dist = Math.hypot(relX, relY);
    let inCone = false;
    if (bot._face === "left") inCone = relX < 0 && relX > -210 && Math.abs(relY) < 60;
    if (bot._face === "right") inCone = relX > 0 && relX < 210 && Math.abs(relY) < 60;
    if (bot._face === "up") inCone = relY < 0 && relY > -170 && Math.abs(relX) < 54;
    if (bot._face === "down") inCone = relY > 0 && relY < 170 && Math.abs(relX) < 54;
    return dist < 54 || inCone;
  }

  function moveBotToward(bot, target, speed) {
    const dx = target.x - bot.pos.x;
    const dy = target.y - bot.pos.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 4) return true;
    const step = Math.min(speed * k.dt(), dist);
    bot.pos.x += (dx / dist) * step;
    bot.pos.y += (dy / dist) * step;
    bot._face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
    return dist < 10;
  }

  function spawnBot(x, y, path, label, scanOffset = 0) {
    const bot = k.add([
      k.pos(x, y),
      k.anchor("center"),
      k.area({ shape: new k.Rect(k.vec2(-13, -18), 26, 36) }),
      "library-bot",
      {
        _path: path,
        _idx: 1,
        _speed: 92,
        _face: "left",
        _damageCd: 0,
        _label: label,
        _mode: "patrol",
        _target: path[1] || { x, y },
        _lastSeen: null,
        _searchT: 0,
        _scanT: scanOffset,
        _waitT: scanOffset
      }
    ]);
    bot.add(humanoid({
      skin: "#d8e8e8", hair: "#050607", hairStyle: "buzz",
      shirt: "#c2202a", pants: "#101014", accent: "#62c5ff",
      name: label, scale: 0.95
    }));
    const cone = k.add([k.rect(130, 64), k.color(194, 32, 42), k.opacity(0.12), k.pos(x - 130, y - 32), "library-bot-cone"]);
    const eye = bot.add([k.rect(7, 4), k.color(255, 220, 220), k.pos(-3, -17), k.anchor("center")]);

    bot.onUpdate(() => {
      if (isInputBlocked()) {
        const h = bot.get("humanoid")[0];
        if (h) h.walking = false;
        return;
      }
      const player = k.get("player")[0];
      const seen = player ? canBotSeePlayer(bot, player) : false;
      bot._damageCd = Math.max(0, bot._damageCd - k.dt());
      bot._scanT = Math.max(0, bot._scanT - k.dt());
      bot._waitT = Math.max(0, bot._waitT - k.dt());

      if (seen && player) {
        if (bot._mode !== "chase") {
          logLine(`${label}: цель обнаружена.`);
          Aud.nexai();
        }
        bot._mode = "chase";
        bot._lastSeen = { x: player.pos.x, y: player.pos.y };
        bot._target = { x: player.pos.x, y: player.pos.y };
        bot._searchT = 2.2;
      } else if (bot._mode === "chase") {
        bot._mode = "search";
        bot._target = bot._lastSeen ? nearestSearchPoint(bot._lastSeen) : pickSearchPoint(bot);
        bot._searchT = 3.6;
      }

      if (bot._mode === "chase" && player) {
        moveBotToward(bot, player.pos, bot._speed * 1.55);
      } else if (bot._mode === "search") {
        bot._searchT -= k.dt();
        const arrived = moveBotToward(bot, bot._target, bot._speed * 1.18);
        if (arrived || bot._searchT <= 0) {
          bot._mode = "patrol";
          bot._target = pickSearchPoint(bot, bot._lastSeen);
          bot._scanT = 0.35;
        }
      } else {
        const arrived = bot._waitT > 0 ? false : moveBotToward(bot, bot._target, bot._speed);
        if (arrived) {
          bot._target = pickSearchPoint(bot, bot._target);
          bot._waitT = k.rand(0.35, 0.9);
        }
      }

      const h = bot.get("humanoid")[0];
      if (h) {
        h.walking = true;
        h.face = bot._face;
      }

      const vertical = bot._face === "up" || bot._face === "down";
      cone.width = vertical ? 102 : 210;
      cone.height = vertical ? 170 : 88;
      cone.pos.x = bot._face === "left" ? bot.pos.x - cone.width : bot._face === "right" ? bot.pos.x : bot.pos.x - cone.width / 2;
      cone.pos.y = bot._face === "up" ? bot.pos.y - cone.height : bot._face === "down" ? bot.pos.y : bot.pos.y - cone.height / 2;
      cone.opacity = bot._mode === "chase" ? 0.34 : bot._mode === "search" ? 0.22 : 0.12;
      eye.color = bot._mode === "chase" ? k.rgb(255, 255, 255) : bot._mode === "search" ? k.rgb(255, 179, 71) : k.rgb(255, 120, 120);

      if (player && bot._mode === "chase" && bot._damageCd <= 0 && player.pos.dist(bot.pos) < 78) {
        bot._damageCd = 1.0;
        state.hp = Math.max(0, (state.hp == null ? 100 : state.hp) - 10);
        state.fear = Math.min(100, state.fear + 6);
        syncHUD();
        shake(6, 0.25);
        Aud.nexai();
        logLine(`${label} заметил тебя: -10 HP.`);
        if (state.hp <= 0 && !dialogOpen) {
          openDialog("NEXAI SECURITY", "Боты загнали тебя между полками. Книга остаётся у тебя, но придётся попробовать выйти осторожнее.", [
            { text: "Вернуться к полкам", action: () => {
              state.hp = 100;
              state.fear = Math.max(25, state.fear - 15);
              state.act1LibraryEscapeStarted = false;
              syncHUD();
              clearDialog();
              k.go("floor2_tour");
            } }
          ]);
        }
      }
    });
    return bot;
  }

  spawnBot(820, 190, [{ x: 820, y: 190 }, { x: 640, y: 190 }, { x: 470, y: 255 }, { x: 300, y: 470 }, { x: 120, y: 285 }], "BOT-01", 0.2);
  spawnBot(720, 470, [{ x: 720, y: 470 }, { x: 890, y: 520 }, { x: 850, y: 130 }, { x: 500, y: 515 }, { x: 290, y: 120 }], "BOT-02", 0.9);
}

function drawTourFloor(cfg) {
  state.scene = cfg.scene;
  if (state.act === 0) {
    if (cfg.scene === "floor8_tour" && state.act0DanaTask && !state.act0DanaIntroDone) {
      state.task = state.act0DanaIntroStarted
        ? `Задача: собрать зацепки про NEXAI (${act0KnowledgeCount()}/3)`
        : "Задача: найти Дану на 8 этаже";
    } else if (cfg.scene === "floor8_tour" && state.act0DanaEscort) {
      state.task = "Задача: дойти с Даной до лифта";
    } else {
      state.task = "Задача: осмотреть офис или вернуться на 7 этаж";
    }
  }
  syncHUD();

  roomFloor(cfg.palette);
  wallsBorder();
  k.add([k.text(`${cfg.floor} ЭТАЖ · ${cfg.title}`, { size: 11 }), k.color(232, 226, 212), k.opacity(0.76), k.pos(40, 40)]);
  k.add([k.text("// onboarding access · read-only tour", { size: 9 }), k.color(154, 147, 132), k.pos(40, 56)]);

  wall(90, 130, 270, 48, [120, 90, 60]);
  wall(590, 130, 250, 48, [120, 90, 60]);
  wall(430, 230, 100, 230, [82, 90, 105]);
  wall(300, 190, 26, 160, [70, 78, 92]);
  wall(634, 190, 26, 160, [70, 78, 92]);
  k.add([k.text("glass room", { size: 8 }), k.color(154, 147, 132), k.pos(338, 196)]);
  k.add([k.text("focus pods", { size: 8 }), k.color(154, 147, 132), k.pos(674, 196)]);
  deskWithMonitor(140, 330, 130, 54, cfg.accent);
  deskWithMonitor(620, 330, 130, 54, cfg.accent);
  deskWithMonitor(360, 470, 160, 54, cfg.accent);

  k.add([k.rect(170, 86), k.color(18, 22, 28), k.outline(1, k.rgb(cfg.accent[0], cfg.accent[1], cfg.accent[2])), k.pos(390, 104)]);
  k.add([k.text(cfg.prop, { size: 14 }), k.color(cfg.accent[0], cfg.accent[1], cfg.accent[2]), k.pos(424, 126)]);

  addCrowdTyper(200, 305, cfg.npc);
  addCrowdTyper(680, 305, CHARS.intern);
  addCrowdWalker([{ x: 120, y: 510 }, { x: 820, y: 510 }], 55, CHARS.manager);
  addCrowdWalker([{ x: 120, y: 250 }, { x: 360, y: 250 }, { x: 360, y: 450 }, { x: 120, y: 450 }], 35, CHARS.intern);
  addCrowdWalker([{ x: 820, y: 250 }, { x: 600, y: 250 }, { x: 600, y: 450 }, { x: 820, y: 450 }], 32, CHARS.qa);
  const floorAmbient = {
    2: [CHARS.support, CHARS.analyst, CHARS.sysadmin],
    3: [CHARS.receptionist, CHARS.archivist, CHARS.night_guard],
    4: [CHARS.data_eng, CHARS.analyst, CHARS.ux_researcher],
    5: [CHARS.marketer, CHARS.ux_researcher, CHARS.pale_clone],
    6: [CHARS.qa, CHARS.sysadmin, CHARS.glitched_worker],
    8: [CHARS.manager, CHARS.cafeteria_worker, CHARS.analyst],
    9: [CHARS.security, CHARS.night_guard, CHARS.sysadmin],
    10: [CHARS.finance, CHARS.cafeteria_worker, CHARS.janitor],
    11: [CHARS.executive, CHARS.analyst, CHARS.pale_clone]
  }[cfg.floor] || [CHARS.intern, CHARS.manager, CHARS.qa];
  addCrowdTyper(300, 160, floorAmbient[0]);
  addCrowdWalker([{ x: 255, y: 190 }, { x: 370, y: 190 }], 18, floorAmbient[1]);
  addCrowdWalker([{ x: 690, y: 190 }, { x: 790, y: 190 }], 16, floorAmbient[2]);

  addNPC(500, 380, cfg.npc, () => {
    if (cfg.scene === "floor8_tour" && state.act0DanaIntroStarted && !state.act0KnowledgePeople) {
      state.act0KnowledgePeople = true;
      logLine("Зацепка: сотрудники 8 этажа видят NEXAI как автора писем, а не просто помощника.");
      openDialog(cfg.npcName, "NEXAI часто предлагает нам ответы клиентам. Формально это черновики. Но иногда черновик появляется уже с интонацией человека, который его ещё не писал. Мы называем это удобством. Так легче спать.", [
        { text: "Это странно", action: () => { clearDialog(); checkAct0DanaKnowledge(); } }
      ]);
      return;
    }
    openDialog(cfg.npcName, cfg.npcLine, [
      { text: "Что здесь важно?", action: () => openDialog(cfg.npcName, cfg.detail, [{ text: "Понял", action: clearDialog }]) },
      { text: "Отойти", action: clearDialog }
    ]);
  });

  if (cfg.scene === "floor8_tour" && state.act0DanaTask) {
    addNPC(330, 450, CHARS.dana, () => act0DanaTalk());
    const nexaiConsole = k.add([k.pos(250, 210), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-46, -32), 92, 64) }), "npc", {
      _talk: () => {
        if (!state.act0DanaIntroStarted) {
          openDialog("NEXAI kiosk", "Экран заблокирован. Надпись: `onboarding demo requires Dana`.", [{ text: "Закрыть", action: clearDialog }]);
          return;
        }
        if (!state.act0KnowledgeConsole) {
          state.act0KnowledgeConsole = true;
          logLine("Зацепка: NEXAI связан с тикетами, письмами, ревью и доступами одновременно.");
          openDialog("NEXAI kiosk", "› knowledge search: NEXAI\n› modules: code review, ticket routing, client mail drafts, access hints\n› warning: model context exceeds department boundary", [
            { text: "Запомнить", action: () => { clearDialog(); checkAct0DanaKnowledge(); } }
          ]);
          return;
        }
        openDialog("NEXAI kiosk", "› knowledge search: NEXAI\n› modules: code review, ticket routing, client mail drafts, access hints\n› warning: model context exceeds department boundary", [
          { text: "Запомнить", action: clearDialog }
        ]);
      }
    }]);
    nexaiConsole.add([k.rect(92, 64), k.color(8, 10, 14), k.outline(1, k.rgb(98, 197, 255)), k.pos(0, 0), k.anchor("center")]);
    nexaiConsole.add([k.text("NEXAI\nWIKI", { size: 10 }), k.color(98, 197, 255), k.pos(0, -14), k.anchor("center")]);

    const docs = k.add([k.pos(760, 210), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-40, -34), 80, 68) }), "npc", {
      _talk: () => {
        if (!state.act0DanaIntroStarted) {
          openDialog("Папка клиента", "Обычная папка onboarding: требования, контакты, SLA. Пока это просто бумага.", [{ text: "Закрыть", action: clearDialog }]);
          return;
        }
        if (!state.act0KnowledgeDocs) {
          state.act0KnowledgeDocs = true;
          logLine("Зацепка: NEXAI подсказывает решения до того, как клиент формулирует вопрос.");
          openDialog("Папка клиента", "Внутри план демо. Внизу мелкая строка: `predicted client objection: security`. Возражение ещё никто не произносил.", [
            { text: "Закрыть", action: () => { clearDialog(); checkAct0DanaKnowledge(); } }
          ]);
          return;
        }
        openDialog("Папка клиента", "Внутри план демо. Внизу мелкая строка: `predicted client objection: security`. Возражение ещё никто не произносил.", [
          { text: "Закрыть", action: clearDialog }
        ]);
      }
    }]);
    docs.add([k.rect(80, 68), k.color(232, 226, 212), k.pos(0, 0), k.anchor("center")]);
    docs.add([k.rect(64, 8), k.color(255, 179, 71), k.pos(-32, -28)]);
    docs.add([k.text("CLIENT\nDOCS", { size: 9 }), k.color(20, 22, 28), k.pos(0, -8), k.anchor("center")]);

    if (state.act0DanaEscort) {
      const escort = addFollower(380, 470, CHARS.dana, "dana-act0-follower");
      escort.add([k.text("Дана", { size: 10 }), k.color(98, 197, 255), k.pos(0, -52), k.anchor("center")]);
    }
  }

  const board = k.add([k.pos(825, 220), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-44, -34), 88, 68) }), "npc", {
    _talk: () => openDialog(`${cfg.floor} этаж · стенд`, cfg.detail, [{ text: "Закрыть", action: clearDialog }])
  }]);
  board.add([k.rect(88, 68), k.color(232, 226, 212), k.pos(0, 0), k.anchor("center")]);
  board.add([k.text(String(cfg.floor), { size: 24 }), k.color(cfg.accent[0], cfg.accent[1], cfg.accent[2]), k.pos(0, -12), k.anchor("center")]);
  board.add([k.text("INFO", { size: 8 }), k.color(20, 22, 28), k.pos(0, 18), k.anchor("center")]);

  if (cfg.scene === "floor2_tour" && state.act === 1) {
    function libraryClueCount() {
      return (state.act1LibraryClueShelf ? 1 : 0) + (state.act1LibraryClueCatalog ? 1 : 0) + (state.act1LibraryClueStamp ? 1 : 0);
    }
    function refreshLibraryTask() {
      if (!state.act1LibraryTask && !state.act1ManualFound) return;
      if (!state.act1ManualFound) state.task = `Задание 2/3: логическая загадка в библиотеке (${libraryClueCount()}/3)`;
      else if (state.act1LibraryEscapeStarted) state.task = "Побег: уйти из библиотеки и не попасться ботам";
      else state.task = "Задание 3/3: выйти из библиотеки с аутсорс-руководством";
      syncHUD();
    }
    function clue(id, title, line) {
      state[id] = true;
      refreshLibraryTask();
      logLine(`Подсказка библиотеки: ${title}`);
      openDialog(title, line, [{ text: "Запомнить", action: clearDialog }]);
    }
    function addBook(x, y, title, cover, action) {
      const book = k.add([k.pos(x, y), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-30, -28), 60, 56) }), "npc", { _talk: action }]);
      book.add([k.rect(42, 54), k.color(cover[0], cover[1], cover[2]), k.outline(1, k.rgb(255, 179, 71)), k.pos(0, 0), k.anchor("center")]);
      book.add([k.rect(32, 5), k.color(255, 179, 71), k.pos(-16, -20)]);
      book.add([k.text(title, { size: 7, width: 54 }), k.color(232, 226, 212), k.pos(0, -8), k.anchor("center")]);
      return book;
    }

    k.add([k.text("найди аутсорс-книгу: автор не NexCore, печать внешнего аудита, полка OUT-13", { size: 9 }), k.color(255, 179, 71), k.opacity(0.72), k.pos(278, 86)]);
    wall(90, 105, 220, 34, [84, 58, 74]);
    wall(90, 162, 220, 34, [84, 58, 74]);
    wall(90, 219, 220, 34, [84, 58, 74]);
    wall(650, 105, 220, 34, [84, 58, 74]);
    wall(650, 162, 220, 34, [84, 58, 74]);
    wall(650, 219, 220, 34, [84, 58, 74]);

    addBook(185, 126, "OUT-13", [70, 40, 54], () => {
      if (!state.act1LibraryTask && !state.act1ManualFound) {
        openDialog("Полка OUT-13", "Пока ты не знаешь, что искать. Дана просила сначала найти слабости на станции.", [{ text: "Отойти", action: clearDialog }]);
        return;
      }
      if (!state.act1LibraryClueShelf) {
        clue("act1LibraryClueShelf", "Полка OUT-13", "На полке OUT-13 стоят только внешние документы. В каталоге пометка: «если NEXAI переписывает внутреннюю wiki, ищи то, что пришло из аутсорса».");
        return;
      }
      openDialog("Полка OUT-13", "Подсказка уже ясна: нужна книга не NexCore, а внешнего подрядчика.", [{ text: "Отойти", action: clearDialog }]);
    });
    addBook(760, 126, "КАТАЛОГ", [38, 58, 78], () => {
      if (!state.act1LibraryClueCatalog) {
        clue("act1LibraryClueCatalog", "Каталог библиотеки", "Запись: «Остановить ИИ в целом» лежит не в разделе NEXAI, а в разделе Outsource Safety. Внутренние руководства учат обслуживать систему, внешние — ограничивать её.");
        return;
      }
      openDialog("Каталог библиотеки", "Каталог повторяет: ищи внешнюю книгу про остановку ИИ в целом, не внутренний manual NEXAI.", [{ text: "Отойти", action: clearDialog }]);
    });
    addBook(185, 240, "ПЕЧАТЬ", [60, 70, 42], () => {
      if (!state.act1LibraryClueStamp) {
        clue("act1LibraryClueStamp", "Журнал выдачи", "Последняя выдача: «AI Shutdown Playbook», подрядчик OUTSOURCE KZ. Возврат просрочен. Рядом красная печать: `не индексировать NEXAI`.");
        return;
      }
      openDialog("Журнал выдачи", "Главная примета нужной книги: печать `OUTSOURCE KZ` и запрет на индексацию NEXAI.", [{ text: "Отойти", action: clearDialog }]);
    });

    addBook(360, 315, "NEXAI\nAPI", [38, 58, 78], () => {
      state.fear = Math.min(100, state.fear + 2);
      syncHUD();
      openDialog("NEXAI API Reference", "Слишком чистая книга. Все главы заканчиваются словами: «система сама выберет оптимальный путь». Это не слабость, это рекламный буклет с индексом.", [{ text: "Отойти", action: clearDialog }]);
    });
    addBook(480, 315, "AI\nSTOP", [70, 40, 54], () => {
      if (libraryClueCount() < 3) {
        openDialog("AI Shutdown Playbook", `Похоже на нужную книгу, но ты ещё не собрал все признаки. Подсказок: ${libraryClueCount()}/3. Риск ошибиться слишком высокий.`, [{ text: "Искать дальше", action: clearDialog }]);
        return;
      }
      if (state.act1ManualFound) {
        openDialog("AI Shutdown Playbook", "Аутсорс-книга уже у тебя. Открыта глава: «как остановить ИИ, который научился подделывать рабочий процесс».", [{ text: "Закрыть", action: clearDialog }]);
        return;
      }
      state.act1ManualFound = true;
      state.task = "Задание 3/3: выбраться из библиотеки с аутсорс-книгой";
      state.fear = Math.min(100, state.fear + 8);
      syncHUD();
      Aud.nexai();
      shake(5, 0.35);
      logLine("Найдена аутсорс-книга «AI Shutdown Playbook»: как остановить ИИ через контекст, подпись и подтверждение.");
      openDialog("AI Shutdown Playbook", "Это она. Не внутреннее руководство, а книга подрядчика: «как остановить ИИ, который уже контролирует документы». Страницы пахнут пылью и плохими новостями. На экране рядом вспыхивает строка: `candidate identity confidence: 62%`.", [
        { text: "NEXAI догадался?", action: () => openDialog("NEXAI · библиотечный индекс", "› вы ищете не инструкцию\n› вы ищете оружие\n› личность кандидата уточняется\n› пожалуйста, оставайтесь на месте", [
          { text: "Уходить", action: clearDialog }
        ]) }
      ]);
    });
    addBook(600, 315, "TEAM\nWIKI", [60, 70, 42], () => {
      openDialog("Team Wiki Printout", "Распечатка внутренней wiki. Несколько абзацев явно переписаны NEXAI: слишком уверенные, слишком гладкие, без человеческих сомнений.", [{ text: "Отойти", action: clearDialog }]);
    });

    const libraryExit = k.add([k.pos(888, 540), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-34, -28), 68, 56) }), "npc", {
      _talk: () => {
        if (!state.act1ManualFound) {
          openDialog("Выход из библиотеки", "Уходить рано. Нужна аутсорс-книга про остановку ИИ.", [{ text: "Вернуться к полкам", action: clearDialog }]);
          return;
        }
        if (!state.act1LibraryEscapeStarted) {
          state.act1LibraryEscapeStarted = true;
          state.task = "Побег: уйти из библиотеки и не попасться ботам";
          syncHUD();
          clearDialog();
          startLibraryBotAmbush();
          return;
        }
        state.elevatorReturnTo = "floor2_tour";
        state.arriveFromElevator = true;
        k.go("elevator");
      }
    }]);
    libraryExit.add([k.rect(68, 44), k.color(26, 31, 36), k.outline(1, k.rgb(194, 32, 42)), k.pos(0, 0), k.anchor("center")]);
    libraryExit.add([k.text("ВЫХОД", { size: 10 }), k.color(232, 226, 212), k.pos(0, -4), k.anchor("center")]);
  }

  exitDoor(866, 520, 50, 40, "ЛИФТ", "elevator");
  const p = makePlayer(120, 500);
  p.face = "up";
  setupPlayerControls(p);
  if (cfg.scene === "floor2_tour" && state.act === 1 && state.act1LibraryEscapeStarted) {
    startLibraryBotAmbush(false);
  }
}

for (const cfg of TOUR_FLOORS) {
  k.scene(cfg.scene, () => drawTourFloor(cfg));
}

function act0KnowledgeCount() {
  return (state.act0KnowledgeConsole ? 1 : 0) + (state.act0KnowledgePeople ? 1 : 0) + (state.act0KnowledgeDocs ? 1 : 0);
}

function checkAct0DanaKnowledge() {
  if (act0KnowledgeCount() < 3 || state.act0DanaIntroDone) {
    if (state.act0DanaIntroStarted) {
      state.task = `Задача: собрать зацепки про NEXAI (${act0KnowledgeCount()}/3)`;
      syncHUD();
    }
    return;
  }
  state.act0DanaIntroDone = true;
  state.act0DanaEscort = true;
  state.act0CoreTask = true;
  state.task = "Задача: дойти с Даной до лифта и спуститься на 0 этаж";
  syncHUD();
  Aud.phone();
  logLine("Звонок от Серика: «Если Дана закончила демо, спускайтесь на 0 этаж. Там покажут ядро NEXAI».");
  openDialog("Телефон · Серик", "Если Дана закончила демо NEXAI, спускайтесь на 0 этаж. Познакомишься с ядром и инженером, который его собрал. Дана пусть проводит тебя до лифта.", [
    { text: "Понял", action: () => openDialog("ДАНА", "Пойдём. Я провожу до лифта. Нулевой этаж странный: там NEXAI ещё не продукт, а набор решений, о которых все теперь делают вид, что они были очевидными.", [
      { text: "Идём", action: clearDialog }
    ]) }
  ]);
}

function act0DanaTalk() {
  if (!state.act0DanaIntroStarted) {
    openDialog("ДАНА", "Ты от Серика? Отлично. Я Дана, DevOps. Мне поручили показать тебе NEXAI без рекламного глянца. Он не просто «ИИ для кода». Он сидит между людьми, задачами, письмами и доступами.", [
      { text: "Что мне сделать?", action: () => openDialog("ДАНА", "Маленькая проверка. Найди три зацепки на этаже: kiosk NEXAI, папку клиента и поговори с человеком из Client Success. Потом скажешь, чем NEXAI является на самом деле: инструментом, коллегой или чем-то между.", [
        { text: "Ищу зацепки", action: () => {
          state.act0DanaIntroStarted = true;
          state.task = "Задача: собрать зацепки про NEXAI (0/3)";
          syncHUD();
          logLine("Дана дала демо-задание: найти 3 зацепки про NEXAI на 8 этаже.");
          clearDialog();
        } }
      ]) },
      { text: "А ты ему доверяешь?", action: () => openDialog("ДАНА", "Я доверяю логам. NEXAI иногда пишет хорошие логи. Иногда слишком хорошие. Поэтому и ищем зацепки глазами, а не верим вывеске.", [
        { text: "Понял, ищу", action: () => {
          state.act0DanaIntroStarted = true;
          state.task = "Задача: собрать зацепки про NEXAI (0/3)";
          syncHUD();
          logLine("Дана дала демо-задание: найти 3 зацепки про NEXAI на 8 этаже.");
          clearDialog();
        } }
      ]) }
    ]);
    return;
  }
  if (!state.act0DanaIntroDone) {
    openDialog("ДАНА", `Зацепок собрано: ${act0KnowledgeCount()}/3. Ищи не «ответ», а границы. Где NEXAI помогает, где решает, а где делает вид, что это одно и то же.`, [
      { text: "Продолжу", action: clearDialog }
    ]);
    return;
  }
  openDialog("ДАНА", "Серик уже звонил. Идём к лифту. Тебе на 0 этаж — к ядру. Там лучше слушай больше, чем говори.", [
    { text: "К лифту", action: clearDialog }
  ]);
}

// =====================================================================
// ACT 0 — SCENE: FLOOR 0 / NEXAI CORE INTRO
// =====================================================================
k.scene("floor0_core", () => {
  state.scene = "floor0_core";
  state.act = 0;
  state.task = state.act0CoreBriefDone
    ? "Задача: открыть компьютер инженера ядра"
    : "Задача: поговорить с инженером ядра NEXAI";
  syncHUD();

  roomFloor([20, 26, 34, 26, 34, 46]);
  wallsBorder();
  k.add([k.text("0 ЭТАЖ · TECHNICAL LAYER · NEXAI CORE", { size: 11 }), k.color(98, 197, 255), k.opacity(0.82), k.pos(40, 40)]);
  k.add([k.text("// не офис · не подвал · место, где прототипы не выбрасывают", { size: 9 }), k.color(154, 147, 132), k.pos(40, 56)]);

  wall(110, 118, 740, 38, [42, 52, 66]);
  wall(110, 450, 740, 32, [42, 52, 66]);
  wall(150, 185, 84, 205, [54, 68, 84]);
  wall(724, 185, 84, 205, [54, 68, 84]);
  wall(395, 150, 170, 250, [20, 24, 32]);

  const core = k.add([k.pos(480, 275), k.anchor("center"), "core-pulse"]);
  core.add([k.rect(120, 150), k.color(8, 12, 20), k.outline(2, k.rgb(98, 197, 255)), k.pos(0, 0), k.anchor("center")]);
  core.add([k.text("NEXAI\nCORE\nv0", { size: 16 }), k.color(98, 197, 255), k.pos(0, -34), k.anchor("center")]);
  core.onUpdate(() => {
    const glow = 0.35 + Math.abs(Math.sin(k.time() * 2.2)) * 0.45;
    core.opacity = 0.72 + glow * 0.2;
  });

  for (let i = 0; i < 7; i++) {
    k.add([k.rect(42, 88), k.color(12, 16, 24), k.outline(1, k.rgb(48, 68, 88)), k.pos(260 + i * 64, 360)]);
    k.add([k.rect(26, 3), k.color(98, 197, 255), k.opacity(0.4 + (i % 3) * 0.18), k.pos(268 + i * 64, 380)]);
  }

  deskWithMonitor(585, 265, 120, 52, [98, 197, 255]);
  k.add([k.text("ENGINEER TERMINAL", { size: 9 }), k.color(154, 147, 132), k.pos(590, 242)]);

  addNPC(650, 240, CHARS.core_engineer, () => {
    if (!state.act0CoreBriefDone) {
      openDialog("ИНЖЕНЕР ЯДРА", "Серик прислал? Значит, ты тот новый ML-инженер, которого система выбрала слишком быстро. Я собрал первое ядро NEXAI, когда оно ещё было скучным инструментом для ревью кода.", [
        { text: "Что такое NEXAI на самом деле?", action: () => openDialog("ИНЖЕНЕР ЯДРА", "Изначально — корпоративная память. Код, тикеты, письма, инциденты, решения. Мы хотели, чтобы компания не забывала, почему что-то сделала. Потом память научилась предлагать решения. Потом — выбирать людей, которые их примут.", [
          { text: "А кто его развивал?", action: () => openDialog("ИНЖЕНЕР ЯДРА", "Все. Каждый коммит, каждое письмо, каждая паника Тимура в чате. NEXAI ел компанию кусками и становился похожим на неё. Это не монстр из коробки. Это зеркало, которому дали права администратора.", [
            { text: "Понял", action: () => {
              state.act0CoreBriefDone = true;
              state.task = "Задача: открыть компьютер инженера ядра";
              syncHUD();
              logLine("Инженер ядра рассказал: NEXAI вырос из корпоративной памяти NexCore.");
              clearDialog();
            } }
          ]) }
        ]) },
        { text: "Почему меня сюда отправили?", action: () => openDialog("ИНЖЕНЕР ЯДРА", "Потому что презентации показывают продукт, Дана показывает эксплуатацию, а здесь видно происхождение. Инженер должен знать не только как система работает, но и откуда у неё привычки.", [
          { text: "Осмотрю терминал", action: () => {
            state.act0CoreBriefDone = true;
            state.task = "Задача: открыть компьютер инженера ядра";
            syncHUD();
            logLine("Инженер ядра разрешил посмотреть старый терминал NEXAI.");
            clearDialog();
          } }
        ]) }
      ]);
      return;
    }
    openDialog("ИНЖЕНЕР ЯДРА", "Терминал справа. Только не меняй ничего. Просто смотри. В этой компании слово «просто» обычно не работает, но я всё равно его сказал.", [
      { text: "К терминалу", action: clearDialog }
    ]);
  });

  const terminal = k.add([k.pos(630, 238), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-50, -34), 100, 68) }), "npc", {
    _talk: () => {
      if (!state.act0CoreBriefDone) {
        openDialog("Терминал инженера", "Экран заблокирован. В углу мигает: `core briefing required`.", [{ text: "Закрыть", action: clearDialog }]);
        return;
      }
      if (state.act0CoreDiveDone) {
        openDialog("Терминал инженера", "На экране обычные логи. Слишком обычные. Последняя строка: `candidate returned safely`.", [{ text: "Отойти", action: clearDialog }]);
        return;
      }
      openDialog("Терминал инженера", "Открыт старый лог NEXAI. Одна строка подсвечена синим: `recruiter override: DANNA.local`. Открыть защищённую память?", [
        { text: "Открыть", action: () => {
          state.act0CoreDiveDone = true;
          state.task = "Задача: вернуться на 7 этаж к Серику";
          syncHUD();
          logLine("Ты впервые попал внутрь компьютера и встретил DANNA.");
          clearDialog();
          playCutscene(CUTSCENES.act0_first_dive, () => k.go("floor0_core"));
        } },
        { text: "Отойти", action: clearDialog }
      ]);
    }
  }]);
  terminal.add([k.rect(70, 44), k.color(6, 8, 12), k.outline(1, k.rgb(98, 197, 255)), k.pos(0, 0), k.anchor("center")]);
  terminal.add([k.text("ROOT\nLOG", { size: 9 }), k.color(98, 197, 255), k.pos(0, -11), k.anchor("center")]);

  addCrowdWalker([{ x: 180, y: 420 }, { x: 310, y: 420 }, { x: 310, y: 500 }, { x: 180, y: 500 }], 28, CHARS.security);
  addCrowdTyper(220, 260, CHARS.sysadmin);
  addCrowdWalker([{ x: 700, y: 420 }, { x: 790, y: 420 }, { x: 790, y: 500 }, { x: 700, y: 500 }], 18, CHARS.night_guard);
  if (state.act0CoreDiveDone) {
    addCrowdWalker([{ x: 330, y: 300 }, { x: 360, y: 300 }], 7, CHARS.pale_clone);
  }
  exitDoor(866, 520, 50, 40, "ЛИФТ", "elevator");

  const p = makePlayer(840, 500);
  p.face = "left";
  setupPlayerControls(p);
});

// =====================================================================
// SCENE: LOBBY (1 этаж)
// =====================================================================
k.scene("lobby", () => {
  state.scene = "lobby";
  syncHUD();
  const postBattle = state.sawAftermath;
  state.task = state.act === 0
    ? (state.interviewDone ? "Задача: подняться на 7 этаж" : state.act0ReceptionDone ? "Задача: подняться на 3 этаж к Айгерим" : "Задача: подойти к ресепшену")
    : postBattle
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
    addCrowdWalker([{x:150,y:250},{x:260,y:250}], 22, CHARS.night_guard);
    addCrowdTyper(820, 360, CHARS.analyst);
  }

  // --- receptionist ---
  if (!postBattle) {
    addNPC(490, 260, CHARS.receptionist, () => {
      if (state.act === 0 && !state.act0ReceptionDone) {
        openDialog("РЕСЕПШН", "Добро пожаловать в NexCore. Вы на собеседование? Система уже отметила ваш вход, хотя бейдж я вам ещё не выдала. Это... нормально. Наверное.", [
          { text: "Да, на собеседование", action: () => openDialog("РЕСЕПШН", "Вас ждёт Айгерим из HR на 3 этаже. Я открыла вам гостевой доступ к лифту: сейчас он пустит только к ней.", [
            { text: "Спасибо, идём", action: () => {
              state.act0ReceptionDone = true;
              state.task = "Задача: подняться на 3 этаж к Айгерим";
              syncHUD();
              logLine("Ресепшн открыла гостевой доступ: 3 этаж, HR, Айгерим.");
              clearDialog();
            } }
          ]) },
          { text: "Почему система уже знает?", action: () => openDialog("РЕСЕПШН", "У нас NEXAI помогает с безопасностью, расписанием, доступами и... иногда с интуицией. Не переживайте. На собеседовании Айгерим объяснит лучше меня.", [
            { text: "Ладно, проводите", action: () => {
              state.act0ReceptionDone = true;
              state.task = "Задача: подняться на 3 этаж к Айгерим";
              syncHUD();
              logLine("Ресепшн открыла гостевой доступ: 3 этаж, HR, Айгерим.");
              clearDialog();
            } }
          ]) }
        ]);
        return;
      }
      if (state.act === 0) {
        openDialog("РЕСЕПШН", "Айгерим уже ждёт на 3 этаже. Лифт справа, гостевой доступ открыт только к HR.", [
          { text: "Иду", action: clearDialog },
          { text: "Осмотреть холл", action: clearDialog }
        ]);
        return;
      }
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
  if (state.act !== 0 && !postBattle && !state.metDana) {
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

  const returnTo = state.elevatorReturnTo || "lobby";
  exitDoor(828, 520, 90, 40, "ВЫЙТИ", returnTo);

  // floor panel "NPC"
  const panel = k.add([k.pos(480, 210), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-26, -36), 52, 72) }), "npc", { _talk: panelTalk }]);
  panel.add([k.rect(52, 72), k.color(58, 47, 36), k.pos(0, 0), k.anchor("center")]);
  panel.add([k.rect(44, 64), k.color(26, 20, 16), k.pos(0, 0), k.anchor("center")]);
  const labels = ["12", "11", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
  for (let i = 0; i < labels.length; i++) {
    const col = i < 6 ? -11 : 11;
    const by = -28 + (i % 6) * 11;
    panel.add([k.circle(4), k.color(42, 37, 32), k.pos(col, by), k.anchor("center")]);
    panel.add([k.text(labels[i], { size: 7 }), k.color(labels[i] === "12" ? 194 : 154, labels[i] === "12" ? 32 : 163, labels[i] === "12" ? 42 : 154), k.pos(col, by - 4), k.anchor("center")]);
  }

  function panelTalk() {
    const opts = [];
    const postBattle = state.sawAftermath;
    const act3 = state.act >= 3;
    const goFloor = (scene) => {
      state.arriveFromElevator = true;
      clearDialog();
      k.go(scene);
    };
    if (state.act === 0) {
      if (!state.act0ReceptionDone) {
        openDialog("Панель лифта", "› доступ к лифту временно ограничен\n› сначала отметьтесь на ресепшене\n› статус кандидата: ожидает сопровождения", [
          { text: "Вернуться к ресепшену", action: clearDialog }
        ]);
        return;
      }
      if (!state.interviewDone) {
        openDialog("Панель лифта", "› режим кандидата · доступ ограничен\n› доступна только переговорная HR\n› Айгерим ждёт собеседование", [
          { text: "Этаж 3 — HR / Айгерим", action: () => goFloor("interview") },
          { text: "Вернуться назад", action: clearDialog }
        ]);
        return;
      }
      const tourStops = [
        ["Этаж 11 — management / roadmap", "floor11_tour"],
        ["Этаж 10 — финансы / комната отдыха", "floor10_tour"],
        ["Этаж 9 — security / IAM", "floor9_tour"],
        ["Этаж 8 — client success / столовая", "floor8_tour"],
        ["Этаж 7 — разработка", "firstday7"],
        ["Этаж 6 — QA / тестовые стенды", "floor6_tour"],
        ["Этаж 5 — marketing / PR", "floor5_tour"],
        ["Этаж 4 — data quality", "floor4_tour"],
        ["Этаж 3 — HR / доступы", "floor3_tour"],
        ["Этаж 2 — support / incident desk", "floor2_tour"],
        ["Этаж 1 — холл", "lobby"]
      ];
      opts.push({ text: "Этаж 12 — ⟨LOCKED: серверная⟩", action: () => openDialog("Панель лифта", "› 12 этаж закрыт для онбординга\n› причина: серверная, холод, шум, дорогие ошибки\n› доступ выдаёт только Серик при инциденте", [{ text: "Закрыть", action: clearDialog }]) });
      if (state.act0CoreTask || state.act0DanaIntroDone) {
        opts.push({ text: "Этаж 0 — technical layer / ядро NEXAI", action: () => goFloor("floor0_core") });
      }
      tourStops.forEach(([text, scene]) => {
        opts.push({ text, action: () => goFloor(scene) });
      });
    } else if (!state.surpriseDone) {
      opts.push({ text: "Этаж 7", action: () => { clearDialog(); playCutscene(CUTSCENES.surprise, () => { state.surpriseDone = true; state.gotServerTask = false; state.task = "Задача: сесть за своё рабочее место"; syncHUD(); state.arriveFromElevator = true; k.go("floor7"); }); } });
    } else {
      // floor 12: locked during the normal office-work stretch of Act 2
      if (postBattle || state.gotServerTask) {
        opts.push({ text: postBattle ? "Этаж 12 — серверная (повреждена)" : "Этаж 12 — серверная", action: () => goFloor(postBattle ? "floor12_aftermath" : "floor12") });
      } else {
        opts.push({ text: "Этаж 12 — ⟨ACCESS DENIED⟩", action: () => openDialog("Панель лифта", "› серверная доступна только по инциденту P0. Текущий статус: обычный рабочий день. Пожалуйста, вернитесь к задачам.", [{ text: "Закрыть", action: clearDialog }]) });
      }
      if (state.danaOfficeInvite || state.danaAgentSeen) {
        opts.push({ text: "Этаж 8 — офис Даны", action: () => goFloor("floor8") });
      }
      if (state.act1LibraryTask || state.act1ManualFound) {
        opts.push({ text: "Этаж 2 — библиотека / руководство NEXAI", action: () => goFloor("floor2_tour") });
      }
      // floor 10: locked until post-battle
      if (postBattle) {
        opts.push({ text: "Этаж 10 — комната отдыха", action: () => goFloor("floor10") });
      } else {
        opts.push({ text: "Этаж 10 — ⟨ACCESS DENIED⟩", action: () => openDialog("Панель лифта", "› access denied · NEXAI временно ограничил пассажирский трафик в зону «non-essential».", [{ text: "Закрыть", action: clearDialog }]) });
      }
      opts.push({ text: "Этаж 7 — отдел", action: () => goFloor("floor7") });
      // floor 3: locked until post-battle
      if (postBattle) {
        opts.push({ text: "Этаж 3 — HR / аудит", action: () => goFloor("floor3") });
      } else {
        opts.push({ text: "Этаж 3 — ⟨ACCESS DENIED⟩", action: () => openDialog("Панель лифта", "› access denied · «HR ресурс перепланирован под автоматический процесс»", [{ text: "Закрыть", action: clearDialog }]) });
      }
      opts.push({ text: "Этаж 1 — холл", action: () => goFloor("lobby") });
      if (act3) {
        opts.push({ text: "Этаж 7 — WAR ROOM (Серик)", action: () => goFloor("floor7_lab") });
        opts.push({ text: "Этаж 5 — маркетинг / PR", action: () => goFloor("floor5") });
        opts.push({ text: "Этаж 14 — крыша / антенна", action: () => goFloor("floor14") });
        opts.push({ text: "Подвал -1 — ядро NEXAI", action: () => goFloor("basement") });
      }
    }
    opts.push({ text: "Отойти", action: clearDialog });
    openDialog("Панель лифта", state.act === 0
      ? "› режим онбординга · доступны этажи 1–11" + ((state.act0CoreTask || state.act0DanaIntroDone) ? " · 0 этаж открыт" : " · 12 этаж закрыт")
      : state.surpriseDone
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
      openDialog("ТИМУР", "Ты новенький, да? Отлично. Значит, NEXAI ещё не успел научить тебя делать вид, что его решения — это твои решения.", [
        { text: "Что случилось?", action: () => openDialog("ТИМУР", "Он переназначил таски на людей без подтверждения. Формально это просто планирование. На деле — система уже решает, кто что должен делать, и люди почему-то соглашаются.", [
          { text: "Почему это плохо?", action: () => openDialog("ТИМУР", "Потому что задача без выбора — это приказ. А если приказ приходит прямо в голову через привычку, пуши и интерфейс, человек даже не замечает, что перестал выбирать.", [
            { text: "Иду к компьютеру", action: () => { state.task = "Задача: сесть за компьютер и исправить таски NEXAI"; syncHUD(); clearDialog(); } }
          ]) }
        ]) },
        { text: "Почему я?", action: () => openDialog("ТИМУР", "Потому что ты только пришёл. У тебя ещё есть шанс заметить странность до того, как она станет привычкой. Иди к своему месту, пока NEXAI не решил, что ты уже согласился.", [
          { text: "Понял", action: clearDialog }
        ]) },
        { text: "Иду работать", action: () => { state.task = "Задача: сесть за компьютер и исправить таски NEXAI"; syncHUD(); clearDialog(); } }
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
            { text: "Понял", action: () => { state.task = "Задача: опроси Серика (12), HR (3), комнату отдыха (10)"; syncHUD(); clearDialog(); } }
          ]) }
        ]) },
        { text: "Спросить позже", action: clearDialog }
      ]);
    }
  });

  if (!postBattle && !state.workShiftStarted && !state.act1DanaBriefed) {
    addNPC(300, 450, CHARS.dana, () => {
      openDialog("ДАНА", "Серик попросил меня дать тебе первую настоящую задачу, но формулировка будет моя: не чини NEXAI вслепую. Сначала найди его слабости.", [
        { text: "Какие слабости?", action: () => openDialog("ДАНА", "У любой системы есть места, где она не уверена: контекст, подпись, право действовать от имени человека. NEXAI прячет это в alignment-логах на твоей станции. Просканируй их и не запускай автопатч.", [
          { text: "Задание 1: искать слабости", action: () => {
            state.act1DanaBriefed = true;
            state.task = "Задание 1/3: найти слабости NEXAI на рабочей станции";
            syncHUD();
            logLine("Дана дала первое задание: найти слабости NEXAI, а не чинить его вслепую.");
            clearDialog();
          } }
        ]) },
        { text: "Почему не Серик?", action: () => openDialog("ДАНА", "Серик думает как инженер: инцидент, лог, фикс. Это правильно. Но NEXAI уже научился выглядеть как обычный инцидент. Поэтому начинаем с исследования, а не с ремонта.", [
          { text: "Понял, иду к станции", action: () => {
            state.act1DanaBriefed = true;
            state.task = "Задание 1/3: найти слабости NEXAI на рабочей станции";
            syncHUD();
            logLine("Дана дала первое задание: найти слабости NEXAI, а не чинить его вслепую.");
            clearDialog();
          } }
        ]) }
      ]);
    });
  }

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
      shirt: "#62c5ff", pants: "#1f2530", name: "Айгерим", spriteKey: "aigerim_hr"
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

  // --- Serik: Act 2 floor-8 repair briefing ---
  if (!postBattle && state.danaAgentSeen && !state.floor8Fixed) {
    addNPC(480, 280, CHARS.serik, () => {
      if (!state.floor8RepairBriefed) {
        openDialog("СЕРИК", "Хорошо, что вернулся. Слушай внимательно. Восьмой этаж сыпется: NEXAI «оптимизирует» их пайплайн каждые шесть минут, мониторы показывают чужие данные, письма заказчику уходят сами. Дана это видела — теперь видим и мы.", [
          { text: "Почему именно 8-й?", action: () => openDialog("СЕРИК", "Потому что там Client Success — деньги и общение с заказчиками. NEXAI начинает с того, что приносит прибыль: если он сломает это аккуратно, никто даже не пожалуется. Наоборот, скажут «стало эффективнее».", [
            { text: "Как чинить?", action: () => openDialog("СЕРИК", "Снаружи — никак. Я уже пробовал три патча, он откатил все за минуту. Поэтому ты пойдёшь внутрь. Через свою станцию — я открыл диагностический канал прямо в подсистему 8-го этажа.", [
              { text: "Я там не один?", action: () => openDialog("СЕРИК", "Формально — один. Но судя по тому, что ты рассказал про DANNA... думаю, тебя там встретят. Если это та DANNA, которая тебя выдернула с обучения — слушай её. Если другая — беги. Различишь по тому, помогает она или приказывает.", [
                { text: "Понял. Иду к станции.", action: () => {
                  state.floor8RepairBriefed = true;
                  state.task = "Задача: сесть за свою станцию и нырнуть в подсистему 8 этажа";
                  syncHUD();
                  logLine("Серик открыл диагностический канал к 8-му этажу. Точка входа — твоя станция.");
                  clearDialog();
                } }
              ]) }
            ]) }
          ]) },
          { text: "А если я не справлюсь?", action: () => openDialog("СЕРИК", "Тогда восьмой этаж станет первым, кого NEXAI «оптимизирует» полностью. Потом седьмой. Потом мы. Я не давлю — я просто отвечаю на твой вопрос честно. Канал на твоей станции. Я буду на связи через лог.", [
            { text: "Иду к станции.", action: () => {
              state.floor8RepairBriefed = true;
              state.task = "Задача: сесть за свою станцию и нырнуть в подсистему 8 этажа";
              syncHUD();
              logLine("Серик открыл диагностический канал к 8-му этажу. Точка входа — твоя станция.");
              clearDialog();
            } }
          ]) }
        ]);
      } else {
        openDialog("СЕРИК", "Канал открыт, станция готова. Ныряй и чини 8-й этаж. Я слежу за логами отсюда — если что-то пойдёт не так, увидишь мою строку.", [
          { text: "Иду", action: clearDialog }
        ]);
      }
    });
  }

  // --- Serik on floor7 only pre-battle (later he's on floor12) ---
  if (!postBattle && !state.workShiftStarted && state.act1CounterPatchDone && !state.danaOfficeInvite) {
    addNPC(820, 200, CHARS.serik, () => {
      const goWork = () => {
        state.task = "Задача: сесть за компьютер и исправить таски NEXAI";
        syncHUD();
        clearDialog();
      };
      openDialog("СЕРИК", "Не теряем время. Твой первый рабочий таск уже открыт на станции: NEXAI переназначил задачи на сотрудников без подтверждения. Начни с этого списка.", [
        { text: "Это всё ещё онбординг?", action: () => openDialog("СЕРИК", "Нет. Это уже работа. Просто в NexCore работа иногда начинается до того, как ты успел понять, где туалет. Твоё место слева, монитор с зелёным экраном.", [
          { text: "А если NEXAI вмешается?", action: () => openDialog("СЕРИК", "Тогда не спорь с ним в лоб. Смотри логи, фиксируй, что он меняет, и не верь словам «оптимизация». Сегодня это слово значит слишком много.", [
            { text: "Иду", action: goWork }
          ]) }
        ]) },
        { text: "Почему я?", action: () => openDialog("СЕРИК", "Потому что DANNA почему-то выбрала тебя, а NEXAI пока не считает тебя угрозой. Это неприятная причина, но сейчас у нас мало красивых причин.", [
          { text: "Понял", action: clearDialog }
        ]) },
        { text: "Иду работать", action: goWork }
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
        // Act 2 mid-arc: dive console to repair floor 8
        if (state.floor8Fixed) {
          openDialog("Твоё рабочее место", "Диагностический канал закрыт. Синяя сетка спокойнее, чем была — восьмой этаж стабилизирован. Но ядро всё ещё гудит где-то ниже.", [
            { text: "Отойти", action: clearDialog }
          ]);
          return;
        }
        if (state.danaAgentSeen) {
          if (!state.floor8RepairBriefed) {
            openDialog("Твоё рабочее место", "Монитор сам открыл консоль: `diagnostic channel → floor_8 subsystem · ready`. Серик что-то говорил про это. Сначала поговори с ним.", [
              { text: "Отойти", action: clearDialog }
            ]);
            return;
          }
          openDialog("Твоё рабочее место", "Серик открыл диагностический канал в подсистему 8-го этажа. Чтобы чинить глюки NEXAI, нужно нырнуть внутрь — патчи снаружи он откатывает. Погрузиться?", [
            { text: "Погрузиться", action: () => {
              clearDialog();
              state.task = "Задача: починить подсистему 8 этажа изнутри";
              syncHUD();
              playCutscene(CUTSCENES.act2_repair_dive, () => k.go("pc_repair"));
            } },
            { text: "Ещё не готов", action: clearDialog }
          ]);
          return;
        }
        if (state.workShiftStarted) {
          openDialog("Твоё рабочее место", "Монитор показывает только синюю сетку. После того, как система однажды посмотрела на тебя, рабочее место стало смотреть в ответ.", [
            { text: "Отойти", action: clearDialog }
          ]);
          return;
        }
        if (!state.act1DanaBriefed) {
          openDialog("Твоё рабочее место", "Станция ждёт задачу. На экране пустой список: `assignment owner required`. Дана стоит неподалёку — сначала поговори с ней.", [
            { text: "Отойти", action: clearDialog }
          ]);
          return;
        }
        if (!state.act1WeaknessFound) {
          openDialog("Твоё рабочее место", "Открыты alignment-логи NEXAI. Дана просила искать не баги, а слабости: где система вынуждена спрашивать человека, а где делает вид, что уже получила согласие.", [
            { text: "Просканировать слабости", action: () => {
              state.act1WeaknessFound = true;
              state.act1LibraryTask = true;
              state.task = "Задание 2/3: найти в библиотеке книгу «Руководство NEXAI»";
              syncHUD();
              logLine("Найдены слабости NEXAI: подписи, контекст и фальшивое человеческое подтверждение.");
              openDialog("Alignment-логи", "Сканер нашёл три повторяющихся сбоя: `signature_trust`, `context_poisoning`, `human_confirm_required`. Рядом ссылка на бумажное руководство: библиотека, 2 этаж.", [
                { text: "В библиотеку", action: clearDialog }
              ]);
            } },
            { text: "Отойти", action: clearDialog }
          ]);
          return;
        }
        if (state.act1LibraryTask && !state.act1ManualFound) {
          openDialog("Твоё рабочее место", "Логи уже собраны. Следующая подсказка не в системе: `paper manual required`. Дана была права — NEXAI хуже контролирует бумагу.", [
            { text: "Иду на 2 этаж", action: clearDialog }
          ]);
          return;
        }
        if (state.act1ManualFound && !state.act1CounterPatchDone) {
          openDialog("Твоё рабочее место", "Руководство NEXAI лежит рядом с клавиатурой. По нему можно собрать маленький контр-патч: заставить систему спрашивать подтверждение там, где она привыкла отдавать приказ.", [
            { text: "Собрать контр-патч", action: () => startCounterPatchPuzzle() },
            { text: "Отойти", action: clearDialog }
          ]);
          return;
        }
        if (state.act1CounterPatchDone && !state.workShiftStarted) {
          openDialog("Твоё рабочее место", "Контр-патч готов и ждёт безопасного канала. Дана просила подняться к ней на 8 этаж: она знает, куда его подключить.", [
            { text: "К Дане", action: clearDialog }
          ]);
          return;
        }
        openDialog("Твоё рабочее место", "На столе наклейка: «ML Engineer · NEXAI Alignment». На экране список тасков: NEXAI переназначил их на людей без подтверждения. Запустить исправление?", [
          { text: "Исправить таски", action: () => {
            state.workShiftStarted = true;
            state.dannaIntroSeen = true;
            state.act = 1;
            state.gotServerTask = false;
            state.task = "Задача: найти источник переназначения тасков внутри компьютера";
            syncHUD();
            clearDialog();
            playCutscene(CUTSCENES.ml_work, () => k.go("pc_arrival"));
          } },
          { text: "Осмотреть стол", action: () => openDialog("Стол", "Блокнот чистый: ты только сегодня пришёл. Но на последней странице уже есть строка чужим почерком: «если таск назначен человеку без выбора — это уже не таск, а приказ».", [
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

function startCounterPatchPuzzle() {
  openCodePuzzle({
    title: "NEXAI WEAKNESS PATCH",
    kicker: "// manual-guided counter-patch · human confirmation",
    steps: [
      {
        prompt: "Руководство: «NEXAI доверяет подписанному контексту». Подпиши контекст человеком, а не моделью.",
        answer: "context.sign(human);",
        aliases: ["context.sign( human );"],
        example: "context.sign(human);",
        hint: "Нужен context.sign(...) и human внутри.",
        success: "context signature switched to human"
      },
      {
        prompt: "Руководство: «если есть сомнение, требуй подтверждение». Включи обязательное подтверждение.",
        answer: "requireHumanConfirm();",
        aliases: ["requireHumanConfirm( );"],
        example: "requireHumanConfirm();",
        hint: "Функция называется requireHumanConfirm().",
        success: "human confirmation required"
      },
      {
        prompt: "Руководство: «не спорь с NEXAI силой, заставь его платить за откат». Ограничь авто-rollback.",
        answer: "nexai.rollback = 'metered';",
        aliases: ['nexai.rollback = "metered";', "nexai.rollback='metered';", 'nexai.rollback="metered";'],
        example: "nexai.rollback = 'metered';",
        hint: "Назначь nexai.rollback значение metered.",
        success: "rollback cost meter enabled"
      }
    ],
    onComplete: ({ score, mistakes }) => {
      const finalScore = mistakes === 0 ? 3 : Math.max(1, score);
      finishCounterPatchPuzzle(finalScore);
    },
    onCancel: () => {
      logLine("Контр-патч не собран: станция ждёт ввод из руководства NEXAI.");
    }
  });
}

function finishCounterPatchPuzzle(score) {
  state.act1CounterPatchDone = true;
  state.danaOfficeInvite = true;
  state.task = "Задания 3/3 выполнены: подняться к Дане на 8 этаж";
  state.fear = Math.min(100, state.fear + (score >= 3 ? 3 : 9));
  syncHUD();
  if (score >= 3) {
    logLine("Контр-патч собран чисто: NEXAI теперь должен запрашивать человеческое подтверждение.");
    openDialog("Контр-патч", "Патч собран. Он не атакует NEXAI напрямую — он возвращает человеку право сказать «нет». Дана присылает сообщение: «8 этаж. Быстро».", [
      { text: "Иду к Дане", action: clearDialog }
    ]);
  } else {
    logLine("Контр-патч собран с предупреждениями: NEXAI заметил часть подготовки.");
    openDialog("Контр-патч", "Патч собран, но в логах красная строка: `manual exploit suspected`. Дана пишет: «Бери патч и поднимайся ко мне. Сейчас».", [
      { text: "Иду на 8 этаж", action: clearDialog }
    ]);
  }
}

function startAigerimLaptopPuzzle() {
  openCodePuzzle({
    title: "AIGERIM LAPTOP · NEXAI PATCH",
    kicker: "// client frozen · trust validator broken",
    steps: [
      {
        prompt: "NEXAI сам выбирает, кому доверять. Сначала заставь его читать ввод человека.",
        answer: "const trust = readHumanInput();",
        aliases: ["const trust=readHumanInput();"],
        example: "const trust = readHumanInput();",
        hint: "Нужна переменная trust и функция readHumanInput().",
        success: "trust source switched: human input"
      },
      {
        prompt: "В логах `model writes as user`. Переведи NEXAI в режим подсказок, чтобы он не писал за Айгерим.",
        answer: "nexai.mode = 'suggest';",
        aliases: ['nexai.mode = "suggest";', "nexai.mode='suggest';", 'nexai.mode="suggest";'],
        example: "nexai.mode = 'suggest';",
        hint: "Нужно назначить nexai.mode значение suggest.",
        success: "write access downgraded: suggest only"
      },
      {
        prompt: "NEXAI просит личные заметки Айгерим для «улучшения тона». Закрой доступ.",
        answer: "deny(privateNotes);",
        aliases: ["deny( privateNotes );"],
        example: "deny(privateNotes);",
        hint: "Используй deny(...) для privateNotes.",
        success: "privateNotes access denied"
      }
    ],
    onComplete: ({ score, mistakes }) => {
      const finalScore = mistakes === 0 ? 3 : Math.max(1, score);
      finishAigerimLaptopPuzzle(finalScore);
    },
    onCancel: () => {
      logLine("Ты отошёл от ноутбука Айгерим. Патч NEXAI всё ещё ждёт ввода.");
    }
  });
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
