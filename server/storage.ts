import {
  users,
  posts,
  likes,
  comments,
  bookmarks,
  follows,
  codeSnippets,
  trendingTopics,
  type User,
  type UpsertUser,
  type Post,
  type CodeSnippet,
  type TrendingTopic
} from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from 'bcryptjs';

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserFollowersCount(userId: string): Promise<number>;
  getUserFollowingCount(userId: string): Promise<number>;
  getSuggestedUsers(userId: string): Promise<any[]>;
  
  // Authentication operations
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  
  // Post operations
  getAllPosts(): Promise<Post[]>;
  getTrendingPosts(): Promise<Post[]>;
  getLatestPosts(): Promise<Post[]>;
  searchPosts(term: string): Promise<Post[]>;
  getUserPosts(userId: string): Promise<Post[]>;
  getUserPostsCount(userId: string): Promise<number>;
  getUserLikedPosts(userId: string): Promise<Post[]>;
  createPost(post: any): Promise<Post>;
  
  // Like operations
  likePost(postId: string, userId: string): Promise<void>;
  unlikePost(postId: string, userId: string): Promise<void>;
  isPostLikedByUser(postId: string, userId: string): Promise<boolean>;
  
  // Bookmark operations
  bookmarkPost(postId: string, userId: string): Promise<void>;
  unbookmarkPost(postId: string, userId: string): Promise<void>;
  isPostBookmarkedByUser(postId: string, userId: string): Promise<boolean>;
  
  // Code snippet operations
  getUserCodeSnippets(userId: string): Promise<CodeSnippet[]>;
  getPublicCodeSnippets(): Promise<CodeSnippet[]>;
  getCodeSnippet(id: string): Promise<CodeSnippet | undefined>;
  createCodeSnippet(snippet: any): Promise<CodeSnippet>;
  updateCodeSnippet(id: string, data: any): Promise<CodeSnippet>;
  deleteCodeSnippet(id: string): Promise<void>;
  
  // Trending topics
  getTrendingTopics(): Promise<TrendingTopic[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User & { passwordHash?: string }>;
  private posts: Map<string, Post>;
  private likes: Map<string, any>;
  private comments: Map<string, any>;
  private bookmarks: Map<string, any>;
  private follows: Map<string, any>;
  private codeSnippets: Map<string, CodeSnippet>;
  private trendingTopics: Map<string, TrendingTopic>;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.likes = new Map();
    this.comments = new Map();
    this.bookmarks = new Map();
    this.follows = new Map();
    this.codeSnippets = new Map();
    this.trendingTopics = new Map();
    
    this.initializeSampleData();
  }

  // Initialize with sample trending topics
  private initializeSampleData() {
    const sampleTopics = [
      { id: "1", category: "Web Dev", name: "#TypeScript5.0", postCount: 4218 },
      { id: "2", category: "AI", name: "#GPT4", postCount: 3112 },
      { id: "3", category: "Cloud", name: "#Kubernetes", postCount: 2854 },
      { id: "4", category: "Security", name: "#ZeroTrust", postCount: 1932 }
    ];
    
    sampleTopics.forEach(topic => {
      this.trendingTopics.set(topic.id, topic as TrendingTopic);
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }
  
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    
    let username = userData.username;
    if (!username && userData.email) {
      username = userData.email.split('@')[0];
    }
    
    const updatedUser = {
      ...existingUser,
      ...userData,
      username,
      updatedAt: new Date()
    };
    
    if (!existingUser) {
      updatedUser.createdAt = new Date();
    }
    
    this.users.set(userData.id, updatedUser as User);
    return updatedUser as User;
  }

  async getUserFollowersCount(userId: string): Promise<number> {
    // Возвращаем 0 для новых пользователей
    return 0;
  }

  async getUserFollowingCount(userId: string): Promise<number> {
    // Возвращаем 0 для новых пользователей
    return 0;
  }

  async getSuggestedUsers(userId: string): Promise<any[]> {
    // Возвращаем пустой массив для новых пользователей
    return [];
  }

  // Post operations
  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTrendingPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 10);
  }

  async getLatestPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }

  async searchPosts(term: string): Promise<Post[]> {
    const lowerTerm = term.toLowerCase();
    return Array.from(this.posts.values())
      .filter(post => 
        post.content.toLowerCase().includes(lowerTerm) ||
        post.tags?.some(tag => tag.toLowerCase().includes(lowerTerm)) ||
        (post.codeSnippet && post.codeSnippet.toLowerCase().includes(lowerTerm))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUserPostsCount(userId: string): Promise<number> {
    return Array.from(this.posts.values()).filter(post => post.userId === userId).length;
  }

  async getUserLikedPosts(userId: string): Promise<Post[]> {
    const likedPostIds = Array.from(this.likes.values())
      .filter(like => like.userId === userId)
      .map(like => like.postId);
    
    return Array.from(this.posts.values())
      .filter(post => likedPostIds.includes(post.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createPost(postData: any): Promise<Post> {
    const now = new Date();
    const post: Post = {
      ...postData,
      likes: 0,
      comments: 0,
      createdAt: now,
      updatedAt: now
    };
    
    this.posts.set(post.id, post);
    return post;
  }

  // Like operations
  async likePost(postId: string, userId: string): Promise<void> {
    const likeId = uuidv4();
    const existingLike = Array.from(this.likes.values())
      .find(like => like.postId === postId && like.userId === userId);
    
    if (!existingLike) {
      this.likes.set(likeId, {
        id: likeId,
        postId,
        userId,
        createdAt: new Date()
      });
      
      // Update post likes count
      const post = this.posts.get(postId);
      if (post) {
        post.likes += 1;
        this.posts.set(postId, post);
      }
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const existingLike = Array.from(this.likes.values())
      .find(like => like.postId === postId && like.userId === userId);
    
    if (existingLike) {
      this.likes.delete(existingLike.id);
      
      // Update post likes count
      const post = this.posts.get(postId);
      if (post && post.likes > 0) {
        post.likes -= 1;
        this.posts.set(postId, post);
      }
    }
  }

  async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    return Array.from(this.likes.values())
      .some(like => like.postId === postId && like.userId === userId);
  }

  // Bookmark operations
  async bookmarkPost(postId: string, userId: string): Promise<void> {
    const bookmarkId = uuidv4();
    const existingBookmark = Array.from(this.bookmarks.values())
      .find(bookmark => bookmark.postId === postId && bookmark.userId === userId);
    
    if (!existingBookmark) {
      this.bookmarks.set(bookmarkId, {
        id: bookmarkId,
        postId,
        userId,
        createdAt: new Date()
      });
    }
  }

  async unbookmarkPost(postId: string, userId: string): Promise<void> {
    const existingBookmark = Array.from(this.bookmarks.values())
      .find(bookmark => bookmark.postId === postId && bookmark.userId === userId);
    
    if (existingBookmark) {
      this.bookmarks.delete(existingBookmark.id);
    }
  }

  async isPostBookmarkedByUser(postId: string, userId: string): Promise<boolean> {
    return Array.from(this.bookmarks.values())
      .some(bookmark => bookmark.postId === postId && bookmark.userId === userId);
  }

  // Code snippet operations
  async getUserCodeSnippets(userId: string): Promise<CodeSnippet[]> {
    return Array.from(this.codeSnippets.values())
      .filter(snippet => snippet.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPublicCodeSnippets(): Promise<CodeSnippet[]> {
    return Array.from(this.codeSnippets.values())
      .filter(snippet => snippet.isPublic)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getCodeSnippet(id: string): Promise<CodeSnippet | undefined> {
    return this.codeSnippets.get(id);
  }

  async createCodeSnippet(snippetData: any): Promise<CodeSnippet> {
    const now = new Date();
    const snippet: CodeSnippet = {
      ...snippetData,
      createdAt: now,
      updatedAt: now
    };
    
    this.codeSnippets.set(snippet.id, snippet);
    return snippet;
  }

  async updateCodeSnippet(id: string, data: any): Promise<CodeSnippet> {
    const existingSnippet = this.codeSnippets.get(id);
    if (!existingSnippet) {
      throw new Error("Snippet not found");
    }
    
    const updatedSnippet = {
      ...existingSnippet,
      ...data,
      updatedAt: new Date()
    };
    
    this.codeSnippets.set(id, updatedSnippet);
    return updatedSnippet;
  }

  async deleteCodeSnippet(id: string): Promise<void> {
    this.codeSnippets.delete(id);
  }

  // Trending topics
  async getTrendingTopics(): Promise<TrendingTopic[]> {
    // Анализируем все посты и собираем статистику по хэштегам
    const hashtagStats = new Map<string, { count: number, category: string }>();
    
    // Получаем все посты
    const posts = await this.getAllPosts();
    
    // Анализируем теги в каждом посте
    posts.forEach(post => {
      if (post.tags && post.tags.length > 0) {
        post.tags.forEach(tag => {
          // Форматируем хэштег
          const hashtag = tag.startsWith('#') ? tag : `#${tag}`;
          
          // Определяем категорию на основе тега
          let category = "General";
          if (tag.toLowerCase().includes('js') || tag.toLowerCase().includes('script') || 
              tag.toLowerCase().includes('html') || tag.toLowerCase().includes('css') || 
              tag.toLowerCase().includes('web')) {
            category = "Web Dev";
          } else if (tag.toLowerCase().includes('ai') || tag.toLowerCase().includes('ml') || 
                     tag.toLowerCase().includes('gpt') || tag.toLowerCase().includes('learning')) {
            category = "AI";
          } else if (tag.toLowerCase().includes('cloud') || tag.toLowerCase().includes('aws') || 
                     tag.toLowerCase().includes('azure') || tag.toLowerCase().includes('kubernetes')) {
            category = "Cloud";
          } else if (tag.toLowerCase().includes('security') || tag.toLowerCase().includes('crypto') || 
                     tag.toLowerCase().includes('hack') || tag.toLowerCase().includes('privacy')) {
            category = "Security";
          } else if (tag.toLowerCase().includes('mobile') || tag.toLowerCase().includes('android') || 
                     tag.toLowerCase().includes('ios') || tag.toLowerCase().includes('app')) {
            category = "Mobile";
          }
          
          // Обновляем статистику
          const stats = hashtagStats.get(hashtag) || { count: 0, category };
          stats.count++;
          hashtagStats.set(hashtag, stats);
        });
      }
    });
    
    // Если нет постов с тегами, используем пример хэштегов
    if (hashtagStats.size === 0) {
      return Array.from(this.trendingTopics.values())
        .sort((a, b) => b.postCount - a.postCount);
    }
    
    // Преобразуем статистику в массив трендовых тем
    const trendingTopics: TrendingTopic[] = Array.from(hashtagStats.entries())
      .map(([name, { count, category }], index) => ({
        id: `tag-${index}`,
        name,
        category,
        postCount: count
      }));
    
    // Сортируем по количеству постов (по убыванию)
    return trendingTopics.sort((a, b) => b.postCount - a.postCount);
  }
}

export const storage = new MemStorage();
