interface RecentFile {
  id: string
  name: string
  pages: number
  size: string
  action: string
  timestamp: number
}

export function addRecentFile(name: string, pages: number, sizeBytes: number, action: string) {
  try {
    const stored = localStorage.getItem("TuPDF-recent")
    const files: RecentFile[] = stored ? JSON.parse(stored) : []

    const newFile: RecentFile = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      pages,
      size: formatFileSize(sizeBytes),
      action,
      timestamp: Date.now(),
    }

    // Add to beginning and keep only last 20 files
    files.unshift(newFile)
    const trimmed = files.slice(0, 20)

    localStorage.setItem("TuPDF-recent", JSON.stringify(trimmed))
  } catch (error) {
    console.error("[v0] Failed to save recent file:", error)
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
