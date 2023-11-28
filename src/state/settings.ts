import { signal } from '@preact/signals-react';

export const outputDirectory = signal<string>('');
export const videoEndPaddingSeconds = signal<number>(10);
