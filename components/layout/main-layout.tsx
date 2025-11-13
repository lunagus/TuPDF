"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Box,
  Drawer,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import ContentCutIcon from "@mui/icons-material/ContentCut"
import MergeIcon from "@mui/icons-material/Merge"
import ReorderIcon from "@mui/icons-material/Reorder"
import HistoryIcon from "@mui/icons-material/History"
import SettingsIcon from "@mui/icons-material/Settings"
import Brightness4Icon from "@mui/icons-material/Brightness4"
import Brightness7Icon from "@mui/icons-material/Brightness7"
import DescriptionIcon from "@mui/icons-material/Description"
import ImageIcon from "@mui/icons-material/Image"
import MenuIcon from "@mui/icons-material/Menu"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import CompressIcon from "@mui/icons-material/Compress"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useThemeMode } from "@/lib/theme-context"
import { Footer } from "@/components/layout/footer"
import { useTranslation } from "react-i18next"

const drawerWidth = 260
const collapsedDrawerWidth = 72

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(true)
  const { mode, toggleTheme } = useThemeMode()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const pathname = usePathname()
  const { t } = useTranslation()

  useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebarCollapsed")
    if (savedCollapsed !== null) {
      setCollapsed(savedCollapsed === "true")
    } else {
      setCollapsed(true)
      localStorage.setItem("sidebarCollapsed", "true")
    }
  }, [])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleCollapseToggle = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    localStorage.setItem("sidebarCollapsed", String(newCollapsed))
  }

  const menuItems = [
    { text: t("nav.split"), icon: <ContentCutIcon />, path: "/split" },
    { text: t("nav.merge"), icon: <MergeIcon />, path: "/merge" },
    { text: t("nav.organize"), icon: <ReorderIcon />, path: "/organize" },
    { text: t("nav.convert"), icon: <ImageIcon />, path: "/convert" },
    { text: t("nav.optimize"), icon: <CompressIcon />, path: "/optimize" },
    { text: t("nav.recent"), icon: <HistoryIcon />, path: "/recent" },
  ]

  const currentDrawerWidth = collapsed ? collapsedDrawerWidth : drawerWidth

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box>
        <Toolbar sx={{ px: collapsed ? 1 : 3, py: 2, justifyContent: collapsed ? "center" : "flex-start" }}>
          {!collapsed && (
            <>
              <DescriptionIcon sx={{ mr: 1.5, color: "primary.main", fontSize: 32 }} />
              <Typography variant="h6" noWrap component="div" fontWeight={600}>
                {t("app.title")}
              </Typography>
            </>
          )}
          {collapsed && <DescriptionIcon sx={{ color: "primary.main", fontSize: 32 }} />}
        </Toolbar>
      </Box>
      <Divider />
      <List sx={{ px: collapsed ? 1 : 2, py: 2, flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <Link href={item.path} style={{ textDecoration: "none", color: "inherit", width: "100%" }}>
              <ListItemButton
                sx={{
                  borderRadius: 2,
                  justifyContent: collapsed ? "center" : "flex-start",
                  px: collapsed ? 1 : 2,
                  "&:hover": {
                    backgroundColor: "rgba(63, 81, 181, 0.08)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgba(63, 81, 181, 0.16)",
                    "&:hover": {
                      backgroundColor: "rgba(63, 81, 181, 0.24)",
                    },
                  },
                }}
                selected={pathname === item.path}
              >
                <ListItemIcon sx={{ color: "primary.main", minWidth: collapsed ? "auto" : 40 }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    }}
                  />
                )}
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          justifyContent: "center",
          pb: 2,
          px: 2,
        }}
      >
        <IconButton
          onClick={handleCollapseToggle}
          size="small"
          sx={{
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ height: 82, display: "flex", alignItems: "center" }}>
        <List sx={{ px: collapsed ? 1 : 2, width: "100%" }}>
          <ListItem disablePadding>
            <Link href="/settings" style={{ textDecoration: "none", color: "inherit", width: "100%" }}>
              <ListItemButton
                sx={{
                  borderRadius: 2,
                  justifyContent: collapsed ? "center" : "flex-start",
                  px: collapsed ? 1 : 2,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgba(63, 81, 181, 0.16)",
                    "&:hover": {
                      backgroundColor: "rgba(63, 81, 181, 0.24)",
                    },
                  },
                }}
                selected={pathname === "/settings"}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? "auto" : 40 }}>
                  <SettingsIcon />
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={t("nav.settings")}
                    primaryTypographyProps={{
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    }}
                  />
                )}
              </ListItemButton>
            </Link>
          </ListItem>
        </List>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="nav"
        sx={{
          width: { md: currentDrawerWidth },
          flexShrink: { md: 0 },
        }}
        aria-label="navigation drawer"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "background.paper",
              zIndex: 1200,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: currentDrawerWidth,
              backgroundColor: "background.paper",
              zIndex: 1100,
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: "hidden",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "background.default",
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          position: "relative",
        }}
      >
        {/* Mobile Top Bar to prevent overlap with page headers */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            gap: 1,
            height: 56,
            px: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            position: "sticky",
            top: 0,
            zIndex: 1000,
            backgroundColor: "background.paper",
          }}
        >
          <IconButton
            onClick={handleDrawerToggle}
            size="medium"
            sx={{
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              width: 40,
              height: 40,
              boxShadow: 1,
              "&:hover": {
                backgroundColor: "action.hover",
                boxShadow: 2,
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
            aria-label="open navigation"
          >
            <MenuIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DescriptionIcon sx={{ color: "primary.main" }} />
            <Typography variant="subtitle1" fontWeight={600}>
              {t("app.title")}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 1000,
            display: { xs: "none", md: "block" },
          }}
        >
          <IconButton
            onClick={toggleTheme}
            size="medium"
            sx={{
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              width: 40,
              height: 40,
              boxShadow: 1,
              "&:hover": {
                backgroundColor: "action.hover",
                boxShadow: 2,
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
            aria-label={t("common.toggleThemeAria")}
          >
            {mode === "dark" ? <Brightness7Icon sx={{ fontSize: 20 }} /> : <Brightness4Icon sx={{ fontSize: 20 }} />}
          </IconButton>
        </Box>
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            pb: 0,
            maxWidth: { md: "calc(100% - 32px)", lg: 1400 },
            mx: "auto",
            width: "100%",
          }}
        >
          {children}
        </Box>
        <Footer />
      </Box>
    </Box>
  )
}
