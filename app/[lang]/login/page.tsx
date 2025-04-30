import { getCurrentSession } from "@/lib/db/session";

export default async function Page() {
  const { user } = await getCurrentSession();

  return (
    <>
      {!!user ? (
        <div>
          <p>Welcome, {user.username}!</p>
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
