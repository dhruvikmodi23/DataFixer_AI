"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useToast } from "../hooks/use-toast"
import FileDiffViewer from "../components/FileDiffViewer"
import FileMetadata from "../components/FileMetadata"
import FileActions from "../components/FileActions"

const FileDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("split")

  useEffect(() => {
    fetchFileDetails()
  }, [id])

  const fetchFileDetails = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/files/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFile(data.file)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to load file details",
          variant: "destructive",
        })
        navigate("/history")
      }
    } catch (error) {
      console.error("File details fetch error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading file details",
        variant: "destructive",
      })
      navigate("/history")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (type) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/files/${id}/download?type=${type}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = type === "original" ? file.originalName : `fixed_${file.originalName}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)

        toast({
          title: "Download Started",
          description: `Your ${type} file download has started`,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Download Failed",
          description: errorData.message || "Could not download file",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("File download error:", error)
      toast({
        title: "Download Error",
        description: "An unexpected error occurred while downloading the file",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/files/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "File Deleted",
          description: "The file has been successfully deleted",
        })
        navigate("/history")
      } else {
        const errorData = await response.json()
        toast({
          title: "Delete Failed",
          description: errorData.message || "Could not delete file",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("File delete error:", error)
      toast({
        title: "Delete Error",
        description: "An unexpected error occurred while deleting the file",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-center">
            <svg className="h-12 w-12 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z" />
            </svg>
          </div>
          <div className="mt-6">
            <svg className="animate-spin mx-auto h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600">Loading file details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <svg className="h-12 w-12 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            DataFixer AI
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">File Not Found</h3>
            <p className="mt-2 text-sm text-gray-600">
              The file you're looking for doesn't exist or has been deleted.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/history")}
                className="w-full flex justify-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Go to File History
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-7xl">
        <div className="flex justify-center">
          <svg className="h-12 w-12 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z" />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          DataFixer AI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          View and download your fixed file
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-7xl">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{file.originalName}</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
            <div className="lg:col-span-3 p-6 border-r border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">File Comparison</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode("split")}
                    className={`px-3 py-1 text-sm rounded-md ${viewMode === "split" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    Split View
                  </button>
                  <button
                    onClick={() => setViewMode("unified")}
                    className={`px-3 py-1 text-sm rounded-md ${viewMode === "unified" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    Unified View
                  </button>
                </div>
              </div>

              <FileDiffViewer
                originalContent={file.originalContent}
                fixedContent={file.fixedContent}
                fileType={file.fileType}
                viewMode={viewMode}
                status={file.status}
              />

              {file.status === "fixed" && file.changes && file.changes.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Changes Made</h2>
                  <ul className="space-y-3">
                    {file.changes.map((change, index) => (
                      <li key={index} className="bg-gray-50 p-4 rounded-md">
                        <div className="flex items-start">
                          <span className="bg-emerald-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">
                            Line {change.line}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{change.description}</p>
                            {change.before && change.after && (
                              <div className="mt-2 text-xs space-y-1">
                                <div className="bg-red-50 p-2 rounded-md font-mono flex">
                                  <span className="text-red-500 mr-2">-</span>
                                  <span>{change.before}</span>
                                </div>
                                <div className="bg-green-50 p-2 rounded-md font-mono flex">
                                  <span className="text-green-500 mr-2">+</span>
                                  <span>{change.after}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="lg:col-span-1 p-6">
              <FileMetadata file={file} />
              <div className="mt-6">
                <FileActions
                  file={file}
                  onDownloadOriginal={() => handleDownload("original")}
                  onDownloadFixed={() => handleDownload("fixed")}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileDetails