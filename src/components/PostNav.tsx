import * as React from 'react';
import { List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type H = { id: string; text: string };

function useActive(headings: H[]) {
  const [active, setActive] = React.useState(headings[0]?.id);
  React.useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: '-15% 0px -70% 0px' });
    headings.forEach(h => { const el = document.getElementById(h.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [headings]);
  return active;
}

function TocList({ headings, active, onPick }: { headings: H[]; active?: string; onPick?: () => void }) {
  return (
    <ol className="relative flex flex-col border-l">
      {headings.map(h => (
        <li key={h.id} className="relative">
          <span aria-hidden="true" className={cn('absolute -left-px top-0 h-full w-0.5 rounded-full bg-brand transition-opacity duration-200', active === h.id ? 'opacity-100' : 'opacity-0')} />
          <a href={`#${h.id}`} onClick={onPick} aria-current={active === h.id ? 'location' : undefined}
            className={cn('block py-1.5 pl-4 text-sm leading-snug transition-colors', active === h.id ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground')}>{h.text}</a>
        </li>
      ))}
    </ol>
  );
}

/** Desktop outline: highlights the section being read. */
export function DesktopToc({ headings }: { headings: H[] }) {
  const active = useActive(headings);
  return <TocList headings={headings} active={active} />;
}

/** Mobile: a Contents button that appears after the inline outline scrolls away, plus the reading progress bar. */
export default function MobilePostNav({ headings }: { headings: H[] }) {
  const active = useActive(headings);
  const [open, setOpen] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const inline = document.getElementById('inline-toc');
    const io = inline ? new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0)) : null;
    if (inline && io) io.observe(inline);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setProgress(max > 0 ? Math.min(1, scrollY / max) : 0);
    };
    onScroll(); addEventListener('scroll', onScroll, { passive: true });
    return () => { io?.disconnect(); removeEventListener('scroll', onScroll); };
  }, []);
  return (
    <>
      <div aria-hidden="true" className="fixed inset-x-0 z-40 h-0.5 origin-left bg-brand" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 56px)', transform: `scaleX(${progress})` }} />
      <div className={cn('fixed z-40 transition-all duration-200 lg:hidden', show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0')}
        style={{ right: 'calc(env(safe-area-inset-right, 0px) + 16px)', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
        <Button className="h-11 rounded-full px-4 shadow-lg" onClick={() => setOpen(true)} tabIndex={show ? 0 : -1}><List />Contents</Button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" aria-describedby={undefined}>
          <div className="mx-auto -mt-1 h-1.5 w-10 rounded-full bg-border" />
          <SheetTitle>On this page</SheetTitle>
          <TocList headings={headings} active={active} onPick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
