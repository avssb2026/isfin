import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)]/90 bg-[var(--surface-glass)] backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--surface)]/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-bold text-white shadow-md shadow-[var(--accent)]/25"
            aria-hidden
          >
            М
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Исламское финансирование
            </p>
            <p className="text-base font-semibold text-[var(--text)]">Мурабаха</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/product"
            className="hidden rounded-xl px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-subtle)] hover:text-[var(--text)] sm:inline-block"
          >
            Условия
          </Link>
          <Link
            href="/product"
            className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--accent)]/20 transition hover:bg-[var(--accent-hover)]"
          >
            Оформить заявку
          </Link>
        </nav>
      </div>
    </header>
  );
}
