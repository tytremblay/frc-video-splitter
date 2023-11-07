import { ClockIcon } from '@heroicons/react/20/solid';
import { Duration } from "luxon";

interface TimestampButtonProps {
  timestampSeconds: number | undefined;
  onClick?: () => void;
}

export function TimestampButton(props: TimestampButtonProps) {
  return (
    <button onClick={props.onClick} className='rounded-md bg-blue-500 px-1.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 flex flex-row items-center gap-1'>
      <ClockIcon className='h-4 w-4' />
      {props.timestampSeconds !== undefined && (props.timestampSeconds === 0 ? "00:00:00" : Duration.fromMillis(props.timestampSeconds * 1000).toFormat('hh:mm:ss'))}
    </button>

  );
}