import type { Express } from "express";
import path from "path";
import multer from "multer";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  authenticateToken,
  requireRole,
  hashPassword,
  verifyPassword,
  generateToken,
  type AuthRequest
} from "./auth";
import {
  insertUserSchema,
  loginSchema,
  insertOrganizationSchema,
  insertCampaignSchema,
  insertDonationSchema,
  insertCampaignRatingSchema,
  insertAdminLogSchema,
  insertCampaignUpdateSchema,
  insertCategorySchema
} from "@shared/schema";

// Multer config for file uploads
const storageMulter = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    // Lấy đuôi file gốc
    const ext = path.extname(file.originalname);
    // Đặt tên file: timestamp-random + đuôi gốc
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage: storageMulter });

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default categories
  try {
    const categories = await storage.getCategories();
    if (categories.length === 0) {
      await storage.createCategory({ name: 'Education', icon: 'fas fa-graduation-cap' });
      await storage.createCategory({ name: 'Healthcare', icon: 'fas fa-heartbeat' });
      await storage.createCategory({ name: 'Emergency', icon: 'fas fa-exclamation-triangle' });
      await storage.createCategory({ name: 'Environment', icon: 'fas fa-leaf' });
      await storage.createCategory({ name: 'Community', icon: 'fas fa-users' });
    }
  } catch (error) {
    console.error('Error initializing categories:', error);
  }

  // File upload route
  app.post("/api/upload", upload.array("files"), (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    // Trả về mảng đường dẫn file
    const urls = files.map(file => `/uploads/${file.filename}`);
    res.json({ urls });
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken({ id: user.id, email: user.email, role: user.role });

      res.status(201).json({
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = generateToken({ id: user.id, email: user.email, role: user.role });

      res.json({
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Organization routes
  app.post("/api/organizations", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertOrganizationSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      // Check if user already has an organization
      const existingOrg = await storage.getOrganizationByUserId(req.user!.id);
      if (existingOrg) {
        return res.status(400).json({ message: "User already has an organization application" });
      }

      const organization = await storage.createOrganization(validatedData);
      res.status(201).json(organization);
    } catch (error) {
      console.error("Create organization error:", error);
      res.status(400).json({ message: "Failed to create organization" });
    }
  });

  app.get("/api/organizations", async (req, res) => {
    try {
      const organizations = await storage.getApprovedOrganizations();
      res.json(organizations);
    } catch (error) {
      console.error("Get organizations error:", error);
      res.status(500).json({ message: "Failed to get organizations" });
    }
  });

  app.get("/api/organizations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const organization = await storage.getOrganization(id);

      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      res.json(organization);
    } catch (error) {
      console.error("Get organization error:", error);
      res.status(500).json({ message: "Failed to get organization" });
    }
  });

  app.get("/api/organizations/user/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const organization = await storage.getOrganizationByUserId(req.user!.id);

      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      res.json(organization);
    } catch (error) {
      console.error("Get user organization error:", error);
      res.status(500).json({ message: "Failed to get organization" });
    }
  });

  // Campaign routes
  app.post("/api/campaigns", authenticateToken, requireRole('organization'), async (req: AuthRequest, res) => {
    try {
      const organization = await storage.getOrganizationByUserId(req.user!.id);
      if (!organization || organization.status !== 'approved') {
        return res.status(403).json({ message: "Organization not approved" });
      }

      const validatedData = insertCampaignSchema.parse({
        ...req.body,
        organizationId: organization.id,
      });

      const campaign = await storage.createCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Create campaign error:", error);
      res.status(400).json({ message: "Failed to create campaign" });
    }
  });

  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Get campaigns error:", error);
      res.status(500).json({ message: "Failed to get campaigns" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaignWithDetails(id);

      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      res.json(campaign);
    } catch (error) {
      console.error("Get campaign error:", error);
      res.status(500).json({ message: "Failed to get campaign" });
    }
  });

  app.get("/api/campaigns/organization/me", authenticateToken, requireRole('organization'), async (req: AuthRequest, res) => {
    try {
      const organization = await storage.getOrganizationByUserId(req.user!.id);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      const campaigns = await storage.getCampaignsByOrganization(organization.id);
      res.json(campaigns);
    } catch (error) {
      console.error("Get organization campaigns error:", error);
      res.status(500).json({ message: "Failed to get campaigns" });
    }
  });

  // Donation routes
  app.post("/api/donations", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertDonationSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      // Verify campaign exists and is active
      const campaign = await storage.getCampaign(validatedData.campaignId);
      if (!campaign || campaign.status !== 'approved') {
        return res.status(400).json({ message: "Campaign not available for donations" });
      }

      const donation = await storage.createDonation(validatedData);
      res.status(201).json(donation);
    } catch (error) {
      console.error("Create donation error:", error);
      res.status(400).json({ message: "Failed to create donation" });
    }
  });

  app.get("/api/donations/user/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const donations = await storage.getDonationsByUser(req.user!.id);
      res.json(donations);
    } catch (error) {
      console.error("Get user donations error:", error);
      res.status(500).json({ message: "Failed to get donations" });
    }
  });

  app.get("/api/donations/campaign/:id", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const donations = await storage.getDonationsByCampaign(campaignId);
      res.json(donations);
    } catch (error) {
      console.error("Get campaign donations error:", error);
      res.status(500).json({ message: "Failed to get donations" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "Failed to get categories" });
    }
  });

  // Rating routes
  app.post("/api/ratings", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertCampaignRatingSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const rating = await storage.createCampaignRating(validatedData);
      res.status(201).json(rating);
    } catch (error) {
      console.error("Create rating error:", error);
      res.status(400).json({ message: "Failed to create rating" });
    }
  });

  app.get("/api/ratings/campaign/:id", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const ratings = await storage.getCampaignRatings(campaignId);
      res.json(ratings);
    } catch (error) {
      console.error("Get campaign ratings error:", error);
      res.status(500).json({ message: "Failed to get ratings" });
    }
  });

  // Campaign update routes
  app.post("/api/campaign-updates", authenticateToken, requireRole('organization'), async (req: AuthRequest, res) => {
    try {
      const organization = await storage.getOrganizationByUserId(req.user!.id);
      if (!organization) {
        return res.status(403).json({ message: "Organization not found" });
      }

      const validatedData = insertCampaignUpdateSchema.parse(req.body);

      // Verify the campaign belongs to this organization
      const campaign = await storage.getCampaign(validatedData.campaignId);
      if (!campaign || campaign.organizationId !== organization.id) {
        return res.status(403).json({ message: "Not authorized to update this campaign" });
      }

      const update = await storage.createCampaignUpdate(validatedData);
      res.status(201).json(update);
    } catch (error) {
      console.error("Create campaign update error:", error);
      res.status(400).json({ message: "Failed to create campaign update" });
    }
  });

  app.get("/api/campaign-updates/:campaignId", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const updates = await storage.getCampaignUpdates(campaignId);
      res.json(updates);
    } catch (error) {
      console.error("Get campaign updates error:", error);
      res.status(500).json({ message: "Failed to get campaign updates" });
    }
  });

  // Admin routes
  app.get("/api/admin/organizations/pending", authenticateToken, requireRole('admin'), async (req, res) => {
    try {
      const organizations = await storage.getPendingOrganizations();
      res.json(organizations);
    } catch (error) {
      console.error("Get pending organizations error:", error);
      res.status(500).json({ message: "Failed to get pending organizations" });
    }
  });

  app.put("/api/admin/organizations/:id/approve", authenticateToken, requireRole('admin'), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.updateOrganizationStatus(id, 'approved');

      // Update user role to organization
      const org = await storage.getOrganization(id);
      if (org) {
        await storage.updateUserRole(org.userId, 'organization');
      }

      // Log admin action
      await storage.createAdminLog({
        adminId: req.user!.id,
        actionType: 'approve_org',
        targetType: 'organization',
        targetId: id,
        reason: req.body.reason || 'Organization approved',
      });

      res.json({ message: "Organization approved" });
    } catch (error) {
      console.error("Approve organization error:", error);
      res.status(500).json({ message: "Failed to approve organization" });
    }
  });

  app.put("/api/admin/organizations/:id/reject", authenticateToken, requireRole('admin'), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.updateOrganizationStatus(id, 'rejected');

      // Log admin action
      await storage.createAdminLog({
        adminId: req.user!.id,
        actionType: 'reject_org',
        targetType: 'organization',
        targetId: id,
        reason: req.body.reason || 'Organization rejected',
      });

      res.json({ message: "Organization rejected" });
    } catch (error) {
      console.error("Reject organization error:", error);
      res.status(500).json({ message: "Failed to reject organization" });
    }
  });

  app.get("/api/admin/campaigns/pending", authenticateToken, requireRole('admin'), async (req, res) => {
    try {
      const campaigns = await storage.getPendingCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Get pending campaigns error:", error);
      res.status(500).json({ message: "Failed to get pending campaigns" });
    }
  });

  app.put("/api/admin/campaigns/:id/approve", authenticateToken, requireRole('admin'), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.updateCampaignStatus(id, 'approved');

      // Log admin action
      await storage.createAdminLog({
        adminId: req.user!.id,
        actionType: 'approve_campaign',
        targetType: 'campaign',
        targetId: id,
        reason: req.body.reason || 'Campaign approved',
      });

      res.json({ message: "Campaign approved" });
    } catch (error) {
      console.error("Approve campaign error:", error);
      res.status(500).json({ message: "Failed to approve campaign" });
    }
  });

  app.put("/api/admin/campaigns/:id/reject", authenticateToken, requireRole('admin'), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.updateCampaignStatus(id, 'rejected');

      // Log admin action
      await storage.createAdminLog({
        adminId: req.user!.id,
        actionType: 'reject_campaign',
        targetType: 'campaign',
        targetId: id,
        reason: req.body.reason || 'Campaign rejected',
      });

      res.json({ message: "Campaign rejected" });
    } catch (error) {
      console.error("Reject campaign error:", error);
      res.status(500).json({ message: "Failed to reject campaign" });
    }
  });

  app.get("/api/admin/logs", authenticateToken, requireRole('admin'), async (req, res) => {
    try {
      const logs = await storage.getAdminLogs();
      res.json(logs);
    } catch (error) {
      console.error("Get admin logs error:", error);
      res.status(500).json({ message: "Failed to get admin logs" });
    }
  });

  // Statistics routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Failed to get statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}