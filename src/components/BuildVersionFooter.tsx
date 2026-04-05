/** Глобальный футер с временем сборки (задаётся при next build) */
export function BuildVersionFooter() {
  const ver = process.env.NEXT_PUBLIC_BUILD_TIME ?? "local";
  return (
    <footer className="border-t border-[var(--border)]/60 bg-[var(--bg)]/50 py-3 text-center text-[10px] text-[var(--muted-light)]">
      ver: {ver}
    </footer>
  );
}
