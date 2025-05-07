import { format } from "date-fns"

const FileMetadata = ({ file }) => {
  if (!file) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-emerald-600 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        File Information
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-900 font-medium truncate">{file.originalName}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">File Type</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-900 capitalize">{file.fileType}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</p>
          </div>
          <div className="col-span-2">
            {file.status === "fixed" ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="h-2 w-2 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                Fixed
              </span>
            ) : file.status === "failed" ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <svg className="h-2 w-2 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                Failed
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg className="animate-spin h-2 w-2 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Size</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-900">
              {file.fileSize ? `${(file.fileSize / 1024).toFixed(2)} KB` : "N/A"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-900">{format(new Date(file.createdAt), "MMM d, yyyy h:mm a")}</p>
          </div>
        </div>

        {file.processingTime && (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Processing Time</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-900">{file.processingTime} seconds</p>
            </div>
          </div>
        )}

        {file.errorMessage && (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Error</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-red-600">{file.errorMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileMetadata