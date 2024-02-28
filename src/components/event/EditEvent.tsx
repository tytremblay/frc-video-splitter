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
    </div>
  );
}
