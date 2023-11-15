import Head from 'next/head';
import { EventHeader } from '../components/event';
import { MatchesList } from '../components/matches';
import { SplittingSection } from '../components/splitting/SplittingSection';
import { VideoPlayer } from '../components/video';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>FRCVideoSplitter</title>
      </Head>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2 p-2">
          <EventHeader />
          <VideoPlayer />
        </div>
        <div className="relative overflow-y-auto w-full">
          <div className="backdrop-filter backdrop-blur-md bg-white/5 sticky top-0 z-50">
            <SplittingSection />
          </div>
          <MatchesList />
        </div>
      </div>
    </>
  );
}
