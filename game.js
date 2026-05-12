const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const taskEl = document.querySelector("#task");
const badgeEl = document.querySelector("#badge");
const fearEl = document.querySelector("#fear");
const coffeeEl = document.querySelector("#coffee");
const inventoryEl = document.querySelector("#inventory");
const logEl = document.querySelector("#log");
const dialogueEl = document.querySelector("#dialogue");
const speakerEl = document.querySelector("#speaker");
const lineEl = document.querySelector("#line");
const choicesEl = document.querySelector("#choices");

const TILE = 48;
const SAVE_KEY = "nul-office-act-1-save";
const keys = new Set();
let last = performance.now();
let dialogue = null;
let ending = null;

const desks = [
  rect(92, 374, 84, 46, "desk-a"),
  rect(206, 176, 86, 52, "desk-b"),
  rect(367, 392, 72, 54, "desk-c"),
  rect(525, 182, 76, 48, "desk-d"),
  rect(680, 392, 82, 54, "desk-e"),
  rect(813, 173, 72, 54, "desk-f")
];

const state = {
  fear: 18,
  coffee: 45,
  paper: 0,
  ink: 0,
  saves: 0,
  hasBadge: false,
  contractSigned: false,
  hasCoffee: false,
  hasKey: false,
  hasTruth: false,
  promisedSilence: false,
  fixedPrinter: false,
  spokeWithMirror: false,
  foundManual: false,
  foundInk: false,
  foundPaper: false,
  firstThreat: false,
  hiding: false,
  hideSpot: null,
  task: "Задача: поговорите с HR и переживите оформление",
  player: { x: 92, y: 500, w: 28, h: 34, speed: 165, face: "down" },
  watcher: { x: 760, y: 115, w: 30, h: 38, dir: 1, alert: 0, stunned: 0 }
};

const walls = [
  rect(0, 0, 960, 26), rect(0, 574, 960, 26), rect(0, 0, 26, 600), rect(934, 0, 26, 600),
  rect(145, 88, 208, 34), rect(437, 88, 280, 34), rect(776, 88, 86, 34),
  rect(145, 246, 34, 230), rect(302, 198, 34, 278), rect(459, 246, 34, 230),
  rect(617, 198, 34, 278), rect(774, 246, 34, 230),
  ...desks
];

const exits = [
  { ...rect(866, 36, 50, 58), id: "director", label: "кабинет директора" },
  { ...rect(842, 505, 72, 46), id: "server", label: "серверная" }
];

const pickups = [
  {
    id: "paper",
    name: "Ведьмина бумага",
    x: 238,
    y: 250,
    color: "#dfe7dd",
    takenFlag: "foundPaper",
    take() {
      state.paper += 1;
      state.foundPaper = true;
      state.task = state.contractSigned ? "Задача: сохранитесь у ксерокса" : state.task;
      addLog("Вы нашли лист ведьминой бумаги. Он теплый, как свежий приказ.");
    }
  },
  {
    id: "ink",
    name: "Чернила",
    x: 557,
    y: 260,
    color: "#7c5cff",
    takenFlag: "foundInk",
    take() {
      state.ink += 1;
      state.foundInk = true;
      state.task = state.contractSigned ? "Задача: сохранитесь у ксерокса" : state.task;
      addLog("В кармане звякает флакон чернил. На этикетке написано: 'для копий личности'.");
    }
  },
  {
    id: "manual",
    name: "Памятка программиста",
    x: 398,
    y: 334,
    color: "#ffcf5a",
    takenFlag: "foundManual",
    take() {
      state.foundManual = true;
      state.hasTruth = true;
      state.fear += 8;
      addLog("Памятка: 'Если начальник не отбрасывает тень, не отправляйте ему отчет'.");
    }
  }
];

