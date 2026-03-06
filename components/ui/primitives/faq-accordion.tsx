import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"

function FaqAccordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      className={cn("space-y-3", className)}
      {...props}
    />
  )
}

function FaqAccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn(
        "bg-background rounded-lg shadow-sm border border-border overflow-hidden transition-all",
        "data-[state=open]:shadow-md",
        className
      )}
      {...props}
    />
  )
}

function FaqAccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex flex-1 items-center justify-between gap-4 p-4 sm:p-5 text-left text-sm sm:text-base font-medium transition-all outline-none group",
          "hover:bg-muted/30",
          className
        )}
        {...props}
      >
        <span className="flex-1 pr-2">{children}</span>
        <div
          className={cn(
            "flex items-center justify-center size-6 rounded-full shrink-0 transition-all",
            "border-2 border-primary text-primary",
            "group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground group-data-[state=open]:border-primary"
          )}
        >
          <Icon icon="solar:add-circle-linear" className="size-4 group-data-[state=open]:hidden" />
          <Icon icon="solar:minus-circle-linear" className="size-4 hidden group-data-[state=open]:block" />
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function FaqAccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className="px-4 sm:px-5 pb-4 sm:pb-5">
        <div className={cn(
          "p-4 rounded-lg border border-border/50",
          "bg-muted/40 dark:bg-white/5",
          "text-muted-foreground",
          className
        )}>
          {children}
        </div>
      </div>
    </AccordionPrimitive.Content>
  )
}

interface FaqCategoryTabsProps {
  categories: { label: string; value: string }[]
  activeCategory: string
  onCategoryChange: (value: string) => void
  className?: string
}

function FaqCategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  className,
}: FaqCategoryTabsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 mb-6", className)}>
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all border",
            activeCategory === category.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}

export {
  FaqAccordion,
  FaqAccordionItem,
  FaqAccordionTrigger,
  FaqAccordionContent,
  FaqCategoryTabs,
}
