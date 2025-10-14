import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"; // sesuaikan path jika berbeda
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";

type Props = {
    label: string;
    value: string;
    onChange: (val: string) => void;
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

    return (
        <div className="mt-4">
            <label className="block text-xs mb-1">{label}</label>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between text-sm h-10"
                        ref={triggerRef}
                    >
                        <span className="truncate flex-1 text-left">
                            {value ? value : placeholder ?? `Pilih ${label.toLowerCase()}`}
                        </span>
                        <ChevronsUpDown className="opacity-50 ml-2 flex-shrink-0" />
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
                                    value=""
                                    onSelect={(currentValue) => {
                                        onChange(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <div className="flex w-full items-center justify-between">
                                        <span className={(value === "" ? "font-semibold" : "")}>Semua</span>
                                        <Check className={(value === "" ? "opacity-100" : "opacity-0")} />
                                    </div>
                                </CommandItem>

                                {items.map((opt) => (
                                    <CommandItem
                                        key={opt}
                                        value={opt}
                                        onSelect={(currentValue) => {
                                            onChange(currentValue === value ? "" : currentValue);
                                            setOpen(false);
                                        }}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <span className={(value === opt ? "font-semibold" : "")}>{opt}</span>
                                            <Check className={(value === opt ? "opacity-100" : "opacity-0")} />
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