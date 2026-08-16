import type { ReactNode } from "react";

// Every data section is a logbook entry: an eyebrow, its data age on the
// right, then the content under a hairline.
export function Section({
  label,
  age,
  children,
}: {
  label: string;
  age?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pt-12">
      <div className="flex items-baseline justify-between border-b hairline pb-2">
        <h2 className="eyebrow">{label}</h2>
        {age && (
          <span className="font-mono text-[11px] text-(--muted)">{age}</span>
        )}
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}
