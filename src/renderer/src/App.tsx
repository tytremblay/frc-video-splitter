import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Separator } from '@/components/ui/separator';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ScissorsIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { SplittingSection } from './components/splitting/SplittingSection';
import { EventTimeline, type EventTimelineHandle } from './components/timeline';
import { VideoPlayer } from './components/video';
import { EditEventDialog } from './components/event/EditEventDialog';
import { SettingsDialog } from './components/settings/SettingsDialog';
import { useTBAMatchSync } from './state/useTBAMatchSync';

const queryClient = new QueryClient();

function AppInner() {
  useTBAMatchSync();
  const timelineRef = useRef<EventTimelineHandle>(null);
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex h-11 shrink-0 items-center border-b border-border/60 px-3 gap-3">
        {/* App identity */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/20 ring-1 ring-primary/40">
            <ScissorsIcon className="size-3.5 text-primary" strokeWidth={1.75} />
          </div>
          <span className="text-xs font-bold tracking-[0.18em] uppercase text-primary select-none">
            FRC
          </span>
          <span className="text-xs font-medium tracking-wide text-muted-foreground/60 select-none">
            Video Splitter
          </span>
        </div>

        <div className="h-4 w-px bg-border/60" />

        {/* Menubar */}
        <Menubar className="h-auto border-0 bg-transparent p-0 shadow-none gap-0">
          <MenubarMenu>
            <MenubarTrigger className="h-7 px-2.5 text-xs font-medium text-muted-foreground/80 rounded-md cursor-pointer hover:bg-muted/60 hover:text-foreground data-[state=open]:bg-muted/60 data-[state=open]:text-foreground transition-colors">
              Event
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onSelect={() => setEditEventOpen(true)}>
                Edit event…
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="h-7 px-2.5 text-xs font-medium text-muted-foreground/80 rounded-md cursor-pointer hover:bg-muted/60 hover:text-foreground data-[state=open]:bg-muted/60 data-[state=open]:text-foreground transition-colors">
              Settings
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onSelect={() => setSettingsOpen(true)}>
                Preferences…
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <div className="flex-1" />

        {/* Zoom controls */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => timelineRef.current?.zoomOut()}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground transition-colors"
            title="Zoom out (Cmd/Ctrl + scroll)"
          >
            <ZoomOutIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => timelineRef.current?.zoomIn()}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground/60 hover:bg-muted/60 hover:text-foreground transition-colors"
            title="Zoom in (Cmd/Ctrl + scroll)"
          >
            <ZoomInIcon className="size-3.5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup orientation="horizontal" className="h-full">
          <ResizablePanel defaultSize={40} minSize={20}>
            <aside className="flex h-full flex-col gap-4 overflow-hidden p-4 sm:gap-5 sm:p-5">
              <section aria-label="Video" className="min-w-0">
                <VideoPlayer />
              </section>
              <Separator className="opacity-50" />
              <section aria-label="Export" className="min-w-0 flex-1 min-h-0 overflow-hidden flex flex-col">
                <SplittingSection outputDir="" onOpenEventDialog={() => setEditEventOpen(true)} />
              </section>
            </aside>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={60} minSize={20}>
            <main className="flex min-w-0 flex-col overflow-hidden" style={{ height: '100%' }}>
              <EventTimeline ref={timelineRef} />
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <EditEventDialog open={editEventOpen} onOpenChange={setEditEventOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
