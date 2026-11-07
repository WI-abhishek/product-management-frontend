import { useState } from "react";
import { Modal } from "@/theme/modal/modal";
import { storeStatic } from "../store.static";
import { apiService } from "@/services/app.service";
import { commonService } from "@/services/common.service";
import { toast } from "sonner";
import { LuTrash2, LuMinus, LuPlus, LuShieldCheck, LuCircleAlert } from "react-icons/lu";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: any;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckoutSuccess: () => void;
}

export const CheckoutModal = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess,
}: CheckoutModalProps) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorList, setErrorList] = useState<any[]>([]);

  const subtotal = cart.reduce((sum: any, item: any) => sum + Number(item.sellingPrice) * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    setErrorMessage(null);
    setErrorList([]);
    const apiName = "productCheckout";

    const payload = {
      items: cart.map((item: any) => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        cartHash: item.cartHash,
      })),
    };

    try {
      const response = await apiService.PostAPICall(apiName, payload);
      switch (response?.status) {
        case 1:
          commonService.resetAPIFlag(apiName, false);
          toast.success(response?.message || "Checkout completed successfully!");
          onCheckoutSuccess();
          onClose();
          setIsCheckingOut(false);
          break;
        case 0: {
          commonService.resetAPIFlag(apiName, false);
          const errorMsg = response?.message || "Invalid product details or insufficient stock.";
          setErrorMessage(errorMsg);
          setErrorList(response?.errors || []);
          toast.error(errorMsg);
          setIsCheckingOut(false);
          break;
        }
      }
    } catch (error: any) {
      console.error("handleCheckout ~ error:", error);
      commonService.resetAPIFlag(apiName, false);
      const errorMsg = error?.message || "An unexpected error occurred during checkout.";
      setErrorMessage(errorMsg);
      setErrorList([]);
      toast.error(errorMsg);
      setIsCheckingOut(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={storeStatic.cartTitle}
      width="max-w-2xl"
      footer={
        cart.length > 0 ? (
          <div className="flex w-full items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClearCart}
              disabled={isCheckingOut}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
            >
              {storeStatic.clearCartText}
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isCheckingOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Continue Shopping
              </button>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
              >
                {isCheckingOut ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Validating & Checking Out...
                  </>
                ) : (
                  `${storeStatic.proceedToCheckoutText} (₹${subtotal.toLocaleString("en-IN")})`
                )}
              </button>
            </div>
          </div>
        ) : null
      }
    >
      {cart.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
            <LuShieldCheck size={28} />
          </div>
          <p className="text-base font-semibold text-gray-800">{storeStatic.emptyCartText}</p>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Error Banner if Checkout Failed */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 animate-fadeIn">
              <LuCircleAlert className="shrink-0 text-red-600 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="font-semibold text-red-950">Checkout Blocked</p>
                <p className="text-red-700 mt-0.5 leading-relaxed">{errorMessage}</p>
                {errorList.length > 1 && (
                  <ul className="mt-2 space-y-1 pl-4 list-disc text-red-800">
                    {errorList.map((err, idx) => (
                      <li key={idx} className="leading-snug">
                        <span className="font-semibold">{err.productName || "Product"}:</span>{" "}
                        {err.reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-100 max-h-90 overflow-y-auto pr-1">
            {cart.map((item: any) => {
              const itemError = errorList.find((err) => err.productId === item.productId);
              return (
                <div
                  key={item.productId}
                  className={`py-3.5 px-2 flex items-center justify-between gap-4 rounded-xl transition-colors ${itemError ? "bg-red-50/50 border border-red-200 my-1" : ""
                    }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-gray-400 uppercase">
                          {item.name.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h4>
                        {itemError && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0">
                            Changed / Invalid
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {item.brand ? `Brand: ${item.brand} • ` : ""}₹
                        {Number(item.sellingPrice).toLocaleString("en-IN")} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <LuMinus size={13} />
                      </button>
                      <span className="px-2.5 text-xs font-semibold text-gray-800 min-w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <LuPlus size={13} />
                      </button>
                    </div>

                    <span className="text-sm font-semibold text-gray-900 min-w-16.25 text-right">
                      ₹{(Number(item.sellingPrice) * item.quantity).toLocaleString("en-IN")}
                    </span>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.productId)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <LuTrash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
            <div className="pt-2 flex justify-between text-sm font-bold text-gray-900">
              <span>{storeStatic.totalLabel}</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
