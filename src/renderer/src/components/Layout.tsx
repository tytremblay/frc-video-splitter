import { Bars3Icon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { SideBar } from './sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@shared/components/ui/sheet';
import { Button } from '@shared/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SideBar />
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <div className="sticky top-0 z-40 flex items-center gap-x-6 border-b border-border bg-background px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <SheetTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="-m-2.5 shrink-0">
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <div className="flex-1 text-sm font-semibold leading-6 text-foreground">Steps</div>
        </div>
        <SheetContent side="left" className="w-72 max-w-xs p-0">
          <SideBar />
        </SheetContent>
      </Sheet>

      <main className="lg:pl-72 h-full">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}
