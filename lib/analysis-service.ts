export const statusMessages = [
  { threshold: 0, message: "Initializing analysis" },
  { threshold: 10, message: "Parsing log format" },
  { threshold: 25, message: "Identifying event patterns" },
  { threshold: 40, message: "Analyzing IP addresses" },
  { threshold: 55, message: "Detecting anomalies" },
  { threshold: 70, message: "Correlating security events" },
  { threshold: 85, message: "Generating insights" },
  { threshold: 95, message: "Preparing report" },
  { threshold: 100, message: "Analysis complete" },
]

// Simulated backend processing
export const simulateProcessing = (
  files: Array<{ name: string; size: number }>,
  onProgress: (progress: number) => void,
  onStatusChange: (status: string) => void,
  onComplete: () => void,
) => {
  let progress = 0

  // Calculate total processing time based on file size
  // This creates a more realistic simulation where larger files take longer
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const baseTime = 1 // Base time in ms
  const sizeMultiplier = totalSize > 0 ? Math.min(totalSize / 1000000, 5) : 1 // Cap at 5x for very large files
  const interval = baseTime / (sizeMultiplier || 1)

  // Update status based on progress
  const updateStatus = (currentProgress: number) => {
    for (let i = statusMessages.length - 1; i >= 0; i--) {
      if (currentProgress >= statusMessages[i].threshold) {
        onStatusChange(statusMessages[i].message)
        break
      }
    }
  }

  // Simulate processing steps for each file
  const processFiles = () => {
    onProgress(progress);
    updateStatus(progress);
    const timer = setInterval(() => {
      // More realistic progress increments
      // const increment = Math.random() * 3 + (progress < 50 ? 2 : 1)
      progress += 20

      if (progress >= 100) {
        progress = 100
        clearInterval(timer)
        onProgress(progress)
        updateStatus(progress)

        // Simulate completion delay
        setTimeout(() => {
          onComplete()
        }, 200)
      } else {
        onProgress(progress)
        updateStatus(progress)
      }
    }, interval)

    return () => clearInterval(timer)
  }

  // Start processing with a small delay to simulate initialization
  // const initTimer = setTimeout(() => {
  //   processFiles()
  // }, 100)

  // return () => clearTimeout(initTimer)
  processFiles();
}
