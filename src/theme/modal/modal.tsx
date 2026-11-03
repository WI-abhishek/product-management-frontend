import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { useModalBack } from "@/hooks/use-modal-back";
import { IoMdCloseCircleOutline } from "react-icons/io";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  footerClassName?: string;
  width?: string;
  className?: string;
  showCloseButton?: boolean;
  title?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  footer,
  footerClassName = "",
  width = "max-w-md",
  className = "",
  showCloseButton = true,
  title = "",
}: ModalProps) => {
  useModalBack(isOpen, onClose);

  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-100 flex items-center justify-center px-4 py-6"
        onClose={onClose}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        </TransitionChild>

        {/* Modal */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 -translate-y-4"
          enterTo="opacity-100 translate-y-0"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-4"
        >
          <DialogPanel
            className={`relative flex max-h-[90vh] w-full ${width} flex-col overflow-hidden rounded-2xl bg-white shadow-xl ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <DialogTitle className="text-md font-semibold text-gray-800">{title}</DialogTitle>

              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="cursor-pointer rounded-full transition-all duration-300 hover:bg-red-100"
                >
                  <IoMdCloseCircleOutline color="red" size={26} strokeWidth={1} />
                </button>
              )}
            </div>

            <div className="px-4">
              <div className="w-full border-b border-gray-400" />
            </div>

            {/* Body (Scrollable) */}
            <div
              onScroll={handleScroll}
              className={`flex-1 overflow-y-auto p-5 srcoll-visible-only-vertical scroll-visible-only-vertical ${isScrolling ? "scrolling" : ""}`}
            >
              {children}
            </div>

            {/* Fixed Footer */}
            {footer && (
              <>
                <div className="px-4">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div
                  className={`flex items-center justify-end gap-3 px-5 py-3.5 bg-white shrink-0 ${footerClassName}`}
                >
                  {footer}
                </div>
              </>
            )}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};
