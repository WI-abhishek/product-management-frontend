 
import { Fragment, useRef, useState, useCallback, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { RxCross2 } from "react-icons/rx";
import { useModalBack } from "@/hooks/use-modal-back";
import { commonUtils } from "@/constants";

const RotateIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.5 2v6h-6" />
    <path d="M21.34 15.57a10 10 0 1 1-.57-8.38" />
  </svg>
);
const FlipHIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" />
    <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
    <line x1="12" y1="20" x2="12" y2="4" strokeDasharray="2 2" />
  </svg>
);
const FlipVIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" />
    <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
    <line x1="4" y1="12" x2="20" y2="12" strokeDasharray="2 2" />
  </svg>
);
const ResetIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

type ImagePreviewModalProps = {
  isOpen: boolean;
  imageSrc: string;
  imageAlt?: string;
  onClose: () => void;
};

const zoomLevel = 2;

export const ImagePreviewModal = ({
  isOpen,
  imageSrc,
  imageAlt = "Preview",
  onClose,
}: ImagePreviewModalProps) => {
  useModalBack(isOpen, () => onClose());
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const translateAtDragStart = useRef({ x: 0, y: 0 });

  const lastTap = useRef<number>(0);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setZoomed(false);
      setTranslate({ x: 0, y: 0 });
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
    };
  }, []);

  const handleRotate = () => setRotation((r) => r + 90);
  const handleFlipH = () => setFlipH((f) => !f);
  const handleFlipV = () => setFlipV((f) => !f);

  const handleReset = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoomed(false);
    setTranslate({ x: 0, y: 0 });
  };

  const handleDoubleTap = useCallback(() => {
    if (zoomed) {
      setZoomed(false);
      setTranslate({ x: 0, y: 0 });
    } else {
      setZoomed(true);
    }
  }, [zoomed]);

  const handlePointerDown = useCallback(
    (e: any) => {
      const now = Date.now();
      const doubleTapDelay = 300;

      if (now - lastTap.current < doubleTapDelay) {
        if (tapTimeout.current) {
          clearTimeout(tapTimeout.current);
        }
        handleDoubleTap();
        lastTap.current = 0;
      } else {
        lastTap.current = now;
        if (zoomed) {
          isDragging.current = true;
          dragStart.current = { x: e.clientX, y: e.clientY };
          translateAtDragStart.current = { ...translate };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }
      }
    },
    [handleDoubleTap, zoomed, translate],
  );

  const handlePointerMove = useCallback(
    (e: any) => {
      if (!isDragging.current || !zoomed) {
        return;
      }
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setTranslate({
        x: translateAtDragStart.current.x + dx,
        y: translateAtDragStart.current.y + dy,
      });
    },
    [zoomed],
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const scaleX = (flipH ? -1 : 1) * (zoomed ? zoomLevel : 1);
  const scaleY = (flipV ? -1 : 1) * (zoomed ? zoomLevel : 1);
  const imgTransform = [
    `rotate(${rotation}deg)`,
    `scale(${scaleX}, ${scaleY})`,
    zoomed ? `translate(${translate.x / zoomLevel}px, ${translate.y / zoomLevel}px)` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const controlBtnClass =
    "flex items-center justify-center w-8 h-8 rounded-lg text-white transition-colors duration-150 backdrop-blur-sm border border-white/20 hover:border-white/40";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={onClose}
      >
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity dark:bg-black/30" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 [transform:translate3d(0,-1rem,0)]"
          enterTo="opacity-100 [transform:translate3d(0,0,0)]"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 [transform:translate3d(0,0,0)]"
          leaveTo="opacity-0 [transform:translate3d(0,-1rem,0)]"
        >
          <DialogPanel
            className="modal-body relative flex w-full max-w-2xl flex-col py-4 rounded-lg bg-white transition-all duration-200"
            style={{ maxHeight: "90vh" }}
          >
            {/* Header */}
            <div className="modal-header flex items-center justify-between px-4 mb-3">
              <DialogTitle
                as="span"
                className="line-clamp-1 font-medium tracking-wide text-gray-800 lg:text-lg mt-[-5.5px]"
              >
                Image Preview
              </DialogTitle>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <span className="close-btn block text-md duration-200">
                  <RxCross2 />
                </span>
              </button>
            </div>

            <div className="image-preview-modal modal-content px-4 w-full flex flex-col gap-3">
              <div className="helper-buttons-box flex items-center justify-center gap-2 px-3 py-1 rounded-xl w-fit mx-auto shadow-lg">
                <button
                  onClick={handleRotate}
                  className={`${controlBtnClass} helper-buttons`}
                  title="Rotate 90°"
                >
                  <RotateIcon />
                </button>

                <div className="w-px h-5 theme-primary-bg mx-0.5" />

                <button
                  onClick={handleFlipH}
                  className={`${controlBtnClass} helper-buttons ${flipH ? "is-flipped" : ""}`}
                  title="Flip Horizontal"
                >
                  <FlipHIcon />
                </button>

                <button
                  onClick={handleFlipV}
                  className={`${controlBtnClass} helper-buttons ${flipV ? "is-flipped" : ""}`}
                  title="Flip Vertical"
                >
                  <FlipVIcon />
                </button>

                <div className="w-px h-5 theme-primary-bg mx-0.5" />

                <button
                  onClick={handleReset}
                  className={`${controlBtnClass} helper-buttons`}
                  title="Reset All"
                >
                  <ResetIcon />
                </button>

                <div className="w-px h-5 theme-primary-bg mx-0.5" />
                <span
                  className={`text-xs text-white font-mono px-2 py-0.5 rounded-md transition-colors helper-buttons ${zoomed ? "is-flipped" : ""}`}
                >
                  {zoomed ? "200%" : "100%"}
                </span>
              </div>

              <div
                className="relative w-full rounded-lg overflow-hidden bg-gray-100 select-none"
                style={{
                  height: "clamp(260px, 100vw, 350px)",
                  cursor: zoomed ? (isDragging.current ? "grabbing" : "grab") : "zoom-in",
                  touchAction: "none",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
                    opacity: 0.4,
                  }}
                />

                <img
                  src={imageSrc}
                  alt={imageAlt}
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  style={{
                    transform: imgTransform,
                    transition: isDragging.current
                      ? "none"
                      : "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
                    willChange: "transform",
                    userSelect: "none",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = commonUtils.smallLogoImage;
                    e.currentTarget.onerror = null;
                  }}
                />

                <div
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white bg-black/40 rounded-full px-3 py-1 pointer-events-none backdrop-blur-sm transition-opacity duration-300"
                  style={{ opacity: zoomed ? 0 : 0.7 }}
                >
                  Double-tap to zoom
                </div>
              </div>

              {zoomed && (
                <p className="text-center text-xs text-gray-400 pb-1">
                  Drag to pan · Double-tap to zoom out
                </p>
              )}
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};