const actors = [
  {
    id: "hr",
    name: "HR-менеджер Лидия",
    x: 226,
    y: 142,
    color: "#ffcf5a",
    radius: 18,
    talk() {
      if (!state.contractSigned) {
        openDialogue("HR-менеджер Лидия", "Вы пришли программистом. Милое заблуждение. Подпишите контракт: офис обещает не отпускать вас без причины.", [
          choice("Подписать контракт", () => {
            state.contractSigned = true;
            state.hasBadge = true;
            state.paper += 1;
            state.ink += 1;
            state.fear += 7;
            state.task = "Задача: сохранитесь у ксерокса";
            addLog("Контракт подписан. На пропуске появилось имя, которое вы не называли.");
            closeDialogue();
          }),
          choice("Попросить обычный трудовой договор", () => {
            state.fear += 13;
            addLog("Лидия моргает только одним глазом. В офисе становится тише.");
            closeDialogue();
          })
        ]);
        return;
      }

      if (state.saves === 0) {
        openDialogue("HR-менеджер Лидия", "У нас принято сохранять карьеру у ксерокса. Лист и чернила у вас уже есть. Наверное.", [
          choice("Отойти", closeDialogue)
        ]);
        return;
      }

      openDialogue("HR-менеджер Лидия", "Теперь найдите серверную. Если дверь спросит, живы ли вы, отвечайте уверенно.", [
        choice("Понятно", closeDialogue)
      ]);
    }
  },
  {
    id: "copier",
    name: "Ксерокс 'Мама'",
    x: 706,
    y: 150,
    color: "#dfe7dd",
    radius: 19,
    talk() {
      if (!state.contractSigned) {
        openDialogue("Ксерокс 'Мама'", "СПЕРВА ДОКУМЕНТЫ. ПОТОМ ДУША. ПОТОМ КОПИЯ.", [choice("Отойти", closeDialogue)]);
        return;
      }

      if (state.paper < 1 || state.ink < 1) {
        openDialogue("Ксерокс 'Мама'", "НУЖНЫ БУМАГА И ЧЕРНИЛА. БЕЗ НИХ ВЫ НЕ ДОКАЗУЕМЫ.", [
          choice("Отойти", closeDialogue)
        ]);
        return;
      }

      openDialogue("Ксерокс 'Мама'", "Сделать резервную копию первого рабочего дня?", [
        choice("Сохраниться", () => {
          state.paper -= 1;
          state.ink -= 1;
          state.saves += 1;
          saveGame();
          state.task = "Задача: найдите нормальный пропуск в серверную";
          addLog("Ксерокс сохраняет вас в памяти. Копия выглядит чуть увереннее оригинала.");
          closeDialogue();
        }),
        choice("Не сейчас", closeDialogue)
      ]);
    }
  },
  {
    id: "intern",
    name: "Стажер Кирилл",
    x: 374,
    y: 542,
    color: "#62c5ff",
    radius: 17,
    talk() {
      if (!state.saves) {
        openDialogue("Стажер Кирилл", "Не ходи к серверной без сохранения. Я так сделал и теперь числюсь мебелью.", [
          choice("Хорошо", closeDialogue)
        ]);
        return;
      }

      openDialogue("Стажер Кирилл", "Я видел ключ у принтера. Он выдает вещи, если говорить с ним вежливо. Или если дать ему кофе.", [
        choice("Отдать кофе", () => {
          if (!state.hasCoffee) {
            addLog("Кофе пока нет. Автомат в углу шумит так, будто варит совещание.");
            closeDialogue();
            return;
          }
          state.hasKey = true;
          state.coffee = Math.max(0, state.coffee - 12);
          state.task = "Задача: откройте серверную";
          addLog("Кирилл достает ключ из-под клавиатуры. 'Я просто хотел проверить, поделитесь ли вы кофе'.");
          closeDialogue();
        }),
        choice("Пообещать вытащить его отсюда", () => {
          state.promisedSilence = true;
          state.fear = Math.max(0, state.fear - 4);
          addLog("Кирилл впервые улыбается нормально. Почти нормально.");
          closeDialogue();
        })
      ]);
    }
  },
  {
    id: "lead",
    name: "Тимлид без тени",
    x: 548,
    y: 142,
    color: "#a8ff65",
    radius: 18,
    talk() {
      openDialogue("Тимлид без тени", "Первый баг всегда в человеке, который его нашел. Ты видел памятку на рабочем столе?", [
        choice("Спросить про серверную", () => {
          state.fear += 6;
          addLog("Тимлид шепчет: 'Серверная открывается не ключом. Она открывается привычкой подчиняться'.");
          closeDialogue();
        }),
        choice("Сказать, что занят", () => {
          state.coffee = Math.min(100, state.coffee + 8);
          addLog("Тимлид одобрительно молчит. Это худший вид code review.");
          closeDialogue();
        })
      ]);
    }
  },
  {
    id: "coffee",
    name: "Кофейный автомат",
    x: 860,
    y: 270,
    color: "#b77b4a",
    radius: 18,
    talk() {
      if (state.hasCoffee) {
        openDialogue("Кофейный автомат", "ОДИН СОТРУДНИК. ОДИН СТАКАН. ОДНА СМЕНА НАВСЕГДА.", [choice("Отойти", closeDialogue)]);
        return;
      }

      openDialogue("Кофейный автомат", "ВЫБЕРИТЕ НАПИТОК: КОФЕ, ИЗВИНЕНИЕ, ИЛИ ПЛАН НА ПЯТИЛЕТКУ.", [
        choice("Взять кофе", () => {
          state.hasCoffee = true;
          state.coffee = Math.min(100, state.coffee + 35);
          addLog("Автомат выдает кофе. На пенке нарисован план этажа.");
          closeDialogue();
        }),
        choice("План на пятилетку", () => {
          state.fear += 12;
          addLog("Стакан пуст, но вы внезапно знаете, что будете делать в 2031 году.");
          closeDialogue();
        })
      ]);
    }
  },
  {
    id: "terminal",
    name: "Терминал серверной",
    x: 858,
    y: 474,
    color: "#ff5964",
    radius: 18,
    talk() {
      if (!state.hasKey) {
        openDialogue("Терминал серверной", "ACCESS DENIED. ТРЕБУЕТСЯ КЛЮЧ, ПРОПУСК И МЕНЬШЕ СОМНЕНИЙ.", [
          choice("Отойти", closeDialogue)
        ]);
        return;
      }

      openDialogue("Терминал серверной", "Акт 1 завершен. Вы получили доступ к серверной NUL-13. Запустить ночную смену?", [
        choice("Войти в серверную", () => finish("act1")),
        choice("Пока нет", closeDialogue)
      ]);
    }
  }
];

