import { PDFDocument } from "pdf-lib"
import { validateFile, validatePDFIntegrity, isPDFEncrypted } from "./file-validation"

let pdfjsLib: any = null

async function ensurePDFJSLoaded() {
  if (!pdfjsLib) {
    const module = await import("pdfjs-dist")
    pdfjsLib = module.default || module
    
    // Use the worker from the installed package instead of CDN
    if (pdfjsLib.GlobalWorkerOptions && typeof window !== "undefined") {
      // Prefer local worker file from public folder (works offline, no network issues)
      // The worker file should be copied to public/pdf.worker.min.mjs
      const version = pdfjsLib.version || "5.4.394"
      const localWorkerPath = "/pdf.worker.min.mjs"
      
      // Use local worker file - it's already copied to public folder
      // This avoids network errors and version mismatches
      pdfjsLib.GlobalWorkerOptions.workerSrc = localWorkerPath
    }
  }
  return pdfjsLib
}

// Initialize on client side
if (typeof window !== "undefined") {
  ensurePDFJSLoaded().catch(console.error)
}

export interface PDFPageInfo {
  pageNumber: number
  thumbnail: string
  width: number
  height: number
}

export interface PDFFileInfo {
  file: File
  name: string
  pages: PDFPageInfo[]
  totalPages: number
  pdfDoc: PDFDocument
  pdfJsDoc?: any // Store PDF.js document for image conversion
  arrayBuffer?: ArrayBuffer // Store original buffer for PDF.js operations
}

/**
 * Load a PDF file and extract page information with validation
 */
export async function loadPDFFile(file: File, password?: string): Promise<PDFFileInfo> {
  const pdfjs = await ensurePDFJSLoaded()

  // Validate file first
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const arrayBuffer = await file.arrayBuffer()

  // Check integrity
  const integrityCheck = await validatePDFIntegrity(arrayBuffer)
  if (!integrityCheck.valid) {
    throw new Error(integrityCheck.error)
  }

  // Check if encrypted
  const encrypted = isPDFEncrypted(arrayBuffer)
  if (encrypted && !password) {
    throw new Error("PDF is encrypted. Please provide a password in Settings.")
  }

  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: !!password })
    const pages = pdfDoc.getPages()

    const pageInfos: PDFPageInfo[] = []

    if (!pdfjs?.getDocument) {
      throw new Error("PDF.js getDocument function not available")
    }

    const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
    const pdfJsDoc = await loadingTask.promise

    // Generate thumbnails with progress tracking for large PDFs
    const totalPages = pages.length
    const batchSize = totalPages > 50 ? 10 : totalPages // Process in batches for large PDFs
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      const { width, height } = page.getSize()

      // Generate thumbnail for this page (lazy load for better performance)
      // For very large PDFs, we can defer thumbnail generation
      const thumbnail = totalPages > 100 
        ? "" // Defer thumbnail generation for very large PDFs
        : await generatePageThumbnail(pdfJsDoc, i + 1, "small")

      pageInfos.push({
        pageNumber: i + 1,
        thumbnail,
        width,
        height,
      })

      // Yield to browser for large PDFs to prevent UI freezing
      if (i > 0 && i % batchSize === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }

    return {
      file,
      name: file.name,
      pages: pageInfos,
      totalPages: pages.length,
      pdfDoc,
      pdfJsDoc, // Store for image conversion
      arrayBuffer, // Store for PDF.js operations
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("password") || error.message.includes("encrypted")) {
        throw new Error("Failed to decrypt PDF. Please check your password in Settings.")
      }
      throw new Error(`Failed to load PDF: ${error.message}`)
    }
    throw new Error("Failed to load PDF file")
  }
}

/**
 * Generate thumbnail for a PDF page using canvas
 */
async function generatePageThumbnail(
  pdfDoc: any,
  pageNumber: number,
  size: "small" | "large" = "large",
): Promise<string> {
  try {
    const scale = size === "small" ? 0.3 : 0.5
    const page = await pdfDoc.getPage(pageNumber)
    const viewport = page.getViewport({ scale })

    // Create canvas
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("Failed to get canvas context")
    }

    canvas.height = viewport.height
    canvas.width = viewport.width

    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    }

    await page.render(renderContext).promise

    // Convert canvas to data URL
    return canvas.toDataURL(size === "small" ? "image/jpeg" : "image/png", size === "small" ? 0.7 : 0.92)
  } catch (error) {
    console.error(`Failed to generate thumbnail for page ${pageNumber}:`, error)
    return `/placeholder.svg?height=200&width=150&query=PDF page ${pageNumber}`
  }
}

/**
 * Split PDF into separate files
 */
export async function splitPDF(pdfDoc: PDFDocument, pageRanges: number[][]): Promise<Uint8Array[]> {
  const results: Uint8Array[] = []

  for (const range of pageRanges) {
    const newPdf = await PDFDocument.create()
    const copiedPages = await newPdf.copyPages(
      pdfDoc,
      range.map((p) => p - 1), // Convert to 0-indexed
    )

    copiedPages.forEach((page: any) => {
      newPdf.addPage(page)
    })

    const pdfBytes = await newPdf.save()
    results.push(pdfBytes)
  }

  return results
}

/**
 * Merge multiple PDFs into one
 */
