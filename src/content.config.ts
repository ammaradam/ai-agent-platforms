import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    themes: z.array(z.enum(['ai-platform-engineering', 'observability', 'ai-agents', 'identity-security', 'developer-experience', 'reliability'])).min(1),
    lane: z.enum(['developer', 'platform', 'identity', 'tool', 'observability']).optional(),
    short: z.string().max(18).optional(),
    insight: z.string(),
    linkedin: z.string().url().optional(),
    caveats: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    sources: z.array(z.object({ title: z.string(), site: z.string(), url: z.string().url() })).min(1),
    related: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
