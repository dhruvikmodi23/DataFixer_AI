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
      const contextLines = 3
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

            for (let j = changeBlockStart; j < i; j++) {
              diff.push({
                type: "context",
                lineNumber: j + 1,
                text: originalLines[j],
              })
            }
          }

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
          diff.push({
            type: "context",
            lineNumber: i + 1,
            text: originalLine,
          })

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
        <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="ml-3 text-gray-600">Processing file...</p>
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-red-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Processing Failed</h3>
            <div className="mt-1 text-sm text-red-700">
              <p>We couldn't fix this file. It might be too corrupted or in an unsupported format.</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-md overflow-hidden border border-red-100">
          <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
            Original File Content
          </div>
          <SyntaxHighlighter
            language={getLanguage()}
            style={tomorrow}
            showLineNumbers={true}
            customStyle={{ 
              margin: 0, 
              background: "white",
              fontSize: "0.875rem",
              lineHeight: "1.5"
            }}
          >
            {originalContent || ""}
          </SyntaxHighlighter>
        </div>
      </div>
    )
  }

  if (!originalContent) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        No content available
      </div>
    )
  }

  if (status !== "fixed" || !fixedContent) {
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
          File Content
        </div>
        <SyntaxHighlighter
          language={getLanguage()}
          style={tomorrow}
          showLineNumbers={true}
          customStyle={{ 
            margin: 0, 
            background: "white",
            fontSize: "0.875rem",
            lineHeight: "1.5"
          }}
        >
          {originalContent}
        </SyntaxHighlighter>
      </div>
    )
  }

  if (viewMode === "split") {
    return (
      <div className="grid grid-cols-2 gap-0 rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-auto">
          <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
            Original
          </div>
          <div className="p-4 font-mono text-sm bg-white">
            {diffLines.map((line, i) => (
              <div 
                key={`original-${i}`} 
                className={`whitespace-pre ${line.original.changed ? "bg-red-50 text-red-800" : ""}`}
              >
                {line.original.text}
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-auto border-l border-gray-200">
          <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
            Fixed
          </div>
          <div className="p-4 font-mono text-sm bg-white">
            {diffLines.map((line, i) => (
              <div 
                key={`fixed-${i}`} 
                className={`whitespace-pre ${line.fixed.changed ? "bg-green-50 text-green-800" : ""}`}
              >
                {line.fixed.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
          Unified Diff
        </div>
        <div className="p-4 font-mono text-sm bg-white">
          {diffLines.map((line, i) => (
            <div
              key={`diff-${i}`}
              className={`whitespace-pre ${
                line.type === "removed"
                  ? "bg-red-50 text-red-800"
                  : line.type === "added"
                    ? "bg-green-50 text-green-800"
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