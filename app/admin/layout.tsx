// app/admin/layout.tsx
import { getCurrentSession } from "@/lib/db/session";
import { redirect } from "next/navigation";
import React from "react";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { cn, settings } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import AdminSidebarNav from "@/components/admin/admin-sidebar-nav";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" }); // Basic font setup for shadcn
import "../globals.css";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions";
export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Showcasing frontend and automation expertise",
};

// Define the navigation items for the sidebar
const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
  },
  {
    title: "Episodes",
  },
  {
    title: "Create",
    href: "/admin/episodes/create",
  },

  // Add other admin sections here later
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentSession();
  if (!user) {
    return redirect("/en/login");
  }
  if (!settings.admin.githubUsers.includes(user.username)) {
    return redirect("/en/unauth");
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
        )}
      >
        <div className="space-y-6 p-4 md:p-10 pb-16 block">
          <div className="space-y-0.5 flex justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Admin Panel</h2>
              <p className="text-muted-foreground">
                Manage your website content and settings.
              </p>
            </div>
            <Button onClick={logout}>Logout</Button>
          </div>
          <Separator className="my-6" />
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-px-4 lg:w-1/5">
              <AdminSidebarNav items={sidebarNavItems} />
            </aside>
            <div className="flex-1 lg:max-w-none h-full">
              {children} {/* Page content will be rendered here */}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