function rect(x, y, w, h, id = "") {
  return { x, y, w, h, id };
}

function choice(text, action) {
  return { text, action };
}

function addLog(text) {
  const p = document.createElement("p");
  p.textContent = text;
  logEl.prepend(p);
}

function openDialogue(speaker, line, choices) {
  dialogue = { speaker, line, choices };
  speakerEl.textContent = speaker;
  lineEl.textContent = line;
  choicesEl.replaceChildren();
  for (const item of choices) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.text;
    button.addEventListener("click", item.action);
    choicesEl.append(button);
  }
  dialogueEl.hidden = false;
}

function closeDialogue() {
  dialogue = null;
  dialogueEl.hidden = true;
}

function finish(kind) {
  ending = kind;
  if (kind === "caught") {
    openDialogue("Провал: Испытательный срок", "Охранник заполняет форму задержания. В графе 'причина' он пишет: 'слишком живой'. Ксерокс может вернуть вас к последнему сохранению.", [
      choice("Загрузить ксерокс", loadGame),
      choice("Начать заново", reset)
    ]);
    return;
  }

  if (state.promisedSilence && state.foundManual) {
    openDialogue("Конец Акта 1: Свой среди странных", "Вы открыли серверную и не бросили Кирилла. За дверью шумит второй акт: архив ошибок, ночной билд и чей-то голос из вентиляции.", [
      choice("Играть заново", reset)
    ]);
  } else {
    openDialogue("Конец Акта 1: Доступ получен", "Серверная открывается. Офис записывает вас в штат. Где-то в темноте компилируется следующая смена.", [
      choice("Играть заново", reset)
    ]);
  }
}

function reset() {
  Object.assign(state, {
    fear: 18,
    coffee: 45,
    paper: 0,
    ink: 0,
    saves: 0,
    hasBadge: false,
    contractSigned: false,
    hasCoffee: false,
    hasKey: false,
    hasTruth: false,
    promisedSilence: false,
    fixedPrinter: false,
    spokeWithMirror: false,
    foundManual: false,
    foundInk: false,
    foundPaper: false,
    firstThreat: false,
    hiding: false,
    hideSpot: null,
    task: "Задача: поговорите с HR и переживите оформление"
  });
  Object.assign(state.player, { x: 92, y: 500, face: "down" });
  Object.assign(state.watcher, { x: 760, y: 115, dir: 1, alert: 0, stunned: 0 });
  ending = null;
  closeDialogue();
  logEl.replaceChildren();
  addLog("Лифт закрылся за вами. На табло нет кнопки первого этажа.");
}

