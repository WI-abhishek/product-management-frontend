import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function MenuPopOver({
  iconIndex,
  iconVal,
  rowField,
  onAction,
  Icon,
  StatusIcon,
  actionFields,
  // Used when rendered directly from isMenuBox mode
  actionList,
  isMenuBox,
}: any) {
  // Resolve the list of actions to show in the popover
  const resolvedList: any[] = isMenuBox ? (actionList ?? []) : (actionFields?.iconBoxList ?? []);

  return (
    <Popover>
      <PopoverButton
        className={
          "menu-popover-button flex outline-none cursor-pointer rounded-full non-trash-icons text-sm p-1 duration-200"
        }
      >
        {isMenuBox ? (
          <BsThreeDotsVertical title="Actions" />
        ) : (
          <span key={iconIndex}>
            {iconVal?.iconName === "status" ? (
              <StatusIcon />
            ) : (
              <Icon title={iconVal?.iconName.toUpperCase()} />
            )}
          </span>
        )}
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
          anchor={{ to: "bottom end", gap: 10 }}
          className="z-70 flex w-40 flex-col rounded-lg  shadow-lg transition"
        >
          {() => (
            <>
              <div className="menu-popup">
                <div className="menu-popup-inner rounded-lg border-gray-200! bg-white shadow! p-2!">
                  {resolvedList.map((val: any, index: any) => {
                    const ItemIcon = val?.icon;
                    const isDisabled = rowField?.[val?.disabledField] && val?.haveDisabled;
                    return (
                      <div
                        key={index}
                        className={`menu-box rounded ${val?.iconName === "delete" && "delete-row"} ${isDisabled ? "disabled" : ""} flex items-center text-sm px-[8px] py-[6px] duration-200`}
                        onClick={() => {
                          if (!isDisabled) {
                            onAction(val?.iconName, rowField);
                          }
                        }}
                      >
                        <span className="block">
                          <ItemIcon />
                        </span>
                        <span className="ms-2 w-full truncate">{val?.label}</span>
                      </div>
                    );
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
