import { DocsShell, type NavGroup } from "@/components/docs/docs-shell";
import { groupedRegistry } from "@/lib/registry";

export default function ComponentsLayout({ children }: LayoutProps<"/components">) {
  const groups: NavGroup[] = groupedRegistry().map((group) => ({
    name: group.name,
    items: group.items.map(({ slug, name, category, summary, keywords, isNew }) => ({ slug, name, category, summary, keywords, isNew })),
  }));
  return <DocsShell groups={groups}>{children}</DocsShell>;
}
