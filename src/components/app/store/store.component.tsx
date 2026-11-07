import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/app.service";
import { commonService } from "@/services/common.service";
import { Paths } from "@/constants";
import { storeStatic } from "./store.static";
import { CheckoutModal } from "./modal/checkout.modal";
import { toast } from "sonner";
import { LuShoppingCart, LuArrowLeft, LuPackage, LuCheck, LuTag } from "react-icons/lu";

export const StoreComponent = () => {
  const navigate = useNavigate();
  const [products, setProducts]: any = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [cart, setCart]: any = useState(() => {
    try {
      const saved = localStorage.getItem("store_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    const apiName = "productList";
    try {
      const body = {
        search: "",
        page: 1,
        noOf: 10,
      };
      const response = await apiService.PostAPICall(apiName, body);
      switch (response?.status) {
        case 1:
          commonService.resetAPIFlag(apiName, false);
          setProducts(response?.data?.products || []);
          setIsLoading(false);
          break;
        case 0:
          commonService.resetAPIFlag(apiName, false);
          toast.error(response?.message || "Failed to load products.");
          setProducts([]);
          setIsLoading(false);
          break;
      }
    } catch (error) {
      console.error("fetchProducts ~ error:", error);
      commonService.resetAPIFlag(apiName, false);
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: any) => {
    setCart((prev: any) => {
      const existing = prev.find((item: any) => item.productId === product.productId);
      if (existing) {
        return prev.map((item: any) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.productId,
          name: product.name,
          brand: product.brand,
          sellingPrice: product.sellingPrice,
          stockQuantity: product.stockQuantity,
          status: product.status,
          imageUrl: product.imageUrl,
          quantity: 1,
          cartHash: product.productHash,
        },
      ];
    });
    toast.success(`"${product.name}" added to cart!`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prev: any) =>
      prev.map((item: any) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev: any) => prev.filter((item: any) => item.productId !== productId));
    toast.info("Item removed from cart");
  };

  const handleClearCart = () => {
    setCart([]);
    toast.info("Cart cleared");
  };

  const handleCheckoutSuccess = () => {
    setCart([]);
    fetchProducts();
  };

  useEffect(() => {
    localStorage.setItem("store_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalCartCount = cart.reduce((sum: any, item: any) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(`/${Paths.admin}/${Paths.dashboard}`)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              <LuArrowLeft size={14} />
              {storeStatic.backToAdminText}
            </button>
            <div className="hidden sm:block h-5 w-px bg-gray-200" />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                {storeStatic.pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="relative inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <LuShoppingCart size={18} />
              <span className="hidden sm:inline">Cart</span>
              {totalCartCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-white text-indigo-700 rounded-full shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
            {products.length} Products Available
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse space-y-3"
              >
                <div className="h-44 bg-gray-100 rounded-xl" />
                <div className="h-4 bg-gray-100 rounded-sm w-3/4" />
                <div className="h-3 bg-gray-100 rounded-sm w-1/2" />
                <div className="h-8 bg-gray-100 rounded-lg w-full mt-2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto my-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-3">
              <LuPackage size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-800">No Products Available</h3>
            <p className="text-xs text-gray-500 mt-1">Please add products in the admin panel to view them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {products.map((product: any) => {
              const inCartItem = cart.find((item: any) => item.productId === product.productId);
              const isOutOfStock = product.stockQuantity <= 0;
              const isInactive = product.status !== "ACTIVE";
              const isPurchasable = !isOutOfStock && !isInactive;

              return (
                <div
                  key={product.productId}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
                >
                  <div className="relative h-44 bg-gray-50 border-b border-gray-100 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-300">
                        <LuPackage size={36} strokeWidth={1.5} />
                        <span className="text-[10px] uppercase font-semibold mt-1">No Image</span>
                      </div>
                    )}

                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isInactive
                          ? "bg-gray-100 text-gray-600 border border-gray-200"
                          : isOutOfStock
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                      >
                        {isInactive ? product.status : isOutOfStock ? storeStatic.outOfStockText : "Active"}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-gray-700 shadow-xs border border-gray-100">
                        {product.stockQuantity} {product.unit || "pcs"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {product.category?.name && (
                        <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                          <LuTag size={11} />
                          {product.category.name}
                        </p>
                      )}
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h3>
                      {product.brand && (
                        <p className="text-xs text-gray-500 line-clamp-1">{product.brand}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400 block">Price</span>
                        <span className="text-base font-extrabold text-gray-900">
                          ₹{Number(product.sellingPrice).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={!isPurchasable}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${!isPurchasable
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : inCartItem
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                          }`}
                      >
                        {inCartItem ? (
                          <>
                            <LuCheck size={14} />
                            {storeStatic.addedToCartText} ({inCartItem.quantity})
                          </>
                        ) : (
                          <>
                            <LuShoppingCart size={13} />
                            {storeStatic.addToCartText}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckoutSuccess={handleCheckoutSuccess}
      />
    </div>
  );
};
