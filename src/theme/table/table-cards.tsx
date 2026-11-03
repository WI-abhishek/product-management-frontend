import React, { Fragment } from "react";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { Switch } from "@/theme/switch/switch";
import { Spinner } from "@/theme/spinner/spinner";
import moment from "moment-timezone";
import parse from "html-react-parser";
import { apiBase, commonUtils } from "@/constants";
import { Pagination } from "@/theme/table/pagination";
import { IoIosSearch } from "react-icons/io";
import TableSettingsPopOver from "@/theme/table/table-settings-popover";
import MenuPopOver from "@/theme/table/menu-popover";
import { Checkbox } from "@/theme/checkbox/checkbox";
import { useBreakpoint } from "@/hooks/use-breakpoint";

type TableCardsProps = {
  paginatedRows: any[];
  filteredColumns: any[];
  pageOffset: number;
  isTableLoading: boolean;
  onAction: (action: any, element: any) => void;
  onRowClick?: (row: any, rowIndex: number) => void;
  onInputChange?: (value: any, fieldName: any, element: any) => void;
  onLiveInputChange?: (value: any, fieldName: any, element: any) => void;
  inputRefs: any;
  actionFields: any;
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  isHeading: boolean;
  tableHeading?: string;
  isGlobalSearch: boolean;
  openSearch: boolean;
  setIsSearchOpen: (val: boolean) => void;
  setSearchText: (val: string) => void;
  tableSettingHandler: { isFilter: boolean; isSort: boolean };
  setTableSettingHandler: (val: any) => void;
  visibleColumns: string[];
  setVisibleColumns: (val: string[]) => void;
  columns: any[];
  allRowsChecked: boolean;
};

function renderCardCellValue(
  colField: any,
  rowField: any,
  rowIndex: number,
  onAction: (action: any, element: any) => void,
  onInputChange?: (value: any, fieldName: any, element: any) => void,
  onLiveInputChange?: (value: any, fieldName: any, element: any) => void,
  inputRefs?: any,
): React.ReactNode {
  if (colField?.isStatus) {
    if (colField?.isSwitch) {
      return (
        <Switch
          checked={rowField[colField?.field] === "ACTIVE"}
          onChange={() => onAction("status-change", rowField)}
        />
      );
    }

    const isActive = rowField[colField?.field] === "ACTIVE";
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {rowField[colField?.field]}
      </span>
    );
  }

  if (colField?.isSwitch) {
    return (
      <Switch
        checked={rowField[colField?.field] ? true : false}
        onChange={() => onAction(colField?.field, rowField)}
      />
    );
  }

  if (colField?.isDate) {
    return (
      <span className="td-text text-left">
        {rowField?.[colField?.field]
          ? moment(rowField[colField.field]).format(colField.dateFormat || "YYYY-MM-DD")
          : "-"}
      </span>
    );
  }

  if (colField?.isDateTime) {
    return (
      <span className="td-text text-left">
        {moment(rowField[colField?.field]).format("MMM DD, YYYY, hh:mm A") ?? "-"}
      </span>
    );
  }

  if (colField?.isInput) {
    return (
      <input
        ref={(el) => {
          if (el && !colField.isDateInput && inputRefs) {
            if (!inputRefs.current) {
              inputRefs.current = {};
            }
            inputRefs.current[`${rowIndex}_${colField.field}`] = el;
          }
        }}
        disabled={rowField?.[colField?.disabledField] ? true : false}
        type={colField?.inputType || "text"}
        className={`table-input-field w-full ${
          rowField?.[colField?.disabledField] ? "disabeled" : ""
        }`}
        defaultValue={colField.isDateInput ? rowField?.[colField.field] : ""}
        placeholder={rowField?.[colField.field]}
        onChange={(e) => {
          onLiveInputChange?.(e.target.value, colField.field, rowField);
        }}
        onBlur={(e: any) => {
          onInputChange?.(e.target.value, colField.field, rowField);
        }}
      />
    );
  }

  if (colField?.isImage) {
    // Normalise a raw value into an array of path strings.
    // Handles: array, comma-separated string, or plain string.
    const toPaths = (val: any): string[] => {
      if (!val) return [];
      const items = Array.isArray(val)
        ? val
        : String(val)
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
      return items.map((p: string) => (p.startsWith("http") ? p : `${apiBase.imageApiUrl}${p}`));
    };

    const imageUrls: string[] = colField?.imageFields?.length
      ? (colField.imageFields as string[]).flatMap((fieldKey: string) =>
          toPaths(rowField?.[fieldKey]),
        )
      : toPaths(rowField?.[colField?.imageField]);

    return (
      <div className="flex items-center gap-3">
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
                className="w-12 h-12 rounded-lg bg-white border border-gray-200 p-1 flex items-center justify-center shadow-2xs shrink-0"
              >
                <img
                  src={imgUrl}
                  alt=""
                  className="w-full h-full object-contain rounded-md"
                  onError={(e) => {
                    e.currentTarget.src = commonUtils.smallLogoImage;
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
          <span className="td-text font-medium text-slate-800 text-left flex-1 wrap-break-word min-w-0">
            {parse((rowField?.[colField?.field] ?? "-").toString())}
          </span>
        )}
      </div>
    );
  }

  // Custom renderCell
  if (colField?.renderCell) {
    return <div onClick={(e) => e.stopPropagation()}>{colField.renderCell(rowField)}</div>;
  }

  // Regular text field
  return (
    <span className="td-text text-left">
      {parse((rowField?.[colField?.field] ?? "-").toString())}
    </span>
  );
}

