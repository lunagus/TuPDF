"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Box, Paper, Typography, Button, Stack, CircularProgress, Alert } from "@mui/material"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import DescriptionIcon from "@mui/icons-material/Description"
import { loadPDFFile, type PDFFileInfo } from "@/lib/pdf-utils"
import { formatError, logError } from "@/lib/error-handler"
import { useTranslation } from "react-i18next"

interface PDFUploadProps {
  onFileLoaded?: (fileInfo: PDFFileInfo) => void
  onFileSelect?: (fileInfo: PDFFileInfo) => void
  multiple?: boolean
  accept?: string
}

export function PDFUpload({ onFileLoaded, onFileSelect, multiple = false, accept = ".pdf" }: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  const handleFile = useCallback(
    async (file: File) => {
      setIsLoading(true)
      setError(null)

      try {
        const savedPassword = localStorage.getItem("pdfPassword") || undefined
        const fileInfo = await loadPDFFile(file, savedPassword)
        onFileLoaded?.(fileInfo)
        onFileSelect?.(fileInfo)
      } catch (err) {
        logError(err, "PDF Upload")
        const formattedError = formatError(err)
        setError(formattedError.message)
        console.error("[TuPDF] PDF loading error:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [onFileLoaded, onFileSelect],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        files.forEach((file) => {
          if (accept && !file.name.toLowerCase().endsWith(accept.replace(".", "").toLowerCase())) {
            return
          }
          handleFile(file)
        })
      }
    },
    [handleFile, accept],
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
        Array.from(files).forEach((file) => {
          handleFile(file)
        })
      }
    },
    [handleFile],
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
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={48} />
            <Typography variant="body1" color="text.secondary">
              {t("workspaces.upload.loading.title")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("workspaces.upload.loading.caption")}
            </Typography>
          </Stack>
        ) : (
          <Stack alignItems="center" spacing={3}>
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
                {t("workspaces.upload.dropHere")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("workspaces.upload.clickToBrowse")}
              </Typography>
            </Box>
            <Button variant="contained" component="label" startIcon={<DescriptionIcon />} size="large">
              {t("workspaces.upload.selectFile")}
              <input type="file" hidden accept={accept} multiple={multiple} onChange={handleFileInput} />
            </Button>
          </Stack>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            {error}
          </Typography>
          {error.includes("password") || error.includes("encrypted") ? (
            <Typography variant="caption">
              {t("workspaces.upload.errors.encrypted")}
            </Typography>
          ) : error.includes("size") || error.includes("too large") ? (
            <Typography variant="caption">
              {t("workspaces.upload.errors.size")}
            </Typography>
          ) : error.includes("corrupted") || error.includes("invalid") ? (
            <Typography variant="caption">
              {t("workspaces.upload.errors.corrupted")}
            </Typography>
          ) : null}
        </Alert>
      )}
    </Box>
  )
}
