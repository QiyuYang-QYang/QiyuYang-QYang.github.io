import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const entries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/entries' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    kind: z.string().optional(),
    year: z.string().optional(),
    cover: z.string().optional(),
    background: z.string().optional(),
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    order: z.number().default(100),
    draft: z.boolean().default(false),
    placeholder: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    background: z.string().optional(),
    placeholder: z.boolean().default(false),
  }),
});

export const collections = { entries, pages };
