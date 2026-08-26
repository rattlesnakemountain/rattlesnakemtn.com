import type { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Footer } from "./footer";

// The legal pages borrow the station's voice: the same plate in the corner,
// the same hairlines, prose set narrower than the instrument panel.
export function LegalPage({
  title,
  updated,
  lede,
  children,
}: {
  title: string;
  updated: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen pb-4">
      <header className="mx-auto flex w-full max-w-3xl items-baseline justify-between px-5 pt-8 pb-6 sm:pt-12">
        <div>
          <a
            href="/"
            className="font-display text-2xl font-semibold tracking-tight transition-colors hover:text-(--accent) sm:text-3xl"
          >
            Rattlesnake Mountain
          </a>
          <p className="font-mono mt-1.5 text-[11px] tracking-[0.08em] text-(--fg-2)">
            47.4706°N&nbsp; 121.8254°W&nbsp; · &nbsp;WASHINGTON, USA
          </p>
        </div>
        <ThemeToggle />
      </header>

      <article className="mx-auto w-full max-w-3xl px-5 pt-6">
        <div className="flex items-baseline justify-between border-b hairline pb-2">
          <h1 className="eyebrow">{title}</h1>
          <span className="font-mono text-[11px] text-(--muted)">
            UPDATED {updated}
          </span>
        </div>
        {lede && (
          <p className="font-display mt-6 text-xl leading-snug tracking-tight sm:text-2xl">
            {lede}
          </p>
        )}
        <div className={lede ? "mt-8" : "mt-6"}>{children}</div>
      </article>

      <Footer width="max-w-3xl" />
    </main>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="eyebrow mt-10 mb-3 first:mt-0">{children}</h2>;
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 text-[15px] leading-relaxed text-(--fg-2) first:mt-0">
      {children}
    </p>
  );
}

export function List({ children }: { children: ReactNode }) {
  return (
    <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-(--fg-2)">
      {children}
    </ul>
  );
}

export function Item({ children }: { children: ReactNode }) {
  return (
    <li className="relative pl-4 before:absolute before:left-0 before:text-(--muted) before:content-['·']">
      {children}
    </li>
  );
}

// STE sets safety text apart from descriptive text. The alpenglow note is
// reserved elsewhere for the live indicator; here it marks the one section a
// reader must not skip.
export function Warning({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 border-l-2 border-(--live) pl-4">
      <h2 className="eyebrow mb-3 text-(--live)">Warning — {title}</h2>
      {children}
    </section>
  );
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="text-(--fg) underline decoration-(--line) underline-offset-2 transition-colors hover:text-(--accent) hover:decoration-(--accent)"
    >
      {children}
    </a>
  );
}
