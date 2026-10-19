import * as React from 'react';
import { Search, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeDot } from './ThemeDot';
import { THEMES, type ThemeKey } from '@/data/themes';
import { cn, fmtDate } from '@/lib/utils';
import type { PostSummary } from './types';

const monthOf = (d: string) => new Date(d).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export default function InsightsBrowser({ posts, counts }: { posts: PostSummary[]; counts: Record<string, number> }) {
  const [f, setF] = React.useState<string>('');
  const [q, setQ] = React.useState('');
  const [order, setOrder] = React.useState<'new' | 'old'>('new');

  React.useEffect(() => {
    const t = new URLSearchParams(location.search).get('theme');
    if (t && t in THEMES) setF(t);
  }, []);
  const pick = (k: string) => {
    setF(k);
    const u = new URL(location.href);
    if (k) u.searchParams.set('theme', k); else u.searchParams.delete('theme');
    history.replaceState(null, '', u);
  };

  const s = q.trim().toLowerCase();
  let list = posts.filter(p => (!f || p.themes.includes(f as ThemeKey)) && (!s || p.text.includes(s)));
  if (order === 'old') list = [...list].reverse();
  const groups: { m: string; items: PostSummary[] }[] = [];
  list.forEach(p => { const m = monthOf(p.date); const g = groups[groups.length - 1]; if (g && g.m === m) g.items.push(p); else groups.push({ m, items: [p] }); });
  const chips: [string, string, number][] = [['', 'All', posts.length], ...(Object.keys(THEMES) as ThemeKey[]).filter(k => counts[k]).map(k => [k, THEMES[k].name, counts[k]] as [string, string, number])];

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-3xl bg-muted p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input id="insight-search" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search titles and text" aria-label="Search writing" className="h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </label>
          <div className="inline-flex h-10 shrink-0 items-center rounded-md bg-muted p-1 text-sm" role="group" aria-label="Sort">
            {(['new', 'old'] as const).map(k => (
              <button key={k} type="button" aria-pressed={order === k} onClick={() => setOrder(k)} className={cn('h-8 rounded px-3 transition-colors', order === k ? 'bg-background font-medium ' : 'text-muted-foreground hover:text-foreground')}>{k === 'new' ? 'Newest' : 'Oldest'}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by theme">
          {chips.map(([k, l, n]) => (
            <button key={k || 'all'} type="button" aria-pressed={f === k} onClick={() => pick(k)}
              className={cn('inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[13px] transition-colors', f === k ? 'border-foreground bg-foreground text-background' : 'bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground')}>
              {k && <ThemeDot k={k as ThemeKey} />}{l}<span className={cn('text-[11px] tnum', f === k && 'opacity-70')}>{n}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="eyebrow mt-6" aria-live="polite">{list.length === posts.length ? `${list.length} posts` : `Showing ${list.length} of ${posts.length} posts`}</p>
      {groups.map(g => (
        <section key={g.m} className="mt-4">
          <h2 className="eyebrow sticky z-10 border-b bg-background/90 py-2 backdrop-blur" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}>{g.m}</h2>
          <div className="mt-1 flex flex-col">
            {g.items.map(p => (
              <a key={p.slug} href={`/posts/${p.slug}`} className="row-in group -mx-3 grid gap-x-6 gap-y-1.5 rounded-lg px-3 py-4 transition-colors hover:bg-muted/60 sm:grid-cols-[6rem_minmax(0,1fr)_9.5rem]">
                <time className="text-xs text-muted-foreground tnum sm:pt-1.5" dateTime={p.date}>{fmtDate(new Date(p.date), { day: 'numeric', month: 'short' })}</time>
                <div className="min-w-0">
                  <h3 className="text-[18px] font-semibold leading-snug tracking-tight group-hover:text-brand">{p.title}</h3>
                  <p className="mt-1 text-[16px] leading-relaxed text-muted-foreground">{p.insight}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                    {p.themes.map(t => <span key={t} className="inline-flex items-center gap-1.5"><ThemeDot k={t} />{THEMES[t].name}</span>)}
                    <span className="inline-flex items-center gap-1 tnum"><Clock className="h-3 w-3" />{p.minutes} min</span>
                  </div>
                </div>
                <img src={`/posts/thumb/${p.slug}.jpg`} alt="" width={480} height={270} loading="lazy" className="hidden aspect-video w-full rounded-xl object-cover sm:block" />
              </a>
            ))}
          </div>
        </section>
      ))}
      {list.length === 0 && (
        <div className="mt-4 rounded-lg border border-dashed px-6 py-12 text-center">
          <p className="font-medium">No posts match "{q}"</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a shorter word, or clear the filters.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { setQ(''); pick(''); }}>Clear filters</Button>
        </div>
      )}
    </div>
  );
}
