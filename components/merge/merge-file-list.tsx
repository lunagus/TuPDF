"use client"

import React from "react"

import { Box, Paper, Typography, IconButton, Stack, Chip } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import DescriptionIcon from "@mui/icons-material/Description"
import type { PDFFileInfo } from "@/lib/pdf-utils"
import { useTranslation } from "react-i18next"

interface MergeFileListProps {
  files: PDFFileInfo[]
  onRemove: (index: number) => void
  onReorder: (files: PDFFileInfo[]) => void
}

export function MergeFileList({ files, onRemove, onReorder }: MergeFileListProps) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const { t } = useTranslation()

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newFiles = [...files]
    const draggedFile = newFiles[draggedIndex]
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedFile)

    setDraggedIndex(index)
    onReorder(newFiles)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newFiles = [...files]
    ;[newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]]
    onReorder(newFiles)
  }

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return
    const newFiles = [...files]
    ;[newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]]
    onReorder(newFiles)
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
        {t("workspaces.merge.filesTitle", "Files to Merge ({{count}})", { count: files.length })}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t(
          "workspaces.merge.filesHelp",
          "Drag to reorder or use the arrows. Files will be merged in this order."
        )}
      </Typography>

      <Stack spacing={2}>
        {files.map((file, index) => (
          <Paper
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              transition: "all 0.2s",
              opacity: draggedIndex === index ? 0.5 : 1,
              cursor: "move",
              "&:hover": {
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
              },
            }}
          >
            <Box
              sx={{
                cursor: "grab",
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
                "&:active": {
                  cursor: "grabbing",
                },
              }}
            >
              <DragIndicatorIcon />
            </Box>

            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                backgroundColor: "rgba(63, 81, 181, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <DescriptionIcon sx={{ fontSize: 24, color: "primary.main" }} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" fontWeight={600} noWrap>
                {file.name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Chip
                  label={t("common.pages", "{{count}} pages", { count: file.totalPages })}
                  size="small"
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                sx={{
                  "&:disabled": {
                    opacity: 0.3,
                  },
                }}
              >
                <Typography variant="body2">↑</Typography>
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleMoveDown(index)}
                disabled={index === files.length - 1}
                sx={{
                  "&:disabled": {
                    opacity: 0.3,
                  },
                }}
              >
                <Typography variant="body2">↓</Typography>
              </IconButton>
              <IconButton size="small" onClick={() => onRemove(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}
