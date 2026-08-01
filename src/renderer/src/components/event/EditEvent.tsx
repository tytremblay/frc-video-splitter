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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { setEvent, setEventFromTBA, useEvent } from '../../state';
import { useSettings } from '../../state/useSettings';
import { TBAEvent } from '../../tba/TBATypes';

async function getEvents(year: number, apiKey: string) {
  const res = await fetch(`https://www.thebluealliance.com/api/v3/events/${encodeURIComponent(year)}`, {
    headers: {
      'X-TBA-Auth-Key': apiKey || import.meta.env.VITE_TBA_API_KEY,
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
  const tbaApiKey = useSettings(s => s.tbaApiKey);

  const handleTBAEvent = useCallback((value: TBAEvent) => {
    setEventFromTBA(value);
  }, []);

  const handleDone = useCallback(() => {
    props.onEditingComplete();
  }, [props]);

  const [year, setYear] = useState(DateTime.now().year);

  const queryClient = useQueryClient();
  const events = useQuery({ queryKey: ['events', year, tbaApiKey], queryFn: async () => getEvents(year, tbaApiKey) });

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
      <div className="border-b border-white/[0.07] px-6 py-5">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-1">
          Event
        </p>
        <h2 className="text-[15px] font-semibold text-foreground leading-snug">Event details</h2>
        <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
          Name, location, and dates for this recording. Import from The Blue Alliance or enter manually.
        </p>
      </div>

      <div className="px-6 py-6">
        <FieldGroup className="w-full">
          <FieldSet className="min-w-0">
            <FieldLegend variant="label">The Blue Alliance</FieldLegend>

            <div className="rounded-md border border-white/8 overflow-hidden w-full">
              {/* Season row */}
              <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-white/2 px-3 py-2">
                <span className="text-[11px] font-medium text-muted-foreground">Season</span>
                <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                  <SelectTrigger id="year-select" className="h-7 w-24 text-xs border-white/8">
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

              {/* Inline event search */}
              <Command className="rounded-none bg-transparent w-full">
                <CommandInput placeholder="Search events…" />
                {events.isPending ? (
                  <div className="flex items-center gap-2 px-4 py-5 text-sm text-muted-foreground">
                    <Spinner className="size-3.5" />
                    Loading events…
                  </div>
                ) : (
                  <CommandList className="overflow-y-auto">
                    <CommandEmpty>No events found.</CommandEmpty>
                    <CommandGroup>
                      {eventOptions.map((opt) => (
                        <CommandItem
                          key={opt.value.key}
                          value={`${opt.name} ${opt.secondaryText ?? ''} ${opt.value.key}`}
                          onSelect={() => handleTBAEvent(opt.value)}
                          className="gap-2.5 px-3 py-2 rounded-none"
                        >
                          <CheckIcon
                            className={
                              event.tbaEvent?.key === opt.value.key
                                ? 'size-3.5 shrink-0 text-primary opacity-100'
                                : 'size-3.5 shrink-0 opacity-0'
                            }
                          />
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="truncate text-[13px] font-medium leading-snug">
                              {opt.name}
                            </span>
                            {opt.secondaryText && (
                              <span className="truncate font-mono text-[10px] text-muted-foreground">
                                {opt.secondaryText}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                )}
              </Command>
            </div>

            <FieldDescription className="mt-2">
              Optional. Fills in name, location, and dates from TBA.
            </FieldDescription>
          </FieldSet>

          <FieldSeparator>or enter manually</FieldSeparator>

          <FieldSet className="min-w-0">
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

      <div className="flex justify-end gap-2 border-t border-white/[0.07] bg-black/20 px-6 py-4">
        <Button type="button" onClick={handleDone}>
          Save event
        </Button>
      </div>
    </div>
  );
}
