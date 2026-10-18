import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '@/lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: 'AmmarAdam',
    description: 'Writing on ML systems, AI platforms and agents.',
    site: context.site!,
    items: posts.map(p => ({ title: p.data.title, pubDate: p.data.date, description: p.data.insight, link: `/posts/${p.id}/` })),
  });
}
