// =====================================================================
// SHARED ROOM HELPERS
// =====================================================================
function roomFloor(palette) {
  // tile floor
  k.add([k.rect(960, 600), k.color(palette[0], palette[1], palette[2]), k.pos(0, 0), k.fixed()]);
  // checker tiles
  const TILE = 48;
  for (let x = 0; x < 960; x += TILE) for (let y = 0; y < 600; y += TILE) {
    if (((x / TILE) + (y / TILE)) % 2 === 0) {
      k.add([k.rect(TILE, TILE), k.color(palette[3], palette[4], palette[5]), k.pos(x, y), k.fixed()]);
    }
  }
  // grid lines
  for (let x = 0; x < 960; x += TILE) k.add([k.rect(1, 600), k.color(255, 255, 255), k.opacity(0.05), k.pos(x, 0), k.fixed()]);
  for (let y = 0; y < 600; y += TILE) k.add([k.rect(960, 1), k.color(255, 255, 255), k.opacity(0.05), k.pos(0, y), k.fixed()]);
  createGameHUD();
}

function wall(x, y, w, h, color = [90, 100, 120]) {
  const piece = k.add([
    k.rect(w, h),
    k.color(color[0], color[1], color[2]),
    k.pos(x, y),
    k.area(),
    k.body({ isStatic: true }),
    "wall"
  ]);
  // top highlight
  k.add([k.rect(w, 3), k.color(255, 255, 255), k.opacity(0.22), k.pos(x, y)]);
  // bottom shadow
  k.add([k.rect(w, 3), k.color(0, 0, 0), k.opacity(0.35), k.pos(x, y + h - 3)]);
  return piece;
}

function deskWithMonitor(x, y, w, h, accent) {
  // desk
  k.add([k.rect(w, h), k.color(160, 135, 103), k.pos(x, y), k.area(), k.body({ isStatic: true }), "desk"]);
  k.add([k.rect(w, 3), k.color(255, 235, 200), k.opacity(0.25), k.pos(x, y)]);
  // monitor base
  k.add([k.rect(36, 6), k.color(26, 31, 36), k.pos(x + 8, y - 4)]);
  // monitor
  k.add([k.rect(32, 24), k.color(10, 12, 16), k.pos(x + 10, y - 28)]);
  k.add([k.rect(28, 20), k.color(accent[0], accent[1], accent[2]), k.opacity(0.85), k.pos(x + 12, y - 26)]);
  // keyboard
  k.add([k.rect(w - 16, 6), k.color(42, 48, 56), k.pos(x + 8, y + h - 10)]);
  // mug
  k.add([k.rect(8, 10), k.color(194, 32, 42), k.pos(x + w - 14, y + 4)]);
}

function exitDoor(x, y, w, h, label, to) {
  const door = k.add([
    k.rect(w, h),
    k.color(26, 31, 36),
    k.pos(x, y),
    k.area(),
    k.outline(1, k.rgb(194, 32, 42)),
    "exit",
    { _to: to, _label: label }
  ]);
  k.add([k.text(label, { size: 11 }), k.color(232, 226, 212), k.pos(x + 8, y + h / 2 - 6)]);
  return door;
}

function wallsBorder() {
  wall(0, 0, 960, 26);
  wall(0, 574, 960, 26);
  wall(0, 0, 26, 600);
  wall(934, 0, 26, 600);
}

// =====================================================================
// PLAYER + ROOM SETUP
// =====================================================================
function makePlayer(x, y) {
  const liftSpawn = state.arriveFromElevator && ELEVATOR_SPAWNS[state.scene];
  const spawn = liftSpawn
    ? liftSpawn
    : resumeFromSave && state.playerPos
    ? { x: state.playerPos.x, y: state.playerPos.y }
    : { x, y };
  const spawnFace = liftSpawn?.face;
  state.arriveFromElevator = false;
  resumeFromSave = false;
  const p = k.add([
    k.pos(spawn.x, spawn.y),
    k.area({ shape: new k.Rect(k.vec2(-10, 6), 20, 16) }),
    k.body(),
    k.anchor("center"),
    "player",
    { speed: 200, face: spawnFace || "down" }
  ]);
  const look = state.surpriseDone ? CHARS.player_senior : CHARS.player;
  p.add(humanoid(look));
  const h = p.get("humanoid")[0];
  if (h && spawnFace) h.face = spawnFace;
  return p;
}

