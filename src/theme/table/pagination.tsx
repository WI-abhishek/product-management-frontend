import { IoIosArrowDown } from "react-icons/io";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
type PaginationProps = {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (count: number) => void;
  entryLabel?: string;
};
import { BsThreeDots } from "react-icons/bs";
export const Pagination = ({
  currentPage,
  totalPages,
  rowsPerPage,
  totalRecords,
  onPageChange,
  onRowsPerPageChange,
  entryLabel = "entries",
}: PaginationProps) => {
  const startEntry = (currentPage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(currentPage * rowsPerPage, totalRecords);
  const getPageNumbers = () => {
    const pages: (number | "@/theme/table/...")[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (currentPage <= 5) {
      pages.push(1, 2, 3, 4, 5, "@/theme/table/...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(
        1,
        "@/theme/table/...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(
        1,
        "@/theme/table/...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "@/theme/table/...",
        totalPages,
      );
    }

    return pages;
  };
  return (
    <>
      <div className="entries-select-box items-center flex flex-row">
        {/* <span className="text-xs theme-table-rows-font-color">Show</span> */}
        <div className="relative inline-block">
          <select
            className="entries-select mx-2 px-3 py-[3px] rounded-lg duration-200"
            value={rowsPerPage}
            onChange={(e) => {
              onRowsPerPageChange(Number(e.target.value));
              onPageChange(1);
            }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="40">40</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="">
            <IoIosArrowDown
              className="arrow-icon pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 duration-200"
              size={15}
            />
          </span>
        </div>
        {/* <span className="text-xs theme-table-rows-font-color">entries</span> */}
      </div>
      {totalRecords > 10 && (
        <div className="pagination-box flex flex-row items-center">
          <div
            className="pagination-prev duration-200"
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          >
            <span>
              <MdKeyboardArrowLeft />
            </span>
          </div>
          {getPageNumbers().map((page, index) =>
            page === "@/theme/table/..." ? (
              <div key={index} className="pagination-numbers-icon">
                <span>
                  <BsThreeDots />
                </span>
              </div>
            ) : (
              <div
                key={index}
                className={`pagination-numbers ${page === currentPage ? "active" : ""}`}
                onClick={() => onPageChange(page)}
              >
                <span>{page}</span>
              </div>
            ),
          )}
          <div
            className="pagination-next duration-200"
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          >
            <span>
              <MdKeyboardArrowRight />
            </span>
          </div>
        </div>
      )}
      <div className="total-entries-box">
        <span className="text-xs theme-table-rows-font-color">
          {startEntry} - {endEntry} of {totalRecords} {entryLabel}
        </span>
      </div>
    </>
  );
};
