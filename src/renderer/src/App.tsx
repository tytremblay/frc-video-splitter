import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { VideoPlayer } from './components/video'
import { MatchesTable } from './components/matches'
import { EventHeader } from './components/event'
import { SplittingSection } from './components/splitting/SplittingSection'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className='flex flex-row gap-2'>
        <div className='flex flex-col justify-start gap-2 p-2'>
          <EventHeader />
          <VideoPlayer />
          <SplittingSection outputDir='' />
        </div>
        <div className='overflow-y-auto w-full'>
          <MatchesTable />
        </div>
      </div>
    </QueryClientProvider>
  )
}
