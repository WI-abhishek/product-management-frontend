import { Breadcrumb } from "@/theme/bread-crumb/bread-crumb";
import { TableComponent } from "@/theme/table/table";
import { useEffect, useState } from "react";
import { apiService, commonService } from "@/services";
import moment from "moment-timezone";
import { toast } from "sonner";
import { ConfirmationModal } from "@/theme/confirmation-modal/confirmation-modal";
import { categoryStatic } from "./category.static";
import { AddUpdateCategoryModal } from "./add-update-category.model";

export const CategoryListComponent = () => {
  const { columns } = categoryStatic;

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
    const apiName = "categoryList";

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
          const { categories, totalCount, noOf: responseNoOf } = response.data;
          commonService.resetAPIFlag(apiName, false);
          setRows(
            categories?.map((item: any) => ({
              ...item,
              productsCount: item?._count?.products ?? 0,
              createdAt: moment(item?.createdAt).format("MMM DD, YYYY, hh:mm A"),
            })) || [],
          );
          if (responseNoOf) setNoOf(responseNoOf);
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

  const handleDelete = async () => {
    const element = deleteModalInfo?.data;
    if (!element) return;
    const apiName = "categoryDelete";
    try {
      const response = await apiService.DeleteParamsAPICall(apiName, element?.categoryId);
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

  useEffect(() => {
    onSearch();
  }, [page, noOf, search, filter, sortBy]);

  return (
    <>
      <Breadcrumb
        items={[]}
        isRightButton
        mainTitle="Category"
        btnText="Add Category"
        mainSubTitle="Manage all your categories here"
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
          tableHeading="Category List"
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

      <AddUpdateCategoryModal
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
        title="Delete category"
        content={`Are you sure you want to delete "${deleteModalInfo?.data?.name}"?`}
        confirmation={handleDelete}
      />
    </>
  );
};
