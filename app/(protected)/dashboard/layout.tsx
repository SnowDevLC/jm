import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <AppSidebar session={session} />
        <div className="flex-1 min-w-0 overflow-auto">{children}</div>
    </SidebarProvider>
  );
}
