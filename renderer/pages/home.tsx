import { LightBulbIcon, PencilIcon, PlusCircleIcon } from '@heroicons/react/20/solid';
import Head from 'next/head';
import { useState } from 'react';
import { VideoPlayer } from '../components/video';
import { MatchesTable } from '../components/matches';
import { TBAEvent } from '../tba/TBATypes';
import { EventHeader } from '../components/event';
import { SplittingSection } from '../components/splitting/SplittingSection';



export default function HomePage() {

  return (
    <>
      <Head>
        <title>FRCVideoSplitter</title>
      </Head>
      <div className='flex flex-row gap-2'>
        <div className='flex flex-col justify-start gap-2 p-2'>
          <EventHeader />
          <VideoPlayer />
          <SplittingSection outputDir='C:\Users\jacob\Videos\FRC' />
        </div>
        <div className='overflow-y-auto w-full'>
          <MatchesTable />
        </div>
      </div>
    </>
  );
}