import type * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

export type AlertDialogContentProps = React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  size?: "default" | "sm"
}

export type AlertDialogActionProps = React.ComponentProps<typeof AlertDialogPrimitive.Action> & {
  variant?: "default" | "destructive" | "outline" | "secondary" | "accent" | "ghost" | "link"
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
}

export type AlertDialogCancelProps = React.ComponentProps<typeof AlertDialogPrimitive.Cancel> & {
  variant?: "default" | "destructive" | "outline" | "secondary" | "accent" | "ghost" | "link"
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
}
