// app/admin/page.tsx
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

// Basic Admin Dashboard Page
export default function AdminDashboardPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin area.</p>

      <div className="py-4">
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/admin/episodes/create"
        >
          Enter a New Episode
        </Link>
      </div>
    </div>
  );
}
