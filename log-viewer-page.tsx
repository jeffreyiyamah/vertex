"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as THREE from "three"
import {
  ArrowRight,
  Send,
  Upload,
  Search,
  Filter,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BarChart2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LogViewerPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [question, setQuestion] = useState("")
  const [response, setResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<string | null>("auth_logs_2025-04-14.json")
  const [expandedLog, setExpandedLog] = useState<number | null>(null)

  // Sample log data
  const logData = [
    {
      line: 1,
      timestamp: "2025-04-14T08:00:00Z",
      userPrincipalName: "alice@example.com",
      ipAddress: "192.168.1.10",
      location: "New York, USA",
      appDisplayName: "Office 365",
      clientAppUsed: "Browser",
      status: "Success",
      failureReason: null,
    },
    {
      line: 2,
      timestamp: "2025-04-14T08:01:15Z",
      userPrincipalName: "bob@example.com",
      ipAddress: "192.168.1.20",
      location: "London, UK",
      appDisplayName: "Azure Portal",
      clientAppUsed: "Browser",
      status: "Success",
      failureReason: null,
    },
    {
      line: 3,
      timestamp: "2025-04-14T08:02:34Z",
      userPrincipalName: "charlie@example.com",
      ipAddress: "192.168.1.30",
      location: "Sydney, Australia",
      appDisplayName: "Exchange Online",
      clientAppUsed: "Mobile App",
      status: "Failure",
      failureReason: "Invalid credentials",
    },
    {
      line: 4,
      timestamp: "2025-04-14T08:03:45Z",
      userPrincipalName: "dana@example.com",
      ipAddress: "192.168.1.40",
      location: "Berlin, Germany",
      appDisplayName: "Custom App",
      clientAppUsed: "API",
      status: "Success",
      failureReason: null,
    },
    {
      line: 5,
      timestamp: "2025-04-14T08:04:56Z",
      userPrincipalName: "erin@example.com",
      ipAddress: "192.168.1.50",
      location: "Tokyo, Japan",
      appDisplayName: "SharePoint",
      clientAppUsed: "Desktop Client",
      status: "Success",
      failureReason: null,
    },
    {
      line: 6,
      timestamp: "2025-04-14T08:06:05Z",
      userPrincipalName: "fred@example.com",
      ipAddress: "192.168.1.60",
      location: "Paris, France",
      appDisplayName: "OneDrive",
      clientAppUsed: "Browser",
      status: "Success",
      failureReason: null,
    },
    {
      line: 7,
      timestamp: "2025-04-14T08:07:15Z",
      userPrincipalName: "gina@example.com",
      ipAddress: "192.168.1.70",
      location: "Toronto, Canada",
      appDisplayName: "Teams",
      clientAppUsed: "Mobile App",
      status: "Failure",
      failureReason: "Password expired",
    },
    {
      line: 8,
      timestamp: "2025-04-14T08:08:30Z",
      userPrincipalName: "harry@example.com",
      ipAddress: "192.168.1.80",
      location: "Dublin, Ireland",
      appDisplayName: "Azure Portal",
      clientAppUsed: "Browser",
      status: "Success",
      failureReason: null,
    },
    {
      line: 9,
      timestamp: "2025-04-14T08:09:45Z",
      userPrincipalName: "irene@example.com",
      ipAddress: "192.168.1.90",
      location: "Madrid, Spain",
      appDisplayName: "Office 365",
      clientAppUsed: "Desktop Client",
      status: "Success",
      failureReason: null,
    },
    {
      line: 10,
      timestamp: "2025-04-14T08:10:55Z",
      userPrincipalName: "jack@example.com",
      ipAddress: "192.168.1.100",
      location: "San Francisco, USA",
      appDisplayName: "Power BI",
      clientAppUsed: "Browser",
      status: "Success",
      failureReason: null,
    },
    {
      line: 11,
      timestamp: "2025-04-14T08:12:05Z",
      userPrincipalName: "kate@example.com",
      ipAddress: "192.168.1.110",
      location: "Amsterdam, Netherlands",
      appDisplayName: "Dynamics 365",
      clientAppUsed: "API",
      status: "Failure",
      failureReason: "MFA required",
    },
    {
      line: 12,
      timestamp: "2025-04-14T08:13:20Z",
      userPrincipalName: "leo@example.com",
      ipAddress: "192.168.1.120",
      location: "Rome, Italy",
      appDisplayName: "SharePoint",
      clientAppUsed: "Browser",
      status: "Success",
      failureReason: null,
    },
    {
      line: 13,
      timestamp: "2025-04-14T08:14:35Z",
      userPrincipalName: "mia@example.com",
      ipAddress: "192.168.1.130",
      location: "Vienna, Austria",
      appDisplayName: "Office 365",
      clientAppUsed: "Mobile App",
      status: "Success",
      failureReason: null,
    },
    {
      line: 14,
      timestamp: "2025-04-14T08:15:50Z",
      userPrincipalName: "nick@example.com",
      ipAddress: "192.168.1.140",
      location: "Zurich, Switzerland",
      appDisplayName: "Azure Portal",
      clientAppUsed: "Desktop Client",
      status: "Success",
      failureReason: null,
    },
    {
      line: 15,
      timestamp: "2025-04-14T08:17:00Z",
      userPrincipalName: "olivia@example.com",
      ipAddress: "192.168.1.150",
      location: "Stockholm, Sweden",
      appDisplayName: "Teams",
      clientAppUsed: "Browser",
      status: "Failure",
      failureReason: "Account locked",
    },
    {
      line: 16,
      timestamp: "2025-04-14T08:18:10Z",
      userPrincipalName: "peter@example.com",
      ipAddress: "192.168.1.160",
      location: "Brussels, Belgium",
      appDisplayName: "OneDrive",
      clientAppUsed: "Mobile App",
      status: "Success",
      failureReason: null,
    },
    {
      line: 17,
      timestamp: "2025-04-14T08:19:25Z",
      userPrincipalName: "quincy@example.com",
      ipAddress: "192.168.1.170",
      location: "Moscow, Russia",
      appDisplayName: "Exchange Online",
      clientAppUsed: "Desktop Client",
      status: "Failure",
      failureReason: "Invalid credentials",
    },
    {
      line: 18,
      timestamp: "2025-04-14T08:20:40Z",
      userPrincipalName: "rachel@example.com",
      ipAddress: "192.168.1.180",
      location: "Paris, France",
      appDisplayName: "Custom App",
      clientAppUsed: "API",
      status: "Success",
      failureReason: null,
    },
    {
      line: 19,
      timestamp: "2025-04-14T08:21:55Z",
      userPrincipalName: "sam@example.com",
      ipAddress: "192.168.1.190",
      location: "New York, USA",
      appDisplayName: "Office 365",
      clientAppUsed: "Browser",
      status: "Success",
      failureReason: null,
    },
    {
      line: 20,
      timestamp: "2025-04-14T08:23:05Z",
      userPrincipalName: "tina@example.com",
      ipAddress: "192.168.1.200",
      location: "London, UK",
      appDisplayName: "Azure Portal",
      clientAppUsed: "Browser",
      status: "Failure",
      failureReason: "MFA required",
    },
    {
      line: 21,
      timestamp: "2025-04-14T08:24:15Z",
      userPrincipalName: "umar@example.com",
      ipAddress: "192.168.1.210",
      location: "Sydney, Australia",
      appDisplayName: "Exchange Online",
      clientAppUsed: "Mobile App",
      status: "Success",
      failureReason: null,
    },
    {
      line: 22,
      timestamp: "2025-04-14T08:25:30Z",
      userPrincipalName: "vicki@example.com",
      ipAddress: "192.168.1.220",
      location: "Berlin, Germany",
      appDisplayName: "SharePoint",
      clientAppUsed: "Browser",
      status: "Success",
      failureReason: null,
    },
  ]

  // Filter logs based on search term
  const filteredLogs = logData.filter(
    (log) => searchTerm === "" || JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  // Initialize Three.js scene for the logo
  useEffect(() => {
    if (!canvasRef.current) return

    // Set up scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    })

    const size = 60
    renderer.setSize(size, size)
    renderer.setClearColor(0x000000, 0)

    // Scale factors based on size
    const scale = size / 60
    const axisLength = 1.8 * scale
    const axisWidth = 0.08 * scale
    const sphereSize = 0.25 * scale

    // X axis (white)
    const xGeometry = new THREE.BoxGeometry(axisLength, axisWidth, axisWidth)
    const xMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const xAxis = new THREE.Mesh(xGeometry, xMaterial)
    xAxis.position.x = axisLength / 2
    scene.add(xAxis)

    // Y axis (white)
    const yGeometry = new THREE.BoxGeometry(axisWidth, axisLength, axisWidth)
    const yMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const yAxis = new THREE.Mesh(yGeometry, yMaterial)
    yAxis.position.y = axisLength / 2
    scene.add(yAxis)

    // Z axis (white)
    const zGeometry = new THREE.BoxGeometry(axisWidth, axisWidth, axisLength)
    const zMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const zAxis = new THREE.Mesh(zGeometry, zMaterial)
    zAxis.position.z = axisLength / 2
    scene.add(zAxis)

    // Add sphere at intersection
    const sphereGeometry = new THREE.SphereGeometry(sphereSize, 24, 24)
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphere)

    // Set initial position and rotation
    scene.rotation.x = Math.PI / 6
    scene.rotation.y = Math.PI / 4

    // Animation
    function animate() {
      animationRef.current = requestAnimationFrame(animate)
      scene.rotation.y += 0.03
      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      // Dispose of Three.js resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (object.material instanceof THREE.Material) {
            object.material.dispose()
          } else if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose())
          }
        }
      })

      renderer.dispose()
    }
  }, [])

  // Handle question submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)

    // Simulate AI processing
    setTimeout(() => {
      // Generate a response based on the question
      let aiResponse = ""

      if (question.toLowerCase().includes("failure")) {
        aiResponse =
          "I found 5 login failures in the logs. The main reasons were: 'Invalid credentials' (2), 'Password expired' (1), 'MFA required' (1), and 'Account locked' (1)."
      } else if (question.toLowerCase().includes("location") || question.toLowerCase().includes("country")) {
        aiResponse =
          "The logs show logins from multiple countries including USA, UK, Australia, Germany, Japan, France, Canada, Ireland, Spain, Netherlands, Italy, Austria, Switzerland, Sweden, Belgium, and Russia."
      } else if (question.toLowerCase().includes("app") || question.toLowerCase().includes("application")) {
        aiResponse =
          "The most commonly used applications were: Office 365 (5 logins), Azure Portal (4 logins), SharePoint (3 logins), and Exchange Online (3 logins)."
      } else {
        aiResponse =
          "The logs show 22 login attempts with 5 failures and 17 successes. Users accessed various applications from multiple locations around the world. The most active time period was between 08:00 and 08:25 UTC on April 14, 2025."
      }

      setResponse(aiResponse)
      setIsLoading(false)
    }, 1500)
  }

  // Navigate to upload page
  const handleUploadNew = () => {
    router.push("/upload")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center group">
            <div className="mr-3 relative w-[60px] h-[60px]">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
            <h1 className="text-2xl font-light tracking-wider">
              <span className="font-semibold">Vertex</span>
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/results"
              className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 transition-colors flex items-center shadow-lg shadow-white/5"
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              View Analysis
            </Link>
            <button
              onClick={handleUploadNew}
              className="px-4 py-2 rounded-md bg-white text-black hover:bg-gray-200 transition-colors flex items-center shadow-lg shadow-white/5"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload New Log
            </button>
          </div>
        </div>

        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Log Viewer (Left Side) */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col">
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-zinc-800/50 shadow-xl shadow-purple-900/5 flex flex-col h-[calc(100vh-140px)]">
              {/* Log Header with Search */}
              <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/90">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <h2 className="text-lg font-medium text-white">{selectedLog}</h2>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-800/70 border border-zinc-700/50 rounded-lg py-2 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 text-sm"
                      />
                    </div>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`p-2 rounded-lg ${showFilters ? "bg-purple-500/20 text-purple-300" : "bg-zinc-800/70 text-zinc-400"} hover:bg-zinc-700/50 transition-colors`}
                    >
                      <Filter className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Filters Panel */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-zinc-800/50 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-zinc-500 block mb-1">Status</label>
                          <select className="w-full bg-zinc-800/70 border border-zinc-700/50 rounded-lg py-1.5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/30">
                            <option value="all">All Statuses</option>
                            <option value="success">Success</option>
                            <option value="failure">Failure</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 block mb-1">Application</label>
                          <select className="w-full bg-zinc-800/70 border border-zinc-700/50 rounded-lg py-1.5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/30">
                            <option value="all">All Applications</option>
                            <option value="office">Office 365</option>
                            <option value="azure">Azure Portal</option>
                            <option value="teams">Teams</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 block mb-1">Time Range</label>
                          <div className="flex items-center gap-2">
                            <button className="flex-grow py-1.5 px-3 bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white text-sm hover:bg-zinc-700/50 transition-colors flex items-center justify-center">
                              <Clock className="h-3 w-3 mr-1.5" />
                              Last Hour
                            </button>
                            <button className="flex-grow py-1.5 px-3 bg-zinc-800/70 border border-zinc-700/50 rounded-lg text-white text-sm hover:bg-zinc-700/50 transition-colors flex items-center justify-center">
                              <Clock className="h-3 w-3 mr-1.5" />
                              Last Day
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-grow overflow-auto p-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                <div className="space-y-1">
                  {filteredLogs.map((log) => (
                    <motion.div
                      key={log.line}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`rounded-lg overflow-hidden transition-colors ${expandedLog === log.line ? "bg-zinc-800/70" : "hover:bg-zinc-800/40"}`}
                    >
                      <div
                        className="px-3 py-2 cursor-pointer flex items-center justify-between"
                        onClick={() => setExpandedLog(expandedLog === log.line ? null : log.line)}
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${log.status === "Success" ? "bg-green-500" : "bg-red-500"}`}
                          ></div>
                          <div className="text-xs text-zinc-400 w-16 flex-shrink-0">
                            {formatTimestamp(log.timestamp)}
                          </div>
                          <div className="text-sm truncate text-white">{log.userPrincipalName}</div>
                          <div className="text-xs text-zinc-500 truncate hidden sm:block">{log.appDisplayName}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 mr-2 hidden sm:block">
                            {log.location.split(",")[0]}
                          </div>
                          {expandedLog === log.line ? (
                            <ChevronUp className="h-4 w-4 text-zinc-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-zinc-500" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedLog === log.line && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 py-3 border-t border-zinc-800/50 text-sm">
                              <div className="bg-zinc-900/80 rounded-lg p-3 font-mono text-xs text-zinc-300 overflow-x-auto">
                                {JSON.stringify(log, null, 2)}
                              </div>
                              <div className="mt-3 flex justify-between items-center">
                                <div className="text-xs text-zinc-500">
                                  Log ID: <span className="font-mono">{log.line.toString().padStart(6, "0")}</span>
                                </div>
                                <div className="flex space-x-2">
                                  <button className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300">
                                    Copy
                                  </button>
                                  <button className="text-xs px-2 py-1 rounded bg-purple-900/30 hover:bg-purple-900/50 transition-colors text-purple-300">
                                    Analyze
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-3 border-t border-zinc-800/50 bg-zinc-900/90 text-xs text-zinc-500 flex justify-between items-center">
                <div>
                  Showing {filteredLogs.length} of {logData.length} logs
                </div>
                <div className="flex items-center">
                  <span className="mr-2">Last updated: 2 minutes ago</span>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 lg:col-span-4">
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-800/50 shadow-xl shadow-purple-900/5 p-6 h-[calc(100vh-140px)] flex flex-col">
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                  Vertex AI
                </h1>
                <p className="text-zinc-400">Ask a question about this log file</p>
              </div>

              <form onSubmit={handleSubmit} className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., How many login failures are there?"
                    className="w-full bg-zinc-800/70 border border-zinc-700/50 rounded-xl py-3 px-4 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 shadow-inner shadow-black/20"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-purple-600 hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:hover:bg-purple-600 shadow-lg shadow-purple-900/30"
                    disabled={isLoading || !question.trim()}
                  >
                    <Send className="h-4 w-4 text-white" />
                  </button>
                </div>
              </form>

              <div className="flex-grow overflow-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <div className="text-zinc-400">Analyzing logs...</div>
                    </div>
                  </div>
                ) : response ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 rounded-xl p-4 text-zinc-200 border border-zinc-700/30 shadow-lg"
                  >
                    <div className="flex items-start mb-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">AI</span>
                      </div>
                      <p className="text-sm">{response}</p>
                    </div>
                    <div className="flex justify-end">
                      <button className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300">
                        Follow up
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500">
                    <div className="w-16 h-16 rounded-full bg-zinc-800/70 flex items-center justify-center mb-4">
                      <ArrowRight className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="mb-2">Ask a question about the log data to get insights</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-xs">
                      <button
                        onClick={() => setQuestion("How many login failures are there?")}
                        className="text-xs px-3 py-1.5 rounded-full bg-zinc-800/70 hover:bg-zinc-700/50 transition-colors text-zinc-300"
                      >
                        Login failures?
                      </button>
                      <button
                        onClick={() => setQuestion("Which countries have the most logins?")}
                        className="text-xs px-3 py-1.5 rounded-full bg-zinc-800/70 hover:bg-zinc-700/50 transition-colors text-zinc-300"
                      >
                        Login locations?
                      </button>
                      <button
                        onClick={() => setQuestion("What are the most used applications?")}
                        className="text-xs px-3 py-1.5 rounded-full bg-zinc-800/70 hover:bg-zinc-700/50 transition-colors text-zinc-300"
                      >
                        Popular apps?
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center text-xs text-zinc-500">
                <AlertCircle className="h-3 w-3 mr-2" />
                <span>Vertex AI analyzes logs locally. Your data never leaves your device.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
