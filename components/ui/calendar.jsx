"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-6", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-lg font-bold text-foreground",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-9 w-9 bg-white dark:bg-gray-800 p-0 rounded-full",
          "border-2 border-gray-200 dark:border-gray-700",
          "hover:bg-primary hover:border-primary hover:text-white",
          "transition-all duration-200",
          "shadow-sm hover:shadow-md disabled:opacity-30"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1 mt-4",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-10 font-semibold text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 h-10 w-10",
        day: cn(
          "h-10 w-10 p-0 font-semibold rounded-lg transition-all duration-200",
          "hover:bg-primary/10 hover:text-primary",
          "focus:outline-none focus:ring-2 focus:ring-primary/50"
        ),
        day_selected: cn(
          "bg-primary text-primary-foreground font-bold",
          "hover:bg-primary hover:text-primary-foreground",
          "shadow-md ring-2 ring-primary/20 ring-offset-1"
        ),
        day_today: cn(
          "bg-accent text-accent-foreground font-bold",
          "ring-2 ring-primary/30"
        ),
        day_outside: "text-muted-foreground/40 opacity-50",
        day_disabled: "text-muted-foreground/30 opacity-30 line-through cursor-not-allowed",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }