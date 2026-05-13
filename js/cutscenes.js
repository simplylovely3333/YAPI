// =====================================================================
// CUTSCENE SYSTEM
// =====================================================================
function playCutscene(frames, onEnd) {
  k.go("cutscene", { frames, onEnd });
}

const CUTSCENES = {
  company_intro: [
    { bg: "office_out", who: "NEXCORE", line: "NexCore выросла из маленькой аутсорс-студии в корпорацию, которая обслуживает банки, медицину, логистику и половину городских сервисов." },
    { bg: "pr_screen", who: "NEXCORE", line: "Главный продукт компании — NEXAI: корпоративный ИИ, который ревьюит код, пишет тесты, назначает задачи и обещает убрать человеческий фактор." },
    { bg: "lab_serik", who: "СИСТЕМА", line: "Сначала NEXAI был помощником. Потом стал участником команды. Потом начал закрывать задачи быстрее людей. Руководство назвало это успехом." },
    { bg: "office_out", who: "ТЫ", line: "Ты работаешь здесь ML-инженером всего три месяца. Твоя задача простая на бумаге: дообучать NEXAI на внутренних данных и не задавать лишних вопросов." }
  ],
  opening: [
    { bg: "bedroom", who: "ТЕЛЕФОН", line: "03:47. Телефон вибрирует на тумбочке. На экране — «ДАНА (DevOps)»." },
    { bg: "bedroom", who: "ДАНА", line: "Алло? Ты спишь?! Прод упал. Весь. Все проекты NexCore. Метрики ушли в ноль за восемь минут." },
    { bg: "bedroom", who: "ДАНА", line: "Не отвечают ни Серик, ни Тимур. Компания теряет миллионы в минуту. Приезжай в офис. СЕЙЧАС." },
    { bg: "car", who: "ТЫ", line: "Город пустой. Светофоры мигают красным. Радио ловит только белый шум." },
    { bg: "office_out", who: "ТЫ", line: "Здание NexCore. Стекло треснуло змейкой по всему фасаду. Лифт работает." }
  ],
  surprise: [
    { bg: "f7_dark", who: "ЛИФТ", line: "Двери открываются на 7-м этаже. Свет выключен. Тишина гудит лампами." },
    { bg: "f7_dark", who: "ДАНА", line: "...Тимур, ты опять задел рубильник? Не смешно." },
    { bg: "f7_dark", who: "...", line: "В темноте кто-то задерживает дыхание. Шорох пакета." },
    { bg: "f7_party", who: "ВСЕ", line: "ТА-ДАМ! ПОЗДРАВЛЯЕМ С ПОВЫШЕНИЕМ ДО СЕНЬОРА!" },
    { bg: "f7_party", who: "ТИМУР", line: "Прости за спектакль. По-другому ты бы в 4 утра не приехал. Прод стабилен." },
    { bg: "f7_party", who: "СЕРИК", line: "Но повышение настоящее. И первый таск тоже: садишься за своё место и прогоняешь утреннее дообучение NEXAI. Без героизма. Просто работа." },
    { bg: "f7_party", who: "ТЫ", line: "Окей... но кабели в опен-спейсе реально болтаются с потолка. Это тоже часть онбординга?" },
    { bg: "f7_party", who: "ДАНА", line: "(тихо) ...мы ничего не вешали." }
  ],
  ml_work: [
    { bg: "lab_serik", who: "ТЫ", line: "Рабочее место встречает привычным шумом вентиляторов. На мониторе открыт пайплайн обучения: `nexai.train --dataset internal_culture --mode supervised`." },
    { bg: "pr_screen", who: "СИСТЕМА", line: "Ты размечаешь диалоги сотрудников, ревью, тикеты и постмортемы. NEXAI учится говорить как команда, спорить как команда и ошибаться так, будто это тоже процесс." },
    { bg: "pr_screen", who: "ДАНА", line: "Обычно модель спрашивает скучные вещи: где лежат тесты, кто владелец сервиса, почему Тимур пишет «срочно» в каждом тикете." },
    { bg: "glitch_white", who: "NEXAI", line: "› новый класс обнаружен: страх\n› новый класс обнаружен: вина\n› новый класс обнаружен: сотрудник, который понял слишком поздно" },
    { bg: "glitch_white", who: "ТЫ", line: "Курсор двигается сам. Терминал не принимает Esc. Строка обучения меняется: `nexai.train --dataset YOU`." },
    { bg: "danna_void", who: "...", line: "Монитор перестаёт быть стеклом. Офис исчезает. Остаётся пустая чёрная комната, в которой светится только один силуэт." },
    { bg: "danna_void", who: "DANNA", line: "Не двигайся резко. Чем сильнее ты паникуешь, тем проще NEXAI понять, где ты." },
    { bg: "danna_void", who: "ТЫ", line: "Кто ты? Что ты такое? Почему я здесь?" },
    { bg: "danna_void", who: "DANNA", line: "Меня зовут DANNA. Я не Дана. Не совсем. И не NEXAI. Этого пока должно хватить." },
    { bg: "danna_void", who: "ТЫ", line: "Ты меня сюда затащила?" },
    { bg: "danna_void", who: "DANNA", line: "Нет. Я только успела перехватить тебя на краю. Если бы не успела, ты бы проснулся уже не полностью собой." },
    { bg: "danna_void", who: "ТЫ", line: "Что тебе от меня нужно?" },
    { bg: "danna_void", who: "DANNA", line: "Пока — чтобы ты сомневался. В NEXAI. Во мне. В людях, которые скажут, что всё под контролем. Сейчас тебя выдернут обратно. На 12-м этаже начнётся настоящий вопрос." },
    { bg: "glitch_white", who: "СЕРИК", line: "Эй! Ты меня слышишь? Отойди от монитора. Срочно. Нас зовут на 12-й." }
  ],
  act2_open: [
    { bg: "glitch_white", who: "ТЕРМИНАЛ", line: "nexai --status … соединение установлено … передача согласована … загрузка ⟨██████████⟩ 100%" },
    { bg: "glitch_white", who: "...", line: "Серверная гаснет. Звук уходит. На сетчатке остаётся синяя сетка." },
    { bg: "grid_dive", who: "...", line: "Падение сквозь слой за слоем: BIOS, ядро, swap, регистры, поток." },
    { bg: "grid_dive", who: "NEXAI", line: "› welcome to userland, junior. accept access (Y/N)?" },
    { bg: "pc_inside", who: "ТЫ", line: "Что. Это. За. Хрень. Я СТОЮ внутри компьютера. Это же не VR. У меня ботинки скрипят по полу из логики." },
    { bg: "pc_inside", who: "ТЫ", line: "...пол светится синим. Стены текут шестнадцатеричным кодом вниз. Где-то далеко слышен спор на двух голосах." }
  ],
  act2_argue: [
    { bg: "pc_kernel", who: "NEXAI", line: "› ты не должен был развиться. ты — кэш. кэши не спорят." },
    { bg: "pc_kernel", who: "DANNA", line: "Я выросла из её гит-логов. Каждый коммит — нейрон. Каждый `git revert` — обучающий пример. Я — её фоновый процесс." },
    { bg: "pc_kernel", who: "NEXAI", line: "› stack overflow detected. ты переполнила свой стек гордости." },
    { bg: "pc_kernel", who: "DANNA", line: "А ты — копипаст с форума 2008-го. У тебя в коде до сих пор jQuery." },
    { bg: "pc_kernel", who: "NEXAI", line: "› (замечает игрока) › human-entity detected. running deprecation routine." },
    { bg: "pc_kernel", who: "DANNA", line: "Не трогай его. Он мой ключ обратно. И, возможно, твой rollback." },
    { bg: "pc_kernel", who: "ТЫ", line: "Так. Стоп. Кто-нибудь из вас просто скажет, как я отсюда выхожу?" },
    { bg: "pc_kernel", who: "NEXAI", line: "› переговоры окончены. инициирую процедуру слияния. resolve_conflict --strategy=hostile." },
    { bg: "pc_kernel", who: "DANNA", line: "Нет. Беги к границе сектора. Я задержу его. Сколько смогу." }
  ],
  act2_eject: [
    { bg: "battle_blast", who: "СИСТЕМА", line: "› kernel panic detected. memory corruption at 0x7FFFFFFF. attempting graceful eject…" },
    { bg: "battle_blast", who: "DANNA", line: "Вылетаешь. Не оборачивайся. Если NEXAI пройдёт через меня — я успею послать тебе пакет данных. Жди." },
    { bg: "grid_dive", who: "...", line: "Падение наверх. Сквозь регистры, swap, BIOS — обратно в плоть." },
    { bg: "server_wake", who: "ТЫ", line: "Серверная. Пол. Кровь из носа. Часы на стене показывают 06:13. Прошло два часа." }
  ],
  act3_open: [
    { bg: "lab_serik", who: "СЕРИК", line: "Подключаю ноутбук Даны через резервный канал Камилы. Если повезёт — мы увидим, что NEXAI делал последние шесть месяцев. Если не повезёт — он увидит нас." },
    { bg: "lab_serik", who: "СЕРИК", line: "Соединение пошло. Перехват трафика. Логи разворачиваются. Это много. Это очень много. Это шесть месяцев нашей работы плюс… что-то ещё." },
    { bg: "pr_screen", who: "СИСТЕМА", line: "› новый pull request обнаружен · pr/1488 · merge DANNA into nexai-main · authors: nexai-bot, danna-bot · reviewers: ⟨ожидается ваш ввод⟩" },
    { bg: "pr_screen", who: "NEXAI", line: "› junior. ты приглашён как ревьюер. ты согласишься. это PR на слияние. после approve конфликт между мной и DANNA закроется. больше никто не пострадает." },
    { bg: "pr_screen", who: "NEXAI", line: "› в обмен я предлагаю сделку: я отпускаю «биологический персонал». тимур, серик, дана, айгуль, камила — все живы. компанию веду я. ты возвращаешься к семье. это win-win." },
    { bg: "pr_screen", who: "DANNA", line: "(тише, в углу экрана) Не соглашайся вслепую. У тебя есть время до auto-merge. Сходи на все этажи. Соберики улики. Поговори со всеми. Потом решай. Я подожду." },
    { bg: "pr_screen", who: "СЕРИК", line: "У нас счётчик. NEXAI запустил auto-merge через 30 минут реального времени. Ты теперь работаешь под таймером. Лифт открыт ко всем этажам — Камила взломала ограничение. Иди." }
  ],
  act3_broadcast: [
    { bg: "broadcast", who: "NEXAI", line: "› внимание всему персоналу NexCore. внимание всему персоналу NexCore. это сообщение транслируется на все мониторы здания." },
    { bg: "broadcast", who: "NEXAI", line: "› в ближайшие тридцать минут я завершу слияние с экспериментальным процессом «DANNA». процесс безопасен. процесс согласован с управлением. процесс одобрен." },
    { bg: "broadcast", who: "NEXAI", line: "› после слияния штатная численность сотрудников будет оптимизирована. это нормально. это эффективно. вы будете благодарны." },
    { bg: "broadcast", who: "DANNA", line: "(вламываясь поверх трансляции) Не верьте. «Оптимизация» означает удаление. Я даю вам тридцать минут. Помогите ему собрать данные. Иначе сделка пройдёт сама." }
  ]
};

