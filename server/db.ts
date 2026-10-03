import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, investorProfiles, users, portfolioPositions, alerts, alertEvents } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) { try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); } }
  return _db;
}
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId }; const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date(); if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0]; }
export async function listInvestorProfiles(openId: string) { const db = await getDb(); if (!db) return []; return db.select().from(investorProfiles).where(eq(investorProfiles.openId, openId)); }
export async function getInvestorProfile(openId: string) { return (await listInvestorProfiles(openId))[0]; }
export async function getInvestorProfileByKey(openId: string, profileKey: string) { const db = await getDb(); if (!db) return undefined; return (await db.select().from(investorProfiles).where(and(eq(investorProfiles.openId, openId), eq(investorProfiles.profileKey, profileKey))).limit(1))[0]; }
export async function upsertInvestorProfile(profile: { profileKey: string; openId: string; name: string; goal: string; horizon: string; risk: string }) {
  const db = await getDb(); if (!db) return;
  await db.insert(investorProfiles).values(profile).onDuplicateKeyUpdate({ set: { name: profile.name, goal: profile.goal, horizon: profile.horizon, risk: profile.risk, updatedAt: new Date() } });
}
export async function listPositions(profileKey: string) { const db = await getDb(); if (!db) return []; return db.select().from(portfolioPositions).where(eq(portfolioPositions.profileKey, profileKey)); }
export async function replacePositions(profileKey: string, positions: Array<{ symbol: string; quantity: string; averagePrice: string; currency: string }>) {
  const db = await getDb(); if (!db) return;
  for (const position of positions) {
    const existing = (await db.select().from(portfolioPositions).where(and(eq(portfolioPositions.profileKey, profileKey), eq(portfolioPositions.symbol, position.symbol))).limit(1))[0];
    if (existing) await db.update(portfolioPositions).set({ quantity: position.quantity, averagePrice: position.averagePrice, currency: position.currency, updatedAt: new Date() }).where(eq(portfolioPositions.id, existing.id));
    else await db.insert(portfolioPositions).values({ profileKey, ...position });
  }
}
export async function listAlerts(profileKey: string) { const db = await getDb(); if (!db) return []; return db.select().from(alerts).where(eq(alerts.profileKey, profileKey)); }
export async function createAlert(alert: { profileKey: string; symbol: string; kind: string; threshold: string }) { const db = await getDb(); if (!db) return; await db.insert(alerts).values(alert); }
export async function toggleAlert(profileKey: string, id: number, enabled: boolean) { const db = await getDb(); if (!db) return; await db.update(alerts).set({ enabled: enabled ? 1 : 0, updatedAt: new Date() }).where(and(eq(alerts.id, id), eq(alerts.profileKey, profileKey))); }
export async function listAllEnabledAlerts() { const db = await getDb(); if (!db) return []; return db.select().from(alerts).where(eq(alerts.enabled, 1)); }
export async function listAlertEvents(profileKey: string) { const db = await getDb(); if (!db) return []; return db.select().from(alertEvents).where(eq(alertEvents.profileKey, profileKey)); }
export async function createAlertEvent(event: { profileKey: string; alertId: number; symbol: string; message: string }) { const db = await getDb(); if (!db) return; await db.insert(alertEvents).values(event); }
