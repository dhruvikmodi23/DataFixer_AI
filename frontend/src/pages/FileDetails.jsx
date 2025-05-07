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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">File Not Found</h2>
          <p className="text-gray-600 mb-4">The file you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate("/history")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Go to File History
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">File Details</h1>
        <p className="text-gray-600">View and download your fixed file</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{file.originalName}</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode("split")}
                  className={`px-3 py-1 text-sm rounded-md ${viewMode === "split" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setViewMode("unified")}
                  className={`px-3 py-1 text-sm rounded-md ${viewMode === "unified" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}
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
          </div>

          {file.status === "fixed" && file.changes && file.changes.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Changes Made</h2>
              <ul className="space-y-2">
                {file.changes.map((change, index) => (
                  <li key={index} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-start">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-1 rounded-full mr-2">
                        Line {change.line}
                      </span>
                      <div>
                        <p className="text-sm text-gray-800">{change.description}</p>
                        {change.before && change.after && (
                          <div className="mt-2 text-xs">
                            <div className="bg-red-50 p-2 rounded-md mb-1 font-mono">- {change.before}</div>
                            <div className="bg-green-50 p-2 rounded-md font-mono">+ {change.after}</div>
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

        <div className="lg:col-span-1">
          <FileMetadata file={file} />
          <FileActions
            file={file}
            onDownloadOriginal={() => handleDownload("original")}
            onDownloadFixed={() => handleDownload("fixed")}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  )
}

export default FileDetails