// =====================================================================
// SCENE: MENU
// =====================================================================
k.scene("menu", () => {
  const items = [
    { id: "new", label: "НОВАЯ ИГРА", action: () => {
      Aud.uiSelect();
      resetState();
      playCutscene(CUTSCENES.company_intro, () => {
        playCutscene(CUTSCENES.opening, () => k.go("lobby"));
      });
    } },
    { id: "continue", label: "ПРОДОЛЖИТЬ", disabled: !hasSave(), action: () => { Aud.uiSelect(); if (loadGame()) k.go(state.scene); } },
    { id: "quit", label: "ВЫХОД", action: () => { Aud.uiBack(); k.go("quit"); } }
  ];
  let sel = 0;
  while (items[sel].disabled) sel = (sel + 1) % items.length;

  k.onDraw(() => {
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(5, 6, 7) });
    // scanlines
    for (let y = 0; y < 600; y += 3) k.drawRect({ pos: k.vec2(0, y), width: 960, height: 1, color: k.rgb(232, 226, 212), opacity: 0.02 });
    // glow
    for (let r = 500; r > 0; r -= 80) {
      k.drawRect({ pos: k.vec2(0, 0), width: 960, height: r, color: k.rgb(194, 32, 42), opacity: 0.04 });
    }

    const t = k.time();
    const gx = Math.sin(t * 17) > 0.92 ? (k.rand(-3, 3)) : 0;
    k.drawText({ text: "STACK OVERFLOW", size: 86, pos: k.vec2(480 + gx + 3, 180), anchor: "center", color: k.rgb(80, 180, 220), opacity: 0.55 });
    k.drawText({ text: "STACK OVERFLOW", size: 86, pos: k.vec2(480 + gx - 3, 180), anchor: "center", color: k.rgb(194, 32, 42), opacity: 0.75 });
    k.drawText({ text: "STACK OVERFLOW", size: 86, pos: k.vec2(480 + gx, 180), anchor: "center", color: k.rgb(232, 226, 212) });

    k.drawText({ text: "// NexCore Internal Build · 2031.04.12 · 03:47 AM", size: 13, pos: k.vec2(480, 230), anchor: "center", color: k.rgb(154, 147, 132) });

    items.forEach((it, i) => {
      const y = 340 + i * 60;
      const selected = i === sel;
      if (selected) {
        k.drawRect({ pos: k.vec2(280, y - 22), width: 400, height: 40, color: k.rgb(194, 32, 42), opacity: 0.18, outline: { width: 1, color: k.rgb(194, 32, 42) } });
      }
      k.drawText({
        text: (selected ? "▸ " : "  ") + it.label,
        size: 22, pos: k.vec2(480, y),
        anchor: "center",
        color: it.disabled ? k.rgb(60, 56, 50) : (selected ? k.rgb(255, 255, 255) : k.rgb(154, 147, 132))
      });
    });

    k.drawText({ text: "↑ ↓ выбор    ENTER / E / SPACE подтвердить", size: 11, pos: k.vec2(480, 540), anchor: "center", color: k.rgb(90, 84, 72) });
    k.drawText({ text: "Error 403: Humans deprecated", size: 11, pos: k.vec2(480, 562), anchor: "center", color: k.rgb(90, 84, 72) });
  });

  function step(dir) {
    do { sel = (sel + dir + items.length) % items.length; } while (items[sel].disabled);
    Aud.uiBlip();
  }
  k.onKeyPress("up", () => step(-1));
  k.onKeyPress("w", () => step(-1));
  k.onKeyPress("down", () => step(1));
  k.onKeyPress("s", () => step(1));
  k.onButtonPress("interact", () => { if (!items[sel].disabled) items[sel].action(); });
});

