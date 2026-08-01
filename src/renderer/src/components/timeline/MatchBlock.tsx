import { SplitterMatch } from '../../state/useMatches'
import { setVideoTimelineOffset, useVideo } from '../../state/useVideo'
import { cn } from '@/lib/utils'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ui/context-menu'
import { DESCRIPTION_MIN_HEIGHT } from './types'

interface MatchBlockProps {
  match: SplitterMatch
  visualTop: number
  visualHeight: number
  isSelected: boolean
  isCovered: boolean
  onClick: (match: SplitterMatch) => void
}

export function MatchBlock({ match, visualTop, visualHeight, isSelected, isCovered, onClick }: MatchBlockProps) {
  const showDescription = visualHeight >= DESCRIPTION_MIN_HEIGHT

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          onClick={() => onClick(match)}
          className={cn(
            'absolute left-0 right-0 overflow-hidden text-left transition-all duration-100 group',
            'rounded-sm border-l-2',
            isSelected
              ? 'border-l-[var(--primary)]'
              : isCovered
                ? 'border-l-[oklch(0.62_0.18_220)]'
                : 'border-l-border/40 hover:border-l-border'
          )}
          style={{
            top: visualTop,
            height: visualHeight,
            paddingLeft: '0.5rem',
            paddingRight: '0.375rem',
            paddingTop: visualHeight < 12 ? 0 : '0.2rem',
            background: isSelected
              ? 'oklch(0.71 0.168 61 / 0.18)'
              : isCovered
                ? 'oklch(0.62 0.18 220 / 0.1)'
                : 'oklch(0.14 0.009 258 / 0.7)',
            boxShadow: isSelected
              ? 'inset 0 0 0 1px oklch(0.71 0.168 61 / 0.3)'
              : isCovered
                ? 'inset 0 0 0 1px oklch(0.62 0.18 220 / 0.2)'
                : 'inset 0 0 0 1px oklch(1 0 0 / 0.05)',
          }}
        >
          <span className={cn(
            'block text-[11px] font-semibold leading-tight truncate',
            visualHeight < 14 && 'sr-only',
            isSelected ? 'text-primary' : isCovered ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
          )}>
            {match.name}
          </span>
          {showDescription && (
            <span className="block text-[10px] leading-tight truncate mt-px"
              style={{ color: isSelected ? 'oklch(0.71 0.168 61 / 0.7)' : 'oklch(0.5 0.015 258)' }}>
              {match.description}
            </span>
          )}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          disabled={match.actualTime == null}
          onSelect={() => {
            const { currentSeconds } = useVideo.getState()
            setVideoTimelineOffset(match.actualTime! - currentSeconds)
          }}
        >
          Sync offset to this match
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
