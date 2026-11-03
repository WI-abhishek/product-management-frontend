import { useEffect, useRef, useState } from "react";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { HiOutlineViewColumns } from "react-icons/hi2";
import { RxDragHandleDots2 } from "react-icons/rx";

interface ManagableColumnsProps {
  columns: any[];
  tableName: string;
  onOrderChange: (orderedFields: string[]) => void;
}

const getDraggableColumns = (columns: any[]) =>
  columns.filter(
    (col: any) =>
      col?.heading &&
      col?.field &&
      !col?.isActionField &&
      !col?.isNormalSelectBox &&
      !col?.isStatus &&
      col?.field !== "row_index",
  );

const getStoredOrder = (tableName: string, draggable: any[]): string[] => {
  try {
    const stored = localStorage.getItem(`table-col-order-${tableName}`);
    if (stored) {
      const parsed: string[] = JSON.parse(stored);
      const valid = parsed.filter((f) => draggable.some((c: any) => c.field === f));
      const remaining = draggable
        .map((c: any) => c.field)
        .filter((f: string) => !valid.includes(f));
      return [...valid, ...remaining];
    }
  } catch {
    /* ignore */
  }
  return draggable.map((c: any) => c.field);
};

export default function TableManagableColumns({
  columns,
  tableName,
  onOrderChange,
}: ManagableColumnsProps) {
  const draggableColumns = getDraggableColumns(columns);
  const initialOrder = useRef<string[]>([]);
  const hasUnsavedDrag = useRef(false);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [order, setOrder] = useState<string[]>(() => getStoredOrder(tableName, draggableColumns));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  // Re-sync only when columns/tableName changes AND user has no unsaved drag
  useEffect(() => {
    if (hasUnsavedDrag.current) {
      return;
    }
    const draggable = getDraggableColumns(columns);
    setOrder(getStoredOrder(tableName, draggable));
  }, [columns, tableName]);

  // Snapshot order when popover opens (for reset)
  const handleOpen = () => {
    hasUnsavedDrag.current = false;
    initialOrder.current = [...order];
  };

  const orderedColumns = order
    .map((f) => draggableColumns.find((c: any) => c.field === f))
    .filter(Boolean);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    if (result.destination.index === result.source.index) {
      return;
    }

    const next = Array.from(order);
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    hasUnsavedDrag.current = true;
    setOrder(next);
  };

  const handleSave = (close: () => void) => {
    localStorage.setItem(`table-col-order-${tableName}`, JSON.stringify(order));
    onOrderChange(order);
    hasUnsavedDrag.current = false;
    setSaved(true);
    if (savedTimeoutRef.current) {
      clearTimeout(savedTimeoutRef.current);
    }
    savedTimeoutRef.current = setTimeout(() => {
      setSaved(false);
      close();
    }, 700);
  };

  return (
    <Popover className="flex items-center">
      <PopoverButton className="outline-none" onClick={handleOpen}>
        <span className="text-lg font-normal block p-1 rounded-full duration-200 manage-col-trigger-icon">
          <HiOutlineViewColumns />
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
          {({ close }) => (
            <div className="table-settings rounded-lg p-3">
              <span className="text-lg mb-1 block theme-bold-font-color-text font-medium">
                Column Order
              </span>
              <p className="text-[11px] theme-general-font-color-text mb-3">
                Drag rows to reorder columns
              </p>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="manage-columns-list">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="manage-col-list flex flex-col gap-y-1 custom-scrollbar overflow-x-hidden"
                    >
                      {orderedColumns.map((col: any, index: number) => (
                        <Draggable key={col.field} draggableId={col.field} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                              className={`
                                                                manage-col-item
                                                                flex items-center gap-2 px-2 py-2.5 rounded-lg
                                                                border border-transparent
                                                                ${snapshot.isDragging ? "dragging" : ""}
                                                            `}
                            >
                              <RxDragHandleDots2 className="text-base flex-shrink-0 drag-handle-icon" />
                              <span className="text-sm truncate flex-1 theme-bold-font-color-text font-medium">
                                {col.heading}
                              </span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  className={`manage-col-save-btn text-xs font-semibold px-4 py-1.5 rounded-lg transition-all duration-200 ${saved ? "saved" : ""}`}
                  onClick={() => handleSave(close)}
                >
                  {saved ? "Saved ✓" : "Save Order"}
                </button>
              </div>
            </div>
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
