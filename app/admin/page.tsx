import React from "react";
import { episodes } from "@/lib/db/schema";
import { db } from "@/lib/db/drizzle";
import EpisodesTable from "@/components/admin/episodes-table";

// Basic Admin Dashboard Page
export default async function AdminDashboardPage() {
  const allEpisodes = await db.select().from(episodes);

  return (
    <div className="space-y-4">
      <h1>Admin Dashboard</h1>

      {/* Episodes Table */}
      <EpisodesTable allEpisodes={allEpisodes} />
    </div>
  );
}
