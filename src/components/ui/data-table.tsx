import { cn } from "@/lib/utils";

export function DataTable({
  headers,
  columnWidths,
  children,
  emptyMessage,
}: {
  headers: string[];
  /** Percentage or fixed widths — enables `table-fixed` for even column distribution */
  columnWidths?: string[];
  children: React.ReactNode;
  emptyMessage?: string;
}) {
  const isEmpty =
    children === null ||
    children === undefined ||
    (Array.isArray(children) && children.length === 0);

  if (isEmpty && emptyMessage) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full min-w-[960px] text-left text-sm",
            columnWidths?.length ? "table-fixed" : ""
          )}
        >
          {columnWidths?.length ? (
            <colgroup>
              {columnWidths.map((width, index) => (
                <col key={`${width}-${index}`} style={{ width }} />
              ))}
            </colgroup>
          ) : null}
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              {headers.map((h, index) => (
                <th
                  key={`${h}-${index}`}
                  className={cn(
                    "px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500",
                    index === headers.length - 1 && h === "" ? "text-right" : ""
                  )}
                >
                  {h || "\u00a0"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function DataTableRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-brand-50/30", className)}>
      {children}
    </tr>
  );
}

export function DataTableCell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <td className={cn("px-5 py-4 align-middle", className)}>{children}</td>;
}
