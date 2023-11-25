import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EventHeader } from './components/event';
import { MatchesList } from './components/matches';
import { SplittingSection } from './components/splitting/SplittingSection';
import { VideoPlayer } from './components/video';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col p-2 h-full overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 p-2">
          <EventHeader />
          <SplittingSection />
        </div>
        <div className="grid grid-cols-2 gap-2 p-2 h-full">
          <VideoPlayer />
          <div className="flex">
            <MatchesList />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
