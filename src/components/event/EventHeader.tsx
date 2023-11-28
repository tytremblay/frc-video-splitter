import {
  ClockIcon,
  Cog6ToothIcon,
  FolderOpenIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { outputDirectory, useEvent, videoEndPaddingSeconds } from '../../state';
import { TBAEvent } from '../../tba/TBATypes';
import { SplitButton } from '../splitting';
import { EditEvent } from './EditEvent';
import { EventInfo } from './EventInfo';

interface MatchesHeaderProps {
  editing?: boolean;
  onEventChange?: (event: TBAEvent) => void;
}

export function EventHeader(props: MatchesHeaderProps) {
  const [editing, setEditing] = useState<boolean>(props.editing || true);
  const event = useEvent();

  return (
    <div className="overflow-visible w-full">
      {editing ? (
        <EditEvent onEditingComplete={() => setEditing(false)} />
      ) : (
        <div className="flex flex-row w-full items-center justify-between bg-white/10 rounded-lg p-2">
          <EventInfo />

          <div className="flex flex-col gap-1 items-start">
            <div className="flex flex-row gap-2 items-center">
              <FolderOpenIcon className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-400">{outputDirectory}</span>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <ClockIcon className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-400">
                +{videoEndPaddingSeconds}s
              </span>
            </div>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <SplitButton />
            <Cog6ToothIcon
              className="h-6 w-6 text-gray-400 hover:text-white"
              onClick={() => setEditing(true)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