export async function mergePDFs(pdfDocs: PDFDocument[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create()

  for (const pdfDoc of pdfDocs) {
    const pageCount = pdfDoc.getPageCount()
    const copiedPages = await mergedPdf.copyPages(
      pdfDoc,
      Array.from({ length: pageCount }, (_, i) => i),
    )

    copiedPages.forEach((page: any) => {
      mergedPdf.addPage(page)
    })
  }

  const pdfBytes = await mergedPdf.save()
  return pdfBytes
}

/**
 * Reorder pages in a PDF
 */
export async function reorderPages(pdfDoc: PDFDocument, newOrder: number[]): Promise<Uint8Array> {
  const newPdf = await PDFDocument.create()
  const copiedPages = await newPdf.copyPages(
    pdfDoc,
    newOrder.map((p) => p - 1), // Convert to 0-indexed
  )

  copiedPages.forEach((page: any, _index: number) => {
    newPdf.addPage(page)
  })

  const pdfBytes = await newPdf.save()
  return pdfBytes
}

/**
 * Rotate pages in a PDF
 */
export async function rotatePages(pdfDoc: PDFDocument, rotations: Record<number, number>): Promise<Uint8Array> {
  const newPdf = await PDFDocument.create()
  const pageCount = pdfDoc.getPageCount()
  const copiedPages = await newPdf.copyPages(
    pdfDoc,
    Array.from({ length: pageCount }, (_, i) => i),
  )

  copiedPages.forEach((page: any, index: number) => {
    const rotation = rotations[index + 1] || 0
    page.setRotation({ angle: rotation, type: 0 })
    newPdf.addPage(page)
  })

  const pdfBytes = await newPdf.save()
  return pdfBytes
}

/**
 * Convert PDF pages to images using PDF.js
 */
export async function convertPDFToImages(
  pdfJsDoc: any,
  pageNumbers: number[],
  format: "png" | "jpg" = "png",
  scale: number = 2.0, // Higher scale for better quality
): Promise<{ pageNumber: number; dataUrl: string; blob: Blob }[]> {
  if (!pdfJsDoc) {
    throw new Error("PDF.js document not available. Please reload the PDF.")
  }

  const pdfjs = await ensurePDFJSLoaded()
  if (!pdfjs?.getDocument) {
    throw new Error("PDF.js not properly loaded")
  }

  const results: { pageNumber: number; dataUrl: string; blob: Blob }[] = []

  for (const pageNumber of pageNumbers) {
    try {
      const page = await pdfJsDoc.getPage(pageNumber)
      const viewport = page.getViewport({ scale })

      // Create canvas
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      if (!context) {
        throw new Error("Failed to get canvas context")
      }

      canvas.height = viewport.height
      canvas.width = viewport.width

      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      await page.render(renderContext).promise

      // Convert canvas to blob and data URL
      const mimeType = format === "png" ? "image/png" : "image/jpeg"
      const quality = format === "jpg" ? 0.92 : undefined

      const dataUrl = canvas.toDataURL(mimeType, quality)
      
      // Also create blob for download
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to create blob"))
            }
          },
          mimeType,
          quality
        )
      })

      results.push({
        pageNumber,
        dataUrl,
        blob,
      })
    } catch (error) {
      console.error(`Failed to convert page ${pageNumber}:`, error)
      throw new Error(`Failed to convert page ${pageNumber}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return results
}

/**
 * Download an image blob
 */
export function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Create a ZIP file from multiple image blobs and download it
 */
export async function createAndDownloadZip(
  images: { pageNumber: number; blob: Blob; filename: string }[],
  zipFilename: string
): Promise<void> {
  const JSZip = (await import("jszip")).default
  const zip = new JSZip()

  // Add all images to the ZIP file
  for (const image of images) {
    zip.file(image.filename, image.blob)
  }

  // Generate ZIP file
  const zipBlob = await zip.generateAsync({ type: "blob" })

  // Download the ZIP file
  const url = URL.createObjectURL(zipBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = zipFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Download a PDF file
 */
export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  // Convert Uint8Array to ArrayBuffer for Blob compatibility
  const buffer = pdfBytes.buffer.slice(
    pdfBytes.byteOffset,
    pdfBytes.byteOffset + pdfBytes.byteLength
  )
  const blob = new Blob([buffer], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Optimize PDF by compressing and removing metadata
 */
export async function optimizePDF(
  pdfDoc: PDFDocument,
  quality: "low" | "medium" | "high" = "medium",
): Promise<Uint8Array> {
  // Remove metadata for smaller file size
  pdfDoc.setTitle("")
  pdfDoc.setAuthor("")
  pdfDoc.setSubject("")
  pdfDoc.setKeywords([])
  pdfDoc.setProducer("")
  pdfDoc.setCreator("")

  // Compression settings based on quality
  const compressionOptions = {
    low: { useObjectStreams: true, compress: true, objectsPerTick: 50 },
    medium: { useObjectStreams: true, compress: true, objectsPerTick: 20 },
    high: { useObjectStreams: false, compress: false, objectsPerTick: 10 },
  }

  const options = compressionOptions[quality]

  const optimizedPdf = await pdfDoc.save({
    ...options,
    addDefaultPage: false,
  })

  return optimizedPdf
}
