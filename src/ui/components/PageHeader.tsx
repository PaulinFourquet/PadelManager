import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export const PageHeader = ({ eyebrow, title, description, actions, className }: PageHeaderProps) => (
  <header className={cn('flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between', className)}>
    <div className="space-y-1">
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description ? <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
  </header>
);
