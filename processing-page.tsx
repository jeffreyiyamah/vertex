"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import * as THREE from "three"
import { useRouter } from "next/navigation"
import { useAnalysisStore } from "./lib/store"
import { simulateProcessing } from "./lib/analysis-service"

export default function ProcessingPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const processingRef = useRef<(() => void) | null>(null)

  const { files, progress, currentStatus, updateProgress, updateStatus, resetAnalysis } = useAnalysisStore()

  // Redirect if no files are being analyzed
  useEffect(() => {
    if (files.length === 0) {
      router.push("/")
    }
  }, [files, router])

  // Initialize Three.js scene
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

  // Simulate processing
  useEffect(() => {
    if (files.length === 0) return

    // Start the simulated processing
    const cleanup = simulateProcessing(
      files,
      (newProgress) => {
        updateProgress(newProgress)
      },
      (newStatus) => {
        updateStatus(newStatus)
      },
      () => {
        // When processing is complete, redirect to results page
        // In a real app, you would redirect to a results page
        setTimeout(() => {
          // alert("Analysis complete! In a real app, you would redirect to results page.")
          // resetAnalysis()
          router.push("/log-viewer")
        }, 1000)
      },
    )

    processingRef.current = cleanup

    return () => {
      if (processingRef.current) {
        processingRef.current()
      }
    }
  }, [files, updateProgress, updateStatus, resetAnalysis, router])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl px-4">
        {/* Header */}
        <div className="absolute top-8 left-8">
          <Link href="/" className="flex items-center group">
            <div className="mr-3 relative w-[60px] h-[60px]">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
            <h1 className="text-2xl font-light tracking-wider">
              <span className="font-semibold">Vertex</span>
            </h1>
          </Link>
        </div>

        {/* Processing Content */}
        <div className="flex flex-col items-center justify-center py-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{currentStatus}</h2>
            <div className="text-5xl md:text-6xl font-bold text-white mt-6 mb-10">{Math.round(progress)}%</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-2xl mb-16 relative"
          >
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-white rounded-full"
                transition={{ duration: 0.1, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          {/* File Information */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-12 text-center"
            >
              <p className="text-gray-400 mb-2">
                Processing {files.length} file{files.length !== 1 ? "s" : ""}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {files.map((file, index) => (
                  <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                    {file.name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-500 text-sm"
          >
            Powered by Vertex
          </motion.div>
        </div>
      </div>
    </div>
  )
}
