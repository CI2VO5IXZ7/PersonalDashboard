import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DockBar } from "@/components/dock-bar";
import { DashboardBg } from "@/components/dashboard-bg";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardBg>
      {children}
      <DockBar />
    </DashboardBg>
  );
}
