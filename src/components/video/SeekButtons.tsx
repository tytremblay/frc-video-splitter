import { BackwardIcon, ForwardIcon } from '@heroicons/react/20/solid'

export interface SeekButtonsProps {
  onSeek: (seconds: number) => void
}

const increments = [-600, -150, -30, -5, 5, 30, 150, 600]

export function SeekButtons(props: SeekButtonsProps) {
  return (
    <div className="w-full flex flex-row justify-center gap-3 py-2">
      {increments.map((increment) => {
        return (
          <div
            key={`${increment}`}
            className="flex flex-col justify-center items-center gap-1 rounded-lg p-2 shadow-sm text-gray-500 hover:text-gray-300"
            onClick={() => props.onSeek(increment)}
          >
            {increment < 0 ? (
              <BackwardIcon className="h-6 w-6" />
            ) : (
              <ForwardIcon className="h-6 w-6" />
            )}
            <div className="text-sm">{Math.abs(increment)}s</div>
          </div>
        )
      })}
    </div>
  )
}
