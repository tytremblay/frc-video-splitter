import { useCallback, useRef, useState } from 'react';
import { useOnClickOutside } from '../../lib/hooks/useOnClickOutside';
import { SplitterMatch, updateMatch } from '../../state/useMatches';

export type MatchTitleProps = {
  match: SplitterMatch;
  index: number;
};

export function MatchDescription(props: MatchTitleProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClickOutside = useCallback(() => {
    setEditing(false);
  }, []);

  useOnClickOutside(inputRef, handleClickOutside);

  return editing ? (
    <input
      className="min-w-0 text-sm font-semibold leading-6 text-white truncate cursor-text bg-white/5 border-none w-full"
      type="text"
      value={props.match.description}
      ref={inputRef}
      onChange={(event) =>
        updateMatch(props.index, { description: event.target.value })
      }
    />
  ) : (
    <span
      className="min-w-0 text-sm leading-6 whitespace-nowrap font-light text-gray-400 truncate cursor-text"
      onClick={() => setEditing(true)}
    >
      {props.match.description || 'Add description'}
    </span>
  );
}
