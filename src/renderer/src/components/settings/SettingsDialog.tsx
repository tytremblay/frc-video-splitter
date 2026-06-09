import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { setSettings, useSettings } from '../../state/useSettings';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import type { ConcurrencyLevel } from '@shared/types';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const settings = useSettings();
  const [local, setLocal] = useState({ ...settings });

  function handleOpenChange(next: boolean) {
    if (next) setLocal({ ...settings });
    onOpenChange(next);
  }

  function handleSave() {
    setSettings({
      tbaApiKey: local.tbaApiKey.trim(),
      collapseBreaks: local.collapseBreaks,
      collapseBreakThresholdMinutes: local.collapseBreakThresholdMinutes,
      startPaddingSeconds: local.startPaddingSeconds,
      endPaddingSeconds: local.endPaddingSeconds,
      matchLengthSeconds: local.matchLengthSeconds,
      resultsLengthSeconds: local.resultsLengthSeconds,
      clipDeadAir: local.clipDeadAir,
      deadAirThresholdSeconds: local.deadAirThresholdSeconds,
      splitConcurrency: local.splitConcurrency,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="border-b border-white/[0.07] px-6 py-5">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-1">
            Configuration
          </p>
          <DialogTitle className="text-[15px] font-semibold leading-snug">Settings</DialogTitle>
          <DialogDescription className="text-[12px] leading-relaxed">Configure app-wide preferences.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex flex-col min-h-0">
          <TabsList className="w-full justify-start rounded-none border-b border-white/[0.07] bg-transparent h-auto px-6 py-0 gap-0">
            <TabsTrigger
              value="general"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2.5 text-sm"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2.5 text-sm"
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="splitting"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2.5 text-sm"
            >
              Splitting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="px-6 py-6 mt-0">
            <FieldGroup>
              <FieldSet>
                <Field>
                  <FieldLabel htmlFor="tba-api-key">The Blue Alliance API key</FieldLabel>
                  <FieldContent>
                    <Input
                      id="tba-api-key"
                      type="password"
                      placeholder="Paste your TBA read API key…"
                      value={local.tbaApiKey}
                      onChange={(e) => setLocal(l => ({ ...l, tbaApiKey: e.target.value }))}
                      autoComplete="off"
                    />
                    <FieldDescription>
                      Required to import event and match data from TBA. Get a key at thebluealliance.com/account.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldSet>
            </FieldGroup>
          </TabsContent>

          <TabsContent value="timeline" className="px-6 py-6 mt-0">
            <FieldGroup>
              <FieldSet>
                <Field>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="collapse-breaks">Collapse Long Breaks</Label>
                      <p className="text-xs text-muted-foreground">
                        Compress large time gaps in the timeline view.
                      </p>
                    </div>
                    <Switch
                      id="collapse-breaks"
                      checked={local.collapseBreaks}
                      onCheckedChange={(v) => setLocal(l => ({ ...l, collapseBreaks: v }))}
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="break-threshold">Break threshold</FieldLabel>
                  <FieldContent>
                    <div className="flex items-center gap-2">
                      <Input
                        id="break-threshold"
                        type="number"
                        min={1}
                        step={1}
                        className="w-24"
                        disabled={!local.collapseBreaks}
                        value={local.collapseBreakThresholdMinutes}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          if (!isNaN(v) && v > 0) {
                            setLocal(l => ({ ...l, collapseBreakThresholdMinutes: v }));
                          }
                        }}
                      />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                    <FieldDescription>
                      Gaps longer than this will be collapsed to a compact break indicator.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldSet>
            </FieldGroup>
          </TabsContent>
          <TabsContent value="splitting" className="mt-0">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid oklch(1 0 0 / 0.07)' }}>
                  <th className="px-6 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'oklch(0.45 0.015 258)', width: '40%' }}>Setting</th>
                  <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'oklch(0.45 0.015 258)', width: '30%' }}>Value</th>
                  <th className="px-6 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'oklch(0.45 0.015 258)' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {([
                  {
                    id: 'match-length',
                    label: 'Match Length',
                    unit: 'sec',
                    value: local.matchLengthSeconds,
                    placeholder: '135',
                    min: 1,
                    parse: (s: string) => parseInt(s, 10),
                    valid: (v: number) => !isNaN(v) && v > 0,
                    onChange: (v: number) => setLocal(l => ({ ...l, matchLengthSeconds: v })),
                    desc: 'Duration of gameplay after kickoff.',
                  },
                  {
                    id: 'results-length',
                    label: 'Results Length',
                    unit: 'sec',
                    value: local.resultsLengthSeconds,
                    placeholder: '10',
                    min: 1,
                    parse: (s: string) => parseInt(s, 10),
                    valid: (v: number) => !isNaN(v) && v > 0,
                    onChange: (v: number) => setLocal(l => ({ ...l, resultsLengthSeconds: v })),
                    desc: 'Results screen footage after post_result_time.',
                  },
                  {
                    id: 'start-padding',
                    label: 'Start Padding',
                    unit: 'sec',
                    value: local.startPaddingSeconds,
                    placeholder: '3',
                    min: 0,
                    parse: (s: string) => parseFloat(s),
                    valid: (v: number) => !isNaN(v) && v >= 0,
                    onChange: (v: number) => setLocal(l => ({ ...l, startPaddingSeconds: v })),
                    desc: 'Extra footage before each match start.',
                  },
                  {
                    id: 'end-padding',
                    label: 'End Padding',
                    unit: 'sec',
                    value: local.endPaddingSeconds,
                    placeholder: '3',
                    min: 0,
                    parse: (s: string) => parseFloat(s),
                    valid: (v: number) => !isNaN(v) && v >= 0,
                    onChange: (v: number) => setLocal(l => ({ ...l, endPaddingSeconds: v })),
                    desc: 'Extra footage after each match end.',
                  },
                ] as const).map((row, i, arr) => (
                  <tr
                    key={row.id}
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid oklch(1 0 0 / 0.05)' : undefined }}
                    className="group"
                  >
                    <td className="px-6 py-2.5">
                      <label htmlFor={row.id} className="text-sm font-medium cursor-pointer" style={{ color: 'oklch(0.78 0.01 240)' }}>
                        {row.label}
                      </label>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Input
                          id={row.id}
                          type="number"
                          min={row.min}
                          step={1}
                          value={row.value}
                          placeholder={row.placeholder}
                          onChange={(e) => {
                            const v = row.parse(e.target.value);
                            if (row.valid(v)) row.onChange(v);
                          }}
                          className="w-20 h-7 text-right text-sm font-mono tabular-nums px-2"
                        />
                        <span className="text-[10px] font-mono w-6 shrink-0" style={{ color: 'oklch(0.45 0.015 258)' }}>{row.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-2.5 text-xs leading-relaxed" style={{ color: 'oklch(0.48 0.018 258)' }}>
                      {row.desc}
                    </td>
                  </tr>
                ))}

                {/* Divider row */}
                <tr>
                  <td colSpan={3} className="px-6 pt-4 pb-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'oklch(0.42 0.015 258)' }}>Dead Air</span>
                      <div className="flex-1 h-px" style={{ background: 'oklch(1 0 0 / 0.06)' }} />
                    </div>
                  </td>
                </tr>

                {/* Clip Dead Air toggle row */}
                <tr style={{ borderBottom: '1px solid oklch(1 0 0 / 0.05)' }}>
                  <td className="px-6 py-2.5">
                    <label htmlFor="clip-dead-air" className="text-sm font-medium cursor-pointer" style={{ color: 'oklch(0.78 0.01 240)' }}>
                      Clip Dead Air
                    </label>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end pr-[1.625rem]">
                      <Switch
                        id="clip-dead-air"
                        checked={local.clipDeadAir}
                        onCheckedChange={(v) => setLocal(l => ({ ...l, clipDeadAir: v }))}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-2.5 text-xs leading-relaxed" style={{ color: 'oklch(0.48 0.018 258)' }}>
                    Remove gaps between match and results blocks.
                  </td>
                </tr>

                {/* Dead Air Threshold row */}
                <tr>
                  <td className="px-6 py-2.5" style={{ opacity: local.clipDeadAir ? 1 : 0.4 }}>
                    <label htmlFor="dead-air-threshold" className="text-sm font-medium cursor-pointer" style={{ color: 'oklch(0.78 0.01 240)' }}>
                      Dead Air Threshold
                    </label>
                  </td>
                  <td className="px-3 py-2.5" style={{ opacity: local.clipDeadAir ? 1 : 0.4 }}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Input
                        id="dead-air-threshold"
                        type="number"
                        min={1}
                        step={1}
                        disabled={!local.clipDeadAir}
                        placeholder="30"
                        value={local.deadAirThresholdSeconds}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          if (!isNaN(v) && v > 0) setLocal(l => ({ ...l, deadAirThresholdSeconds: v }));
                        }}
                        className="w-20 h-7 text-right text-sm font-mono tabular-nums px-2"
                      />
                      <span className="text-[10px] font-mono w-6 shrink-0" style={{ color: 'oklch(0.45 0.015 258)' }}>sec</span>
                    </div>
                  </td>
                  <td className="px-6 py-2.5 text-xs leading-relaxed" style={{ color: 'oklch(0.48 0.018 258)', opacity: local.clipDeadAir ? 1 : 0.4 }}>
                    Gaps longer than this will be cut out.
                  </td>
                </tr>
                {/* Performance divider */}
                <tr>
                  <td colSpan={3} className="px-6 pt-4 pb-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'oklch(0.42 0.015 258)' }}>Performance</span>
                      <div className="flex-1 h-px" style={{ background: 'oklch(1 0 0 / 0.06)' }} />
                    </div>
                  </td>
                </tr>

                {/* Split Concurrency row */}
                <tr>
                  <td className="px-6 py-2.5">
                    <label htmlFor="split-concurrency" className="text-sm font-medium cursor-pointer" style={{ color: 'oklch(0.78 0.01 240)' }}>
                      Split Concurrency
                    </label>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end">
                      <NativeSelect
                        id="split-concurrency"
                        size="sm"
                        value={local.splitConcurrency}
                        onChange={(e) => setLocal(l => ({ ...l, splitConcurrency: e.target.value as ConcurrencyLevel }))}
                      >
                        <NativeSelectOption value="efficient">Efficient</NativeSelectOption>
                        <NativeSelectOption value="normal">Normal</NativeSelectOption>
                        <NativeSelectOption value="performance">Performance</NativeSelectOption>
                        <NativeSelectOption value="extreme">Extreme</NativeSelectOption>
                      </NativeSelect>
                    </div>
                  </td>
                  <td className="px-6 py-2.5 text-xs leading-relaxed" style={{ color: 'oklch(0.48 0.018 258)' }}>
                    Max matches split simultaneously. Scales with your CPU core count.
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="h-4" />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 border-t border-white/[0.07] bg-black/20 px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
