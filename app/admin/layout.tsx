// app/admin/layout.tsx
import { getCurrentSession } from "@/lib/db/session";
import { redirect } from "next/navigation";
import React from "react";

// Basic layout for the admin section
// You might want to add admin-specific navigation, headers, etc. here
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentSession();
  if (!user) {
    return redirect("/en/login");
  }
  return (
    <html>
      <body>
        <div className="admin-section">
          {/* Example: Add an admin header or sidebar here later */}
          <main className="p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
