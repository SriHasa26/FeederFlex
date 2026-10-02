import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'

/** A restrained, skeuomorphic-leaning playback control: tactile buttons with inset/pressed
 * states, a physical-feeling scrub bar. Button accessible names ("Play"/"Pause") and the
 * underlying <input type="range"> are preserved exactly -- relied on by the E2E suite. */
export function PlaybackControl({
  index, max, playing, timestampLabel, onPrev, onNext, onTogglePlay, onScrub,
}: {
  index: number
  max: number
  playing: boolean
  timestampLabel: string
  onPrev: () => void
  onNext: () => void
  onTogglePlay: () => void
  onScrub: (index: number) => void
}) {
  const pct = max > 0 ? (index / max) * 100 : 0

  return (
    <div className="ff-neu flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onPrev} aria-label="Previous" className="ff-neu-btn flex h-9 w-9 items-center justify-center text-[var(--ff-ink-dim)]">
          <SkipBack size={15} strokeWidth={2} />
        </button>

        <button
          onClick={onTogglePlay}
          className="ff-neu-btn flex h-9 items-center gap-2 px-4 text-[13px] font-semibold"
          style={{ color: 'var(--ff-primary)' }}
        >
          {playing ? <Pause size={15} strokeWidth={2.2} /> : <Play size={15} strokeWidth={2.2} />}
          {playing ? 'Pause' : 'Play'}
        </button>

        <button onClick={onNext} aria-label="Next" className="ff-neu-btn flex h-9 w-9 items-center justify-center text-[var(--ff-ink-dim)]">
          <SkipForward size={15} strokeWidth={2} />
        </button>

        <div className="ff-neu-inset ff-mono ml-1 flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[var(--ff-ink)]">
          <span className="h-1.5 w-1.5 rounded-full ff-pulse" style={{ background: playing ? 'var(--ff-primary)' : 'var(--ff-ink-faint)' }} />
          {timestampLabel}
        </div>

        <span className="ff-mono ml-auto hidden text-[10px] uppercase tracking-[0.08em] text-[var(--ff-ink-faint)] sm:inline">
          Deterministic replay · {index + 1} / {max + 1}
        </span>
      </div>

      <div className="relative flex items-center">
        <div className="ff-neu-inset relative h-2.5 w-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-150"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--ff-secondary), var(--ff-primary))' }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={max}
          value={index}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="ff-scrub-input absolute inset-0 h-2.5 w-full cursor-pointer opacity-0"
          aria-label="Simulation timeline"
        />
        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 shadow"
          style={{ left: `${pct}%`, background: 'var(--ff-surface)', borderColor: 'var(--ff-primary)' }}
        />
      </div>
    </div>
  )
}
