import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function OperatorsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin/login?callbackUrl=/admin/operators");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/admin/leads");
  }
  return <>{children}</>;
}
