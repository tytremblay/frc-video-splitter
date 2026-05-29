import { ClockIcon } from '@heroicons/react/20/solid';
import { Duration } from "luxon";
import { Button } from '@shared/components/ui/button';

interface TimestampButtonProps {
  timestampSeconds: number | undefined;
  onClick?: () => void;
}

export function TimestampButton(props: TimestampButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      className="gap-1"
      onClick={props.onClick}
    >
      <ClockIcon className='h-4 w-4' />
      {props.timestampSeconds !== undefined && (
        props.timestampSeconds === 0
          ? "00:00:00"
          : Duration.fromMillis(props.timestampSeconds * 1000).toFormat('hh:mm:ss')
      )}
    </Button>
  );
}
