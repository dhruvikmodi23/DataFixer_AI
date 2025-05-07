"use client"

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => onPageChange(1)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-emerald-600"
        >
          1
        </button>
      )

      if (startPage > 2) {
        pages.push(
          <span
            key="ellipsis1"
            className="px-3 py-1.5 text-sm font-medium text-gray-400"
          >
            ...
          </span>
        )
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            i === currentPage
              ? "bg-emerald-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span
            key="ellipsis2"
            className="px-3 py-1.5 text-sm font-medium text-gray-400"
          >
            ...
          </span>
        )
      }

      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-emerald-600"
        >
          {totalPages}
        </button>
      )
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-4 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
            currentPage === 1 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Previous
        </button>
        <div className="flex items-center px-4 text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
            currentPage === totalPages 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">page {currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="flex items-center space-x-2" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-md ${
                currentPage === 1 
                  ? "text-gray-300 cursor-not-allowed" 
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {renderPageNumbers()}

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-md ${
                currentPage === totalPages 
                  ? "text-gray-300 cursor-not-allowed" 
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Pagination