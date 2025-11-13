import type React from "react"
import type { Metadata } from "next"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter"
import { ThemeProvider } from "@/lib/theme-context"
import { LocaleProvider } from "@/lib/locale-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "TuPDF",
  description: "Modern PDF organization, splitting, and merging tool",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <LocaleProvider>{children}</LocaleProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
