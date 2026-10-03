export type Mode = 'home' | 'node' | 'page' | 'shelf';

export interface AtlasNode {
  id: string;
  type: string;
  title: string;
  summary: string;
  pos: [number, number];
  posNarrow: [number, number];
  href: string;
}

export interface AtlasEdge {
  a: string;
  b: string;
  q: string;
}

export interface AtlasData {
  nodes: AtlasNode[];
  edges: AtlasEdge[];
}

export interface TitleSource {
  rect: DOMRect;
  fontSize: number;
}

interface AtlasCallbacks {
  open(id: string, source: Element | null): void;
  select(id: string | null): void;
}

interface Pt {
  x: number;
  y: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface LiveNode {
  n: AtlasNode;
  a: SVGAElement;
  label: SVGTextElement;
  bx: number;
  by: number;
  px: number;
  py: number;
  fx: number;
  fy: number;
  gx: number;
  gy: number;
  x: number;
  y: number;
  p1: number;
  p2: number;
  sp: number;
}

interface LiveEdge {
  e: AtlasEdge;
  path: SVGPathElement;
  label: SVGTextElement;
}

const NS = 'http://www.w3.org/2000/svg';
export const NARROW = 760;
const CAMERA_MS = 900;

const TYPE_LABEL: Record<string, string> = {
  question: 'Question',
  project: 'Work',
  essay: 'Essay',
  note: 'Note',
  photo: 'Photograph',
  past: 'Earlier',
};

function mk<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, parent?: Element) {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  parent?.append(el);
  return el;
}

function wrap(text: string, max: number) {
  const out: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && (line + ' ' + word).length > max) {
      out.push(line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) out.push(line);
  return out;
}

function setLines(t: SVGTextElement, lines: string[]) {
  t.textContent = '';
  lines.forEach((l, i) => {
    const s = mk('tspan', { x: 0, dy: i ? '1.18em' : 0 }, t);
    s.textContent = l;
  });
}

const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

function drawShape(parent: Element, type: string) {
  const g = mk('g', { class: 'shape' }, parent);
  if (type === 'question') {
    mk('circle', { class: 's-ring', r: 9 }, g);
    mk('circle', { class: 's-core', r: 2.2 }, g);
  } else if (type === 'project') {
    mk('circle', { class: 's-solid', r: 5.5 }, g);
  } else if (type === 'essay') {
    mk('rect', { class: 's-solid', x: -5, y: -5, width: 10, height: 10, transform: 'rotate(45)' }, g);
  } else if (type === 'note') {
    mk('rect', { class: 's-solid', x: -3.3, y: -3.3, width: 6.6, height: 6.6, transform: 'rotate(45)' }, g);
  } else if (type === 'photo') {
    mk('rect', { class: 's-photo', x: -5, y: -4, width: 10, height: 8 }, g);
  } else {
    mk('circle', { class: 's-past', r: 5 }, g);
  }
  mk('circle', { class: 'hit', r: 22 }, parent);
}

