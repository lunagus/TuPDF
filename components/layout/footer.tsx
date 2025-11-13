"use client"

import { useState, type SVGProps } from "react"
import { Box, Modal, Paper, Typography, TextField, Button, Stack, Alert } from "@mui/material"
import { Send } from "@mui/icons-material"
import { useTranslation } from "react-i18next"

function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function BuyMeACoffeeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" />
    </svg>
  )
}

export function Footer() {
  const { t } = useTranslation()
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackName, setFeedbackName] = useState("")
  const [feedbackEmail, setFeedbackEmail] = useState("")
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      setSubmitError(t("footer.feedback.errors.empty"))
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      const response = await fetch("https://formspree.io/f/xldleqja", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: feedbackName,
          email: feedbackEmail,
          message: feedbackMessage,
        }),
      })

      if (response.ok) {
        setSubmitSuccess(true)
        setFeedbackName("")
        setFeedbackEmail("")
        setFeedbackMessage("")
        setTimeout(() => {
          setShowFeedbackModal(false)
          setSubmitSuccess(false)
        }, 2000)
      } else {
        setSubmitError(t("footer.feedback.errors.failed"))
      }
    } catch (error) {
      setSubmitError(t("footer.feedback.errors.network"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Box
        component="footer"
        sx={{
          mt: "auto",
          py: 2.5,
          px: 3,
          borderTop: "1px solid",
          borderColor: "divider",
          position: "relative",
          zIndex: 1,
          minHeight: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            width: "100%",
            maxWidth: 1200,
            mx: "auto",
          }}
        >
          {/* GitHub Link */}
          <Box
            component="a"
            href="https://github.com/lunagus"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              px: 2.5,
              py: 1.25,
              borderRadius: 2,
              backgroundColor: "background.default",
              border: "1px solid",
              borderColor: "divider",
              textDecoration: "none",
              color: "text.primary",
              transition: "all 0.2s ease",
              minWidth: { xs: "100%", sm: "auto" },
              "&:hover": {
                backgroundColor: "action.hover",
                borderColor: "primary.main",
                transform: "translateY(-1px)",
                boxShadow: 1,
              },
            }}
          >
            <GitHubIcon className="icon" style={{ width: 18, height: 18 }} />
            <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.875rem" }}>
              lunagus
            </Typography>
          </Box>

          {/* Feedback Button */}
          <Box
            component="button"
            onClick={() => setShowFeedbackModal(true)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              px: 2.5,
              py: 1.25,
              borderRadius: 2,
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              minWidth: { xs: "100%", sm: "auto" },
              "&:hover": {
                backgroundColor: "primary.dark",
                transform: "translateY(-1px)",
                boxShadow: 2,
              },
              "&:active": {
                transform: "translateY(0)",
              },
            }}
          >
            <Send sx={{ fontSize: 18 }} />
            <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.875rem" }}>
              {t("footer.feedback.open")}
            </Typography>
          </Box>

          {/* Donate Link */}
          <Box
            component="a"
            href="https://coff.ee/lunagus"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              px: 2.5,
              py: 1.25,
              borderRadius: 2,
              backgroundColor: "warning.main",
              color: "warning.contrastText",
              textDecoration: "none",
              transition: "all 0.2s ease",
              minWidth: { xs: "100%", sm: "auto" },
              "&:hover": {
                backgroundColor: "warning.dark",
                transform: "translateY(-1px)",
                boxShadow: 2,
              },
              "&:active": {
                transform: "translateY(0)",
              },
            }}
          >
            <BuyMeACoffeeIcon className="icon" style={{ width: 18, height: 18 }} />
            <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.875rem" }}>
              {t("footer.donate")}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Feedback Modal */}
      <Modal open={showFeedbackModal} onClose={() => setShowFeedbackModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 500 },
            maxWidth: "100%",
            zIndex: 1300,
          }}
        >
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              {t("footer.feedback.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t("footer.feedback.subtitle")}
            </Typography>

            {submitSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {t("footer.feedback.success")}
              </Alert>
            )}

            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            )}

            <Stack spacing={2}>
              <TextField
                label={t("footer.feedback.name")}
                fullWidth
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
                disabled={isSubmitting}
              />
              <TextField
                label={t("footer.feedback.email")}
                type="email"
                fullWidth
                value={feedbackEmail}
                onChange={(e) => setFeedbackEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <TextField
                label={t("footer.feedback.message")}
                multiline
                rows={4}
                fullWidth
                required
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                disabled={isSubmitting}
              />
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button onClick={() => setShowFeedbackModal(false)} disabled={isSubmitting}>
                  {t("footer.feedback.cancel")}
                </Button>
                <Button variant="contained" onClick={handleSubmitFeedback} disabled={isSubmitting}>
                  {isSubmitting ? t("footer.feedback.sending") : t("footer.feedback.send")}
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Modal>
    </>
  )
}
