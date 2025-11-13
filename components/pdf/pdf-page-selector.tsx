"use client"
import React from "react"
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  Stack,
  Button,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ViewModuleIcon from "@mui/icons-material/ViewModule"
import ViewComfyIcon from "@mui/icons-material/ViewComfy"
import ViewListIcon from "@mui/icons-material/ViewList"
import RotateLeftIcon from "@mui/icons-material/RotateLeft"
import RotateRightIcon from "@mui/icons-material/RotateRight"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import type { PDFFileInfo } from "@/lib/pdf-utils"
import { useTranslation } from "react-i18next"

interface PDFPageSelectorProps {
  fileInfo: PDFFileInfo
  selectedPages: number[]
  onSelectionChange: (pages: number[]) => void
  multiSelect?: boolean
  onRotatePage?: (pageNumber: number, degrees: number) => void
}

type ViewMode = "small" | "large" | "list"

export function PDFPageSelector({
  fileInfo,
  selectedPages,
  onSelectionChange,
  multiSelect = true,
  onRotatePage,
}: PDFPageSelectorProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("small")
  const [pageRotations, setPageRotations] = React.useState<Record<number, number>>({})
  const [regeneratingThumbnails, setRegeneratingThumbnails] = React.useState(false)
  const { t } = useTranslation()

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

  const handlePageToggle = (pageNumber: number) => {
    if (multiSelect) {
      if (selectedPages.includes(pageNumber)) {
        onSelectionChange(selectedPages.filter((p) => p !== pageNumber))
      } else {
        onSelectionChange([...selectedPages, pageNumber])
      }
    } else {
      onSelectionChange([pageNumber])
    }
  }

  const handleSelectAll = () => {
    if (selectedPages.length === fileInfo.totalPages) {
      onSelectionChange([])
    } else {
      onSelectionChange(Array.from({ length: fileInfo.totalPages }, (_, i) => i + 1))
    }
  }

  const isSelected = (pageNumber: number) => selectedPages.includes(pageNumber)

  const thumbnailSize = {
    small: { width: "100%", aspectRatio: "3/4", maxHeight: "120px" }, // Smaller max height
    large: { width: "100%", aspectRatio: "3/4" },
  }

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" sx={{ mb: 3, gap: { xs: 1.5, sm: 0 } }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6" fontWeight={600}>
            {t("workspaces.pages.title", "Select Pages")}
          </Typography>
          <Chip
            label={t("workspaces.pages.selected", "{{count}} selected", { count: selectedPages.length })}
            color={selectedPages.length > 0 ? "primary" : "default"}
            size="small"
          />
        </Stack>
        <Stack direction="row" spacing={1} flexWrap={{ xs: "wrap", sm: "nowrap" }}>
          <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewModeChange} size="small">
            <ToggleButton value="small" aria-label={t("workspaces.pages.view.small", "small thumbnails")}>
              <Tooltip title={t("workspaces.pages.view.small", "Small thumbnails")}>
                <ViewModuleIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="large" aria-label={t("workspaces.pages.view.large", "large thumbnails")}>
              <Tooltip title={t("workspaces.pages.view.large", "Large thumbnails")}>
                <ViewComfyIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="list" aria-label={t("workspaces.pages.view.list", "list view")}>
              <Tooltip title={t("workspaces.pages.view.list", "List view")}>
                <ViewListIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          {multiSelect && (
            <Button variant="outlined" size="small" onClick={handleSelectAll}>
              {selectedPages.length === fileInfo.totalPages
                ? t("workspaces.pages.deselectAll", "Deselect All")
                : t("workspaces.pages.selectAll", "Select All")}
            </Button>
          )}
        </Stack>
      </Stack>

      {viewMode === "list" ? (
        <List>
          {fileInfo.pages.map((page) => {
            const selected = isSelected(page.pageNumber)
            return (
              <ListItem
                key={page.pageNumber}
                onClick={() => handlePageToggle(page.pageNumber)}
                sx={{
                  border: "2px solid",
                  borderColor: selected ? "primary.main" : "divider",
                  borderRadius: 1,
                  mb: 1,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor: selected ? "action.selected" : "transparent",
                  "&:hover": {
                    backgroundColor: selected ? "action.selected" : "action.hover",
                  },
                }}
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title={t("workspaces.pages.rotateLeft", "Rotate left")}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRotate(page.pageNumber, -90)
                        }}
                      >
                        <RotateLeftIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("workspaces.pages.rotateRight", "Rotate right")}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRotate(page.pageNumber, 90)
                        }}
                      >
                        <RotateRightIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              >
                <Checkbox
                  checked={selected}
                  sx={{ mr: 2 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePageToggle(page.pageNumber)
                  }}
                />
                <ListItemIcon>
                  <InsertDriveFileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("workspaces.pages.page", "Page {{num}}", { num: page.pageNumber })}
                  secondary={t("workspaces.pages.dimensions", "{{w}} × {{h}} pts", {
                    w: page.width.toFixed(0),
                    h: page.height.toFixed(0),
                  })}
                />
              </ListItem>
            )
          })}
        </List>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: viewMode === "small" ? 1 : 2,
            gridTemplateColumns:
              viewMode === "small"
                ? { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)", lg: "repeat(6, 1fr)" }
                : { xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" },
          }}
        >
          {fileInfo.pages.map((page) => {
            const selected = isSelected(page.pageNumber)
            return (
              <Box key={page.pageNumber}>
                <Paper
                  onClick={() => handlePageToggle(page.pageNumber)}
                  sx={{
                    p: viewMode === "small" ? 1 : 1.5,
                    textAlign: "center",
                    cursor: "pointer",
                    position: "relative",
                    border: "2px solid",
                    borderColor: selected ? "primary.main" : "transparent",
                    backgroundColor: selected ? "action.selected" : "transparent",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 4,
                      borderColor: selected ? "primary.main" : "divider",
                    },
                  }}
                >
                  {selected && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: viewMode === "small" ? 4 : 8,
                        right: viewMode === "small" ? 4 : 8,
                        zIndex: 1,
                      }}
                    >
                      <CheckCircleIcon sx={{ color: "primary.main", fontSize: viewMode === "small" ? 20 : 24 }} />
                    </Box>
                  )}
                  <Checkbox
                    checked={selected}
                    size={viewMode === "small" ? "small" : "medium"}
                    sx={{
                      position: "absolute",
                      top: viewMode === "small" ? 2 : 4,
                      left: viewMode === "small" ? 2 : 4,
                      zIndex: 1,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePageToggle(page.pageNumber)
                    }}
                  />
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
                      position: "relative",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {page.thumbnail ? (
                      <img
                        src={page.thumbnail || "/placeholder.svg"}
                        alt={t("workspaces.pages.page", "Page {{num}}", { num: page.pageNumber })}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          transform: `rotate(${pageRotations[page.pageNumber] || 0}deg)`,
                          transition: "transform 0.3s",
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        {t("workspaces.pages.loading", "Loading...")}
                      </Typography>
                    )}
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
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={selected ? 600 : 400}
                    sx={{ fontSize: viewMode === "small" ? "0.65rem" : "0.75rem" }}
                  >
                    {t("workspaces.pages.page", "Page {{num}}", { num: page.pageNumber })}
                  </Typography>
                </Paper>
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