export function createAtlas(data: AtlasData, cb: AtlasCallbacks, initial: { mode: Mode; id: string }) {
  const scroller = document.getElementById('atlas-scroll') as HTMLElement;
  const svg = document.getElementById('atlas-svg') as unknown as SVGSVGElement;
  const hero = document.getElementById('hero') as HTMLElement;
  const header = document.querySelector('.site-header') as HTMLElement;
  const panel = document.getElementById('panel') as HTMLElement;
  const hint = document.getElementById('atlas-hint');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

  const gEdges = mk('g', {}, svg);
  const gNodes = mk('g', {}, svg);
  const gLabels = mk('g', {}, svg);

  const byId: Record<string, LiveNode> = {};
  const near: Record<string, Set<string>> = {};
  data.nodes.forEach((n) => (near[n.id] = new Set([n.id])));
  data.edges.forEach(({ a, b }) => {
    near[a].add(b);
    near[b].add(a);
  });

  let mode: Mode = initial.mode;
  let focus = initial.id;
  let selected: string | null = null;
  let lastPointer = 'mouse';
  let W = 0;
  let H = 0;
  let narrow = false;
  let headerH = 0;
  let tweenStart = -1;

  const nodes: LiveNode[] = data.nodes.map((n) => {
    const a = mk('a', {
      href: n.href,
      class: `node ${n.type}`,
      tabindex: 0,
      'aria-label': `${TYPE_LABEL[n.type] ?? ''}: ${n.title}`,
    }, gNodes) as SVGAElement;
    drawShape(a, n.type);
    const label = mk('text', { 'text-anchor': 'middle' }, a);
    const live: LiveNode = {
      n, a, label, bx: 0, by: 0, px: 0, py: 0, fx: 0, fy: 0, gx: 0, gy: 0, x: 0, y: 0,
      p1: Math.random() * 6.283, p2: Math.random() * 6.283, sp: 0.7 + Math.random() * 0.6,
    };
    byId[n.id] = live;

    a.addEventListener('pointerdown', (e) => (lastPointer = e.pointerType));
    a.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && hover(n.id));
    a.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && hover(null));
    a.addEventListener('focus', () => lastPointer !== 'touch' && hover(n.id));
    a.addEventListener('blur', () => hover(null));
    a.addEventListener('click', (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      e.stopPropagation();
      const touch = e.detail !== 0 && (lastPointer === 'touch' || lastPointer === 'pen');
      if (touch && mode === 'home' && selected !== n.id) {
        select(n.id);
        return;
      }
      cb.open(n.id, label);
    });
    return live;
  });

  const edges: LiveEdge[] = data.edges.map((e) => ({
    e,
    path: mk('path', { class: 'edge', pathLength: 1 }, gEdges),
    label: mk('text', { class: 'elabel', 'text-anchor': 'middle' }, gLabels),
  }));

  svg.addEventListener('click', () => selected && select(null));

  let hub: string | null = null;

  function applyHover(id: string | null) {
    hub = id;
    svg.classList.toggle('hovering', !!id);
    const set = id ? near[id] : null;
    for (const ln of nodes) ln.a.classList.toggle('h-near', !!set?.has(ln.n.id));
    for (const le of edges) {
      const on = !!id && (le.e.a === id || le.e.b === id);
      le.path.classList.toggle('h-near', on);
      le.label.classList.toggle('h-near', on);
    }
  }

  function hover(id: string | null) {
    applyHover(id ?? selected);
  }

  function select(id: string | null) {
    selected = id;
    applyHover(id);
    cb.select(id);
  }

  function applyFocus() {
    svg.dataset.mode = mode;
    const set = mode === 'node' && focus ? near[focus] : null;
    for (const ln of nodes) {
      const on = !!set?.has(ln.n.id);
      ln.a.classList.toggle('f-near', on);
      ln.a.classList.toggle('is-focus', mode === 'node' && ln.n.id === focus);
      ln.a.setAttribute('tabindex', mode === 'node' && !on ? '-1' : '0');
    }
    for (const le of edges) {
      const on = mode === 'node' && (le.e.a === focus || le.e.b === focus);
      le.path.classList.toggle('f-near', on);
      le.label.classList.toggle('f-near', on);
    }
  }

  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;height:var(--band);width:0';
  document.body.append(probe);

  function readingRect(): Rect {
    if (!narrow) {
      const pw = panel.offsetWidth;
      return { x: 24, y: headerH + 12, w: Math.max(W - pw - 48, 200), h: H - headerH - 36 };
    }
    const band = probe.offsetHeight || Math.round(H * 0.42);
    return { x: 8, y: headerH + 4, w: W - 16, h: Math.max(band - headerH - 10, 120) };
  }

  function radial(id: string, r: Rect): Record<string, Pt> {
    const out: Record<string, Pt> = {};
    const f = byId[id];
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2 - (narrow ? 4 : 10);
    out[id] = { x: cx, y: cy };
    const ring = [...near[id]].filter((n) => n !== id).map((n) => {
      const o = byId[n];
      return { id: n, a: Math.atan2(o.by - f.by, o.bx - f.bx) };
    }).sort((p, q) => p.a - q.a);
    const k = ring.length;
    if (k) {
      const gap = Math.min((2 * Math.PI) / k, Math.PI / 2.4) * 0.92;
      for (let pass = 0; pass < 24; pass++) {
        for (let i = 0; i < k; i++) {
          const a = ring[i];
          const b = ring[(i + 1) % k];
          let d = b.a - a.a;
          if (i === k - 1) d += 2 * Math.PI;
          if (k > 1 && d < gap) {
            const push = (gap - d) / 2;
            a.a -= push;
            b.a += push;
          }
        }
      }
      const labelW = narrow ? 62 : 96;
      const rx = Math.max(Math.min(r.w / 2 - labelW, narrow ? 150 : 330), 70);
      const ry = Math.max(Math.min(r.h / 2 - (narrow ? 34 : 56), narrow ? 120 : 260), 50);
      for (const n of ring) out[n.id] = { x: cx + rx * Math.cos(n.a), y: cy + ry * Math.sin(n.a) };
      {
        const pts = [id, ...ring.map((n) => n.id)].map((n) => out[n]);
        const mx = (Math.min(...pts.map((p) => p.x)) + Math.max(...pts.map((p) => p.x))) / 2;
        const my = (Math.min(...pts.map((p) => p.y)) + Math.max(...pts.map((p) => p.y))) / 2;
        for (const p of pts) {
          p.x += cx - mx;
          p.y += cy - my;
        }
      }
    }
    const spread = narrow ? 1.6 : 1.45;
    for (const ln of nodes) {
      if (out[ln.n.id]) continue;
      out[ln.n.id] = { x: cx + (ln.bx - f.bx) * spread, y: cy + (ln.by - f.by) * spread };
    }
    return out;
  }

  function fitAll(r: Rect): Record<string, Pt> {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const ln of nodes) {
      minX = Math.min(minX, ln.bx); maxX = Math.max(maxX, ln.bx);
      minY = Math.min(minY, ln.by); maxY = Math.max(maxY, ln.by);
    }
    const pad = narrow ? 24 : 60;
    const s = Math.min((r.w - 2 * pad) / Math.max(maxX - minX, 1), (r.h - 2 * pad) / Math.max(maxY - minY, 1), 1);
    const tx = r.x + r.w / 2 - ((minX + maxX) / 2) * s;
    const ty = r.y + r.h / 2 - ((minY + maxY) / 2) * s;
    return Object.fromEntries(nodes.map((ln) => [ln.n.id, { x: ln.bx * s + tx, y: ln.by * s + ty }]));
  }

  function targetsFor(m: Mode, id: string): Record<string, Pt> {
    if (m === 'node' && byId[id]) return radial(id, readingRect());
    if (m === 'page') return fitAll(readingRect());
    return Object.fromEntries(nodes.map((ln) => [ln.n.id, { x: ln.bx, y: ln.by }]));
  }

  function moveTo(targets: Record<string, Pt>, instant: boolean) {
    const jump = instant || reduce.matches;
    for (const ln of nodes) {
      const t = targets[ln.n.id];
      ln.fx = ln.px;
      ln.fy = ln.py;
      ln.gx = t.x;
      ln.gy = t.y;
      if (jump) {
        ln.px = t.x;
        ln.py = t.y;
      }
    }
    tweenStart = jump ? -1 : performance.now();
  }

  function layout() {
    W = window.innerWidth;
    H = window.innerHeight;
    narrow = W < NARROW;
    headerH = header.offsetHeight;
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    const full = !narrow && W >= 1180 && H >= 680;
    const top = full ? headerH + 28 : heroBottom + (narrow ? 30 : 40);
    const side = narrow ? 54 : Math.min(Math.max(W * 0.075, 70), 150);
    const bottom = narrow ? 120 : 100;
    const fh = Math.max(H - top - bottom, narrow ? 640 : 420);
    const contentH = Math.max(H, top + fh + bottom);
    svg.setAttribute('viewBox', `0 0 ${W} ${contentH}`);
    svg.style.height = `${contentH}px`;

    for (const ln of nodes) {
      const p = narrow ? ln.n.posNarrow : ln.n.pos;
      ln.bx = side + p[0] * (W - side * 2);
      ln.by = top + p[1] * fh;
      setLines(ln.label, wrap(ln.n.title, narrow ? 15 : 22));
      ln.label.setAttribute('y', String((ln.n.type === 'question' ? 9 : 6) + 18));
    }
    for (const le of edges) {
      const lines = wrap(le.e.q, narrow ? 24 : 30);
      setLines(le.label, lines);
      le.label.setAttribute('y', String(4 - (lines.length - 1) * 8));
    }
    if (hint) {
      hint.textContent = finePointer.matches
        ? 'Hover to see what connects. Click to open.'
        : 'Tap a point to see what connects.';
    }
    moveTo(targetsFor(mode, focus), true);
    draw(performance.now());
  }

  function draw(t: number) {
    if (tweenStart >= 0) {
      const k = Math.min((t - tweenStart) / CAMERA_MS, 1);
      const e = ease(k);
      for (const ln of nodes) {
        ln.px = ln.fx + (ln.gx - ln.fx) * e;
        ln.py = ln.fy + (ln.gy - ln.fy) * e;
      }
      if (k >= 1) tweenStart = -1;
    }
    const amp = reduce.matches ? 0 : mode === 'home' ? (narrow ? 2.5 : 4) : 1.6;
    for (const ln of nodes) {
      const k = t * 0.00035 * ln.sp;
      ln.x = ln.px + amp * Math.sin(k + ln.p1);
      ln.y = ln.py + amp * Math.cos(k * 0.8 + ln.p2);
      ln.a.setAttribute('transform', `translate(${ln.x.toFixed(1)},${ln.y.toFixed(1)})`);
    }
    for (const le of edges) {
      const a = byId[le.e.a];
      const b = byId[le.e.b];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const qx = (a.x + b.x) / 2 - dy * 0.12;
      const qy = (a.y + b.y) / 2 + dx * 0.12;
      le.path.setAttribute('d', `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`);
      const center = mode === 'node' ? focus : hub;
      const t = center === le.e.a ? 0.6 : center === le.e.b ? 0.4 : 0.5;
      const u = 1 - t;
      const mx = u * u * a.x + 2 * t * u * qx + t * t * b.x;
      const my = u * u * a.y + 2 * t * u * qy + t * t * b.y;
      le.label.setAttribute('transform', `translate(${mx.toFixed(1)},${my.toFixed(1)})`);
    }
  }

  function loop(t: number) {
    if (!document.hidden && (tweenStart >= 0 || !reduce.matches)) draw(t);
    requestAnimationFrame(loop);
  }

  function intro() {
    if (reduce.matches || mode !== 'home') return;
    const cx = W / 2;
    const cy = H / 2;
    for (const ln of nodes) {
      const d = Math.hypot(ln.bx - cx, ln.by - cy);
      ln.a.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 250 + d * 1.3, easing: 'ease-out', fill: 'backwards' });
    }
    for (const le of edges) {
      const a = byId[le.e.a];
      const b = byId[le.e.b];
      const d = Math.min(Math.hypot(a.bx - cx, a.by - cy), Math.hypot(b.bx - cx, b.by - cy));
      le.path.animate(
        [{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }],
        { duration: 1200, delay: 400 + d * 1.3, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'backwards' },
      );
    }
  }

  function setMode(next: Mode, id: string, instant = false) {
    mode = next;
    focus = id;
    if (selected) select(null);
    applyHover(null);
    if (mode === 'home') {
      scroller.classList.remove('locked');
    } else {
      const st = scroller.scrollTop;
      if (st) {
        for (const ln of nodes) ln.py -= st;
        scroller.scrollTop = 0;
      }
      scroller.classList.add('locked');
    }
    applyFocus();
    moveTo(targetsFor(mode, focus), instant);
  }

  function labelSource(id: string, atTarget = false): TitleSource | null {
    const ln = byId[id];
    if (!ln) return null;
    const fontSize = parseFloat(getComputedStyle(ln.label).fontSize);
    if (!atTarget) {
      const rect = ln.label.getBoundingClientRect();
      return rect.width ? { rect, fontSize } : null;
    }
    const box = ln.label.getBBox();
    const sr = svg.getBoundingClientRect();
    const x = sr.left + ln.gx + box.x;
    const y = sr.top + ln.gy + box.y;
    return { rect: new DOMRect(x, y, box.width, box.height), fontSize };
  }

  let lastW = 0;
  let lastH = 0;
  let pending = 0;
  addEventListener('resize', () => {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 140) return;
      lastW = w;
      lastH = h;
      layout();
    });
  });

  lastW = window.innerWidth;
  lastH = window.innerHeight;
  applyFocus();
  layout();
  if (mode !== 'home') scroller.classList.add('locked');
  intro();
  requestAnimationFrame(loop);
  document.fonts?.ready.then(() => layout());

  function point(id: string) {
    const ln = byId[id];
    if (!ln) return null;
    const sr = svg.getBoundingClientRect();
    return { x: sr.left + ln.gx, y: sr.top + ln.gy };
  }

  return { setMode, labelSource, select, point };
}
