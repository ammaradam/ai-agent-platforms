import type { ThemeKey } from '@/data/themes';
export type PostSummary = { slug: string; title: string; date: string; themes: ThemeKey[]; insight: string; minutes: number; text: string };
