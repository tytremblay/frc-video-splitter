import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EventState, setEvent, setEventFromTBA, useEvent } from '../../state';
import { Input } from '../input';
import { DateTime } from 'luxon';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { TBAEvent } from '../../tba/TBATypes';
import { Dropdown, DropdownOption } from '../dropdown';
import { Select, SelectOption } from '../select';


async function getEvents(year: number) {
  const res = await fetch(`https://www.thebluealliance.com/api/v3/events/${encodeURIComponent(year)}`, {
    headers: {
      'X-TBA-Auth-Key': '5c86cepWKD99NPe4M7WZVAF9N7LwKVdXpWmkRIRYBYdUrPCG1OaaF9DkvegcttFr',
    }
  });
  const events = await res.json() as TBAEvent[];

  return events.sort((a, b) => a.start_date.localeCompare(b.start_date));
}

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

  const queryClient = useQueryClient();
  const events = useQuery({ queryKey: ['events', year], queryFn: async () => getEvents(year) });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
  }, [year]);

  const yearOptions = useMemo<SelectOption<number>[]>(() => {
    const years = [];
    for (let i = 1992; i <= DateTime.now().year; i++) {
      years.push(i);
    }
    return years.map(o => ({ id: o.toString(), value: o, displayValue: o.toString() }));
  }, []);

  const eventOptions = useMemo<DropdownOption<TBAEvent>[]>(() => {
    if (!events.data) return [];
    return events.data.map(o => ({ name: o.name, value: o, secondaryText: `${o.start_date} to ${o.end_date}` }));
  }, [events]);

  return (
    <div className='flex flex-row justify-between items-center w-full gap-4'>
      <div className='flex flex-col justify-start items-start w-full gap-4'>
        <div className='grid grid-cols-4 w-full gap-4 ' >
          <div className='col-span-1'>
            <Select selectedOption={yearOptions.find(y => y.value === year)} label='Year' onSelect={(option) => setYear(option)} options={yearOptions} />
          </div>
          <div className='col-span-3'>
            {events.isLoading ? <span>Loading Events...</span> :
              <Dropdown
                label='Select Event from TBA (optional)'
                selectedOption={event.tbaEvent}
                onSelect={(option) => { handleTBAEvent(option); }}
                options={eventOptions} />}
          </div>
        </div>

        <div className='grid grid-cols-4 gap-4 w-full'>
          <Input name='name' label='Event Name' type='text' id='name' placeholder='Event Name' value={event.name} onChange={(value) => setEvent({ name: value })} />
          <Input name='location' label='Location' type='text' id='location' placeholder='Location' value={event.location} onChange={(value) => setEvent({ location: value })} />
          <Input name='startDate' label='Start Date' type='date' id='startDate' placeholder='Start Date' value={event.startDate} onChange={(value) => setEvent({ startDate: value })} />
          <Input name='endDate' label='End Date' type='date' id='endDate' placeholder='End Date' value={event.endDate} onChange={(value) => setEvent({ endDate: value })} />
        </div>
      </div>
      <button onClick={() => handleDone()} className='rounded-md bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20 h-40'>Done</button>
    </div>
  );
}