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
      className="text-gray-400 bg-gray-400/10 hover:bg-blue-400/40 ring-gray-400/20 rounded-md px-1.5 py-1 text-sm font-semibold shadow-sm flex flex-row items-center gap-1"
    >
      <ClockIcon className="h-4 w-4" />
      {props.timestampSeconds !== undefined && label}
    </button>
  )
}
