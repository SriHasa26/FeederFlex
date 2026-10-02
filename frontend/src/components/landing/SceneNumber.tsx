/** A large, faint editorial numeral watermark used to give sparse min-h-screen "scenes" a
 *  deliberate, designed presence instead of empty space -- purely decorative, aria-hidden. */
export function SceneNumber({ n, side = 'right' }: { n: string; side?: 'left' | 'right' }) {
  return (
    <div
      aria-hidden
      className={`ff-display pointer-events-none absolute top-1/2 hidden -translate-y-1/2 select-none text-[340px] font-extrabold leading-none lg:block ${side === 'right' ? 'right-0 translate-x-1/4' : 'left-0 -translate-x-1/4'}`}
      style={{ color: 'var(--ff-ink)', opacity: 0.035 }}
    >
      {n}
    </div>
  )
}
