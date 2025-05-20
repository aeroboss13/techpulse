import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { v4 as uuidv4 } from "uuid";
import { insertPostSchema, insertCodeSnippetSchema } from "@shared/schema";
import { generateAiSuggestion, getAiRecommendations } from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

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

  // Posts
  app.get('/api/posts', async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      const enhancedPosts = await Promise.all(posts.map(async (post) => {
        const user = await storage.getUser(post.userId);
        const isLiked = req.user ? await storage.isPostLikedByUser(post.id, req.user.claims.sub) : false;
        const isBookmarked = req.user ? await storage.isPostBookmarkedByUser(post.id, req.user.claims.sub) : false;
        
        return {
          ...post,
          isLiked,
          isBookmarked,
          user: {
            id: user?.id,
            username: user?.username || user?.email?.split('@')[0] || 'user',
            displayName: user?.firstName || user?.email?.split('@')[0] || 'User',
            profileImageUrl: user?.profileImageUrl
          }
        };
      }));
      
      res.json(enhancedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get('/api/posts/trending', async (req, res) => {
    try {
      const posts = await storage.getTrendingPosts();
      const enhancedPosts = await Promise.all(posts.map(async (post) => {
        const user = await storage.getUser(post.userId);
        const isLiked = req.user ? await storage.isPostLikedByUser(post.id, req.user.claims.sub) : false;
        const isBookmarked = req.user ? await storage.isPostBookmarkedByUser(post.id, req.user.claims.sub) : false;
        
        return {
          ...post,
          isLiked,
          isBookmarked,
          user: {
            id: user?.id,
            username: user?.username || user?.email?.split('@')[0] || 'user',
            displayName: user?.firstName || user?.email?.split('@')[0] || 'User',
            profileImageUrl: user?.profileImageUrl
          }
        };
      }));
      
      res.json(enhancedPosts);
    } catch (error) {
      console.error("Error fetching trending posts:", error);
      res.status(500).json({ message: "Failed to fetch trending posts" });
    }
  });

  app.get('/api/posts/latest', async (req, res) => {
    try {
      const posts = await storage.getLatestPosts();
      const enhancedPosts = await Promise.all(posts.map(async (post) => {
        const user = await storage.getUser(post.userId);
        const isLiked = req.user ? await storage.isPostLikedByUser(post.id, req.user.claims.sub) : false;
        const isBookmarked = req.user ? await storage.isPostBookmarkedByUser(post.id, req.user.claims.sub) : false;
        
        return {
          ...post,
          isLiked,
          isBookmarked,
          user: {
            id: user?.id,
            username: user?.username || user?.email?.split('@')[0] || 'user',
            displayName: user?.firstName || user?.email?.split('@')[0] || 'User',
            profileImageUrl: user?.profileImageUrl
          }
        };
      }));
      
      res.json(enhancedPosts);
    } catch (error) {
      console.error("Error fetching latest posts:", error);
      res.status(500).json({ message: "Failed to fetch latest posts" });
    }
  });

  app.get('/api/posts/search', async (req, res) => {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        return res.json([]);
      }
      
      const posts = await storage.searchPosts(searchTerm);
      const enhancedPosts = await Promise.all(posts.map(async (post) => {
        const user = await storage.getUser(post.userId);
        const isLiked = req.user ? await storage.isPostLikedByUser(post.id, req.user.claims.sub) : false;
        const isBookmarked = req.user ? await storage.isPostBookmarkedByUser(post.id, req.user.claims.sub) : false;
        
        return {
          ...post,
          isLiked,
          isBookmarked,
          user: {
            id: user?.id,
            username: user?.username || user?.email?.split('@')[0] || 'user',
            displayName: user?.firstName || user?.email?.split('@')[0] || 'User',
            profileImageUrl: user?.profileImageUrl
          }
        };
      }));
      
      res.json(enhancedPosts);
    } catch (error) {
      console.error("Error searching posts:", error);
      res.status(500).json({ message: "Failed to search posts" });
    }
  });

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertPostSchema.parse(req.body);

      const newPost = await storage.createPost({
        id: uuidv4(),
        userId,
        ...postData
      });

      const user = await storage.getUser(userId);
      
      res.status(201).json({
        ...newPost,
        user: {
          id: user?.id,
          username: user?.username || user?.email?.split('@')[0] || 'user',
          displayName: user?.firstName || user?.email?.split('@')[0] || 'User',
          profileImageUrl: user?.profileImageUrl
        },
        isLiked: false,
        isBookmarked: false
      });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post('/api/posts/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = req.params.id;
      const { liked } = req.body;

      if (liked) {
        await storage.likePost(postId, userId);
      } else {
        await storage.unlikePost(postId, userId);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error liking/unliking post:", error);
      res.status(500).json({ message: "Failed to like/unlike post" });
    }
  });

  app.post('/api/posts/:id/bookmark', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = req.params.id;
      const { bookmarked } = req.body;

      if (bookmarked) {
        await storage.bookmarkPost(postId, userId);
      } else {
        await storage.unbookmarkPost(postId, userId);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error bookmarking/unbookmarking post:", error);
      res.status(500).json({ message: "Failed to bookmark/unbookmark post" });
    }
  });

  // User Posts
  app.get('/api/user/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const posts = await storage.getUserPosts(userId);
      
      const enhancedPosts = await Promise.all(posts.map(async (post) => {
        const user = await storage.getUser(post.userId);
        const isLiked = await storage.isPostLikedByUser(post.id, userId);
        const isBookmarked = await storage.isPostBookmarkedByUser(post.id, userId);
        
        return {
          ...post,
          isLiked,
          isBookmarked,
          user: {
            id: user?.id,
            username: user?.username || user?.email?.split('@')[0] || 'user',
            displayName: user?.firstName || user?.email?.split('@')[0] || 'User',
            profileImageUrl: user?.profileImageUrl
          }
        };
      }));
      
      res.json(enhancedPosts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  app.get('/api/user/liked-posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const posts = await storage.getUserLikedPosts(userId);
      
      const enhancedPosts = await Promise.all(posts.map(async (post) => {
        const user = await storage.getUser(post.userId);
        
        return {
          ...post,
          isLiked: true,
          isBookmarked: await storage.isPostBookmarkedByUser(post.id, userId),
          user: {
            id: user?.id,
            username: user?.username || user?.email?.split('@')[0] || 'user',
            displayName: user?.firstName || user?.email?.split('@')[0] || 'User',
            profileImageUrl: user?.profileImageUrl
          }
        };
      }));
      
      res.json(enhancedPosts);
    } catch (error) {
      console.error("Error fetching liked posts:", error);
      res.status(500).json({ message: "Failed to fetch liked posts" });
    }
  });

  // Profile
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const postsCount = await storage.getUserPostsCount(userId);
      const followersCount = await storage.getUserFollowersCount(userId);
      const followingCount = await storage.getUserFollowingCount(userId);
      
      res.json({
        id: user.id,
        email: user.email,
        username: user.username || user.email?.split('@')[0] || 'user',
        displayName: user.firstName || user.email?.split('@')[0] || 'User',
        profileImageUrl: user.profileImageUrl,
        bio: user.bio || null,
        location: user.location || null,
        website: user.website || null,
        github: user.github || null,
        twitter: user.twitter || null,
        joinedAt: user.createdAt,
        postsCount,
        followersCount,
        followingCount
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Code Snippets
  app.get('/api/snippets/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const snippets = await storage.getUserCodeSnippets(userId);
      res.json(snippets);
    } catch (error) {
      console.error("Error fetching user snippets:", error);
      res.status(500).json({ message: "Failed to fetch user snippets" });
    }
  });

  app.get('/api/snippets/public', async (req, res) => {
    try {
      const snippets = await storage.getPublicCodeSnippets();
      res.json(snippets);
    } catch (error) {
      console.error("Error fetching public snippets:", error);
      res.status(500).json({ message: "Failed to fetch public snippets" });
    }
  });

  app.post('/api/snippets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const snippetData = insertCodeSnippetSchema.parse(req.body);

      const newSnippet = await storage.createCodeSnippet({
        id: uuidv4(),
        userId,
        ...snippetData
      });

      res.status(201).json(newSnippet);
    } catch (error) {
      console.error("Error creating snippet:", error);
      res.status(500).json({ message: "Failed to create snippet" });
    }
  });

  app.put('/api/snippets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const snippetId = req.params.id;
      const snippetData = insertCodeSnippetSchema.parse(req.body);

      // Check if the snippet belongs to the user
      const existingSnippet = await storage.getCodeSnippet(snippetId);
      if (!existingSnippet || existingSnippet.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this snippet" });
      }

      const updatedSnippet = await storage.updateCodeSnippet(snippetId, snippetData);
      res.json(updatedSnippet);
    } catch (error) {
      console.error("Error updating snippet:", error);
      res.status(500).json({ message: "Failed to update snippet" });
    }
  });

  app.delete('/api/snippets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const snippetId = req.params.id;

      // Check if the snippet belongs to the user
      const existingSnippet = await storage.getCodeSnippet(snippetId);
      if (!existingSnippet || existingSnippet.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this snippet" });
      }

      await storage.deleteCodeSnippet(snippetId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting snippet:", error);
      res.status(500).json({ message: "Failed to delete snippet" });
    }
  });

  // AI Integration
  app.post('/api/ai/suggest', isAuthenticated, async (req: any, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      const suggestion = await generateAiSuggestion(prompt);
      res.json({ suggestion });
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      res.status(500).json({ 
        message: "Failed to get AI suggestion",
        suggestion: "Sorry, I couldn't generate a suggestion at this time. Please try again later."
      });
    }
  });

  app.get('/api/ai/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Get user's posts and liked posts to determine interests
      const userPosts = await storage.getUserPosts(userId);
      const likedPosts = await storage.getUserLikedPosts(userId);
      
      const recommendations = await getAiRecommendations(user, userPosts, likedPosts);
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      res.status(500).json({ message: "Failed to get AI recommendations" });
    }
  });

  // Trending Topics and Suggested Users
  app.get('/api/trending-topics', async (req, res) => {
    try {
      const topics = await storage.getTrendingTopics();
      res.json(topics);
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      res.status(500).json({ message: "Failed to fetch trending topics" });
    }
  });

  app.get('/api/suggested-users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const suggestedUsers = await storage.getSuggestedUsers(userId);
      res.json(suggestedUsers);
    } catch (error) {
      console.error("Error fetching suggested users:", error);
      res.status(500).json({ message: "Failed to fetch suggested users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
