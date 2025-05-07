"use client"

import { useState, useEffect } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"

const FileDiffViewer = ({ originalContent, fixedContent, fileType, viewMode, status }) => {
  const [diffLines, setDiffLines] = useState([])

  useEffect(() => {
    if (status === "fixed" && originalContent && fixedContent) {
      generateDiff()
    }
  }, [originalContent, fixedContent, status, viewMode])

  const generateDiff = () => {
    const originalLines = originalContent.split("\n")
    const fixedLines = fixedContent.split("\n")

    if (viewMode === "split") {
      setDiffLines(
        originalLines.map((line, i) => {
          const fixedLine = i < fixedLines.length ? fixedLines[i] : ""
          const isDifferent = line !== fixedLine

          return {
            original: { text: line, changed: isDifferent },
            fixed: { text: fixedLine, changed: isDifferent },
          }
        }),
      )
    } else {
      // Unified view - show only changed lines with context
      const contextLines = 3 // Number of unchanged lines to show before and after changes
      const diff = []
      let inChangeBlock = false
      let changeBlockStart = 0

      for (let i = 0; i < Math.max(originalLines.length, fixedLines.length); i++) {
        const originalLine = i < originalLines.length ? originalLines[i] : ""
        const fixedLine = i < fixedLines.length ? fixedLines[i] : ""
        const isDifferent = originalLine !== fixedLine

        if (isDifferent) {
          if (!inChangeBlock) {
            inChangeBlock = true
            changeBlockStart = Math.max(0, i - contextLines)

            // Add context lines before the change
            for (let j = changeBlockStart; j < i; j++) {
              diff.push({
                type: "context",
                lineNumber: j + 1,
                text: originalLines[j],
              })
            }
          }

          // Add the changed lines
          diff.push({
            type: "removed",
            lineNumber: i + 1,
            text: originalLine,
          })

          if (fixedLine) {
            diff.push({
              type: "added",
              lineNumber: i + 1,
              text: fixedLine,
            })
          }
        } else if (inChangeBlock) {
          // Add context lines after the change
          diff.push({
            type: "context",
            lineNumber: i + 1,
            text: originalLine,
          })

          // Check if we've added enough context lines
          if (i >= changeBlockStart + contextLines * 2) {
            inChangeBlock = false
          }
        }
      }

      setDiffLines(diff)
    }
  }

  const getLanguage = () => {
    switch (fileType) {
      case "json":
        return "json"
      case "csv":
        return "csv"
      default:
        return "text"
    }
  }

  if (status === "processing") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="ml-4 text-gray-600">Processing file...</p>
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Processing Failed</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>We couldn't fix this file. It might be too corrupted or in an unsupported format.</p>
            </div>
          </div>
        </div>

        <div className="mt-4 border border-red-200 rounded-md overflow-auto max-h-96">
          <SyntaxHighlighter
            language={getLanguage()}
            style={tomorrow}
            showLineNumbers={true}
            customStyle={{ margin: 0, borderRadius: "0.375rem" }}
          >
            {originalContent || ""}
          </SyntaxHighlighter>
        </div>
      </div>
    )
  }

  if (!originalContent) {
    return <div className="text-center p-8 text-gray-500">No content available</div>
  }

  if (status !== "fixed" || !fixedContent) {
    return (
      <div className="border border-gray-200 rounded-md overflow-auto max-h-96">
        <SyntaxHighlighter
          language={getLanguage()}
          style={tomorrow}
          showLineNumbers={true}
          customStyle={{ margin: 0, borderRadius: "0.375rem" }}
        >
          {originalContent}
        </SyntaxHighlighter>
      </div>
    )
  }

  if (viewMode === "split") {
    return (
      <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded-md overflow-hidden">
        <div className="overflow-auto max-h-96">
          <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
            Original
          </div>
          <div className="p-4 font-mono text-sm">
            {diffLines.map((line, i) => (
              <div key={`original-${i}`} className={`whitespace-pre ${line.original.changed ? "bg-red-100" : ""}`}>
                {line.original.text}
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-auto max-h-96 border-l border-gray-200">
          <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">Fixed</div>
          <div className="p-4 font-mono text-sm">
            {diffLines.map((line, i) => (
              <div key={`fixed-${i}`} className={`whitespace-pre ${line.fixed.changed ? "bg-green-100" : ""}`}>
                {line.fixed.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  } else {
    // Unified view
    return (
      <div className="border border-gray-200 rounded-md overflow-auto max-h-96">
        <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
          Unified Diff
        </div>
        <div className="p-4 font-mono text-sm">
          {diffLines.map((line, i) => (
            <div
              key={`diff-${i}`}
              className={`whitespace-pre ${
                line.type === "removed"
                  ? "bg-red-100 text-red-800"
                  : line.type === "added"
                    ? "bg-green-100 text-green-800"
                    : ""
              }`}
            >
              {line.type === "removed" ? "- " : line.type === "added" ? "+ " : "  "}
              {line.text}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default FileDiffViewer
