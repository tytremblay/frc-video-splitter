import { createRoot } from 'react-dom/client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { EventHeader } from './components/event';
import { MatchesList } from './components/matches';
import { SplittingSection } from './components/splitting/SplittingSection';
import { VideoPlayer } from './components/video';
import './index.css';

const queryClient = new QueryClient();
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <QueryClientProvider client={queryClient}>
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
  </QueryClientProvider>
);
