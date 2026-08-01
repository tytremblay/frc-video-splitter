import { SplitterMatch } from '../../state/useMatches'
import { cn } from '@/lib/utils'

interface OrphanMatchListProps {
  matches: SplitterMatch[]
  selectedId: string | null
  onMatchClick: (match: SplitterMatch) => void
}

export function OrphanMatchList({ matches, selectedId, onMatchClick }: OrphanMatchListProps) {
  if (matches.length === 0) return null

  return (
    <div className="flex flex-col gap-1 mt-6">
      <p className="text-[9px] font-semibold uppercase tracking-widest mb-2 px-1"
        style={{ color: 'oklch(0.42 0.015 258)' }}>
        No timing data
      </p>
      {matches.map(match => {
        const isSelected = match.id === selectedId
        return (
          <button
            key={match.id}
            type="button"
            onClick={() => onMatchClick(match)}
            className={cn(
              'w-full text-left px-2 py-1.5 rounded-sm border-l-2 transition-all duration-100 group',
              isSelected
                ? 'border-l-[var(--primary)]'
                : 'border-l-border/30 hover:border-l-border/60'
            )}
            style={{
              background: isSelected
                ? 'oklch(0.71 0.168 61 / 0.12)'
                : 'oklch(0.14 0.009 258 / 0.5)',
              boxShadow: isSelected
                ? 'inset 0 0 0 1px oklch(0.71 0.168 61 / 0.2)'
                : 'inset 0 0 0 1px oklch(1 0 0 / 0.04)',
            }}
          >
            <span className={cn(
              'block text-[11px] font-semibold leading-tight truncate',
              isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
            )}>
              {match.name}
            </span>
            {match.description && (
              <span className="block text-[10px] leading-tight truncate mt-px"
                style={{ color: 'oklch(0.45 0.015 258)' }}>
                {match.description}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
