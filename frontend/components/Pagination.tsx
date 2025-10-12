'use client';

import { FC } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center mt-4 space-x-2">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white font-semibold py-1 px-3 rounded-lg transition disabled:opacity-50"
      >
        Previous
      </button>
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-lg transition ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white font-semibold py-1 px-3 rounded-lg transition disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;