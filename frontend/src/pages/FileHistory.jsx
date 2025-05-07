"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useToast } from "../hooks/use-toast"
import FileHistoryTable from "../components/FileHistoryTable"
import Pagination from "../components/Pagination"

const FileHistory = () => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchFiles()
  }, [currentPage, filter])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/files?page=${currentPage}&filter=${filter}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setFiles(data.files)
        setTotalPages(data.totalPages)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load file history",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("File history fetch error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading file history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleDeleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/files/${fileId}`, {
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
        fetchFiles()
      } else {
        const data = await response.json()
        toast({
          title: "Delete Failed",
          description: data.message || "Could not delete file",
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

  return (
    <div className="flex min-h-screen flex-col justify-start bg-gray-50 py-12 sm:px-6 lg:px-8">
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
          View and manage your uploaded files
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-7xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="w-full sm:w-auto">
              <select
                value={filter}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm py-2 px-3 border"
              >
                <option value="all">All Files</option>
                <option value="csv">CSV Files</option>
                <option value="json">JSON Files</option>
                <option value="fixed">Fixed Files</option>
                <option value="failed">Failed Files</option>
              </select>
            </div>

            <Link
              to="/upload"
              className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Upload New File
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : files.length > 0 ? (
            <>
              <FileHistoryTable files={files} onDelete={handleDeleteFile} />
              <div className="mt-6">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
              <p className="mt-1 text-sm text-gray-500 mb-6">Get started by uploading a new file.</p>
              <Link
                to="/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Upload your first file
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileHistory