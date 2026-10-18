import { themeColor, type ThemeKey } from '@/data/themes';
import { cn } from '@/lib/utils';
export function ThemeDot({ k, className }: { k: ThemeKey; className?: string }) {
  return <span aria-hidden="true" className={cn('inline-block h-2 w-2 shrink-0 rounded-full', className)} style={{ background: themeColor(k) }} />;
}
