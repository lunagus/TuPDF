"use client"

import { useState } from "react"
import { Box, Typography, Paper, Button, Stack, Alert, Stepper, Step, StepLabel, LinearProgress } from "@mui/material"
import ContentCutIcon from "@mui/icons-material/ContentCut"
import DownloadIcon from "@mui/icons-material/Download"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import { PDFUpload } from "@/components/pdf/pdf-upload"
import { PDFPageSelector } from "@/components/pdf/pdf-page-selector"
import { SplitOptionsPanel } from "@/components/split/split-options-panel"
import type { PDFFileInfo } from "@/lib/pdf-utils"
import { splitPDF, downloadPDF, buildTuPDFFilename } from "@/lib/pdf-utils"
import { addRecentFile } from "@/lib/recent-files"
import { useTranslation } from "react-i18next"

const stepsKeys = ["workspaces.split.steps.upload", "workspaces.split.steps.select", "workspaces.split.steps.split"] as const

export function SplitPDFWorkspace() {
  const { t } = useTranslation()
  const [activeStep, setActiveStep] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<PDFFileInfo | null>(null)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [splitMode, setSplitMode] = useState<"extract" | "ranges" | "every">("extract")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFileLoaded = (fileInfo: PDFFileInfo) => {
    setUploadedFile(fileInfo)
    setActiveStep(1)
    setSelectedPages([])
  }

  const handleSplit = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    setError(null)
    setProgress(0)

    try {
      let pageRanges: number[][] = []

      if (splitMode === "extract") {
        pageRanges = [selectedPages.sort((a, b) => a - b)]
      } else if (splitMode === "ranges") {
        pageRanges = selectedPages.map((page) => [page])
      } else if (splitMode === "every") {
        pageRanges = Array.from({ length: uploadedFile.totalPages }, (_, i) => [i + 1])
      }

      setProgress(30)
      const results = await splitPDF(uploadedFile.pdfDoc, pageRanges)
      setProgress(70)

      results.forEach((pdfBytes, index) => {
        const baseName = uploadedFile.name
        const extra =
          splitMode === "extract"
            ? "extracted"
            : `page_${pageRanges[index][0]}`

        const filename = buildTuPDFFilename(baseName, "split", extra)
        downloadPDF(pdfBytes, filename)
      })

      addRecentFile(uploadedFile.name, uploadedFile.totalPages, uploadedFile.file.size, "Split")

      setProgress(100)
      setActiveStep(2)
    } catch (err) {
      setError(t("errors.splitFailed", "Failed to split PDF. Please try again."))
      console.error("[v0] Split error:", err)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleReset = () => {
    setActiveStep(0)
    setUploadedFile(null)
    setSelectedPages([])
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
              backgroundColor: "rgba(63, 81, 181, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ContentCutIcon sx={{ fontSize: 28, color: "primary.main" }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 0.5 }}>
              {t("workspaces.split.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("workspaces.split.subtitle")}
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
              {t("workspaces.split.processing", { progress })}
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
            <SplitOptionsPanel
              mode={splitMode}
              onModeChange={setSplitMode}
              totalPages={uploadedFile.totalPages}
              selectedPages={selectedPages}
            />

            {splitMode !== "every" && (
              <Box sx={{ mt: 3 }}>
                <PDFPageSelector
                  fileInfo={uploadedFile}
                  selectedPages={selectedPages}
                  onSelectionChange={setSelectedPages}
                  multiSelect={true}
                />
              </Box>
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
                {t("workspaces.split.cancel")}
              </Button>
              <Button
                variant="contained"
                startIcon={<ContentCutIcon />}
                onClick={handleSplit}
                disabled={isProcessing || (splitMode !== "every" && selectedPages.length === 0)}
                sx={{ flex: { sm: 1 }, minWidth: 140, width: { xs: "100%", sm: "auto" } }}
              >
                {isProcessing ? t("workspaces.split.processingButton") : t("workspaces.split.splitButton")}
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
              {t("workspaces.split.successTitle")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {t("workspaces.split.successBody")}
            </Typography>
            <Button variant="contained" startIcon={<RestartAltIcon />} onClick={handleReset} size="large">
              {t("workspaces.split.splitAnother")}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  )
}
