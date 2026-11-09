window.startField = function (host) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  host.classList.add("field");
  host.insertAdjacentHTML("afterbegin", `
    <canvas class="fld-canvas" aria-label="Five classic models of hidden structure and emergence, simulated live in turn"></canvas>
    <div class="fld-card fld-out"><div class="fld-f"></div><div class="fld-t"></div><div class="fld-r"></div><div class="fld-u"></div><div class="fld-v"></div></div>
    <div class="fld-txt">
      <div class="fld-name">Qiyu Yang</div>
      <div class="fld-line">Looking for the hidden structure of living and thinking systems.</div>
      <div class="fld-keys">Complex systems <span>·</span> Topology <span>·</span> Perception &amp; cognition <span>·</span> Biology × AI</div>
    </div>
    <div class="fld-ctl"><button type="button" class="fld-next">Next model</button><button type="button" class="fld-play">Pause</button></div>`);
  const q = s => host.querySelector(s);
  const cv = q(".fld-canvas"), g = cv.getContext("2d");
  let W = 0, H = 0, DPR = 1;
  let seed = 3;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const smooth = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

  const SPR = {};
  function sprite(h, s = 100, l = 62) {
    const hh = Math.round(h / 4) * 4, key = `${hh}|${s}|${l}`; if (SPR[key]) return SPR[key];
    const c = document.createElement("canvas"), n = 40; c.width = c.height = n;
    const x = c.getContext("2d"), gr = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    gr.addColorStop(0, `hsla(${hh},${s}%,94%,1)`); gr.addColorStop(0.22, `hsla(${hh},${s}%,${l}%,0.75)`); gr.addColorStop(0.6, `hsla(${hh},${s}%,${l - 8}%,0.12)`); gr.addColorStop(1, `hsla(${hh},${s}%,50%,0)`);
    x.fillStyle = gr; x.fillRect(0, 0, n, n); return (SPR[key] = c);
  }
  function cam(x, y, z, yaw, pitch, sc, cx, cy) {
    const cyw = Math.cos(yaw), syw = Math.sin(yaw);
    let X = x * cyw + z * syw, Z = -x * syw + z * cyw;
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const Y = y * cp - Z * sp; Z = y * sp + Z * cp;
    const k = 3.4 / (3.4 + Z);
    return [cx + X * sc * k, cy + Y * sc * k, k];
  }
  const narrow = () => W < 700;
  const center = () => [W * (narrow() ? 0.5 : 0.63), H * (narrow() ? 0.36 : 0.46), Math.min(W, H) * (narrow() ? 0.34 : 0.37)];
  const big = () => W * H > 900000;

  const rips = {
    field: "Topology · Data", title: "Hidden structure", ref: "Vietoris–Rips complex; grand tour, Asimov 1985",
    rule: "Points in six dimensions, seen from a slowly turning angle. Pairs closer than ε are joined; a loop, a branching tree and a sheet emerge as ε grows.",
    accent: "#52f2ff", fade: 0.3,
    built: false,
    build() {
      const D = 6, N = this.N = big() ? 1400 : 900, P = this.P = [];
      const add = (v, c) => P.push({ x: v, c, j: Array.from({ length: D }, () => gauss() * 0.012), ph: rnd() * 6.28 });
      for (let i = 0; i < N; i++) {
        const r = rnd(), v = new Array(D).fill(0);
        if (r < 0.34) {
          const a = rnd() * Math.PI * 2; v[0] = Math.cos(a) * 1.15; v[1] = Math.sin(a) * 1.15; v[4] = Math.sin(2 * a) * 0.25;
          for (let d = 0; d < D; d++) v[d] += gauss() * 0.045; v[0] -= 0.9; v[2] += 0.5; add(v, a / (Math.PI * 2) * 0.33);
        } else if (r < 0.68) {
          const s = rnd(), b = Math.floor(rnd() * 3);
          if (s < 0.4) v[2] = -1.3 + s * 2.4; else { const u = (s - 0.4) / 0.6, ang = [-0.9, 0, 0.9][b]; v[2] = -0.34 + u * 1.3 * Math.cos(ang * 0.6); v[3] = u * 1.3 * Math.sin(ang); v[5] = u * u * 0.6 * (b - 1); }
          for (let d = 0; d < D; d++) v[d] += gauss() * 0.04; v[0] += 0.8; v[1] -= 0.3; add(v, 0.36 + s * 0.3);
        } else {
          const u = rnd() * 2 - 1, w = rnd() * 2 - 1; v[1] = u * 0.95; v[3] = w * 0.95; v[5] = Math.sin(u * 2.4) * Math.cos(w * 2.0) * 0.35; v[0] = 0.15;
          for (let d = 0; d < D; d++) v[d] += gauss() * 0.035; v[2] -= 1.2; v[4] += 0.6; add(v, 0.7 + (u + 1) * 0.14);
        }
      }
      const K = 7, E = this.E = [], seen = new Set(), nbr = P.map(() => []);
      const dist = (a, b) => { let s = 0; for (let d = 0; d < D; d++) { const z = a[d] - b[d]; s += z * z; } return Math.sqrt(s); };
      for (let i = 0; i < N; i++) {
        const best = [];
        for (let j = 0; j < N; j++) if (j !== i) { const dd = dist(P[i].x, P[j].x); if (best.length < K) { best.push([dd, j]); best.sort((a, b) => a[0] - b[0]); } else if (dd < best[K - 1][0]) { best[K - 1] = [dd, j]; best.sort((a, b) => a[0] - b[0]); } }
        for (const [dd, j] of best) { nbr[i].push(j); const key = i < j ? i * N + j : j * N + i; if (!seen.has(key)) { seen.add(key); E.push([i, j, dd]); } }
      }
      const len = new Map(E.map(([a, b, d]) => [a < b ? a * N + b : b * N + a, d])), L = (a, b) => len.get(a < b ? a * N + b : b * N + a);
      const T = this.T = [];
      for (let i = 0; i < N; i++) for (let x = 0; x < nbr[i].length; x++) for (let y = x + 1; y < nbr[i].length; y++) {
        const a = nbr[i][x], b = nbr[i][y]; if (!(i < a && a < b)) continue;
        const ab = L(a, b); if (ab === undefined) continue; T.push([i, a, b, Math.max(L(i, a), L(i, b), ab)]);
      }
      const s = E.map(e => e[2]).sort((a, b) => a - b); this.lo = s[Math.floor(0.08 * (s.length - 1))]; this.hi = s[Math.floor(0.93 * (s.length - 1))];
      this.S = new Float32Array(N * 3); this.parent = new Int32Array(N); this.built = true;
    },
    init() { if (!this.built) this.build(); },
    step(t, local) { this.eps = this.lo + (this.hi - this.lo) * (0.5 - 0.5 * Math.cos(local * 2 * Math.PI / 30)); },
    draw(t) {
      const { N, P, S, E, T, parent } = this, [cx, cy0, sc0] = center(), sc = sc0 * 0.66, cy = cy0 + sc0 * 0.08, D = 6;
      const planes = [[0, 2, 0.071], [1, 3, 0.053], [0, 4, 0.043], [2, 5, 0.061], [1, 4, 0.037], [3, 5, 0.029], [0, 1, 0.019], [4, 5, 0.023]], tt = t + 20, v = new Array(D);
      for (let i = 0; i < N; i++) {
        const p = P[i];
        for (let d = 0; d < D; d++) v[d] = p.x[d] + p.j[d] * Math.sin(tt * 0.7 + p.ph + d);
        for (const [a, b, w] of planes) { const th = w * tt + a, c = Math.cos(th), s = Math.sin(th), va = v[a], vb = v[b]; v[a] = c * va - s * vb; v[b] = s * va + c * vb; }
        const z = v[2] * 0.6 + v[5] * 0.3, k = 4 / (4 + z);
        S[i * 3] = cx + (v[0] + v[3] * 0.15) * sc * k; S[i * 3 + 1] = cy + (v[1] + v[4] * 0.15) * sc * k; S[i * 3 + 2] = k;
      }
      const eps = this.eps, B = 5; g.globalCompositeOperation = "lighter";
      const tp = Array.from({ length: B }, () => new Path2D());
      for (const [a, b, c, m] of T) { if (m > eps * 0.92) continue; const k = Math.min(B - 1, Math.floor((1 - m / (eps * 0.92)) * B)), p = tp[k]; p.moveTo(S[a * 3], S[a * 3 + 1]); p.lineTo(S[b * 3], S[b * 3 + 1]); p.lineTo(S[c * 3], S[c * 3 + 1]); p.closePath(); }
      tp.forEach((p, k) => { g.fillStyle = `hsla(${238 + k * 10},100%,62%,${0.02 + k * 0.018})`; g.fill(p); });
      for (let i = 0; i < N; i++) parent[i] = i;
      const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
      let comps = N, edges = 0; const ep = Array.from({ length: B }, () => new Path2D());
      for (const [a, b, d] of E) { if (d > eps) continue; edges++; const ra = find(a), rb = find(b); if (ra !== rb) { parent[ra] = rb; comps--; } const k = Math.min(B - 1, Math.floor((1 - d / eps) * B)); ep[k].moveTo(S[a * 3], S[a * 3 + 1]); ep[k].lineTo(S[b * 3], S[b * 3 + 1]); }
      g.lineWidth = 0.8; ep.forEach((p, k) => { g.strokeStyle = `hsla(${190 + k * 8},100%,72%,${0.1 + k * 0.09})`; g.stroke(p); });
      const hue = x => { x = ((x % 1) + 1) % 1; const a = [188, 236, 300, 252, 188], p = x * 4, i = Math.floor(p); return a[i] + (a[i + 1] - a[i]) * (p - i); };
      for (let i = 0; i < N; i++) { const k = S[i * 3 + 2], r = 1.2 + k * 1.5; g.globalAlpha = 0.55 + 0.45 * Math.min(1, k); g.drawImage(sprite(hue(P[i].c)), S[i * 3] - r * 2.4, S[i * 3 + 1] - r * 2.4, r * 4.8, r * 4.8); }
      g.globalAlpha = 1; this.edges = edges; this.comps = comps;
    },
    readout() { return `ε <b>${this.eps.toFixed(3)}</b> · edges <b>${(this.edges || 0).toLocaleString()}</b><br>components β₀ <b>${this.comps || 0}</b> · dim <b>6 → 2</b>`; },
  };

  const vicsek = {
    field: "Biology · Physics", title: "Collective motion", ref: "Vicsek et al., 1995",
    rule: "Each agent turns toward the average heading of its neighbours, plus noise. As noise falls, a flock appears.",
    accent: "#52f2ff", fade: 0.2,
    init() {
      this.N = big() ? 900 : 600; this.R = 0.17; this.v0 = 0.011; this.L = 2;
      this.p = new Float32Array(this.N * 3); this.v = new Float32Array(this.N * 3);
      for (let i = 0; i < this.N; i++) { for (let d = 0; d < 3; d++) this.p[i * 3 + d] = rnd() * 2 - 1; const a = gauss(), b = gauss(), c = gauss(), n = Math.hypot(a, b, c) || 1; this.v[i * 3] = a / n; this.v[i * 3 + 1] = b / n; this.v[i * 3 + 2] = c / n; }
      this.C = Math.floor(this.L / this.R); this.phi = 0; this.eta = 0;
    },
    step(t, local) {
      const { N, R, C, p, v } = this, eta = 0.08 + 0.75 * (0.5 + 0.5 * Math.cos(local * 2 * Math.PI / 30)); this.eta = eta;
      const heads = new Int32Array(C * C * C).fill(-1), next = new Int32Array(N), ci = x => clamp(Math.floor((x + 1) / this.L * C), 0, C - 1);
      for (let i = 0; i < N; i++) { const c = (ci(p[i * 3]) * C + ci(p[i * 3 + 1])) * C + ci(p[i * 3 + 2]); next[i] = heads[c]; heads[c] = i; }
      const nv = new Float32Array(N * 3); let sx = 0, sy = 0, sz = 0;
      for (let i = 0; i < N; i++) {
        const cx = ci(p[i * 3]), cy = ci(p[i * 3 + 1]), cz = ci(p[i * 3 + 2]); let ax = 0, ay = 0, az = 0;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
          const c = (((cx + dx + C) % C) * C + ((cy + dy + C) % C)) * C + ((cz + dz + C) % C);
          for (let j = heads[c]; j !== -1; j = next[j]) {
            let ex = p[j * 3] - p[i * 3], ey = p[j * 3 + 1] - p[i * 3 + 1], ez = p[j * 3 + 2] - p[i * 3 + 2];
            if (ex > 1) ex -= 2; else if (ex < -1) ex += 2; if (ey > 1) ey -= 2; else if (ey < -1) ey += 2; if (ez > 1) ez -= 2; else if (ez < -1) ez += 2;
            if (ex * ex + ey * ey + ez * ez < R * R) { ax += v[j * 3]; ay += v[j * 3 + 1]; az += v[j * 3 + 2]; }
          }
        }
        let n = Math.hypot(ax, ay, az) || 1; ax /= n; ay /= n; az /= n;
        const a = gauss(), b = gauss(), c = gauss(), m = Math.hypot(a, b, c) || 1;
        ax += eta * a / m; ay += eta * b / m; az += eta * c / m; n = Math.hypot(ax, ay, az) || 1;
        nv[i * 3] = ax / n; nv[i * 3 + 1] = ay / n; nv[i * 3 + 2] = az / n; sx += nv[i * 3]; sy += nv[i * 3 + 1]; sz += nv[i * 3 + 2];
      }
      this.v = nv; this.phi = Math.hypot(sx, sy, sz) / N;
      for (let i = 0; i < N * 3; i++) { let z = p[i] + nv[i] * this.v0; if (z > 1) z -= 2; else if (z < -1) z += 2; p[i] = z; }
    },
    draw(t) {
      const [cx, cy, sc] = center(), yaw = t * 0.12, pitch = 0.38, s = sc * 0.62;
      g.globalCompositeOperation = "lighter"; g.lineCap = "round"; g.strokeStyle = "rgba(82,242,255,0.07)"; g.lineWidth = 1;
      const cube = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]], ed = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      const cp = cube.map(z => cam(z[0], z[1], z[2], yaw, pitch, s, cx, cy));
      g.beginPath(); for (const [a, b] of ed) { g.moveTo(cp[a][0], cp[a][1]); g.lineTo(cp[b][0], cp[b][1]); } g.stroke();
      for (let i = 0; i < this.N; i++) {
        const x = this.p[i * 3], y = this.p[i * 3 + 1], z = this.p[i * 3 + 2], vx = this.v[i * 3], vy = this.v[i * 3 + 1], vz = this.v[i * 3 + 2];
        const A = cam(x, y, z, yaw, pitch, s, cx, cy), B = cam(x - vx * 0.07, y - vy * 0.07, z - vz * 0.07, yaw, pitch, s, cx, cy), hue = 180 + (Math.atan2(vz, vx) / Math.PI + 1) * 40;
        g.strokeStyle = `hsla(${hue},100%,${62 + A[2] * 10}%,${0.35 + 0.5 * A[2]})`; g.lineWidth = 0.6 + A[2] * 1.4;
        g.beginPath(); g.moveTo(B[0], B[1]); g.lineTo(A[0], A[1]); g.stroke();
        const r = 1.2 + A[2] * 1.6; g.drawImage(sprite(hue), A[0] - r * 2, A[1] - r * 2, r * 4, r * 4);
      }
    },
    readout() { return `noise η <b>${this.eta.toFixed(2)}</b> · polarization φ <b>${this.phi.toFixed(3)}</b>`; },
  };

  const opinion = {
    field: "Social science", title: "Opinion dynamics", ref: "Deffuant et al., 2000",
    rule: "Neighbours who already roughly agree move their opinions closer. Height and colour show opinion; consensus forms in layers.",
    accent: "#ff9a52", fade: 0.28,
    init() {
      const N = this.N = big() ? 650 : 450; this.x = new Float32Array(N); this.y = new Float32Array(N); this.o = new Float32Array(N); this.nb = [];
      for (let i = 0; i < N; i++) { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()); this.x[i] = Math.cos(a) * r; this.y[i] = Math.sin(a) * r; this.o[i] = rnd(); }
      for (let i = 0; i < N; i++) { const l = []; for (let j = 0; j < N; j++) if (j !== i) { const dx = this.x[i] - this.x[j], dy = this.y[i] - this.y[j]; if (dx * dx + dy * dy < 0.022) l.push(j); } this.nb.push(l); }
      this.eps = 0.2; this.k = 0;
    },
    step(t, local) {
      this.eps = 0.13 + 0.14 * (0.5 - 0.5 * Math.cos(local * 2 * Math.PI / 34));
      const { N, nb, o } = this, mu = 0.25;
      for (let s = 0; s < N; s++) { const i = Math.floor(rnd() * N), l = nb[i]; if (!l.length) continue; const j = l[Math.floor(rnd() * l.length)], d = o[j] - o[i]; if (Math.abs(d) < this.eps) { o[i] += mu * d; o[j] -= mu * d; } }
      if (rnd() < 0.35) o[Math.floor(rnd() * N)] = rnd();
      const srt = Array.from(o).sort((a, b) => a - b); let k = 0, run = 1;
      for (let i = 1; i < N; i++) { if (srt[i] - srt[i - 1] > 0.02) { if (run >= 8) k++; run = 1; } else run++; } if (run >= 8) k++; this.k = k;
    },
    draw(t) {
      const [cx, cy, sc] = center(), yaw = t * 0.1 + 0.6, pitch = 0.55, { N, x, y, o, nb } = this, hueO = v => (330 + v * 80) % 360, P = new Array(N);
      for (let i = 0; i < N; i++) P[i] = cam(x[i] * 1.05, (0.5 - o[i]) * 1.1, y[i] * 1.05, yaw, pitch, sc * 0.78, cx, cy);
      g.globalCompositeOperation = "lighter"; g.lineWidth = 0.7;
      const bk = Array.from({ length: 6 }, () => new Path2D());
      for (let i = 0; i < N; i++) for (const j of nb[i]) if (j > i && Math.abs(o[i] - o[j]) < this.eps) { const b = Math.min(5, Math.floor((o[i] + o[j]) / 2 * 6)); bk[b].moveTo(P[i][0], P[i][1]); bk[b].lineTo(P[j][0], P[j][1]); }
      bk.forEach((p, b) => { g.strokeStyle = `hsla(${hueO((b + 0.5) / 6)},95%,62%,0.28)`; g.stroke(p); });
      for (let i = 0; i < N; i++) { const r = 1.6 + P[i][2] * 2.2; g.drawImage(sprite(hueO(o[i]), 95, 62), P[i][0] - r * 2, P[i][1] - r * 2, r * 4, r * 4); }
    },
    readout() { return `confidence ε <b>${this.eps.toFixed(3)}</b> · opinion clusters <b>${this.k}</b>`; },
  };

  const gray = {
    field: "Chemistry · Development", title: "Reaction–diffusion", ref: "Gray–Scott model, Pearson 1993",
    rule: "Two chemicals diffuse at different speeds and one feeds on the other. Spots, stripes and mazes form with no blueprint.",
    accent: "#7dffb4", fade: 1,
    init() {
      const w = this.w = Math.min(190, Math.round(W / 7)), h = this.h = Math.max(60, Math.round(w * H / W));
      this.U = new Float32Array(w * h).fill(1); this.V = new Float32Array(w * h); this.U2 = new Float32Array(w * h); this.V2 = new Float32Array(w * h);
      for (let s = 0; s < 26; s++) { const cx = Math.floor(rnd() * w), cy = Math.floor(rnd() * h), r = 2 + Math.floor(rnd() * 3); for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const i = ((cy + y + h) % h) * w + ((cx + x + w) % w); this.U[i] = 0.5; this.V[i] = 0.25 + rnd() * 0.05; } }
      this.cvs = document.createElement("canvas"); this.cvs.width = w; this.cvs.height = h; this.cx = this.cvs.getContext("2d"); this.img = this.cx.createImageData(w, h); this.n = 0; this.F = 0.037; this.k = 0.061;
    },
    step(t, local) {
      this.F = 0.03 + 0.012 * (0.5 - 0.5 * Math.cos(local * 2 * Math.PI / 34));
      const { w, h } = this, Du = 0.16, Dv = 0.08, F = this.F, k = this.k;
      for (let s = 0; s < 8; s++) {
        const U = this.U, V = this.V, U2 = this.U2, V2 = this.V2;
        for (let y = 0; y < h; y++) {
          const yu = ((y - 1 + h) % h) * w, yd = ((y + 1) % h) * w, yc = y * w;
          for (let x = 0; x < w; x++) {
            const xl = (x - 1 + w) % w, xr = (x + 1) % w, i = yc + x, u = U[i], v = V[i];
            const lu = U[yu + x] + U[yd + x] + U[yc + xl] + U[yc + xr] - 4 * u, lv = V[yu + x] + V[yd + x] + V[yc + xl] + V[yc + xr] - 4 * v, uvv = u * v * v;
            U2[i] = u + Du * lu - uvv + F * (1 - u); V2[i] = v + Dv * lv + uvv - (F + k) * v;
          }
        }
        this.U = U2; this.U2 = U; this.V = V2; this.V2 = V; this.n++;
      }
    },
    draw(t) {
      const { w, h, img } = this, d = img.data, V = this.V;
      for (let i = 0; i < w * h; i++) { const v = clamp(V[i] * 3, 0, 1), e = v * v * v; d[i * 4] = 4 + 150 * e; d[i * 4 + 1] = 8 + 150 * v * v + 70 * e; d[i * 4 + 2] = 16 + 120 * v; d[i * 4 + 3] = 255; }
      this.cx.putImageData(img, 0, 0);
      g.globalCompositeOperation = "source-over"; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high"; g.drawImage(this.cvs, 0, 0, W, H);
      const v = g.createLinearGradient(0, H * 0.45, 0, H); v.addColorStop(0, "rgba(4,6,12,0)"); v.addColorStop(1, "rgba(4,6,12,0.75)"); g.fillStyle = v; g.fillRect(0, 0, W, H);
      const l = g.createLinearGradient(0, 0, W * 0.6, 0); l.addColorStop(0, "rgba(4,6,12,0.6)"); l.addColorStop(1, "rgba(4,6,12,0)"); g.fillStyle = l; g.fillRect(0, 0, W, H);
      const tr = g.createRadialGradient(W, 0, 0, W, 0, Math.max(340, W * 0.32)); tr.addColorStop(0, "rgba(4,6,12,0.85)"); tr.addColorStop(1, "rgba(4,6,12,0)"); g.fillStyle = tr; g.fillRect(0, 0, W, H);
    },
    readout() { return `feed F <b>${this.F.toFixed(4)}</b> · kill k <b>${this.k.toFixed(3)}</b><br>steps <b>${this.n.toLocaleString()}</b>`; },
  };

  const kuramoto = {
    field: "Neuroscience · Physics", title: "Synchronization", ref: "Kuramoto, 1975",
    rule: "Each oscillator nudges its phase toward its neighbours'. As coupling grows, waves of agreement sweep the sphere.",
    accent: "#b98cff", fade: 0.3, built: false,
    init() {
      if (!this.built) {
        const N = this.N = big() ? 1300 : 900, ga = Math.PI * (3 - Math.sqrt(5)); this.p = new Float32Array(N * 3); this.nb = [];
        for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), a = ga * i; this.p[i * 3] = Math.cos(a) * r; this.p[i * 3 + 1] = y; this.p[i * 3 + 2] = Math.sin(a) * r; }
        for (let i = 0; i < N; i++) { const best = []; for (let j = 0; j < N; j++) if (j !== i) { const d = (this.p[i*3]-this.p[j*3])**2 + (this.p[i*3+1]-this.p[j*3+1])**2 + (this.p[i*3+2]-this.p[j*3+2])**2; if (best.length < 6) { best.push([d, j]); best.sort((a, b) => a[0] - b[0]); } else if (d < best[5][0]) { best[5] = [d, j]; best.sort((a, b) => a[0] - b[0]); } } this.nb.push(best.map(b => b[1])); }
        this.built = true;
      }
      this.th = new Float32Array(this.N); this.w = new Float32Array(this.N);
      for (let i = 0; i < this.N; i++) { this.th[i] = rnd() * Math.PI * 2; this.w[i] = 1 + gauss() * 0.18; }
      this.K = 0; this.r = 0;
    },
    step(t, local) {
      this.K = 3.2 * smooth((local - 3) / 20);
      const { N, th, w, nb } = this, dt = 0.04, d = new Float32Array(N);
      for (let s = 0; s < 2; s++) { for (let i = 0; i < N; i++) { let a = 0; for (const j of nb[i]) a += Math.sin(th[j] - th[i]); d[i] = w[i] + this.K * a / 6; } for (let i = 0; i < N; i++) th[i] += d[i] * dt; }
      let c = 0, sn = 0; for (let i = 0; i < N; i++) { c += Math.cos(th[i]); sn += Math.sin(th[i]); } this.r = Math.hypot(c, sn) / N;
    },
    draw(t) {
      const [cx, cy, sc] = center(), yaw = t * 0.15, pitch = 0.35 + Math.sin(t * 0.1) * 0.15, { N, p, th } = this;
      g.globalCompositeOperation = "lighter";
      for (let i = 0; i < N; i++) {
        const A = cam(p[i * 3] * 0.8, p[i * 3 + 1] * 0.8, p[i * 3 + 2] * 0.8, yaw, pitch, sc, cx, cy), ph = ((th[i] % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), m = 0.5 + 0.5 * Math.cos(ph);
        const front = clamp((A[2] - 0.82) * 4, 0.15, 1), r = (1 + m * 2.4) * (0.7 + A[2] * 0.6);
        g.globalAlpha = front * (0.35 + 0.65 * m); g.drawImage(sprite(250 + 70 * Math.sin(ph), 100, 64), A[0] - r * 2, A[1] - r * 2, r * 4, r * 4);
      }
      g.globalAlpha = 1;
    },
    readout() { return `coupling K <b>${this.K.toFixed(2)}</b> · order r <b>${this.r.toFixed(3)}</b>`; },
  };

  const MODELS = [rips, vicsek, opinion, gray, kuramoto], DUR = 36, FADE = 1.6;
  let idx = 0, sceneStart = 0, paused = false, pauseAt = 0, t0 = performance.now(), lastRead = 0, lastT = 0, visible = true;
  function show(m) {
    q(".fld-card").classList.add("fld-out");
    setTimeout(() => { q(".fld-f").textContent = m.field; q(".fld-t").textContent = m.title; q(".fld-r").textContent = m.ref; q(".fld-u").textContent = m.rule; host.style.setProperty("--fld-accent", m.accent); q(".fld-card").classList.remove("fld-out"); }, 700);
  }
  function start(i, T) { idx = i; sceneStart = T; MODELS[i].init(); g.globalCompositeOperation = "source-over"; g.fillStyle = "#04060c"; g.fillRect(0, 0, W, H); show(MODELS[i]); }
  function resize() {
    DPR = Math.min(2, devicePixelRatio || 1); W = host.clientWidth; H = host.clientHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); g.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (MODELS[idx] === gray) gray.init();
  }
  function frame(now) {
    requestAnimationFrame(frame);
    if (paused || !visible || document.hidden) return;
    const T = (now - t0) / 1000 * (reduce ? 0.4 : 1); lastT = T;
    let local = T - sceneStart; if (local > DUR) { start((idx + 1) % MODELS.length, T); local = 0; }
    const m = MODELS[idx]; m.step(T, local);
    g.globalCompositeOperation = "source-over";
    if (m.fade < 1) { g.fillStyle = `rgba(4,6,12,${m.fade})`; g.fillRect(0, 0, W, H); }
    m.draw(T);
    const vis = Math.min(smooth(local / FADE), smooth((DUR - local) / FADE));
    if (vis < 1) { g.globalCompositeOperation = "source-over"; g.fillStyle = `rgba(4,6,12,${1 - vis})`; g.fillRect(0, 0, W, H); }
    if (now - lastRead > 150) { lastRead = now; q(".fld-v").innerHTML = m.readout(); }
  }
  q(".fld-play").addEventListener("click", e => { paused = !paused; e.currentTarget.textContent = paused ? "Play" : "Pause"; if (paused) pauseAt = performance.now(); else t0 += performance.now() - pauseAt; });
  q(".fld-next").addEventListener("click", () => { if (paused) { paused = false; q(".fld-play").textContent = "Pause"; t0 += performance.now() - pauseAt; } start((idx + 1) % MODELS.length, lastT); });
  if ("IntersectionObserver" in window) new IntersectionObserver(es => { const was = visible; visible = es[0].isIntersecting; if (visible && !was) t0 += 0; }).observe(host);
  addEventListener("resize", resize);
  resize(); start(0, 0); requestAnimationFrame(frame);
};