function snapshot() {
  return {
    fear: state.fear,
    coffee: state.coffee,
    paper: state.paper,
    ink: state.ink,
    saves: state.saves,
    hasBadge: state.hasBadge,
    contractSigned: state.contractSigned,
    hasCoffee: state.hasCoffee,
    hasKey: state.hasKey,
    hasTruth: state.hasTruth,
    promisedSilence: state.promisedSilence,
    foundManual: state.foundManual,
    foundInk: state.foundInk,
    foundPaper: state.foundPaper,
    firstThreat: state.firstThreat,
    task: state.task,
    player: { ...state.player }
  };
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot()));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    addLog("Ксерокс молчит: сохранений пока нет.");
    ending = null;
    closeDialogue();
    return;
  }
  const data = JSON.parse(raw);
  Object.assign(state, data, { hiding: false, hideSpot: null });
  Object.assign(state.player, data.player);
  Object.assign(state.watcher, { x: 760, y: 115, dir: 1, alert: 0, stunned: 0 });
  ending = null;
  closeDialogue();
  addLog("Ксерокс выгружает вашу копию. У нее холодные руки.");
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function move(entity, dx, dy) {
  entity.x += dx;
  if (walls.some((wall) => intersects(entity, wall))) entity.x -= dx;
  entity.y += dy;
  if (walls.some((wall) => intersects(entity, wall))) entity.y -= dy;
}

function center(rectangle) {
  return { x: rectangle.x + rectangle.w / 2, y: rectangle.y + rectangle.h / 2 };
}

function distanceToPlayer(x, y) {
  const p = center(state.player);
  return Math.hypot(x - p.x, y - p.y);
}

function nearestActor() {
  let best = null;
  let bestDistance = Infinity;
  for (const actor of actors) {
    const distance = distanceToPlayer(actor.x, actor.y);
    if (distance < 58 && distance < bestDistance) {
      best = actor;
      bestDistance = distance;
    }
  }
  return best;
}

function nearestPickup() {
  for (const item of pickups) {
    if (!state[item.takenFlag] && distanceToPlayer(item.x, item.y) < 42) return item;
  }
  return null;
}

function nearestDesk() {
  const p = center(state.player);
  for (const desk of desks) {
    const cx = desk.x + desk.w / 2;
    const cy = desk.y + desk.h / 2;
    if (Math.hypot(cx - p.x, cy - p.y) < 58) return desk;
  }
  return null;
}

function toggleHide() {
  if (dialogue || ending) return;
  if (state.hiding) {
    state.hiding = false;
    state.hideSpot = null;
    addLog("Вы вылезаете из-под стола. Офис делает вид, что не заметил.");
    return;
  }

  const desk = nearestDesk();
  if (!desk) {
    addLog("Спрятаться можно только рядом со столом.");
    return;
  }

  state.hiding = true;
  state.hideSpot = desk.id;
  state.fear = Math.max(0, state.fear - 3);
  addLog("Вы прячетесь под столом. Там лежит бейдж человека, который 'работает удаленно'.");
}

function interact() {
  if (dialogue || ending) return;

  const item = nearestPickup();
  if (item) {
    item.take();
    return;
  }

  const actor = nearestActor();
  if (actor) {
    actor.talk();
    return;
  }

  for (const exit of exits) {
    if (intersects(state.player, exit)) {
      if (exit.id === "director") {
        addLog("Кабинет руководства закрыт. Изнутри кто-то утверждает вашу должностную инструкцию.");
        state.fear += 4;
      }
      if (exit.id === "server") {
        actors.find((actor) => actor.id === "terminal").talk();
      }
      return;
    }
  }

  addLog("Здесь пахнет озоном, дедлайнами и старым ковролином.");
}

