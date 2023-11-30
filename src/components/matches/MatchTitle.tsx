import { useCallback, useRef, useState } from 'react';
import { useOnClickOutside } from '../../lib/hooks/useOnClickOutside';
import { SplitterMatch, updateMatch } from '../../state/useMatches';

export type MatchTitleProps = {
  match: SplitterMatch;
  index: number;
};

export function MatchTitle(props: MatchTitleProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClickOutside = useCallback(() => {
    setEditing(false);
  }, []);

  useOnClickOutside(inputRef, handleClickOutside);

  return editing ? (
    <input
      className="min-w-0 text-sm font-semibold leading-6 text-white truncate cursor-text bg-white/5 border-none"
      type="text"
      value={props.match.name}
      ref={inputRef}
      onChange={(event) =>
        updateMatch(props.index, { name: event.target.value })
      }
    />
  ) : (
    <h2
      className="min-w-0 text-sm font-semibold leading-6 text-white truncate cursor-text"
      onClick={() => setEditing(true)}
    >
      {props.match.name || 'Add name'}
    </h2>
  );
}
