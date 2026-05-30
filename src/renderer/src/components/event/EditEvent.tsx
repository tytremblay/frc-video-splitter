import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { setEvent, setEventFromTBA, useEvent } from '../../state';
import { TBAEvent } from '../../tba/TBATypes';

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
    <div className="flex flex-col">
      <div className="border-b px-6 py-5">
        <h2 className="text-base font-semibold">Event details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Name, location, and dates for this recording. Import from The Blue Alliance or enter them manually.
        </p>
      </div>

      <div className="px-6 py-6">
        <FieldGroup>
          <FieldSet>
            <FieldLegend variant="label">The Blue Alliance</FieldLegend>
            <div className="grid gap-4 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
              <Field>
                <FieldLabel htmlFor="year-select">Season</FieldLabel>
                <FieldContent>
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
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>Event</FieldLabel>
                <FieldContent>
                  {events.isPending ? (
                    <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground">
                      <Spinner />
                      Loading events…
                    </div>
                  ) : (
                    <Popover open={tbaOpen} onOpenChange={setTbaOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={tbaOpen}
                          className="h-9 w-full justify-between font-normal"
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
                                  <CheckIcon
                                    className={
                                      event.tbaEvent?.key === opt.value.key
                                        ? 'mr-2 size-4 opacity-100'
                                        : 'mr-2 size-4 opacity-0'
                                    }
                                  />
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
                  <FieldDescription>
                    Optional. Fills in name, location, and dates from TBA.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </div>
          </FieldSet>

          <FieldSeparator>or enter manually</FieldSeparator>

          <FieldSet>
            <FieldLegend variant="label">Details</FieldLegend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="name">Event name</FieldLabel>
                <FieldContent>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g. Week 1 — Greater Pittsburgh"
                    value={event.name}
                    onChange={(e) => setEvent({ name: e.target.value })}
                  />
                </FieldContent>
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <FieldContent>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="e.g. Pittsburgh, PA"
                    value={event.location}
                    onChange={(e) => setEvent({ location: e.target.value })}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="startDate">Start date</FieldLabel>
                <FieldContent>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={event.startDate}
                    onChange={(e) => setEvent({ startDate: e.target.value })}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="endDate">End date</FieldLabel>
                <FieldContent>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={event.endDate}
                    onChange={(e) => setEvent({ endDate: e.target.value })}
                  />
                </FieldContent>
              </Field>
            </div>
          </FieldSet>
        </FieldGroup>
      </div>

      <div className="flex justify-end gap-2 border-t bg-muted/30 px-6 py-4">
        <Button type="button" onClick={handleDone}>
          Save event
        </Button>
      </div>
    </div>
  );
}
