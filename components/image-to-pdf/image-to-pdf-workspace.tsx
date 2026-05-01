"use client"

import { useState, useEffect, useRef } from "react"
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
  Slider,
  Grid,
} from "@mui/material"
import DownloadIcon from "@mui/icons-material/Download"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import { ImageUpload } from "@/components/image-to-pdf/image-upload"
import { jsPDF } from "jspdf"
import { buildTuPDFFilename } from "@/lib/pdf-utils"
import Cropper, { ReactCropperElement } from "react-cropper"
import "cropperjs/dist/cropper.css"
import { useTranslation } from "react-i18next"

const stepsKeys = ["workspaces.imageToPdf.steps.upload", "workspaces.imageToPdf.steps.edit", "workspaces.imageToPdf.steps.convert"] as const

export function ImageToPdfWorkspace() {
  const { t } = useTranslation()
  const [activeStep, setActiveStep] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  
  // Settings
  const [pageSize, setPageSize] = useState<"fit" | "a4" | "letter">("fit")
  const [imageFit, setImageFit] = useState<"contain" | "cover">("contain")
  const [brightness, setBrightness] = useState<number>(100)
  const [contrast, setContrast] = useState<number>(100)
  
  // Crop & Zoom State per image
  const [cropData, setCropData] = useState<Record<number, any>>({})
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const cropperRef = useRef<ReactCropperElement>(null)
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(0)

  // Progress state
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [convertedCount, setConvertedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(urls)
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [files])

  useEffect(() => {
    if (cropperRef.current && cropperRef.current.cropper) {
      const targetAspect = pageSize !== "fit" && imageFit === "cover"
        ? (pageSize === "a4" ? 595.28 / 841.89 : 612 / 792)
        : NaN;
      cropperRef.current.cropper.setAspectRatio(targetAspect);
    }
  }, [pageSize, imageFit, selectedPreviewIndex]);

  const handleFilesSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
    setActiveStep(1)
  }

  const handleConvert = async () => {
    if (files.length === 0) {
      setError(t("workspaces.imageToPdf.errors.noImages"))
      return
    }

    setProcessing(true)
    setActiveStep(2)
    setProgress(0)
    setError(null)
    setConvertedCount(0)

    try {
      let doc: jsPDF | null = null;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 1. Load file as DataURL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // 2. Load into Image
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = dataUrl;
        });

        // 3. Draw on Canvas with Filters and Crop
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");

        let cropArea = cropData[i]?.crop;
        if (i === selectedPreviewIndex && cropperRef.current) {
          cropArea = cropperRef.current.cropper.getData();
        }

        if (cropArea) {
          canvas.width = cropArea.width;
          canvas.height = cropArea.height;
          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
          ctx.drawImage(img, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, cropArea.width, cropArea.height);
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }

        // 4. Extract Base64
        const editedImgData = canvas.toDataURL("image/jpeg", 0.9);

        // 5. PDF Dimension Math
        const finalImgWidth = canvas.width;
        const finalImgHeight = canvas.height;
        let pdfWidth: number, pdfHeight: number;

        if (pageSize === "fit") {
          pdfWidth = finalImgWidth;
          pdfHeight = finalImgHeight;
        } else {
          // pt units
          if (pageSize === "a4") {
            pdfWidth = 595.28;
            pdfHeight = 841.89;
          } else { // letter
            pdfWidth = 612;
            pdfHeight = 792;
          }
        }

        const orientation = pdfWidth > pdfHeight ? "landscape" : "portrait";

        // 6. Initialize or Add Page to PDF
        if (i === 0) {
          doc = new jsPDF({
            orientation,
            unit: "pt",
            format: [pdfWidth, pdfHeight]
          });
        } else {
          doc!.addPage([pdfWidth, pdfHeight], orientation);
        }

        // 7. Calculate position & dimensions
        if (pageSize === "fit") {
          doc!.addImage(editedImgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        } else {
          const imgRatio = finalImgWidth / finalImgHeight;
          const pdfRatio = pdfWidth / pdfHeight;

          let drawWidth: number, drawHeight: number, x: number, y: number;

          if (imageFit === "contain") {
            if (imgRatio > pdfRatio) {
              drawWidth = pdfWidth;
              drawHeight = pdfWidth / imgRatio;
            } else {
              drawHeight = pdfHeight;
              drawWidth = pdfHeight * imgRatio;
            }
          } else { // cover
            if (imgRatio > pdfRatio) {
              drawHeight = pdfHeight;
              drawWidth = pdfHeight * imgRatio;
            } else {
              drawWidth = pdfWidth;
              drawHeight = pdfWidth / imgRatio;
            }
          }

          x = (pdfWidth - drawWidth) / 2;
          y = (pdfHeight - drawHeight) / 2;

          doc!.addImage(editedImgData, 'JPEG', x, y, drawWidth, drawHeight);
        }

        // Update progress
        const currentProgress = Math.round(((i + 1) / files.length) * 100);
        setProgress(currentProgress);
        setConvertedCount(i + 1);
      }

      if (doc) {
        const firstName = files[0].name;
        const filename = buildTuPDFFilename(firstName, "images-converted");
        doc.save(filename);
      }
      
      setProgress(100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("workspaces.imageToPdf.errors.convertFail");
      setError(errorMessage);
      console.error("[TuPDF] Error converting images to PDF:", err);
      setActiveStep(1);
    } finally {
      setProcessing(false);
    }
  }

  const handleReset = () => {
    setActiveStep(0)
    setFiles([])
    setProcessing(false)
    setProgress(0)
    setError(null)
    setConvertedCount(0)
    setBrightness(100)
    setContrast(100)
    setCropData({})
    setZoomLevel(1)
    setSelectedPreviewIndex(0)
    setPageSize("fit")
    setImageFit("contain")
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2.5,
              backgroundColor: "rgba(0, 150, 136, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PictureAsPdfIcon sx={{ fontSize: 28, color: "#009688" }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 0.5 }}>
              {t("workspaces.imageToPdf.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("workspaces.imageToPdf.subtitle")}
            </Typography>
          </Box>
        </Box>
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
              {t("workspaces.imageToPdf.progress", { progress, done: convertedCount, total: files.length })}
            </Typography>
          </Box>
        )}

        {activeStep === 0 && (
          <Box>
            <ImageUpload onFilesSelected={handleFilesSelect} />
          </Box>
        )}

        {activeStep === 1 && files.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>{t("workspaces.imageToPdf.settings.title")}</Typography>
            
            <Box sx={{ mb: 4 }}>
              <Box 
                sx={{ 
                  width: "100%", 
                  height: 400, 
                  bgcolor: "rgba(0,0,0,0.8)", 
                  borderRadius: 2, 
                  mb: 2,
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  "& .cropper-container": {
                     filter: `brightness(${brightness}%) contrast(${contrast}%)`
                  }
                }}
              >
                <Cropper
                  key={selectedPreviewIndex}
                  src={previewUrls[selectedPreviewIndex]}
                  style={{ height: "100%", width: "100%" }}
                  initialAspectRatio={NaN}
                  aspectRatio={
                    pageSize !== "fit" && imageFit === "cover"
                      ? pageSize === "a4" ? 595.28 / 841.89 : 612 / 792
                      : NaN
                  }
                  guides={true}
                  ref={cropperRef}
                  viewMode={1}
                  background={false}
                  responsive={true}
                  autoCropArea={1}
                  checkOrientation={false}
                  onInitialized={(instance) => {
                     setZoomLevel(1);
                  }}
                  ready={(e) => {
                     const cropper = e.currentTarget.cropper;
                     if (cropData[selectedPreviewIndex]) {
                       cropper.setCanvasData(cropData[selectedPreviewIndex].canvas);
                       cropper.setData(cropData[selectedPreviewIndex].crop);
                     }
                  }}
                  zoom={(e) => {
                     setZoomLevel(e.detail.ratio);
                  }}
                />
              </Box>

              <Box sx={{ px: 2, mb: 2 }}>
                <Typography id="zoom-slider" variant="caption" color="text.secondary" gutterBottom>
                  Zoom Image ({Math.round(zoomLevel * 100)}%)
                </Typography>
                <Slider
                  value={zoomLevel}
                  onChange={(_, val) => {
                    setZoomLevel(val as number);
                    cropperRef.current?.cropper.zoomTo(val as number);
                  }}
                  min={0.1}
                  max={3}
                  step={0.1}
                  aria-labelledby="zoom-slider"
                  size="small"
                />
              </Box>

              <Box sx={{ overflowX: "auto", pb: 2 }}>
                <Stack direction="row" spacing={2}>
                  {previewUrls.map((url, i) => (
                    <Box
                      key={i}
                      onClick={() => {
                        if (cropperRef.current) {
                          setCropData(p => ({
                            ...p,
                            [selectedPreviewIndex]: {
                              crop: cropperRef.current!.cropper.getData(),
                              canvas: cropperRef.current!.cropper.getCanvasData()
                            }
                          }));
                        }
                        setSelectedPreviewIndex(i);
                      }}
                      sx={{
                        width: 80,
                        height: 80,
                        flexShrink: 0,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: "2px solid",
                        borderColor: selectedPreviewIndex === i ? "primary.main" : "divider",
                        bgcolor: "background.paper",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        opacity: selectedPreviewIndex === i ? 1 : 0.6,
                        "&:hover": { opacity: 1 }
                      }}
                    >
                      <img
                        src={url}
                        alt={`Preview ${i + 1}`}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                          filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>{t("workspaces.imageToPdf.settings.filters")}</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography id="brightness-slider" gutterBottom>
                    {t("workspaces.imageToPdf.settings.brightness")} ({brightness}%)
                  </Typography>
                  <Slider
                    value={brightness}
                    onChange={(_, val) => setBrightness(val as number)}
                    aria-labelledby="brightness-slider"
                    valueLabelDisplay="auto"
                    min={0}
                    max={200}
                  />
                </Box>
                <Box>
                  <Typography id="contrast-slider" gutterBottom>
                    {t("workspaces.imageToPdf.settings.contrast")} ({contrast}%)
                  </Typography>
                  <Slider
                    value={contrast}
                    onChange={(_, val) => setContrast(val as number)}
                    aria-labelledby="contrast-slider"
                    valueLabelDisplay="auto"
                    min={0}
                    max={200}
                  />
                </Box>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>{t("workspaces.imageToPdf.settings.pageSize")}</Typography>
                <FormControl component="fieldset" sx={{ mb: 3, display: 'block' }}>
                  <RadioGroup value={pageSize} onChange={(e) => setPageSize(e.target.value as any)}>
                    <FormControlLabel value="fit" control={<Radio />} label={t("workspaces.imageToPdf.settings.fitToImage")} />
                    <FormControlLabel value="a4" control={<Radio />} label={t("workspaces.imageToPdf.settings.a4")} />
                    <FormControlLabel value="letter" control={<Radio />} label={t("workspaces.imageToPdf.settings.letter")} />
                  </RadioGroup>
                </FormControl>

                {pageSize !== "fit" && (
                  <>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>{t("workspaces.imageToPdf.settings.imageFit")}</Typography>
                    <FormControl component="fieldset" sx={{ display: 'block' }}>
                      <RadioGroup value={imageFit} onChange={(e) => setImageFit(e.target.value as any)}>
                        <FormControlLabel value="contain" control={<Radio />} label={t("workspaces.imageToPdf.settings.contain")} />
                        <FormControlLabel value="cover" control={<Radio />} label={t("workspaces.imageToPdf.settings.cover")} />
                      </RadioGroup>
                    </FormControl>
                  </>
                )}
              </Box>
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
                {t("workspaces.imageToPdf.cancel")}
              </Button>
              <Button
                variant="contained"
                onClick={handleConvert}
                disabled={files.length === 0}
                startIcon={<DownloadIcon />}
                sx={{ flex: { sm: 1 }, minWidth: 140, width: { xs: "100%", sm: "auto" } }}
              >
                {t("workspaces.imageToPdf.convertButton")}
              </Button>
            </Stack>
          </Box>
        )}
        
        {activeStep === 2 && (
          <Box>
            {processing ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {t("workspaces.imageToPdf.convertingTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("workspaces.imageToPdf.convertingBody")}
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
                  {t("workspaces.imageToPdf.successBody")}
                </Alert>
                <Button variant="contained" onClick={handleReset} startIcon={<CloudUploadIcon />}>
                  {t("workspaces.imageToPdf.convertAnother")}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  )
}
