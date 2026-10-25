"use client";

import { type ReactNode, useState } from "react";
import { ArrowCounterClockwiseIcon, CodeIcon, EyeIcon } from "@phosphor-icons/react";
import { GooeyTabs } from "@/components/motion/gooey-tabs";
import { cn } from "@/lib/utils";
import { Demo } from "./demos";

/** Preview / Code tabs around a live demo. `code` is a server-rendered CodeBlock. */
export function ComponentPreview({ demoId, code, title, description, live }: { demoId: string; code: ReactNode; title: string; description?: string; live?: boolean }) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [replay, setReplay] = useState(0);
  const prefix = `ex-${demoId.replace(/[^a-z0-9]/gi, "-")}`;

  return (
    <section aria-labelledby={`${prefix}-title`} className="scroll-mt-24" id={demoId.split(":")[1]}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-.02em] text-fg" id={`${prefix}-title`}>
            {title}
            {live && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-fg dark:text-accent">
                <span className="size-1.5 rounded-full bg-accent" /> Live
              </span>
            )}
          </h3>
          {description && <p className="mt-1 text-[13px] text-muted">{description}</p>}
        </div>
        <GooeyTabs
          ariaLabel={`${title} view`}
          idPrefix={prefix}
          onValueChange={setTab}
          options={[
            { value: "preview", label: "Preview", icon: <EyeIcon size={14} weight="bold" /> },
            { value: "code", label: "Code", icon: <CodeIcon size={14} weight="bold" /> },
          ]}
          size="sm"
          value={tab}
        />
      </div>
      <div
        aria-labelledby={`${prefix}-tab-preview`}
        className={cn("relative overflow-hidden rounded-[22px] border border-line bg-bg-subtle", tab !== "preview" && "hidden")}
        id={`${prefix}-panel-preview`}
        role="tabpanel"
      >
        <div aria-hidden="true" className="bg-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <button
          aria-label="Replay preview"
          className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full border border-line bg-card text-muted shadow-soft transition hover:text-fg"
          onClick={() => setReplay((n) => n + 1)}
          title="Replay"
          type="button"
        >
          <ArrowCounterClockwiseIcon size={14} weight="bold" />
        </button>
        <div className="relative flex min-h-[300px] items-center justify-center px-4 py-12 sm:px-10" key={replay}>
          <Demo id={demoId} />
        </div>
      </div>
      <div aria-labelledby={`${prefix}-tab-code`} className={cn(tab !== "code" && "hidden")} id={`${prefix}-panel-code`} role="tabpanel">
        {code}
      </div>
    </section>
  );
}
