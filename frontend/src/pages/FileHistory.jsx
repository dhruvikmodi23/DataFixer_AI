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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">File History</h1>
        <p className="text-gray-600">View and manage your uploaded files</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <select
              value={filter}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Upload New File
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : files.length > 0 ? (
          <>
            <FileHistoryTable files={files} onDelete={handleDeleteFile} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No files found</p>
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
  )
}

export default FileHistory
