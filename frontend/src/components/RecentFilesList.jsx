import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"

const RecentFilesList = ({ files }) => {
  if (!files || files.length === 0) {
    return null
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "fixed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Fixed
          </span>
        )
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Failed
          </span>
        )
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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

  const getFileTypeIcon = (fileType) => {
    if (fileType === "csv") {
      return (
        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-green-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
      )
    } else if (fileType === "json") {
      return (
        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-purple-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-purple-600"
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
        </div>
      )
    } else {
      return (
        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      )
    }
  }

  return (
    <ul className="divide-y divide-gray-200">
      {files.map((file) => (
        <li key={file._id} className="py-4">
          <Link to={`/file/${file._id}`} className="block hover:bg-gray-50 -m-4 p-4 rounded-md transition-colors">
            <div className="flex items-center space-x-4">
              {getFileTypeIcon(file.fileType)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.originalName}</p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <span>{formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}</span>
                  <span className="mx-1">•</span>
                  <span className="capitalize">{file.fileType}</span>
                  {file.fileSize && (
                    <>
                      <span className="mx-1">•</span>
                      <span>{(file.fileSize / 1024).toFixed(2)} KB</span>
                    </>
                  )}
                </div>
              </div>
              <div>{getStatusBadge(file.status)}</div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default RecentFilesList
