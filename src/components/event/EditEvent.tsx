import { useLocalStorageState } from '@/lib/hooks/useStorage';
import { Dialog } from '@headlessui/react';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApiEvents } from '../../api';
import { ApiEvent, Program } from '../../api/types';
import {
  matchLengthSeconds,
  resultsEndPaddingSeconds,
  resultsStartPaddingSeconds,
  separateMatchResults,
  setEvent,
  setEventFromApi,
  useEvent,
  videoEndPaddingSeconds,
  videoStartPaddingSeconds
} from '../../state';
import { Button } from '../buttons';
import { Dropdown, DropdownOption } from '../dropdown';
import { Input } from '../input';
import { Select, SelectOption } from '../select';
import { OutputDirectory } from '../splitting';

const programOptions: SelectOption<Program>[] = [{
  id: 'FRC',
  value: 'frc',
  displayValue: 'FRC',
}, {
  id: 'FTC',
  value: 'ftc',
  displayValue: 'FTC',
}];

interface EditEventProps {
  onEditingComplete: () => void;
}

export function EditEvent(props: EditEventProps) {
  const event = useEvent();

  const handleApiEvent = useCallback((value: ApiEvent) => {
    setEventFromApi(value);
  }, []);

  const handleDone = useCallback(() => {
    props.onEditingComplete();
  }, [props]);

  const [program, setProgram] = useState<Program>('frc');
  const [year, setYear] = useState(DateTime.now().year);
  const [ftcApiUsername, setFtcApiUsername] = useLocalStorageState('ftcApiUsername', '');
  const [ftcApiPassword, setFtcApiPassword] = useLocalStorageState('ftcApiPassword', '');

  const events = useApiEvents(program, year);

  const yearOptions = useMemo<SelectOption<number>[]>(() => {
    const years = [];
    const start = program === 'frc' ? 1992 : 2020;
    let end = DateTime.now().year;
    if (program == 'ftc' && DateTime.now().month < 8) {
      end = end - 1;
    }
    for (let i = start; i <= end; i++) {
      years.push(i);
    }
    return years.map((o) => ({
      id: o.toString(),
      value: o,
      displayValue: program == 'frc' ? o.toString() : `${o}-${o + 1}`,
    }));
  }, [program]);

  const eventOptions = useMemo<DropdownOption<ApiEvent>[]>(() => {
    if (!events.data) return [];
    return events.data.map((o) => ({
      name: o.program == 'ftc' ? `[${o.key.code}] ${o.name}` : o.name,
      value: o,
      secondaryText: `${o.startDate} to ${o.endDate}`,
    }));
  }, [events]);

  useEffect(() => {
    matchLengthSeconds.value = program == 'frc' ? 137 : 158;
  }, [program]);
  console.log(events.isError && events.error.message == 'Invalid FTC credentials')
  return (
    <div className="flex flex-col justify-between items-center gap-4 rounded-lg shadow-sm ring-1 ring-white/20 p-2">
      <div className="flex flex-col justify-start items-start gap-4 border-b border-white/10 pb-6 w-full">
        <div className="flex flex-col gap-2 w-full ">
          <div className="flex flex-row gap-2 items-end w-full">
            <div>
              <Select
                selectedOption={programOptions.find((p) => p.value === program)}
                label="Program"
                onSelect={(p) => {
                  setProgram(p)
                  let year = DateTime.now().year
                  if (p == 'ftc' && DateTime.now().month < 8) {
                    year = year - 1
                  }
                  setYear(year)
                }}
                options={programOptions}
              />
            </div>
            <div className="basis-1/4">
              <Select
                selectedOption={yearOptions.find((y) => y.value === year)}
                label="Year"
                onSelect={(option) => setYear(option)}
                options={yearOptions}
              />
            </div>
            <div className="flex-grow">
              {events.isLoading ? (
                <span>Loading Events...</span>
              ) : (
                <Dropdown
                  label={`Select Event from ${program === 'frc' ? 'TBA' : 'FIRST'} (optional)`}
                  selectedOption={event.apiEvent}
                  onSelect={(option) => {
                    handleApiEvent(option);
                  }}
                  options={eventOptions}
                />
              )}
            </div>
          </div>
          <div className="flex flex-row gap-2 items-end w-full">
            <Input
              name="name"
              label="Event Name"
              type="text"
              id="name"
              placeholder="Event Name"
              value={event.name}
              onChange={(evt) => setEvent({ name: evt.target.value })}
            />
            <Input
              name="location"
              label="Location"
              type="text"
              id="location"
              placeholder="Location"
              value={event.location}
              onChange={(evt) => setEvent({ location: evt.target.value })}
            />
            <Input
              name="startDate"
              label="Start Date"
              type="date"
              id="startDate"
              placeholder="Start Date"
              value={event.startDate}
              onChange={(evt) => setEvent({ startDate: evt.target.value })}
            />
            <Input
              name="endDate"
              label="End Date"
              type="date"
              id="endDate"
              placeholder="End Date"
              value={event.endDate}
              onChange={(evt) => setEvent({ endDate: evt.target.value })}
            />
            <OutputDirectory />
          </div>
          <div className="flex flex-row gap-2 items-end w-full">
            <Input
              name="separateMatchResults"
              label="Clip Match Results Separately"
              type="checkbox"
              id="videoEndPaddingSeconds"
              placeholder="Match Schedule"
              checked={separateMatchResults.value}
              onChange={(evt) =>
                (separateMatchResults.value = evt.target.checked)
              }
            />
            {separateMatchResults.value ? <>
              <Input
                name="videoStartPaddingSeconds"
                label="Padding Before Match (s)"
                type="number"
                id="videoStartPaddingSeconds"
                placeholder="Match Schedule"
                value={videoStartPaddingSeconds.value}
                onChange={(evt) =>
                  (videoStartPaddingSeconds.value = parseInt(evt.target.value))
                }
              />
              <Input
                name="matchDurationSeconds"
                label="Match Duration (s)"
                type="number"
                id="matchDurationSeconds"
                placeholder="Match Schedule"
                value={matchLengthSeconds.value}
                readOnly
              />
              <Input
                name="videoEndPaddingSeconds"
                label="Padding After Match (s)"
                type="number"
                id="videoEndPaddingSeconds"
                placeholder="Match Schedule"
                value={videoEndPaddingSeconds.value}
                onChange={(evt) =>
                  (videoEndPaddingSeconds.value = parseInt(evt.target.value))
                }
              />
              <Input
                name="resultsStartPaddingSeconds"
                label="Padding Before Results (s)"
                type="number"
                id="resultsStartPaddingSeconds"
                placeholder="Match Schedule"
                value={resultsStartPaddingSeconds.value}
                onChange={(evt) =>
                  (resultsStartPaddingSeconds.value = parseInt(evt.target.value))
                }
              />
              <Input
                name="resultsEndPaddingSeconds"
                label="Padding After Results (s)"
                type="number"
                id="resultsEndPaddingSeconds"
                placeholder="Match Schedule"
                value={resultsEndPaddingSeconds.value}
                onChange={(evt) =>
                  (resultsEndPaddingSeconds.value = parseInt(evt.target.value))
                }
              />
            </> :
              <Input
                name="videoEndPaddingSeconds"
                label="Additional Video Padding (s)"
                type="number"
                id="videoEndPaddingSeconds"
                placeholder="Match Schedule"
                value={videoEndPaddingSeconds.value}
                onChange={(evt) =>
                  (videoEndPaddingSeconds.value = parseInt(evt.target.value))
                }
              />}
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-end gap-4 items-center w-full">
        <Button onClick={() => handleDone()} secondary size="md">
          Cancel
        </Button>
        <Button onClick={() => handleDone()} size="md">
          Save
        </Button>
      </div>

      <Dialog open={events.isError && events.error.message == 'Invalid FTC credentials'} onClose={() => setProgram('frc')} className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div className="relative p-4 w-full max-w-2xl max-h-full">
          <Dialog.Panel className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <Dialog.Title className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Enter FTC Api Credentials
              </h3>
              <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="default-modal">
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </Dialog.Title>
            <Dialog.Description className="p-4 md:p-5 space-y-4">
              The FTC api terms of use prevent us from distributing api credentials with this application.  Please request your own credentials from FIRST
              using <a href="https://ftc-events.firstinspires.org/services/API/register" target="_blank" className="font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline">the form on ftc-events</a> and enter them here.
            </Dialog.Description>

            <div className="p-4 md:p-5 space-y-4">
              <div>
                <label for="ftcApiUsername" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">API Username</label>
                <input type="text" name="ftcApiUsername" id="ftcApiUsername"
                  value={ftcApiUsername}
                  onChange={(evt) => setFtcApiUsername(evt.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
              </div>
              <div>
                <label for="ftcApiPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">API Password</label>
                <input type="password" name="ftcApiPassword" id="ftcApiPassword"
                  value={ftcApiPassword}
                  onChange={(evt) => setFtcApiPassword(evt.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
              </div>
              <button className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={() => events.refetch()}>Save and Retry</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
