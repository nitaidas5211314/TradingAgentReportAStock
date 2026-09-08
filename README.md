# A 股多智能体研究报告 · Web 归档

把仓库里 TradingAgents 每次跑图产出的历史报告，变成一个可以浏览、检索的网站，
一键部署到 Vercel。

## 技术栈

- **Next.js 15**（App Router、React 19、TypeScript）
- **Tailwind CSS v4**（`@tailwindcss/postcss`）
- **react-markdown + remark-gfm** 渲染报告正文（含 GFM 表格）
- 全量 **SSG**：构建时扫描文件系统，产出纯静态页面，无数据库、无运行时依赖

## 数据来源

构建时直接读取仓库里已有的目录，不需要额外的数据同步：

```
reports/<ticker>/<YYYY-MM-DD>/<HHMM-TZ>.md    # 报告正文
reports/<ticker>/<YYYY-MM-DD>/<HHMM-TZ>.json  # 结论、公司/行业等结构化字段
summary/<YYYY-MM-DD>.md                       # 每日决策汇总
latest-summary.md                             # 最新一期汇总
```

解析逻辑集中在 [`lib/reports.ts`](lib/reports.ts)：

- 结论优先取 JSON 的 `decision`，缺失时回退到正文 `## 结论` 代码块、再回退到 `**Rating**`
- 公司名 / 行业 / 交易所从 JSON 的 `state.instrument_context` 中提取
- 交易日、分析师、耗时、模型等从正文开头的元信息行解析
- `**Entry Price**` / `**Stop Loss**` / `**Time Horizon**` / `**Executive Summary**` 提取到页头卡片
- `reports/<ticker>/latest.md` 是快捷软链性质的副本，会被自动跳过，不会重复计数

## 页面

| 路由 | 说明 |
|---|---|
| `/` | 概览：统计、各标的最新结论、最近报告、最新决策汇总 |
| `/tickers` | 标的列表（公司、行业、最新结论、报告数） |
| `/tickers/[ticker]` | 单个标的：最新结论卡片 + 全部历史报告 |
| `/reports` | 全部报告，支持按关键词 / 标的 / 结论筛选，按交易日分组 |
| `/reports/[ticker]/[date]/[slug]` | 报告详情：结构化元信息 + 正文 + 目录导航 + 前后报告切换 |
| `/summary` | 每日决策汇总列表 |
| `/summary/[date]` | 某日汇总 |

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:3000 。

生产构建：

```bash
npm run build && npm start
```

## 部署到 Vercel

仓库根目录就是 Next.js 项目，Vercel 会自动识别，**无需任何配置或环境变量**：

1. 在 https://vercel.com/new 导入这个 Git 仓库
2. Framework 保持自动识别的 `Next.js`，Root Directory 保持仓库根目录
3. Deploy

或用 CLI：

```bash
npx vercel --prod
```

### 新报告如何上线

报告是构建期读取的，所以**每次把新的 `reports/` 与 `summary/` 提交并 push 到仓库，
Vercel 就会自动重新构建并发布**。跑图脚本照常 commit 即可，不需要改动网站。

如果希望定时重新构建（例如跑图与 push 之间有延迟），可以在 Vercel 项目里配置
Deploy Hook，再由定时任务调用该 Hook 的 URL。

## 免责声明

报告由多智能体推理生成，可能存在幻觉，**不构成任何投资建议**。
