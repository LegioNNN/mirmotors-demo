/* ======================================================================== */
/*  DetailSpecBox - Detay sayfasinda kullanilan genel spec hucresi           */
/* ======================================================================== */

interface Props {
  label: string;
  value: string;
}

export default function DetailSpecBox({ label, value }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#111827]">{value}</p>
    </div>
  );
}
