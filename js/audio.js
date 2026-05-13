// =====================================================================
// AUDIO — procedural Web Audio (no asset files needed)
// =====================================================================
const Aud = (() => {
  let ctx = null;
  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(opts) {
    if (settings.muted) return;
    const c = ensure(); if (!c) return;
    const { freq = 440, dur = 0.1, type = "sine", vol = 0.3, sweep = 0, q = 0 } = opts;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    if (sweep) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq + sweep), c.currentTime + dur);
    gain.gain.value = 0;
    const v = vol * settings.volume;
    gain.gain.linearRampToValueAtTime(v, c.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    if (q) {
      const filter = c.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = q;
      osc.connect(filter); filter.connect(gain);
    } else osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + dur + 0.02);
  }
  function noise(opts) {
    if (settings.muted) return;
    const c = ensure(); if (!c) return;
    const { dur = 0.1, vol = 0.2, q = 1000 } = opts;
    const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = q;
    const gain = c.createGain();
    const v = vol * settings.volume;
    gain.gain.value = v;
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    src.connect(filter); filter.connect(gain); gain.connect(c.destination);
    src.start();
    src.stop(c.currentTime + dur);
  }
  return {
    step: () => noise({ dur: 0.05, vol: 0.12, q: 800 + Math.random() * 400 }),
    uiBlip: () => tone({ freq: 540, dur: 0.05, type: "square", vol: 0.15 }),
    uiSelect: () => tone({ freq: 720, dur: 0.08, type: "square", vol: 0.2 }),
    uiBack: () => tone({ freq: 320, dur: 0.08, type: "square", vol: 0.18 }),
    dialogOpen: () => tone({ freq: 240, dur: 0.18, type: "triangle", vol: 0.25, sweep: 80 }),
    dialogTick: () => tone({ freq: 1200 + Math.random() * 400, dur: 0.02, type: "square", vol: 0.05 }),
    phone: () => { tone({ freq: 880, dur: 0.15, type: "sine", vol: 0.3 }); setTimeout(() => tone({ freq: 660, dur: 0.15, type: "sine", vol: 0.3 }), 200); },
    elevatorDing: () => { tone({ freq: 880, dur: 0.4, type: "sine", vol: 0.35 }); setTimeout(() => tone({ freq: 1320, dur: 0.6, type: "sine", vol: 0.3 }), 100); },
    nexai: () => { tone({ freq: 80, dur: 0.4, type: "sawtooth", vol: 0.3, q: 600 }); tone({ freq: 120, dur: 0.4, type: "square", vol: 0.15 }); },
    serverHum: () => noise({ dur: 0.4, vol: 0.04, q: 400 }),
    save: () => { tone({ freq: 520, dur: 0.08, type: "square", vol: 0.2 }); setTimeout(() => tone({ freq: 780, dur: 0.12, type: "square", vol: 0.2 }), 80); }
  };
})();

// Parse "#rgb", "#rrggbb" or "rgba(...)" into [r, g, b, alpha]
function parseColor(input) {
  if (typeof input !== "string") return [255, 255, 255, 1];
  if (input.startsWith("rgba") || input.startsWith("rgb")) {
    const m = input.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const p = m[1].split(",").map((s) => parseFloat(s.trim()));
      return [p[0] || 0, p[1] || 0, p[2] || 0, p[3] == null ? 1 : p[3]];
    }
  }
  const s = input.replace("#", "");
  const v = s.length === 3
    ? s.split("").map((c) => parseInt(c + c, 16))
    : [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  return [v[0], v[1], v[2], 1];
}
function colorComp(input) {
  const [r, g, b] = parseColor(input);
  return k.color(r, g, b);
}
function rgbValue(input) {
  const [r, g, b] = parseColor(input);
  return k.rgb(r, g, b);
}

