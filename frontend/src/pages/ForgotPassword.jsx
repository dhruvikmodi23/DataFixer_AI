"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useToast } from "../hooks/use-toast"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
        const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        })
  
        const data = await response.json()
  
        if (response.ok) {
          setSubmitted(true)
          toast({
            title: "Email Sent",
            description: "If an account exists with this email, you will receive a password reset link",
          })
        } else {
          toast({
            title: "Request Failed",
            description: data.message || "Could not process your request",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Forgot password error:", error)
        toast({
          title: "Request Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <svg className="h-12 w-12 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">DataFixer AI</h2>
          <h3 className="mt-2 text-center text-xl font-medium text-gray-900">Check Your Email</h3>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-900">Password reset link sent</p>
              <p className="mt-2 text-sm text-gray-600">
                We've sent instructions to <span className="font-medium text-emerald-600">{email}</span>. Please check your inbox and follow the directions.
              </p>
              <p className="mt-4 text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or ensure you entered the correct address.
              </p>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="flex w-full justify-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email to reset your password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="-ml-1 mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : "Send Reset Link"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  Remember your password?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword