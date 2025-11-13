"use client"

import { useState } from "react"
import { Box, Typography, Paper, Button, Stack, Alert, Stepper, Step, StepLabel, LinearProgress } from "@mui/material"
import ReorderIcon from "@mui/icons-material/Reorder"
import DownloadIcon from "@mui/icons-material/Download"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import { PDFUpload } from "@/components/pdf/pdf-upload"
import { OrganizePageGrid } from "@/components/organize/organize-page-grid"
import type { PDFFileInfo, PDFPageInfo } from "@/lib/pdf-utils"
import { reorderPages, downloadPDF } from "@/lib/pdf-utils"
import { useTranslation } from "react-i18next"

const stepsKeys = [
  "workspaces.organize.steps.upload",
  "workspaces.organize.steps.organize",
  "workspaces.organize.steps.save",
] as const

export function OrganizePDFWorkspace() {
  const { t } = useTranslation()
  const [activeStep, setActiveStep] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<PDFFileInfo | null>(null)
  const [organizedPages, setOrganizedPages] = useState<PDFPageInfo[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFileLoaded = (fileInfo: PDFFileInfo) => {
    setUploadedFile(fileInfo)
    setOrganizedPages(fileInfo.pages)
    setActiveStep(1)
  }

  const handleReorderPages = (newOrder: PDFPageInfo[]) => {
    setOrganizedPages(newOrder)
  }

  const handleDeletePage = (pageNumber: number) => {
    setOrganizedPages((prev) => prev.filter((page) => page.pageNumber !== pageNumber))
  }

  const handleSave = async () => {
    if (!uploadedFile || organizedPages.length === 0) {
      setError(t("validation.organize.noPages", "No pages to save"))
      return
    }

    setIsProcessing(true)
    setError(null)
    setProgress(0)

    try {
      setProgress(30)
      const newOrder = organizedPages.map((page) => page.pageNumber)
      setProgress(60)
      const reorderedPdfBytes = await reorderPages(uploadedFile.pdfDoc, newOrder)
      setProgress(90)

      const filename = `${uploadedFile.name.replace(".pdf", "")}_organized.pdf`
      downloadPDF(reorderedPdfBytes, filename)

      setProgress(100)
      setActiveStep(2)
    } catch (err) {
      setError(t("errors.organizeFailed", "Failed to organize PDF. Please try again."))
      console.error("[v0] Organize error:", err)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleReset = () => {
    setActiveStep(0)
    setUploadedFile(null)
    setOrganizedPages([])
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
              backgroundColor: "rgba(33, 150, 243, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ReorderIcon sx={{ fontSize: 28, color: "info.main" }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 0.5 }}>
              {t("workspaces.organize.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("workspaces.organize.subtitle")}
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
              {t("workspaces.organize.processing", { progress })}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && <PDFUpload onFileSelect={handleFileLoaded} />}

        {activeStep === 1 && uploadedFile && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              {t("workspaces.organize.info")}
            </Alert>

            <OrganizePageGrid pages={organizedPages} onReorder={handleReorderPages} onDelete={handleDeletePage} />

            <Stack 
              direction="row" 
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
                sx={{ minWidth: 100 }}
              >
                {t("workspaces.organize.cancel")}
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleSave}
                disabled={isProcessing || organizedPages.length === 0}
                sx={{ flex: 1, minWidth: 140 }}
              >
                {isProcessing
                  ? t("workspaces.organize.processingButton")
                  : t("workspaces.organize.saveButton", { pages: organizedPages.length })}
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
              {t("workspaces.organize.successTitle")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {t("workspaces.organize.successBody")}
            </Typography>
            <Button variant="contained" startIcon={<RestartAltIcon />} onClick={handleReset} size="large">
              {t("workspaces.organize.organizeAnother")}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  )
}
