import { useEffect, useRef } from "react";
import { modalRegistry } from "../utils/modal-registry";

export function useModalBack(isOpen: boolean, onClose: () => void, stateKey = "modalOpen") {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (isOpen) {
      const id = `${stateKey}_${Math.random().toString(36).substring(2, 9)}`;

      if (typeof window !== "undefined") {
        window.history.pushState({ [`modal_${id}`]: true }, "");
      }

      modalRegistry.register(id, () => {
        onCloseRef.current?.();
      });

      return () => {
        modalRegistry.unregister(id);
      };
    }
    return undefined;
  }, [isOpen, stateKey]);
}