function setupPlayerControls(p) {
  p._stepT = 0;
  p.onUpdate(() => {
    if (isInputBlocked()) {
      const h = p.get("humanoid")[0]; if (h) h.walking = false;
      return;
    }
    let dx = 0, dy = 0;
    if (k.isButtonDown("left")) dx -= 1;
    if (k.isButtonDown("right")) dx += 1;
    if (k.isButtonDown("up")) dy -= 1;
    if (k.isButtonDown("down")) dy += 1;
    if (dx || dy) {
      const len = Math.hypot(dx, dy);
      dx /= len; dy /= len;
      p.move(dx * p.speed, dy * p.speed);
      if (Math.abs(dx) > Math.abs(dy)) p.face = dx > 0 ? "right" : "left";
      else p.face = dy > 0 ? "down" : "up";
      const h = p.get("humanoid")[0];
      h.walking = true;
      h.face = p.face;
      // footsteps
      p._stepT -= k.dt();
      if (p._stepT <= 0) { Aud.step(); p._stepT = 0.32; }
    } else {
      const h = p.get("humanoid")[0];
      if (h) h.walking = false;
    }
  });

  k.onButtonPress("interact", () => {
    if (isOverlayOnly()) return;
    // pick nearest interactable
    let best = null, bestD = 60;
    for (const npc of k.get("npc")) {
      const d = p.pos.dist(npc.pos);
      if (d < bestD) { bestD = d; best = npc; }
    }
    if (best) { best._talk(); return; }
    for (const ex of k.get("exit")) {
      const px = p.pos.x, py = p.pos.y;
      if (px > ex.pos.x && px < ex.pos.x + ex.width && py > ex.pos.y - 30 && py < ex.pos.y + ex.height + 30) {
        Aud.elevatorDing();
        state.scene = ex._to;
        k.go(ex._to);
        return;
      }
    }
  });

  k.onKeyPress("escape", () => {
    if (laptopOpen || codePuzzleOpen) return;
    if (dialogOpen) { clearDialog(); return; }
    togglePause();
  });
}

// =====================================================================
// CROWD
// =====================================================================
function addCrowdWalker(path, speed, look) {
  const c = k.add([
    k.pos(path[0].x, path[0].y),
    k.anchor("center"),
    "crowd",
    { _path: path, _idx: 1, _speed: speed }
  ]);
  c.add(humanoid(look));
  c.onUpdate(() => {
    if (dialogOpen) return;
    const tgt = c._path[c._idx % c._path.length];
    const dx = tgt.x - c.pos.x, dy = tgt.y - c.pos.y;
    const d = Math.hypot(dx, dy);
    if (d < 2) { c._idx = (c._idx + 1) % c._path.length; return; }
    const step = c._speed * k.dt();
    c.pos.x += (dx / d) * step;
    c.pos.y += (dy / d) * step;
    const h = c.get("humanoid")[0];
    h.walking = true;
    h.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
  });
  return c;
}

function addCrowdTyper(x, y, look) {
  // seated typing — represented as static humanoid behind desk
  const c = k.add([k.pos(x, y), k.anchor("center"), "crowd-sit"]);
  c.add(humanoid({ ...look, scale: 0.85 }));
  c.onUpdate(() => {
    const h = c.get("humanoid")[0];
    h.walking = true;
    h.phase += k.dt() * 18;
  });
  return c;
}

function addFollower(x, y, look, label = "follower") {
  const f = k.add([
    k.pos(x, y),
    k.anchor("center"),
    label,
    { speed: 155, face: "down" }
  ]);
  f.add(humanoid(look));
  f.onUpdate(() => {
    if (isInputBlocked()) {
      const h = f.get("humanoid")[0];
      if (h) h.walking = false;
      return;
    }
    const p = k.get("player")[0];
    if (!p) return;
    const dx = p.pos.x - f.pos.x;
    const dy = p.pos.y - f.pos.y;
    const dist = Math.hypot(dx, dy);
    const h = f.get("humanoid")[0];
    if (dist < 58) {
      if (h) h.walking = false;
      return;
    }
    const step = Math.min(f.speed * k.dt(), dist - 48);
    f.pos.x += (dx / dist) * step;
    f.pos.y += (dy / dist) * step;
    f.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
    if (h) {
      h.walking = true;
      h.face = f.face;
    }
  });
  return f;
}

// =====================================================================
// NPC FACTORY
// =====================================================================
function addNPC(x, y, look, talk) {
  const n = k.add([k.pos(x, y), k.anchor("center"), k.area({ shape: new k.Rect(k.vec2(-16, -16), 32, 32) }), "npc", { _talk: talk, _look: look }]);
  n.add(humanoid(look));
  // floating "E" hint when player is near
  const hint = k.add([
    k.text("E", { size: 14 }),
    k.color(194, 32, 42),
    k.pos(x, y - 50),
    k.anchor("center"),
    k.opacity(0)
  ]);
  hint.onUpdate(() => {
    const p = k.get("player")[0];
    if (!p) { hint.opacity = 0; return; }
    const near = p.pos.dist(n.pos) < 60 && !isOverlayOnly();
    hint.opacity = near ? (0.6 + Math.sin(k.time() * 4) * 0.4) : 0;
    hint.pos = n.pos.add(0, -50);
  });
  return n;
}
