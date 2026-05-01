"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { Box, Paper, Typography, Button, Stack, CircularProgress, Alert } from "@mui/material"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import ImageIcon from "@mui/icons-material/Image"
import { useTranslation } from "react-i18next"

interface ImageUploadProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
}

export function ImageUpload({ onFilesSelected, accept = "image/png, image/jpeg, image/jpg" }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  const handleFiles = useCallback(
    (files: File[]) => {
      setIsLoading(true)
      setError(null)

      try {
        const validFiles = files.filter((file) => file.type.startsWith("image/"))
        if (validFiles.length === 0) {
          throw new Error("No valid image files selected.")
        }
        onFilesSelected(validFiles)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error loading images"
        setError(message)
        console.error("[TuPDF] Image loading error:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [onFilesSelected],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFiles(files)
      }
    },
    [handleFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFiles(Array.from(files))
      }
    },
    [handleFiles],
  )

  return (
    <Box>
      <Paper
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          p: { xs: 2.5, sm: 3, md: 6 },
          textAlign: "center",
          border: "2px dashed",
          borderColor: isDragging ? "primary.main" : "divider",
          backgroundColor: isDragging ? "rgba(63, 81, 181, 0.05)" : "background.paper",
          transition: "all 0.2s",
          cursor: "pointer",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "rgba(63, 81, 181, 0.05)",
          },
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={48} />
            <Typography variant="body1" color="text.secondary">
              {t("workspaces.upload.loading.title")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("workspaces.upload.loading.caption")}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "rgba(63, 81, 181, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 40, color: "primary.main" }} />
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                {t("workspaces.imageToPdf.steps.upload")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("workspaces.upload.clickToBrowse")}
              </Typography>
            </Box>
            <Button variant="contained" component="label" startIcon={<ImageIcon />} size="large">
              Select Images
              <input type="file" hidden accept={accept} multiple onChange={handleFileInput} />
            </Button>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          <Typography variant="body2" fontWeight={600}>
            {error}
          </Typography>
        </Alert>
      )}
    </Box>
  )
}
