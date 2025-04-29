import {
  deleteSessionTokenCookie,
  getCurrentSession,
  invalidateSession,
} from "@/lib/db/session";
import { ActionResult } from "next/dist/server/app-render/types";
import { redirect } from "next/navigation";

async function signOut(): Promise<ActionResult> {
  // Implement sign out logic here
  "use server";
  const { session } = await getCurrentSession();
  if (!session) return;
  await invalidateSession(session.id);
  await deleteSessionTokenCookie();
  return redirect("/login");
}

export default async function Page() {
  const { user } = await getCurrentSession();

  return (
    <>
      {!!user ? (
        <div>
          <p>Welcome, {user.username}!</p>
          <button onClick={signOut}> Sign Out</button>
        </div>
      ) : (
        <div>
          <p>Please log in to continue.</p>
          <a href="/api/auth/github">Login</a>
        </div>
      )}
    </>
  );
}
