import { getCollection, type CollectionEntry } from 'astro:content';
import { THEMES, type ThemeKey } from '@/data/themes';
import { readingMinutes } from './utils';
import type { PostSummary } from '@/components/types';

export type Post = CollectionEntry<'posts'>;

export async function getPosts() {
  const all = await getCollection('posts', p => !p.data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime()); // newest first
}

export const minutesOf = (p: Post) => readingMinutes((p.body ?? '').replace(/<svg[\s\S]*?<\/svg>/g, ' '));

export function headingsOf(p: Post) {
  return [...(p.body ?? '').matchAll(/<h3 id="([^"]+)">([^<]+)<\/h3>/g)].map(m => ({ id: m[1], text: m[2] }));
}

export function themeCounts(posts: Post[]) {
  const c: Record<string, number> = {};
  posts.forEach(p => p.data.themes.forEach(t => (c[t] = (c[t] || 0) + 1)));
  return c;
}

/** Posts in a theme, oldest first so the theme reads as a series. */
export const themePosts = (posts: Post[], k: ThemeKey) =>
  posts.filter(p => p.data.themes.includes(k)).sort((a, b) => a.data.date.getTime() - b.data.date.getTime());

export const usedThemes = (posts: Post[]) => (Object.keys(THEMES) as ThemeKey[]).filter(k => posts.some(p => p.data.themes.includes(k)));

export function summaries(posts: Post[]): PostSummary[] {
  return posts.map(p => ({
    slug: p.id,
    title: p.data.title,
    date: p.data.date.toISOString(),
    themes: p.data.themes,
    insight: p.data.insight,
    minutes: minutesOf(p),
    text: (p.data.title + ' ' + p.data.insight + ' ' + (p.body ?? '').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ')).toLowerCase().replace(/\s+/g, ' '),
  }));
}
