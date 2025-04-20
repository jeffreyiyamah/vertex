import { create } from "zustand"
import { persist } from "zustand/middleware"

type FileInfo = {
  name: string
  size: number
  type: string
}

interface AnalysisState {
  files: FileInfo[]
  isAnalyzing: boolean
  progress: number
  currentStatus: string
  setFiles: (files: FileInfo[]) => void
  startAnalysis: () => void
  updateProgress: (progress: number) => void
  updateStatus: (status: string) => void
  resetAnalysis: () => void
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      files: [],
      isAnalyzing: false,
      progress: 0,
      currentStatus: "Initializing analysis",

      setFiles: (files) => set({ files }),

      startAnalysis: () =>
        set({
          isAnalyzing: true,
          progress: 0,
          currentStatus: "Initializing analysis",
        }),

      updateProgress: (progress) => set({ progress }),

      updateStatus: (status) => set({ currentStatus: status }),

      resetAnalysis: () =>
        set({
          isAnalyzing: false,
          progress: 0,
          currentStatus: "Initializing analysis",
        }),
    }),
    {
      name: "vertex-analysis-storage",
    },
  ),
)
