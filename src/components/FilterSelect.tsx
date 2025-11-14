import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
    label: string;
    value: string[];  // Ubah jadi array
    onChange: (val: string[]) => void;  // Ubah jadi array
    options: string[];
    placeholder?: string;
};

export default function FilterSelect({
    label,
    value,
    onChange,
    options,
    placeholder,
}: Props) {
    const [open, setOpen] = useState(false);
    const items = useMemo(() => options, [options]);

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

    useLayoutEffect(() => {
        const measure = () => {
            const w = triggerRef.current?.offsetWidth ?? null;
            setTriggerWidth(w);
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [open, items]);

    const toggleValue = (val: string) => {
        if (value.includes(val)) {
            onChange(value.filter(v => v !== val));
        } else {
            onChange([...value, val]);
        }
    };

    const removeValue = (val: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== val));
    };

    return (
        <div className="mt-4">
            <label className="block text-xs mb-1">{label}</label>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between text-sm h-auto min-h-10 py-2"
                        ref={triggerRef}
                    >
                        <div className="flex flex-wrap gap-1 flex-1 text-left">
                            {value.length === 0 ? (
                                <span className="text-muted-foreground">
                                    {placeholder ?? `Pilih ${label.toLowerCase()}`}
                                </span>
                            ) : (
                                value.map((v) => (
                                    <Badge
                                        key={v}
                                        variant="secondary"
                                        className="text-xs px-2 py-0"
                                    >
                                        {v}
                                        <X
                                            className="ml-1 h-3 w-3 cursor-pointer"
                                            onClick={(e) => removeValue(v, e)}
                                        />
                                    </Badge>
                                ))
                            )}
                        </div>
                        <ChevronsUpDown className="opacity-50 ml-2 flex-shrink-0 h-4 w-4" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="p-0"
                    style={triggerWidth ? { width: `${triggerWidth}px` } : undefined}
                >
                    <Command>
                        <CommandInput placeholder={`Cari ${label.toLowerCase()}...`} className="h-9" />
                        <CommandList>
                            <CommandEmpty>Tidak ditemukan.</CommandEmpty>

                            <CommandGroup>
                                <CommandItem
                                    onSelect={() => {
                                        onChange([]);
                                        setOpen(false);
                                    }}
                                >
                                    <div className="flex w-full items-center justify-between">
                                        <span className={value.length === 0 ? "font-semibold" : ""}>
                                            Semua
                                        </span>
                                        <Check className={value.length === 0 ? "opacity-100" : "opacity-0"} />
                                    </div>
                                </CommandItem>

                                {items.map((opt) => (
                                    <CommandItem
                                        key={opt}
                                        onSelect={() => toggleValue(opt)}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <span className={value.includes(opt) ? "font-semibold" : ""}>
                                                {opt}
                                            </span>
                                            <Check className={value.includes(opt) ? "opacity-100" : "opacity-0"} />
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}