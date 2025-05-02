import { getCurrentSession } from "@/lib/db/session";
import Link from "next/link";

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
          <Link href="/api/auth/github">Login</Link>
        </div>
      )}
    </>
  );
}
