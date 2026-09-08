import type { Metadata } from "next";
import Link from "next/link";
import { getSummaries } from "@/lib/reports";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
};

const NAV = [
  { href: "/", label: "概览" },
  { href: "/tickers", label: "标的" },
  { href: "/reports", label: "全部报告" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 仓库里没有 summary/ 目录时（例如只跑单标的的仓库），不显示汇总入口
  const nav = getSummaries().length
    ? [...NAV, { href: "/summary", label: "每日汇总" }]
    : NAV;

  return (
    <html lang="zh-CN">
      <body className="min-h-screen font-sans antialiased">
        <header className="sticky top-0 z-40 border-b border-line panel/80 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--panel)]/80">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-[color:var(--accent)] text-sm font-bold text-white">
                {SITE.logo}
              </span>
              <span className="hidden sm:inline">{SITE.shortName}</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-1.5 text-muted transition hover:bg-[color:var(--bg)] hover:text-[color:var(--fg)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>

        <footer className="mt-16 border-t border-line">
          <div className="mx-auto max-w-7xl px-4 py-8 text-xs leading-relaxed text-muted sm:px-6">
            <p>
              报告由多智能体推理生成，可能存在幻觉，<strong>不构成任何投资建议</strong>。
            </p>
            <p className="mt-1">
              数据在构建时从仓库的 <code className="font-mono">reports/</code> 与{" "}
              <code className="font-mono">summary/</code> 目录读取，新增报告提交后重新部署即可更新。
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
