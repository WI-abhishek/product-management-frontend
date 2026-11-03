import { Breadcrumb } from "@/theme/bread-crumb/bread-crumb";
import { TableComponent } from "@/theme/table/table";
import { useEffect, useState } from "react";
import { apiService, commonService } from "@/services";
import moment from "moment-timezone";
import { toast } from "sonner";
import { ConfirmationModal } from "@/theme/confirmation-modal/confirmation-modal";
import { AddUpdateProductModal } from "./add-update-product.model";
import { productStatic } from "./product.static";

export const ProductListComponent = () => {
  const { columns } = productStatic;

  const [rows, setRows] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [noOf, setNoOf] = useState(10);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState([]);
  const [sortBy, setSortBy] = useState<any>(null);
  const [isTableLoading, setIsTableLoading] = useState(false);

  const [addUpdateModal, setAddUpdateModal] = useState<{ isOpen: boolean; data: any }>({
    isOpen: false,
    data: null,
  });

  const [deleteModalInfo, setDeleteModalInfo] = useState<{ isOpen: boolean; data: any }>({
    isOpen: false,
    data: null,
  });

  const onSortChange = (fieldName: any, value: any) => {
    if (value) {
      setSortBy({ field: fieldName, type: value });
    } else {
      setSortBy(null);
    }
  };

  const onFilterChange = (filteres: any) => {
    setFilter(filteres?.length > 0 ? filteres : []);
  };

  const onSearch = async () => {
    setIsTableLoading(true);
    const apiName = "productList";

    try {
      const body = {
        search,
        page,
        noOf,
        filter,
        sortBy,
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
              categoryName: item?.category?.name ?? "-",
              brand: item?.brand || "-",
              sellingPrice:
                item?.sellingPrice != null ? `$${Number(item?.sellingPrice).toFixed(2)}` : "-",
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
      case "rowSelectChange":
        handleProductStatusChange(element);
        break;
      case "delete":
        setDeleteModalInfo({ isOpen: true, data: element });
        break;
    }
  };

  useEffect(() => {
    onSearch();
  }, [page, noOf, search, filter, sortBy]);

  return (
    <>
      <Breadcrumb
        items={[]}
        isRightButton
        mainTitle="Products"
        btnText="Add Product"
        mainSubTitle="Manage all your products here"
        onBtnClick={() => setAddUpdateModal({ isOpen: true, data: null })}
      />

      <div className="mt-4">
        <TableComponent
          rows={rows}
          search={search}
          noOfRows={noOf}
          isHeading={true}
          columns={columns}
          currentPage={page}
          isServerSide={true}
          tableHeading="Product List"
          totalRecords={totalRecords}
          onSortChange={onSortChange}
          onActionClick={onActionClick}
          isTableLoading={isTableLoading}
          onFilterChange={onFilterChange}
          onPageChangeServer={(page) => setPage(page)}
          onSearchServer={(val) => {
            setPage(1);
            setSearch(val);
          }}
          onRowsPerPageChangeServer={(rows) => {
            setPage(1);
            setNoOf(rows);
          }}
        />
      </div>

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
