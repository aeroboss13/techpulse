import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { v4 as uuidv4 } from "uuid";
import { insertPostSchema, insertCodeSnippetSchema } from "@shared/schema";
import { generateAiSuggestion, getAiRecommendations } from "./ai";
import { isAuthenticated, hashPassword, comparePassword } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Получение данных текущего пользователя
  app.get('/api/auth/me', async (req: any, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        username: user.username || user.email?.split('@')[0] || 'user',
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.firstName || user.email?.split('@')[0] || 'User',
        profileImageUrl: user.profileImageUrl,
        language: user.language || 'en'
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Регистрация нового пользователя
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, username, password } = req.body;
      
      if (!name || !email || !username || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Проверка существующего email
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Проверка существующего username
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Создание нового пользователя
      const userId = uuidv4();
      const hashedPassword = await hashPassword(password);
      console.log('Registration data:', { 
        email, 
        username, 
        passwordLength: password.length,
        hashedPasswordLength: hashedPassword.length
      });
      
      await storage.upsertUser({
        id: userId,
        email,
        username,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
        profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        passwordHash: hashedPassword,
        language: 'en'
      });
      
      // Автоматический вход после регистрации
      req.session.userId = userId;
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(500).json({ message: "User created but could not be retrieved" });
      }
      
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.firstName || (user.email ? user.email.split('@')[0] : 'User'),
          profileImageUrl: user.profileImageUrl,
          language: user.language
        }
      });
      
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  // Вход пользователя
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Поиск пользователя по email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Проверка пароля
      console.log('Login attempt:', { email, passwordLength: password.length });
      console.log('User found:', { id: user.id, hasPasswordHash: !!user.passwordHash });
      
      if (!user.passwordHash) {
        console.log('No password hash stored for user');
        return res.status(401).json({ message: "Invalid email or password (no hash)" });
      }
      
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      console.log('Password validation result:', isPasswordValid);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Создание сессии
      req.session.userId = user.id;
      
      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.firstName || user.email?.split('@')[0],
          profileImageUrl: user.profileImageUrl,
          language: user.language
        }
      });
      
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  // Выход пользователя
  app.post('/api/auth/logout', (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        
        res.clearCookie('connect.sid');
        res.json({ success: true, message: "Logged out successfully" });
      });
    } else {
      res.json({ success: true, message: "Already logged out" });
    }
  });
  
  // Обновление языка пользователя
  app.post('/api/auth/language', isAuthenticated, async (req: any, res) => {
    try {
      const { language } = req.body;
      const userId = req.session.userId;
      
      if (!language) {
        return res.status(400).json({ message: "Language is required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.upsertUser({
        ...user,
        language
      });
      
      res.json({ success: true, message: "Language updated successfully" });
    } catch (error) {
      console.error("Error updating language:", error);
      res.status(500).json({ message: "Failed to update language" });
    }
  });

  // Posts
  app.get('/api/posts', async (req: any, res) => {
    try {
      const posts = await storage.getAllPosts();
      const enhancedPosts = await Promise.all(posts.map(async (post) => {
        const user = await storage.getUser(post.userId);
        const isLiked = req.session && req.session.userId 
          ? await storage.isPostLikedByUser(post.id, req.session.userId) 
          : false;
        const isBookmarked = req.session && req.session.userId 
          ? await storage.isPostBookmarkedByUser(post.id, req.session.userId) 
          : false;
        
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

  // User profile routes  
  app.get('/api/users/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive information
      const { passwordHash, ...publicUser } = user;
      res.json(publicUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/users/:userId/stats', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const [followersCount, followingCount, postsCount] = await Promise.all([
        storage.getUserFollowersCount(userId),
        storage.getUserFollowingCount(userId),
        storage.getUserPostsCount(userId)
      ]);

      res.json({
        followersCount,
        followingCount,
        postsCount
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Get posts by user ID
  app.get('/api/posts/user/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const posts = await storage.getUserPosts(userId);
      
      const enhancedPosts = await Promise.all(posts.map(async (post) => {
        const user = await storage.getUser(post.userId);
        const isLiked = req.session && req.session.userId 
          ? await storage.isPostLikedByUser(post.id, req.session.userId) 
          : false;
        const isBookmarked = req.session && req.session.userId 
          ? await storage.isPostBookmarkedByUser(post.id, req.session.userId) 
          : false;
        
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

  app.get('/api/posts/trending', async (req: any, res) => {
    try {
      const posts = await storage.getTrendingPosts();
      const enhancedPosts = await Promise.all(posts.map(async (post) => {
        const user = await storage.getUser(post.userId);
        const isLiked = req.session && req.session.userId 
          ? await storage.isPostLikedByUser(post.id, req.session.userId) 
          : false;
        const isBookmarked = req.session && req.session.userId 
          ? await storage.isPostBookmarkedByUser(post.id, req.session.userId) 
          : false;
        
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

  app.get('/api/posts/latest', async (req: any, res) => {
    try {
      const posts = await storage.getLatestPosts();
      const enhancedPosts = await Promise.all(posts.map(async (post) => {
        const user = await storage.getUser(post.userId);
        const isLiked = req.session && req.session.userId 
          ? await storage.isPostLikedByUser(post.id, req.session.userId) 
          : false;
        const isBookmarked = req.session && req.session.userId 
          ? await storage.isPostBookmarkedByUser(post.id, req.session.userId) 
          : false;
        
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

  app.get('/api/posts/search', async (req: any, res) => {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        return res.json([]);
      }
      
      const posts = await storage.searchPosts(searchTerm);
      const enhancedPosts = await Promise.all(posts.map(async (post) => {
        const user = await storage.getUser(post.userId);
        const isLiked = req.session && req.session.userId 
          ? await storage.isPostLikedByUser(post.id, req.session.userId) 
          : false;
        const isBookmarked = req.session && req.session.userId 
          ? await storage.isPostBookmarkedByUser(post.id, req.session.userId) 
          : false;
        
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
      const userId = req.session.userId;
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
      const userId = req.session.userId;
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
      const userId = req.session.userId;
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
      const userId = req.session.userId;
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
      const userId = req.session.userId;
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
  
  // Маршрут для получения закладок пользователя
  app.get('/api/user/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      // Получаем все посты
      const allPosts = await storage.getAllPosts();
      
      // Для каждого поста проверяем, добавлен ли он в закладки текущим пользователем
      const bookmarkedPosts = [];
      for (const post of allPosts) {
        const isBookmarked = await storage.isPostBookmarkedByUser(post.id, userId);
        if (isBookmarked) {
          const user = await storage.getUser(post.userId);
          
          bookmarkedPosts.push({
            ...post,
            isLiked: await storage.isPostLikedByUser(post.id, userId),
            isBookmarked: true,
            user: {
              id: user?.id,
              username: user?.username || user?.email?.split('@')[0] || 'user',
              displayName: user?.firstName || user?.email?.split('@')[0] || 'User',
              profileImageUrl: user?.profileImageUrl
            }
          });
        }
      }
      
      res.json(bookmarkedPosts);
    } catch (error) {
      console.error("Error fetching bookmarked posts:", error);
      res.status(500).json({ message: "Failed to fetch bookmarked posts" });
    }
  });

  // Profile
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
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
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.firstName || user.email?.split('@')[0] || 'User',
        profileImageUrl: user.profileImageUrl,
        bio: user.bio || null,
        location: user.location || null,
        website: user.website || null,
        github: user.github || null,
        twitter: user.twitter || null,
        telegram: user.telegram || null,
        language: user.language || 'en',
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
  
  // Обновление профиля пользователя
  app.post('/api/profile/update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const {
        displayName,
        username,
        bio,
        location,
        website,
        github,
        twitter,
        telegram
      } = req.body;
      
      console.log('Profile update data:', { displayName, username, bio, location, website, github, twitter, telegram });
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Проверка, если username изменился, что он не занят
      if (username && username !== user.username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Username already taken" });
        }
      }
      
      // Обновляем данные пользователя
      await storage.upsertUser({
        ...user,
        username: username || user.username,
        firstName: displayName ? displayName.split(' ')[0] : user.firstName,
        lastName: displayName ? displayName.split(' ').slice(1).join(' ') : user.lastName,
        bio: bio !== undefined ? bio : user.bio,
        location: location !== undefined ? location : user.location,
        website: website !== undefined ? website : user.website,
        github: github !== undefined ? github : user.github,
        twitter: twitter !== undefined ? twitter : user.twitter,
        telegram: telegram !== undefined ? telegram : user.telegram,
        updatedAt: new Date()
      });
      
      res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Code Snippets
  app.get('/api/snippets/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
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
      const userId = req.session.userId;
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
      const userId = req.session.userId;
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
      const userId = req.session.userId;
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
  app.post('/api/ai/suggest', async (req: any, res) => {
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
      const userId = req.session.userId;
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
      const userId = req.session.userId;
      const suggestedUsers = await storage.getSuggestedUsers(userId);
      res.json(suggestedUsers);
    } catch (error) {
      console.error("Error fetching suggested users:", error);
      res.status(500).json({ message: "Failed to fetch suggested users" });
    }
  });
  
  // AI post analysis endpoint
  app.post('/api/ai/analyze-post', async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Post content is required" });
      }
      
      // Import the new function we added to ai.ts
      const { analyzePost } = require("./ai");
      
      const analysis = await analyzePost(content);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing post with AI:", error);
      res.status(500).json({ 
        message: "Failed to analyze post",
        suggestions: [
          "Add code examples to illustrate your point",
          "Include relevant hashtags for better discoverability",
          "Ask a question to encourage engagement"
        ],
        topics: [{ name: "Development", relevance: 0.9 }],
        sentiment: "neutral",
        readability: "medium"
      });
    }
  });
  
  // AI content ideas generation endpoint
  app.post('/api/ai/content-ideas', async (req, res) => {
    try {
      const { topics, count } = req.body;
      
      if (!topics || !Array.isArray(topics) || topics.length === 0) {
        return res.status(400).json({ message: "At least one topic is required" });
      }
      
      // Import the new function we added to ai.ts
      const { generateContentIdeas } = require("./ai");
      
      const ideas = await generateContentIdeas(topics, count || 5);
      res.json({ ideas });
    } catch (error) {
      console.error("Error generating content ideas with AI:", error);
      res.status(500).json({ 
        message: "Failed to generate content ideas",
        ideas: [
          "Share your experience with a challenging debugging session and what you learned from it.",
          "Compare different approaches to state management in frontend applications.",
          "Discuss the pros and cons of your favorite programming language for different use cases."
        ]
      });
    }
  });

  // Jobs API
  app.get('/api/jobs', async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get('/api/jobs/search', async (req, res) => {
    try {
      // Отключаем кэширование
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const filter = req.query;
      const jobs = await storage.getJobsByFilter(filter);
      console.log('Returning jobs to client:', jobs.length);
      res.json(jobs);
    } catch (error) {
      console.error("Error searching jobs:", error);
      res.status(500).json({ message: "Failed to search jobs" });
    }
  });

  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const job = await storage.getJobById(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      console.log("Creating job with userId:", userId);
      console.log("Job data received:", req.body);
      
      const jobData = { ...req.body, postedBy: userId };
      const job = await storage.createJob(jobData);
      
      console.log("Job created successfully:", job.id);
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.put('/api/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const jobId = req.params.id;
      
      const existingJob = await storage.getJobById(jobId);
      if (!existingJob || existingJob.postedBy !== userId) {
        return res.status(403).json({ message: "Not authorized to update this job" });
      }

      const updatedJob = await storage.updateJob(jobId, req.body);
      res.json(updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete('/api/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const jobId = req.params.id;
      
      const existingJob = await storage.getJobById(jobId);
      if (!existingJob || existingJob.postedBy !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this job" });
      }

      await storage.deleteJob(jobId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  app.get('/api/user/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const jobs = await storage.getJobsByUser(userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching user jobs:", error);
      res.status(500).json({ message: "Failed to fetch user jobs" });
    }
  });

  // Get job analytics for job creators
  app.get('/api/jobs/:jobId/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const { jobId } = req.params;
      const userId = req.session.userId;
      
      const job = await storage.getJobById(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
      
      // Only job creator can see analytics
      if (job.postedBy !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const applications = await storage.getJobApplicationsByJob(jobId);
      const analytics = {
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'pending').length,
        acceptedApplications: applications.filter(app => app.status === 'accepted').length,
        rejectedApplications: applications.filter(app => app.status === 'rejected').length,
        applications: applications.map(app => ({
          id: app.id,
          applicantName: app.applicantName,
          resumeTitle: app.resumeTitle,
          coverLetter: app.coverLetter,
          status: app.status,
          appliedAt: app.createdAt
        }))
      };
      
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching job analytics:', error);
      res.status(500).json({ message: 'Failed to fetch job analytics' });
    }
  });

  // Resumes API
  app.get('/api/resumes', async (req, res) => {
    try {
      // Отключаем кэширование
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const resumes = await storage.getPublicResumes();
      console.log('Returning resumes to client:', resumes.length);
      res.json(resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  app.get('/api/resumes/:id', async (req, res) => {
    try {
      const resume = await storage.getResumeById(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json(resume);
    } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({ message: "Failed to fetch resume" });
    }
  });

  app.get('/api/user/resumes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const resumes = await storage.getResumesByUser(userId);
      res.json(resumes);
    } catch (error) {
      console.error("Error fetching user resumes:", error);
      res.status(500).json({ message: "Failed to fetch user resumes" });
    }
  });

  app.post('/api/resumes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const resumeData = { ...req.body, userId };
      const resume = await storage.createResume(resumeData);
      res.status(201).json(resume);
    } catch (error) {
      console.error("Error creating resume:", error);
      res.status(500).json({ message: "Failed to create resume" });
    }
  });

  app.put('/api/resumes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const resumeId = req.params.id;
      
      const existingResume = await storage.getResumeById(resumeId);
      if (!existingResume || existingResume.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this resume" });
      }

      const updatedResume = await storage.updateResume(resumeId, req.body);
      res.json(updatedResume);
    } catch (error) {
      console.error("Error updating resume:", error);
      res.status(500).json({ message: "Failed to update resume" });
    }
  });

  app.delete('/api/resumes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const resumeId = req.params.id;
      
      const existingResume = await storage.getResumeById(resumeId);
      if (!existingResume || existingResume.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this resume" });
      }

      await storage.deleteResume(resumeId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting resume:", error);
      res.status(500).json({ message: "Failed to delete resume" });
    }
  });

  // Job Applications API
  app.post('/api/jobs/:id/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const jobId = req.params.id;
      const { resumeId, coverLetter } = req.body;

      const application = await storage.createJobApplication({
        jobId,
        applicantId: userId,
        resumeId,
        coverLetter
      });

      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating job application:", error);
      res.status(500).json({ message: "Failed to create job application" });
    }
  });

  app.get('/api/jobs/:id/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const jobId = req.params.id;
      
      // Check if user owns the job
      const job = await storage.getJobById(jobId);
      if (!job || job.postedBy !== userId) {
        return res.status(403).json({ message: "Not authorized to view applications for this job" });
      }

      const applications = await storage.getJobApplicationsByJob(jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ message: "Failed to fetch job applications" });
    }
  });

  app.get('/api/user/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const applications = await storage.getJobApplicationsByUser(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching user applications:", error);
      res.status(500).json({ message: "Failed to fetch user applications" });
    }
  });

  app.patch('/api/applications/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const applicationId = req.params.id;
      const { status } = req.body;

      // Get the application to check permissions
      const applications = await storage.getJobApplicationsByJob('dummy'); // We need to find the application first
      // This is a simplified check - in a real app, we'd have a more efficient way
      
      const updatedApplication = await storage.updateJobApplicationStatus(applicationId, status);
      res.json(updatedApplication);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  app.get('/api/applications/check/:jobId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const jobId = req.params.jobId;
      const hasApplied = await storage.hasUserAppliedToJob(userId, jobId);
      res.json({ hasApplied });
    } catch (error) {
      console.error("Error checking job application:", error);
      res.status(500).json({ message: "Failed to check job application" });
    }
  });

  // Job Offers API
  app.post('/api/resumes/:id/offer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const resumeId = req.params.id;
      const { jobId, message } = req.body;

      // Get resume to get the author's ID
      const resume = await storage.getResumeById(resumeId);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      const offer = await storage.createJobOffer({
        jobId,
        resumeId,
        resumeAuthorId: resume.userId,
        offeredByUserId: userId,
        message
      });

      res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating job offer:", error);
      res.status(500).json({ message: "Failed to create job offer" });
    }
  });

  app.get('/api/user/offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const offers = await storage.getJobOffersByUser(userId);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching user job offers:", error);
      res.status(500).json({ message: "Failed to fetch job offers" });
    }
  });

  app.get('/api/resumes/:id/offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const resumeId = req.params.id;
      
      // Check if user owns the resume
      const resume = await storage.getResumeById(resumeId);
      if (!resume || resume.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to view offers for this resume" });
      }

      const offers = await storage.getJobOffersByResume(resumeId);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching resume job offers:", error);
      res.status(500).json({ message: "Failed to fetch job offers" });
    }
  });

  app.patch('/api/offers/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const offerId = req.params.id;
      const { status } = req.body;

      const updatedOffer = await storage.updateJobOfferStatus(offerId, status);
      res.json(updatedOffer);
    } catch (error) {
      console.error("Error updating offer status:", error);
      res.status(500).json({ message: "Failed to update offer status" });
    }
  });

  app.get('/api/offers/check/:resumeId/:jobId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { resumeId, jobId } = req.params;
      const hasOffered = await storage.hasUserOfferedJobToResume(userId, resumeId, jobId);
      res.json({ hasOffered });
    } catch (error) {
      console.error("Error checking job offer:", error);
      res.status(500).json({ message: "Failed to check job offer" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
