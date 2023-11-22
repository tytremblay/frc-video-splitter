import { DateTime } from 'luxon';
import { useCallback, useMemo, useState } from 'react';
import { setEvent, setEventFromTBA, useEvent } from '../../state';
import { useTbaEvents } from '../../tba';
import { TBAEvent } from '../../tba/TBATypes';
import { Button } from '../buttons';
import { Dropdown, DropdownOption } from '../dropdown';
import { Input } from '../input';
import { Select, SelectOption } from '../select';

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
    <div className="flex flex-col justify-between items-center w-full gap-4 rounded-lg shadow-sm ring-1 ring-white/20 p-2">
      <div className="flex flex-col justify-start items-start w-full gap-4 border-b border-white/10 pb-12">
        <div className="grid grid-cols-4 w-full gap-4 ">
          <div className="col-span-1">
            <Select
              selectedOption={yearOptions.find((y) => y.value === year)}
              label="Year"
              onSelect={(option) => setYear(option)}
              options={yearOptions}
            />
          </div>
          <div className="col-span-3">
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

        <div className="grid grid-cols-4 gap-4 w-full">
          <Input
            name="name"
            label="Event Name"
            type="text"
            id="name"
            placeholder="Event Name"
            value={event.name}
            onChange={(value) => setEvent({ name: value })}
          />
          <Input
            name="location"
            label="Location"
            type="text"
            id="location"
            placeholder="Location"
            value={event.location}
            onChange={(value) => setEvent({ location: value })}
          />
          <Input
            name="startDate"
            label="Start Date"
            type="date"
            id="startDate"
            placeholder="Start Date"
            value={event.startDate}
            onChange={(value) => setEvent({ startDate: value })}
          />
          <Input
            name="endDate"
            label="End Date"
            type="date"
            id="endDate"
            placeholder="End Date"
            value={event.endDate}
            onChange={(value) => setEvent({ endDate: value })}
          />
        </div>
      </div>
      <div className="flex flex-row justify-end gap-4 items-center w-full">
        <Button onClick={() => handleDone()} secondary={true} size="md">
          Cancel
        </Button>
        <Button onClick={() => handleDone()} size="md">
          Save
        </Button>
      </div>
    </div>
  );
}
