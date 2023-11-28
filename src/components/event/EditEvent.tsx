import { DateTime } from 'luxon';
import { useCallback, useMemo, useState } from 'react';
import {
  setEvent,
  setEventFromTBA,
  useEvent,
  videoEndPaddingSeconds,
} from '../../state';
import { useTbaEvents } from '../../tba';
import { TBAEvent } from '../../tba/TBATypes';
import { Button } from '../buttons';
import { Dropdown, DropdownOption } from '../dropdown';
import { Input } from '../input';
import { Select, SelectOption } from '../select';
import { OutputDirectory } from '../splitting';

interface EditEventProps {
  onEditingComplete: () => void;
}

export function EditEvent(props: EditEventProps) {
  const event = useEvent();

  const handleTBAEvent = useCallback((value: TBAEvent) => {
    setEventFromTBA(value);
  }, []);

  const handleDone = useCallback(() => {
    props.onEditingComplete();
  }, [props]);

  const [year, setYear] = useState(DateTime.now().year);

  const events = useTbaEvents(year);

  const yearOptions = useMemo<SelectOption<number>[]>(() => {
    const years = [];
    for (let i = 1992; i <= DateTime.now().year; i++) {
      years.push(i);
    }
    return years.map((o) => ({
      id: o.toString(),
      value: o,
      displayValue: o.toString(),
    }));
  }, []);

  const eventOptions = useMemo<DropdownOption<TBAEvent>[]>(() => {
    if (!events.data) return [];
    return events.data.map((o) => ({
      name: o.name,
      value: o,
      secondaryText: `${o.start_date} to ${o.end_date}`,
    }));
  }, [events]);

  return (
    <div className="flex flex-col justify-between items-center gap-4 rounded-lg shadow-sm ring-1 ring-white/20 p-2">
      <div className="flex flex-col justify-start items-start gap-4 border-b border-white/10 pb-6 w-full">
        <div className="flex flex-col gap-2 w-full ">
          <div className="flex flex-row gap-2 items-end w-full">
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
                  label="Select Event from TBA (optional)"
                  selectedOption={event.tbaEvent}
                  onSelect={(option) => {
                    handleTBAEvent(option);
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
              name="videoEndPaddingSeconds"
              label="Additional Video Padding (s)"
              type="number"
              id="videoEndPaddingSeconds"
              placeholder="Match Schedule"
              value={videoEndPaddingSeconds.value}
              onChange={(evt) =>
                (videoEndPaddingSeconds.value = parseInt(evt.target.value))
              }
            />
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
