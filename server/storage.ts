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

  // Initialize with sample trending topics and posts with tags
  private initializeSampleData() {
    // Сначала создадим демо-посты с хэштегами
    const adminUserId = "1";
    
    // Образец постов с реальными хэштегами
    const samplePosts = [
      {
        id: "demo-post-1",
        userId: adminUserId,
        content: "Изучаю новые возможности TypeScript 5.0. Типизация становится всё более мощной! #TypeScript #WebDev #JavaScript",
        tags: ["TypeScript", "WebDev", "JavaScript"],
        likes: 24,
        comments: 5,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 дня назад
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
      },
      {
        id: "demo-post-2",
        userId: adminUserId,
        content: "GPT-4 открывает новые возможности для разработчиков. Попробовал генерацию кода - результаты впечатляют! #AI #GPT4 #MachineLearning",
        tags: ["AI", "GPT4", "MachineLearning"],
        likes: 36,
        comments: 8,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 дня назад
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
      },
      {
        id: "demo-post-3",
        userId: adminUserId,
        content: "Масштабирование микросервисов с Kubernetes становится проще. Вот мой опыт настройки кластера для высоконагруженного проекта. #Kubernetes #Cloud #DevOps",
        tags: ["Kubernetes", "Cloud", "DevOps"],
        likes: 19,
        comments: 4,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 дня назад
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4)
      },
      {
        id: "demo-post-4",
        userId: adminUserId,
        content: "Реализация Zero Trust архитектуры в корпоративной среде. Безопасность должна быть приоритетом! #ZeroTrust #Security #Cybersecurity",
        tags: ["ZeroTrust", "Security", "Cybersecurity"],
        likes: 29,
        comments: 6,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 дней назад
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
      },
      {
        id: "demo-post-5",
        userId: adminUserId,
        content: "React 18 и новая архитектура рендеринга. Concurrent Mode меняет правила игры! #React #JavaScript #WebDev",
        tags: ["React", "JavaScript", "WebDev"],
        likes: 42,
        comments: 11,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 день назад
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
      }
    ];
    
    // Добавляем посты в хранилище
    samplePosts.forEach(post => {
      this.posts.set(post.id, post as Post);
    });
    
    // Оставляем также статические темы для случая, если анализ постов не даст результатов
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
    const hashtagStats = new Map<string, { 
      count: number, 
      category: string, 
      isRecent: boolean,
      lastPosted: Date
    }>();
    
    // Получаем все посты
    const posts = await this.getAllPosts();
    
    // Определяем текущую дату для фильтрации по свежести
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 дней назад
    
    // Анализируем посты для поиска хэштегов
    posts.forEach(post => {
      const postDate = new Date(post.createdAt || now);
      const isRecent = postDate > oneWeekAgo; // Пост создан за последнюю неделю
      
      // Шаг 1: Извлекаем хэштеги из массива тегов (если они есть)
      const tagsFromArray: string[] = post.tags || [];
      
      // Шаг 2: Извлекаем хэштеги из текста поста с помощью регулярного выражения
      const tagsFromContent: string[] = [];
      if (post.content) {
        // Ищем все хэштеги в формате #слово (поддерживаем кириллицу и латиницу)
        const hashtagRegex = /#([а-яА-Яa-zA-Z0-9_]+)/g;
        let match;
        while ((match = hashtagRegex.exec(post.content)) !== null) {
          // match[1] содержит слово без символа #
          tagsFromContent.push(match[1]);
        }
      }
      
      // Объединяем теги из обоих источников
      const allTags = [...tagsFromArray, ...tagsFromContent];
      
      // Обрабатываем все найденные теги
      if (allTags.length > 0) {
        allTags.forEach(tag => {
          if (!tag) return; // Пропускаем пустые теги
          
          // Форматируем хэштег
          const hashtag = tag.startsWith('#') ? tag : `#${tag}`;
          
          // Определяем категорию на основе тега
          let category = "General";
          const tagLower = tag.toLowerCase();
          
          if (tagLower.includes('js') || tagLower.includes('script') || 
              tagLower.includes('html') || tagLower.includes('css') || 
              tagLower.includes('web') || tagLower.includes('react') ||
              tagLower.includes('type') || tagLower.includes('node') ||
              tagLower.includes('фронтенд')) {
            category = "Web Dev";
          } else if (tagLower.includes('ai') || tagLower.includes('ml') || 
                     tagLower.includes('gpt') || tagLower.includes('learning') ||
                     tagLower.includes('нейро') || tagLower.includes('искусственный')) {
            category = "AI";
          } else if (tagLower.includes('cloud') || tagLower.includes('aws') || 
                     tagLower.includes('azure') || tagLower.includes('kubernetes') ||
                     tagLower.includes('docker') || tagLower.includes('облако')) {
            category = "Cloud";
          } else if (tagLower.includes('security') || tagLower.includes('crypto') || 
                     tagLower.includes('hack') || tagLower.includes('privacy') ||
                     tagLower.includes('безопасность') || tagLower.includes('защита')) {
            category = "Security";
          } else if (tagLower.includes('mobile') || tagLower.includes('android') || 
                     tagLower.includes('ios') || tagLower.includes('app') ||
                     tagLower.includes('мобильн') || tagLower.includes('приложение')) {
            category = "Mobile";
          } else if (tagLower.includes('data') || tagLower.includes('sql') || 
                     tagLower.includes('database') || tagLower.includes('бд') ||
                     tagLower.includes('данные') || tagLower.includes('база')) {
            category = "Data";
          }
          
          // Обновляем статистику
          const stats = hashtagStats.get(hashtag) || { 
            count: 0, 
            category, 
            isRecent: false,
            lastPosted: new Date(0) // Инициализируем самой старой датой
          };
          
          stats.count++;
          
          // Обновляем флаг свежести и дату последнего поста с этим тегом
          if (isRecent) {
            stats.isRecent = true;
          }
          
          // Обновляем дату последнего поста, если текущий пост новее
          if (postDate > stats.lastPosted) {
            stats.lastPosted = postDate;
          }
          
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
      .map(([name, { count, category, isRecent, lastPosted }], index) => ({
        id: `tag-${index}`,
        name,
        category,
        postCount: count,
        createdAt: isRecent ? lastPosted : null,
        updatedAt: new Date()
      }));
    
    // Приоритезируем недавние хэштеги и затем сортируем по популярности
    // 1. Сначала берем недавние хэштеги (за последнюю неделю)
    const recentTopics = trendingTopics
      .filter(topic => topic.createdAt !== null)
      .sort((a, b) => {
        // Сначала сортируем по количеству постов
        const countDiff = b.postCount - a.postCount;
        if (countDiff !== 0) return countDiff;
        
        // При равном количестве - по дате (более новые выше)
        return (b.createdAt || new Date(0)).getTime() - (a.createdAt || new Date(0)).getTime();
      })
      .slice(0, 5); // Берем топ-5 недавних хэштегов
    
    // 2. Затем берем остальные популярные хэштеги всех времен
    const allTimeTopics = trendingTopics
      .filter(topic => !recentTopics.some(rt => rt.id === topic.id)) // Исключаем те, что уже в recentTopics
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 5); // Берем топ-5 всевременных хэштегов
    
    // Объединяем две категории
    return [...recentTopics, ...allTimeTopics];
  }
}

export const storage = new MemStorage();
