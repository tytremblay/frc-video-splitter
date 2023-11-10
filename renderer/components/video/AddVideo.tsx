import { FilmIcon } from '@heroicons/react/20/solid'

export interface AddVideoProps {
  onClick: () => void
}

export default function AddVideo(props: AddVideoProps) {
  return (
    <button
      type="button"
      className="aspect-video w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      onClick={props.onClick}
    >
      <FilmIcon className="mx-auto h-12 w-12 text-gray-400" />
      <span className="mt-2 block font-semibold text-gray-400">
        Add a video
      </span>
    </button>
  )
}
