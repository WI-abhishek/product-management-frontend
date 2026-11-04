import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  type ReactNode,
} from "react";
import "@/theme/table/table.style.scss";
import { Checkbox } from "@/theme/checkbox/checkbox";
import { Pagination } from "@/theme/table/pagination";
import { SortIcon } from "@/theme/table/sort-icons";
import { IoIosSearch } from "react-icons/io";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { Switch } from "@/theme/switch/switch";
import { Spinner } from "@/theme/spinner/spinner";
import moment from "moment-timezone";
import parse from "html-react-parser";
import { apiBase, commonUtils } from "@/constants";
import TableSettingsPopOver from "@/theme/table/table-settings-popover";
import TableManagableColumns from "@/theme/table/table-managable-columns";
import MenuPopOver from "@/theme/table/menu-popover";
import { TableCards } from "@/theme/table/table-cards";
import { getInitials } from "@/utils/general-utils";
import { useBoxSize } from "@/hooks/use-boxsize";
import { ImagePreviewModal } from "@/theme/image-preview-modal/image-preview.modal";
import { SelectBase } from "@/theme/select/select";

type TableProps = {
  rows: any;
  columns: any;
  onFilterChange?: (fieldName: any, value: any) => void;
  onSortChange?: (fieldName: any, order: any) => void;
  onActionClick?: (actionName: any, element: any) => void;
  onSearchServer?: (value: string) => void;
  onPageChangeServer?: (page: number) => void;
  onRowsPerPageChangeServer?: (rows: number) => void;
  onInputChange?: (value: any, fieldName: any, element: any) => void;
  onLiveInputChange?: (value: any, fieldName: any, element: any) => void;
  onRowClick?: (row: any, rowIndex: number) => void;
  expandedRowIndex?: number;
  expandedRowContent?: (row: any, rowIndex: number) => ReactNode;
  isServerSide?: boolean;
  totalRecords?: any;
  currentPage?: any;
  noOfRows?: any;
  search?: string;
  tableHeading?: string;
  isHeading?: boolean;
  isGlobalSearch?: boolean;
  isTableLoading?: boolean;
  rowColorField?: string;
  onColumnClick?: (rowData: any) => void;
  hasPagination?: boolean;
  isManagable?: boolean;
  tableName?: string;
  isColumnSetting?: boolean;
};

