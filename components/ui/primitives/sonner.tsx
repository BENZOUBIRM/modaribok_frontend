import { Icon } from "@iconify/react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * Toast notification component — styled to match Figma designs.
 *
 * Layout: gradient background, large icon on the end side, close button at top-start.
 * RTL-aware: gradient direction and icon placement auto-flip.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      style={{ fontFamily: "inherit" }}
      closeButton
      duration={5000}
      gap={8}
      visibleToasts={4}
      icons={{
        success: (
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-green-500 ring-4 ring-green-500/20 dark:bg-white dark:ring-white/20">
            <Icon icon="solar:check-circle-bold" className="size-7 text-white dark:text-green-500" />
          </span>
        ),
        info: (
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-500 ring-4 ring-blue-500/20 dark:bg-white dark:ring-white/20">
            <Icon icon="solar:info-circle-bold" className="size-7 text-white dark:text-blue-500" />
          </span>
        ),
        warning: (
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-yellow-500 ring-4 ring-yellow-500/20 dark:bg-white dark:ring-white/20">
            <Icon icon="solar:shield-warning-bold" className="size-7 text-white dark:text-yellow-500" />
          </span>
        ),
        error: (
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-red-400 ring-4 ring-red-400/20 dark:bg-white dark:ring-white/20">
            <Icon icon="solar:close-circle-bold" className="size-7 text-white dark:text-red-400" />
          </span>
        ),
        loading: (
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-500 ring-4 ring-gray-500/20 dark:bg-white dark:ring-white/20">
            <Icon icon="solar:refresh-circle-linear" className="size-7 text-white dark:text-gray-500 animate-spin" />
          </span>
        ),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'toast-gradient w-full max-w-[550px] rounded-xl py-4 px-5 flex items-center gap-4 shadow-lg relative',
          title: 'font-bold text-base',
          description: 'text-sm opacity-80 mt-0.5',
          closeButton: 'absolute top-2.5 ltr:right-2.5 rtl:left-2.5 size-5 flex items-center justify-center rounded-full cursor-pointer bg-black/15 hover:bg-black/30 dark:bg-white/20 dark:hover:bg-white/40 border-0 text-foreground/70 hover:text-foreground transition-colors',
          success: 'toast-success text-green-900 dark:text-white',
          error: 'toast-error text-red-900 dark:text-white',
          warning: 'toast-warning text-yellow-900 dark:text-yellow-950',
          info: 'toast-info text-blue-900 dark:text-white',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
