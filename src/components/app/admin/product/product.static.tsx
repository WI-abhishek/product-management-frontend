import { MdOutlineEdit, MdOutlineDelete } from "react-icons/md";
import * as Yup from "yup";

const productStatusData = [
  { label: "Active", value: "ACTIVE", color: "#10B981" },
  { label: "Inactive", value: "INACTIVE", color: "#6B7280" },
  { label: "Out of Stock", value: "OUT_OF_STOCK", color: "#EF4444" },
  { label: "Discontinued", value: "DISCONTINUED", color: "#F59E0B" },
];

export const productStatic = {
  statusData: productStatusData,

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
