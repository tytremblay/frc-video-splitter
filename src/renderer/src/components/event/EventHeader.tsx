import { CalendarIcon, MapPinIcon, PencilIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { useEvent } from '../../state';
import { EditEvent } from './EditEvent';

export function EventHeader() {
  const [editing, setEditing] = useState<boolean>(true);
  const event = useEvent();

  return (
    <div className="lg:flex lg:items-center lg:justify-between px-2 pt-4 overflow-visible w-full">
      {editing ? (
        <EditEvent onEditingComplete={() => setEditing(false)} />
      ) : (
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-foreground sm:truncate sm:text-3xl sm:tracking-tight flex flex-row gap-2 items-center">
            {event.name}
            <PencilIcon className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground" onClick={() => setEditing(true)} />
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <MapPinIcon className="mr-1.5 h-5 w-5 shrink-0 opacity-70" aria-hidden="true" />
              {event.location}
            </div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="mr-1.5 h-5 w-5 shrink-0 opacity-70" aria-hidden="true" />
              {`${event.startDate} to ${event.endDate}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
