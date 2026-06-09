interface VideoBarProps {
  show: boolean
  top: number
  height: number
  fileName: string
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
}

export function VideoBar({ show, top, height, fileName, onPointerDown, onPointerMove, onPointerUp }: VideoBarProps) {
  return (
    <div className="relative shrink-0 w-7">
      <div className="absolute inset-x-0 top-0 bottom-0 flex justify-center">
        <div className="w-px bg-border/20 h-full" />
      </div>
      {show && (
        <div
          className="absolute inset-x-0 cursor-grab active:cursor-grabbing z-20"
          style={{ top, height: Math.max(height, 12) }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div className="absolute inset-0 rounded-md"
            style={{
              background: 'oklch(0.55 0.18 220 / 0.25)',
              border: '1.5px solid oklch(0.65 0.18 220 / 0.75)',
              boxShadow: '0 0 6px oklch(0.65 0.18 220 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.1)',
            }}
          />
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-md"
            style={{ background: 'oklch(0.7 0.18 220 / 0.9)' }}
          />

          {/* Sticky filename — sticks within the bar's bounds as the user scrolls */}
          <div className="sticky top-2 bottom-2 flex justify-center pointer-events-none py-1">
            <span
              className="whitespace-nowrap overflow-hidden"
              style={{
                writingMode: 'vertical-lr',
                transform: 'rotate(180deg)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.03em',
                color: 'oklch(0.72 0.15 220 / 0.9)',
                textShadow: '0 0 8px oklch(0.2 0.15 220 / 0.8)',
                maxHeight: 'calc(100vh - 2rem)',
              }}
            >
              {fileName}
            </span>
          </div>

          {height > 24 && (
            <div className="absolute inset-x-0 flex flex-col items-center gap-[3px]"
              style={{ top: '50%', transform: 'translateY(-50%)' }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1 h-1 rounded-full" style={{ background: 'oklch(0.7 0.18 220 / 0.6)' }} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
