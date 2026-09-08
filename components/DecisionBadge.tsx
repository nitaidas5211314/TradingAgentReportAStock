const STYLES: Record<string, { label: string; cls: string }> = {
  buy: {
    label: "买入",
    cls: "bg-emerald-500/12 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400",
  },
  sell: {
    label: "卖出",
    cls: "bg-rose-500/12 text-rose-600 ring-rose-500/30 dark:text-rose-400",
  },
  hold: {
    label: "观望",
    cls: "bg-amber-500/12 text-amber-600 ring-amber-500/30 dark:text-amber-400",
  },
};

const SIZES = {
  sm: "px-2 py-0.5 text-xs gap-1.5",
  md: "px-2.5 py-1 text-sm gap-2",
  lg: "px-4 py-1.5 text-base gap-2",
};

export default function DecisionBadge({
  decision,
  size = "md",
  showEnglish = true,
}: {
  decision: string;
  size?: keyof typeof SIZES;
  showEnglish?: boolean;
}) {
  const key = decision.trim().toLowerCase();
  const style = STYLES[key] ?? {
    label: decision,
    cls: "bg-slate-500/12 text-slate-600 ring-slate-500/30 dark:text-slate-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ring-1 whitespace-nowrap ${style.cls} ${SIZES[size]}`}
    >
      {style.label}
      {showEnglish && STYLES[key] ? (
        <span className="font-mono text-[0.85em] font-normal opacity-70">{decision}</span>
      ) : null}
    </span>
  );
}
