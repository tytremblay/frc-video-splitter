import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CalendarIcon, MapPinIcon, PencilIcon } from 'lucide-react';
import { useState } from 'react';
import { useEvent } from '../../state';
import { EditEvent } from './EditEvent';

export function EventHeader() {
  const [editing, setEditing] = useState<boolean>(true);
  const event = useEvent();

  if (editing) {
    return <EditEvent onEditingComplete={() => setEditing(false)} />;
  }

  return (
    <Card className="w-full min-w-0 gap-0 py-0">
      <CardHeader className="px-4 py-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">{event.name || 'Untitled event'}</CardTitle>
        <CardDescription className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-6">
          {event.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="size-4 shrink-0 opacity-70" aria-hidden />
              {event.location}
            </span>
          )}
          {(event.startDate || event.endDate) && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="size-4 shrink-0 opacity-70" aria-hidden />
              {[event.startDate, event.endDate].filter(Boolean).join(' – ')}
            </span>
          )}
        </CardDescription>
        <CardAction>
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
            <PencilIcon />
            Edit
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  );
}
