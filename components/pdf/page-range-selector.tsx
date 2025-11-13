"use client"

import { useState } from "react"
import { Box, TextField, Typography, Alert, Stack, Chip } from "@mui/material"

interface PageRangeSelectorProps {
  totalPages: number
  onRangeChange: (startPage: number, endPage: number, isValid: boolean) => void
}

export function PageRangeSelector({ totalPages, onRangeChange }: PageRangeSelectorProps) {
  const [startPage, setStartPage] = useState<string>("1")
  const [endPage, setEndPage] = useState<string>(totalPages.toString())
  const [error, setError] = useState<string>("")

  const validateRange = (start: string, end: string) => {
    const startNum = Number.parseInt(start)
    const endNum = Number.parseInt(end)

    // Check if inputs are valid numbers
    if (isNaN(startNum) || isNaN(endNum)) {
      setError("Please enter valid page numbers")
      onRangeChange(0, 0, false)
      return
    }

    // Check if pages are within bounds
    if (startNum < 1 || startNum > totalPages) {
      setError(`Start page must be between 1 and ${totalPages}`)
      onRangeChange(0, 0, false)
      return
    }

    if (endNum < 1 || endNum > totalPages) {
      setError(`End page must be between 1 and ${totalPages}`)
      onRangeChange(0, 0, false)
      return
    }

    // Check if start is before or equal to end
    if (startNum > endNum) {
      setError("Start page must be less than or equal to end page")
      onRangeChange(0, 0, false)
      return
    }

    // Valid range
    setError("")
    onRangeChange(startNum, endNum, true)
  }

  const handleStartChange = (value: string) => {
    setStartPage(value)
    validateRange(value, endPage)
  }

  const handleEndChange = (value: string) => {
    setEndPage(value)
    validateRange(startPage, value)
  }

  const selectedCount =
    error === "" && startPage && endPage ? Number.parseInt(endPage) - Number.parseInt(startPage) + 1 : 0

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
        Select Page Range
      </Typography>

      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
        <TextField
          label="Start Page"
          type="number"
          value={startPage}
          onChange={(e) => handleStartChange(e.target.value)}
          inputProps={{ min: 1, max: totalPages }}
          size="small"
          fullWidth
          error={!!error}
        />
        <Typography variant="h6" sx={{ pt: 1 }}>
          -
        </Typography>
        <TextField
          label="End Page"
          type="number"
          value={endPage}
          onChange={(e) => handleEndChange(e.target.value)}
          inputProps={{ min: 1, max: totalPages }}
          size="small"
          fullWidth
          error={!!error}
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!error && selectedCount > 0 && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={`${selectedCount} page${selectedCount > 1 ? "s" : ""} selected (${startPage}-${endPage})`}
            color="primary"
            variant="outlined"
          />
        </Box>
      )}

      <Typography variant="caption" color="text.secondary">
        Total pages available: {totalPages}
      </Typography>
    </Box>
  )
}
