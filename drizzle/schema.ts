import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const investorProfiles = mysqlTable("investor_profiles", {
  id: int("id").autoincrement().primaryKey(),
  profileKey: varchar("profileKey", { length: 120 }).notNull().unique(),
  openId: varchar("openId", { length: 64 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  goal: varchar("goal", { length: 120 }).notNull(),
  horizon: varchar("horizon", { length: 80 }).notNull(),
  risk: varchar("risk", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const portfolioPositions = mysqlTable("portfolio_positions", {
  id: int("id").autoincrement().primaryKey(),
  profileKey: varchar("profileKey", { length: 120 }).notNull(),
  symbol: varchar("symbol", { length: 32 }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 6 }).notNull(),
  averagePrice: decimal("averagePrice", { precision: 18, scale: 6 }).notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("EUR"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export const portfolioTransactions = mysqlTable("portfolio_transactions", {
  id: int("id").autoincrement().primaryKey(),
  profileKey: varchar("profileKey", { length: 120 }).notNull(),
  symbol: varchar("symbol", { length: 32 }).notNull(),
  side: varchar("side", { length: 16 }).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 6 }).notNull(),
  price: decimal("price", { precision: 18, scale: 6 }).notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("EUR"),
  executedAt: timestamp("executedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export const portfolioSnapshots = mysqlTable("portfolio_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  profileKey: varchar("profileKey", { length: 120 }).notNull(),
  totalValue: decimal("totalValue", { precision: 18, scale: 2 }).notNull(),
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
  source: varchar("source", { length: 64 }).notNull().default("manual"),
});

export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  profileKey: varchar("profileKey", { length: 120 }).notNull(),
  symbol: varchar("symbol", { length: 32 }).notNull(),
  kind: varchar("kind", { length: 32 }).notNull(),
  threshold: decimal("threshold", { precision: 18, scale: 6 }).notNull(),
  enabled: int("enabled").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const alertEvents = mysqlTable("alert_events", {
  id: int("id").autoincrement().primaryKey(),
  profileKey: varchar("profileKey", { length: 120 }).notNull(),
  alertId: int("alertId").notNull(),
  symbol: varchar("symbol", { length: 32 }).notNull(),
  message: varchar("message", { length: 255 }).notNull(),
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  acknowledged: int("acknowledged").notNull().default(0),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type InvestorProfile = typeof investorProfiles.$inferSelect;
export type InsertInvestorProfile = typeof investorProfiles.$inferInsert;
export type PortfolioPosition = typeof portfolioPositions.$inferSelect;
export type PortfolioTransaction = typeof portfolioTransactions.$inferSelect;
export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type AlertEvent = typeof alertEvents.$inferSelect;
