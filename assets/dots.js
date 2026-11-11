// Animated halftone background, from Homelab Home. Decoration only.
// Each .dots canvas draws a 10px dot grid. A slowly drifting noise field sets every dot's size,
// so dots swell, shrink, and vanish in soft waves. The CSS mask on each canvas fades the edges.
// Dots keep clear of bare text (see clearText). Under prefers-reduced-motion it draws one still frame.
(() => {
  const GAP = 10;
  const MAX_R = 1.9;
  const SPEED = 0.6;       // field time units per second
  const SCALE = 420;       // px per noise cell; larger means broader waves
  const FRAME_MS = 1000 / 30;
  const PAD = 8;           // no dots this close to a line of text
  const FADE = 26;         // dots grow back to full size over this distance
  // Text inside these sits on its own opaque background, so dots behind it are hidden anyway.
  const PANELS = ".tile, .pill, .badge, .notch, .update, .skip, input, section[aria-labelledby='tldr'], script, style, noscript";

  const smooth = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const hash = (x, y) => {
    let n = Math.imul(x, 0x165667b1) + Math.imul(y, 0x27d4eb2f);
    n = Math.imul(n ^ (n >>> 13), 0x4bf19f61);
    return ((n ^ (n >>> 16)) >>> 0) / 0xffffffff;
  };
  // Value noise: smooth blend of random values on an integer lattice.
  const noise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const fx = x - xi, fy = y - yi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };

  const root = document.documentElement;
  const canvases = [...document.querySelectorAll("canvas.dots")].map((el) => ({
    el, ctx: el.getContext("2d"), w: 0, h: 0, x: 0, y: 0, cols: 0, keep: null,
  }));
  if (!canvases.length || !canvases[0].ctx) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let color = "#fff";
  let t = 0, last = 0, raf = 0;

  const readColor = () => { color = getComputedStyle(root).getPropertyValue("--dots").trim() || color; };

  // Give every dot a factor from 0 (on or near text) to 1 (clear of it). It uses the real line
  // boxes of each bare text node, not the full-width blocks, so a short line frees the space beside it.
  function clearText() {
    const reach = PAD + FADE;
    const near = (r, c) => r.r > c.x - reach && r.l < c.x + c.w + reach && r.b > c.y - reach && r.t < c.y + c.h + reach;
    const rects = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.nodeValue.trim() || node.parentElement.closest(PANELS)) continue;
      range.selectNodeContents(node);
      for (const b of range.getClientRects()) {
        const r = { l: b.left + scrollX, r: b.right + scrollX, t: b.top + scrollY, b: b.bottom + scrollY };
        if (r.r > r.l && canvases.some((c) => near(r, c))) rects.push(r);
      }
    }
    for (const c of canvases) {
      c.cols = Math.floor(c.w / GAP) + 1;
      c.keep = new Float32Array(c.cols * (Math.floor(c.h / GAP) + 1)).fill(1);
      const mine = rects.filter((r) => near(r, c));
      if (!mine.length) continue;
      for (let j = 0; j * GAP <= c.h; j++) {
        const wy = j * GAP + c.y;
        const row = mine.filter((r) => r.b > wy - reach && r.t < wy + reach);
        if (!row.length) continue;
        for (let i = 0; i * GAP <= c.w; i++) {
          const wx = i * GAP + c.x;
          let f = 1;
          for (const r of row) {
            const d = Math.hypot(Math.max(r.l - wx, 0, wx - r.r), Math.max(r.t - wy, 0, wy - r.b));
            if (d < reach) f = Math.min(f, smooth(PAD, reach, d));
          }
          c.keep[j * c.cols + i] = f;
        }
      }
    }
  }

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const c of canvases) {
      const r = c.el.getBoundingClientRect();
      c.w = r.width; c.h = r.height;
      c.x = r.left + scrollX; c.y = r.top + scrollY;
      c.el.width = Math.round(r.width * dpr);
      c.el.height = Math.round(r.height * dpr);
      c.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    clearText();
    draw();
  }

  function draw() {
    // Four slow, unrelated drifts keep the field wandering instead of scrolling.
    const s = SCALE, k = 1 / s;
    const ox = Math.sin(0.45 * t) * s * 0.42 + Math.cos(0.13 * t) * s * 0.12;
    const oy = Math.cos(0.36 * t) * s * 0.28 + Math.sin(0.17 * t) * s * 0.10;
    const px = Math.cos(0.31 * t + 1.8) * s * 0.34 + Math.sin(0.11 * t) * s * 0.14;
    const py = Math.sin(0.42 * t + 0.9) * s * 0.30 + Math.cos(0.16 * t) * s * 0.10;
    for (const c of canvases) {
      const g = c.ctx;
      g.clearRect(0, 0, c.w, c.h);
      g.fillStyle = color;
      g.beginPath();
      for (let j = 0; j * GAP <= c.h; j++) {
        const y = j * GAP, wy = y + c.y;
        for (let i = 0; i * GAP <= c.w; i++) {
          const keep = c.keep[j * c.cols + i];
          if (!keep) continue;
          const x = i * GAP, wx = x + c.x;
          // Page coordinates, so both patches sample one continuous field.
          const n = 0.72 * noise((wx + ox) * k, (wy + oy) * k)
                  + 0.28 * noise((wx + px) * k * 2.1 + 31.7, (wy + py) * k * 2.1 + 12.3);
          const r = MAX_R * smooth(0.3, 0.7, n) * keep;
          if (r < 0.3) continue;
          g.moveTo(x + r, y);
          g.arc(x, y, r, 0, Math.PI * 2);
        }
      }
      g.fill();
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (now - last < FRAME_MS) return;
    t += Math.min((now - last) / 1000, 0.1) * SPEED;
    last = now;
    draw();
  }

  function start() {
    cancelAnimationFrame(raf);
    if (reduced.matches || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  readColor();
  size();
  start();
  reduced.addEventListener("change", () => { start(); draw(); });
  document.addEventListener("visibilitychange", start);
  // Text moves when the page resizes, the fonts arrive, or the search list filters.
  new ResizeObserver(size).observe(document.body);
  if (document.fonts) document.fonts.ready.then(size);
  new MutationObserver(() => { readColor(); draw(); })
    .observe(root, { attributes: true, attributeFilter: ["data-theme"] });
})();
