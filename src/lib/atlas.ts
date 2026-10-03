import { getCollection, type CollectionEntry } from 'astro:content';

export type NodeEntry = CollectionEntry<'nodes'>;
export type NodeType = NodeEntry['data']['type'];

export const TYPE_LABEL: Record<NodeType, string> = {
  question: 'Question',
  project: 'Work',
  essay: 'Essay',
  note: 'Note',
  photo: 'Photograph',
  past: 'Earlier',
};

export type ShelfId = 'work' | 'writing' | 'photography';

export const SHELVES: { id: ShelfId; title: string; blurb: string; types: NodeType[]; layout: 'cards' | 'photos' }[] = [
  { id: 'work', title: 'Work', blurb: 'Projects and research, from field plots to language agents.', types: ['project', 'past'], layout: 'cards' },
  { id: 'writing', title: 'Writing', blurb: 'Essays and notes.', types: ['essay', 'note'], layout: 'cards' },
  { id: 'photography', title: 'Photography', blurb: 'Photographs.', types: ['photo'], layout: 'photos' },
];

export const GROUPS: { name: string; types: NodeType[] }[] = [
  { name: 'Questions', types: ['question'] },
  { name: 'Work', types: ['project'] },
  { name: 'Writing', types: ['essay', 'note'] },
  { name: 'Photography', types: ['photo'] },
  { name: 'Earlier', types: ['past'] },
];

export interface AtlasNode {
  id: string;
  type: NodeType;
  title: string;
  summary: string;
  pos: [number, number];
  posNarrow: [number, number];
  href: string;
  shelves: ShelfId[];
  cover?: string;
  year?: string;
}

export interface AtlasEdge {
  a: string;
  b: string;
  q: string;
}

export interface Atlas {
  nodes: AtlasNode[];
  edges: AtlasEdge[];
  entries: NodeEntry[];
  neighbors: Record<string, { id: string; q: string }[]>;
  byId: Record<string, AtlasNode>;
}

export const nodeHref = (id: string) => `/n/${id}/`;

let cached: Promise<Atlas> | undefined;

export function getAtlas(): Promise<Atlas> {
  cached ??= build();
  return cached;
}

async function build(): Promise<Atlas> {
  const entries = (await getCollection('nodes'))
    .filter((e) => !e.data.hidden)
    .sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
  const ids = new Set(entries.map((e) => e.id));

  const nodes: AtlasNode[] = entries.map((e) => ({
    id: e.id,
    type: e.data.type,
    title: e.data.title,
    summary: e.data.summary,
    pos: e.data.pos,
    posNarrow: e.data.posNarrow ?? [e.data.pos[1], e.data.pos[0]],
    href: nodeHref(e.id),
    shelves: e.data.shelves ?? SHELVES.filter((s) => s.types.includes(e.data.type)).map((s) => s.id),
    cover: e.data.cover,
    year: e.data.year,
  }));

  const edges: AtlasEdge[] = [];
  const seen = new Set<string>();
  for (const e of entries) {
    for (const link of e.data.links) {
      if (!ids.has(link.to)) {
        throw new Error(`[atlas] "${e.id}" links to "${link.to}", which does not exist or is hidden.`);
      }
      if (link.to === e.id) throw new Error(`[atlas] "${e.id}" links to itself.`);
      const key = [e.id, link.to].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ a: e.id, b: link.to, q: link.question });
    }
  }

  const neighbors: Atlas['neighbors'] = Object.fromEntries(nodes.map((n) => [n.id, []]));
  for (const { a, b, q } of edges) {
    neighbors[a].push({ id: b, q });
    neighbors[b].push({ id: a, q });
  }

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return { nodes, edges, entries, neighbors, byId };
}
