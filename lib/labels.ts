/** 资产类型的中文展示名（客户端组件也会用，故与 lib/reports.ts 分开，避免引入 node:fs） */
export const ASSET_LABELS: Record<string, string> = {
  stock: "股票",
  crypto: "加密货币",
  etf: "ETF",
  index: "指数",
  forex: "外汇",
};

export function assetLabel(assetType?: string): string | undefined {
  if (!assetType) return undefined;
  const label = ASSET_LABELS[assetType.toLowerCase()];
  return label ? `${label}（${assetType}）` : assetType;
}
