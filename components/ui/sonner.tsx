import { Icon } from "@iconify/react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      closeButton
      icons={{
        success: (
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-green-500">
            <Icon icon="solar:check-circle-bold" className="size-4 text-white" />
          </span>
        ),
        info: (
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-500">
            <Icon icon="solar:info-circle-bold" className="size-4 text-white" />
          </span>
        ),
        warning: (
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-yellow-500">
            <Icon icon="solar:danger-triangle-bold" className="size-4 text-white" />
          </span>
        ),
        error: (
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-red-500">
            <Icon icon="solar:close-circle-bold" className="size-4 text-white" />
          </span>
        ),
        loading: (
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-500">
            <Icon icon="solar:refresh-circle-linear" className="size-4 text-white animate-spin" />
          </span>
        ),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'w-full rounded-lg py-3 px-4 flex items-center gap-3 shadow-lg border-l-4',
          title: 'font-semibold text-sm',
          description: 'text-sm opacity-80',
          closeButton: 'absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 size-5 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition-opacity bg-black/10 dark:bg-white/20 border-0 text-current',
          // Light mode: pastel bg with colored left border | Dark mode: solid colored bg
          success: 'bg-green-100 text-green-800 border-green-500 dark:bg-green-500 dark:text-white dark:border-green-600',
          error: 'bg-red-100 text-red-700 border-red-500 dark:bg-red-500 dark:text-white dark:border-red-600',
          warning: 'bg-yellow-100 text-yellow-800 border-yellow-500 dark:bg-yellow-400 dark:text-yellow-900 dark:border-yellow-500',
          info: 'bg-blue-100 text-blue-800 border-blue-500 dark:bg-blue-500 dark:text-white dark:border-blue-600',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
