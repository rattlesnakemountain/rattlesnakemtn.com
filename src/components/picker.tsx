import { cn } from "@/lib/utils";

// The pill row every section uses to switch what it is showing.
export function Picker<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.key}
          role="tab"
          aria-selected={o.key === value}
          onClick={() => onChange(o.key)}
          className={cn(
            "font-mono rounded-full px-3 py-1 text-[11px] tracking-wide transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)",
            o.key === value
              ? "bg-(--fg) text-(--bg)"
              : "text-(--fg-2) hover:bg-(--bg-2)"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
