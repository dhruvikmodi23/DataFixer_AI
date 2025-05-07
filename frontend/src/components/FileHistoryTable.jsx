"use client"

import { Link } from "react-router-dom"
import { formatDistanceToNow, format } from "date-fns"

const FileHistoryTable = ({ files, onDelete }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "fixed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <svg className="h-2.5 w-2.5 mr-1" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Fixed
          </span>
        )
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <svg className="h-2.5 w-2.5 mr-1" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Failed
          </span>
        )
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <svg className="animate-spin h-2.5 w-2.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              File
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr key={file._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    {file.fileType === "csv" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      <Link to={`/file/${file._id}`} className="hover:text-emerald-600">
                        {file.originalName}
                      </Link>
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{file.fileType} file</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(file.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{format(new Date(file.createdAt), "MMM d, yyyy")}</div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {file.fileSize ? `${(file.fileSize / 1024).toFixed(2)} KB` : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                <Link 
                  to={`/file/${file._id}`} 
                  className="text-emerald-600 hover:text-emerald-800"
                >
                  View
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    if (window.confirm("Are you sure you want to delete this file?")) {
                      onDelete(file._id)
                    }
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FileHistoryTable