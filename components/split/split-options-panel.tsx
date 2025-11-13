"use client"

import { Box, Paper, Typography, ToggleButtonGroup, ToggleButton, Stack, Chip } from "@mui/material"
import ContentCutIcon from "@mui/icons-material/ContentCut"
import CallSplitIcon from "@mui/icons-material/CallSplit"
import GridOnIcon from "@mui/icons-material/GridOn"
import { useTranslation } from "react-i18next"

interface SplitOptionsPanelProps {
  mode: "extract" | "ranges" | "every"
  onModeChange: (mode: "extract" | "ranges" | "every") => void
  totalPages: number
  selectedPages: number[]
}

export function SplitOptionsPanel({ mode, onModeChange, totalPages, selectedPages }: SplitOptionsPanelProps) {
  const { t } = useTranslation()
  return (
    <Paper sx={{ p: 3, backgroundColor: "background.default" }}>
      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
        {t("workspaces.splitOptions.title")}
      </Typography>

      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_, newMode) => newMode && onModeChange(newMode)}
        fullWidth
        sx={{ mb: 2 }}
      >
        <ToggleButton value="extract" sx={{ py: 2 }}>
          <Stack alignItems="center" spacing={1}>
            <ContentCutIcon />
            <Typography variant="body2" fontWeight={600}>
              {t("workspaces.splitOptions.modes.extract.title")}
            </Typography>
          </Stack>
        </ToggleButton>
        <ToggleButton value="ranges" sx={{ py: 2 }}>
          <Stack alignItems="center" spacing={1}>
            <CallSplitIcon />
            <Typography variant="body2" fontWeight={600}>
              {t("workspaces.splitOptions.modes.ranges.title")}
            </Typography>
          </Stack>
        </ToggleButton>
        <ToggleButton value="every" sx={{ py: 2 }}>
          <Stack alignItems="center" spacing={1}>
            <GridOnIcon />
            <Typography variant="body2" fontWeight={600}>
              {t("workspaces.splitOptions.modes.every.title")}
            </Typography>
          </Stack>
        </ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ mt: 3 }}>
        {mode === "extract" && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t("workspaces.splitOptions.modes.extract.desc")}
            </Typography>
            <Chip label={selectedPages.length > 0 ? t("workspaces.splitOptions.modes.extract.chip", { count: selectedPages.length }) : t("workspaces.splitOptions.modes.extract.chipEmpty")} size="small" color={selectedPages.length > 0 ? "primary" : "default"} />
          </Box>
        )}
        {mode === "ranges" && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t("workspaces.splitOptions.modes.ranges.desc")}
            </Typography>
            <Chip label={selectedPages.length > 0 ? t("workspaces.splitOptions.modes.ranges.chip", { count: selectedPages.length }) : t("workspaces.splitOptions.modes.ranges.chipEmpty")} size="small" color={selectedPages.length > 0 ? "primary" : "default"} />
          </Box>
        )}
        {mode === "every" && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t("workspaces.splitOptions.modes.every.desc")}
            </Typography>
            <Chip label={t("workspaces.splitOptions.modes.every.chip", { count: totalPages })} size="small" color="primary" />
          </Box>
        )}
      </Box>
    </Paper>
  )
}
