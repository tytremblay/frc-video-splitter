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
import { CalendarIcon, MapPinIcon, PencilIcon, ScissorsIcon } from 'lucide-react';
import { useState } from 'react';
import { useEvent } from '../../state';
import { EditEventDialog } from '../event/EditEventDialog';

export function SideBar() {
  const event = useEvent();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded bg-primary/15 ring-1 ring-primary/30">
              <ScissorsIcon className="size-3.5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold leading-none tracking-wide uppercase text-sidebar-foreground">
                FRC
              </p>
              <p className="text-[10px] leading-none text-sidebar-foreground/50 mt-0.5 tracking-widest uppercase">
                Video Splitter
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="py-3">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setEditOpen(true)}
                    className="text-sidebar-foreground/70 hover:text-sidebar-foreground data-[active]:text-primary data-[active]:bg-primary/10"
                  >
                    <PencilIcon className="size-4" />
                    <span>Edit Event</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
          {event.name ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">{event.name}</p>
              <div className="mt-1.5 flex flex-col gap-1 text-xs text-sidebar-foreground/50">
                {event.location && (
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPinIcon className="size-3 shrink-0" />
                    {event.location}
                  </span>
                )}
                {(event.startDate || event.endDate) && (
                  <span className="flex items-center gap-1.5 truncate font-mono">
                    <CalendarIcon className="size-3 shrink-0" />
                    {[event.startDate, event.endDate].filter(Boolean).join(' – ')}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 text-xs text-sidebar-foreground/40 hover:text-primary/70 transition-colors text-left"
            >
              <div className="size-1.5 rounded-full bg-current animate-pulse" />
              No event configured
            </button>
          )}
        </SidebarFooter>
      </Sidebar>

      <EditEventDialog open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
