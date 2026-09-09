import type { Metadata } from "next";
import Link from "next/link";
import DecisionBadge from "@/components/DecisionBadge";
import MarketBadge from "@/components/MarketBadge";
import { ASSET_LABELS } from "@/lib/labels";
import { getTickers } from "@/lib/reports";

export const metadata: Metadata = { title: "标的列表" };

export default function TickersPage() {
  const tickers = getTickers();
  // 仓库里只有单一市场时不必占一列
  const showMarket = new Set(tickers.map((t) => t.market)).size > 1;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">标的列表</h1>
        <p className="mt-1 text-sm text-muted">共覆盖 {tickers.length} 个标的。</p>
      </header>

      <div className="panel overflow-hidden rounded-xl">
        <div className="table-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">代码</th>
                {showMarket ? <th className="px-4 py-3 font-medium">市场</th> : null}
                <th className="px-4 py-3 font-medium">公司</th>
                <th className="px-4 py-3 font-medium">行业 / 类型</th>
                <th className="px-4 py-3 font-medium">最新结论</th>
                <th className="px-4 py-3 font-medium">最新跑图</th>
                <th className="px-4 py-3 text-right font-medium">报告数</th>
              </tr>
            </thead>
            <tbody>
              {tickers.map((t) => (
                <tr
                  key={t.ticker}
                  className="border-b border-line transition last:border-b-0 hover:bg-[color:var(--bg)]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/tickers/${t.ticker}`}
                      className="font-mono font-semibold text-[color:var(--accent)] hover:underline"
                    >
                      {t.ticker}
                    </Link>
                  </td>
                  {showMarket ? (
                    <td className="px-4 py-3">
                      <MarketBadge market={t.market} />
                    </td>
                  ) : null}
                  <td className="px-4 py-3">{t.company ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {t.sector ?? (t.assetType ? ASSET_LABELS[t.assetType] : undefined) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <DecisionBadge decision={t.latest.decision} size="sm" showEnglish={false} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs tabular-nums text-muted">
                    {t.latest.date} {t.latest.timeLabel}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{t.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
