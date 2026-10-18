import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;
export const SheetTitle = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Title>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>>(
  ({ className, ...props }, ref) => <SheetPrimitive.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />,
);
SheetTitle.displayName = 'SheetTitle';

const sheetVariants = cva(
  'fixed z-50 flex flex-col gap-4 overflow-y-auto bg-background p-5 shadow-2xl transition ease-out data-[state=open]:animate-in data-[state=closed]:animate-out',
  {
    variants: {
      side: {
        right: 'inset-y-0 right-0 h-full w-[84%] max-w-sm border-l sheet-right',
        bottom: 'inset-x-0 bottom-0 max-h-[80vh] rounded-t-2xl border-t sheet-bottom',
      },
    },
    defaultVariants: { side: 'right' },
  },
);

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & VariantProps<typeof sheetVariants>
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay className="sheet-overlay fixed inset-0 z-50 bg-black/40" />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      style={{
        paddingTop: side === 'right' ? 'calc(env(safe-area-inset-top, 0px) + 16px)' : undefined,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
        paddingRight: side === 'right' ? 'max(20px, env(safe-area-inset-right, 0px))' : undefined,
      }}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-3 top-3 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground" style={{ top: side === 'right' ? 'calc(env(safe-area-inset-top, 0px) + 10px)' : undefined }}>
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
));
SheetContent.displayName = 'SheetContent';
