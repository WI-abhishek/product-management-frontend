import { MdOutlineEdit, MdOutlineDelete } from "react-icons/md";
import { LuPackage, LuTag } from "react-icons/lu";
import type { ModernTableColumn } from "@/theme/modern-table";
import * as Yup from "yup";

export const productStatusData = [
  { label: "Active", value: "ACTIVE", color: "#10B981" },
  { label: "Inactive", value: "INACTIVE", color: "#6B7280" },
  { label: "Out of Stock", value: "OUT_OF_STOCK", color: "#EF4444" },
  { label: "Discontinued", value: "DISCONTINUED", color: "#F59E0B" },
];

export const stockStatusOptions = [
  { label: "In Stock", value: "IN_STOCK" },
  { label: "Low Stock", value: "LOW_STOCK" },
  { label: "Out of Stock", value: "OUT_OF_STOCK" },
];

export const initialFilterValues = {
  name: "",
  sku: "",
  categoryId: null,
  brand: "",
  stockStatus: null,
  status: null,
};

export const filterFormFields = [
  {
    name: "name",
    label: "Product Name",
    placeholder: "Search product name",
    type: "input",
  },
  {
    name: "sku",
    label: "SKU",
    placeholder: "Search SKU",
    type: "input",
  },
  {
    name: "categoryId",
    label: "Category",
    placeholder: "Search category",
    type: "select",
    isClearable: true,
  },
  {
    name: "brand",
    label: "Brand",
    placeholder: "Search brand",
    type: "input",
  },
  {
    name: "stockStatus",
    label: "Stock Status",
    placeholder: "Search stock status",
    type: "select",
    options: stockStatusOptions,
    isClearable: true,
  },
  {
    name: "status",
    label: "Status",
    placeholder: "Search status",
    type: "select",
    options: productStatusData,
    isClearable: true,
  },
];