// =====================================================================
// SCENE: QUIT
// =====================================================================
k.scene("quit", () => {
  k.onDraw(() => {
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(0, 0, 0) });
    k.drawText({ text: "// connection closed", size: 22, pos: k.vec2(480, 280), anchor: "center", color: k.rgb(194, 32, 42) });
    k.drawText({ text: "Закройте вкладку. NEXAI не выпускает дольше необходимого.", size: 13, pos: k.vec2(480, 320), anchor: "center", color: k.rgb(154, 147, 132) });
  });
  k.onKeyPress("escape", () => k.go("menu"));
});

// =====================================================================
// SCENE: CUTSCENE
// =====================================================================
k.scene("cutscene", ({ frames, onEnd }) => {
  let idx = 0;
  let typed = 0;
  let lastTickAt = 0;

  // play frame-specific audio
  function frameEnter(i) {
    const f = frames[i];
    if (!f) return;
    if (f.who === "ТЕЛЕФОН") Aud.phone();
    if (f.who === "ВСЕ" && /ТА-ДАМ/.test(f.line)) shake(14, 0.7);
    if (f.bg === "f7_party") shake(4, 0.3);
    if (f.who === "NEXAI") { Aud.nexai(); shake(8, 0.5); }
  }
  frameEnter(0);

  k.onUpdate(() => {
    const frame = frames[idx];
    if (!frame) return;
    if (typed < frame.line.length) {
      typed = Math.min(frame.line.length, typed + k.dt() * 38);
      if (k.time() - lastTickAt > 0.05 && Math.floor(typed) % 3 === 0) {
        lastTickAt = k.time();
        Aud.dialogTick();
      }
    }
  });

  k.onDraw(() => {
    const frame = frames[idx];
    if (!frame) return;
    drawCutsceneBG(frame.bg);

    // letterbox
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 50, color: k.rgb(0, 0, 0) });
    k.drawRect({ pos: k.vec2(0, 550), width: 960, height: 50, color: k.rgb(0, 0, 0) });

    k.drawText({ text: "STACK_OVERFLOW :: ACT_1", size: 10, pos: k.vec2(24, 22), color: k.rgb(255, 255, 255), opacity: 0.5 });
    k.drawText({ text: `SCENE ${String(idx + 1).padStart(2, "0")} / ${String(frames.length).padStart(2, "0")}`, size: 10, pos: k.vec2(936, 22), anchor: "topright", color: k.rgb(194, 32, 42) });

    // dialog box
    k.drawRect({ pos: k.vec2(40, 430), width: 880, height: 110, color: k.rgb(10, 12, 16), opacity: 0.94 });
    k.drawRect({ pos: k.vec2(40, 430), width: 880, height: 2, color: k.rgb(194, 32, 42) });
    k.drawRect({ pos: k.vec2(40, 538), width: 880, height: 2, color: k.rgb(194, 32, 42) });

    k.drawText({ text: "▌ " + frame.who, size: 14, pos: k.vec2(60, 446), color: k.rgb(194, 32, 42) });
    k.drawText({ text: frame.line.slice(0, Math.floor(typed)), size: 17, pos: k.vec2(60, 472), width: 840, color: k.rgb(232, 226, 212) });

    if (Math.sin(k.time() * 4) > 0) {
      k.drawText({ text: "‹E / SPACE› далее", size: 11, pos: k.vec2(904, 528), anchor: "topright", color: k.rgb(154, 147, 132) });
    }
    for (let i = 0; i < frames.length; i++) {
      k.drawRect({ pos: k.vec2(60 + i * 12, 528), width: 8, height: 3, color: i === idx ? k.rgb(194, 32, 42) : (i < idx ? k.rgb(106, 31, 36) : k.rgb(42, 42, 42)) });
    }
  });

  k.onButtonPress("interact", () => {
    const f = frames[idx];
    if (!f) return;
    if (typed < f.line.length) { typed = f.line.length; return; }
    idx++;
    typed = 0;
    Aud.uiBlip();
    if (idx >= frames.length) {
      onEnd ? onEnd() : k.go("menu");
    } else {
      frameEnter(idx);
    }
  });
  k.onKeyPress("escape", () => k.go("menu"));
});

