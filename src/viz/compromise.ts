const NS = 'http://www.w3.org/2000/svg';

const STYLE = `
viz-compromise { --row: 46px; color: var(--ink); }
viz-compromise svg { width: 100%; height: auto; display: block; overflow: visible; touch-action: none; }
viz-compromise .vc-guide { stroke: var(--line-soft); stroke-width: 1; }
viz-compromise .vc-track { stroke: var(--line); stroke-width: 1; }
viz-compromise .vc-name { font-size: 15px; fill: var(--muted); font-style: italic; }
viz-compromise .vc-cat { font-size: 14px; fill: var(--muted); }
viz-compromise .vc-handle { cursor: grab; outline: none; }
viz-compromise .vc-handle:active { cursor: grabbing; }
viz-compromise .vc-handle circle.dot { fill: var(--ink); transition: r .25s; }
viz-compromise .vc-handle circle.halo { fill: transparent; stroke: var(--accent); stroke-width: 1; opacity: 0; transition: opacity .25s; }
viz-compromise .vc-handle:hover circle.halo, viz-compromise .vc-handle:focus-visible circle.halo, viz-compromise .vc-handle.drag circle.halo { opacity: 1; }
viz-compromise .vc-span { stroke: var(--accent); stroke-width: 1.5; opacity: .45; }
viz-compromise .vc-end { stroke: var(--accent); stroke-width: 1.5; }
viz-compromise .vc-out-ring { fill: var(--sheet); stroke: var(--accent); stroke-width: 1.6; }
viz-compromise .vc-out-core { fill: var(--accent); }
viz-compromise .vc-out-name { font-size: 15px; fill: var(--accent); font-style: italic; }
viz-compromise .vc-controls { display: grid; grid-template-columns: auto 1fr auto; gap: .35rem .9rem; align-items: center; margin-top: 1rem; font-size: .95rem; color: var(--muted); font-style: italic; }
viz-compromise .vc-controls output { grid-column: 1 / -1; font-style: normal; color: var(--ink); font-size: 1.0625rem; line-height: 1.5; margin-top: .4rem; }
viz-compromise input[type=range] { width: 100%; accent-color: var(--accent); }
`;

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent: Element) {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  parent.append(el);
  return el;
}

