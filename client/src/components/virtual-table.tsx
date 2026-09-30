import { useRef, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";

interface VirtualTableProps<T> {
  items: T[];
  estimateRowHeight?: number;
  maxHeight?: number;
  header: ReactNode;
  renderRow: (item: T, index: number) => ReactNode;
  className?: string;
}

export function VirtualTable<T>({
  items,
  estimateRowHeight = 41,
  maxHeight = 400,
  header,
  renderRow,
  className,
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? totalSize - virtualItems[virtualItems.length - 1].end
      : 0;

  return (
    <div
      ref={parentRef}
      data-slot="table-container"
      className={cn("relative w-full overflow-auto", className)}
      style={{ maxHeight }}
    >
      <table data-slot="table" className="w-full caption-bottom text-sm">
        <thead
          data-slot="table-header"
          className="bg-background sticky top-0 z-10 [&_tr]:border-b"
        >
          {header}
        </thead>
        <tbody data-slot="table-body" className="[&_tr:last-child]:border-0">
          {paddingTop > 0 && (
            <tr aria-hidden="true" style={{ height: paddingTop }}>
              <td colSpan={99} className="p-0" />
            </tr>
          )}
          {virtualItems.map((virtualRow) =>
            renderRow(items[virtualRow.index], virtualRow.index),
          )}
          {paddingBottom > 0 && (
            <tr aria-hidden="true" style={{ height: paddingBottom }}>
              <td colSpan={99} className="p-0" />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
