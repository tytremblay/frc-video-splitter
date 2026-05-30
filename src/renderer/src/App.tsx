import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MatchesTable } from './components/matches';
import { SideBar } from './components/sidebar';
import { SplittingSection } from './components/splitting/SplittingSection';
import { EventTimeline } from './components/timeline';
import { VideoPlayer } from './components/video';
import { useTBAMatchSync } from './state/useTBAMatchSync';

const queryClient = new QueryClient();

function AppInner() {
  useTBAMatchSync();
  return (
    <SidebarProvider>
      <SideBar />
      <SidebarInset className="flex h-svh flex-col overflow-hidden">
        <header className="flex h-11 shrink-0 items-center border-b border-border/60 px-3 gap-2">
          <SidebarTrigger className="-ml-0.5 text-muted-foreground hover:text-foreground transition-colors" />
          <div className="h-4 w-px bg-border/60" />
          <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase select-none">
            FRC Video Splitter
          </span>
        </header>

        <div className="flex-1 min-h-0">
          <ResizablePanelGroup orientation="horizontal" className="h-full">
            <ResizablePanel defaultSize={40} minSize={20}>
              <aside className="flex h-full flex-col gap-4 overflow-hidden p-4 sm:gap-5 sm:p-5">
                <section aria-label="Video" className="min-w-0">
                  <VideoPlayer />
                </section>
                <Separator className="opacity-50" />
                <section aria-label="Export" className="min-w-0">
                  <SplittingSection outputDir="" />
                </section>
              </aside>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={60} minSize={20}>
              <main className="flex min-w-0 flex-col overflow-hidden" style={{ height: '100%' }}>
                <EventTimeline />
              </main>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