function update(dt) {
  if (!dialogue && !ending) {
    const player = state.player;
    const slow = keys.has("Shift");
    const speed = (slow ? player.speed * 0.55 : player.speed) * (state.coffee < 10 ? 0.72 : 1);
    let dx = 0;
    let dy = 0;

    if (!state.hiding) {
      if (keys.has("ArrowLeft") || keys.has("a")) dx -= 1;
      if (keys.has("ArrowRight") || keys.has("d")) dx += 1;
      if (keys.has("ArrowUp") || keys.has("w")) dy -= 1;
      if (keys.has("ArrowDown") || keys.has("s")) dy += 1;
    }

    if (dx || dy) {
      const length = Math.hypot(dx, dy);
      dx = (dx / length) * speed * dt;
      dy = (dy / length) * speed * dt;
      if (Math.abs(dx) > Math.abs(dy)) player.face = dx > 0 ? "right" : "left";
      else player.face = dy > 0 ? "down" : "up";
      move(player, dx, dy);
      state.coffee = Math.max(0, state.coffee - dt * (slow ? 1.2 : 3.4));
    }

    updateWatcher(dt, Boolean(dx || dy), slow);
  }

  taskEl.textContent = state.task;
  badgeEl.textContent = `Пропуск: ${state.hasBadge ? "NUL-13" : "временный"}`;
  fearEl.value = state.fear;
  coffeeEl.value = state.coffee;
  renderInventory();
}

function updateWatcher(dt, moving, slow) {
  const watcher = state.watcher;
  if (watcher.stunned > 0) {
    watcher.stunned -= dt;
    return;
  }

  watcher.x += watcher.dir * 72 * dt;
  if (watcher.x < 672 || watcher.x > 864) watcher.dir *= -1;

  if (!state.contractSigned) return;
  if (!state.firstThreat && state.saves > 0) {
    state.firstThreat = true;
    addLog("После сохранения охранник замечает, что у вас есть копия. Теперь он слушает шаги.");
  }

  const hearing = state.hiding ? 0 : moving ? (slow ? 70 : 128) : 42;
  const distance = Math.hypot(watcher.x - state.player.x, watcher.y - state.player.y);
  if (distance < hearing) {
    watcher.alert += dt;
    state.fear = Math.min(100, state.fear + dt * (slow ? 7 : 22));
    if (watcher.alert > 2.4) finish("caught");
  } else {
    watcher.alert = Math.max(0, watcher.alert - dt * 1.5);
    state.fear = Math.max(0, state.fear - dt * (state.hiding ? 4 : 1.4));
  }
}

