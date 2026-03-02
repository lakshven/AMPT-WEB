import React from "react";

interface ClientGroupPaginationProps {
  pagination: {
    page: number;
    totalPages: number;
  } | null;
  page: number;
  onPageChange: (page: number) => void;
}

export default function ClientGroupPagination({
  pagination,
  page,
  onPageChange,
}: ClientGroupPaginationProps) {
  if (!pagination) return null;

  return (
    <div className="flex items-center justify-between mt-4">

      {/* Previous */}
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 bg-gray-700 text-white rounded disabled:bg-gray-400"
      >
        Previous
      </button>

      {/* Page Indicator */}
      <span className="text-sm text-gray-700">
        Page {pagination.page} of {pagination.totalPages}
      </span>

      {/* Next */}
      <button
        disabled={page >= pagination.totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 bg-gray-700 text-white rounded disabled:bg-gray-400"
      >
        Next
      </button>

    </div>
  );
}