export const modernColumns: ModernTableColumn[] = [
  {
    field: "name",
    heading: "Product",
    className: "min-w-[220px]",
    render: (_, row: any) => (
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
          {row.imageUrl ? (
            <img src={row.imageUrl} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            <LuPackage className="text-gray-400" size={20} />
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
            {row.name}
          </h4>
          <span className="inline-block text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md mt-0.5">
            {row.sku}
          </span>
        </div>
      </div>
    ),
  },
  {
    field: "categoryName",
    heading: "Category & Brand",
    className: "min-w-[160px]",
    render: (_, row: any) => (
      <div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
          <LuTag size={11} />
          {row.categoryName}
        </span>
        <p className="text-xs text-gray-500 mt-1 font-medium">{row.brand || "—"}</p>
      </div>
    ),
  },
  {
    field: "sellingPrice",
    heading: "Price & Stock",
    className: "min-w-[175px]",
    render: (_, row: any) => {
      const isOutOfStock = row.stockQuantity <= 0;
      const isLowStock =
        row.stockQuantity > 0 && row.stockQuantity <= (row.lowStockThreshold || 10);
      const stockText = `${row.stockQuantity} ${row.unit || "pcs"} ${
        isOutOfStock ? "• Out of stock" : isLowStock ? "• Low stock" : "• In stock"
      }`;
      return (
        <div className="max-w-50">
          <div className="text-sm font-extrabold text-gray-900">{row.sellingPrice}</div>
          <div className="mt-1">
            <span
              title={stockText}
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md inline-block max-w-full truncate whitespace-nowrap align-middle ${
                isOutOfStock
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : isLowStock
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {stockText}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    field: "status",
    heading: "Status",
    className: "min-w-[150px]",
    render: (status: any) => {
      const isInactive = status === "INACTIVE";
      const isOutOfStock = status === "OUT_OF_STOCK";
      const isDiscontinued = status === "DISCONTINUED";
      const label = status ? String(status).replace(/_/g, " ") : "ACTIVE";

      return (
        <span
          className={`whitespace-nowrap inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border shadow-2xs ${
            isInactive
              ? "bg-gray-50 text-gray-700 border-gray-200"
              : isOutOfStock
              ? "bg-red-50 text-red-700 border-red-200"
              : isDiscontinued
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isInactive
                ? "bg-gray-400"
                : isOutOfStock
                ? "bg-red-500"
                : isDiscontinued
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
          />
          {label}
        </span>
      );
    },
  },
];

export const productStatic = {
  statusData: productStatusData,
  stockStatusOptions,
  initialFilterValues,
  filterFormFields,
  modernColumns,

  staticInitialValues: {
    name: "",
    sku: "",
    categoryId: "",
    brand: "",
    unit: "pcs",
    costPrice: "",
    sellingPrice: "",
    stockQuantity: 0,
    lowStockThreshold: 10,
    status: { label: "Active", value: "ACTIVE" },
    description: "",
    image: "",
  },

  validationSchema: Yup.object({
    name: Yup.string()
      .trim()
      .required("Product name is required")
      .min(2, "Product name must be at least 2 characters")
      .max(200, "Product name must be at most 200 characters"),
    sku: Yup.string()
      .trim()
      .required("SKU is required")
      .max(50, "SKU must be at most 50 characters"),
    categoryId: Yup.mixed().required("Category is required").nullable(),
    brand: Yup.string().trim().max(100, "Brand must be at most 100 characters").nullable(),
    unit: Yup.string().trim().max(20, "Unit must be at most 20 characters").nullable(),
    costPrice: Yup.number()
      .typeError("Cost price must be a number")
      .min(0, "Cost price cannot be negative")
      .required("Cost price is required"),
    sellingPrice: Yup.number()
      .typeError("Selling price must be a number")
      .min(0, "Selling price cannot be negative")
      .required("Selling price is required"),
    stockQuantity: Yup.number()
      .typeError("Stock quantity must be a number")
      .min(0, "Stock quantity cannot be negative")
      .integer("Stock quantity must be an integer"),
    lowStockThreshold: Yup.number()
      .typeError("Low stock threshold must be a number")
      .min(0, "Low stock threshold cannot be negative")
      .integer("Low stock threshold must be an integer"),
    description: Yup.string()
      .trim()
      .max(5000, "Description must be at most 5000 characters")
      .nullable(),
  }),

  formFields: [
    {
      name: "name",
      label: "Product Name",
      placeholder: "Enter product name",
      fieldType: "text",
      isRequired: true,
      colSpan: "col-span-1 sm:col-span-2",
    },
    {
      name: "sku",
      label: "SKU",
      placeholder: "e.g. PROD-001",
      fieldType: "text",
      isRequired: true,
      colSpan: "col-span-1",
    },
    {
      name: "categoryId",
      label: "Category",
      placeholder: "Select category",
      fieldType: "select",
      isRequired: true,
      isClearable: true,
      colSpan: "col-span-1",
    },
    {
      name: "brand",
      label: "Brand",
      placeholder: "Enter brand name (optional)",
      fieldType: "text",
      isRequired: false,
      colSpan: "col-span-1",
    },
    {
      name: "unit",
      label: "Unit",
      placeholder: "e.g. pcs, kg, box",
      fieldType: "text",
      isRequired: false,
      colSpan: "col-span-1",
    },
    {
      name: "costPrice",
      label: "Cost Price (₹)",
      placeholder: "0.00",
      fieldType: "number",
      isRequired: true,
      colSpan: "col-span-1",
      min: "0",
      step: "0.01",
    },
    {
      name: "sellingPrice",
      label: "Selling Price (₹)",
      placeholder: "0.00",
      fieldType: "number",
      isRequired: true,
      colSpan: "col-span-1",
      min: "0",
      step: "0.01",
    },
    {
      name: "stockQuantity",
      label: "Stock Quantity",
      placeholder: "0",
      fieldType: "number",
      isRequired: false,
      colSpan: "col-span-1",
      min: "0",
      step: "1",
    },
    {
      name: "lowStockThreshold",
      label: "Low Stock Alert Threshold",
      placeholder: "10",
      fieldType: "number",
      isRequired: false,
      colSpan: "col-span-1",
      min: "0",
      step: "1",
    },
    {
      name: "status",
      label: "Status",
      placeholder: "Select status",
      fieldType: "select",
      isRequired: true,
      colSpan: "col-span-1 sm:col-span-2",
    },
    {
      name: "description",
      label: "Description",
      placeholder: "Enter product description (optional)",
      fieldType: "textarea",
      isRequired: false,
      colSpan: "col-span-1 sm:col-span-2",
    },
  ],

  columns: [
    {
      field: "row_index",
      heading: "Sr No.",
      isBoldText: true,
    },
    {
      field: "imageUrl",
      imageField: "imageUrl",
      heading: "Image",
      isImage: true,
    },
    {
      field: "name",
      heading: "Product Name",
      isSortable: true,
      isFilterable: true,
      placeHolder: "Search...",
    },
    {
      field: "sku",
      heading: "SKU",
      isSortable: true,
      isFilterable: true,
      placeHolder: "Search...",
    },
    {
      field: "categoryName",
      heading: "Category",
      isSortable: true,
      isFilterable: true,
      placeHolder: "Search...",
    },
    {
      field: "brand",
      heading: "Brand",
      isSortable: true,
      isFilterable: true,
      placeHolder: "Search...",
    },
    {
      field: "sellingPrice",
      heading: "Selling Price",
      isSortable: true,
      isFilterable: true,
      placeHolder: "Search...",
    },
    {
      field: "stockQuantity",
      heading: "Stock",
      isSortable: true,
      isFilterable: true,
      placeHolder: "Search...",
    },
    {
      field: "status",
      heading: "Status",
      isSortable: true,
      isSelectInRow: true,
      statusData: productStatusData,
    },
    {
      field: "createdAt",
      heading: "Created At",
      isSortable: true,
    },
    {
      isActionField: true,
      actionList: [
        {
          type: "icon",
          icon: MdOutlineEdit,
          iconName: "edit",
        },
        {
          type: "icon",
          icon: MdOutlineDelete,
          iconName: "delete",
        },
      ],
    },
  ],
};
