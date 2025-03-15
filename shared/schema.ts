import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parentId: integer("parent_id").references(() => categories.id),
  icon: text("icon"),
});

// Guides table
export const guides = pgTable("guides", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  featuredImage: text("featured_image"),
  tags: text("tags").array(),
  patch: text("patch"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recently viewed guides
export const recentlyViewed = pgTable("recently_viewed", {
  id: serial("id").primaryKey(),
  guideId: integer("guide_id").references(() => guides.id).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow(),
  sessionId: text("session_id").notNull(),
});

// Community tips
export const tips = pgTable("tips", {
  id: serial("id").primaryKey(),
  guideId: integer("guide_id").references(() => guides.id).notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  helpfulCount: integer("helpful_count").default(0),
});

// Game sync data
export const gameSync = pgTable("game_sync", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  characterName: text("character_name").notNull(),
  characterClass: text("character_class").notNull(),
  characterLevel: integer("character_level").notNull(),
  questProgress: jsonb("quest_progress"),
  inventory: jsonb("inventory"),
  abilities: jsonb("abilities"),
  lastSyncedAt: timestamp("last_synced_at").defaultNow(),
});

// Insert Schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertGuideSchema = createInsertSchema(guides).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecentlyViewedSchema = createInsertSchema(recentlyViewed).omit({
  id: true,
  viewedAt: true,
});

export const insertTipSchema = createInsertSchema(tips).omit({
  id: true,
  createdAt: true,
  helpfulCount: true,
});

export const insertGameSyncSchema = createInsertSchema(gameSync).omit({
  id: true,
  lastSyncedAt: true,
});

// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Guide = typeof guides.$inferSelect;
export type InsertGuide = z.infer<typeof insertGuideSchema>;

export type RecentlyViewed = typeof recentlyViewed.$inferSelect;
export type InsertRecentlyViewed = z.infer<typeof insertRecentlyViewedSchema>;

export type Tip = typeof tips.$inferSelect;
export type InsertTip = z.infer<typeof insertTipSchema>;

export type GameSync = typeof gameSync.$inferSelect;
export type InsertGameSync = z.infer<typeof insertGameSyncSchema>;
