import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import { Breadcrumb } from "@/theme/bread-crumb/bread-crumb";
import { ModernTable } from "@/theme/modern-table";
import { InputComponent } from "@/theme/input/input";
import { SelectComponent, SelectBase } from "@/theme/select/select";
import { apiService, commonService } from "@/services";
import moment from "moment-timezone";
import { toast } from "sonner";
import { ConfirmationModal } from "@/theme/confirmation-modal/confirmation-modal";
import { AddUpdateProductModal } from "./add-update-product.model";
import {
  productStatic,
  initialFilterValues,
  filterFormFields,
  modernColumns,
} from "./product.static";
import {
  LuFilter,
  LuRotateCcw,
  LuPencil,
  LuTrash2,
} from "react-icons/lu";

export const ProductListComponent = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [noOf, setNoOf] = useState(10);
  const [filter, setFilter] = useState<any[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);

  const [addUpdateModal, setAddUpdateModal] = useState<{ isOpen: boolean; data: any }>({
    isOpen: false,
    data: null,
  });

  const [deleteModalInfo, setDeleteModalInfo] = useState<{ isOpen: boolean; data: any }>({
    isOpen: false,
    data: null,
  });

  const fetchCategories = async () => {
    const apiName = "categoryGetCategories";
    try {
      const response = await apiService.GetAPICall(apiName);
      switch (response?.status) {
        case 1:
          commonService.resetAPIFlag(apiName, false);
          setCategoryOptions(
            response?.data?.map((cat: any) => ({
              label: cat.label || cat.name,
              value: cat.value || cat.categoryId,
            })) || [],
          );
          break;
        case 0:
          commonService.resetAPIFlag(apiName, false);
          setCategoryOptions([]);
          break;
      }
    } catch (error) {
      console.error("fetchCategories ~ error:", error);
      commonService.resetAPIFlag(apiName, false);
      setCategoryOptions([]);
    }
  };

  const onSearch = async (overrideFilter?: any[]) => {
    setIsTableLoading(true);
    const apiName = "productList";

    try {
      const activeFilter = overrideFilter !== undefined ? overrideFilter : filter;
      const body = {
        page,
        noOf,
        filter: activeFilter,
      };
      const response = await apiService.PostAPICall(apiName, body);
      switch (response?.status) {
        case 1: {
          const { products, totalCount, pageSize, noOf: responseNoOf } = response.data;
          commonService.resetAPIFlag(apiName, false);
          setRows(
            products?.map((item: any) => ({
              ...item,
              imageUrl: item?.imageUrl || "",
              categoryName: item?.category?.name ?? "—",
              brand: item?.brand || "—",
              rawSellingPrice: item.sellingPrice,
              sellingPrice:
                item?.sellingPrice != null
                  ? `₹${Number(item?.sellingPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                  : "—",
              createdAt: moment(item?.createdAt).format("MMM DD, YYYY, hh:mm A"),
            })) || [],
          );
          if (responseNoOf || pageSize) setNoOf(responseNoOf || pageSize);
          setTotalRecords(totalCount);
          setIsTableLoading(false);
          break;
        }
        case 0:
          commonService.resetAPIFlag(apiName, false);
          setRows([]);
          setTotalRecords(0);
          setIsTableLoading(false);
          break;
      }
    } catch (error) {
      console.error("onSearch ~ error:", error);
      commonService.resetAPIFlag(apiName, false);
      setIsTableLoading(false);
    }
  };

  const handleApplyFilters = (values: any) => {
    const newFilters: any[] = [];
    if (values.name?.trim()) newFilters.push({ field: "name", value: values.name.trim() });
    if (values.sku?.trim()) newFilters.push({ field: "sku", value: values.sku.trim() });
    if (values.categoryId?.value)
      newFilters.push({ field: "categoryId", value: values.categoryId.value });
    if (values.brand?.trim()) newFilters.push({ field: "brand", value: values.brand.trim() });
    if (values.stockStatus?.value)
      newFilters.push({ field: "stockStatus", value: values.stockStatus.value });
    if (values.status?.value) newFilters.push({ field: "status", value: values.status.value });

    setPage(1);
    setFilter(newFilters);
  };

  const handleProductStatusChange = async (element: any) => {
    if (!element?.productId) return;
    const apiName = "productStatus";
    try {
      const response = await apiService.PutAPICall(apiName, {
        productId: element?.productId,
        status: element?.status,
      });
      switch (response?.status) {
        case 1:
          commonService.resetAPIFlag(apiName, false);
          toast.success(response?.message);
          onSearch();
          break;
        case 0:
          commonService.resetAPIFlag(apiName, false);
          toast.error(response?.message);
          break;
      }
    } catch (error) {
      console.error("productStatus change error:", error);
      commonService.resetAPIFlag(apiName, false);
    }
  };

  const handleDelete = async () => {
    const element = deleteModalInfo?.data;
    if (!element?.productId) return;
    const apiName = "productDelete";
    try {
      const response = await apiService.DeleteParamsAPICall(apiName, element?.productId);
      switch (response?.status) {
        case 1:
          commonService.resetAPIFlag(apiName, false);
          toast.success(response?.message);
          setDeleteModalInfo({ isOpen: false, data: null });
          onSearch();
          break;
        case 0:
          commonService.resetAPIFlag(apiName, false);
          toast.error(response?.message);
          break;
      }
    } catch (error) {
      console.error("handleDelete error:", error);
      commonService.resetAPIFlag(apiName, false);
    }
  };

  const onActionClick = (actionName: string, element: any) => {
    switch (actionName) {
      case "edit":
        setAddUpdateModal({ isOpen: true, data: element });
        break;
      case "delete":
        setDeleteModalInfo({ isOpen: true, data: element });
        break;
    }
  };

  const renderExpandedRow = (row: any) => {
    const currentStatusOption =
      productStatic.statusData.find((opt) => opt.value === row.status) || {
        label: String(row.status).replace(/_/g, " "),
        value: row.status,
      };

    return (
      <div className="space-y-4">
        {/* Header & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-gray-200/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Product Details & Actions
            </span>
            <span className="text-xs text-gray-400">• Click row again to collapse</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme SelectBase for Status Dropdown */}
            <div className="w-48 shrink-0" onClick={(e) => e.stopPropagation()}>
              <SelectBase
                value={currentStatusOption}
                onChangeValue={(opt) => {
                  if (opt?.value) {
                    handleProductStatusChange({ productId: row.productId, status: opt.value });
                  }
                }}
                options={productStatic.statusData}
                placeholder="Search status"
                isClearable={false}
              />
            </div>

            {/* Edit Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onActionClick("edit", row);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
            >
              <LuPencil size={13} />
              Edit Details
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onActionClick("delete", row);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors cursor-pointer"
            >
              <LuTrash2 size={13} />
              Delete
            </button>
          </div>
        </div>

        {/* Extended Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
          <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-gray-400 block font-medium">Cost Price</span>
            <span className="font-semibold text-gray-800 text-sm mt-0.5 block">
              {row.costPrice != null ? `₹${Number(row.costPrice).toFixed(2)}` : "—"}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-gray-400 block font-medium">Stock Alert Threshold</span>
            <span className="font-bold text-gray-800 text-sm mt-0.5 block">
              {row.lowStockThreshold || 10} {row.unit || "pcs"}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-gray-400 block font-medium">Unit Measurement</span>
            <span className="font-bold text-gray-800 text-sm mt-0.5 block uppercase">
              {row.unit || "pcs"}
            </span>
          </div>

          <div className="sm:col-span-2 lg:col-span-2 p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs min-w-55">
            <span className="text-gray-400 block font-medium">Created On</span>
            <span className="font-bold text-gray-800 text-sm mt-0.5 block whitespace-nowrap">
              {row.createdAt || "—"}
            </span>
          </div>
        </div>

        {/* Description Box */}
        {row.description && (
          <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs text-xs">
            <span className="text-gray-400 block font-medium mb-1">Description</span>
            <p className="text-gray-700 leading-relaxed">{row.description}</p>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    onSearch();
  }, [page, noOf, filter]);

  return (
    <>
      <Breadcrumb
        items={[]}
        isRightButton
        mainTitle="Products"
        btnText="Add Product"
        mainSubTitle="Manage products, inventory, and status with interactive row expansion"
        onBtnClick={() => setAddUpdateModal({ isOpen: true, data: null })}
      />

      {/* Filter Form Panel Above Table */}
      <div className="mt-4 bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs font-sans">
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <LuFilter size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Filter & Search Products</h3>
              <p className="text-xs text-gray-500">
                Filter inventory by product name, SKU, category, brand, stock, or status
              </p>
            </div>
          </div>
        </div>

        <Formik initialValues={initialFilterValues} onSubmit={handleApplyFilters}>
          {({ resetForm, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {filterFormFields.map((field) =>
                  field.type === "select" ? (
                    <SelectComponent
                      key={field.name}
                      name={field.name}
                      label={field.label}
                      placeholder={field.placeholder}
                      options={field.name === "categoryId" ? categoryOptions : field.options}
                      isClearable={field.isClearable}
                      noFocusNext={true}
                      mainBoxClassName="w-full"
                    />
                  ) : (
                    <InputComponent
                      key={field.name}
                      name={field.name}
                      label={field.label}
                      placeholder={field.placeholder}
                      mainBoxClassName="w-full"
                    />
                  ),
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-500">
                  Showing <span className="font-bold text-gray-800">{rows.length}</span> of{" "}
                  <span className="font-bold text-gray-800">{totalRecords}</span> total products
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setPage(1);
                      setFilter([]);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <LuRotateCcw size={13} />
                    Reset
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <LuFilter size={13} />
                    Apply Filters
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* Modern Table with Row Expansion */}
      <div className="mt-4">
        <ModernTable
          columns={modernColumns}
          rows={rows}
          isLoading={isTableLoading}
          totalRecords={totalRecords}
          currentPage={page}
          noOfRows={noOf}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newNoOf) => {
            setPage(1);
            setNoOf(newNoOf);
          }}
          expandedRowRender={renderExpandedRow}
          emptyMessage="No Products Match Filter"
          emptySubtext="Try clearing one or more filters above to see more records."
        />
      </div>

      {/* Edit / Add Modal */}
      <AddUpdateProductModal
        isOpen={addUpdateModal?.isOpen}
        onClose={(isCall = false) => {
          if (isCall) {
            onSearch();
          }
          setAddUpdateModal((prev: any) => ({ ...prev, isOpen: false }));
        }}
        singleData={addUpdateModal?.data}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalInfo?.isOpen}
        onClose={() => setDeleteModalInfo((prev: any) => ({ ...prev, isOpen: false }))}
        title="Delete product"
        content={`Are you sure you want to delete "${deleteModalInfo?.data?.name}"?`}
        confirmation={handleDelete}
      />
    </>
  );
};
