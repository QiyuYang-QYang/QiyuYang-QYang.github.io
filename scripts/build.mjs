import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, basename } from "node:path";
import yaml from "js-yaml";
import { marked } from "marked";
import katex from "katex";

const unescape = s => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const attr = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const tex = (src, display) => katex.renderToString(src, { displayMode: display, throwOnError: false, output: "html" });
const slugify = s => s.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/g, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");

marked.use({
  renderer: {
    code(code, lang) {
      if ((lang || "").trim() === "math") return `<div class="math">${tex(code, true)}</div>\n`;
      return false;
    },
    codespan(text) {
      const m = text.match(/^\$(.+)\$$/);
      return m ? tex(unescape(m[1]), false) : false;
    },
    heading(text, level, raw) {
      if (level > 4) return false;
      return `<h${level} id="${attr(slugify(raw))}">${text}</h${level}>\n`;
    },
    image(href, title, text) {
      const wide = /#wide$/.test(href || "");
      const src = (href || "").replace(/#wide$/, "").replace(/^\//, "");
      const cap = title || text;
      return `<figure class="fig${wide ? " wide" : ""}"><img src="${attr(src)}" alt="${attr(text)}" loading="lazy">${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`;
    },
    paragraph(text) {
      if (/^<figure[\s\S]*<\/figure>$/.test(text.trim())) return text + "\n";
      return false;
    }
  }
});

const root = new URL("..", import.meta.url).pathname;
const content = join(root, "content");

async function readCollection(dir) {
  const files = (await readdir(join(content, dir)).catch(() => [])).filter(f => f.endsWith(".md"));
  return Promise.all(files.map(async f => {
    const raw = await readFile(join(content, dir, f), "utf8");
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    const data = m ? yaml.load(m[1]) || {} : {};
    const body = m ? m[2] : raw;
    const cjk = (body.match(/[\u3400-\u9fff]/g) || []).length;
    const words = body.replace(/[\u3400-\u9fff]/g, " ").split(/\s+/).filter(Boolean).length + cjk / 2;
    return { slug: basename(f, ".md"), ...data, html: marked.parse(body), minutes: Math.max(1, Math.round(words / 220)) };
  }));
}

const asDate = d => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d || ""));

const works = (await readCollection("works"))
  .map(w => ({ ...w, year: String(w.year ?? "") }))
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || b.year.localeCompare(a.year));

const writing = (await readCollection("writing"))
  .filter(w => !w.draft)
  .map(w => ({ ...w, date: asDate(w.date) }))
  .sort((a, b) => (!a.date) - (!b.date) || b.date.localeCompare(a.date));

const ytId = u => {
  const m = String(u || "").match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : "";
};
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

const library = (await readCollection("library"))
  .filter(w => !w.draft && w.url)
  .map(w => ({ ...w, added: asDate(w.added), youtube: ytId(w.url), host: host(w.url) }))
  .sort((a, b) => (!a.added) - (!b.added) || b.added.localeCompare(a.added));

await mkdir(join(content, "generated"), { recursive: true });
await writeFile(join(content, "generated", "library.json"), JSON.stringify(library, null, 2));
await writeFile(join(content, "generated", "works.json"), JSON.stringify(works, null, 2));
await writeFile(join(content, "generated", "writing.json"), JSON.stringify(writing, null, 2));
console.log(`Built ${works.length} works, ${writing.length} essays and ${library.length} library entries`);