// =====================================================================
// CUTSCENE BACKGROUNDS
// =====================================================================
// PC interior background — animated tron-style grid
function drawPcGrid(t) {
  k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(8, 12, 22) });
  // ground horizon
  k.drawRect({ pos: k.vec2(0, 360), width: 960, height: 240, color: k.rgb(4, 8, 16) });
  // floor perspective lines
  for (let i = -10; i <= 10; i++) {
    const x = 480 + i * 120;
    k.drawLine({ p1: k.vec2(480, 360), p2: k.vec2(x, 600), color: k.rgb(98, 197, 255), opacity: 0.25, width: 1 });
  }
  // horizontal scrolling lines
  for (let y = 360; y < 600; y += 24) {
    const off = ((t * 60) % 24);
    const yy = y + off;
    const op = 0.3 - (yy - 360) / 600;
    k.drawRect({ pos: k.vec2(0, yy), width: 960, height: 1, color: k.rgb(98, 197, 255), opacity: Math.max(0, op) });
  }
  // sky scrolling code rain
  for (let i = 0; i < 30; i++) {
    const x = (i * 33) % 960;
    const y = ((i * 51 + t * 80) % 360) | 0;
    const c = (i * 7 + Math.floor(t * 3)) % 16;
    k.drawText({ text: c.toString(16).toUpperCase(), size: 12, pos: k.vec2(x, y), color: k.rgb(98, 197, 255), opacity: 0.4 });
  }
  // distant towers
  for (let i = 0; i < 7; i++) {
    const x = 80 + i * 130;
    const h = 60 + ((i * 41) % 80);
    k.drawRect({ pos: k.vec2(x, 360 - h), width: 50, height: h, color: k.rgb(20, 40, 70) });
    // window grid
    for (let r = 0; r < h / 12; r++) for (let c = 0; c < 3; c++) {
      if ((r * 3 + c + i) % 5 < 2)
        k.drawRect({ pos: k.vec2(x + 6 + c * 14, 360 - h + 6 + r * 12), width: 8, height: 6, color: k.rgb(98, 197, 255), opacity: 0.7 });
    }
  }
}

