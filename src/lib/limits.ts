import { randomUUID } from "crypto";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "dd_session";
export const DAILY_LIMIT = Number(process.env.GENERATION_DAILY_LIMIT ?? 5);

/** Number of generations this session has started in the last 24h. */
export async function usageLast24h(sessionId: string): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return db.generationRequest.count({
    where: { sessionId, createdAt: { gte: since } },
  });
}

export function newSessionId(): string {
  return randomUUID();
}
