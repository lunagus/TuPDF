"use client"

import { useState } from "react"
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
} from "@mui/material"
import DownloadIcon from "@mui/icons-material/Download"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import ImageIcon from "@mui/icons-material/Image"
import { PDFUpload } from "@/components/pdf/pdf-upload"
import { PDFPageSelector } from "@/components/pdf/pdf-page-selector"
import type { PDFFileInfo } from "@/lib/pdf-utils"
import { convertPDFToImages, downloadImage, createAndDownloadZip } from "@/lib/pdf-utils"
import { addRecentFile } from "@/lib/recent-files"
import { useTranslation } from "react-i18next"

const stepsKeys = ["workspaces.convert.steps.upload", "workspaces.convert.steps.select", "workspaces.convert.steps.convert"] as const

export function ConvertPDFWorkspace() {
  const { t } = useTranslation()
  const [activeStep, setActiveStep] = useState(0)
  const [fileInfo, setFileInfo] = useState<PDFFileInfo | null>(null)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [imageFormat, setImageFormat] = useState<"png" | "jpg">("png")
  const [processing, setProcessing] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [convertedCount, setConvertedCount] = useState(0)

  const handleFileSelect = async (file: PDFFileInfo) => {
    setFileInfo(file)
    setActiveStep(1)
    setSelectedPages([])
    setSelectAll(false)
  }

  const handleSelectAll = () => {
    if (!fileInfo) return
    if (selectAll) {
      setSelectedPages([])
    } else {
      setSelectedPages(Array.from({ length: fileInfo.totalPages }, (_, i) => i + 1))
    }
    setSelectAll(!selectAll)
  }

  const handleConvert = async () => {
    if (!fileInfo || selectedPages.length === 0 || !fileInfo.pdfJsDoc) {
      setError(t("workspaces.convert.errors.noDoc"))
      return
    }

    setProcessing(true)
    setActiveStep(2)
    setProgress(0)
    setError(null)
    setConvertedCount(0)

    try {
      const totalPages = selectedPages.length
      const baseName = fileInfo.name.replace(".pdf", "")

      // Convert pages to images
      const results = await convertPDFToImages(
        fileInfo.pdfJsDoc,
        selectedPages,
        imageFormat,
        2.0 // High quality scale
      )

      setProgress(50) // Conversion complete, now preparing download

      // If multiple pages, create a ZIP file; otherwise download single image
      if (results.length > 1) {
        // Prepare images for ZIP
        const imagesForZip = results.map((result) => ({
          pageNumber: result.pageNumber,
          blob: result.blob,
          filename: `${baseName}_page_${result.pageNumber}.${imageFormat}`,
        }))

        setProgress(75)
        setConvertedCount(results.length)

        // Create and download ZIP file
        const zipFilename = `${baseName}_pages.zip`
        await createAndDownloadZip(imagesForZip, zipFilename)

        setProgress(100)
      } else {
        // Single image - download directly
        const result = results[0]
        const filename = `${baseName}_page_${result.pageNumber}.${imageFormat}`
        downloadImage(result.blob, filename)
        setConvertedCount(1)
        setProgress(100)
      }

      // Add to recent files
      addRecentFile(fileInfo.name, fileInfo.totalPages, fileInfo.file.size, "Convert to Images")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("workspaces.convert.errors.convertFail")
      setError(errorMessage)
      console.error("[v0] Error converting PDF:", err)
      setActiveStep(1) // Go back to selection step on error
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setActiveStep(0)
    setFileInfo(null)
    setSelectedPages([])
    setSelectAll(false)
    setProcessing(false)
    setProgress(0)
    setError(null)
    setConvertedCount(0)
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
              backgroundColor: "rgba(255, 152, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ImageIcon sx={{ fontSize: 28, color: "warning.main" }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 0.5 }}>
              {t("workspaces.convert.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("workspaces.convert.subtitle")}
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

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {processing && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              {t("workspaces.convert.progress", { progress, done: convertedCount, total: selectedPages.length })}
            </Typography>
          </Box>
        )}

        {activeStep === 0 && (
          <Box>
            <PDFUpload onFileSelect={handleFileSelect} />
          </Box>
        )}

        {activeStep === 1 && fileInfo && (
          <Box>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <FormControl>
                <FormLabel>{t("workspaces.convert.imageFormat.label")}</FormLabel>
                <RadioGroup row value={imageFormat} onChange={(e) => setImageFormat(e.target.value as "png" | "jpg")}>
                  <FormControlLabel value="png" control={<Radio />} label={t("workspaces.convert.imageFormat.png")} />
                  <FormControlLabel value="jpg" control={<Radio />} label={t("workspaces.convert.imageFormat.jpg")} />
                </RadioGroup>
              </FormControl>
            </Stack>

            <Box sx={{ mb: 3 }}>
              <PDFPageSelector
                fileInfo={fileInfo}
                selectedPages={selectedPages}
                onSelectionChange={setSelectedPages}
                multiSelect={true}
              />
            </Box>

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
                {t("workspaces.convert.cancel")}
              </Button>
              <Button
                variant="contained"
                onClick={handleConvert}
                disabled={selectedPages.length === 0}
                startIcon={<DownloadIcon />}
                sx={{ flex: { sm: 1 }, minWidth: 140, width: { xs: "100%", sm: "auto" } }}
              >
                {t("workspaces.convert.convertButton", { count: selectedPages.length, plural: selectedPages.length !== 1 ? "s" : "" })}
              </Button>
            </Stack>
          </Box>
        )}
        {activeStep === 2 && (
          <Box>
            {processing ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t("workspaces.convert.convertingTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("workspaces.convert.convertingBody")}
                </Typography>
              </Box>
            ) : (
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
                <Alert severity="success" sx={{ mb: 3 }}>
                  {t("workspaces.convert.successAlert", {
                    count: selectedPages.length,
                    plural: selectedPages.length !== 1 ? "s" : "",
                    format: imageFormat.toUpperCase(),
                  })}{" "}
                  {selectedPages.length > 1 ? t("workspaces.convert.successZip") : t("workspaces.convert.successSingle")}
                </Alert>
                <Button variant="contained" onClick={handleReset} startIcon={<CloudUploadIcon />}>
                  {t("workspaces.convert.convertAnother")}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
  </Box>
  )
}
