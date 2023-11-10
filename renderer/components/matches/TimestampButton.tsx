import { ClockIcon } from '@heroicons/react/20/solid'
import { Duration } from 'luxon'
import { useMemo } from 'react'

interface TimestampButtonProps {
  timestampSeconds: number | undefined
  onClick?: () => void
}

export function TimestampButton(props: TimestampButtonProps) {
  const label = useMemo(() => {
    if (!props.timestampSeconds) {
      return '00:00:00'
    }
    const duration = Duration.fromMillis(props.timestampSeconds * 1000)
    if (duration.hours > 0) {
      return duration.toFormat('hh:mm:ss')
    }
    return duration.toFormat('mm:ss')
  }, [props.timestampSeconds])
  return (
    <button
      onClick={props.onClick}
      className="rounded bg-white/10 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-white/20 flex flex-row items-center gap-1"
    >
      <ClockIcon className="h-4 w-4" />
      {props.timestampSeconds !== undefined && label}
    </button>
  )
}
