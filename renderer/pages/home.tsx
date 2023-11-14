import Head from 'next/head'
import { EventHeader } from '../components/event'
import { MatchesList } from '../components/matches'
import { SplittingSection } from '../components/splitting/SplittingSection'
import { VideoPlayer } from '../components/video'

export default function HomePage() {
  return (
    <>
      <Head>
        <title>FRCVideoSplitter</title>
      </Head>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col justify-between gap-2 p-2">
          <EventHeader />
          <VideoPlayer />
          <SplittingSection />
        </div>
        <div className="overflow-y-auto w-full">
          <MatchesList />
        </div>
      </div>
    </>
  )
}
