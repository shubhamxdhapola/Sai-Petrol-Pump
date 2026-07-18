import React from 'react';
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalEntries,
  entriesPerPage = 10
}) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * entriesPerPage + 1;
  const end = Math.min(currentPage * entriesPerPage, totalEntries);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 px-6 bg-white">
      <p className="text-xs font-semibold text-slate-500">
        Showing <span className="text-slate-800">{start}</span> to{" "}
        <span className="text-slate-800">{end}</span> of{" "}
        <span className="text-slate-800">{totalEntries}</span> entries
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn-secondary !p-2 text-sm disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Previous page"
        >
          <FiChevronLeft className="text-lg" />
        </button>
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`h-9 w-9 rounded-md text-sm font-bold transition-all ${currentPage === page ? "bg-brand text-white shadow-md shadow-blue-100" : "hover:bg-slate-50 text-slate-600 bg-white border border-slate-200"}`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn-secondary !p-2 text-sm disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Next page"
        >
          <FiChevronRight className="text-lg" />
        </button>
      </div>
    </div>
  );
}
