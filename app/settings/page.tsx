"use client"

import {
  Box,
  Typography,
  Paper,
  Stack,
  Switch,
  Divider,
  FormControlLabel,
  Button,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
} from "@mui/material"
import { Visibility, VisibilityOff, Settings as SettingsIcon } from "@mui/icons-material"
import { MainLayout } from "@/components/layout/main-layout"
import { useThemeMode } from "@/lib/theme-context"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useLocale } from "@/lib/locale-context"
import { localeLabels, type SupportedLocale } from "@/lib/i18n"

export default function SettingsPage() {
  const { mode, toggleTheme } = useThemeMode()
  const [autoSave, setAutoSave] = useState(true)
  const [showSaved, setShowSaved] = useState(false)
  const [pdfPassword, setPdfPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()

  useEffect(() => {
    const savedAutoSave = localStorage.getItem("autoSave")
    const savedPassword = localStorage.getItem("pdfPassword")

    if (savedAutoSave !== null) setAutoSave(savedAutoSave === "true")
    if (savedPassword !== null) setPdfPassword(savedPassword)
  }, [])

  const handleSave = () => {
    localStorage.setItem("autoSave", String(autoSave))
    localStorage.setItem("pdfPassword", pdfPassword)

    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 3000)
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
              <SettingsIcon sx={{ fontSize: 28, color: "primary.main" }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h4" fontWeight={600} sx={{ mb: 0.5 }}>
                {t("settings.title")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("settings.subtitle")}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {showSaved && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {t("settings.saved")}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {t("settings.language.title")}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <TextField
              label={t("settings.language.title")}
              select
              fullWidth
              value={locale}
              onChange={(e) => setLocale(e.target.value as SupportedLocale)}
            >
              {Object.entries(localeLabels).map(([code, meta]) => (
                <MenuItem key={code} value={code}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span style={{ fontSize: 18 }}>{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {t("settings.appearance.title")}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <FormControlLabel
              control={<Switch checked={mode === "dark"} onChange={toggleTheme} />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {t("settings.appearance.darkMode.label")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("settings.appearance.darkMode.helper")}
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {t("settings.processing.title")}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <FormControlLabel
              control={<Switch checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {t("settings.processing.autoSave.label")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("settings.processing.autoSave.helper")}
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {t("settings.encrypted.title")}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t("settings.encrypted.helper")}
              </Typography>
              <TextField
                label={t("settings.encrypted.password.label")}
                type={showPassword ? "text" : "password"}
                fullWidth
                value={pdfPassword}
                onChange={(e) => setPdfPassword(e.target.value)}
                placeholder={t("settings.encrypted.password.placeholder")}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText={t("settings.encrypted.password.helpText")}
              />
            </Box>
          </Stack>
        </Paper>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" size="large" onClick={handleSave}>
            {t("settings.save")}
          </Button>
        </Box>
      </Box>
    </MainLayout>
  )
}
