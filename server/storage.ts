import {
  users,
  campaigns,
  leads,
  files,
  type User,
  type UpsertUser,
  type Campaign,
  type InsertCampaign,
  type Lead,
  type InsertLead,
  type File,
  type InsertFile,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, avg } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Campaign operations
  createCampaign(userId: string, campaign: InsertCampaign): Promise<Campaign>;
  getUserCampaigns(userId: string): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>;
  deleteCampaign(id: string): Promise<void>;
  
  // Lead operations
  createLead(lead: InsertLead): Promise<Lead>;
  getCampaignLeads(campaignId: string): Promise<Lead[]>;
  getUserLeads(userId: string): Promise<Lead[]>;
  updateLead(id: string, updates: Partial<Lead>): Promise<Lead>;
  deleteLead(id: string): Promise<void>;
  getLeadStats(userId: string): Promise<any>;
  
  // File operations
  createFile(userId: string, file: InsertFile): Promise<File>;
  getUserFiles(userId: string): Promise<File[]>;
  getFile(id: string): Promise<File | undefined>;
  deleteFile(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createCampaign(userId: string, campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db
      .insert(campaigns)
      .values({ ...campaign, userId })
      .returning();
    return newCampaign;
  }

  async getUserCampaigns(userId: string): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, userId))
      .orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const [updated] = await db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return updated;
  }

  async deleteCampaign(id: string): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async getCampaignLeads(campaignId: string): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.campaignId, campaignId))
      .orderBy(desc(leads.createdAt));
  }

  async getUserLeads(userId: string): Promise<Lead[]> {
    return await db
      .select({
        id: leads.id,
        campaignId: leads.campaignId,
        businessName: leads.businessName,
        category: leads.category,
        phone: leads.phone,
        email: leads.email,
        website: leads.website,
        address: leads.address,
        city: leads.city,
        state: leads.state,
        zipCode: leads.zipCode,
        rating: leads.rating,
        reviewCount: leads.reviewCount,
        isValidated: leads.isValidated,
        isDuplicate: leads.isDuplicate,
        notes: leads.notes,
        tags: leads.tags,
        contactStatus: leads.contactStatus,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
      })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(eq(campaigns.userId, userId))
      .orderBy(desc(leads.createdAt));
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const [updated] = await db
      .update(leads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updated;
  }

  async deleteLead(id: string): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async getLeadStats(userId: string): Promise<any> {
    const totalLeads = await db
      .select({ count: count() })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(eq(campaigns.userId, userId));

    const validatedLeads = await db
      .select({ count: count() })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(and(eq(campaigns.userId, userId), eq(leads.isValidated, true)));

    const activeCampaigns = await db
      .select({ count: count() })
      .from(campaigns)
      .where(and(eq(campaigns.userId, userId), eq(campaigns.status, "running")));

    const avgRating = await db
      .select({ avg: avg(leads.rating) })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(eq(campaigns.userId, userId));

    return {
      totalLeads: totalLeads[0]?.count || 0,
      validatedLeads: validatedLeads[0]?.count || 0,
      activeCampaigns: activeCampaigns[0]?.count || 0,
      conversionRate: totalLeads[0]?.count > 0 
        ? ((validatedLeads[0]?.count || 0) / (totalLeads[0]?.count || 1) * 100).toFixed(1)
        : "0.0",
    };
  }

  async createFile(userId: string, file: InsertFile): Promise<File> {
    const [newFile] = await db
      .insert(files)
      .values({ ...file, userId })
      .returning();
    return newFile;
  }

  async getUserFiles(userId: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.userId, userId))
      .orderBy(desc(files.uploadedAt));
  }

  async getFile(id: string): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async deleteFile(id: string): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }
}

export const storage = new DatabaseStorage();
