"use client"

import { useState } from "react"
import { Box, Typography, Paper, Button, Stack, Alert, Stepper, Step, StepLabel, LinearProgress } from "@mui/material"
import MergeIcon from "@mui/icons-material/Merge"
import DownloadIcon from "@mui/icons-material/Download"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import AddIcon from "@mui/icons-material/Add"
import { PDFUpload } from "@/components/pdf/pdf-upload"
import { MergeFileList } from "@/components/merge/merge-file-list"
import type { PDFFileInfo } from "@/lib/pdf-utils"
import { mergePDFs, downloadPDF, buildTuPDFFilename } from "@/lib/pdf-utils"
import { useTranslation } from "react-i18next"

const stepsKeys = ["workspaces.merge.steps.upload", "workspaces.merge.steps.arrange", "workspaces.merge.steps.merge"] as const

export function MergePDFWorkspace() {
  const { t } = useTranslation()
  const [activeStep, setActiveStep] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<PDFFileInfo[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(true)
  const [progress, setProgress] = useState(0)

  const handleFileLoaded = (fileInfo: PDFFileInfo) => {
    setUploadedFiles((prev) => [...prev, fileInfo])
    setShowUpload(false)
    if (uploadedFiles.length === 0) {
      setActiveStep(1)
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleReorderFiles = (newOrder: PDFFileInfo[]) => {
    setUploadedFiles(newOrder)
  }

  const handleMerge = async () => {
    if (uploadedFiles.length < 2) {
      setError(t("validation.merge.needTwo", "Please upload at least 2 PDF files to merge"))
      return
    }

    setIsProcessing(true)
    setError(null)
    setProgress(0)

    try {
      setProgress(20)
      const pdfDocs = uploadedFiles.map((file) => file.pdfDoc)
      setProgress(50)
      const mergedPdfBytes = await mergePDFs(pdfDocs)
      setProgress(80)

      const firstName = uploadedFiles[0].name
      const filename = buildTuPDFFilename(firstName, "merged")
      downloadPDF(mergedPdfBytes, filename)

      setProgress(100)
      setActiveStep(2)
    } catch (err) {
      setError(t("errors.mergeFailed", "Failed to merge PDFs. Please try again."))
      console.error("[v0] Merge error:", err)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleReset = () => {
    setActiveStep(0)
    setUploadedFiles([])
    setShowUpload(true)
    setError(null)
    setProgress(0)
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2.5}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2.5,
              backgroundColor: "rgba(233, 30, 99, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MergeIcon sx={{ fontSize: 28, color: "secondary.main" }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 0.5 }}>
              {t("workspaces.merge.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("workspaces.merge.subtitle")}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Paper sx={{ p: { xs: 2.5, sm: 3, md: 4 }, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {stepsKeys.map((key) => (
            <Step key={key}>
              <StepLabel>{t(key)}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {isProcessing && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              {t("workspaces.merge.processing", { progress })}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && <PDFUpload onFileSelect={handleFileLoaded} />}

        {activeStep === 1 && (
          <Box>
            {uploadedFiles.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <MergeFileList files={uploadedFiles} onRemove={handleRemoveFile} onReorder={handleReorderFiles} />
              </Box>
            )}

            {showUpload ? (
              <PDFUpload onFileSelect={handleFileLoaded} />
            ) : (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowUpload(true)}
                fullWidth
                sx={{ mb: 3 }}
              >
                {t("workspaces.merge.addAnother")}
              </Button>
            )}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                mt: 4,
                pt: 3,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{ minWidth: 100, width: { xs: "100%", sm: "auto" } }}
              >
                {t("workspaces.merge.cancel")}
              </Button>
              <Button
                variant="contained"
                startIcon={<MergeIcon />}
                onClick={handleMerge}
                disabled={isProcessing || uploadedFiles.length < 2}
                sx={{ flex: { sm: 1 }, minWidth: 140, width: { xs: "100%", sm: "auto" } }}
              >
                {isProcessing
                  ? t("workspaces.merge.processingButton")
                  : t("workspaces.merge.mergeButton", { count: uploadedFiles.length })}
              </Button>
            </Stack>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                mb: 3,
              }}
            >
              <DownloadIcon sx={{ fontSize: 40, color: "success.main" }} />
            </Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              {t("workspaces.merge.successTitle")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {t("workspaces.merge.successBody")}
            </Typography>
            <Button variant="contained" startIcon={<RestartAltIcon />} onClick={handleReset} size="large">
              {t("workspaces.merge.mergeMore")}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  )
}
