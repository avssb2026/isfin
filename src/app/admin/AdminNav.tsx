"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <span className="font-semibold text-[var(--text)]">Бэк-офис</span>
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link href="/admin/leads" className="text-[var(--accent)] hover:underline">
            CRM — заявки
          </Link>
          <Link href="/admin/chat" className="text-[var(--accent)] hover:underline">
            Онлайн-чат
          </Link>
          <Link href="/admin/settings" className="text-[var(--accent)] hover:underline">
            Калькулятор
          </Link>
          <Link href="/" className="text-[var(--muted)] hover:text-[var(--text)]">
            Сайт
          </Link>
        </nav>
        <button
          type="button"
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--bg)]"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          Выйти
        </button>
      </div>
    </header>
  );
}
