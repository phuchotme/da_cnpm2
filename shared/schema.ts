import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  decimal,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'organization', 'admin']);
export const campaignStatusEnum = pgEnum('campaign_status', ['pending', 'approved', 'rejected', 'completed', 'disabled']);
export const donationTypeEnum = pgEnum('donation_type', ['money', 'goods']);
export const organizationStatusEnum = pgEnum('organization_status', ['pending', 'approved', 'rejected']);
export const actionTypeEnum = pgEnum('action_type', ['approve_org', 'reject_org', 'approve_campaign', 'reject_campaign', 'extend_campaign', 'disable_campaign']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: userRoleEnum("role").notNull().default('user'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Organizations table
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: organizationStatusEnum("status").notNull().default('pending'),
  documents: text("documents").array(),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default('0'),
  rating: decimal("rating", { precision: 3, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  target: decimal("target", { precision: 10, scale: 2 }).notNull(),
  raised: decimal("raised", { precision: 10, scale: 2 }).default('0'),
  deadline: timestamp("deadline").notNull(),
  status: campaignStatusEnum("status").notNull().default('pending'),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Donations table
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: donationTypeEnum("type").notNull().default('money'),
  anonymous: boolean("anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaign ratings table
export const campaignRatings = pgTable("campaign_ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin logs table
export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id).notNull(),
  actionType: actionTypeEnum("action_type").notNull(),
  targetType: text("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaign updates table
export const campaignUpdates = pgTable("campaign_updates", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true, createdAt: true, successRate: true, rating: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true, raised: true });
export const insertDonationSchema = createInsertSchema(donations).omit({ id: true, createdAt: true });
export const insertCampaignRatingSchema = createInsertSchema(campaignRatings).omit({ id: true, createdAt: true });
export const insertAdminLogSchema = createInsertSchema(adminLogs).omit({ id: true, createdAt: true });
export const insertCampaignUpdateSchema = createInsertSchema(campaignUpdates).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type CampaignRating = typeof campaignRatings.$inferSelect;
export type InsertCampaignRating = z.infer<typeof insertCampaignRatingSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type CampaignUpdate = typeof campaignUpdates.$inferSelect;
export type InsertCampaignUpdate = z.infer<typeof insertCampaignUpdateSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;
