import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const point = z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]);

const nodes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/nodes' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['question', 'project', 'essay', 'note', 'photo', 'past']),
    shelves: z.array(z.enum(['work', 'writing', 'photography'])).optional(),
    cover: z.string().optional(),
    year: z.string().optional(),
    summary: z.string(),
    pos: point,
    posNarrow: point.optional(),
    links: z.array(z.object({ to: z.string(), question: z.string() })).default([]),
    date: z.coerce.date().optional(),
    order: z.number().default(100),
    placeholder: z.boolean().default(false),
    hidden: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    placeholder: z.boolean().default(false),
  }),
});

export const collections = { nodes, pages };
