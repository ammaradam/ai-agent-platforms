import * as React from 'react';
import { Menu, Search, FileText, Hash, User, FolderGit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ThemeDot } from './ThemeDot';
import { THEMES, type ThemeKey } from '@/data/themes';
import { cn } from '@/lib/utils';
import type { PostSummary } from './types';

type Item = { group: string; label: string; sub?: string; href: string; icon: React.ReactNode };
const PAGES = [['Writing', '/insights'], ['Projects', '/projects'], ['About', '/about']] as const;

export default function SiteNav({ posts, counts, current }: { posts: PostSummary[]; counts: Record<string, number>; current: string }) {
  const [menu, setMenu] = React.useState(false);
  const [cmd, setCmd] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmd(v => !v); }
      else if (e.key === '/' && !/INPUT|TEXTAREA/.test((document.activeElement as HTMLElement)?.tagName)) { e.preventDefault(); setCmd(true); }
    };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, []);
  React.useEffect(() => { if (cmd) { setQ(''); setI(0); } }, [cmd]);

  const items: Item[] = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    const ps = posts.filter(p => !s || p.text.includes(s)).map(p => ({ group: 'Writing', label: p.title, sub: p.insight, href: `/posts/${p.slug}`, icon: <FileText /> }));
    const ts = (Object.keys(THEMES) as ThemeKey[]).filter(k => counts[k] && (!s || THEMES[k].name.toLowerCase().includes(s)))
      .map(k => ({ group: 'Themes', label: THEMES[k].name, href: `/themes/${k}`, icon: <ThemeDot k={k} className="m-1" /> }));
    const pg = PAGES.filter(([l]) => !s || l.toLowerCase().includes(s)).map(([l, h]) => ({ group: 'Pages', label: l, href: h, icon: l === 'Projects' ? <FolderGit2 /> : l === 'About' ? <User /> : <Hash /> }));
    return [...ps, ...ts, ...pg];
  }, [q, posts, counts]);
  React.useEffect(() => setI(0), [q]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setI(v => Math.min(items.length - 1, v + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setI(v => Math.max(0, v - 1)); }
    if (e.key === 'Enter' && items[i]) location.href = items[i].href;
  };

  let last = '';
  return (
    <>
      <div className="ml-auto flex items-center gap-2">
        <button type="button" onClick={() => setCmd(true)} className="hidden h-9 w-60 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground  transition-colors hover:bg-accent sm:flex">
          <Search className="h-4 w-4" /> Search writing
          <kbd className="ml-auto rounded border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd>
        </button>
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setCmd(true)} aria-label="Search"><Search /></Button>
        <Button variant="ghost" size="icon" className="hidden" onClick={() => setMenu(true)} aria-label="Open menu"><Menu /></Button>
      </div>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="right" aria-describedby={undefined}>
          <SheetTitle>Menu</SheetTitle>
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {[['Home', '/'] as const, ...PAGES].map(([l, h]) => (
              <a key={h} href={h} className={cn('rounded-md px-3 py-2.5 text-[15px]', current === h ? 'bg-muted font-medium' : 'text-muted-foreground')}>{l}</a>
            ))}
          </nav>
          <div className="h-px bg-border" />
          <p className="text-xs font-medium text-muted-foreground">Themes</p>
          <div className="flex flex-col gap-0.5">
            {(Object.keys(THEMES) as ThemeKey[]).filter(k => counts[k]).map(k => (
              <a key={k} href={`/themes/${k}`} className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-muted">
                <ThemeDot k={k} />{THEMES[k].name}<span className="ml-auto text-xs text-muted-foreground tnum">{counts[k]}</span>
              </a>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={cmd} onOpenChange={setCmd}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="flex items-center gap-2 border-b px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey} placeholder="Search writing, topics and pages" aria-label="Search" className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="max-h-[55vh] overflow-y-auto p-2" role="listbox">
            {items.length === 0 && <p className="px-3 py-10 text-center text-sm text-muted-foreground">Nothing matches "{q}". Try a shorter word.</p>}
            {items.map((it, idx) => {
              const head = it.group !== last ? (last = it.group) : null;
              return (
                <React.Fragment key={it.group + it.href}>
                  {head && <p className="px-3 pb-1 pt-3 text-xs font-medium text-muted-foreground">{head}</p>}
                  <a href={it.href} role="option" aria-selected={idx === i} onMouseMove={() => setI(idx)}
                    className={cn('flex items-start gap-3 rounded-md px-3 py-2.5 text-sm [&_svg]:mt-0.5 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground', idx === i && 'bg-accent')}>
                    {it.icon}
                    <span className="min-w-0"><span className="block font-medium">{it.label}</span>{it.sub && <span className="mt-0.5 block truncate text-muted-foreground">{it.sub}</span>}</span>
                  </a>
                </React.Fragment>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
