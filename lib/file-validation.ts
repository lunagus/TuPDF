export interface ValidationResult {
  valid: boolean
  error?: string
}

export interface FileValidationOptions {
  maxSizeInMB?: number
  allowedFormats?: string[]
  checkIntegrity?: boolean
}

const DEFAULT_MAX_SIZE_MB = 100 // Increased for professional use
const DEFAULT_ALLOWED_FORMATS = ["application/pdf"]
const MIN_FILE_SIZE = 100 // Minimum 100 bytes to avoid empty files

/**
 * Validate a file before processing
 */
export function validateFile(file: File, options: FileValidationOptions = {}): ValidationResult {
  const { maxSizeInMB = DEFAULT_MAX_SIZE_MB, allowedFormats = DEFAULT_ALLOWED_FORMATS } = options

  // Check if file exists
  if (!file) {
    return { valid: false, error: "No file provided" }
  }

  // Check minimum file size
  if (file.size < MIN_FILE_SIZE) {
    return {
      valid: false,
      error: "File appears to be empty or corrupted. Minimum file size is 100 bytes.",
    }
  }

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  if (file.size > maxSizeInBytes) {
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds the ${maxSizeInMB}MB limit. Please use a smaller file or compress the PDF first.`,
    }
  }

  // Check file extension first (more reliable than MIME type)
  const extension = file.name.split(".").pop()?.toLowerCase()
  if (extension !== "pdf") {
    return {
      valid: false,
      error: `Invalid file type. Only PDF files (.pdf) are supported. Received: ${extension ? `.${extension}` : "unknown extension"}`,
    }
  }

  // Check file format (MIME type)
  // Some browsers may not set MIME type correctly, so we're lenient here
  if (file.type && !allowedFormats.includes(file.type) && file.type !== "application/octet-stream") {
    // Warn but don't fail if extension is correct
    console.warn(`Unexpected MIME type: ${file.type}, but extension is .pdf`)
  }

  return { valid: true }
}

/**
 * Validate PDF integrity by checking header and structure
 */
export async function validatePDFIntegrity(arrayBuffer: ArrayBuffer): Promise<ValidationResult> {
  try {
    if (arrayBuffer.byteLength < 8) {
      return {
        valid: false,
        error: "File is too small to be a valid PDF file",
      }
    }

    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Check PDF header (should start with %PDF-)
    const header = String.fromCharCode(...uint8Array.slice(0, 5))
    if (!header.startsWith("%PDF-")) {
      return {
        valid: false,
        error: "Invalid PDF file: File does not appear to be a valid PDF. Missing PDF header signature.",
      }
    }

    // Check for PDF version (should be after header, e.g., %PDF-1.4)
    const versionMatch = header.match(/%PDF-(\d+\.\d+)/)
    if (!versionMatch) {
      // Still valid, but warn
      console.warn("Could not determine PDF version from header")
    }

    // Check for EOF marker (PDFs should end with %%EOF)
    const endBytes = uint8Array.slice(-1024) // Check last 1KB
    const endString = String.fromCharCode(...endBytes)
    if (!endString.includes("%%EOF")) {
      // Not necessarily invalid, but could indicate corruption
      console.warn("PDF may be incomplete or corrupted (EOF marker not found)")
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: `Failed to validate PDF integrity: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

/**
 * Check if PDF is encrypted
 */
export function isPDFEncrypted(arrayBuffer: ArrayBuffer): boolean {
  try {
    const uint8Array = new Uint8Array(arrayBuffer)
    const content = String.fromCharCode(...uint8Array)
    return content.includes("/Encrypt")
  } catch {
    return false
  }
}
