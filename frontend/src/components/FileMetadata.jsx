import { format } from "date-fns"

const FileMetadata = ({ file }) => {
  if (!file) return null

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">File Information</h2>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">File Name</p>
          <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">File Type</p>
          <p className="text-sm font-medium text-gray-900 capitalize">{file.fileType}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Status</p>
          <div className="mt-1">
            {file.status === "fixed" ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Fixed
              </span>
            ) : file.status === "failed" ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Failed
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Processing
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">Size</p>
          <p className="text-sm font-medium text-gray-900">
            {file.fileSize ? `${(file.fileSize / 1024).toFixed(2)} KB` : "N/A"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Uploaded</p>
          <p className="text-sm font-medium text-gray-900">{format(new Date(file.createdAt), "MMM d, yyyy h:mm a")}</p>
        </div>

        {file.processingTime && (
          <div>
            <p className="text-sm text-gray-500">Processing Time</p>
            <p className="text-sm font-medium text-gray-900">{file.processingTime} seconds</p>
          </div>
        )}

        {file.errorMessage && (
          <div>
            <p className="text-sm text-gray-500">Error Message</p>
            <p className="text-sm font-medium text-red-600">{file.errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileMetadata
