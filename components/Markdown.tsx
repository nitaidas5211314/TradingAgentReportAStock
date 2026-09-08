import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { rewriteHref, slugifyHeading } from "@/lib/heading";

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  const el = node as { props?: { children?: ReactNode } };
  return el.props ? textOf(el.props.children) : "";
}

/** 为 h2/h3 生成与目录一致的锚点 */
function heading(Tag: "h2" | "h3") {
  const H = ({ children, node, ...rest }: ComponentPropsWithoutRef<"h2"> & { node?: any }) => {
    const line = node?.position?.start?.line;
    const id =
      typeof line === "number" ? slugifyHeading(textOf(children), line - 1) : undefined;
    return (
      <Tag id={id} className="scroll-mt-24 group" {...rest}>
        {children}
        {id ? (
          <a
            href={`#${id}`}
            aria-label="锚点链接"
            className="ml-2 text-sm opacity-0 transition group-hover:opacity-60"
          >
            #
          </a>
        ) : null}
      </Tag>
    );
  };
  H.displayName = `Heading${Tag}`;
  return H;
}

const components: Components = {
  h2: heading("h2"),
  h3: heading("h3"),
  table: ({ children, ...rest }) => (
    <div className="table-scroll">
      <table {...rest}>{children}</table>
    </div>
  ),
  a: ({ href, children, ...rest }) => {
    const target = rewriteHref(href);
    if (target?.startsWith("/")) {
      return (
        <Link href={target} {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <a href={target} target="_blank" rel="noreferrer noopener" {...rest}>
        {children}
      </a>
    );
  },
};

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="report-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
