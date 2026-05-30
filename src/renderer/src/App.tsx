import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { SideBar } from './components/sidebar';
import { MatchesTable } from './components/matches';
import { SplittingSection } from './components/splitting/SplittingSection';
import { VideoPlayer } from './components/video';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <SideBar />
        <SidebarInset className="flex min-h-svh flex-col overflow-hidden">
          <header className="flex h-11 shrink-0 items-center border-b border-border/60 px-3 gap-2">
            <SidebarTrigger className="-ml-0.5 text-muted-foreground hover:text-foreground transition-colors" />
            <div className="h-4 w-px bg-border/60" />
            <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase select-none">
              FRC Video Splitter
            </span>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:grid lg:grid-cols-[minmax(18rem,28rem)_1fr] lg:overflow-hidden xl:grid-cols-[minmax(20rem,30rem)_1fr]">
            <aside className="flex shrink-0 flex-col gap-4 p-4 sm:gap-5 sm:p-5 lg:min-h-0 lg:overflow-y-auto lg:border-r border-b lg:border-b-0 border-border/60">
              <section aria-label="Video" className="min-w-0">
                <VideoPlayer />
              </section>
              <Separator className="hidden lg:block opacity-50" />
              <section aria-label="Export" className="min-w-0">
                <SplittingSection outputDir="" />
              </section>
            </aside>

            <main className="flex min-h-0 min-w-0 flex-1 flex-col lg:overflow-hidden">
              <div className="shrink-0 border-b border-border/60 px-5 py-4 sm:px-6">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-base font-semibold tracking-tight">Matches</h2>
                  <span className="text-xs text-muted-foreground tracking-wide uppercase font-medium">
                    Set start &amp; end timestamps using the video controls
                  </span>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6">
                <MatchesTable />
              </div>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