export function TableCards({
  paginatedRows,
  filteredColumns,
  pageOffset,
  isTableLoading,
  onAction,
  onRowClick,
  onInputChange,
  onLiveInputChange,
  inputRefs,
  actionFields,
  currentPage,
  totalPages,
  rowsPerPage,
  totalRecords,
  onPageChange,
  onRowsPerPageChange,
  isHeading,
  tableHeading,
  isGlobalSearch,
  openSearch,
  setIsSearchOpen,
  setSearchText,
  tableSettingHandler,
  setTableSettingHandler,
  visibleColumns,
  setVisibleColumns,
  columns,
  allRowsChecked,
}: TableCardsProps) {
  const { isBelow1024px } = useBreakpoint();
  const hasRowIndex = filteredColumns?.some((col: any) => col?.field === "row_index");

  const bodyColumns = filteredColumns?.filter(
    (col: any) => col?.field !== "row_index" && !col?.isActionField && !col?.isNormalSelectBox,
  );

  const actionColumn = filteredColumns
    ?.filter((col: any) => col?.isActionField)
    ?.reduce((merged: any, col: any) => {
      if (!merged) {
        return col;
      }
      return { ...merged, actionList: [...merged.actionList, ...col.actionList] };
    }, null);

  const checkboxColumn = filteredColumns?.find((col: any) => col?.isNormalSelectBox);

  return (
    <div className="table-card">
      {(isHeading || isGlobalSearch) && (
        <div
          className={`table-header flex flex-wrap items-center ${
            isHeading ? "justify-between" : "justify-end"
          } px-3 sm:px-4 pt-3 mb-2`}
        >
          {isHeading && (
            <div>
              <span className="text-lg theme-bold-font-color-text font-medium block">
                {tableHeading || ""}
              </span>
            </div>
          )}
          {isGlobalSearch && (
            <div className="icons-box my-auto flex flex-row items-center">
              <div className="search-box flex flex-row">
                <div className={`search-input ${openSearch ? "open" : ""}`}>
                  <input
                    tabIndex={-1}
                    name="global-search-cards"
                    type="text"
                    className="text-sm pe-1"
                    placeholder="Search here..."
                    onChange={(e) => {
                      setSearchText(e.target.value);
                    }}
                  />
                </div>
                <div className="icons">
                  <span
                    className="text-lg font-normal block p-1 rounded-full duration-200"
                    onClick={() => setIsSearchOpen(!openSearch)}
                  >
                    <IoIosSearch />
                  </span>
                </div>
              </div>
              <div className="gear-box">
                <div className="icons">
                  <TableSettingsPopOver
                    columns={columns}
                    tableSettingHandler={tableSettingHandler}
                    setTableSettingHandler={setTableSettingHandler}
                    visibleColumns={visibleColumns}
                    setVisibleColumns={setVisibleColumns}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="table-wrapper relative">
        {isTableLoading && (
          <div className="table-loader flex justify-center items-center">
            <span>
              <Spinner className={"w-6.25 h-6.25"} />
            </span>
          </div>
        )}

        <div className="table-mobile-cards px-3 sm:px-4 py-3">
          {paginatedRows?.length > 0 ? (
            <div className="grid grid-cols-12 gap-3">
              {paginatedRows.map((rowField: any, rowIndex: number) => (
                <Fragment key={rowIndex}>
                  <div className="col-span-12 md:col-span-6">
                    <div
                      className="table-card-body rounded-lg overflow-hidden"
                      onClick={() => onRowClick?.(rowField, rowIndex)}
                      style={{ cursor: onRowClick ? "pointer" : "default" }}
                    >
                      <div className="table-card-header flex items-center justify-between px-4 sm:px-5 py-2.5">
                        <div className="flex items-center gap-x-2">
                          {checkboxColumn && (
                            <span onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={rowField?.isChecked || false}
                                onChange={() => onAction("normal-select-box", rowField)}
                              />
                            </span>
                          )}
                          {hasRowIndex && (
                            <span
                              className="text-md font-semibold"
                              style={{ color: "var(--bold-font-color)" }}
                            >
                              #{pageOffset + rowIndex + 1}
                            </span>
                          )}
                        </div>

                        {actionColumn && (
                          <div
                            className="action-box-container"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="action-box flex items-center flex-row gap-2">
                              {actionColumn?.isMenuBox ? (
                                <MenuPopOver
                                  rowField={rowField}
                                  onAction={onAction}
                                  actionList={actionColumn?.actionList}
                                  isMenuBox
                                />
                              ) : (
                                actionColumn?.actionList?.map((iconVal: any, iconIndex: number) => {
                                  const Icon = iconVal?.icon;
                                  const StatusIcon =
                                    rowField?.[iconVal?.iconName] === "ACTIVE" ? FiEyeOff : FiEye;
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
                                          className={`cursor-pointer text-md p-1 rounded-full 
                                                                                              ${iconVal?.hidden || (iconVal?.isHideBelow1024px && isBelow1024px) ? "hidden" : ""} 
                                                                                              ${iconVal?.iconName === "delete" ? "trash-icon" : "non-trash-icons"}
                                                                                              ${rowField?.[iconVal?.disabledField] && iconVal?.haveDisabled ? "mobile-cards-disabled" : ""}
                                                                                              duration-200`}
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
                                            <Icon title={iconVal?.iconName.toUpperCase()} />
                                          )}
                                        </span>
                                      )}
                                    </Fragment>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div
                        className="grid grid-cols-2 gap-x-4 gap-y-3.5 px-4 sm:px-5 py-3.5"
                        style={{ backgroundColor: "var(--table-rows-bg)" }}
                      >
                        {bodyColumns.map((colField: any, colIndex: number) => {
                          const isFullWidth =
                            colField?.renderCell ||
                            colField?.isImage ||
                            colField?.colSpan === 2 ||
                            colField?.isFullWidth;

                          return (
                            <div
                              key={colIndex}
                              className={isFullWidth ? "col-span-2" : "col-span-1"}
                            >
                              <span
                                className="text-xs uppercase font-bold tracking-wide block"
                                style={{ color: "var(--primary-font)" }}
                              >
                                {colField?.heading || colField?.field}
                              </span>
                              <div
                                className="mt-1"
                                style={{ color: "var(--general-font-color)" }}
                                onClick={(e) => {
                                  if (
                                    colField?.isInput ||
                                    colField?.isSwitch ||
                                    colField?.isStatus ||
                                    colField?.renderCell
                                  ) {
                                    e.stopPropagation();
                                  }
                                }}
                              >
                                {renderCardCellValue(
                                  colField,
                                  rowField,
                                  rowIndex,
                                  onAction,
                                  onInputChange,
                                  onLiveInputChange,
                                  inputRefs,
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center py-10">
              <div
                className="rounded-lg px-4 py-2 theme-shadow-soft text-center"
                style={{ backgroundColor: "var(--table-header-bg)" }}
              >
                <span className="text-sm font-medium" style={{ color: "var(--bold-font-color)" }}>
                  No data found
                </span>
              </div>
            </div>
          )}
        </div>

        {paginatedRows?.length > 0 && (
          <div
            className="table-footer flex flex-row flex-wrap justify-between items-center px-4 py-4 gap-y-6 gap-x-1"
            style={{ backgroundColor: "var(--table-rows-bg)" }}
          >
            {checkboxColumn && (
              <div className="flex items-center gap-x-2">
                <Checkbox
                  checked={allRowsChecked}
                  onChange={() => onAction("normal-select-all-box", null)}
                />
                <span className="text-xs" style={{ color: "var(--bold-font-color)" }}>
                  Select All
                </span>
              </div>
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalRecords={totalRecords}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
