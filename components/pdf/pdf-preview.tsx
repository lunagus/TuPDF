"use client"

import type React from "react"

import { useState } from "react"
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Stack,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import DescriptionIcon from "@mui/icons-material/Description"
import ViewModuleIcon from "@mui/icons-material/ViewModule"
import ViewComfyIcon from "@mui/icons-material/ViewComfy"
import ViewListIcon from "@mui/icons-material/ViewList"
import RotateLeftIcon from "@mui/icons-material/RotateLeft"
import RotateRightIcon from "@mui/icons-material/RotateRight"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import type { PDFFileInfo } from "@/lib/pdf-utils"

interface PDFPreviewProps {
  fileInfo: PDFFileInfo
  onClose?: () => void
  showPages?: boolean
  onRotatePage?: (pageNumber: number, degrees: number) => void
}

type ViewMode = "small" | "large" | "list"

export function PDFPreview({ fileInfo, onClose, showPages = true, onRotatePage }: PDFPreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("small")
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({})

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode)
    }
  }

  const handleRotate = (pageNumber: number, degrees: number) => {
    const currentRotation = pageRotations[pageNumber] || 0
    const newRotation = (currentRotation + degrees) % 360
    setPageRotations((prev) => ({ ...prev, [pageNumber]: newRotation }))
    onRotatePage?.(pageNumber, newRotation)
  }

  const gridColumns = {
    small: { xs: 6, sm: 4, md: 3, lg: 2 },
    large: { xs: 12, sm: 6, md: 4, lg: 3 },
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: "rgba(63, 81, 181, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DescriptionIcon sx={{ fontSize: 28, color: "primary.main" }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {fileInfo.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={`${fileInfo.totalPages} pages`} size="small" color="primary" variant="outlined" />
              <Typography variant="caption" color="text.secondary">
                {(fileInfo.file.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          {showPages && (
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
          )}
          {onClose && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Stack>
      </Stack>

      {showPages && (
        <Box>
          <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
            Pages Preview
          </Typography>
          {viewMode === "list" ? (
            <List>
              {fileInfo.pages.map((page) => (
                <ListItem
                  key={page.pageNumber}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Rotate left">
                        <IconButton edge="end" size="small" onClick={() => handleRotate(page.pageNumber, -90)}>
                          <RotateLeftIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rotate right">
                        <IconButton edge="end" size="small" onClick={() => handleRotate(page.pageNumber, 90)}>
                          <RotateRightIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                >
                  <ListItemIcon>
                    <InsertDriveFileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Page ${page.pageNumber}`}
                    secondary={`${page.width.toFixed(0)} × ${page.height.toFixed(0)} pts`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Grid container spacing={2}>
              {fileInfo.pages.map((page) => (
                <Grid item {...gridColumns[viewMode]} key={page.pageNumber}>
                  <Paper
                    sx={{
                      p: 1,
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        aspectRatio: "3/4",
                        backgroundColor: "background.default",
                        borderRadius: 1,
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <img
                        src={
                          page.thumbnail || `/placeholder.svg?height=200&width=150&query=PDF page ${page.pageNumber}`
                        }
                        alt={`Page ${page.pageNumber}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          transform: `rotate(${pageRotations[page.pageNumber] || 0}deg)`,
                          transition: "transform 0.3s",
                        }}
                      />
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          position: "absolute",
                          bottom: 4,
                          right: 4,
                          opacity: 0,
                          transition: "opacity 0.2s",
                          ".MuiPaper-root:hover &": {
                            opacity: 1,
                          },
                        }}
                      >
                        <Tooltip title="Rotate left">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRotate(page.pageNumber, -90)
                            }}
                            sx={{
                              backgroundColor: "background.paper",
                              "&:hover": {
                                backgroundColor: "action.hover",
                              },
                            }}
                          >
                            <RotateLeftIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rotate right">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRotate(page.pageNumber, 90)
                            }}
                            sx={{
                              backgroundColor: "background.paper",
                              "&:hover": {
                                backgroundColor: "action.hover",
                              },
                            }}
                          >
                            <RotateRightIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Page {page.pageNumber}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Paper>
  )
}
