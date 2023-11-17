import { CheckIcon, PencilIcon } from '@heroicons/react/20/solid';
import { DateTime } from 'luxon';
import { useState } from 'react';

interface MatchTimeProps {
  time?: number;
  timezone?: string;
}

export function MatchTime(props: MatchTimeProps) {
  const [editing, setEditing] = useState<boolean>(false);

  return (
    <div className='flex flex-row gap-2 items-center'>
      {!editing &&
        <>
          <PencilIcon className='h-4 w-4 text-white' onClick={() => setEditing(true)} />
          <div className="text-sm text-white">
            {props.time ? DateTime.fromSeconds(props.time).setZone(props.timezone).toLocaleString(DateTime.TIME_WITH_SECONDS) : 'N/A'}
          </div></>}
      {editing && <>
        <input type='text' className='text-sm' placeholder='hh:mm:ss' />
        <CheckIcon className='h-4 w-4 text-white' onClick={() => setEditing(false)} />
      </>}
    </div>
  );
}