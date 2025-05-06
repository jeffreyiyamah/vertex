"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, AlertCircle, FileText, ArrowRight, X, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAnalysisStore } from "./lib/store"
import Logo from "./Logo";



export default function VertexUI() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { setFiles: setStoreFiles, startAnalysis } = useAnalysisStore()

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)

      // Validate file types
      const invalidFiles = droppedFiles.filter((file) => !file.name.endsWith(".json"))

      if (invalidFiles.length > 0) {
        setError(`Only .json files are accepted. Please remove: ${invalidFiles.map((f) => f.name).join(", ")}`)
        return
      }

      setFiles(droppedFiles)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)

    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)

      // Validate file types
      const invalidFiles = selectedFiles.filter((file) => !file.name.endsWith(".json"))

      if (invalidFiles.length > 0) {
        setError(`Only .json files are accepted. Please remove: ${invalidFiles.map((f) => f.name).join(", ")}`)
        return
      }

      setFiles(selectedFiles)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
    if (files.length === 1) {
      setError(null) // Clear error when removing the last file
    }
  }

  const handleAnalyze = () => {
    if (files.length > 0) {
      setIsLoading(true)

  
      // Store files in global state
      setStoreFiles(files)

      // Start analysis
      startAnalysis()

      // Simulate a brief loading delay before navigation
      setTimeout(() => {
        // Navigate to processing page
        router.push("/processing")
      }, 300)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-10 mt-4">
          <Logo />
          <h1 className="text-2xl font-light tracking-wider">
            <span className="font-semibold">Vertex</span>
          </h1>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
          >
            Analyze Security Logs Locally


          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-center mb-12 max-w-2xl text-lg"
          >
            Powerful AI-driven log analysis that runs entirely on your machine. No data leaves your system. Get instant
            insights without compromising security.
          </motion.p>

          {/* Drag & Drop Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full mb-8"
          >
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`
                relative border-2 border-dashed rounded-xl p-12
                flex flex-col items-center justify-center
                transition-all duration-200 ease-in-out
                min-h-[280px]
                ${
                  isDragging
                    ? "border-white bg-white/10"
                    : files.length > 0
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-gray-700 hover:border-gray-500 hover:bg-white/5"
                }
              `}
            >
              {files.length > 0 ? (
                <div className="flex flex-col items-center">
                  <FileText className="h-16 w-16 text-green-500 mb-4" />
                  <p className="text-xl font-medium mb-2">Files Ready for Analysis</p>
                  <ul className="text-gray-400 mb-4 w-full max-w-md">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between py-1.5 group">
                        <div className="flex items-center overflow-hidden">
                          <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <>
                  <Upload className={`h-16 w-16 mb-4 ${isDragging ? "text-white" : "text-gray-500"}`} />
                  <p className={`text-xl font-medium mb-2 ${isDragging ? "text-white" : "text-gray-300"}`}>
                    {isDragging ? "Drop Your Files Here" : "Drag and Drop Your Log Files"}
                  </p>
                  <p className="text-gray-500 text-center mb-4">or</p>
                  <label className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 transition-colors cursor-pointer">
                    <span>Browse Files</span>
                    <input type="file" multiple className="hidden" accept=".json" onChange={handleFileSelect} />
                  </label>
                </>
              )}
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center bg-red-900/30 text-red-400 px-4 py-3 rounded-lg mt-4 w-full"
            >
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Action Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`
              px-8 py-3 rounded-full font-medium text-lg
              transition-all duration-200
              ${
                files.length > 0
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-white/10 text-gray-400 cursor-not-allowed"
              }
              ${isLoading ? "opacity-70 cursor-wait" : ""}
            `}
            disabled={files.length === 0 || isLoading}
            onClick={handleAnalyze}
          >
            {isLoading ? "Preparing..." : "Analyze Logs"}
          </motion.button>

          {/* Security Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center mt-8 text-gray-500 text-sm"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>All analysis is performed locally. Your data never leaves your device.</span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
