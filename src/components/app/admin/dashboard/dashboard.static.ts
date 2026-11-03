export const dashboardStatic = {
  statusColors: {
    ACTIVE: {
      label: "Active",
      color: "#10B981",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
      pillClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    INACTIVE: {
      label: "Inactive",
      color: "#64748B",
      badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
      pillClass: "bg-slate-50 text-slate-700 border-slate-200",
    },
    OUT_OF_STOCK: {
      label: "Out of Stock",
      color: "#EF4444",
      badgeClass: "bg-red-100 text-red-800 border-red-300",
      pillClass: "bg-red-50 text-red-700 border-red-200",
    },
    DISCONTINUED: {
      label: "Discontinued",
      color: "#F59E0B",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
      pillClass: "bg-amber-50 text-amber-700 border-amber-200",
    },
  },

  barColors: ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6"],

  summaryCardsConfig: [
    {
      key: "totalProducts",
      title: "Total Products",
      subTitle: "Catalog items tracked",
      colorType: "blue",
    },
    {
      key: "activeProducts",
      title: "Active Products",
      subTitle: "Available for sale",
      colorType: "emerald",
    },
    {
      key: "totalCategories",
      title: "Total Categories",
      subTitle: "Product classifications",
      colorType: "purple",
    },
    {
      key: "lowStockCount",
      title: "Low Stock Alerts",
      subTitle: "Below reorder threshold",
      colorType: "amber",
    },
    {
      key: "outOfStockProducts",
      title: "Out of Stock",
      subTitle: "Needs replenishment",
      colorType: "rose",
    },
  ],
};
