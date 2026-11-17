import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '@/lib/posts';
import { THEMES } from '@/data/themes';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: 'Ammar Adam',
    description: 'Notes on ML systems, AI platforms and agents.',
    site: context.site!,
    customData: '<language>en</language>',
    items: posts.map(p => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.insight,
      link: `/posts/${p.id}/`,
      categories: p.data.themes.map(t => THEMES[t].name),
      enclosure: { url: new URL(`/posts/${p.id}.jpg`, context.site).href, type: 'image/jpeg', length: 0 },
    })),
  });
}
