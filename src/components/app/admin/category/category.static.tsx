import { MdOutlineEdit, MdOutlineDelete } from "react-icons/md";
import * as Yup from "yup";

export const categoryStatic = {
  staticInitialValues: {
    name: "",
    description: "",
  },

  validationSchema: Yup.object({
    name: Yup.string()
      .trim()
      .required("Category name is required")
      .min(2, "Category name must be at least 2 characters")
      .max(100, "Category name must be at most 100 characters"),
    description: Yup.string()
      .trim()
      .max(1000, "Description must be at most 1000 characters")
      .nullable(),
  }),

  formFields: [
    {
      name: "name",
      label: "Category Name",
      placeholder: "Enter category name",
      fieldType: "text",
      isRequired: true
    },
    {
      name: "description",
      label: "Description",
      placeholder: "Enter category description (optional)",
      fieldType: "textarea",
    },
  ],

  columns: [
    {
      field: "row_index",
      heading: "Sr No.",
      isBoldText: true,
    },
    {
      field: "name",
      heading: "Category Name",
      isSortable: true,
      isFilterable: true,
      placeHolder: "Filter by name...",
    },
    {
      field: "description",
      heading: "Description",
      isSortable: true,
      isFilterable: true,
      placeHolder: "Filter by description...",
    },
    {
      field: "productsCount",
      heading: "Total Products",
      isSortable: false,
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
