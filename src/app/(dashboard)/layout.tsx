import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DockBar } from "@/components/dock-bar";

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
    <div className="min-h-screen bg-background pb-24">
      {children}
      <DockBar />
    </div>
  );
}
