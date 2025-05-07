"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

const FileDropzone = ({ onFileChange, file, disabled }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0])
      }
    },
    [onFileChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
      "text/plain": [".txt"],
    },
    disabled,
    maxSize: 10485760, // 10MB
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
        isDragActive 
          ? "border-emerald-500 bg-emerald-50/50" 
          : "border-gray-200 hover:border-emerald-400 hover:bg-gray-50"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />

      {file ? (
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-emerald-600"
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
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 truncate max-w-xs mx-auto">{file.name}</p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(2)} KB • {file.type || "Unknown type"}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onFileChange(null)
            }}
            className="inline-flex items-center text-xs text-emerald-600 hover:text-emerald-500 font-medium"
            disabled={disabled}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove file
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {isDragActive ? "Drop file to upload" : "Drag & drop file here"}
            </p>
            <p className="text-xs text-gray-500">
              or <span className="text-emerald-600 font-medium">click to browse</span>
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Supported formats: CSV, JSON, TXT • Max size: 10MB
          </p>
        </div>
      )}
    </div>
  )
}

export default FileDropzone