"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"

type ThemeMode = "light" | "dark"

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useThemeMode() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeProvider")
  }
  return context
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark")

  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode") as ThemeMode
    if (savedMode) {
      setMode(savedMode)
    }
  }, [])

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light"
      localStorage.setItem("themeMode", newMode)
      return newMode
    })
  }

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: "#3f51b5",
        light: "#5c6bc0",
        dark: "#303f9f",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#e91e63",
        light: "#ec407a",
        dark: "#c2185b",
        contrastText: "#ffffff",
      },
      background: {
        default: mode === "dark" ? "#121212" : "#f5f5f5",
        paper: mode === "dark" ? "#1e1e1e" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#ffffff" : "rgba(0, 0, 0, 0.87)",
        secondary: mode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
      },
      divider: mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
    },
    typography: {
      fontFamily: ["-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "Arial", "sans-serif"].join(","),
      h1: { fontSize: "2.5rem", fontWeight: 500, lineHeight: 1.2 },
      h2: { fontSize: "2rem", fontWeight: 500, lineHeight: 1.3 },
      h3: { fontSize: "1.75rem", fontWeight: 500, lineHeight: 1.4 },
      h4: { fontSize: "1.5rem", fontWeight: 500, lineHeight: 1.4 },
      h5: { fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.5 },
      h6: { fontSize: "1rem", fontWeight: 500, lineHeight: 1.6 },
      body1: { fontSize: "1rem", lineHeight: 1.5 },
      body2: { fontSize: "0.875rem", lineHeight: 1.43 },
    },
    shape: { borderRadius: 8 },
    spacing: 8,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            borderRadius: 8,
            padding: "8px 16px",
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === "dark" ? "0px 2px 8px rgba(0, 0, 0, 0.3)" : "0px 2px 8px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          elevation1: {
            boxShadow: mode === "dark" ? "0px 2px 4px rgba(0, 0, 0, 0.2)" : "0px 2px 4px rgba(0, 0, 0, 0.1)",
          },
          elevation2: {
            boxShadow: mode === "dark" ? "0px 4px 8px rgba(0, 0, 0, 0.3)" : "0px 4px 8px rgba(0, 0, 0, 0.15)",
          },
          elevation3: {
            boxShadow: mode === "dark" ? "0px 8px 16px rgba(0, 0, 0, 0.4)" : "0px 8px 16px rgba(0, 0, 0, 0.2)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            borderBottom: mode === "dark" ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.12)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: mode === "dark" ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.12)",
          },
        },
      },
    },
  })

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
