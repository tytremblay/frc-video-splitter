import clsx from 'clsx';

interface TeamBadgeProps {
  teamNumber: string;
  color: 'red' | 'blue';
}

export function TeamBadge(props: TeamBadgeProps) {
  return (
    <span className={clsx(`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset `,
      props.color === 'red' ? 'bg-red-400/10 text-red-400 ring-red-400/20' : 'bg-blue-400/10 text-blue-400 ring-blue-400/20')}>
      {props.teamNumber}
    </span>
  );
}