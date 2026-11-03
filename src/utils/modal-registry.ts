type CloseFn = () => void;

interface ModalEntry {
  id: string;
  closeFn: CloseFn;
  closedByPopstate: boolean;
}

const stack: ModalEntry[] = [];
let isProgrammaticBack = false;
let isListenerAttached = false;

function initGlobalPopState() {
  if (isListenerAttached || typeof window === "undefined") return;
  isListenerAttached = true;

  window.addEventListener("popstate", () => {
    if (isProgrammaticBack) {
      isProgrammaticBack = false;
      return;
    }

    if (stack.length > 0) {
      const top = stack[stack.length - 1];
      top.closedByPopstate = true;
      top.closeFn();
    }
  });
}

export const modalRegistry = {
  register(id: string, closeFn: CloseFn) {
    initGlobalPopState();
    stack.push({ id, closeFn, closedByPopstate: false });
  },

  unregister(id: string) {
    const index = stack.findIndex((item) => item.id === id);
    if (index !== -1) {
      const [entry] = stack.splice(index, 1);
      if (!entry.closedByPopstate && typeof window !== "undefined") {
        if (window.history.state?.[`modal_${id}`]) {
          isProgrammaticBack = true;
          window.history.back();
        }
      }
    }
  },

  isTop(id: string): boolean {
    if (stack.length === 0) return false;
    return stack[stack.length - 1].id === id;
  },

  closeTop(): boolean {
    if (stack.length === 0) {
      return false;
    }
    const top = stack[stack.length - 1];
    top.closedByPopstate = true;
    top.closeFn();
    return true;
  },

  hasOpen(): boolean {
    return stack.length > 0;
  },
};