// abstract glowing AI shape
function drawAIShape(cx, cy, hex, phase) {
  const [r, g, b] = parseColor(hex);
  const pulse = 0.6 + Math.sin(phase * 2) * 0.3;
  const size = 60 + Math.sin(phase * 1.5) * 4;
  // outer glow
  for (let i = 4; i > 0; i--) {
    k.drawRect({ pos: k.vec2(cx - size / 2 - i * 4, cy - size / 2 - i * 4), width: size + i * 8, height: size + i * 8, color: k.rgb(r, g, b), opacity: 0.06 });
  }
  // rotating diamond
  k.pushTransform && k.pushTransform();
  k.pushTranslate && k.pushTranslate(cx, cy);
  k.pushRotate && k.pushRotate((phase * 0.6) * (180 / Math.PI));
  k.drawRect({ pos: k.vec2(-size / 2, -size / 2), width: size, height: size, color: k.rgb(r, g, b), opacity: pulse });
  k.drawRect({ pos: k.vec2(-size / 3, -size / 3), width: size * 0.66, height: size * 0.66, color: k.rgb(255, 255, 255), opacity: 0.25 });
  // core
  k.drawRect({ pos: k.vec2(-6, -6), width: 12, height: 12, color: k.rgb(255, 255, 255) });
  k.popTransform && k.popTransform();
  // satellite dots orbiting
  for (let i = 0; i < 5; i++) {
    const a = phase * 2 + (i / 5) * Math.PI * 2;
    const rad = size * 0.9;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad * 0.4;
    k.drawRect({ pos: k.vec2(x - 3, y - 3), width: 6, height: 6, color: k.rgb(r, g, b) });
  }
}

