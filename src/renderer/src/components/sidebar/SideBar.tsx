import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { CalendarIcon, MapPinIcon, PencilIcon, ScissorsIcon, SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import { useEvent } from '../../state';
import { EditEventDialog } from '../event/EditEventDialog';
import { SettingsDialog } from '../settings/SettingsDialog';

export function SideBar() {
  const event = useEvent();
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <Sidebar>
        {/* Header */}
        <SidebarHeader className="px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/40">
              <ScissorsIcon className="size-4 text-primary" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-primary">
                FRC
              </span>
              <span className="text-[11px] font-medium tracking-wide text-sidebar-foreground/60">
                Video Splitter
              </span>
            </div>
          </div>
        </SidebarHeader>

        {/* Divider */}
        <div className="mx-4 h-px bg-sidebar-border" />

        {/* Nav */}
        <SidebarContent className="pt-2">
          <SidebarGroup className="px-2 py-2">
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setEditOpen(true)}
                    className="h-9 rounded-md px-3 text-[13px] font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active]:bg-primary/10 data-[active]:text-primary"
                  >
                    <PencilIcon className="size-[15px]" strokeWidth={1.75} />
                    <span>Edit Event</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setSettingsOpen(true)}
                    className="h-9 rounded-md px-3 text-[13px] font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active]:bg-primary/10 data-[active]:text-primary"
                  >
                    <SettingsIcon className="size-[15px]" strokeWidth={1.75} />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer — event card */}
        <SidebarFooter className="px-3 pb-4">
          <div className="mx-1 h-px bg-sidebar-border mb-3" />
          {event.name ? (
            <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-3 py-2.5">
              <p className="truncate text-[13px] font-semibold text-sidebar-foreground leading-snug">
                {event.name}
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {event.location && (
                  <span className="flex items-center gap-1.5 truncate text-[11px] text-sidebar-foreground/50">
                    <MapPinIcon className="size-3 shrink-0" strokeWidth={1.75} />
                    {event.location}
                  </span>
                )}
                {(event.startDate || event.endDate) && (
                  <span className="flex items-center gap-1.5 truncate text-[11px] font-mono text-sidebar-foreground/50">
                    <CalendarIcon className="size-3 shrink-0" strokeWidth={1.75} />
                    {[event.startDate, event.endDate].filter(Boolean).join(' – ')}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditOpen(true)}
              className="flex w-full items-center gap-2.5 rounded-lg border border-dashed border-sidebar-border px-3 py-2.5 text-left text-[12px] text-sidebar-foreground/35 transition-colors hover:border-primary/30 hover:text-primary/60"
            >
              <div className="size-1.5 shrink-0 rounded-full bg-current opacity-60 animate-pulse" />
              No event configured
            </button>
          )}
        </SidebarFooter>
      </Sidebar>

      <EditEventDialog open={editOpen} onOpenChange={setEditOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
