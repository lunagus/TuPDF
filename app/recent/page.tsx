"use client"

import { useEffect, useState } from "react"
import { Box, Typography, Paper, Stack, Chip, IconButton, Grid, Alert } from "@mui/material"
import { MainLayout } from "@/components/layout/main-layout"
import DescriptionIcon from "@mui/icons-material/Description"
import DeleteIcon from "@mui/icons-material/Delete"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import { useTranslation } from "react-i18next"

interface RecentFile {
  id: string
  name: string
  pages: number
  size: string
  action: string
  timestamp: number
}

export default function RecentPage() {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([])
  const { t } = useTranslation()

  useEffect(() => {
    const stored = localStorage.getItem("TuPDF-recent")
    if (stored) {
      try {
        const files = JSON.parse(stored)
        setRecentFiles(files)
      } catch (error) {
        console.error("[v0] Failed to load recent files:", error)
      }
    }
  }, [])

  const handleDelete = (id: string) => {
    const updated = recentFiles.filter((file) => file.id !== id)
    setRecentFiles(updated)
    localStorage.setItem("TuPDF-recent", JSON.stringify(updated))
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return t("recent.timeago.justNow")
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return t("recent.timeago.minutes", { count: minutes, plural: minutes > 1 ? "s" : "" })
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return t("recent.timeago.hours", { count: hours, plural: hours > 1 ? "s" : "" })
    const days = Math.floor(hours / 24)
    return t("recent.timeago.days", { count: days, plural: days > 1 ? "s" : "" })
  }

  return (
    <MainLayout>
      <Box>
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2.5} sx={{ mb: 1 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.5,
                backgroundColor: "rgba(63, 81, 181, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 28, color: "primary.main" }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h4" fontWeight={600} sx={{ mb: 0.5 }}>
                {t("recent.title")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("recent.subtitle")}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {recentFiles.length === 0 ? (
          <Alert severity="info">{t("recent.empty")}</Alert>
        ) : (
          <Grid container spacing={3}>
            {recentFiles.map((file) => (
              <Grid item xs={12} md={6} lg={4} key={file.id}>
                <Paper
                  sx={{
                    p: 3,
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
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
                    <IconButton size="small" color="error" onClick={() => handleDelete(file.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }} noWrap>
                    {file.name}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                    <Chip label={t("recent.pages", { count: file.pages, plural: file.pages > 1 ? "s" : "" })} size="small" variant="outlined" />
                    <Chip label={file.size} size="small" variant="outlined" />
                    <Chip label={t(`nav.${file.action.toLowerCase()}`, { defaultValue: file.action })} size="small" color="primary" />
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatTimeAgo(file.timestamp)}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </MainLayout>
  )
}
