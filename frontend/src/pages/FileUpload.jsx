"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "../hooks/use-toast"
import FileDropzone from "../components/FileDropzone"

const FileUpload = () => {
  const [file, setFile] = useState(null)
  const [fileType, setFileType] = useState("auto")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile)

    // Auto-detect file type from extension
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase()
      if (fileName.endsWith(".csv")) {
        setFileType("csv")
      } else if (fileName.endsWith(".json")) {
        setFileType("json")
      } else {
        setFileType("auto")
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("fileType", fileType)

    try {
      const token = localStorage.getItem("token")

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress > 90 ? 90 : newProgress
        })
      }, 500)

      const response = await fetch("http://localhost:5000/api/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Upload Successful",
          description: "Your file has been uploaded and is being processed",
        })

        // Wait a moment to show 100% progress
        setTimeout(() => {
          navigate(`/file/${data.fileId}`)
        }, 500)
      } else {
        toast({
          title: "Upload Failed",
          description: data.message || "Could not upload file",
          variant: "destructive",
        })
        setProgress(0)
      }
    } catch (error) {
      console.error("File upload error:", error)
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="flex justify-center">
          <svg className="h-12 w-12 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z" />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          DataFixer AI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Upload your broken CSV or JSON file for AI-powered repair
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <FileDropzone onFileChange={handleFileChange} file={file} disabled={loading} />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-emerald-600"
                    name="fileType"
                    value="auto"
                    checked={fileType === "auto"}
                    onChange={() => setFileType("auto")}
                    disabled={loading}
                  />
                  <span className="ml-2">Auto-detect</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-emerald-600"
                    name="fileType"
                    value="csv"
                    checked={fileType === "csv"}
                    onChange={() => setFileType("csv")}
                    disabled={loading}
                  />
                  <span className="ml-2">CSV</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-emerald-600"
                    name="fileType"
                    value="json"
                    checked={fileType === "json"}
                    onChange={() => setFileType("json")}
                    disabled={loading}
                  />
                  <span className="ml-2">JSON</span>
                </label>
              </div>
            </div>

            {loading && (
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{progress < 100 ? "Processing..." : "Complete!"}</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !file}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : "Upload & Fix"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-emerald-50 rounded-lg p-6 border border-emerald-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tips for Best Results</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">•</span>
              <span>Files should be less than 10MB for optimal processing speed</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">•</span>
              <span>Our AI works best with common CSV and JSON formatting issues</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">•</span>
              <span>For CSV files, we can fix missing quotes, extra commas, and inconsistent delimiters</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">•</span>
              <span>For JSON files, we can fix missing brackets, commas, and quote issues</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">•</span>
              <span>If you know the file type, selecting it manually may improve results</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default FileUpload