import { useEffect, useRef } from 'react';

type IntervalCallback = () => void;

export default function useInterval(
  callback: IntervalCallback,
  delaySeconds: number
) {
  const savedCallback = useRef<IntervalCallback>(callback);

  // remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // set up the interval
  useEffect(() => {
    function tick() {
      savedCallback?.current();
    }
    if (delaySeconds !== null) {
      const id = setInterval(tick, delaySeconds * 1000);
      return () => {
        clearInterval(id);
      };
    }
  }, [callback, delaySeconds]);
}
