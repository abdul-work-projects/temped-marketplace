"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  availableTags: string[];
  placeholder?: string;
  loading?: boolean;
}

export default function TagInput({
  value,
  onChange,
  availableTags,
  placeholder = "Select tags...",
  loading,
}: TagInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const toggleTag = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  };

  const filtered = availableTags.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex flex-wrap gap-2 w-full px-3 py-2 border border-input rounded-md focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] cursor-pointer min-h-[42px]"
        onClick={() => setOpen(!open)}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-muted text-foreground text-sm px-2.5 py-1 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <span className="text-sm text-muted-foreground py-1">
            {loading ? "Loading tags..." : placeholder}
          </span>
        )}
        <ChevronDown
          size={16}
          className={`ml-auto self-center text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tags..."
              className="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No tags found
            </div>
          ) : (
            filtered.map((tag) => {
              const selected = value.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTag(tag);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                    selected
                      ? "bg-primary/5 text-primary font-medium"
                      : "text-foreground"
                  }`}
                >
                  <div
                    className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 ${
                      selected
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {selected && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  {tag}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
