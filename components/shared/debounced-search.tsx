"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DebouncedSearchProps {
  initialValue: string;
  onCommit: (value: string) => void;
  placeholder: string;
  label: string;
  delay?: number;
}

/**
 * Search box that reports its value after a pause in typing.
 *
 * The caller remounts this with `key={activeValue}` when the URL changes, so
 * there's no prop-to-state syncing effect to keep straight.
 */
export default function DebouncedSearch({
  initialValue,
  onCommit,
  placeholder,
  label,
  delay = 350,
}: DebouncedSearchProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (value === initialValue) return;
    const timer = setTimeout(() => onCommit(value), delay);
    return () => clearTimeout(timer);
  }, [value, initialValue, onCommit, delay]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2" />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="pl-11 pr-11"
      />
      {value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
