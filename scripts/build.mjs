import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, basename } from "node:path";
import yaml from "js-yaml";
import { marked } from "marked";

const root = new URL("..", import.meta.url).pathname;
const content = join(root, "content");

async function readCollection(dir) {
  const files = (await readdir(join(content, dir)).catch(() => [])).filter(f => f.endsWith(".md"));
  return Promise.all(files.map(async f => {
    const raw = await readFile(join(content, dir, f), "utf8");
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    const data = m ? yaml.load(m[1]) || {} : {};
    const body = m ? m[2] : raw;
    const words = body.split(/\s+/).filter(Boolean).length;
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
