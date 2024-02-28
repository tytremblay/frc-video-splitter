import { signal } from '@preact/signals-react';

export const outputDirectory = signal<string>('');
export const videoStartPaddingSeconds = signal<number>(5);
export const videoEndPaddingSeconds = signal<number>(10);
export const matchLengthSeconds = signal<number>(-1);
export const resultsStartPaddingSeconds = signal<number>(5);
export const resultsEndPaddingSeconds = signal<number>(10);
export const separateMatchResults = signal<boolean>(false);
