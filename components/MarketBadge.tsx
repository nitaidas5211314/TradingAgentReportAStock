import { MARKETS, type MarketId } from "@/lib/market";

const SIZES = {
  sm: "px-1.5 py-0.5 text-[0.6875rem]",
  md: "px-2 py-0.5 text-xs",
};

export default function MarketBadge({
  market,
  size = "sm",
}: {
  market: MarketId;
  size?: keyof typeof SIZES;
}) {
  const m = MARKETS[market];
  return (
    <span
      className={`inline-flex items-center rounded font-medium ring-1 whitespace-nowrap ${m.cls} ${SIZES[size]}`}
    >
      {m.short}
    </span>
  );
}
