import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { setEvent, setEventFromTBA, useEvent } from '../../state';
import { DateTime } from 'luxon';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { TBAEvent } from '../../tba/TBATypes';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@shared/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@shared/components/ui/command';
import { ChevronsUpDownIcon } from 'lucide-react';

async function getEvents(year: number) {
  const res = await fetch(`https://www.thebluealliance.com/api/v3/events/${encodeURIComponent(year)}`, {
    headers: {
      'X-TBA-Auth-Key': '5c86cepWKD99NPe4M7WZVAF9N7LwKVdXpWmkRIRYBYdUrPCG1OaaF9DkvegcttFr',
    }
  });
  const events = await res.json() as TBAEvent[];
  return events.sort((a, b) => a.start_date.localeCompare(b.start_date));
}

type TbaEventOption = {
  name: string;
  value: TBAEvent;
  secondaryText?: string;
};

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
  const [tbaOpen, setTbaOpen] = useState(false);

  const queryClient = useQueryClient();
  const events = useQuery({ queryKey: ['events', year], queryFn: async () => getEvents(year) });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
  }, [year]);

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let i = 1992; i <= DateTime.now().year; i++) {
      years.push(i);
    }
    return years;
  }, []);

  const eventOptions = useMemo<TbaEventOption[]>(() => {
    if (!events.data) return [];
    return events.data.map(o => ({
      name: o.name,
      value: o,
      secondaryText: `${o.start_date} to ${o.end_date}`,
    }));
  }, [events]);

  return (
    <div className='flex flex-row justify-between items-center w-full gap-4'>
      <div className='flex flex-col justify-start items-start w-full gap-4'>
        <div className='grid grid-cols-4 w-full gap-4'>
          <div className='col-span-1 flex flex-col gap-2'>
            <Label htmlFor="year-select">Year</Label>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger id="year-select" className="w-full">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='col-span-3 flex flex-col gap-2'>
            <Label>Select Event from TBA (optional)</Label>
            {events.isPending ? (
              <span className="text-sm text-muted-foreground">Loading Events...</span>
            ) : (
              <Popover open={tbaOpen} onOpenChange={setTbaOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={tbaOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {event.tbaEvent?.name ?? 'Search or pick an event…'}
                    </span>
                    <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[min(100vw-2rem,42rem)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search events…" />
                    <CommandList>
                      <CommandEmpty>No events found.</CommandEmpty>
                      <CommandGroup>
                        {eventOptions.map((opt) => (
                          <CommandItem
                            key={opt.value.key}
                            value={`${opt.name} ${opt.secondaryText ?? ''} ${opt.value.key}`}
                            onSelect={() => {
                              handleTBAEvent(opt.value);
                              setTbaOpen(false);
                            }}
                          >
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <span className="truncate font-medium">{opt.name}</span>
                              {opt.secondaryText && (
                                <span className="truncate text-xs text-muted-foreground">
                                  {opt.secondaryText}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <div className='grid grid-cols-4 gap-4 w-full'>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Event Name"
              value={event.name}
              onChange={(e) => setEvent({ name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              type="text"
              placeholder="Location"
              value={event.location}
              onChange={(e) => setEvent({ location: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              placeholder="Start Date"
              value={event.startDate}
              onChange={(e) => setEvent({ startDate: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              placeholder="End Date"
              value={event.endDate}
              onChange={(e) => setEvent({ endDate: e.target.value })}
            />
          </div>
        </div>
      </div>
      <Button variant="secondary" className="self-stretch" onClick={() => handleDone()}>
        Done
      </Button>
    </div>
  );
}
