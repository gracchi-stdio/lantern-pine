"use server";
import {
  deleteSessionTokenCookie,
  getCurrentSession,
  invalidateSession,
} from "@/lib/db/session";
import { settings } from "@/lib/utils";
import { ActionResult } from "next/dist/server/app-render/types";
import { redirect } from "next/navigation";

export async function logout(): Promise<ActionResult> {
  const { session } = await getCurrentSession();
  if (!session) return;

  await invalidateSession(session.id);
  await deleteSessionTokenCookie();
  return redirect(settings.logoutRedirect);
}
