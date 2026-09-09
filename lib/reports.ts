import fs from "node:fs";
import path from "node:path";
import { slugifyHeading } from "./heading";
import { MARKET_ORDER, marketOf, type MarketId } from "./market";

const ROOT = process.cwd();
export const REPORTS_DIR = path.join(ROOT, "reports");
export const SUMMARY_DIR = path.join(ROOT, "summary");

export type Decision = "Buy" | "Sell" | "Hold" | string;

export interface ReportMeta {
  /** 标的代码，如 600519.SS */
  ticker: string;
  /** 交易日 YYYY-MM-DD（目录名） */
  date: string;
  /** 文件名，如 1530-CST */
  slug: string;
  /** 展示用时间，如 15:30 CST */
  timeLabel: string;
  /** 用于排序的时间戳（毫秒） */
  sortKey: number;
  decision: Decision;
  title: string;
  company?: string;
  sector?: string;
  exchange?: string;
  assetType?: string;
  /** 所属市场：A 股 / 港股 / 美股 / 加密 */
  market: MarketId;
  analysts: string[];
  startedAt?: string;
  startedAtLabel?: string;
  marketTimezone?: string;
  duration?: string;
  model?: string;
  /** 交易员方案 / 风控决定里的关键字段 */
  entryPrice?: string;
  stopLoss?: string;
  timeHorizon?: string;
  summary?: string;
  href: string;
}

export interface Report extends ReportMeta {
  markdown: string;
  sections: { id: string; title: string; level: number }[];
  hasJson: boolean;
}

export interface TickerInfo {
  ticker: string;
  company?: string;
  sector?: string;
  exchange?: string;
  assetType?: string;
  market: MarketId;
  count: number;
  latest: ReportMeta;
  reports: ReportMeta[];
}

export interface SummaryDoc {
  date: string;
  markdown: string;
}

/* ------------------------------------------------------------------ */
/* 解析                                                                */
/* ------------------------------------------------------------------ */

function readIfExists(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function listDirs(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    return [];
  }
}

/** 从 `- 标签：值` 这类元信息行里取值 */
function metaLine(lines: string[], label: string): string | undefined {
  const prefix = `- ${label}：`;
  const line = lines.find((l) => l.startsWith(prefix));
  return line?.slice(prefix.length).trim() || undefined;
}

