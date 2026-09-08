import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 报告内容来自仓库内的 Markdown/JSON，构建期读取文件系统，全量静态生成。
  outputFileTracingIncludes: {
    "/**": ["./reports/**/*", "./summary/**/*", "./latest-summary.md"],
  },
};

export default nextConfig;
