type Props = { status: "EINGEREICHT"|"PRUEFEN"|"GUELTIG"|"FEHLERHAFT"|"ABGELEHNT"; className?: string };

export default function StatusBadge({ status, className="" }: Props) {
  const map: Record<string,string> = {
    EINGEREICHT: "bg-gray-200 text-gray-800",
    PRUEFEN:     "bg-amber-200 text-amber-900",
    GUELTIG:     "bg-green-200 text-green-900",
    FEHLERHAFT:  "bg-red-200 text-red-900",
    ABGELEHNT:   "bg-slate-200 text-slate-900",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-semibold ${map[status]} ${className}`}>
      {status}
    </span>
  );
}
