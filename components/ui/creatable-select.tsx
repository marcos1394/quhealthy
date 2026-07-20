import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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

export interface CreatableSelectProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CreatableSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  disabled = false,
}: CreatableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  // Filter options based on input value
  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return options;
    const lowerInput = inputValue.toLowerCase();
    return options.filter(opt => opt.label.toLowerCase().includes(lowerInput));
  }, [options, inputValue]);

  // Determine if we should show the "Create" option
  const exactMatch = options.find(
    (opt) => opt.label.toLowerCase() === inputValue.toLowerCase() || opt.value.toLowerCase() === inputValue.toLowerCase()
  );
  
  const showCreate = inputValue.trim().length > 0 && !exactMatch;

  const displayValue = options.find((opt) => opt.value === value)?.label || value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full h-12 px-4 justify-between bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold uppercase rounded-none hover:bg-gray-100 dark:hover:bg-[#111]"
        >
          {displayValue || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none">
        <Command>
          <CommandInput 
            placeholder="Buscar o escribir nuevo..." 
            className="text-xs font-semibold uppercase rounded-none"
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList className="rounded-none">
            <CommandEmpty className="p-4 text-xs font-semibold uppercase text-center text-gray-500">
              {inputValue ? (
                <button 
                  className="w-full text-left px-2 py-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                  onClick={() => {
                    onChange(inputValue);
                    setOpen(false);
                    setInputValue("");
                  }}
                >
                  CREAR "{inputValue}"
                </button>
              ) : "NO ENCONTRADO."}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : option.value)
                    setOpen(false)
                    setInputValue("")
                  }}
                  className="text-[9px] font-bold uppercase tracking-widest cursor-pointer rounded-none aria-selected:bg-black aria-selected:text-white dark:aria-selected:bg-white dark:aria-selected:text-black"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
              {showCreate && (
                <CommandItem
                  value={inputValue}
                  onSelect={(currentValue) => {
                    onChange(currentValue);
                    setOpen(false);
                    setInputValue("");
                  }}
                  className="text-[9px] font-bold uppercase tracking-widest cursor-pointer rounded-none aria-selected:bg-black aria-selected:text-white dark:aria-selected:bg-white dark:aria-selected:text-black text-blue-600 dark:text-blue-400"
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  CREAR "{inputValue}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
