// app/admin/episodes/create/page.tsx
import { db } from "@/lib/db/drizzle";
import { topics } from "@/lib/db/schema";
import { CreateEpisodeForm } from "@/components/admin/create-episode-form";
import { createEpisode } from "@/lib/actions/episodes";

// This is a Server Component page
export default async function CreateEpisodePage() {
  // Fetch topics from the database
  const availableTopics = await db.select().from(topics);

  return (
    <div className="space-y-6 h-full">
      <div>
        <h3 className="text-lg font-medium">Create New Episode</h3>
        <p className="text-sm text-muted-foreground">
          Schedule a new upcoming episode session.
        </p>
      </div>
      {/* You might add a Separator here if needed */}
      <CreateEpisodeForm topics={availableTopics} action={createEpisode} />
    </div>
  );
}
