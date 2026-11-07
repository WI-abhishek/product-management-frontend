import React, { useState } from "react";
import { Pagination } from "@/theme/table/pagination";
import { LuChevronDown, LuPackageOpen } from "react-icons/lu";

export interface ModernTableColumn {
  field: string;
  heading: string;
  className?: string;
  headerClassName?: string;
  render?: (value: any, row: any, index: number) => React.ReactNode;
}

export interface ModernTableProps {
  columns: ModernTableColumn[];
  rows: any[];
  isLoading?: boolean;
  totalRecords?: number;
  currentPage?: number;
  noOfRows?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (count: number) => void;
  expandedRowRender?: (row: any, index: number) => React.ReactNode;
  emptyMessage?: string;
  emptySubtext?: string;
}

export const ModernTable: React.FC<ModernTableProps> = ({
  columns,
  rows,
  isLoading = false,
  totalRecords = 0,
  currentPage = 1,
  noOfRows = 10,
  onPageChange,
  onRowsPerPageChange,
  expandedRowRender,
  emptyMessage = "No records found",
  emptySubtext = "Try adjusting your search filters or add a new record.",
}) => {
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);

  const totalPages = Math.ceil(totalRecords / noOfRows) || 1;

  const handleRowClick = (rowIndex: number) => {
    if (!expandedRowRender) return;
    setExpandedRowIndex((prev) => (prev === rowIndex ? null : rowIndex));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden flex flex-col font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.field}
                  className={`py-3.5 px-5 select-none ${col.headerClassName || ""}`}
                >
                  {col.heading}
                </th>
              ))}
              {expandedRowRender && (
                <th className="py-3.5 px-5 text-right w-14">
                  <span className="sr-only">Expand</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.field} className="py-4 px-5">
                      <div className="h-4 bg-gray-100 rounded-md w-3/4" />
                    </td>
                  ))}
                  {expandedRowRender && (
                    <td className="py-4 px-5 text-right">
                      <div className="w-6 h-6 bg-gray-100 rounded-md ml-auto" />
                    </td>
                  )}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (expandedRowRender ? 1 : 0)}
                  className="py-16 text-center text-gray-500"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <LuPackageOpen size={28} />
                  </div>
                  <p className="text-base font-semibold text-gray-800">{emptyMessage}</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">{emptySubtext}</p>
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => {
                const isExpanded = expandedRowIndex === rowIndex;

                return (
                  <React.Fragment key={row.productId || `row-${rowIndex}`}>
                    <tr
                      onClick={() => handleRowClick(rowIndex)}
                      className={`group transition-colors duration-150 cursor-pointer select-none ${
                        isExpanded
                          ? "bg-indigo-50/40"
                          : "hover:bg-gray-50/80 bg-white"
                      }`}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.field}
                          className={`py-4 px-5 text-sm text-gray-800 align-middle ${
                            col.className || ""
                          }`}
                        >
                          {col.render
                            ? col.render(row[col.field], row, rowIndex)
                            : (row[col.field] ?? "-")}
                        </td>
                      ))}
                      {expandedRowRender && (
                        <td className="py-4 px-5 text-right align-middle w-14">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-transform duration-300 ${
                              isExpanded
                                ? "bg-indigo-100 text-indigo-700 rotate-180"
                                : "text-gray-400 group-hover:text-gray-700 group-hover:bg-gray-100"
                            }`}
                          >
                            <LuChevronDown size={18} />
                          </span>
                        </td>
                      )}
                    </tr>

                    {expandedRowRender && (
                      <tr className="border-b border-gray-100">
                        <td
                          colSpan={columns.length + 1}
                          className="p-0 border-0"
                        >
                          <div
                            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                              isExpanded
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="p-6 bg-linear-to-r from-gray-50/90 via-indigo-50/20 to-gray-50/90 border-t border-gray-100 shadow-inner">
                                {expandedRowRender(row, rowIndex)}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalRecords > 0 && onPageChange && onRowsPerPageChange && (
        <div className="border-t border-gray-200 px-5 py-3 bg-white flex items-center justify-between">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={noOfRows}
            totalRecords={totalRecords}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            entryLabel="products"
          />
        </div>
      )}
    </div>
  );
};

