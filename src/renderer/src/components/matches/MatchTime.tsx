import { CheckIcon, PencilIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MatchTimeProps {
  time?: number;
  timezone?: string;
}

export function MatchTime(props: MatchTimeProps) {
  const [editing, setEditing] = useState<boolean>(false);

  return (
    <div className='flex flex-row gap-2 items-center'>
      {!editing && (
        <>
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setEditing(true)}>
            <PencilIcon className="h-4 w-4" />
          </Button>
          <div className="text-sm text-foreground">
            {props.time
              ? DateTime.fromSeconds(props.time).setZone(props.timezone).toLocaleString(DateTime.TIME_WITH_SECONDS)
              : 'N/A'}
          </div>
        </>
      )}
      {editing && (
        <>
          <Input type="text" className="text-sm" placeholder="hh:mm:ss" />
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setEditing(false)}>
            <CheckIcon className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