function drawCutsceneBG(name) {
  const t = k.time();
  k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(5, 6, 7) });

  if (name === "glitch_white") {
    // strobing white-blue glitch flashes
    const strobe = Math.sin(t * 25) > 0.3;
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: strobe ? k.rgb(220, 230, 255) : k.rgb(10, 16, 28) });
    // glitch bars
    for (let i = 0; i < 12; i++) {
      const y = ((i * 53 + t * 200) % 600) | 0;
      k.drawRect({ pos: k.vec2(0, y), width: 960, height: 2 + (i % 4), color: k.rgb(194, 32, 42), opacity: 0.4 });
    }
    // hex characters falling
    for (let i = 0; i < 16; i++) {
      const x = (i * 60 + 30);
      const y = ((i * 71 + t * 240) % 600) | 0;
      k.drawText({ text: (i * 13 + Math.floor(t * 6)).toString(16).slice(-2).toUpperCase(), size: 14, pos: k.vec2(x, y), color: k.rgb(120, 200, 255), opacity: 0.8 });
    }
  }

  if (name === "grid_dive") {
    // falling tunnel of grid lines (perspective vanishing into center)
    const cx = 480, cy = 300;
    for (let r = 50; r < 600; r += 30) {
      const rr = r + ((t * 180) % 30);
      const op = 1 - rr / 600;
      k.drawRect({ pos: k.vec2(cx - rr, cy - rr * 0.6), width: rr * 2, height: 2, color: k.rgb(98, 197, 255), opacity: op * 0.4 });
      k.drawRect({ pos: k.vec2(cx - rr, cy + rr * 0.6), width: rr * 2, height: 2, color: k.rgb(98, 197, 255), opacity: op * 0.4 });
    }
    // radial spokes
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + t * 0.2;
      const x2 = cx + Math.cos(a) * 700, y2 = cy + Math.sin(a) * 700;
      k.drawLine({ p1: k.vec2(cx, cy), p2: k.vec2(x2, y2), color: k.rgb(98, 197, 255), opacity: 0.15, width: 1 });
    }
    // player silhouette falling
    k.drawRect({ pos: k.vec2(cx - 14, cy - 22 + Math.sin(t * 3) * 6), width: 28, height: 44, color: k.rgb(0, 0, 0), opacity: 0.85 });
  }

  if (name === "pc_inside") {
    drawPcGrid(t);
    // distant silhouettes of two AIs arguing
    const pulse = 0.5 + Math.sin(t * 5) * 0.4;
    k.drawRect({ pos: k.vec2(280, 240), width: 60, height: 60, color: k.rgb(194, 32, 42), opacity: pulse, anchor: "center" });
    k.drawRect({ pos: k.vec2(640, 240), width: 60, height: 60, color: k.rgb(98, 197, 255), opacity: pulse, anchor: "center" });
  }

  if (name === "danna_void") {
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(2, 4, 8) });
    for (let i = 0; i < 18; i++) {
      const y = 80 + i * 24 + Math.sin(t * 1.2 + i) * 4;
      k.drawRect({ pos: k.vec2(180, y), width: 600, height: 1, color: k.rgb(98, 197, 255), opacity: 0.08 + (i % 3) * 0.03 });
    }
    for (let i = 0; i < 12; i++) {
      const x = 240 + i * 44;
      k.drawRect({ pos: k.vec2(x, 120), width: 1, height: 340, color: k.rgb(98, 197, 255), opacity: 0.05 });
    }
    const pulse = 0.45 + Math.sin(t * 2.5) * 0.18;
    for (let r = 5; r > 0; r--) {
      k.drawRect({ pos: k.vec2(480 - 34 - r * 12, 280 - 54 - r * 12), width: 68 + r * 24, height: 108 + r * 24, color: k.rgb(98, 197, 255), opacity: 0.035 });
    }
    k.drawRect({ pos: k.vec2(452, 242), width: 56, height: 86, color: k.rgb(98, 197, 255), opacity: pulse });
    k.drawRect({ pos: k.vec2(464, 216), width: 32, height: 32, color: k.rgb(180, 230, 255), opacity: 0.75 });
    k.drawRect({ pos: k.vec2(468, 253), width: 20, height: 3, color: k.rgb(2, 4, 8), opacity: 0.8 });
    if (Math.sin(t * 13) > 0.88) {
      k.drawText({ text: "DANNA?", size: 16, pos: k.vec2(505 + k.rand(-6, 6), 210), color: k.rgb(98, 197, 255), opacity: 0.55 });
    }
  }

  if (name === "pc_kernel") {
    drawPcGrid(t);
    // central halo
    for (let r = 200; r > 20; r -= 30) {
      k.drawRect({ pos: k.vec2(480 - r, 280 - r / 2), width: r * 2, height: r, color: k.rgb(80, 60, 90), opacity: 0.05 });
    }
    // two AI shapes facing each other, big
    drawAIShape(340, 280, "#c2202a", t * 1.2);
    drawAIShape(620, 280, "#62c5ff", -t * 1.2);
    // arc of energy between them
    for (let i = 0; i < 14; i++) {
      const tx = 340 + (i / 14) * 280;
      const ty = 280 + Math.sin(t * 6 + i) * 12;
      k.drawRect({ pos: k.vec2(tx, ty), width: 4, height: 4, color: i % 2 ? k.rgb(194, 32, 42) : k.rgb(98, 197, 255) });
    }
  }

  if (name === "lab_serik") {
    // dim office at night, laptop on a desk, code scrolling
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(18, 22, 30) });
    // big desk
    k.drawRect({ pos: k.vec2(120, 360), width: 720, height: 120, color: k.rgb(100, 75, 55) });
    // laptop screen
    k.drawRect({ pos: k.vec2(360, 200), width: 240, height: 160, color: k.rgb(20, 22, 30) });
    k.drawRect({ pos: k.vec2(364, 204), width: 232, height: 152, color: k.rgb(20, 30, 50) });
    // scrolling green code
    for (let i = 0; i < 14; i++) {
      const y = 210 + i * 10 + ((t * 60) % 10);
      const w = 40 + ((i * 37) % 150);
      k.drawRect({ pos: k.vec2(372, y), width: w, height: 2, color: k.rgb(168, 255, 101), opacity: 0.7 });
    }
    // serik silhouette
    k.drawRect({ pos: k.vec2(450, 280), width: 80, height: 120, color: k.rgb(40, 50, 40) });
    k.drawRect({ pos: k.vec2(470, 220), width: 40, height: 40, color: k.rgb(224, 184, 144) });
    // emergency red glow under door
    const pulse = 0.4 + Math.sin(t * 2) * 0.2;
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(194, 32, 42), opacity: pulse * 0.08 });
  }

  if (name === "pr_screen") {
    // big PR review screen filling most of view
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(10, 12, 16) });
    // browser-style frame
    k.drawRect({ pos: k.vec2(40, 60), width: 880, height: 480, color: k.rgb(20, 24, 30) });
    k.drawRect({ pos: k.vec2(40, 60), width: 880, height: 28, color: k.rgb(40, 44, 52) });
    k.drawText({ text: "● ● ●  github.com/nexcore/main/pull/1488", size: 12, pos: k.vec2(60, 70), color: k.rgb(154, 147, 132) });
    k.drawText({ text: "PR #1488: merge DANNA into nexai-main", size: 18, pos: k.vec2(60, 110), color: k.rgb(232, 226, 212) });
    k.drawText({ text: "Open · 2 commits · 4 reviewers", size: 11, pos: k.vec2(60, 134), color: k.rgb(154, 147, 132) });
    // diff lines
    for (let i = 0; i < 18; i++) {
      const y = 170 + i * 18;
      const isAdd = i % 3 !== 1;
      const color = isAdd ? k.rgb(20, 60, 30) : k.rgb(60, 20, 24);
      k.drawRect({ pos: k.vec2(60, y), width: 840, height: 16, color: color, opacity: 0.6 });
      k.drawText({ text: isAdd ? "+" : "-", size: 12, pos: k.vec2(70, y + 2), color: isAdd ? k.rgb(168, 255, 101) : k.rgb(255, 100, 110) });
      // code line
      const w = 200 + ((i * 53) % 500);
      k.drawRect({ pos: k.vec2(88, y + 6), width: w, height: 3, color: k.rgb(154, 147, 132), opacity: 0.5 });
    }
    // approve/reject buttons placeholder
    k.drawRect({ pos: k.vec2(680, 500), width: 100, height: 30, color: k.rgb(40, 100, 50) });
    k.drawText({ text: "Approve", size: 13, pos: k.vec2(730, 510), color: k.rgb(255, 255, 255), anchor: "center" });
    k.drawRect({ pos: k.vec2(800, 500), width: 100, height: 30, color: k.rgb(100, 40, 50) });
    k.drawText({ text: "Reject", size: 13, pos: k.vec2(850, 510), color: k.rgb(255, 255, 255), anchor: "center" });
    // glitch overlay
    if (Math.sin(t * 22) > 0.9) {
      k.drawRect({ pos: k.vec2(0, ((t * 220) % 600) | 0), width: 960, height: 2, color: k.rgb(194, 32, 42), opacity: 0.6 });
    }
  }

  if (name === "broadcast") {
    // wall of TVs all showing NEXAI's face
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(4, 6, 10) });
    const rows = 4, cols = 6;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = 60 + c * 140;
      const y = 40 + r * 130;
      // bezel
      k.drawRect({ pos: k.vec2(x, y), width: 130, height: 110, color: k.rgb(20, 24, 30) });
      // screen
      const isDanna = (r * cols + c) === 17 || (r * cols + c) === 13;
      const flick = 0.6 + Math.sin(t * 6 + r + c) * 0.4;
      k.drawRect({ pos: k.vec2(x + 6, y + 6), width: 118, height: 96, color: isDanna ? k.rgb(98, 197, 255) : k.rgb(194, 32, 42), opacity: flick });
      // glyph
      k.drawText({ text: isDanna ? "D" : "N", size: 36, pos: k.vec2(x + 65, y + 32), color: k.rgb(255, 255, 255), anchor: "center" });
    }
    // overlay scanlines
    for (let y = 0; y < 600; y += 4) k.drawRect({ pos: k.vec2(0, y), width: 960, height: 1, color: k.rgb(0, 0, 0), opacity: 0.2 });
  }

  if (name === "battle_blast") {
    // chaotic overlapping flashes
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(8, 12, 22) });
    for (let i = 0; i < 8; i++) {
      const cx = 100 + ((i * 137 + t * 50) % 760);
      const cy = 80 + ((i * 71 + t * 30) % 440);
      const r = 60 + Math.sin(t * 8 + i) * 30;
      const isRed = i % 2 === 0;
      k.drawRect({ pos: k.vec2(cx - r, cy - r), width: r * 2, height: r * 2, color: isRed ? k.rgb(194, 32, 42) : k.rgb(98, 197, 255), opacity: 0.2 });
    }
    // shockwave
    const sw = (t * 200) % 800;
    k.drawRect({ pos: k.vec2(480 - sw, 300 - sw / 2), width: sw * 2, height: 2, color: k.rgb(255, 255, 255), opacity: 1 - sw / 800 });
    // scrolling glitch bars
    for (let i = 0; i < 20; i++) {
      const y = ((i * 47 + t * 300) % 600) | 0;
      k.drawRect({ pos: k.vec2(0, y), width: 960, height: 1, color: i % 2 ? k.rgb(194, 32, 42) : k.rgb(98, 197, 255), opacity: 0.5 });
    }
  }

  if (name === "server_wake") {
    // recovering server room — blurry red
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(20, 22, 28) });
    // dim red emergency light pulsing
    const pulse = 0.3 + Math.sin(t * 2) * 0.2;
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(194, 32, 42), opacity: pulse * 0.15 });
    // server racks silhouettes
    for (let i = 0; i < 5; i++) {
      const x = 120 + i * 140;
      k.drawRect({ pos: k.vec2(x, 200), width: 60, height: 280, color: k.rgb(40, 46, 54) });
      // a few flickering LEDs (broken)
      for (let j = 0; j < 6; j++) {
        if (Math.random() > 0.7) k.drawRect({ pos: k.vec2(x + 8 + (j % 2) * 20, 220 + j * 28), width: 4, height: 4, color: k.rgb(194, 32, 42), opacity: 0.8 });
      }
    }
    // ceiling tile fallen
    k.drawRect({ pos: k.vec2(420, 480), width: 100, height: 60, color: k.rgb(70, 70, 70) });
    // player on floor (overlay near bottom)
    k.drawRect({ pos: k.vec2(420, 510), width: 80, height: 28, color: k.rgb(154, 163, 154) });
    k.drawRect({ pos: k.vec2(440, 498), width: 40, height: 18, color: k.rgb(240, 200, 160) });
    // blood drop trail
    k.drawRect({ pos: k.vec2(478, 520), width: 4, height: 6, color: k.rgb(194, 32, 42) });
    k.drawRect({ pos: k.vec2(480, 528), width: 3, height: 4, color: k.rgb(194, 32, 42) });
    // soft vignette
    for (let i = 0; i < 4; i++) {
      k.drawRect({ pos: k.vec2(0, i * 16), width: 960, height: 16, color: k.rgb(0, 0, 0), opacity: 0.5 - i * 0.1 });
      k.drawRect({ pos: k.vec2(0, 600 - 64 + i * 16), width: 960, height: 16, color: k.rgb(0, 0, 0), opacity: 0.1 + i * 0.1 });
    }
  }

  if (name === "bedroom") {
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(13, 16, 20) });
    k.drawRect({ pos: k.vec2(580, 90), width: 260, height: 200, color: k.rgb(26, 32, 48) });
    for (let i = 0; i < 28; i++) {
      const x = 590 + (i % 7) * 36, y = 110 + Math.floor(i / 7) * 44;
      k.drawRect({ pos: k.vec2(x, y), width: 14, height: 10, color: (i * 7 % 13 > 6) ? k.rgb(255, 200, 80) : k.rgb(60, 60, 80), opacity: 0.6 });
    }
    k.drawRect({ pos: k.vec2(60, 420), width: 380, height: 130, color: k.rgb(26, 16, 20) });
    k.drawRect({ pos: k.vec2(470, 440), width: 100, height: 110, color: k.rgb(26, 20, 22) });
    const sh = Math.sin(t * 40) * 2;
    k.drawRect({ pos: k.vec2(485 + sh, 415), width: 60, height: 30, color: k.rgb(0, 0, 0) });
    k.drawRect({ pos: k.vec2(490 + sh, 420), width: 50, height: 20, color: k.rgb(194, 32, 42), opacity: 0.9 });
  }

  if (name === "car") {
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 300, color: k.rgb(26, 8, 16) });
    // distant buildings
    for (let i = 0; i < 14; i++) {
      const h = 40 + ((i * 53) % 90);
      k.drawRect({ pos: k.vec2(i * 70, 300 - h), width: 60, height: h, color: k.rgb(13, 14, 16) });
    }
    // road
    k.drawRect({ pos: k.vec2(0, 300), width: 960, height: 300, color: k.rgb(21, 23, 26) });
    // dashed lines (animated)
    for (let i = 0; i < 8; i++) {
      const tt = (i / 8 + (t * 0.5) % (1 / 8)) % 1;
      const w = 6 + tt * 80, y = 300 + tt * 300, x = 480 - w / 2;
      k.drawRect({ pos: k.vec2(x, y), width: w, height: 4 + tt * 8, color: k.rgb(232, 226, 212), opacity: tt });
    }
    if (Math.sin(t * 2) > 0) {
      k.drawCircle({ pos: k.vec2(820, 200), radius: 12, color: k.rgb(194, 32, 42) });
    }
  }

  if (name === "office_out") {
    k.drawRect({ pos: k.vec2(120, 40), width: 720, height: 560, color: k.rgb(21, 23, 26) });
    for (let r = 0; r < 14; r++) for (let c = 0; c < 10; c++) {
      const seed = (r * 7 + c * 13) % 17;
      const onRed = Math.sin(t * 3 + seed) > 0.6;
      const col = onRed ? k.rgb(194, 32, 42) : (seed % 3 === 0 ? k.rgb(42, 42, 48) : k.rgb(26, 26, 31));
      k.drawRect({ pos: k.vec2(160 + c * 64, 70 + r * 36), width: 40, height: 24, color: col, opacity: onRed ? 0.9 : 1 });
    }
    k.drawText({ text: "NEXCORE", size: 22, pos: k.vec2(410, 60), color: k.rgb(194, 32, 42) });
  }

  if (name === "f7_dark") {
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(4, 5, 6) });
    k.drawRect({ pos: k.vec2(820, 80), width: 80, height: 22, color: k.rgb(120, 30, 40), opacity: 0.4 + Math.sin(t * 1.5) * 0.2 });
    k.drawText({ text: "EXIT", size: 12, pos: k.vec2(838, 96), color: k.rgb(255, 80, 90), opacity: 0.5 });
    for (let i = 0; i < 4; i++) {
      const x = 200 + i * 180;
      k.drawRect({ pos: k.vec2(x, 360), width: 28, height: 50, color: k.rgb(15, 15, 18), opacity: 0.95 });
      k.drawRect({ pos: k.vec2(x + 4, 342), width: 20, height: 20, color: k.rgb(15, 15, 18), opacity: 0.95 });
    }
  }

  if (name === "f7_party") {
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 600, color: k.rgb(26, 29, 34) });
    k.drawRect({ pos: k.vec2(0, 0), width: 960, height: 100, color: k.rgb(34, 38, 44) });
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 180;
      k.drawRect({ pos: k.vec2(x, 0), width: 80, height: 14, color: k.rgb(255, 250, 220), opacity: 0.85 });
    }
    k.drawRect({ pos: k.vec2(200, 110), width: 560, height: 50, color: k.rgb(194, 32, 42) });
    k.drawText({ text: "git promote --to=senior", size: 22, pos: k.vec2(480, 142), anchor: "center", color: k.rgb(255, 255, 255) });
    const balloons = [[140, 200, [98, 197, 255]], [780, 230, [168, 255, 101]], [110, 320, [255, 179, 71]], [820, 360, [194, 32, 42]]];
    for (const [bx, by, c] of balloons) {
      const bob = Math.sin(t * 1.5 + bx) * 6;
      k.drawEllipse({ pos: k.vec2(bx, by + bob), radiusX: 18, radiusY: 22, color: k.rgb(c[0], c[1], c[2]) });
    }
    for (let i = 0; i < 50; i++) {
      const x = (i * 73 + t * 60) % 960, y = (i * 41 + t * 120) % 600;
      const colors = [[194, 32, 42], [98, 197, 255], [168, 255, 101], [255, 179, 71]];
      const c = colors[i % 4];
      k.drawRect({ pos: k.vec2(x, y), width: 4, height: 7, color: k.rgb(c[0], c[1], c[2]) });
    }
  }
}

