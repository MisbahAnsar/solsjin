import type { PropDoc } from "@/lib/registry";

export function PropsTable({ props }: { props: PropDoc[] }) {
  return (
    <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[620px] text-left text-[13px]">
        <thead className="bg-bg-subtle text-[11px] uppercase tracking-[.08em] text-faint">
          <tr>
            <th className="px-4 py-2.5 font-semibold" scope="col">Prop</th>
            <th className="px-4 py-2.5 font-semibold" scope="col">Type</th>
            <th className="px-4 py-2.5 font-semibold" scope="col">Default</th>
            <th className="px-4 py-2.5 font-semibold" scope="col">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {props.map((prop) => (
            <tr className="align-top transition-colors hover:bg-bg-subtle/60" key={prop.name}>
              <td className="whitespace-nowrap px-4 py-3">
                <code className="font-mono text-[12px] font-semibold text-fg">{prop.name}</code>
                {prop.required && <span className="ml-1 text-danger" title="Required">*</span>}
              </td>
              <td className="px-4 py-3">
                <code className="break-words rounded-md bg-bg-muted px-1.5 py-0.5 font-mono text-[11.5px] text-violet">{prop.type}</code>
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-[11.5px] text-muted">{prop.default ?? "—"}</td>
              <td className="px-4 py-3 leading-5 text-fg-soft">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
