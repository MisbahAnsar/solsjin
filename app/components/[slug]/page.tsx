import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { NextLink } from "@/components/docs/docs-shell";
import { ComponentPreview } from "@/components/docs/preview";
import { PropsTable } from "@/components/docs/props-table";
import { Badge } from "@/components/ui/badge";
import { CodeBlock, InlineCommand } from "@/components/ui/code-block";
import { getEntry, neighbours, REGISTRY } from "@/lib/registry";

export function generateStaticParams() {
  return REGISTRY.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps<"/components/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return {};
  return { title: `${entry.name} · Solsjin UI`, description: entry.summary };
}

function readSource(file: string) {
  try {
    return readFileSync(path.join(/*turbopackIgnore: true*/ process.cwd(), file), "utf8");
  } catch {
    return `// Source not found: ${file}`;
  }
}

export default function ComponentPage({ params }: PageProps<"/components/[slug]">) {
  // Params are streamed behind a skeleton so client navigations between docs pages paint instantly.
  return (
    <Suspense fallback={<DocSkeleton />}>
      <ComponentDoc params={params} />
    </Suspense>
  );
}

function DocSkeleton() {
  return (
    <div aria-busy="true" className="flex animate-pulse gap-10 px-5 pb-24 pt-10 sm:px-10 lg:px-14">
      <div className="min-w-0 max-w-[880px] flex-1">
        <div className="h-3 w-40 rounded-full bg-bg-muted" />
        <div className="mt-4 h-9 w-72 rounded-xl bg-bg-muted" />
        <div className="mt-4 h-4 w-full max-w-[560px] rounded-full bg-bg-muted" />
        <div className="mt-2 h-4 w-2/3 max-w-[420px] rounded-full bg-bg-muted" />
        <div className="mt-10 h-[340px] rounded-[22px] border border-line bg-bg-subtle" />
      </div>
    </div>
  );
}

async function ComponentDoc({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();
  const { prev, next } = neighbours(slug);
  const toc = [
    ...entry.examples.map((example) => ({ id: example.id, label: example.title })),
    { id: "installation", label: "Installation" },
    { id: "api", label: "API reference" },
    { id: "accessibility", label: "Accessibility" },
  ];

  return (
    <div className="flex gap-10 px-5 pb-24 pt-10 sm:px-10 lg:px-14">
      <main className="min-w-0 max-w-[880px] flex-1">
        <nav aria-label="Breadcrumb" className="text-xs text-faint">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link className="transition-colors hover:text-fg" href="/components">
                Components
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>{entry.category}</li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-fg-soft">
              {entry.name}
            </li>
          </ol>
        </nav>
        <h1 className="mt-3 flex flex-wrap items-center gap-3 text-[clamp(30px,4vw,40px)] font-semibold leading-[1.05] tracking-[-.05em] text-fg">
          {entry.name}
          {entry.isNew && <Badge tone="success">New</Badge>}
          {entry.live && <Badge tone="solana">Live on-chain</Badge>}
        </h1>
        <p className="mt-3 max-w-[66ch] text-[15px] leading-7 text-muted">{entry.description}</p>

        <div className="mt-10 flex flex-col gap-12">
          {entry.examples.map((example) => (
            <ComponentPreview
              code={<CodeBlock code={example.code} title="tsx" />}
              demoId={`${entry.slug}:${example.id}`}
              description={example.description}
              key={example.id}
              live={entry.live && example.id === "default"}
              title={example.title}
            />
          ))}
        </div>

        <section aria-labelledby="installation" className="mt-16 scroll-mt-24">
          <h2 className="text-xl font-semibold tracking-[-.035em]" id="installation">
            Installation
          </h2>
          <p className="mt-2 text-sm text-muted">Copy the files into your project. They only depend on each other and the packages below.</p>
          {entry.deps && (
            <div className="mt-4">
              <InlineCommand command={`bun add ${entry.deps.filter((d) => !d.includes(" ")).join(" ")}`} />
            </div>
          )}
          {entry.provider && (
            <p className="mt-3 rounded-2xl border border-line bg-bg-subtle px-4 py-3 text-[13px] leading-6 text-fg-soft">
              Needs <code className="font-mono text-[12px] font-semibold">&lt;SolanaProvider&gt;</code> above it in the tree, for the connection, wallet, cluster and toasts.
            </p>
          )}
          <div className="mt-4 flex flex-col gap-3">
            {entry.files.map((file, index) => (
              <details className="group rounded-2xl" key={file} open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-1 py-2 font-mono text-[12px] text-fg-soft hover:text-fg [&::-webkit-details-marker]:hidden">
                  {file}
                  <span className="text-[11px] text-faint group-open:hidden">Show source</span>
                </summary>
                <CodeBlock code={readSource(file)} lineNumbers maxHeight={460} title={file.split("/").pop()} />
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="api" className="mt-16 scroll-mt-24">
          <h2 className="mb-4 text-xl font-semibold tracking-[-.035em]" id="api">
            API reference
          </h2>
          <PropsTable props={entry.props} />
          {entry.notes && (
            <ul className="mt-4 flex flex-col gap-2 text-[13px] leading-6 text-muted">
              {entry.notes.map((note) => (
                <li className="flex gap-2" key={note}>
                  <span aria-hidden="true" className="mt-2.5 size-1 shrink-0 rounded-full bg-faint" />
                  {note}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="accessibility" className="mt-16 scroll-mt-24">
          <h2 className="mb-4 text-xl font-semibold tracking-[-.035em]" id="accessibility">
            Accessibility
          </h2>
          <ul className="flex flex-col gap-2.5">
            {entry.a11y.map((note) => (
              <li className="flex gap-3 rounded-2xl border border-line bg-card px-4 py-3 text-[13px] leading-6 text-fg-soft" key={note}>
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                {note}
              </li>
            ))}
          </ul>
        </section>

        <nav aria-label="Pagination" className="mt-16 flex gap-3 border-t border-line pt-8">
          {prev ? <NextLink direction="prev" href={`/components/${prev.slug}`} label={prev.name} /> : <span className="flex-1" />}
          {next ? <NextLink direction="next" href={`/components/${next.slug}`} label={next.name} /> : <span className="flex-1" />}
        </nav>
      </main>
      <aside className="sticky top-24 hidden h-fit w-[200px] shrink-0 xl:block">
        <dl className="mb-8 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 rounded-2xl border border-line bg-card p-4 text-[12px] shadow-[0_1px_0_rgb(0_0_0/.02),0_8px_24px_-18px_rgb(0_0_0/.18)]">
          <dt className="text-faint">Category</dt>
          <dd className="text-right font-medium text-fg-soft">{entry.category}</dd>
          <dt className="text-faint">Files</dt>
          <dd className="text-right font-medium tabular-nums text-fg-soft">{entry.files.length}</dd>
          <dt className="text-faint">Deps</dt>
          <dd className="text-right font-medium tabular-nums text-fg-soft">{entry.deps?.length ?? 0}</dd>
          <dt className="text-faint">License</dt>
          <dd className="text-right font-medium text-fg-soft">MIT</dd>
        </dl>
        <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-faint">On this page</p>
        <ul className="mt-3 flex flex-col gap-2 border-l border-line">
          {toc.map((item) => (
            <li key={item.id}>
              <a className="-ml-px block border-l border-transparent pl-3 text-[13px] text-muted transition hover:border-fg hover:text-fg" href={`#${item.id}`}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
