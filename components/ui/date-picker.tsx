"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  value?: Date
  onChange?: (date?: Date) => void
  disabled?: (date: Date) => boolean
  placeholder?: string
  className?: string
  containerClassName?: string
  popoverClassName?: string
  fromYear?: number
  toYear?: number
  defaultMonth?: Date
}

export function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = "DD/MM/AAAA",
  className,
  containerClassName,
  popoverClassName,
  fromYear = 1900,
  toYear = new Date().getFullYear() + 10,
  defaultMonth,
}: DatePickerProps) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(
    value ? format(value, "dd/MM/yyyy") : ""
  )

  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, "dd/MM/yyyy"))
    } else {
      setInputValue("")
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "")
    // Simple mask for DD/MM/YYYY
    if (val.length > 2 && val.length <= 4) {
      val = val.slice(0, 2) + "/" + val.slice(2)
    } else if (val.length > 4) {
      val = val.slice(0, 2) + "/" + val.slice(2, 4) + "/" + val.slice(4, 8)
    }
    setInputValue(val)

    if (val.length === 10) {
      const parsedDate = parse(val, "dd/MM/yyyy", new Date())
      if (isValid(parsedDate)) {
        // check disabled
        if (disabled && disabled(parsedDate)) return;
        if (onChange) onChange(parsedDate)
      }
    } else if (val.length === 0) {
      if (onChange) onChange(undefined)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setInputValue(format(date, "dd/MM/yyyy"))
      if (onChange) onChange(date)
    } else {
      setInputValue("")
      if (onChange) onChange(undefined)
    }
    setIsPopoverOpen(false)
  }

  const handleBlur = () => {
    if (inputValue.length > 0 && inputValue.length < 10) {
      // Revert if invalid
      if (value) setInputValue(format(value, "dd/MM/yyyy"))
      else setInputValue("")
    }
  }

  return (
    <div className={cn("relative", containerClassName)}>
      <div className={cn(
        "flex h-12 w-full items-center justify-between rounded-none border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] hover:bg-white dark:hover:bg-[#111] transition-colors focus-within:border-black dark:focus-within:border-white focus-within:ring-0",
        className
      )}>
        <CalendarIcon className="ml-4 mr-2 h-4 w-4 text-gray-500 shrink-0" strokeWidth={1.5} />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsPopoverOpen(true)}
          onClick={() => setIsPopoverOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-2 py-2 text-xs uppercase font-semibold text-black dark:text-white outline-none placeholder:text-gray-400"
          maxLength={10}
        />
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="h-full rounded-none px-4 hover:bg-transparent"
              type="button"
            >
              <span className="sr-only">Abrir calendario</span>
              <ChevronDown className="h-4 w-4 text-gray-500 hover:text-black dark:hover:text-white" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className={cn("w-auto p-0 z-[100] rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a]", popoverClassName)} 
            align="end"
          >
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              disabled={disabled}
              initialFocus
              locale={es}
              captionLayout="dropdown-buttons"
              fromYear={fromYear}
              toYear={toYear}
              defaultMonth={value || defaultMonth || new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
