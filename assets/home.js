const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, "0");
const url = p => (p || "").replace(/^\//, "");
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const getJSON = p => fetch(p, { cache: "no-cache" }).then(r => (r.ok ? r.json() : null)).catch(() => null);

const IW = 2000, IH = 1125, DWELL = 14000, CAP = 0.64, TYPE_SINK = 0.4;
const hero = $("#hero"), back = $("#back"), front = $("#front"), svg = $("#nameSvg"), g = $("#nameG"), t = $("#nameT");
let PHOTOS = [];
const S = { cur: 0, base: 0, cap: 0, rise: 1, riseT: 1, op: 1, opT: 1, mx: 0, my: 0, tmx: 0, tmy: 0, started: performance.now(), busy: false };

Promise.all([getJSON("content/site.json"), getJSON("content/cv.json"), getJSON("content/generated/works.json"), getJSON("content/generated/writing.json"), getJSON("content/generated/library.json")])
  .then(([site, cv, works, writing, library]) => {
    site = site || { photos: [] };
    renderSite(site);
    renderWorks(works || []);
    renderWriting(writing || []);
    renderLibrary(library || []);
    renderGallery(site.photos || []);
    renderCV(cv || { sections: [] });
    startHero((site.photos || []).filter(p => p.on_homepage !== false && p.image));
  });

function renderSite(site) {
  const name = site.name || "Qiyu Yang";
  t.textContent = site.short_name || name.split(" ")[0];
  $("#mark").textContent = name;
  $("#h1").textContent = name;
  $("#copyright").textContent = `© ${new Date().getFullYear()} ${name}`;
  $("#mail").textContent = site.email || "";
  ["#ghTop", "#ghFoot"].forEach(id => { $(id).href = site.github || "#"; $(id).hidden = !site.github; });
  $("#copy").hidden = !site.email;
}

function renderWorks(list) {
  $("#workN").textContent = `(${pad(list.length)})`;
  $("#workRows").innerHTML = list.length ? list.map(w => `
    <details><summary><span class="yr">${esc(w.year)}</span><span class="tt">${esc(w.title)}</span><span class="tg">${esc(w.tags)}</span><span class="pl" aria-hidden="true">+</span></summary>
    <div class="body"><div class="prose">${w.html || ""}</div>${w.where ? `<span class="label">${esc(w.where)}</span>` : ""}</div></details>`).join("")
    : `<p class="empty">Nothing here yet.</p>`;
}

function renderWriting(list) {
  $("#writeN").textContent = `(${pad(list.length)})`;
  $("#writeRows").innerHTML = list.length ? list.map(w => `
    <div class="row"><a href="post.html#${encodeURIComponent(w.slug)}"><span class="yr">${esc(w.date || w.kind || "")}</span><span class="tt">${esc(w.title)}</span><span class="tg">${esc(w.summary || "")}</span><span class="pl" aria-hidden="true">→</span></a></div>`).join("")
    : `<p class="empty">First essays coming soon.</p>`;
}

function renderLibrary(list) {
  $("#library").hidden = $("#navLibrary").hidden = !list.length;
  if (!list.length) return;
  $("#libN").textContent = `(${pad(list.length)})`;
  $("#libRows").innerHTML = list.map(w => {
    const media = w.youtube
      ? `<button type="button" class="yt" data-id="${esc(w.youtube)}" aria-label="Play ${esc(w.title)}"><img src="https://i.ytimg.com/vi/${esc(w.youtube)}/hqdefault.jpg" alt="" loading="lazy"><span class="play" aria-hidden="true"></span></button>`
      : "";
    return `<details><summary><span class="yr">${esc(w.kind || "Link")}</span><span class="tt">${esc(w.title)}</span><span class="tg">${esc(w.by || w.host)}</span><span class="pl" aria-hidden="true">+</span></summary>
    <div class="body">${media}<div class="prose">${w.html || ""}</div><span class="label lib-meta"><a href="${esc(w.url)}" target="_blank" rel="noopener">Open ${esc(w.host)} ↗</a>${w.added ? `<span>Added ${esc(w.added)}</span>` : ""}</span></div></details>`;
  }).join("");
}

document.addEventListener("click", e => {
  const b = e.target.closest(".yt");
  if (!b) return;
  const f = document.createElement("iframe");
  f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(b.dataset.id)}?autoplay=1&rel=0`;
  f.title = b.getAttribute("aria-label");
  f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  f.allowFullscreen = true;
  f.className = "yt-frame";
  b.replaceWith(f);
});

function renderGallery(list) {
  $("#photoN").textContent = `(${pad(list.length)})`;
  $("#gallery").innerHTML = list.map(p => `<figure><img src="${esc(url(p.image))}" alt="${esc(p.place)}" loading="lazy"><figcaption><span>${esc(p.place)}</span><span>${esc(p.date)}</span></figcaption></figure>`).join("");
}

function renderCV(cv) {
  if (cv.pdf) { $("#cvPdf").href = url(cv.pdf); $("#cvPdf").hidden = false; }
  $("#cvGrid").innerHTML = (cv.sections || []).map(s => `<div><h3 class="label">${esc(s.heading)}</h3><dl>${(s.items || []).map(i => `<div><dt>${esc(i.title)}${i.period ? `<span>${esc(i.period)}</span>` : ""}</dt>${i.detail ? `<dd>${esc(i.detail)}</dd>` : ""}</div>`).join("")}</dl></div>`).join("");
}

$("#copy").addEventListener("click", async () => {
  const b = $("#copy");
  try { await navigator.clipboard.writeText($("#mail").textContent); b.textContent = "Copied"; }
  catch { const r = document.createRange(); r.selectNodeContents($("#mail")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "Selected"; }
  setTimeout(() => (b.textContent = "Copy"), 1600);
});

function startHero(list) {
  PHOTOS = list.map(p => ({ ...p, over: !p.front, ink: p.ink === "dark" ? "#1e2b3a" : "#ffffff", ridge: Number(p.ridge) || 0.6, sink: Number(p.sink) || 0 }));
  if (!PHOTOS.length) return;
  PHOTOS.forEach((p, i) => {
    p.b = Object.assign(new Image(), { src: url(p.image), alt: "" });
    back.appendChild(p.b);
    if (p.front) { p.f = Object.assign(new Image(), { src: url(p.front), alt: "" }); front.appendChild(p.f); }
    const th = document.createElement("button");
    th.type = "button"; th.className = "thumb";
    th.style.backgroundImage = `url("${url(p.image)}")`;
    th.setAttribute("aria-label", "Show " + p.place);
    th.addEventListener("click", () => go(i));
    $("#thumbs").appendChild(th); p.th = th;
  });
  $("#thumbs").hidden = PHOTOS.length < 2;
  apply(0);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    layout();
    setTimeout(() => { S.riseT = 0; S.started = performance.now(); }, 350);
  });
  addEventListener("resize", layout);
  requestAnimationFrame(tick);
}

function layout() {
  if (!PHOTOS.length) return;
  const W = hero.clientWidth, H = hero.clientHeight, p = PHOTOS[S.cur];
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const sc = Math.max(W / IW, H / IH) * 1.06;
  const dh = IH * sc, oy = (H - dh) / 2;
  let fs = (0.34 * H) / CAP;
  t.setAttribute("font-size", fs);
  t.setAttribute("x", W / 2);
  const len = t.getComputedTextLength();
  const maxW = W > 720 ? W - 240 : W * 0.9;
  if (len > maxW) { fs *= maxW / len; t.setAttribute("font-size", fs); }
  S.cap = fs * CAP;
  S.base = p.over ? H * p.ridge : oy + p.ridge * dh + S.cap * p.sink * TYPE_SINK;
  t.setAttribute("y", S.base);
}

function apply(i) {
  const p = PHOTOS[i];
  PHOTOS.forEach((q, j) => { q.b.classList.toggle("on", j === i); q.f && q.f.classList.toggle("on", j === i); q.th.classList.toggle("on", j === i); });
  hero.style.setProperty("--hero-ink", p.ink);
  hero.classList.toggle("over", p.over);
  $("#caption").textContent = [p.place, p.date].filter(Boolean).join(" · ");
  S.cur = i; layout();
}

const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
async function go(i) {
  if (S.busy || i === S.cur) return;
  S.busy = true;
  S.riseT = 1; S.opT = PHOTOS[S.cur].over ? 0 : 1;
  await wait(650);
  S.opT = 0; await wait(150);
  apply(i);
  S.rise = 1; S.op = 0;
  await wait(500);
  S.riseT = 0; S.opT = 1;
  S.started = performance.now();
  S.busy = false;
}

hero.addEventListener("pointermove", e => {
  const r = hero.getBoundingClientRect();
  S.tmx = (e.clientX - r.left) / r.width - 0.5;
  S.tmy = (e.clientY - r.top) / r.height - 0.5;
}, { passive: true });
hero.addEventListener("pointerleave", () => { S.tmx = 0; S.tmy = 0; });

function tick(now) {
  const H = hero.clientHeight;
  const sp = Math.min(1, Math.max(0, scrollY / H));
  S.rise += (S.riseT - S.rise) * (reduce ? 1 : 0.06);
  S.op += (S.opT - S.op) * (reduce ? 1 : 0.09);
  S.mx += (S.tmx - S.mx) * 0.07; S.my += (S.tmy - S.my) * 0.07;
  const m = reduce ? 0 : 1;
  const ty = S.rise * S.cap * 1.08 + sp * S.cap * 0.9 + S.my * 10 * m;
  g.style.transform = `translate(${(S.mx * 18 * m).toFixed(2)}px, ${ty.toFixed(2)}px)`;
  g.style.opacity = S.op.toFixed(3);
  const lt = `translate3d(${(-S.mx * 10 * m).toFixed(2)}px, ${(-S.my * 8 * m + sp * H * 0.12).toFixed(2)}px, 0) scale(${(1 + sp * 0.06).toFixed(4)})`;
  back.style.transform = lt; front.style.transform = lt;

  const frac = Math.min(1, (now - S.started) / DWELL);
  $("#timer").style.height = (frac * 100).toFixed(1) + "%";
  if (frac >= 1 && !S.busy && PHOTOS.length > 1) {
    if (document.hidden || sp > 0.6) S.started = now;
    else go((S.cur + 1) % PHOTOS.length);
  }
  requestAnimationFrame(tick);
}
