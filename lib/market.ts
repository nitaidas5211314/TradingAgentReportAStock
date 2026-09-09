/** 市场归属：由标的后缀 + 交易所代码推断（纯函数，客户端组件也可用） */

export type MarketId = "cn" | "hk" | "us" | "crypto" | "other";

export const MARKETS: Record<MarketId, { label: string; short: string; cls: string }> = {
  cn: {
    label: "A 股",
    short: "A股",
    cls: "bg-red-500/10 text-red-600 ring-red-500/25 dark:text-red-400",
  },
  hk: {
    label: "港股",
    short: "港股",
    cls: "bg-violet-500/10 text-violet-600 ring-violet-500/25 dark:text-violet-400",
  },
  us: {
    label: "美股",
    short: "美股",
    cls: "bg-sky-500/10 text-sky-600 ring-sky-500/25 dark:text-sky-400",
  },
  crypto: {
    label: "加密货币",
    short: "加密",
    cls: "bg-amber-500/10 text-amber-600 ring-amber-500/25 dark:text-amber-400",
  },
  other: {
    label: "其他",
    short: "其他",
    cls: "bg-slate-500/10 text-slate-600 ring-slate-500/25 dark:text-slate-300",
  },
};

/** 首页/列表里的固定展示顺序 */
export const MARKET_ORDER: MarketId[] = ["cn", "hk", "us", "crypto", "other"];

const BY_SUFFIX: Record<string, MarketId> = {
  SS: "cn", // 上交所
  SH: "cn",
  SZ: "cn", // 深交所
  BJ: "cn", // 北交所
  HK: "hk",
};

const BY_EXCHANGE: Record<string, MarketId> = {
  SHH: "cn",
  SHZ: "cn",
  BSE: "cn",
  HKG: "hk",
  NMS: "us",
  NYQ: "us",
  NGM: "us",
  ASE: "us",
  PCX: "us",
  CCC: "crypto",
  CCY: "crypto",
};

/**
 * 推断标的所属市场。
 * 优先看后缀（600519.SS → A 股，0700.HK → 港股），其次看交易所代码，
 * 加密标的按 `-USD` 之类的后缀识别，无后缀的默认按美股处理。
 */
export function marketOf(ticker: string, exchange?: string, assetType?: string): MarketId {
  if (assetType?.toLowerCase() === "crypto") return "crypto";
  if (/-(USD|USDT|EUR|BTC)$/i.test(ticker)) return "crypto";

  const suffix = ticker.includes(".") ? ticker.split(".").pop()!.toUpperCase() : undefined;
  if (suffix && BY_SUFFIX[suffix]) return BY_SUFFIX[suffix];

  const ex = exchange?.trim().toUpperCase();
  if (ex && BY_EXCHANGE[ex]) return BY_EXCHANGE[ex];

  if (suffix) return "other";
  // 无后缀且非加密：AAPL、NVDA 这类默认美股
  return /^[A-Z.]{1,6}$/.test(ticker.toUpperCase()) ? "us" : "other";
}

export function marketLabel(id: MarketId): string {
  return MARKETS[id].label;
}
