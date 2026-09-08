import Link from "next/link";

export default function NotFound() {
  return (
    <div className="panel mx-auto max-w-md rounded-xl px-6 py-14 text-center">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="mt-2 text-sm text-muted">没有找到这份报告。</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-white"
      >
        返回首页
      </Link>
    </div>
  );
}
