/**
 * Centralized error handling utilities
 */

export interface AppError {
  message: string
  code?: string
  recoverable?: boolean
  action?: string
}

/**
 * Parse and format errors for user display
 */
export function formatError(error: unknown): AppError {
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes("password") || error.message.includes("encrypted")) {
      return {
        message: "This PDF is password-protected. Please enter the password in Settings.",
        code: "ENCRYPTED_PDF",
        recoverable: true,
        action: "Go to Settings",
      }
    }

    if (error.message.includes("size") || error.message.includes("too large")) {
      return {
        message: error.message,
        code: "FILE_TOO_LARGE",
        recoverable: true,
        action: "Try a smaller file or compress it first",
      }
    }

    if (error.message.includes("corrupted") || error.message.includes("invalid")) {
      return {
        message: "The PDF file appears to be corrupted or invalid. Please try a different file.",
        code: "CORRUPTED_PDF",
        recoverable: true,
        action: "Try another file",
      }
    }

    if (error.message.includes("network") || error.message.includes("fetch")) {
      return {
        message: "Network error occurred. Please check your connection and try again.",
        code: "NETWORK_ERROR",
        recoverable: true,
        action: "Retry",
      }
    }

    // Generic error
    return {
      message: error.message || "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      recoverable: false,
    }
  }

  if (typeof error === "string") {
    return {
      message: error,
      code: "STRING_ERROR",
      recoverable: false,
    }
  }

  return {
    message: "An unexpected error occurred. Please try again.",
    code: "UNKNOWN_ERROR",
    recoverable: false,
  }
}

/**
 * Log error for debugging (in production, this could send to error tracking service)
 */
export function logError(error: unknown, context?: string) {
  const errorInfo = formatError(error)
  console.error(`[TuPDF]${context ? ` [${context}]` : ""}`, {
    message: errorInfo.message,
    code: errorInfo.code,
    originalError: error,
  })
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  return formatError(error).recoverable ?? false
}

