import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EventHeader } from './components/event';
import { MatchesList } from './components/matches';
import { VideoPlayer } from './components/video';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col p-2 h-full">
        <EventHeader />
        <div className="grid grid-cols-2 gap-2 p-2 grow overflow-y-hidden">
          <VideoPlayer />
          <MatchesList />
        </div>
      </div>
    </QueryClientProvider>
  );
}
