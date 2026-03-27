import type { Icon } from "@iconify/react"

export type SpinnerTone =
	| "inherit"
	| "primary"
	| "muted"
	| "inverse"
	| "success"
	| "warning"
	| "danger"

export type SpinnerProps = Omit<React.ComponentProps<typeof Icon>, "icon"> & {
	tone?: SpinnerTone
}
