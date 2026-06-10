/* ======================================================================== */
/*  CarPlaceholder - Gorsel yuklenemeyince gosterilen fallback               */
/* ======================================================================== */

export default function CarPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-100">
      <div className="flex flex-col items-center gap-2">
        <svg
          className="h-20 w-20 text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
          <circle cx="7" cy="13" r="2" fill="currentColor" stroke="none" />
          <circle cx="17" cy="13" r="2" fill="currentColor" stroke="none" />
        </svg>
        <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
          Gorsel
        </span>
      </div>
    </div>
  );
}
