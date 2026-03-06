export interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  isMobile: boolean
  onClose: () => void
  onToggle: () => void
  theme?: string
  onThemeToggle?: () => void
  onLogout?: () => void
}

export interface NavItem {
  path: string
  icon: string
  translationKey: string
  mobileOnly?: boolean
}
