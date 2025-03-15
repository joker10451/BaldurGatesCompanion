import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCategorySchema, 
  insertGuideSchema, 
  insertRecentlyViewedSchema, 
  insertTipSchema 
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route prefix
  const apiRouter = app.route("/api");

  // Categories routes
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.get("/api/categories/:id/subcategories", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const subcategories = await storage.getSubcategories(id);
      res.json(subcategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      res.status(500).json({ message: "Failed to fetch subcategories" });
    }
  });

  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const result = insertCategorySchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const category = await storage.createCategory(result.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Guides routes
  app.get("/api/guides", async (req: Request, res: Response) => {
    try {
      const guides = await storage.getGuides();
      res.json(guides);
    } catch (error) {
      console.error("Error fetching guides:", error);
      res.status(500).json({ message: "Failed to fetch guides" });
    }
  });

  app.get("/api/guides/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 2) {
        return res.status(400).json({ message: "Search query must be at least 2 characters" });
      }
      
      const results = await storage.searchGuides(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching guides:", error);
      res.status(500).json({ message: "Failed to search guides" });
    }
  });

  app.get("/api/guides/category/:categoryId", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const guides = await storage.getGuidesByCategory(categoryId);
      res.json(guides);
    } catch (error) {
      console.error("Error fetching guides by category:", error);
      res.status(500).json({ message: "Failed to fetch guides by category" });
    }
  });

  app.get("/api/guides/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const guide = await storage.getGuideBySlug(slug);
      
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      
      res.json(guide);
    } catch (error) {
      console.error("Error fetching guide:", error);
      res.status(500).json({ message: "Failed to fetch guide" });
    }
  });

  app.post("/api/guides", async (req: Request, res: Response) => {
    try {
      const result = insertGuideSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const guide = await storage.createGuide(result.data);
      res.status(201).json(guide);
    } catch (error) {
      console.error("Error creating guide:", error);
      res.status(500).json({ message: "Failed to create guide" });
    }
  });

  app.get("/api/guides/:id/related", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid guide ID" });
      }
      
      const guides = await storage.getRelatedGuides(id, limit);
      res.json(guides);
    } catch (error) {
      console.error("Error fetching related guides:", error);
      res.status(500).json({ message: "Failed to fetch related guides" });
    }
  });

  // Recently viewed routes
  app.get("/api/recently-viewed", async (req: Request, res: Response) => {
    try {
      const sessionId = req.query.sessionId as string;
      
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const recentlyViewed = await storage.getRecentlyViewed(sessionId, limit);
      res.json(recentlyViewed);
    } catch (error) {
      console.error("Error fetching recently viewed:", error);
      res.status(500).json({ message: "Failed to fetch recently viewed" });
    }
  });

  app.post("/api/recently-viewed", async (req: Request, res: Response) => {
    try {
      const result = insertRecentlyViewedSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const recentlyViewed = await storage.addRecentlyViewed(result.data);
      res.status(201).json(recentlyViewed);
    } catch (error) {
      console.error("Error adding recently viewed:", error);
      res.status(500).json({ message: "Failed to add recently viewed" });
    }
  });

  // Tips routes
  app.get("/api/guides/:guideId/tips", async (req: Request, res: Response) => {
    try {
      const guideId = parseInt(req.params.guideId);
      
      if (isNaN(guideId)) {
        return res.status(400).json({ message: "Invalid guide ID" });
      }
      
      const tips = await storage.getTipsByGuide(guideId);
      res.json(tips);
    } catch (error) {
      console.error("Error fetching tips:", error);
      res.status(500).json({ message: "Failed to fetch tips" });
    }
  });

  app.post("/api/tips", async (req: Request, res: Response) => {
    try {
      const result = insertTipSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const tip = await storage.createTip(result.data);
      res.status(201).json(tip);
    } catch (error) {
      console.error("Error creating tip:", error);
      res.status(500).json({ message: "Failed to create tip" });
    }
  });

  app.post("/api/tips/:id/helpful", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tip ID" });
      }
      
      const tip = await storage.incrementHelpful(id);
      
      if (!tip) {
        return res.status(404).json({ message: "Tip not found" });
      }
      
      res.json(tip);
    } catch (error) {
      console.error("Error incrementing helpful count:", error);
      res.status(500).json({ message: "Failed to increment helpful count" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
