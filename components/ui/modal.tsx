import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Icon } from "@iconify/react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { IconButton } from "./icon-button"

const modalVariants = cva("", {
  variants: {
    size: {
      sm: "sm:max-w-sm",
      default: "sm:max-w-lg",
      md: "sm:max-w-xl",
      lg: "sm:max-w-2xl",
      xl: "sm:max-w-4xl",
      full: "sm:max-w-[95vw]",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

interface ModalProps extends React.ComponentProps<typeof DialogPrimitive.Root> {}

function Modal({ ...props }: ModalProps) {
  return <DialogPrimitive.Root {...props} />
}

function ModalTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />
}

interface ModalOverlayProps extends React.ComponentProps<typeof DialogPrimitive.Overlay> {
  blur?: boolean
}

function ModalOverlay({ className, blur = true, ...props }: ModalOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        blur && "backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

interface ModalContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content>,
    VariantProps<typeof modalVariants> {
  showCloseButton?: boolean
  blur?: boolean
}

function ModalContent({
  className,
  children,
  size,
  showCloseButton = true,
  blur = true,
  ...props
}: ModalContentProps) {
  return (
    <DialogPrimitive.Portal>
      <ModalOverlay blur={blur} />
      <DialogPrimitive.Content
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border shadow-lg duration-200 outline-none",
          modalVariants({ size }),
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close asChild>
            <IconButton
              icon={<Icon icon="mdi:close" className="size-4" />}
              variant="destructive"
              size="xs"
              className="absolute top-4 right-4"
              aria-label="Close modal"
            />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function ModalHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left px-6 pt-6", className)}
      {...props}
    />
  )
}

function ModalBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("px-6 py-4", className)}
      {...props}
    />
  )
}

function ModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 px-6 pb-6 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function ModalTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-xl font-semibold leading-none tracking-tight text-foreground", className)}
      {...props}
    />
  )
}

function ModalDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
}