export const TableComponent = forwardRef(
  (
    {
      rows,
      columns,
      onFilterChange,
      onSortChange,
      onActionClick,
      onSearchServer,
      onPageChangeServer,
      onRowsPerPageChangeServer,
      onInputChange,
      onLiveInputChange,
      onRowClick,
      expandedRowIndex = -1,
      expandedRowContent,
      isServerSide = false,
      totalRecords = 0,
      currentPage = 1,
      noOfRows = 10,
      search = "",
      tableHeading,
      isHeading = false,
      isGlobalSearch = true,
      isTableLoading = false,
      rowColorField,
      onColumnClick,
      hasPagination = true,
      isManagable = false,
      tableName = "",
      isColumnSetting = true,
    }: TableProps,
    ref,
  ) => {
    const searchRef: any = useRef(null);
    const tableRef: any = useRef(null);
    const debounceTimer: any = useRef(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const isFilterableRef = useRef(false);
    const isSortableRef = useRef(false);
    const hasUserFilteredRef = useRef(false);
    const inputRefs = useRef<any>({});
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentTablePage, setCurrentTablePage] = useState(isServerSide ? currentPage : 1);
    const [rowsPerPage, setRowsPerPage] = useState(noOfRows);
    const [searchText, setSearchText] = useState(search);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const allRowsChecked = rows?.length > 0 && rows.every((r: any) => r.isChecked);
    const pageOffset = ((isServerSide ? currentPage : currentTablePage) - 1) * rowsPerPage;
    const [openSearch, setIsSearchOpen] = useState(true);
    const [serverFilters, setServerFilters] = useState([]);
    const [, setIsFiltering] = useState(false);
    const [tableSettingHandler, setTableSettingHandler] = useState({
      isFilter: false,
      isSort: false,
    });

    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    const [columnOrder, setColumnOrder] = useState<string[]>([]);

    const [activeSort, setActiveSort]: any = useState<{
      field?: string;
      order: "" | "asc" | "desc";
    }>({ order: "" });
    const [loading, setLoading] = useState(false);
    const [imagePreviewModal, setImagePreviewModal] = useState({ isOpen: false, path: "" });

    const toggleSort = (field: string, allField: any) => {
      if (!allField?.isSortable) {
        return;
      }
      setActiveSort((prev: any) => {
        let nextOrder: "" | "asc" | "desc" = "";

        if (prev.field !== field) {
          nextOrder = "asc";
        } else if (prev.order === "") {
          nextOrder = "asc";
        } else if (prev.order === "asc") {
          nextOrder = "desc";
        } else {
          nextOrder = "";
        }

        if (isServerSide) {
          onSortChange?.(field, nextOrder);
        }

        return nextOrder ? { field, order: nextOrder } : { order: "" };
      });
    };

    const onAction = (action: any, element: any) => {
      onActionClick?.(action, element);
    };

    const updateServerFilters = (field: string, value: string) => {
      hasUserFilteredRef.current = true;
      setServerFilters((prev: any) => {
        if (value.trim()) {
          const exists = prev.find((f: any) => f.field === field);

          return exists
            ? prev.map((f: any) => (f.field === field ? { ...f, value } : f))
            : [...prev, { field, value }];
        }

        return prev.filter((f: any) => f.field !== field);
      });
    };

    const processedRows = useMemo(() => {
      let data = [...rows];

      if (!isServerSide) {
        if (debouncedSearch) {
          const searchLower = debouncedSearch.toLowerCase();

          data = data.filter((row: any) =>
            Object.values(row).some((value) =>
              String(value ?? "")
                .toLowerCase()
                .includes(searchLower),
            ),
          );
        }
        data = data.filter((row: any) =>
          Object.entries(filters).every(([field, value]) => {
            if (!value) {
              return true;
            }
            return String(row[field] ?? "")
              .toLowerCase()
              .includes(String(value).toLowerCase());
          }),
        );

        if (activeSort.field && activeSort.order) {
          data.sort((a: any, b: any) => {
            const aVal = a[activeSort.field];
            const bVal = b[activeSort.field];

            if (aVal === null) {
              return 1;
            }
            if (bVal === null) {
              return -1;
            }

            if (aVal < bVal) {
              return activeSort.order === "asc" ? -1 : 1;
            }
            if (aVal > bVal) {
              return activeSort.order === "asc" ? 1 : -1;
            }
            return 0;
          });
        }
      }

      return data;
    }, [rows, filters, activeSort, debouncedSearch, isServerSide]);

    const totalRowRecords = isServerSide ? totalRecords : processedRows.length;
    const totalPages = Math.ceil(totalRowRecords / rowsPerPage);

    const paginatedRows = useMemo(() => {
      if (isServerSide) {
        return processedRows;
      }

      const start = (currentTablePage - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      return processedRows.slice(start, end);
    }, [processedRows, currentTablePage, rowsPerPage, isServerSide]);

    const handlePageChange = (page: number) => {
      if (isServerSide) {
        onPageChangeServer?.(page);
      } else {
        setCurrentTablePage(page);
      }
    };

    const handleRowsPerPageChange = (rows: number) => {
      if (isServerSide) {
        onRowsPerPageChangeServer?.(rows);
        onPageChangeServer?.(1);
      } else {
        setRowsPerPage(rows);
        setCurrentTablePage(1);
      }
    };

    const handleClearInput = () => {
      Object.values(inputRefs.current).forEach((input: any) => {
        if (input) {
          input.value = "";
        }
      });
    };

    const { width: cardWidth } = useBoxSize(tableRef);
    useImperativeHandle(ref, () => ({
      clearInput: handleClearInput,
    }));

    useEffect(() => {
      if (isServerSide) {
        setFilters({});
        setServerFilters([]);
      }
    }, [isServerSide]);

    useEffect(() => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      setLoading(true);

      debounceTimer.current = setTimeout(() => {
        setDebouncedSearch(searchText.trim());

        if (isServerSide) {
          onSearchServer?.(searchText.trim());
        } else {
          setCurrentTablePage(1);
        }
      }, 1000);

      return () => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
      };
    }, [searchText, isServerSide]);

    useEffect(() => {
      if (!isServerSide) {
        return undefined;
      }
      if (!hasUserFilteredRef.current) {
        return undefined;
      }

      setIsFiltering(true);

      const handler = setTimeout(() => {
        onFilterChange?.(serverFilters, null);
        setIsFiltering(false);
      }, 500);

      return () => clearTimeout(handler);
    }, [serverFilters, isServerSide]);

    useEffect(() => {
      if (!isServerSide) {
        return;
      }
      setRowsPerPage(noOfRows);
    }, [noOfRows, isServerSide]);

    useEffect(() => {
      if (columns?.length) {
        const defaultVisible = columns
          .filter((col: any) => col?.field)
          .map((col: any) => col.field);

        setVisibleColumns(defaultVisible);
      }
    }, [columns]);

    useEffect(() => {
      if (!isManagable || !tableName || !columns?.length) {
        return;
      }
      try {
        const stored = localStorage.getItem(`table-col-order-${tableName}`);
        if (stored) {
          setColumnOrder(JSON.parse(stored));
        }
      } catch {
        /* ignore */
      }
    }, [isManagable, tableName, columns]);

    const actionFields = useMemo(() => {
      const allActionCols = columns?.filter((item: any) => item.isActionField) ?? [];
      return allActionCols.reduce((merged: any, col: any) => {
        if (!merged) {
          return col;
        }
        return { ...merged, actionList: [...merged.actionList, ...col.actionList] };
      }, null);
    }, [columns]);

    const filteredColumns = useMemo(() => {
      const visible = columns?.filter((col: any) => {
        if (col?.field === "row_index" || col?.isStatus || col?.isNormalSelectBox) {
          return true;
        }
        if (col?.isActionField) {
          const allHidden = col?.actionList?.every((icon: any) => icon?.hidden);
          return !allHidden;
        }
        return visibleColumns.includes(col.field);
      });

      if (!isManagable || columnOrder.length === 0) {
        return visible;
      }

      // Separate special (pinned) columns from orderable ones, preserving original index
      const isSpecial = (col: any) =>
        col?.field === "row_index" || col?.isStatus || col?.isNormalSelectBox || col?.isActionField;

      // Build a map of original index -> special column
      const specialAtIndex = new Map<number, any>();
      visible.forEach((col: any, idx: number) => {
        if (isSpecial(col)) {
          specialAtIndex.set(idx, col);
        }
      });

      const orderable = visible.filter((col: any) => !isSpecial(col));

      const sorted = columnOrder
        .map((f) => orderable.find((col: any) => col.field === f))
        .filter(Boolean);

      // remaining visible orderable cols not in columnOrder
      const remaining = orderable.filter((col: any) => !columnOrder.includes(col.field));

      // Start with the re-ordered orderable columns
      const reordered = [...sorted, ...remaining];

      // Re-insert each special column at its original index position
      const result: any[] = [...reordered];
      const specialEntries = Array.from(specialAtIndex.entries()).sort((a, b) => a[0] - b[0]);
      for (const [originalIdx, col] of specialEntries) {
        const insertAt = Math.min(originalIdx, result.length);
        result.splice(insertAt, 0, col);
      }

      return result;
    }, [columns, visibleColumns, isManagable, columnOrder]);

    useEffect(() => {
      setLoading(isTableLoading);
    }, [isTableLoading]);

    return (
      <>
        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden">
          <TableCards
            columns={columns}
            onAction={onAction}
            inputRefs={inputRefs}
            isHeading={isHeading}
            pageOffset={pageOffset}
            onRowClick={onRowClick}
            totalPages={totalPages}
            openSearch={openSearch}
            isTableLoading={loading}
            rowsPerPage={rowsPerPage}
            actionFields={actionFields}
            tableHeading={tableHeading}
            paginatedRows={paginatedRows}
            onInputChange={onInputChange}
            setSearchText={setSearchText}
            totalRecords={totalRowRecords}
            onPageChange={handlePageChange}
            isGlobalSearch={isGlobalSearch}
            allRowsChecked={allRowsChecked}
            visibleColumns={visibleColumns}
            filteredColumns={filteredColumns}
            setIsSearchOpen={setIsSearchOpen}
            onLiveInputChange={onLiveInputChange}
            setVisibleColumns={setVisibleColumns}
            tableSettingHandler={tableSettingHandler}
            onRowsPerPageChange={handleRowsPerPageChange}
            setTableSettingHandler={setTableSettingHandler}
            currentPage={isServerSide ? currentPage : currentTablePage}
          />
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className={`table-card`} ref={tableRef}>
            <div className={`table-header gap-3 flex flex-wrap items-center px-3 py-4`}>
              {isGlobalSearch && (
                <div
                  className={`flex cursor-pointer h-10 items-center overflow-hidden rounded-lg border bg-white border-gray-200 transition-all duration-300 ${openSearch ? "w-64 px-2" : "w-13 justify-center"
                    }`}
                >
                  <button className="flex h-10 w-8 shrink-0 items-center justify-center rounded-full text-gray-600 transition-colors cursor-pointer">
                    <IoIosSearch size={20} />
                  </button>
                  <div ref={searchRef}>
                    <input
                      type="text"
                      placeholder="Search here..."
                      className={`text-sm outline-none transition-all duration-300 ${openSearch ? " w-full opacity-100" : "w-0 opacity-0 pointer-events-none"
                        }`}
                      onChange={(e) => {
                        setSearchText(e.target?.value);
                      }}
                    />
                  </div>
                </div>
              )}

              {isColumnSetting && (
                <div className="flex  pointer! items-center justify-center rounded-lg border border-gray-200 bg-white ms-auto">
                  <TableSettingsPopOver
                    columns={columns}
                    visibleColumns={visibleColumns}
                    setVisibleColumns={setVisibleColumns}
                    tableSettingHandler={tableSettingHandler}
                    setTableSettingHandler={setTableSettingHandler}
                  />
                </div>
              )}

              {isManagable && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:bg-red-50">
                  <TableManagableColumns
                    columns={columns}
                    tableName={tableName}
                    onOrderChange={(orderedFields) => setColumnOrder(orderedFields)}
                  />
                </div>
              )}

            </div>

            <div className="table-wrapper">
              {loading && (
                <div className="table-loader flex justify-center items-center">
                  <span>
                    <Spinner className={"w-6.25 h-6.25"} />
                  </span>
                </div>
              )}
              <div ref={wrapperRef} className={`table-body-wrapper custom-scrollbar-horizontal`}>
                <table className="w-full">
                  <thead>
                    <tr>
                      {filteredColumns?.map((colVal: any, index: any) => {
                        if (!isFilterableRef.current && colVal?.isFilterable) {
                          isFilterableRef.current = true;
                          setTableSettingHandler((prev: any) => {
                            return {
                              ...prev,
                              isFilter: true,
                            };
                          });
                        }
                        if (!isSortableRef.current && colVal?.isSortable) {
                          isSortableRef.current = true;
                          setTableSettingHandler((prev: any) => {
                            return {
                              ...prev,
                              isSort: true,
                            };
                          });
                        }
                        return (
                          <Fragment key={"heading-columns" + index}>
                            {colVal?.field === "row_index" ? (
                              <>
                                <th>
                                  <div
                                    style={{
                                      maxWidth: `${colVal?.maxWidth ? colVal?.maxWidth : "180px"}`,
                                    }}
                                    className="px-4"
                                  >
                                    <span className="th-text text-center">
                                      {colVal?.heading || "Sr No."}
                                    </span>
                                  </div>
                                </th>
                              </>
                            ) : colVal?.isStatus || colVal?.isCustomStatus ? (
                              <>
                                <th>
                                  <div className="px-4">
                                    <span className="th-text text-center">
                                      {colVal?.heading ? colVal?.heading : "Status"}
                                    </span>
                                  </div>
                                </th>
                              </>
                            ) : colVal?.isActionField ? (
                              <>
                                <th>
                                  <div
                                    style={{
                                      maxWidth: `${colVal?.maxWidth ? colVal?.maxWidth : "180px"}`,
                                    }}
                                    className="px-4"
                                  >
                                    <span className="th-text text-center">Actions</span>
                                  </div>
                                </th>
                              </>
                            ) : colVal?.isNormalSelectBox && colVal?.showHeadingCheckbox ? (
                              <>
                                <th>
                                  <div className="heading-checkbox px-4 flex justify-center items-center">
                                    <Checkbox
                                      checked={allRowsChecked}
                                      onChange={() => {
                                        onAction("normal-select-all-box", null);
                                      }}
                                    />
                                  </div>
                                </th>
                              </>
                            ) : (
                              <>
                                <th>
                                  <div
                                    key={index + colVal?.field}
                                    className={`table-heading-box px-4 py-3 flex flex-col justify-center`}
                                  >
                                    <div
                                      className="flex flex-row items-center  cursor-pointer"
                                      onClick={() => toggleSort(colVal.field, colVal)}
                                    >
                                      <div
                                        className="th-text text-start!"
                                        style={{
                                          ...(colVal?.minWidth ? { minWidth: colVal?.minWidth } : {}),
                                          width: `${colVal?.width ? colVal?.width : colVal?.maxWidth ? colVal?.maxWidth : ""}`,
                                        }}
                                      >
                                        {colVal.heading}
                                      </div>
                                      {tableSettingHandler?.isSort && colVal?.isSortable && (
                                        <span className="pl-3.75">
                                          <SortIcon
                                            sorted={
                                              activeSort.field === colVal.field
                                                ? activeSort.order
                                                : ""
                                            }
                                          />
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      className={`filter-slot ${tableSettingHandler?.isFilter && colVal?.isFilterable && "h-8"}`}
                                    >
                                      {tableSettingHandler?.isFilter && colVal?.isFilterable && (
                                        <input
                                          name={colVal?.field}
                                          type={
                                            colVal?.inputFieldType ? colVal?.inputFieldType : "text"
                                          }
                                          placeholder={
                                            colVal?.placeHolder ? colVal?.placeHolder : "Search..."
                                          }
                                          className={`filter-input text-sm duration-200 pb-1 pt-3`}
                                          onChange={(e) => {
                                            if (isServerSide) {
                                              updateServerFilters(colVal.field, e.target.value);
                                            } else {
                                              setFilters((prev: any) => ({
                                                ...prev,
                                                [colVal.field]: e.target.value,
                                              }));
                                            }
                                          }}
                                        />
                                      )}
                                    </div>
                                  </div>
                                </th>
                              </>
                            )}
                          </Fragment>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows?.length > 0 ? (
                      paginatedRows.map((rowField: any, rowIndex: number) => {
                        const rowColor = rowColorField ? rowField?.[rowColorField] || "" : "";
                        return (
                          <Fragment key={rowIndex + 2}>
                            <tr
                              className={`table-row ${onRowClick ? "cursor-pointer" : ""} ${rowColor ? "has-row-color" : ""}`}
                              style={rowColor ? { backgroundColor: rowColor } : undefined}
                              onMouseEnter={
                                rowColor
                                  ? (e) => {
                                    (e.currentTarget as HTMLTableRowElement).style.opacity =
                                      "0.75";
                                  }
                                  : undefined
                              }
                              onMouseLeave={
                                rowColor
                                  ? (e) => {
                                    (e.currentTarget as HTMLTableRowElement).style.opacity = "1";
                                  }
                                  : undefined
                              }
                              onClick={() => onRowClick?.(rowField, rowIndex)}
                            >
                              {filteredColumns?.map((colField: any, colIndex: number) => {
                                if (colField?.field === "row_index") {
                                  return (
                                    <td key={colIndex}>
                                      <div
                                        style={{
                                          maxWidth: `${colField?.maxWidth ? colField?.maxWidth : "180px"}`,
                                        }}
                                        className="text-center"
                                      >
                                        <span
                                          className={`td-text ${colField?.isBoldText ? "is-bold-text" : ""} text-center`}
                                        >
                                          {pageOffset + rowIndex + 1}
                                        </span>
                                      </div>
                                    </td>
                                  );
                                }

                                if (colField?.isNormalSelectBox) {
                                  return (
                                    <td
                                      key={colIndex}
                                      className="px-4 text-center"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div
                                        className="flex flex-col items-center"
                                        style={
                                          colField?.isWrapTwoLines
                                            ? { width: colField?.maxWidth || "180px" }
                                            : { maxWidth: colField?.maxWidth || "180px" }
                                        }
                                      >
                                        <Checkbox
                                          checked={rowField?.isChecked || false}
                                          onChange={() => onAction("normal-select-box", rowField)}
                                        />
                                        {rowField?.completion_date && (
                                          <span className={`text-xs text-gray-400 mt-1`}>
                                            {moment(rowField?.completion_date).format(
                                              "MMM DD, YYYY",
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  );
                                }

                                if (colField?.isActionField) {
                                  return (
                                    <td key={colIndex} onClick={(e) => e.stopPropagation()}>
                                      <div
                                        style={{
                                          maxWidth: `${colField?.maxWidth ? colField?.maxWidth : "180px"}`,
                                        }}
                                        className="px-4 action-box-container"
                                      >
                                        <div className="action-box flex justify-center items-center flex-row gap-2">
                                          {colField?.isMenuBox ? (
                                            <MenuPopOver
                                              rowField={rowField}
                                              onAction={onAction}
                                              actionList={colField?.actionList}
                                              isMenuBox
                                            />
                                          ) : (
                                            colField?.actionList?.map(
                                              (iconVal: any, iconIndex: any) => {
                                                const Icon = iconVal?.icon;
                                                const StatusIcon =
                                                  rowField?.[iconVal?.iconName] === "ACTIVE"
                                                    ? FiEyeOff
                                                    : FiEye;
                                                return (
                                                  <Fragment key={iconIndex}>
                                                    {iconVal?.iconName === "menu-box" ? (
                                                      <MenuPopOver
                                                        iconIndex={iconIndex}
                                                        iconVal={iconVal}
                                                        rowField={rowField}
                                                        onAction={onAction}
                                                        Icon={Icon}
                                                        StatusIcon={StatusIcon}
                                                        actionFields={actionFields}
                                                      />
                                                    ) : (
                                                      <span
                                                        key={iconIndex}
                                                        className={`cursor-pointer text-md p-1 rounded-full ${iconVal?.hidden ? "hidden" : ""} ${iconVal?.iconName === "delete" ? "trash-icon" : iconVal?.iconName === "approve" ? "approve-icon" : "non-trash-icons"} ${rowField?.[iconVal?.disabledField] && iconVal?.haveDisabled ? "disabled" : ""} duration-200`}
                                                        onClick={() => {
                                                          if (!(
                                                            rowField?.[iconVal?.disabledField] &&
                                                            iconVal?.haveDisabled
                                                          )) {
                                                            onAction(iconVal?.iconName, rowField);
                                                          }
                                                        }}
                                                      >
                                                        {iconVal?.iconName === "status" ? (
                                                          <StatusIcon />
                                                        ) : (
                                                          <Icon
                                                            title={iconVal?.iconName.toUpperCase()}
                                                          />
                                                        )}
                                                      </span>
                                                    )}
                                                  </Fragment>
                                                );
                                              },
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  );
                                }

                                if (colField?.isStatus) {
                                  return (
                                    <td key={colIndex} onClick={(e) => e.stopPropagation()}>
                                      <div className="flex justify-center px-4">
                                        {colField?.isSwitch ? (
                                          <Switch
                                            checked={rowField[colField?.field] === "ACTIVE"}
                                            onChange={() => onAction("status-change", rowField)}
                                          />
                                        ) : (
                                          <span
                                            className={`td-text px-2 ${rowField[colField?.field] === "ACTIVE" ? "active-status " : "de-active-status"}`}
                                          >
                                            {rowField[colField?.field] ?? "-"}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  );
                                }

                                if (colField?.isSwitch) {
                                  return (
                                    <td key={colIndex} onClick={(e) => e.stopPropagation()}>
                                      <div className="flex justify-center">
                                        <Switch
                                          checked={rowField[colField?.field] ? true : false}
                                          onChange={() => onAction(colField?.field, rowField)}
                                        />
                                      </div>
                                    </td>
                                  );
                                }

                                if (colField?.isDate) {
                                  return (
                                    <td key={colIndex} className="px-4 py-3">
                                      <div
                                        style={
                                          colField?.isWrapTwoLines
                                            ? { width: colField?.maxWidth || "180px" }
                                            : { maxWidth: colField?.maxWidth || "180px" }
                                        }
                                      >
                                        <span
                                          className={`td-text ${colField?.isWrapTwoLines ? "two-lines-wrap" : "one-line-wrap"} ${colField?.isBoldText ? "is-bold-text" : ""} text-left `}
                                        >
                                          {moment(rowField[colField?.field]).format(
                                            "MMM DD, YYYY",
                                          ) || "-"}{" "}
                                        </span>
                                      </div>
                                    </td>
                                  );
                                }

                                if (colField?.isDateTime) {
                                  return (
                                    <td key={colIndex} className="px-4 py-3">
                                      <div
                                        style={
                                          colField?.isWrapTwoLines
                                            ? { width: colField?.maxWidth || "180px" }
                                            : { maxWidth: colField?.maxWidth || "180px" }
                                        }
                                      >
                                        <span
                                          className={`td-text ${colField?.isWrapTwoLines ? "two-lines-wrap" : "one-line-wrap"} ${colField?.isBoldText ? "is-bold-text" : ""} text-left `}
                                        >
                                          {moment(rowField[colField?.field]).format(
                                            "MMM DD, YYYY, hh:mm A",
                                          ) ?? "-"}
                                        </span>
                                      </div>
                                    </td>
                                  );
                                }

                                if (colField?.isInput) {
                                  return (
                                    <td
                                      key={colIndex}
                                      className="px-4 py-3"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div
                                        style={{
                                          maxWidth: `${colField?.maxWidth ? colField?.maxWidth : "180px"}`,
                                        }}
                                      >
                                        <input
                                          ref={(el) => {
                                            if (el && !colField.isDateInput && inputRefs) {
                                              if (!inputRefs.current) {
                                                inputRefs.current = {};
                                              }
                                              inputRefs.current[`${rowIndex}_${colField.field}`] =
                                                el;
                                            }
                                          }}
                                          disabled={
                                            rowField?.[colField?.disabledField] ? true : false
                                          }
                                          type={colField?.inputType || "text"}
                                          className={`table-input-field h-8.75 rounded-lg! ${rowField?.[colField?.disabledField] ? "disabeled" : ""} `}
                                          defaultValue={rowField?.[colField.field]}
                                          onChange={(e: any) => {
                                            const inputValues = e.target.value;
                                            rowField[colField.field] = inputValues;
                                            onLiveInputChange?.(
                                              inputValues,
                                              colField.field,
                                              rowField,
                                            );
                                          }}
                                          onBlur={(e: any) => {
                                            const inputValues = e.target.value;
                                            rowField[colField.field] = inputValues;
                                            onInputChange?.(inputValues, colField.field, rowField);
                                          }}
                                        />
                                      </div>
                                    </td>
                                  );
                                }

                                if (colField?.isImage) {
                                  const toPaths = (val: any): string[] => {
                                    if (!val) return [];
                                    const items = Array.isArray(val)
                                      ? val
                                      : String(val)
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter(Boolean);
                                    return items.map((p: string) =>
                                      p.startsWith("http://") || p.startsWith("https://")
                                        ? p
                                        : `${apiBase.imageApiUrl || ""}${p}`,
                                    );
                                  };

                                  const imageUrls: string[] = (() => {
                                    if (colField?.imageFields?.length) {
                                      return (colField.imageFields as string[]).flatMap(
                                        (fieldKey) => toPaths(rowField?.[fieldKey]),
                                      );
                                    }
                                    return toPaths(rowField?.[colField?.imageField]);
                                  })();

                                  return (
                                    <td key={colIndex} className="px-4 py-3">
                                      <div className="flex items-center gap-x-2">
                                        <div
                                          style={{
                                            display: "grid",
                                            gridTemplateColumns: `repeat(${[0, 1]?.includes(imageUrls.length) ? 1 : (colField?.imagePerRow ?? 3)}, min-content)`,
                                            gap: "8px",
                                          }}
                                        >
                                          {imageUrls.length > 0 ? (
                                            imageUrls.map((imgUrl, imgIdx) => (
                                              <div
                                                key={imgIdx}
                                                className="w-12 h-12 rounded-lg bg-white border border-gray-200 p-1 flex items-center justify-center shadow-2xs cursor-pointer hover:border-red-400 transition-all shrink-0"
                                                onClick={() =>
                                                  setImagePreviewModal({
                                                    path: imgUrl,
                                                    isOpen: true,
                                                  })
                                                }
                                              >
                                                <img
                                                  src={imgUrl}
                                                  alt=""
                                                  className="w-full h-full object-contain rounded-md"
                                                  onError={(e) => {
                                                    e.currentTarget.src =
                                                      commonUtils.smallLogoImage;
                                                    e.currentTarget.onerror = null;
                                                  }}
                                                />
                                              </div>
                                            ))
                                          ) : (
                                            <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 p-1 flex items-center justify-center shadow-2xs shrink-0">
                                              <img
                                                src={commonUtils.smallLogoImage}
                                                alt=""
                                                className="w-full h-full object-contain rounded-md"
                                              />
                                            </div>
                                          )}
                                        </div>
                                        {colField?.isText && (
                                          <div
                                            style={
                                              colField?.isWrapTwoLines
                                                ? { width: colField?.maxWidth || "220px" }
                                                : { maxWidth: colField?.maxWidth || "220px" }
                                            }
                                            className="flex flex-col justify-center text-left"
                                          >
                                            <span
                                              className={`td-text ${colField?.isBoldText ? "is-bold-text" : ""} ${colField?.titleClass || colField?.titleColorClass || ""} ${colField?.isWrapTwoLines ? "two-lines-wrap" : "one-line-wrap"} text-left`}
                                            >
                                              {parse(
                                                (rowField?.[colField?.field] ?? "-").toString(),
                                              )}
                                            </span>
                                            {colField?.hasSubtitle &&
                                              (() => {
                                                const subTitleFieldKey =
                                                  colField?.subTitleFieldfield ||
                                                  colField?.subTitleField ||
                                                  colField?.subtitleField;
                                                const subTitleVal = subTitleFieldKey
                                                  ? rowField?.[subTitleFieldKey]
                                                  : "";
                                                const subTitleColorClass =
                                                  colField?.subTitleClass ||
                                                  colField?.subTitleColorClass ||
                                                  "text-(--general-font-color) text-xs";
                                                return subTitleVal ? (
                                                  <span
                                                    className={`mt-0.5 ${subTitleColorClass} ${colField?.isWrapTwoLines ? "two-lines-wrap" : "one-line-wrap"}`}
                                                  >
                                                    {parse(subTitleVal.toString())}
                                                  </span>
                                                ) : null;
                                              })()}
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  );
                                }

                                if (colField?.hasInitialsAvatar) {
                                  return (
                                    <td key={colIndex} className="px-4 py-3">
                                      <div
                                        className="flex items-center gap-x-2"
                                        style={
                                          colField?.isWrapTwoLines
                                            ? { width: colField?.maxWidth || "180px" }
                                            : { maxWidth: colField?.maxWidth || "180px" }
                                        }
                                        onClick={() => onColumnClick?.(rowField)}
                                      >
                                        {rowField?.[colField?.field] && (
                                          <div
                                            className={`initials-avatar ${colField?.conditionalFieldForAvatar ? rowField?.[colField?.conditionalFieldForAvatar] : ""} `}
                                          >
                                            {getInitials(rowField?.[colField?.field] || "")}
                                          </div>
                                        )}
                                        <span
                                          className={`td-text ${colField?.isWrapTwoLines ? "two-lines-wrap" : "one-line-wrap"} ${colField?.isBoldText ? "is-bold-text" : ""} text-left `}
                                        >
                                          {parse((rowField?.[colField?.field] ?? "-").toString())}
                                        </span>
                                      </div>
                                    </td>
                                  );
                                }

                                if (colField.isCustomStatus) {
                                  const status = colField?.statusData?.find(
                                    (statusItem: any) =>
                                      statusItem?.value === rowField?.[colField?.field],
                                  );

                                  return (
                                    <td key={colIndex} className="px-4 py-3">
                                      <div
                                        style={{
                                          ...(colField?.isWrapTwoLines
                                            ? { width: colField?.maxWidth || "180px" }
                                            : { maxWidth: colField?.maxWidth || "180px" }),
                                        }}
                                        className="flex justify-center"
                                      >
                                        <span
                                          className={` inline-flex items-center justify-center w-[100px] px-2 py-0.5 text-[11px] font-medium rounded-md whitespace-nowrap ${colField?.isBoldText ? "font-semibold" : ""} ${colField?.isWrapTwoLines ? "two-lines-wrap" : "one-line-wrap"} `}
                                          style={{
                                            ...(colField?.badgeWidth || colField?.statusWidth
                                              ? { width: colField?.badgeWidth || colField?.statusWidth }
                                              : {}),
                                            color: status?.color ?? "#6B7280",
                                            backgroundColor: `${status?.color}15`,
                                            border: `1px solid ${status?.color ?? "#D1D5DB"}40`,
                                          }}
                                        >
                                          <span
                                            className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0"
                                            style={{
                                              backgroundColor: status?.color ?? "#9CA3AF",
                                            }}
                                          />

                                          {status?.label ?? "-"}
                                        </span>
                                      </div>
                                    </td>
                                  );
                                }

                                if (colField?.isSelectInRow) {
                                  const currentValue = rowField?.[colField?.field];
                                  const disableVal =
                                    colField?.disableSelectValue || colField?.disabledStatusValue;
                                  const isDisabledSelect = disableVal
                                    ? Array.isArray(disableVal)
                                      ? disableVal.includes(currentValue)
                                      : currentValue === disableVal
                                    : false;

                                  if (isDisabledSelect) {
                                    const status = colField?.statusData?.find(
                                      (statusItem: any) => statusItem?.value === currentValue,
                                    );

                                    return (
                                      <td
                                        key={colIndex}
                                        className="px-4 py-3"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div
                                          style={{
                                            ...(colField?.isWrapTwoLines
                                              ? { width: colField?.maxWidth || "180px" }
                                              : { maxWidth: colField?.maxWidth || "180px" }),
                                          }}
                                          className="flex justify-start"
                                        >
                                          <span
                                            className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap`}
                                            style={{
                                              color: status?.color ?? "#10B981",
                                              backgroundColor: `${status?.color ?? "#10B981"}25`,
                                              border: `1px solid ${status?.color ?? "#10B981"}40`,
                                            }}
                                          >
                                            <span
                                              className="w-2 h-2 rounded-full mr-2"
                                              style={{
                                                backgroundColor: status?.color ?? "#10B981",
                                              }}
                                            />
                                            {status?.label ?? currentValue ?? "-"}
                                          </span>
                                        </div>
                                      </td>
                                    );
                                  }

                                  return (
                                    <td
                                      key={colIndex}
                                      className="px-4 py-3"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div style={{ maxWidth: colField?.maxWidth || "200px" }}>
                                        <SelectBase
                                          value={
                                            colField?.statusData?.find(
                                              (o: any) => o.value === rowField?.[colField?.field],
                                            ) ?? null
                                          }
                                          options={colField?.statusData ?? []}
                                          noFocusNext
                                          getOptionStyle={(opt) =>
                                            opt?.color
                                              ? {
                                                backgroundColor: `${opt.color}25`,
                                                borderColor: "transparent",
                                                color: opt.color,
                                                fontWeight: "bolder",
                                                fontSize: "12px",
                                              }
                                              : undefined
                                          }
                                          onChangeValue={(opt) =>
                                            onAction("rowSelectChange", {
                                              ...rowField,
                                              [colField.field]: opt?.value,
                                            })
                                          }
                                          mainBoxClassName="[&_.input-field-box]:h-8! [&_.input-field]:rounded-lg! [&_.input-field]:w-[160PX]! "
                                        />
                                      </div>
                                    </td>
                                  );
                                }

                                if (colField?.hasSubtitle) {
                                  const titleVal = rowField?.[colField?.field] ?? "-";
                                  const subTitleFieldKey =
                                    colField?.subTitleFieldfield ||
                                    colField?.subTitleField ||
                                    colField?.subtitleField;
                                  const subTitleVal = subTitleFieldKey
                                    ? rowField?.[subTitleFieldKey]
                                    : "";
                                  const titleColorClass =
                                    colField?.titleClass ||
                                    colField?.titleColorClass ||
                                    "text-(--bold-font-color) font-semibold";
                                  const subTitleColorClass =
                                    colField?.subTitleClass ||
                                    colField?.subTitleColorClass ||
                                    "text-(--general-font-color) text-xs";

                                  return (
                                    <td key={colIndex} className="px-4 py-3">
                                      <div
                                        style={
                                          colField?.isWrapTwoLines
                                            ? { width: colField?.maxWidth || "220px" }
                                            : { maxWidth: colField?.maxWidth || "220px" }
                                        }
                                        className="flex flex-col justify-center text-left"
                                      >
                                        <span
                                          className={`td-text is-bold-text ${titleColorClass} ${colField?.isWrapTwoLines ? "two-lines-wrap" : "one-line-wrap"}`}
                                        >
                                          {parse(titleVal.toString())}
                                        </span>
                                        {subTitleVal && (
                                          <span
                                            className={`mt-0.5 ${subTitleColorClass} ${colField?.isWrapTwoLines ? "two-lines-wrap" : "one-line-wrap"}`}
                                          >
                                            {parse(subTitleVal.toString())}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  );
                                }

                                return (
                                  <td key={colIndex} className="px-4 py-3">
                                    <div
                                      style={{
                                        ...(colField?.minWidth ? { minWidth: colField?.minWidth } : {}),
                                        ...(colField?.isWrapTwoLines
                                          ? { width: colField?.maxWidth || "180px" }
                                          : colField?.width
                                            ? { width: colField.width }
                                            : { maxWidth: colField?.maxWidth || "180px" }),
                                      }}
                                    >
                                      {colField?.renderCell ? (
                                        colField.renderCell(rowField)
                                      ) : (
                                        <span
                                          className={`td-text ${colField?.isWrapTwoLines ? "two-lines-wrap" : "one-line-wrap"} ${colField?.isBoldText ? "is-bold-text" : ""} text-left `}
                                        >
                                          {parse((rowField?.[colField?.field] ?? "-").toString())}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            {expandedRowContent && (
                              <tr
                                style={{ display: expandedRowIndex === rowIndex ? "" : "none" }}
                                className="expanded-row-tr"
                              >
                                <td colSpan={filteredColumns?.length} className="expanded-td">
                                  <div className={`expanded-content`} style={{ width: cardWidth }}>
                                    {expandedRowContent(rowField, rowIndex)}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={filteredColumns?.length}
                          className="text-center py-6 text-gray-400 font-semibold text-md"
                        >
                          <div className="flex flex-col justify-center items-center">
                            <img
                              src={commonUtils.noDataImage}
                              alt=""
                              width={200}
                              className="mix-blend-darken"
                            />
                            <div className="-mt-2.5">No data found</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {hasPagination && (
                <div className="table-footer flex flex-row flex-wrap justify-between items-center px-4 py-4 gap-y-6 gap-x-1 lg:gap-y-0 lg:gap-x-1">
                  <Pagination
                    currentPage={isServerSide ? currentPage : currentTablePage}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    totalRecords={totalRowRecords}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <ImagePreviewModal
          imageAlt="image-preview"
          isOpen={imagePreviewModal.isOpen}
          imageSrc={imagePreviewModal.path}
          onClose={() => setImagePreviewModal((prev) => ({ ...prev, isOpen: false }))}
        />
      </>
    );
  },
);
