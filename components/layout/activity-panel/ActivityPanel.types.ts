export interface ActivityPanelDesktopProps {
  isOpen: boolean
  onLogout: () => void
}

export interface ActivityPanelMobileProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
  onLogout: () => void
}
