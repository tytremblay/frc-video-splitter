import { outputDirectory } from '@/state';
import { FolderOpenIcon } from '@heroicons/react/24/outline';
import { useCallback } from 'react';

export function OutputDirectory() {
  const openDir = useCallback(async () => {
    const dir = await window.ipc.openDirectory();
    outputDirectory.value = dir;
  }, []);
  return (
    <div className="basis-1/3">
      <label
        htmlFor="output-directory"
        className="block text-sm font-medium leading-6 text-gray-400"
      >
        Output Directory
      </label>
      <div
        className="flex flex-row gap-2 rounded-md bg-white/10 p-2 hover:bg-white/20 cursor-pointer items-center mt-2"
        onClick={openDir}
      >
        <FolderOpenIcon className="h-6 w-6 text-gray-400 " />
        <dd className="text-sm text-white">{outputDirectory}</dd>
      </div>
    </div>
  );
}
