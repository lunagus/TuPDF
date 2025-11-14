"use client"

import { useMemo, useState } from "react"
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
  Tabs,
  Tab,
  Chip,
} from "@mui/material"
import ReorderIcon from "@mui/icons-material/Reorder"
import DownloadIcon from "@mui/icons-material/Download"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import { PDFUpload } from "@/components/pdf/pdf-upload"
import { OrganizePageGrid } from "@/components/organize/organize-page-grid"
import type { PDFFileInfo, PDFPageInfo } from "@/lib/pdf-utils"
import { downloadPDF, buildTuPDFFilename, mergePagesFromFiles } from "@/lib/pdf-utils"
import { useTranslation } from "react-i18next"

const stepsKeys = [
  "workspaces.organize.steps.upload",
  "workspaces.organize.steps.organize",
  "workspaces.organize.steps.save",
] as const

type OrganizePage = PDFPageInfo & { sourceIndex: number }

export function OrganizePDFWorkspace() {
  const { t } = useTranslation()
  const [activeStep, setActiveStep] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<PDFFileInfo[]>([])
  const [organizedPages, setOrganizedPages] = useState<OrganizePage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [activeSourceFilter, setActiveSourceFilter] = useState<number | "all">("all")

  const handleFileLoaded = (fileInfo: PDFFileInfo) => {
    setUploadedFiles((prev) => {
      const next = [...prev, fileInfo]
      const combinedPages: OrganizePage[] = []

      next.forEach((file, sourceIndex) => {
        file.pages.forEach((page) => {
          combinedPages.push({ ...page, sourceIndex })
        })
      })

      setOrganizedPages(combinedPages)
      return next
    })

    setActiveStep(1)
  }

  const handleReorderPages = (newOrder: OrganizePage[]) => {
    setOrganizedPages(newOrder)
  }

  const handleDeletePage = (sourceIndex: number, pageNumber: number) => {
    setOrganizedPages((prev) => prev.filter((page) => !(page.sourceIndex === sourceIndex && page.pageNumber === pageNumber)))
  }

  const visiblePages = useMemo(() => {
    if (activeSourceFilter === "all") {
      return organizedPages
    }
    return organizedPages.filter((page) => page.sourceIndex === activeSourceFilter)
  }, [organizedPages, activeSourceFilter])

  const handleSave = async () => {
    if (uploadedFiles.length === 0 || organizedPages.length === 0) {
      setError(t("validation.organize.noPages", "No pages to save"))
      return
    }

    setIsProcessing(true)
    setError(null)
    setProgress(0)

    try {
      setProgress(30)
      const orderedPages = organizedPages.map((page) => ({
        sourceIndex: page.sourceIndex,
        pageNumber: page.pageNumber,
      }))
      setProgress(60)
      const mergedBytes = await mergePagesFromFiles(uploadedFiles, orderedPages)
      setProgress(90)

      const firstName = uploadedFiles[0].name
      const filename = buildTuPDFFilename(firstName, "organized")
      downloadPDF(mergedBytes, filename)

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
    setUploadedFiles([])
    setOrganizedPages([])
    setError(null)
    setProgress(0)
    setActiveSourceFilter("all")
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

      <Paper
        sx={{
          p: { xs: 2.5, sm: 3, md: 4 },
          mb: 3,
          display: "flex",
          flexDirection: "column",
          height: activeStep === 0 ? "auto" : { xs: "auto", md: "calc(100vh - 210px)" },
          maxHeight: activeStep === 0 ? "none" : { md: "calc(100vh - 210px)" },
        }}
      >
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

        {activeStep === 0 && <PDFUpload onFileSelect={handleFileLoaded} multiple />}

        {activeStep === 1 && uploadedFiles.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              {t("workspaces.organize.info")}
            </Alert>

            <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
              <Tabs
                value={activeSourceFilter === "all" ? "all" : activeSourceFilter}
                onChange={(_e, value) => setActiveSourceFilter(value)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2">{t("workspaces.organize.allFiles", "All files")}</Typography>
                      <Chip
                        label={organizedPages.length}
                        size="small"
                        color="primary"
                        sx={{ height: 20 }}
                      />
                    </Stack>
                  }
                  value="all"
                />
                {uploadedFiles.map((file, index) => (
                  <Tab
                    key={file.name + index}
                    value={index}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                          {file.name.replace(/\.pdf$/i, "")}
                        </Typography>
                        <Chip
                          label={file.totalPages}
                          size="small"
                          sx={{ height: 20 }}
                        />
                      </Stack>
                    }
                  />
                ))}
              </Tabs>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", pr: 0.5 }}>
              <OrganizePageGrid
                pages={visiblePages}
                onReorder={handleReorderPages}
                onDelete={handleDeletePage}
                sourceLabels={uploadedFiles.map((f) => f.name.replace(/\.pdf$/i, ""))}
              />
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                mt: 3,
                pt: 3,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setActiveStep(0)}
                sx={{ minWidth: 140, width: { xs: "100%", sm: "auto" } }}
              >
                {t("workspaces.merge.addAnother")}
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleReset}
                sx={{ minWidth: 100, width: { xs: "100%", sm: "auto" } }}
              >
                {t("workspaces.organize.cancel")}
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleSave}
                disabled={isProcessing || organizedPages.length === 0}
                sx={{ flex: { sm: 1 }, minWidth: 140, width: { xs: "100%", sm: "auto" } }}
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
