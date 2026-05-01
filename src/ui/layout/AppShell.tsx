import type { ReactNode } from 'react';
import { Sidebar } from '@/ui/layout/Sidebar';
import { TopBar } from '@/ui/layout/Header';

type AppShellProps = {
  children: ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => (
  <div className="flex min-h-screen bg-background text-foreground">
    <Sidebar />
    <div className="flex min-h-screen flex-1 flex-col">
      <TopBar />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  </div>
);
