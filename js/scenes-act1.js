// =====================================================================
// ACT 0 — SCENE: INTERVIEW (собеседование у HR Айгерим)
// =====================================================================
k.scene("interview", () => {
  state.scene = "interview";
  state.act = 0;
  state.task = "Задача: пройти собеседование (подойди к Айгерим — E)";
  syncHUD();

  roomFloor([52, 56, 64, 60, 64, 74]);
  wallsBorder();

  k.add([k.text("NEXCORE · HR · ПЕРЕГОВОРНАЯ 1", { size: 11 }), k.color(232, 226, 212), k.opacity(0.7), k.pos(40, 40)]);
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

  let beat = 0;
  // Long interview. Two beat types:
  //   say: { say: "..." }                          — Aigerim explains, player clicks "Дальше"
  //   ask: { ask: "...", answers: [...], reply:"" } — player picks an answer, NEXAI reacts
  // Every answer works — это и есть шутка про "тупую" игру: тебя берут несмотря ни на что.
  const beats = [
    { say: "Здравствуйте! Садитесь, пожалуйста. Меня зовут Айгерим, я рекрутер NexCore. Спасибо, что откликнулись... хотя, честно говоря, у нас сейчас откликается мало кто. Это уже подозрительно, но не будем о грустном." },
    { say: "Сначала коротко о компании. NexCore — большая IT-корпорация. Мы делаем софт для банков, больниц, городского транспорта. Если вы сегодня доехали до нас на метро — половину этого метро обслуживаем мы." },
    { ask: "Расскажите про ваш опыт работы. Любой. Совсем любой.", answers: [
        "Я один раз починил Wi-Fi дома. Выключил и включил роутер.",
        "Опыта нет. Но я очень уверенно делаю вид, что он есть.",
        "А «опыт» — это как? Можно пример?"
      ], reply: "NEXAI записал: «кандидат честен про отсутствие навыков». Это, представьте себе, редкость. Большинство врёт. Идём дальше." },
    { say: "Теперь про вашу будущую должность. Вы будете работать с NEXAI. NEXAI — это наш корпоративный искусственный интеллект. Он помогает программистам: проверяет их работу, пишет тесты, раздаёт задачи." },
    { say: "Изначально NEXAI был просто помощником. Потом стал... ну, полноправным членом команды. Сейчас он закрывает задачи быстрее людей. Руководство называет это успехом. Я называю это «поводом задавать вопросы», но меня никто не спрашивает." },
    { ask: "Скажите честно — вы доверяете искусственному интеллекту?", answers: [
        "Я не доверяю даже автоответчику в банке. Так что нет.",
        "Доверяю. У меня просто нет сил не доверять.",
        "А у меня есть выбор? Вроде нет. Тогда — да."
      ], reply: "NEXAI отметил ваш ответ как «здоровый скепсис». И — внимание — добавил его в плюсы. ИИ, которому нравится, когда ему не доверяют. Я работаю здесь три года и всё ещё не привыкла." },
    { say: "Про здание. NexCore занимает башню целиком. 1 этаж — холл и ресепшн. 7 этаж — отдел разработки, там вы и будете сидеть. 8 этаж — работа с клиентами. 12 этаж — серверная, туда обычно не пускают. Лифт сам подскажет, куда можно." },
    { ask: "Кем вы видите себя в этой компании через пять лет?", answers: [
        "На этом же стуле. Но чтобы платили больше и кресло было мягче.",
        "Через пять лет? Я не уверен, что доживу до обеденного перерыва.",
        "Хочу дорасти до человека, который понимает, что здесь происходит."
      ], reply: "NEXAI: «реалистичные ожидания». Знаете, тот, кто отвечает «хочу стать руководителем отдела», у нас не задерживается. А вы — может быть." },
    { say: "Команда, с которой вы будете работать. Серик — старший разработчик, ваш непосредственный руководитель. Строгий, но честный. Тимур — менеджер проекта, отвечает за сроки и панику. Дана — DevOps, она знает про систему больше всех, включая то, чего знать не должна." },
    { ask: "Назовите вашу слабую сторону. Только не «я перфекционист».", answers: [
        "Я не понимаю, что происходит. Примерно всё время.",
        "Я честно отвечаю на вопрос про слабые стороны. Вот, прямо сейчас.",
        "Я слишком сильный. Шучу. Слабых сторон много, времени мало."
      ], reply: "NEXAI: «искренность — ресурс, который компания тратит быстрее всего». Я не до конца поняла, что он имел в виду. И, кажется, не хочу понимать." },
    { say: "По условиям. Зарплата — выше рынка. Питание — бесплатное, столовая на 8-м. Переработки — «не приветствуются, но случаются». Медицинская страховка — есть. Психологическая поддержка — есть, но её ведёт NEXAI, так что... есть." },
    { ask: "Последний вопрос. Почему именно NexCore?", answers: [
        "В вакансии было написано «опыт не важен». Это была любовь с первой строки.",
        "Вы — первые, кто меня вообще одобрил. Я человек благодарный.",
        "Если совсем честно — я просто нажал не на ту кнопку в метро."
      ], reply: "NEXAI: «кандидат не врёт. брать». Знаете, обычно он анализирует ответы полчаса. Вас он одобрил на третьем слове. Не знаю, комплимент это или диагноз." }
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
        text: a,
        action: () => {
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
    shirt: "#a892c2", pants: "#1a1a26", accent: "#ffffff", name: "Айгерим (HR)"
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
      openDialog("СЕРИК", "Сначала к Дане на 8-й. Она покажет NEXAI вживую. Вернёшься после этого — закроем первый день.", [
        { text: "Иду к лифту", action: clearDialog }
      ]);
      return;
    }
    // tour complete — wrap up Act 0
    openDialog("СЕРИК", "Со всеми познакомился? Хорошо. Тогда коротко итог: ты в IT-компании, рядом работает мощный ИИ, команда нормальная, кофе бесплатный. На бумаге — идеальная работа.", [
      { text: "А не на бумаге?", action: () => openDialog("СЕРИК", "А не на бумаге... знаешь, я работаю здесь дольше всех. И последние месяцы у меня ощущение, что NEXAI стал не помогать нам, а — наблюдать за нами. Но это, наверное, просто усталость. Иди домой, отдохни. Завтра — первый настоящий рабочий день.", [
        { text: "До завтра", action: () => { finishAct0(); } }
      ]) },
      { text: "Спасибо за день", action: () => openDialog("СЕРИК", "Не за что. Иди домой, выспись. Завтра начнётся настоящая работа — и, кажется, она будет непростой. У меня предчувствие. А мои предчувствия, к сожалению, обычно сбываются.", [
        { text: "До завтра", action: () => { finishAct0(); } }
      ]) }
    ]);
  });

  function finishAct0() {
    state.act0Done = true;
    state.act = 1;
    syncHUD();
    clearDialog();
    logLine("Первый рабочий день окончен. Акт 0 пройден.");
    // hand off cleanly to Act 1 (its original entry chain — не трогаем сам Акт 1)
    playCutscene(CUTSCENES.company_intro, () => {
      playCutscene(CUTSCENES.opening, () => k.go("lobby"));
    });
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
          { text: "Спасибо, Бакыт", action: () => { state.fd7Nexai = true; refreshTask(); logLine("Бакыт рассказал, кто такой NEXAI."); clearDialog(); } }
        ]) }
      ]) },
      { text: "А он опасный?", action: () => openDialog("Бакыт", "Опасный? Да нет... он же просто инструмент. Молоток не опасный. Просто... иногда я открываю свой код утром, а там уже всё переписано. Аккуратно. Лучше, чем у меня. И подпись — моя. Хотя я этого не писал. Ладно, забудь, я не выспался.", [
        { text: "...понял", action: () => { state.fd7Nexai = true; refreshTask(); logLine("Бакыт рассказал, кто такой NEXAI."); clearDialog(); } }
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
          { text: "Запомнил, спасибо", action: () => { state.fd7Floors = true; refreshTask(); logLine("Маржан показала здание и объяснила управление."); clearDialog(); } }
        ]) }
      ]) },
      { text: "А что наверху и внизу?", action: () => openDialog("Маржан", "Наверху — начальство и крыша. Внизу — подвал с серверами. Между ними — мы. Классическая корпорация: важные люди сверху, важные машины снизу, а посередине те, кто реально работает. Лифт всё покажет. Иди дальше знакомиться.", [
        { text: "Понял", action: () => { state.fd7Floors = true; refreshTask(); logLine("Маржан показала здание и объяснила управление."); clearDialog(); } }
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
          { text: "Спасибо, Алия", action: () => { state.fd7Team = true; refreshTask(); logLine("Алия рассказала про команду — и про то, что люди стали уходить."); clearDialog(); } }
        ]) }
      ]) },
      { text: "Тут безопасно работать?", action: () => openDialog("Алия", "Физически — конечно. Кресла удобные, кофе бесплатный, охрана на входе. Просто... в последнее время у меня странное чувство. Будто компания — это уже не совсем мы. Но это, наверное, осенняя хандра. Иди к Серику, ты со всеми поговорил.", [
        { text: "Понял", action: () => { state.fd7Team = true; refreshTask(); logLine("Алия рассказала про команду — и про то, что люди стали уходить."); clearDialog(); } }
      ]) }
    ]);
  });

  // ambient: a couple of background workers
  addCrowdWalker([{x:80,y:320},{x:880,y:320}], 70, CHARS.teamlead);
  addCrowdTyper(640, 200, CHARS.erzhan);
  addCrowdWalker([{x:120,y:150},{x:240,y:150},{x:240,y:260},{x:120,y:260}], 28, CHARS.intern);
  addCrowdWalker([{x:820,y:150},{x:720,y:150},{x:720,y:260},{x:820,y:260}], 26, CHARS.qa);
  addCrowdTyper(390, 380, CHARS.manager);

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
    scene: "floor2_tour", floor: 2, title: "SUPPORT · INCIDENT DESK",
    palette: [44, 50, 62, 54, 62, 76], accent: [98, 197, 255], npc: CHARS.support,
    npcName: "Мадина (Support)",
    npcLine: "Второй этаж ловит всё, что клиенты называют «оно само». Мы превращаем панику в тикеты, тикеты — в приоритеты, а приоритеты — в ночные звонки разработчикам.",
    detail: "На стене висит карта инцидентов. Большинство зелёные. Один красный помечен странно: `human tone mismatch`.",
    prop: "INCIDENTS\nP1 P2 P3"
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

  exitDoor(866, 520, 50, 40, "ЛИФТ", "elevator");
  const p = makePlayer(120, 500);
  p.face = "up";
  setupPlayerControls(p);
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
  state.task = "Задача: дойти с Даной до лифта";
  syncHUD();
  Aud.phone();
  logLine("Звонок от Серика: «Если Дана закончила демо, возвращайтесь на 7-й. Закроем онбординг».");
  openDialog("Телефон · Серик", "Если Дана закончила демо NEXAI, возвращайтесь на 7-й. И да, иди с ней до лифта. В первый день лучше не теряться.", [
    { text: "Понял", action: () => openDialog("ДАНА", "Пойдём. Я провожу до лифта. После такого демо люди обычно начинают слишком внимательно смотреть на мониторы.", [
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
  openDialog("ДАНА", "Серик уже звонил. Идём к лифту, я провожу. Потом он, скорее всего, сделает вид, что всё это обычный первый день.", [
    { text: "К лифту", action: clearDialog }
  ]);
}

// =====================================================================
// SCENE: LOBBY (1 этаж)
// =====================================================================
k.scene("lobby", () => {
  state.scene = "lobby";
  syncHUD();
  const postBattle = state.sawAftermath;
  state.task = state.act === 0
    ? (state.interviewDone ? "Задача: подняться на 7 этаж" : state.act0ReceptionDone ? "Задача: войти в переговорную HR" : "Задача: подойти к ресепшену")
    : postBattle
    ? "Акт 2: офис в панике — поговори с людьми"
    : (state.metDana ? "Задача: к лифту" : "Задача: найти Дану");
  syncHUD();

  roomFloor(postBattle ? [30, 16, 18, 38, 22, 24] : [42, 51, 64, 50, 61, 77]);
  wallsBorder();
  wall(380, 200, 220, 70, [120, 90, 60]);
  k.add([k.text("РЕСЕПШН", { size: 11 }), k.color(232, 226, 212), k.pos(420, 220)]);
  if (state.act === 0 && state.act0ReceptionDone && !state.interviewDone) {
    exitDoor(640, 190, 120, 38, "HR", "interview");
    k.add([k.text("ПЕРЕГОВОРНАЯ HR", { size: 9 }), k.color(232, 226, 212), k.opacity(0.75), k.pos(640, 170)]);
    addCrowdWalker([{ x: 490, y: 285 }, { x: 690, y: 245 }], 34, CHARS.receptionist);
  }

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
      if (state.act === 0 && !state.act0ReceptionDone) {
        openDialog("РЕСЕПШН", "Добро пожаловать в NexCore. Вы на собеседование? Система уже отметила ваш вход, хотя бейдж я вам ещё не выдала. Это... нормально. Наверное.", [
          { text: "Да, на собеседование", action: () => openDialog("РЕСЕПШН", "Вас ждёт Айгерим из HR. Я провожу вас в переговорную: первый день в этой компании лучше начинать не с самостоятельного блуждания по лифтам.", [
            { text: "Спасибо, идём", action: () => {
              state.act0ReceptionDone = true;
              state.task = "Задача: пройти собеседование у Айгерим";
              syncHUD();
              logLine("Ресепшн открыла переговорную HR и пошла впереди, чтобы провести тебя к Айгерим.");
              clearDialog();
            } }
          ]) },
          { text: "Почему система уже знает?", action: () => openDialog("РЕСЕПШН", "У нас NEXAI помогает с безопасностью, расписанием, доступами и... иногда с интуицией. Не переживайте. На собеседовании Айгерим объяснит лучше меня.", [
            { text: "Ладно, проводите", action: () => {
              state.act0ReceptionDone = true;
              state.task = "Задача: пройти собеседование у Айгерим";
              syncHUD();
              logLine("Ресепшн открыла переговорную HR и пошла впереди, чтобы провести тебя к Айгерим.");
              clearDialog();
            } }
          ]) }
        ]);
        return;
      }
      if (state.act === 0) {
        openDialog("РЕСЕПШН", "Айгерим уже ждёт в переговорной. Я открыла вам проход — не заставляйте HR думать, что лифт вас съел.", [
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

  if (state.act === 0 && state.act0ReceptionDone && !state.interviewDone) {
    addNPC(690, 245, CHARS.receptionist, () => {
      openDialog("РЕСЕПШН", "Вот переговорная HR. Айгерим внутри. Заходите, я подожду у ресепшна — если лифт начнёт давать советы до собеседования, не слушайте.", [
        { text: "Спасибо", action: clearDialog }
      ]);
    });
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

  if (state.surpriseDone) {
    exitDoor(866, 520, 50, 40, "1", "lobby");
  }

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
        openDialog("Панель лифта", "› доступ к лифту временно ограничен\n› сначала пройдите собеседование у Айгерим\n› переговорная HR открыта на 1 этаже", [
          { text: "Вернуться в холл", action: clearDialog }
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
      ? "› режим онбординга · доступны этажи 1–11 · 12 этаж закрыт"
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
            { text: "Понял", action: () => { state.task = "Задача: опроси Серика (12), HR (3), комнату отдыха (10)"; syncHUD(); clearDialog(); } }
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