export function mount(host: HTMLElement) {
  if (!document.getElementById('viz-compromise-style')) {
    const s = document.createElement('style');
    s.id = 'viz-compromise-style';
    s.textContent = STYLE;
    document.head.append(s);
  }

  const cats = (host.dataset.scale ?? '1,2,3,4,5').split(',').map((c) => c.trim());
  const K = cats.length;
  const sources = (host.dataset.sources ?? 'A:1,B:3,C:2').split(',').map((p) => {
    const [name, v] = p.split(':');
    const i = cats.indexOf((v ?? '').trim());
    return { name: name.trim(), i: i < 0 ? 0 : i, shown: i < 0 ? 0 : i };
  });
  let alpha = Number(host.dataset.alpha ?? 0.5);

  const W = 640;
  const L = 118;
  const R = W - 24;
  const top = 18;
  const row = 46;
  const outY = top + sources.length * row + 22;
  const axisY = outY + 40;
  const H = axisY + 14;
  const xOf = (i: number) => L + (i / (K - 1)) * (R - L);

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', 'Sources and the integrated output on an ordinal scale');
  host.append(svg);

  cats.forEach((c, i) => {
    svgEl('line', { class: 'vc-guide', x1: xOf(i), x2: xOf(i), y1: top - 6, y2: outY + 14 }, svg);
    const t = svgEl('text', { class: 'vc-cat', x: xOf(i), y: axisY, 'text-anchor': 'middle' }, svg);
    t.textContent = c;
  });

  const handles = sources.map((src, r) => {
    const y = top + r * row + 12;
    svgEl('line', { class: 'vc-track', x1: L, x2: R, y1: y, y2: y }, svg);
    const name = svgEl('text', { class: 'vc-name', x: L - 22, y: y + 5, 'text-anchor': 'end' }, svg);
    name.textContent = src.name;
    const g = svgEl('g', {
      class: 'vc-handle', tabindex: 0, role: 'slider',
      'aria-label': src.name, 'aria-valuemin': 0, 'aria-valuemax': K - 1,
    }, svg);
    svgEl('circle', { class: 'halo', r: 13 }, g);
    svgEl('circle', { class: 'dot', r: 6.5 }, g);
    svgEl('circle', { r: 22, fill: 'transparent' }, g);
    return { g, y };
  });

  svgEl('line', { class: 'vc-track', x1: L, x2: R, y1: outY, y2: outY, 'stroke-dasharray': '2 3' }, svg);
  const outName = svgEl('text', { class: 'vc-out-name', x: L - 22, y: outY + 5, 'text-anchor': 'end' }, svg);
  outName.textContent = 'Integrator';
  const span = svgEl('line', { class: 'vc-span', y1: outY, y2: outY }, svg);
  const endLo = svgEl('line', { class: 'vc-end', y1: outY - 7, y2: outY + 7 }, svg);
  const endHi = svgEl('line', { class: 'vc-end', y1: outY - 7, y2: outY + 7 }, svg);
  const out = svgEl('g', {}, svg);
  svgEl('circle', { class: 'vc-out-ring', r: 9 }, out);
  svgEl('circle', { class: 'vc-out-core', r: 2.4 }, out);

  const controls = document.createElement('div');
  controls.className = 'vc-controls';
  controls.innerHTML = `
    <span>Follows the lowest</span>
    <input type="range" min="0" max="1" step="0.01" aria-label="Integrator weight toward the highest source">
    <span>Follows the highest</span>
    <output aria-live="polite"></output>`;
  host.append(controls);
  const range = controls.querySelector('input')!;
  const readout = controls.querySelector('output')!;
  range.value = String(alpha);

  let outShown = 0;
  let raf = 0;

  const values = () => sources.map((s) => s.i);
  const outTarget = () => {
    const v = values();
    const lo = Math.min(...v);
    const hi = Math.max(...v);
    return { lo, hi, x: alpha * hi + (1 - alpha) * lo };
  };

  function describe() {
    const { lo, hi, x } = outTarget();
    if (lo === hi) {
      readout.textContent = `All three sources say ${cats[lo]}. There is nothing to integrate.`;
      return;
    }
    const nums = cats.map(Number);
    const numeric = nums.every((n) => Number.isFinite(n));
    const f = Math.floor(x);
    const c = Math.min(f + 1, K - 1);
    const at = numeric ? (nums[f] + (x - f) * (nums[c] - nums[f])).toFixed(2) : `about ${cats[Math.round(x)]}`;
    readout.textContent =
      `With α = ${alpha.toFixed(2)}, the integrator lands at ${at}, ` +
      `between the lowest source at ${cats[lo]} and the highest at ${cats[hi]}.`;
  }

  function render() {
    let moving = false;
    sources.forEach((s, r) => {
      const d = s.i - s.shown;
      s.shown = Math.abs(d) < 0.002 ? s.i : s.shown + d * 0.22;
      if (s.shown !== s.i) moving = true;
      handles[r].g.setAttribute('transform', `translate(${xOf(s.shown)},${handles[r].y})`);
      handles[r].g.setAttribute('aria-valuenow', String(s.i));
      handles[r].g.setAttribute('aria-valuetext', cats[s.i]);
    });
    const t = outTarget();
    const d = t.x - outShown;
    outShown = Math.abs(d) < 0.002 ? t.x : outShown + d * 0.18;
    if (outShown !== t.x) moving = true;
    const shownVals = sources.map((s) => s.shown);
    const lo = xOf(Math.min(...shownVals));
    const hi = xOf(Math.max(...shownVals));
    span.setAttribute('x1', String(lo));
    span.setAttribute('x2', String(hi));
    endLo.setAttribute('x1', String(lo)); endLo.setAttribute('x2', String(lo));
    endHi.setAttribute('x1', String(hi)); endHi.setAttribute('x2', String(hi));
    out.setAttribute('transform', `translate(${xOf(outShown)},${outY})`);
    raf = moving ? requestAnimationFrame(render) : 0;
  }

  function kick() {
    describe();
    if (!raf) raf = requestAnimationFrame(render);
  }

  function toIndex(clientX: number) {
    const m = svg.getScreenCTM();
    if (!m) return 0;
    const pt = new DOMPoint(clientX, 0).matrixTransform(m.inverse());
    return Math.max(0, Math.min(K - 1, Math.round(((pt.x - L) / (R - L)) * (K - 1))));
  }

  handles.forEach(({ g }, r) => {
    g.addEventListener('pointerdown', (e) => {
      g.setPointerCapture(e.pointerId);
      g.classList.add('drag');
      e.preventDefault();
    });
    g.addEventListener('pointermove', (e) => {
      if (!g.hasPointerCapture(e.pointerId)) return;
      const i = toIndex(e.clientX);
      if (i !== sources[r].i) {
        sources[r].i = i;
        kick();
      }
    });
    const end = () => g.classList.remove('drag');
    g.addEventListener('pointerup', end);
    g.addEventListener('pointercancel', end);
    g.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      sources[r].i = Math.max(0, Math.min(K - 1, sources[r].i + step));
      kick();
    });
  });

  range.addEventListener('input', () => {
    alpha = Number(range.value);
    kick();
  });

  outShown = outTarget().x;
  sources.forEach((s) => (s.shown = s.i));
  describe();
  render();

  return () => cancelAnimationFrame(raf);
}
