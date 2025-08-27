import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCampaignSchema, insertLeadSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

const upload = multer({ dest: "uploads/" });

interface WebSocketClient extends WebSocket {
  userId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocketClient, req) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'auth' && data.userId) {
          ws.userId = data.userId;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Helper function to broadcast to user's connections
  const broadcastToUser = (userId: string, message: any) => {
    wss.clients.forEach((client: WebSocketClient) => {
      if (client.readyState === WebSocket.OPEN && client.userId === userId) {
        client.send(JSON.stringify(message));
      }
    });
  };

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Campaign routes
  app.post('/api/campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(userId, campaignData);
      res.json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(400).json({ message: "Failed to create campaign" });
    }
  });

  app.get('/api/campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaigns = await storage.getUserCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get('/api/campaigns/:id', isAuthenticated, async (req: any, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.patch('/api/campaigns/:id', isAuthenticated, async (req: any, res) => {
    try {
      const campaign = await storage.updateCampaign(req.params.id, req.body);
      
      // Broadcast update to user
      const userId = req.user.claims.sub;
      broadcastToUser(userId, {
        type: 'campaign_updated',
        campaign
      });
      
      res.json(campaign);
    } catch (error) {
      console.error("Error updating campaign:", error);
      res.status(400).json({ message: "Failed to update campaign" });
    }
  });

  app.delete('/api/campaigns/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteCampaign(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // Start scraping (simulated for now - would integrate with actual scraping service)
  app.post('/api/campaigns/:id/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaign = await storage.updateCampaign(req.params.id, { 
        status: 'running',
        progress: 0 
      });

      // Simulate scraping process
      simulateScraping(req.params.id, userId, broadcastToUser);
      
      res.json(campaign);
    } catch (error) {
      console.error("Error starting campaign:", error);
      res.status(500).json({ message: "Failed to start campaign" });
    }
  });

  // Lead routes
  app.get('/api/leads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leads = await storage.getUserLeads(userId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get('/api/campaigns/:id/leads', isAuthenticated, async (req: any, res) => {
    try {
      const leads = await storage.getCampaignLeads(req.params.id);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching campaign leads:", error);
      res.status(500).json({ message: "Failed to fetch campaign leads" });
    }
  });

  app.patch('/api/leads/:id', isAuthenticated, async (req: any, res) => {
    try {
      const lead = await storage.updateLead(req.params.id, req.body);
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(400).json({ message: "Failed to update lead" });
    }
  });

  // Stats route
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getLeadStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // File upload routes
  app.post('/api/files/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
      const file = await storage.createFile(userId, {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        filePath: req.file.path,
      });

      res.json(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get('/api/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = await storage.getUserFiles(userId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.get('/api/files/:id/download', isAuthenticated, async (req: any, res) => {
    try {
      const file = await storage.getFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      const filePath = path.join(process.cwd(), file.filePath);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  return httpServer;
}

// Simulate scraping process with real-time updates
async function simulateScraping(campaignId: string, userId: string, broadcastToUser: Function) {
  const totalPages = 10;
  let currentPage = 0;
  let leadsFound = 0;

  const interval = setInterval(async () => {
    currentPage++;
    leadsFound += Math.floor(Math.random() * 5) + 1;
    
    const progress = Math.round((currentPage / totalPages) * 100);
    
    // Update campaign progress
    await storage.updateCampaign(campaignId, {
      progress,
      totalPages: currentPage,
      leadsFound,
    });

    // Generate sample leads
    for (let i = 0; i < 2; i++) {
      await storage.createLead({
        campaignId,
        businessName: `Business ${leadsFound + i}`,
        category: 'Sample Category',
        city: 'Sample City',
        state: 'SC',
        isValidated: Math.random() > 0.3,
      });
    }

    // Broadcast progress update
    broadcastToUser(userId, {
      type: 'scraping_progress',
      campaignId,
      progress,
      currentPage,
      totalPages,
      leadsFound,
    });

    if (currentPage >= totalPages) {
      clearInterval(interval);
      
      // Mark campaign as completed
      await storage.updateCampaign(campaignId, {
        status: 'completed',
        progress: 100,
      });

      broadcastToUser(userId, {
        type: 'scraping_completed',
        campaignId,
      });
    }
  }, 2000);
}
