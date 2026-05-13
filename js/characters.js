// =====================================================================
// CHARACTER ROSTER — each character has a unique look
// =====================================================================
const CHARS = {
  player: {
    skin: "#f0c8a0", hair: "#2a1a14", hairStyle: "messy",
    shirt: "#9aa39a", pants: "#2a2630", accent: "#c2202a",
    name: "ТЫ"
  },
  player_senior: {
    skin: "#f0c8a0", hair: "#2a1a14", hairStyle: "messy",
    shirt: "#a8ff65", pants: "#2a2630", accent: "#c2202a",
    name: "ТЫ · SR"
  },
  dana: {
    skin: "#e8c8a8", hair: "#3a2418", hairStyle: "long",
    shirt: "#62c5ff", pants: "#1a2030", accent: "#ffb347",
    name: "ДАНА"
  },
  timur: {
    skin: "#f0c8a0", hair: "#1a1410", hairStyle: "short",
    facialHair: "beard", build: "buff",
    shirt: "#ffb347", pants: "#2a2630", accent: "#c2202a",
    name: "ТИМУР"
  },
  serik: {
    skin: "#d8b08a", hair: "#1a1010", hairStyle: "buzz",
    facialHair: "stubble", accessory: "glasses",
    shirt: "#a8ff65", pants: "#1f1f24",
    name: "СЕРИК"
  },
  receptionist: {
    skin: "#e0b890", hair: "#3a2a1a", hairStyle: "bun",
    shirt: "#62a5e8", pants: "#1f1f24", accent: "#ffffff",
    name: "РЕСЕПШН"
  },
  intern: {
    skin: "#e8c8a8", hair: "#3a2418", hairStyle: "cap",
    shirt: "#a8ff65", pants: "#1a2030", accent: "#c2202a",
    name: "Стажёр"
  },
  manager: {
    skin: "#e0b890", hair: "#1a1410", hairStyle: "short",
    shirt: "#ffb347", pants: "#2a2630", accessory: "laptop",
    name: "Менеджер"
  },
  alia: {
    skin: "#e8c8a8", hair: "#3a2418", hairStyle: "long",
    shirt: "#62c5ff", pants: "#1f2530",
    name: "Алия"
  },
  bakyt: {
    skin: "#f0c8a0", hair: "#1a1410", hairStyle: "short",
    facialHair: "beard", accessory: "glasses",
    shirt: "#ffb347", pants: "#2a2630",
    name: "Бакыт"
  },
  marzhan: {
    skin: "#e0b890", hair: "#2a1810", hairStyle: "bun",
    shirt: "#a8ff65", pants: "#1a1f24",
    name: "Маржан"
  },
  erzhan: {
    skin: "#d0a878", hair: "#3a2418", hairStyle: "messy",
    facialHair: "stubble",
    shirt: "#c2202a", pants: "#1f1f24",
    name: "Ержан"
  },
  teamlead: {
    skin: "#e8c8a8", hair: "#1a1410", hairStyle: "ponytail",
    shirt: "#62a5e8", pants: "#2a2630", accessory: "laptop",
    name: "Тимлид"
  },
  qa: {
    skin: "#f0c8a0", hair: "#3a2418", hairStyle: "headphones",
    shirt: "#9aa39a", pants: "#1f1f24",
    name: "QA"
  }
};

// look up CHARS by visible name (used for dialog portraits)
function findCharByName(name) {
  if (!name) return null;
  const upper = name.toUpperCase();
  for (const key in CHARS) {
    const c = CHARS[key];
    if (!c.name) continue;
    if (c.name.toUpperCase() === upper) return c;
  }
  return null;
}

