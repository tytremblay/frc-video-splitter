import clsx from 'clsx';

interface TeamBadgeProps {
  teamNumber: string;
  color: 'red' | 'blue';
}

export function TeamBadge(props: TeamBadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium',
      props.color === 'red'
        ? 'border-destructive/30 bg-destructive/10 text-destructive'
        : 'border-primary/30 bg-primary/10 text-primary'
    )}>
      {props.teamNumber}
    </span>
  );
}
