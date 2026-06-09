import { cn } from '@/lib/utils';

interface DetailRowProps {
  label: string;
  children: React.ReactNode;
  valueClassName?: string;
}

export function DetailRow({ label, children, valueClassName }: DetailRowProps) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 shrink-0 w-12 pt-px">{label}</span>
      <span className={cn('text-[10px] text-muted-foreground/90 min-w-0', valueClassName)}>{children}</span>
    </div>
  );
}
