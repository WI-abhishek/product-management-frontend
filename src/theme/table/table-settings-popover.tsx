import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";

import { Checkbox } from "@/theme/checkbox/checkbox";
import { FiSettings } from "react-icons/fi";

export default function TableSettingsPopOver({
  columns,
  visibleColumns,
  setVisibleColumns,
}: any) {
  return (
    <Popover className="flex items-center">
      <PopoverButton className={"outline-none cursor-pointer"}>
        <span className="text-lg font-normal p-1 rounded-full duration-200 flex items-center gap-2 px-3">
          <FiSettings /> <span className="text-sm font-extrabold py-1">Setting</span>
        </span>
      </PopoverButton>
      <Transition
        enter="duration-200 ease-out"
        enterFrom="translate-y-2 opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="duration-200 ease-out"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="translate-y-2 opacity-0"
      >
        <PopoverPanel
          anchor={{ to: "bottom end", gap: 15 }}
          className="z-70 flex w-64 flex-col rounded-lg theme-shadow-medium transition"
        >
          {() => (
            <>
              <div className={`table-settings rounded-lg p-3`}>
                <span className="text-lg mb-2 block theme-bold-font-color-text font-medium">
                  Table Settings
                </span>
                <div className="flex flex-row items-center my-3">
                  <span className="text-[11px] theme-general-font-color-text block whitespace-nowrap">
                    COLUMN VISIBILITY
                  </span>
                  <div className="h-[1px] w-full theme-input-border-color-bg ms-2"></div>
                </div>
                <div className="filter-columns flex flex-col gap-y-1 custom-scrollbar justify-start">
                  {columns?.map((val: any, index: any) => {
                    if (
                      val?.heading &&
                      val?.field &&
                      !val?.isActionField &&
                      !val?.isSelectAllBox &&
                      !val?.isStatus &&
                      val?.field !== "row_index"
                    ) {
                      return (
                        <div key={index}>
                          <Checkbox
                            label={val?.heading}
                            checked={visibleColumns.includes(val.field)}
                            onChange={() => {
                              if (visibleColumns.includes(val.field)) {
                                setVisibleColumns((prev: string[]) =>
                                  prev.filter((f) => f !== val.field),
                                );
                              } else {
                                setVisibleColumns((prev: string[]) => [...prev, val.field]);
                              }
                            }}
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </>
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
