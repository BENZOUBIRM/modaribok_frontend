export interface ActivityPanelDesktopProps {
  isOpen: boolean
}

export interface ActivityPanelMobileProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
}
