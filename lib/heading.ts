/** 由标题文本 + 所在行号生成稳定的锚点 id（目录与正文共用同一套规则） */
export function slugifyHeading(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `${base}-${index}` : `section-${index}`;
}

/** 把报告里的仓库相对链接（reports/x/y/z.md）改写成站内路由 */
export function rewriteHref(href?: string): string | undefined {
  if (!href) return href;
  if (/^(https?:|mailto:|#|\/)/.test(href)) return href;
  const clean = href.replace(/^\.\//, "").replace(/\.md$/, "");
  if (clean.startsWith("reports/")) return `/${clean}`;
  if (clean.startsWith("summary/")) return `/${clean}`;
  if (clean === "latest-summary") return "/summary";
  return href;
}
