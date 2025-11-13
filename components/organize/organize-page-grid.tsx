"use client"

import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Stack,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import ViewModuleIcon from "@mui/icons-material/ViewModule"
import ViewComfyIcon from "@mui/icons-material/ViewComfy"
import ViewListIcon from "@mui/icons-material/ViewList"
import type { PDFPageInfo } from "@/lib/pdf-utils"
import React from "react"

interface OrganizePageGridProps {
  pages: PDFPageInfo[]
  onReorder: (pages: PDFPageInfo[]) => void
  onDelete: (pageNumber: number) => void
}

type ViewMode = "small" | "large" | "list"

export function OrganizePageGrid({ pages, onReorder, onDelete }: OrganizePageGridProps) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [viewMode, setViewMode] = React.useState<ViewMode>("small")

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newPages = [...pages]
    const draggedPage = newPages[draggedIndex]
    newPages.splice(draggedIndex, 1)
    newPages.splice(index, 0, draggedPage)

    setDraggedIndex(index)
    onReorder(newPages)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleMoveLeft = (index: number) => {
    if (index === 0) return
    const newPages = [...pages]
    ;[newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]]
    onReorder(newPages)
  }

  const handleMoveRight = (index: number) => {
    if (index === pages.length - 1) return
    const newPages = [...pages]
    ;[newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]]
    onReorder(newPages)
  }

  const gridColumns = {
    small: { xs: 6, sm: 4, md: 3, lg: 2 },
    large: { xs: 12, sm: 6, md: 4, lg: 3 },
  }

  const thumbnailSize = {
    small: { width: "100%", aspectRatio: "3/4", maxHeight: "120px" },
    large: { width: "100%", aspectRatio: "3/4" },
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6" fontWeight={600}>
            Pages
          </Typography>
          <Chip label={`${pages.length} pages`} color="primary" />
        </Stack>
        <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewModeChange} size="small">
          <ToggleButton value="small" aria-label="small thumbnails">
            <Tooltip title="Small thumbnails">
              <ViewModuleIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="large" aria-label="large thumbnails">
            <Tooltip title="Large thumbnails">
              <ViewComfyIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <Tooltip title="List view">
              <ViewListIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Drag pages to reorder them or click the delete button to remove pages. Changes will be saved when you click
        &quot;Save PDF&quot;.
      </Typography>

      {viewMode === "list" ? (
        <List>
          {pages.map((page, index) => (
            <ListItem
              key={`${page.pageNumber}-${index}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              sx={{
                border: "2px solid",
                borderColor: "divider",
                borderRadius: 1,
                mb: 1,
                cursor: "move",
                transition: "all 0.2s",
                opacity: draggedIndex === index ? 0.5 : 1,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <IconButton edge="end" size="small" onClick={() => handleMoveLeft(index)} disabled={index === 0}>
                    ←
                  </IconButton>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleMoveRight(index)}
                    disabled={index === pages.length - 1}
                  >
                    →
                  </IconButton>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onDelete(page.pageNumber)}
                    sx={{
                      "&:hover": {
                        backgroundColor: "error.main",
                        color: "white",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemIcon>
                <DragIndicatorIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip label={index + 1} size="small" color="primary" />
                    <Typography>Page {page.pageNumber}</Typography>
                  </Stack>
                }
                secondary={`${page.width.toFixed(0)} × ${page.height.toFixed(0)} pts`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Grid container spacing={viewMode === "small" ? 1 : 2}>
          {pages.map((page, index) => (
            <Grid item {...gridColumns[viewMode]} key={`${page.pageNumber}-${index}`}>
              <Paper
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                sx={{
                  p: viewMode === "small" ? 1 : 1.5,
                  textAlign: "center",
                  position: "relative",
                  transition: "all 0.2s",
                  opacity: draggedIndex === index ? 0.5 : 1,
                  cursor: "move",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: viewMode === "small" ? 4 : 8,
                    left: viewMode === "small" ? 4 : 8,
                    zIndex: 1,
                    backgroundColor: "primary.main",
                    color: "white",
                    borderRadius: 1,
                    px: viewMode === "small" ? 0.5 : 1,
                    py: viewMode === "small" ? 0.25 : 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ fontSize: viewMode === "small" ? "0.65rem" : "0.75rem" }}
                  >
                    {index + 1}
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: viewMode === "small" ? 2 : 4,
                    right: viewMode === "small" ? 2 : 4,
                    zIndex: 1,
                    backgroundColor: "background.paper",
                    padding: viewMode === "small" ? 0.5 : 1,
                    "&:hover": {
                      backgroundColor: "error.main",
                      color: "white",
                    },
                  }}
                  onClick={() => onDelete(page.pageNumber)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>

                <Box
                  sx={{
                    ...thumbnailSize[viewMode],
                    backgroundColor: "background.default",
                    borderRadius: 1,
                    mb: viewMode === "small" ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <img
                    src={page.thumbnail || `/placeholder.svg?height=200&width=150&query=PDF page ${page.pageNumber}`}
                    alt={`Page ${page.pageNumber}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={0.5}
                  sx={{ mb: viewMode === "small" ? 0.5 : 1 }}
                >
                  <DragIndicatorIcon sx={{ fontSize: viewMode === "small" ? 14 : 16, color: "text.secondary" }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: viewMode === "small" ? "0.65rem" : "0.75rem" }}
                  >
                    Page {page.pageNumber}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={0.5} justifyContent="center">
                  <IconButton
                    size="small"
                    onClick={() => handleMoveLeft(index)}
                    disabled={index === 0}
                    sx={{
                      fontSize: viewMode === "small" ? "0.65rem" : "0.75rem",
                      padding: viewMode === "small" ? 0.25 : 0.5,
                      "&:disabled": {
                        opacity: 0.3,
                      },
                    }}
                  >
                    ←
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveRight(index)}
                    disabled={index === pages.length - 1}
                    sx={{
                      fontSize: viewMode === "small" ? "0.65rem" : "0.75rem",
                      padding: viewMode === "small" ? 0.25 : 0.5,
                      "&:disabled": {
                        opacity: 0.3,
                      },
                    }}
                  >
                    →
                  </IconButton>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {pages.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            No pages remaining. Please upload a new PDF.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
