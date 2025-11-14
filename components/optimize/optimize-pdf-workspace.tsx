"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
} from "@mui/material"
import CompressIcon from "@mui/icons-material/Compress"
import DownloadIcon from "@mui/icons-material/Download"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import { PDFUpload } from "@/components/pdf/pdf-upload"
import type { PDFFileInfo } from "@/lib/pdf-utils"
import { optimizePDF, downloadPDF, buildTuPDFFilename } from "@/lib/pdf-utils"
import { useTranslation } from "react-i18next"

const stepsKeys = [
  "workspaces.optimize.steps.upload",
  "workspaces.optimize.steps.quality",
  "workspaces.optimize.steps.optimize",
] as const

export function OptimizePDFWorkspace() {
  const { t } = useTranslation()
  const [activeStep, setActiveStep] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<PDFFileInfo | null>(null)
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [originalSize, setOriginalSize] = useState(0)
  const [optimizedSize, setOptimizedSize] = useState(0)

  useEffect(() => {
    const savedQuality = localStorage.getItem("defaultQuality") as "low" | "medium" | "high"
    if (savedQuality) {
      setQuality(savedQuality)
    }
  }, [])

  const handleFileLoaded = (fileInfo: PDFFileInfo) => {
    setUploadedFile(fileInfo)
    setOriginalSize(fileInfo.file.size)
    setActiveStep(1)
  }

  const handleOptimize = async () => {
    if (!uploadedFile) {
      setError(t("validation.optimize.noFile", "No file to optimize"))
      return
    }

    setIsProcessing(true)
    setError(null)
    setProgress(0)

    try {
      setProgress(30)
      const optimizedPdfBytes = await optimizePDF(uploadedFile.pdfDoc, quality)
      setProgress(70)

      setOptimizedSize(optimizedPdfBytes.length)

      const filename = buildTuPDFFilename(uploadedFile.name, "optimized")
      downloadPDF(optimizedPdfBytes, filename)

      setProgress(100)
      setActiveStep(2)
    } catch (err) {
      setError(t("errors.optimizeFailed", "Failed to optimize PDF. Please try again."))
      console.error("[v0] Optimize error:", err)
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProgress(0), 500)
    }
  }

  const handleReset = () => {
    setActiveStep(0)
    setUploadedFile(null)
    setError(null)
    setProgress(0)
    setOriginalSize(0)
    setOptimizedSize(0)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const getSavingsPercentage = () => {
    if (originalSize === 0 || optimizedSize === 0) return 0
    return Math.round(((originalSize - optimizedSize) / originalSize) * 100)
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
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CompressIcon sx={{ fontSize: 28, color: "success.main" }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 0.5 }}>
              {t("workspaces.optimize.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("workspaces.optimize.subtitle")}
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
              {t("workspaces.optimize.processing", { progress })}
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
              {t("workspaces.optimize.info")}
            </Alert>

            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {t("workspaces.optimize.fileInfo")}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Chip label={t("workspaces.optimize.pages", { count: uploadedFile.totalPages })} color="primary" variant="outlined" />
                <Chip label={formatFileSize(originalSize)} color="default" variant="outlined" />
              </Stack>
            </Paper>

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                {t("workspaces.optimize.qualityLabel")}
              </FormLabel>
              <RadioGroup value={quality} onChange={(e) => setQuality(e.target.value as "low" | "medium" | "high")}>
                <FormControlLabel
                  value="low"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {t("workspaces.optimize.quality.low.title")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("workspaces.optimize.quality.low.desc")}
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 2, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}
                />
                <FormControlLabel
                  value="medium"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {t("workspaces.optimize.quality.medium.title")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("workspaces.optimize.quality.medium.desc")}
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 2, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}
                />
                <FormControlLabel
                  value="high"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {t("workspaces.optimize.quality.high.title")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("workspaces.optimize.quality.high.desc")}
                      </Typography>
                    </Box>
                  }
                  sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}
                />
              </RadioGroup>
            </FormControl>

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
                {t("workspaces.optimize.cancel")}
              </Button>
              <Button
                variant="contained"
                startIcon={<CompressIcon />}
                onClick={handleOptimize}
                disabled={isProcessing}
                sx={{ flex: { sm: 1 }, minWidth: 140, width: { xs: "100%", sm: "auto" } }}
              >
                {isProcessing ? t("workspaces.optimize.optimizingButton") : t("workspaces.optimize.optimizeButton")}
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
              {t("workspaces.optimize.successTitle")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t("workspaces.optimize.successBody")}
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
              <Paper variant="outlined" sx={{ p: 2, minWidth: 150 }}>
                <Typography variant="caption" color="text.secondary">
                  {t("workspaces.optimize.originalSize")}
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {formatFileSize(originalSize)}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, minWidth: 150 }}>
                <Typography variant="caption" color="text.secondary">
                  {t("workspaces.optimize.optimizedSize")}
                </Typography>
                <Typography variant="h6" fontWeight={600} color="success.main">
                  {formatFileSize(optimizedSize)}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, minWidth: 150 }}>
                <Typography variant="caption" color="text.secondary">
                  {t("workspaces.optimize.saved")}
                </Typography>
                <Typography variant="h6" fontWeight={600} color="warning.main">
                  {getSavingsPercentage()}%
                </Typography>
              </Paper>
            </Stack>

            <Button variant="contained" startIcon={<RestartAltIcon />} onClick={handleReset} size="large">
              {t("workspaces.optimize.optimizeAnother")}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  )
}
