"use client"

import { useToast } from "../../hooks/use-toast"
import { useEffect, useState } from "react"

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-3 w-full max-w-xs">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${
            toast.variant === "destructive"
              ? "bg-red-50 border-l-4 border-red-500 text-red-800"
              : "bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800"
          } rounded-md shadow-md transition-all duration-300 ease-in-out transform translate-x-0 opacity-100 flex items-start p-4`}
          role="alert"
        >
          <div className="flex-shrink-0">
            {toast.variant === "destructive" ? (
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div className="ml-3 flex-1">
            {toast.title && <h3 className="text-sm font-medium">{toast.title}</h3>}
            {toast.description && <div className="mt-1 text-sm">{toast.description}</div>}
          </div>
          <button 
            onClick={() => dismiss(toast.id)} 
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}