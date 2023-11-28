import { useEvent } from '@/state';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/20/solid';

export function EventInfo() {
  const event = useEvent();
  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight flex flex-row gap-2 items-center">
        {event.name}
      </h2>
      <div className="mt-1 flex flex-col items-baseline gap-2 sm:mt-0 sm:flex-row sm:flex-wrap">
        <div className="mt-2 flex items-center text-sm text-gray-300">
          <MapPinIcon
            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-500"
            aria-hidden="true"
          />
          {event.location}
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-300">
          <CalendarIcon
            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-500"
            aria-hidden="true"
          />
          {`${event.startDate} to ${event.endDate}`}
        </div>
      </div>
    </div>
  );
}
