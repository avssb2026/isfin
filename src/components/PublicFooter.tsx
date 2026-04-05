export function PublicFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--border)] bg-[var(--surface)]/80 py-12 sm:mt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Сведения на сайте носят ознакомительный характер и не являются публичной офертой. Условия
          продукта, суммы и сроки определяются индивидуально при одобрении сделки.
        </p>
        <p className="mt-4 text-xs text-[var(--muted-light)]">
          © {new Date().getFullYear()} · Ипотека Мурабаха
        </p>
      </div>
    </footer>
  );
}
