import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SideBar } from './sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <SideBar />
      <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
