"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
  description?: string
}

interface ComboboxProps {
  value: string
  onValueChange: (value: string) => void
  options: ComboboxOption[]
  placeholder?: string
  emptyText?: string
  allowCustomValue?: boolean
  disabled?: boolean
  dir?: "ltr" | "rtl"
  className?: string
}

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  emptyText = "No results found.",
  allowCustomValue = false,
  disabled = false,
  dir = "ltr",
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue)
    setInputValue(selectedValue)
    setOpen(false)
  }

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    if (allowCustomValue) {
      onValueChange(newValue)
    }
  }

  const displayValue = value || placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            dir === "rtl" && "text-right",
            className
          )}
          disabled={disabled}
          dir={dir}
        >
          <span className="truncate">{displayValue}</span>
          <svg
            className={cn(
              "h-4 w-4 shrink-0 opacity-50",
              dir === "rtl" ? "mr-2" : "ml-2"
            )}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align={dir === "rtl" ? "end" : "start"}
        dir={dir}
      >
        <Command shouldFilter={!allowCustomValue}>
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onValueChange={handleInputChange}
            dir={dir}
            className={dir === "rtl" ? "text-right" : ""}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  dir={dir}
                  className={dir === "rtl" ? "text-right" : ""}
                >
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center w-full justify-between">
                      <span>{option.label}</span>
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0",
                          dir === "rtl" ? "mr-2" : "ml-2"
                        )}
                      />
                    </div>
                    {option.description && (
                      <span className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
