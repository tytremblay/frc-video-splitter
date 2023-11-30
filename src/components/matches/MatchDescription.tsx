import { useCallback, useRef, useState } from 'react';
import { useOnClickOutside } from '../../lib/hooks/useOnClickOutside';
import { SplitterMatch, updateMatch } from '../../state/useMatches';

export type MatchTitleProps = {
  match: SplitterMatch;
  index: number;
};

export function MatchDescription(props: MatchTitleProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleClickOutside = useCallback(() => {
    setEditing(false);
  }, []);

  useOnClickOutside(inputRef, handleClickOutside);

  return editing ? (
    <textarea
      className="text-sm leading-6 text-gray-400 cursor-text bg-white/5 border-none resize w-full"
      value={props.match.description}
      ref={inputRef}
      onChange={(event) =>
        updateMatch(props.index, { description: event.target.value })
      }
    />
  ) : (
    <p
      className="text-sm leading-6 font-light text-gray-400 whitespace-break-spaces cursor-text"
      onClick={() => setEditing(true)}
    >
      {props.match.description || 'Add description'}
    </p>
  );
}
