import type { Metadata } from "next";
import { AdminNav } from "./AdminNav";

/** Отдельная иконка вкладки для бэк-офиса (голубая), публичный сайт — зелёный `app/icon.svg`. */
export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/admin-favicon.svg", type: "image/svg+xml" }],
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-theme">
      <AdminNav />
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