function stripTicks(s?: string): string | undefined {
  return s?.replace(/`/g, "").trim() || undefined;
}

/** `1530-CST` -> `15:30 CST` */
function timeLabelFromSlug(slug: string): string {
  const m = slug.match(/^(\d{2})(\d{2})-(.+)$/);
  return m ? `${m[1]}:${m[2]} ${m[3]}` : slug;
}

function sortKeyOf(date: string, slug: string): number {
  const m = slug.match(/^(\d{2})(\d{2})/);
  const iso = `${date}T${m ? `${m[1]}:${m[2]}` : "00:00"}:00Z`;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

/** `**Rating**: Hold` / `**Action**: Buy` 之类的取值 */
function boldField(md: string, label: string): string | undefined {
  const re = new RegExp(`\\*\\*${label}\\*\\*[:：]\\s*(.+)`);
  const m = md.match(re);
  return m?.[1].trim() || undefined;
}

/** 从 JSON 的 instrument_context 里解析出名称/行业/交易所（股票为 Company，加密为 Name） */
function parseInstrumentContext(ctx: string) {
  const pick = (label: string) => {
    const m = ctx.match(new RegExp(`${label}:\\s*([^;.]+)`));
    return m?.[1].trim() || undefined;
  };
  return {
    company: pick("Company") ?? pick("Name"),
    sector: pick("Business classification"),
    exchange: pick("Exchange"),
  };
}

/** 抽出 `##` / `###` 标题，供目录导航使用 */
export function extractSections(markdown: string) {
  const out: { id: string; title: string; level: number }[] = [];
  let inFence = false;
  markdown.split("\n").forEach((line, i) => {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) return;
    const m = line.match(/^(#{2,3})\s+(.*)$/);
    if (!m) return;
    out.push({
      id: slugifyHeading(m[2], i),
      title: m[2].replace(/[`*]/g, "").trim(),
      level: m[1].length,
    });
  });
  return out;
}

function parseReport(ticker: string, date: string, slug: string): Report | null {
  const mdPath = path.join(REPORTS_DIR, ticker, date, `${slug}.md`);
  const markdown = readIfExists(mdPath);
  if (markdown === null) return null;

  const lines = markdown.split("\n");
  const title = (lines[0] ?? "").replace(/^#\s*/, "").trim();

  const assetRaw = metaLine(lines, "资产类型") ?? "";
  const assetType = assetRaw.split("（")[0]?.trim() || undefined;
  const analysts =
    assetRaw
      .match(/分析师[:：]\s*([^）)]+)/)?.[1]
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  const startedRaw = metaLine(lines, "开始时间") ?? "";
  const startedAt = startedRaw.split("（")[0]?.trim() || undefined;
  const startedAtLabel = startedRaw.match(/（(.+)）/)?.[1];

  // 结论：优先取 JSON 的 decision，其次是 md 里 `## 结论` 后的代码块
  const jsonPath = path.join(REPORTS_DIR, ticker, date, `${slug}.json`);
  const rawJson = readIfExists(jsonPath);
  let decision: string | undefined;
  let company: string | undefined;
  let sector: string | undefined;
  let exchange: string | undefined;

  if (rawJson) {
    try {
      const data = JSON.parse(rawJson);
      decision = data?.decision;
      const ctx: string | undefined = data?.state?.instrument_context;
      if (ctx) ({ company, sector, exchange } = parseInstrumentContext(ctx));
    } catch {
      /* JSON 损坏时退回 Markdown 解析 */
    }
  }
  if (!decision) {
    decision = markdown.match(/##\s*结论\s*\n+```\s*\n([^\n]+)\n```/)?.[1]?.trim();
  }
  if (!decision) decision = boldField(markdown, "Rating") ?? "Unknown";

  return {
    ticker,
    date,
    slug,
    timeLabel: timeLabelFromSlug(slug),
    sortKey: sortKeyOf(date, slug),
    decision,
    title,
    company,
    sector,
    exchange,
    assetType,
    market: marketOf(ticker, exchange, assetType),
    analysts,
    startedAt,
    startedAtLabel,
    marketTimezone: metaLine(lines, "市场时区"),
    duration: metaLine(lines, "跑图耗时"),
    model: stripTicks(metaLine(lines, "模型")),
    entryPrice: boldField(markdown, "Entry Price"),
    stopLoss: boldField(markdown, "Stop Loss"),
    timeHorizon: boldField(markdown, "Time Horizon"),
    summary: boldField(markdown, "Executive Summary"),
    href: `/reports/${ticker}/${date}/${slug}`,
    markdown,
    sections: extractSections(markdown),
    hasJson: rawJson !== null,
  };
}

/* ------------------------------------------------------------------ */
/* 查询                                                                */
/* ------------------------------------------------------------------ */

let cache: Report[] | null = null;

/** 扫描 reports/<ticker>/<date>/<time>.md，按时间倒序返回全部报告 */
export function getAllReports(): Report[] {
  if (cache) return cache;
  const all: Report[] = [];
  for (const ticker of listDirs(REPORTS_DIR)) {
    for (const date of listDirs(path.join(REPORTS_DIR, ticker))) {
      const dir = path.join(REPORTS_DIR, ticker, date);
      const slugs = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => f.replace(/\.md$/, ""));
      for (const slug of slugs) {
        const report = parseReport(ticker, date, slug);
        if (report) all.push(report);
      }
    }
  }
  all.sort((a, b) => b.sortKey - a.sortKey || b.date.localeCompare(a.date));
  cache = all;
  return all;
}

export function toMeta(r: Report): ReportMeta {
  const { markdown: _m, sections: _s, hasJson: _h, ...meta } = r;
  return meta;
}

export function getAllReportMetas(): ReportMeta[] {
  return getAllReports().map(toMeta);
}

export function getReport(ticker: string, date: string, slug: string): Report | undefined {
  return getAllReports().find(
    (r) => r.ticker === ticker && r.date === date && r.slug === slug,
  );
}

export function getTickers(): TickerInfo[] {
  const byTicker = new Map<string, Report[]>();
  for (const r of getAllReports()) {
    const list = byTicker.get(r.ticker) ?? [];
    list.push(r);
    byTicker.set(r.ticker, list);
  }
  return [...byTicker.entries()]
    .map(([ticker, list]) => {
      const latest = list[0];
      return {
        ticker,
        company: list.find((r) => r.company)?.company,
        sector: list.find((r) => r.sector)?.sector,
        exchange: list.find((r) => r.exchange)?.exchange,
        assetType: list.find((r) => r.assetType)?.assetType,
        market: latest.market,
        count: list.length,
        latest: toMeta(latest),
        reports: list.map(toMeta),
      };
    })
    .sort((a, b) => a.ticker.localeCompare(b.ticker));
}

export function getTicker(ticker: string): TickerInfo | undefined {
  return getTickers().find((t) => t.ticker === ticker);
}

/** summary/<date>.md，按日期倒序 */
export function getSummaries(): SummaryDoc[] {
  let files: string[] = [];
  try {
    files = fs.readdirSync(SUMMARY_DIR).filter((f) => f.endsWith(".md"));
  } catch {
    files = [];
  }
  return files
    .map((f) => ({
      date: f.replace(/\.md$/, ""),
      markdown: readIfExists(path.join(SUMMARY_DIR, f)) ?? "",
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getSummary(date: string): SummaryDoc | undefined {
  return getSummaries().find((s) => s.date === date);
}

export function getLatestSummary(): SummaryDoc | undefined {
  const md = readIfExists(path.join(ROOT, "latest-summary.md"));
  if (md) {
    const date = md.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? "latest";
    return { date, markdown: md };
  }
  return getSummaries()[0];
}

/* ------------------------------------------------------------------ */
/* 统计                                                                */
/* ------------------------------------------------------------------ */

export function getStats() {
  const reports = getAllReports();
  const tickers = getTickers();
  const counts = new Map<string, number>();
  const markets = new Map<MarketId, number>();
  for (const t of tickers) {
    counts.set(t.latest.decision, (counts.get(t.latest.decision) ?? 0) + 1);
    markets.set(t.market, (markets.get(t.market) ?? 0) + 1);
  }
  return {
    totalReports: reports.length,
    totalTickers: tickers.length,
    latestDate: reports[0]?.date,
    latestDecisions: counts,
    /** 各市场覆盖的标的数 */
    markets,
    tradingDays: new Set(reports.map((r) => r.date)).size,
  };
}

/** 按市场把标的分组，仅返回有数据的市场，顺序固定 */
export function getTickersByMarket(): { market: MarketId; tickers: TickerInfo[] }[] {
  const tickers = getTickers();
  return MARKET_ORDER.map((market) => ({
    market,
    tickers: tickers.filter((t) => t.market === market),
  })).filter((g) => g.tickers.length > 0);
}
