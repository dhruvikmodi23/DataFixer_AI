import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"

const RecentFilesList = ({ files }) => {
  if (!files || files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent files found
      </div>
    )
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "fixed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
            <svg className="h-2 w-2 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Fixed
          </span>
        )
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
            <svg className="h-2 w-2 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Failed
          </span>
        )
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            <svg className="animate-spin h-2 w-2 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700">
            {status}
          </span>
        )
    }
  }

  const getFileTypeIcon = (fileType) => {
    const baseClasses = "flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center"
    
    if (fileType === "csv") {
      return (
        <div className={`${baseClasses} bg-emerald-50`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      )
    } else if (fileType === "json") {
      return (
        <div className={`${baseClasses} bg-indigo-50`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )
    } else {
      return (
        <div className={`${baseClasses} bg-gray-50`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
      )
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden">
      <ul className="divide-y divide-gray-100">
        {files.map((file) => (
          <li key={file._id}>
            <Link 
              to={`/file/${file._id}`} 
              className="block hover:bg-gray-50 px-4 py-3 transition-colors"
            >
              <div className="flex items-center gap-4">
                {getFileTypeIcon(file.fileType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.originalName}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                    <span>{formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}</span>
                    <span className="text-gray-300">•</span>
                    <span className="capitalize">{file.fileType}</span>
                    {file.fileSize && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>{(file.fileSize / 1024).toFixed(2)} KB</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-2">
                  {getStatusBadge(file.status)}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RecentFilesList