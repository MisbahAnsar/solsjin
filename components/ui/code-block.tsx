import { highlight } from "sugar-high";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

export type CodeBlockProps = {
  code: string;
  /** File name or language label shown in the header. */
  title?: string;
  lineNumbers?: boolean;
  className?: string;
  maxHeight?: number;
};

/** Syntax highlighted code with a copy button. Works in server and client components. */
export function CodeBlock({ code, title, lineNumbers = false, className, maxHeight }: CodeBlockProps) {
  const trimmed = code.replace(/^\n+|\s+$/g, "");
  // sugar-high joins block-level line spans with "\n"; drop them so <pre> does not double-space.
  const html = highlight(trimmed).replace(/<\/span>\n<span class="sh__line">/g, "</span><span class=\"sh__line\">");
  return (
    <div className={cn("group/code relative overflow-hidden rounded-2xl border border-white/[.06] bg-code text-code-fg", className)}>
      {title ? (
        <div className="flex h-10 items-center justify-between border-b border-white/[.06] pl-4 pr-1.5">
          <span className="truncate font-mono text-[11px] text-[#8e8d84]">{title}</span>
          <CopyButton className="text-[#8e8d84] hover:bg-white/[.06] hover:text-white" label={`Copy ${title}`} value={trimmed} />
        </div>
      ) : (
        <CopyButton
          className="absolute right-1.5 top-1.5 z-10 bg-code text-[#8e8d84] hover:bg-white/[.06] hover:text-white"
          label="Copy code"
          value={trimmed}
        />
      )}
      <pre
        className={cn("scrollbar-thin overflow-auto py-4 font-mono text-[12.5px] leading-[1.7]", lineNumbers ? "pl-1 pr-5" : "px-4 pr-12")}
        style={maxHeight ? { maxHeight } : undefined}
        tabIndex={0}
      >
        <code className={cn("sh-code", lineNumbers && "with-lines")} dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}

export function InlineCommand({ command, className }: { command: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-3 rounded-xl border border-line bg-card pl-4 pr-1.5 font-mono text-[12.5px] text-fg-soft shadow-soft",
        className,
      )}
    >
      <span aria-hidden="true" className="select-none text-faint">
        $
      </span>
      <span className="scrollbar-none min-w-0 flex-1 overflow-x-auto whitespace-nowrap">{command}</span>
      <CopyButton className="text-muted hover:bg-bg-muted hover:text-fg" label="Copy command" value={command} />
    </div>
  );
}
