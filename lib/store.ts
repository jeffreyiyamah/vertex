import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AnalysisState {
  files: File[]
  isAnalyzing: boolean
  progress: number
  currentStatus: string
  setFiles: (files: File[]) => void
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

      setFiles: (files: File[]) => set({ files }),

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
      partialize: (state) => ({
        isAnalyzing: state.isAnalyzing,
        progress: state.progress,
        currentStatus: state.currentStatus,
      }),
    },
  ),
)
