import { getCollection, type CollectionEntry } from 'astro:content';
import { site, type Category } from '../site.config';

export type Entry = CollectionEntry<'entries'>;

export interface Item {
  entry: Entry;
  category: Category;
  slug: string;
  href: string;
  number: string;
}

let cached: Promise<Item[]> | undefined;

export function getItems(): Promise<Item[]> {
  cached ??= load();
  return cached;
}

async function load(): Promise<Item[]> {
  const all = (await getCollection('entries')).filter((e) => !e.data.draft);
  const items: Item[] = [];
  for (const category of site.categories) {
    const inCat = all
      .filter((e) => e.id.split('/')[0] === category.id)
      .sort((a, b) => a.data.order - b.data.order || (b.data.year ?? '').localeCompare(a.data.year ?? '') || a.data.title.localeCompare(b.data.title));
    inCat.forEach((entry, i) => {
      const slug = entry.id.split('/').slice(1).join('/');
      items.push({ entry, category, slug, href: `/${category.id}/${slug}/`, number: String(i + 1).padStart(2, '0') });
    });
  }
  const known = new Set(site.categories.map((c) => c.id));
  const stray = all.filter((e) => !known.has(e.id.split('/')[0]) || !e.id.includes('/'));
  if (stray.length) {
    throw new Error(`[content] These entries are not inside a category folder listed in site.config.ts: ${stray.map((e) => e.id).join(', ')}`);
  }
  return items;
}

export async function itemsIn(categoryId: string) {
  return (await getItems()).filter((i) => i.category.id === categoryId);
}
