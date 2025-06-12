import {
  users,
  organizations,
  campaigns,
  donations,
  campaignRatings,
  adminLogs,
  campaignUpdates,
  categories,
  type User,
  type InsertUser,
  type Organization,
  type InsertOrganization,
  type Campaign,
  type InsertCampaign,
  type Donation,
  type InsertDonation,
  type CampaignRating,
  type InsertCampaignRating,
  type AdminLog,
  type InsertAdminLog,
  type CampaignUpdate,
  type InsertCampaignUpdate,
  type Category,
  type InsertCategory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(id: number, role: 'user' | 'organization' | 'admin'): Promise<void>;

  // Organization operations
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationByUserId(userId: number): Promise<Organization | undefined>;
  updateOrganizationStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<void>;
  getPendingOrganizations(): Promise<Organization[]>;
  getApprovedOrganizations(): Promise<(Organization & { user: User })[]>;

  // Campaign operations
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignWithDetails(id: number): Promise<(Campaign & { organization: Organization & { user: User }, category: Category }) | undefined>;
  getCampaigns(): Promise<(Campaign & { organization: Organization & { user: User }, category: Category })[]>;
  getCampaignsByOrganization(organizationId: number): Promise<Campaign[]>;
  updateCampaignStatus(id: number, status: 'pending' | 'approved' | 'rejected' | 'completed' | 'disabled'): Promise<void>;
  updateCampaignRaised(id: number, amount: string): Promise<void>;
  getPendingCampaigns(): Promise<(Campaign & { organization: Organization & { user: User }, category: Category })[]>;
  getActiveCampaigns(): Promise<(Campaign & { organization: Organization & { user: User }, category: Category })[]>;

  // Donation operations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationsByUser(userId: number): Promise<(Donation & { campaign: Campaign & { organization: Organization } })[]>;
  getDonationsByCampaign(campaignId: number): Promise<(Donation & { user: User })[]>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Rating operations
  createCampaignRating(rating: InsertCampaignRating): Promise<CampaignRating>;
  getCampaignRatings(campaignId: number): Promise<(CampaignRating & { user: User })[]>;

  // Admin log operations
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  getAdminLogs(): Promise<(AdminLog & { admin: User })[]>;

  // Campaign update operations
  createCampaignUpdate(update: InsertCampaignUpdate): Promise<CampaignUpdate>;
  getCampaignUpdates(campaignId: number): Promise<CampaignUpdate[]>;

  // Statistics
  getPlatformStats(): Promise<{
    totalRaised: string;
    activeCampaigns: number;
    verifiedOrgs: number;
    totalDonors: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserRole(id: number, role: 'user' | 'organization' | 'admin'): Promise<void> {
    await db.update(users).set({ role }).where(eq(users.id, id));
  }

  // Organization operations
  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const [org] = await db.insert(organizations).values(insertOrg).returning();
    return org;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async getOrganizationByUserId(userId: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.userId, userId));
    return org;
  }

  async updateOrganizationStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    await db.update(organizations).set({ status }).where(eq(organizations.id, id));
  }

  async getPendingOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations).where(eq(organizations.status, 'pending'));
  }

  async getApprovedOrganizations(): Promise<(Organization & { user: User })[]> {
    return await db
      .select()
      .from(organizations)
      .innerJoin(users, eq(organizations.userId, users.id))
      .where(eq(organizations.status, 'approved'))
      .then(rows => rows.map(row => ({ ...row.organizations, user: row.users })));
  }

  // Campaign operations
  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(insertCampaign).returning();
    return campaign;
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async getCampaignWithDetails(id: number): Promise<(Campaign & { organization: Organization & { user: User }, category: Category }) | undefined> {
    const [result] = await db
      .select()
      .from(campaigns)
      .innerJoin(organizations, eq(campaigns.organizationId, organizations.id))
      .innerJoin(users, eq(organizations.userId, users.id))
      .innerJoin(categories, eq(campaigns.categoryId, categories.id))
      .where(eq(campaigns.id, id));

    if (!result) return undefined;

    return {
      ...result.campaigns,
      organization: { ...result.organizations, user: result.users },
      category: result.categories
    };
  }

  async getCampaigns(): Promise<(Campaign & { organization: Organization & { user: User }, category: Category })[]> {
    const results = await db
      .select()
      .from(campaigns)
      .innerJoin(organizations, eq(campaigns.organizationId, organizations.id))
      .innerJoin(users, eq(organizations.userId, users.id))
      .innerJoin(categories, eq(campaigns.categoryId, categories.id))
      .where(eq(campaigns.status, 'approved'))
      .orderBy(desc(campaigns.createdAt));

    return results.map(result => ({
      ...result.campaigns,
      organization: { ...result.organizations, user: result.users },
      category: result.categories
    }));
  }

  async getCampaignsByOrganization(organizationId: number): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.organizationId, organizationId))
      .orderBy(desc(campaigns.createdAt));
  }

  async updateCampaignStatus(id: number, status: 'pending' | 'approved' | 'rejected' | 'completed' | 'disabled'): Promise<void> {
    await db.update(campaigns).set({ status }).where(eq(campaigns.id, id));
  }

  async updateCampaignRaised(id: number, amount: string): Promise<void> {
    await db.update(campaigns).set({ raised: amount }).where(eq(campaigns.id, id));
  }

  async getPendingCampaigns(): Promise<(Campaign & { organization: Organization & { user: User }, category: Category })[]> {
    const results = await db
      .select()
      .from(campaigns)
      .innerJoin(organizations, eq(campaigns.organizationId, organizations.id))
      .innerJoin(users, eq(organizations.userId, users.id))
      .innerJoin(categories, eq(campaigns.categoryId, categories.id))
      .where(eq(campaigns.status, 'pending'))
      .orderBy(desc(campaigns.createdAt));

    return results.map(result => ({
      ...result.campaigns,
      organization: { ...result.organizations, user: result.users },
      category: result.categories
    }));
  }

  async getActiveCampaigns(): Promise<(Campaign & { organization: Organization & { user: User }, category: Category })[]> {
    const results = await db
      .select()
      .from(campaigns)
      .innerJoin(organizations, eq(campaigns.organizationId, organizations.id))
      .innerJoin(users, eq(organizations.userId, users.id))
      .innerJoin(categories, eq(campaigns.categoryId, categories.id))
      .where(eq(campaigns.status, 'approved'))
      .orderBy(desc(campaigns.createdAt));

    return results.map(result => ({
      ...result.campaigns,
      organization: { ...result.organizations, user: result.users },
      category: result.categories
    }));
  }

  // Donation operations
  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const [donation] = await db.insert(donations).values(insertDonation).returning();
    
    // Update campaign raised amount
    const totalResult = await db
      .select({ total: sql<string>`sum(${donations.amount})` })
      .from(donations)
      .where(eq(donations.campaignId, insertDonation.campaignId));
    
    if (totalResult[0]?.total) {
      await this.updateCampaignRaised(insertDonation.campaignId, totalResult[0].total);
    }

    return donation;
  }

  async getDonationsByUser(userId: number): Promise<(Donation & { campaign: Campaign & { organization: Organization } })[]> {
    const results = await db
      .select()
      .from(donations)
      .innerJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .innerJoin(organizations, eq(campaigns.organizationId, organizations.id))
      .where(eq(donations.userId, userId))
      .orderBy(desc(donations.createdAt));

    return results.map(result => ({
      ...result.donations,
      campaign: { ...result.campaigns, organization: result.organizations }
    }));
  }

  async getDonationsByCampaign(campaignId: number): Promise<(Donation & { user: User })[]> {
    const results = await db
      .select()
      .from(donations)
      .innerJoin(users, eq(donations.userId, users.id))
      .where(eq(donations.campaignId, campaignId))
      .orderBy(desc(donations.createdAt));

    return results.map(result => ({
      ...result.donations,
      user: result.users
    }));
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  // Rating operations
  async createCampaignRating(insertRating: InsertCampaignRating): Promise<CampaignRating> {
    const [rating] = await db.insert(campaignRatings).values(insertRating).returning();
    return rating;
  }

  async getCampaignRatings(campaignId: number): Promise<(CampaignRating & { user: User })[]> {
    const results = await db
      .select()
      .from(campaignRatings)
      .innerJoin(users, eq(campaignRatings.userId, users.id))
      .where(eq(campaignRatings.campaignId, campaignId))
      .orderBy(desc(campaignRatings.createdAt));

    return results.map(result => ({
      ...result.campaign_ratings,
      user: result.users
    }));
  }

  // Admin log operations
  async createAdminLog(insertLog: InsertAdminLog): Promise<AdminLog> {
    const [log] = await db.insert(adminLogs).values(insertLog).returning();
    return log;
  }

  async getAdminLogs(): Promise<(AdminLog & { admin: User })[]> {
    const results = await db
      .select()
      .from(adminLogs)
      .innerJoin(users, eq(adminLogs.adminId, users.id))
      .orderBy(desc(adminLogs.createdAt))
      .limit(50);

    return results.map(result => ({
      ...result.admin_logs,
      admin: result.users
    }));
  }

  // Campaign update operations
  async createCampaignUpdate(insertUpdate: InsertCampaignUpdate): Promise<CampaignUpdate> {
    const [update] = await db.insert(campaignUpdates).values(insertUpdate).returning();
    return update;
  }

  async getCampaignUpdates(campaignId: number): Promise<CampaignUpdate[]> {
    return await db
      .select()
      .from(campaignUpdates)
      .where(eq(campaignUpdates.campaignId, campaignId))
      .orderBy(desc(campaignUpdates.createdAt));
  }

  // Statistics
  async getPlatformStats(): Promise<{
    totalRaised: string;
    activeCampaigns: number;
    verifiedOrgs: number;
    totalDonors: number;
  }> {
    const [totalRaisedResult] = await db
      .select({ total: sql<string>`coalesce(sum(${donations.amount}), 0)` })
      .from(donations);

    const [activeCampaignsResult] = await db
      .select({ count: count() })
      .from(campaigns)
      .where(eq(campaigns.status, 'approved'));

    const [verifiedOrgsResult] = await db
      .select({ count: count() })
      .from(organizations)
      .where(eq(organizations.status, 'approved'));

    const [totalDonorsResult] = await db
      .select({ count: sql<number>`count(distinct ${donations.userId})` })
      .from(donations);

    return {
      totalRaised: totalRaisedResult?.total || '0',
      activeCampaigns: activeCampaignsResult?.count || 0,
      verifiedOrgs: verifiedOrgsResult?.count || 0,
      totalDonors: totalDonorsResult?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
