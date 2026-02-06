import * as React from "react"

import { cn } from "@/lib/utils"

interface TableProps extends React.ComponentProps<"table"> {
  /** Add borders around the entire table */
  bordered?: boolean
  /** Apply rounded corners to the table container */
  rounded?: boolean
}

function Table({ className, bordered, rounded, ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      data-bordered={bordered || undefined}
      data-rounded={rounded || undefined}
      className={cn(
        "relative w-full overflow-x-auto",
        rounded && "rounded-lg",
        className
      )}
    >
      <table
        data-slot="table"
        className={cn(
          "w-full caption-bottom text-sm",
          bordered && "[&_th]:border [&_td]:border [&_th]:border-border [&_td]:border-border"
        )}
        {...props}
      />
    </div>
  )
}

interface TableHeaderProps extends React.ComponentProps<"thead"> {
  /** Background color class for the header (e.g., "bg-primary", "bg-muted") */
  bgColor?: string
}

function TableHeader({ className, bgColor, ...props }: TableHeaderProps) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-b",
        bgColor,
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

interface TableHeadProps extends React.ComponentProps<"th"> {
  /** Background color class for this header cell */
  bgColor?: string
}

function TableHead({ className, bgColor, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-3 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5",
        bgColor,
        className
      )}
      {...props}
    />
  )
}

interface TableCellProps extends React.ComponentProps<"td"> {
  /** Mark this cell as a row header (first column styling) */
  isRowHeader?: boolean
  /** Background color class for this cell */
  bgColor?: string
}

function TableCell({ className, isRowHeader, bgColor, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5",
        isRowHeader && "font-medium text-foreground bg-muted/30",
        bgColor,
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
