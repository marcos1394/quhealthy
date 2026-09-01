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

  const displayValue = options.find((opt) => opt.value === value)?.label || value;

  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return options;
    const lowerInput = inputValue.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lowerInput) ||
        opt.value.toLowerCase().includes(lowerInput)
    );
  }, [options, inputValue]);

  const exactMatch = options.find(
    (opt) =>
      opt.label.toLowerCase() === inputValue.toLowerCase() ||
      opt.value.toLowerCase() === inputValue.toLowerCase()
  );

  const showCreate = inputValue.trim().length > 0 && !exactMatch;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full h-11 px-4 justify-between bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-[#111] focus:ring-2 focus:ring-emerald-500/20"
        >
          <span className="truncate">{displayValue || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="z-[9999] w-[var(--radix-popover-trigger-width)] p-1 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar o escribir..."
            className="text-xs font-semibold h-9"
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList className="max-h-56 overflow-y-auto p-1">
            <CommandEmpty className="p-3 text-xs text-center text-gray-500">
              {inputValue ? (
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                  onClick={() => {
                    onChange(inputValue);
                    setOpen(false);
                    setInputValue("");
                  }}
                >
                  Usar "{inputValue}"
                </button>
              ) : (
                "No se encontraron opciones"
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                    setInputValue("");
                  }}
                  className="text-xs font-semibold px-3 py-2 cursor-pointer rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-emerald-600",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
              {showCreate && (
                <CommandItem
                  value={inputValue}
                  onSelect={() => {
                    onChange(inputValue);
                    setOpen(false);
                    setInputValue("");
                  }}
                  className="text-xs font-bold px-3 py-2 cursor-pointer rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  Crear "{inputValue}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
