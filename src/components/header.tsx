import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-baseline justify-between px-5 pt-8 pb-6 sm:pt-12">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Rattlesnake Mountain
        </h1>
        {/* The station plate: this site is an instrument on a tower. */}
        <p className="font-mono mt-1.5 text-[11px] tracking-[0.08em] text-(--fg-2)">
          47.4706°N&nbsp; 121.8254°W&nbsp; · &nbsp;WASHINGTON, USA
        </p>
      </div>
      <ThemeToggle />
    </header>
  );
}
