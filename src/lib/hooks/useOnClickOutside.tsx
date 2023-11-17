import { RefObject, useEffect } from 'react';

type EventHandler = (event: MouseEvent) => void;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: EventHandler
): void {
  const handleClickOutside = (event: MouseEvent) => {
    const el = ref?.current;
    if (!el || el.contains(event.target as Node)) {
      return;
    }
    handler(event);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, handler]);
}