// =====================================================================
// HUMANOID — re-usable game object factory
// =====================================================================
function humanoid(opts = {}) {
  const o = {
    skin: "#f0c8a0", hair: "#2a1a14", shirt: "#62a5e8",
    pants: "#2a2630", accent: null, accessory: null, name: null,
    hairStyle: "short",   // short | long | bald | buzz | bun | ponytail | messy | cap | headphones
    facialHair: null,     // beard | stubble | mustache
    build: "regular",     // regular | slim | buff
    scale: 1, noName: false,
    ...opts
  };
  const s = o.scale;
  const W = 22 * s, H = 44 * s;

  const root = k.make([
    k.pos(0, 0),
    k.anchor("center"),
    k.area({ shape: new k.Rect(k.vec2(-W / 2, -H / 2 + 8), W, H - 12) }),
    "humanoid",
    {
      face: "down",
      walking: false,
      phase: 0,
      blink: 0,
      blinkT: 1 + k.rand(0, 3),
      look: o,
      add() {
        // children created on add for proper transform
      }
    }
  ]);

  // helpers to add rects with color
  const px = (x, y, w, h, color, tag = "limb") => {
    const [r, g, b, a] = parseColor(color);
    const node = root.add([
      k.rect(w, h),
      k.color(r, g, b),
      k.opacity(a),
      k.pos(x, y),
      k.anchor("topleft"),
      tag
    ]);
    return node;
  };

  // shadow (rect — kaplay has no ellipse component)
  root.add([k.rect(22 * s, 6 * s), k.color(0, 0, 0), k.opacity(0.3), k.pos(-11 * s, H / 2 - 2), "shadow"]);

  // legs
  const legL = px(-7 * s, 6 * s, 6 * s, 12 * s, o.pants, "leg-l");
  const legR = px(1 * s, 6 * s, 6 * s, 12 * s, o.pants, "leg-r");
  const shoeL = px(-7 * s, 18 * s, 6 * s, 3 * s, "#0e1014", "shoe-l");
  const shoeR = px(1 * s, 18 * s, 6 * s, 3 * s, "#0e1014", "shoe-r");

  // torso
  const torso = px(-10 * s, -8 * s, 20 * s, 16 * s, o.shirt, "torso");
  // shirt highlight
  px(-10 * s, -8 * s, 20 * s, 2 * s, "rgba(255,255,255,0.18)", "highlight");

  // accent (tie)
  let tie = null;
  if (o.accent) {
    tie = px(-1 * s, -8 * s, 2 * s, 12 * s, o.accent, "tie");
    px(-2 * s, -8 * s, 4 * s, 3 * s, o.accent, "tieknot");
  }

  // arms
  const armL = px(-13 * s, -7 * s, 4 * s, 12 * s, o.shirt, "arm-l");
  const armR = px(9 * s, -7 * s, 4 * s, 12 * s, o.shirt, "arm-r");
  const handL = px(-13 * s, 4 * s, 4 * s, 3 * s, o.skin, "hand-l");
  const handR = px(9 * s, 4 * s, 4 * s, 3 * s, o.skin, "hand-r");

  // neck
  px(-3 * s, -11 * s, 6 * s, 3 * s, o.skin, "neck");

  // head
  const head = px(-7 * s, -22 * s, 14 * s, 12 * s, o.skin, "head");
  // jaw shadow
  px(-7 * s, -12 * s, 14 * s, 2 * s, "rgba(0,0,0,0.2)", "jaw");

  // hair (regenerated per face direction)
  const hairTop = px(-8 * s, -23 * s, 16 * s, 4 * s, o.hair, "hair-top");
  const hairL = px(-8 * s, -23 * s, 3 * s, 8 * s, o.hair, "hair-l");
  const hairR = px(5 * s, -23 * s, 3 * s, 8 * s, o.hair, "hair-r");

  // ---- HAIRSTYLE EXTRAS ----
  const hairExtras = [];
  if (o.hairStyle === "long") {
    // longer side hair + back tail
    hairL.height = 14 * s;
    hairR.height = 14 * s;
    hairExtras.push(px(-9 * s, -23 * s, 18 * s, 5 * s, o.hair, "hair-crown"));
    hairExtras.push(px(-6 * s, -10 * s, 12 * s, 14 * s, o.hair, "hair-back"));
  } else if (o.hairStyle === "messy") {
    hairExtras.push(px(-9 * s, -25 * s, 6 * s, 3 * s, o.hair, "hair-tuft1"));
    hairExtras.push(px(2 * s, -26 * s, 5 * s, 3 * s, o.hair, "hair-tuft2"));
    hairExtras.push(px(-3 * s, -24 * s, 5 * s, 2 * s, o.hair, "hair-tuft3"));
  } else if (o.hairStyle === "buzz") {
    hairTop.height = 3 * s;
    hairTop.opacity = 0.85;
    hairL.opacity = 0; hairR.opacity = 0;
  } else if (o.hairStyle === "bald") {
    hairTop.opacity = 0; hairL.opacity = 0; hairR.opacity = 0;
  } else if (o.hairStyle === "bun") {
    hairTop.height = 3 * s;
    // bun on top
    hairExtras.push(px(-3 * s, -28 * s, 6 * s, 5 * s, o.hair, "bun-1"));
    hairExtras.push(px(-2 * s, -29 * s, 4 * s, 2 * s, o.hair, "bun-2"));
  } else if (o.hairStyle === "ponytail") {
    hairTop.height = 4 * s;
    hairExtras.push(px(-2 * s, -22 * s, 4 * s, 12 * s, o.hair, "pony-tail"));
  } else if (o.hairStyle === "cap") {
    // baseball cap
    hairExtras.push(px(-9 * s, -25 * s, 18 * s, 6 * s, o.accent || "#c2202a", "cap-top"));
    hairExtras.push(px(-11 * s, -19 * s, 8 * s, 2 * s, o.accent || "#c2202a", "cap-peak"));
    hairTop.opacity = 0;
  } else if (o.hairStyle === "headphones") {
    hairExtras.push(px(-10 * s, -24 * s, 20 * s, 2 * s, "#1a1410", "hp-band"));
    hairExtras.push(px(-11 * s, -22 * s, 4 * s, 6 * s, "#1a1410", "hp-cup-l"));
    hairExtras.push(px(7 * s, -22 * s, 4 * s, 6 * s, "#1a1410", "hp-cup-r"));
  }

  // ---- BODY BUILD ----
  if (o.build === "buff") {
    torso.width = 24 * s;
    torso.pos.x = -12 * s;
  } else if (o.build === "slim") {
    torso.width = 16 * s;
    torso.pos.x = -8 * s;
  }

  // eyes
  const eyeL = px(-4 * s, -17 * s, 2 * s, 2.5 * s, "#1a1410", "eye-l");
  const eyeR = px(2 * s, -17 * s, 2 * s, 2.5 * s, "#1a1410", "eye-r");
  // mouth
  const mouth = px(-2 * s, -14 * s, 4 * s, 1 * s, "rgba(60,30,30,0.6)", "mouth");

  // ---- FACIAL HAIR ----
  const facialHairParts = [];
  if (o.facialHair === "beard") {
    facialHairParts.push(px(-7 * s, -13 * s, 14 * s, 3 * s, o.hair, "beard-top"));
    facialHairParts.push(px(-6 * s, -10 * s, 12 * s, 2 * s, o.hair, "beard-bottom"));
  } else if (o.facialHair === "stubble") {
    facialHairParts.push(px(-7 * s, -13 * s, 14 * s, 2 * s, o.hair, "stubble"));
    facialHairParts[0].opacity = 0.45;
  } else if (o.facialHair === "mustache") {
    facialHairParts.push(px(-3 * s, -15 * s, 6 * s, 1.5 * s, o.hair, "mustache"));
  }

  // glasses
  let glassesL, glassesR;
  if (o.accessory === "glasses") {
    glassesL = root.add([k.rect(4 * s, 4 * s, { fill: false }), k.outline(1, rgbValue("#1a1f24")), k.pos(-5 * s, -19 * s), k.anchor("topleft"), "glasses"]);
    glassesR = root.add([k.rect(4 * s, 4 * s, { fill: false }), k.outline(1, rgbValue("#1a1f24")), k.pos(1 * s, -19 * s), k.anchor("topleft"), "glasses"]);
  }
  // laptop
  if (o.accessory === "laptop") {
    px(-15 * s, 0, 30 * s, 5 * s, "#3a3a40", "laptop");
    px(-14 * s, 1, 28 * s, 3 * s, "#9ad0ff", "laptop-screen");
  }

  // name tag
  if (o.name && !o.noName) {
    root.add([
      k.text(o.name, { size: 10 }),
      k.color(255, 255, 255),
      k.pos(0, -30 * s),
      k.anchor("center"),
      "nametag",
      { _bg: null }
    ]);
  }

  // per-frame animation
  root.onUpdate(() => {
    root.phase += k.dt() * (root.walking ? 11 : 2);
    const swing = root.walking ? Math.sin(root.phase) : 0;
    const armSwing = swing * 3.5 * s;
    const legSwing = swing * 4 * s;

    legL.pos.y = 6 * s;
    legR.pos.y = 6 * s;
    legL.height = 12 * s + legSwing;
    legR.height = 12 * s - legSwing;
    shoeL.pos.y = 18 * s + legSwing;
    shoeR.pos.y = 18 * s - legSwing;
    armL.pos.y = -7 * s + armSwing;
    armR.pos.y = -7 * s - armSwing;
    handL.pos.y = 4 * s + armSwing;
    handR.pos.y = 4 * s - armSwing;

    // blink
    root.blinkT -= k.dt();
    if (root.blink > 0) root.blink -= k.dt();
    else if (root.blinkT <= 0) { root.blink = 0.13; root.blinkT = 2 + k.rand(0, 3); }
    const blinking = root.blink > 0;
    eyeL.height = blinking ? 1 : 2.5 * s;
    eyeR.height = blinking ? 1 : 2.5 * s;

    // face direction
    const showEyes = root.face !== "up";
    eyeL.opacity = showEyes ? 1 : 0;
    eyeR.opacity = showEyes ? 1 : 0;
    mouth.opacity = showEyes ? 1 : 0;
    if (glassesL) { glassesL.opacity = showEyes ? 1 : 0; glassesR.opacity = showEyes ? 1 : 0; }
    for (const fh of facialHairParts) fh.opacity = showEyes ? (fh.id === "stubble" ? 0.45 : 1) : 0;
    // hair shape per face
    if (root.face === "up") {
      hairTop.height = 9 * s;
      hairL.opacity = 0; hairR.opacity = 0;
    } else {
      hairTop.height = 4 * s;
      hairL.opacity = root.face === "left" || root.face === "down" ? 1 : 0;
      hairR.opacity = root.face === "right" || root.face === "down" ? 1 : 0;
      if (root.face === "left") { hairL.width = 4 * s; hairL.height = 9 * s; }
      if (root.face === "right") { hairR.width = 4 * s; hairR.height = 9 * s; }
    }
    // eye offset by face
    const lxBase = -4 * s, rxBase = 2 * s;
    if (root.face === "left") { eyeL.pos.x = lxBase - 1 * s; eyeR.pos.x = rxBase - 1 * s; }
    else if (root.face === "right") { eyeL.pos.x = lxBase + 1 * s; eyeR.pos.x = rxBase + 1 * s; }
    else { eyeL.pos.x = lxBase; eyeR.pos.x = rxBase; }
  });

  return root;
}