function renderInventory() {
  const items = [
    ["Бумага", state.paper],
    ["Чернила", state.ink],
    ["Сохранения", state.saves],
    ["Ключ", state.hasKey ? "есть" : "нет"]
  ];
  inventoryEl.replaceChildren();
  for (const [name, value] of items) {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<strong>${name}</strong>${value}`;
    inventoryEl.append(div);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFloor();
  drawWalls();
  drawFurniture();
  drawPickups();
  drawExits();
  for (const actor of actors) drawActor(actor);
  drawWatcher();
  drawPlayer();
  drawHints();
  drawLight();
}

function drawFloor() {
  ctx.fillStyle = "#171b1c";
  ctx.fillRect(0, 0, 960, 600);
  ctx.strokeStyle = "rgba(255,255,255,0.035)";
  ctx.lineWidth = 1;
  for (let x = 0; x < 960; x += TILE) {
    for (let y = 0; y < 600; y += TILE) {
      ctx.strokeRect(x, y, TILE, TILE);
    }
  }
  ctx.fillStyle = "rgba(168,255,101,0.05)";
  ctx.fillRect(28, 28, 904, 72);
  ctx.fillStyle = "rgba(255,89,100,0.04)";
  ctx.fillRect(28, 488, 904, 84);
  ctx.fillStyle = "rgba(255,207,90,0.06)";
  ctx.fillRect(30, 112, 276, 120);
}

function drawWalls() {
  for (const wall of walls) {
    ctx.fillStyle = "#303839";
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(wall.x, wall.y, wall.w, 3);
  }
}

function drawFurniture() {
  for (const desk of desks) {
    ctx.fillStyle = state.hiding && state.hideSpot === desk.id ? "#3f4f41" : "#6b5f4d";
    ctx.fillRect(desk.x, desk.y, desk.w, desk.h);
    ctx.fillStyle = "#2b3132";
    ctx.fillRect(desk.x + 10, desk.y - 12, 28, 12);
    ctx.fillStyle = "#a8ff65";
    ctx.fillRect(desk.x + 14, desk.y - 9, 20, 6);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(desk.x + 8, desk.y + desk.h - 9, desk.w - 16, 5);
  }
}

function drawPickups() {
  for (const item of pickups) {
    if (state[item.takenFlag]) continue;
    ctx.fillStyle = item.color;
    ctx.fillRect(item.x - 8, item.y - 8, 16, 16);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.strokeRect(item.x - 10, item.y - 10, 20, 20);
  }
}

function drawExits() {
  for (const exit of exits) {
    ctx.fillStyle = exit.id === "director" ? "#51414b" : "#34434a";
    ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
    ctx.fillStyle = "#d9e3dc";
    ctx.font = "11px ui-monospace, monospace";
    ctx.fillText(exit.id === "director" ? "CEO" : "SRV", exit.x + 9, exit.y + 30);
  }
}

function drawActor(actor) {
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(actor.x, actor.y + 19, actor.radius, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = actor.color;
  ctx.beginPath();
  ctx.arc(actor.x, actor.y, actor.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(actor.x - 7, actor.y - 3, 4, 4);
  ctx.fillRect(actor.x + 4, actor.y - 3, 4, 4);
}

function drawWatcher() {
  const w = state.watcher;
  ctx.fillStyle = w.alert > 1 ? "#ff5964" : "#7f8b83";
  ctx.fillRect(w.x, w.y, w.w, w.h);
  ctx.fillStyle = `rgba(255,207,90,${w.alert > 1 ? 0.32 : 0.16})`;
  ctx.beginPath();
  ctx.moveTo(w.x + (w.dir > 0 ? w.w : 0), w.y + 15);
  ctx.lineTo(w.x + (w.dir > 0 ? 128 : -98), w.y - 18);
  ctx.lineTo(w.x + (w.dir > 0 ? 128 : -98), w.y + 66);
  ctx.closePath();
  ctx.fill();
}

function drawPlayer() {
  const p = state.player;
  if (state.hiding) {
    ctx.fillStyle = "rgba(168,255,101,0.42)";
    ctx.beginPath();
    ctx.arc(p.x + p.w / 2, p.y + p.h / 2, 10, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.fillStyle = "rgba(0,0,0,0.38)";
  ctx.beginPath();
  ctx.ellipse(p.x + p.w / 2, p.y + p.h + 4, 18, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dfe7dd";
  ctx.fillRect(p.x + 5, p.y + 6, 18, 24);
  ctx.fillStyle = "#4e86d8";
  ctx.fillRect(p.x + 7, p.y + 19, 14, 10);
  ctx.fillStyle = "#f4c7a1";
  ctx.fillRect(p.x + 6, p.y, 16, 13);
  ctx.fillStyle = "#171b1c";
  const eyeY = p.face === "up" ? p.y + 3 : p.y + 6;
  ctx.fillRect(p.x + 10, eyeY, 3, 3);
  ctx.fillRect(p.x + 17, eyeY, 3, 3);
}

function drawHints() {
  ctx.font = "12px ui-monospace, monospace";
  ctx.fillStyle = "rgba(238,243,237,0.72)";
  const actor = nearestActor();
  const item = nearestPickup();
  const desk = nearestDesk();
  if (item) ctx.fillText(`E: ${item.name}`, item.x + 14, item.y - 12);
  else if (actor) ctx.fillText(`E: ${actor.name}`, actor.x + 20, actor.y - 18);
  else if (desk && !state.hiding) ctx.fillText("F: спрятаться", desk.x, desk.y - 18);
  else if (state.hiding) ctx.fillText("F: вылезти", state.player.x - 18, state.player.y - 20);
}

function drawLight() {
  const p = center(state.player);
  const gradient = ctx.createRadialGradient(p.x, p.y, 70, p.x, p.y, 430);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.7, "rgba(0,0,0,0.25)");
  gradient.addColorStop(1, `rgba(0,0,0,${0.62 + state.fear / 300})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 960, 600);
}

function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
  if (key === "e") interact();
  else if (key === "f") toggleHide();
  else if (key === "r") reset();
  else keys.add(key);
});

window.addEventListener("keyup", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.delete(key);
});

reset();
requestAnimationFrame(loop);
