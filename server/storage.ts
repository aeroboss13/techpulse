import { v4 as uuidv4 } from 'uuid';
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
  getFollowingPosts(userId: string): Promise<Post[]>;
  createPost(post: any): Promise<Post>;
  
  // Like operations
  likePost(postId: string, userId: string): Promise<void>;
  unlikePost(postId: string, userId: string): Promise<void>;
  isPostLikedByUser(postId: string, userId: string): Promise<boolean>;
  
  // Bookmark operations
  bookmarkPost(postId: string, userId: string): Promise<void>;
  unbookmarkPost(postId: string, userId: string): Promise<void>;
  isPostBookmarkedByUser(postId: string, userId: string): Promise<boolean>;
  
  // Follow operations
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isUserFollowedBy(followerId: string, followingId: string): Promise<boolean>;
  
  // Code snippet operations
  getUserCodeSnippets(userId: string): Promise<CodeSnippet[]>;
  getPublicCodeSnippets(): Promise<CodeSnippet[]>;
  getCodeSnippet(id: string): Promise<CodeSnippet | undefined>;
  createCodeSnippet(snippet: any): Promise<CodeSnippet>;
  updateCodeSnippet(id: string, data: any): Promise<CodeSnippet>;
  deleteCodeSnippet(id: string): Promise<void>;
  
  // Trending topics
  getTrendingTopics(): Promise<TrendingTopic[]>;
  
  // Job operations
  getAllJobs(): Promise<any[]>;
  getJobsByFilter(filter: any): Promise<any[]>;
  getJobById(id: string): Promise<any>;
  createJob(job: any): Promise<any>;
  updateJob(id: string, data: any): Promise<any>;
  deleteJob(id: string): Promise<void>;
  getJobsByUser(userId: string): Promise<any[]>;
  
  // Resume operations
  getResumesByUser(userId: string): Promise<any[]>;
  getPublicResumes(): Promise<any[]>;
  getResumeById(id: string): Promise<any>;
  createResume(resume: any): Promise<any>;
  updateResume(id: string, data: any): Promise<any>;
  deleteResume(id: string): Promise<void>;
  
  // Job application operations
  createJobApplication(application: any): Promise<any>;
  getJobApplicationsByJob(jobId: string): Promise<any[]>;
  getJobApplicationsByUser(userId: string): Promise<any[]>;
  updateJobApplicationStatus(id: string, status: string): Promise<any>;
  hasUserAppliedToJob(userId: string, jobId: string): Promise<boolean>;
  
  // Job offer operations
  createJobOffer(offer: any): Promise<any>;
  getJobOffersByUser(userId: string): Promise<any[]>;
  getJobOffersByResume(resumeId: string): Promise<any[]>;
  updateJobOfferStatus(id: string, status: string): Promise<any>;
  hasUserOfferedJobToResume(userId: string, resumeId: string, jobId: string): Promise<boolean>;
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
  private jobs: Map<string, any>;
  private resumes: Map<string, any>;
  private jobApplications: Map<string, any>;
  private jobOffers: Map<string, any>;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.likes = new Map();
    this.comments = new Map();
    this.bookmarks = new Map();
    this.follows = new Map();
    this.codeSnippets = new Map();
    this.trendingTopics = new Map();
    this.jobs = new Map();
    this.resumes = new Map();
    this.jobApplications = new Map();
    this.jobOffers = new Map();
    
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
    const user = this.users.get(id);
    // Исправляем пользователей без поля telegram
    if (user && user.telegram === undefined) {
      user.telegram = null;
      this.users.set(id, user);
    }
    return user;
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
      // Убеждаемся, что социальные поля инициализированы
      github: userData.github !== undefined ? userData.github : (existingUser?.github || null),
      twitter: userData.twitter !== undefined ? userData.twitter : (existingUser?.twitter || null),
      telegram: userData.telegram !== undefined ? userData.telegram : (existingUser?.telegram || null),
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

  async getFollowingPosts(userId: string): Promise<Post[]> {
    // Получаем список пользователей, на которых подписан текущий пользователь
    const followingUserIds = Array.from(this.follows.values())
      .filter(follow => follow.followerId === userId)
      .map(follow => follow.followingId);
    
    // Добавляем собственные посты пользователя
    followingUserIds.push(userId);
    
    // Возвращаем посты от подписок и собственные посты
    return Array.from(this.posts.values())
      .filter(post => followingUserIds.includes(post.userId))
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

  // Follow operations
  async followUser(followerId: string, followingId: string): Promise<void> {
    const followId = uuidv4();
    const existingFollow = Array.from(this.follows.values())
      .find(follow => follow.followerId === followerId && follow.followingId === followingId);
    
    if (!existingFollow) {
      console.log(`Creating follow: ${followerId} -> ${followingId}`);
      this.follows.set(followId, {
        id: followId,
        followerId,
        followingId,
        createdAt: new Date()
      });
      console.log(`Follow created, total follows: ${this.follows.size}`);
    } else {
      console.log(`Follow already exists: ${followerId} -> ${followingId}`);
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const existingFollow = Array.from(this.follows.values())
      .find(follow => follow.followerId === followerId && follow.followingId === followingId);
    
    if (existingFollow) {
      this.follows.delete(existingFollow.id);
    }
  }

  async isUserFollowedBy(followerId: string, followingId: string): Promise<boolean> {
    return Array.from(this.follows.values())
      .some(follow => follow.followerId === followerId && follow.followingId === followingId);
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
    
    // Сортируем все хэштеги по популярности (количеству постов)
    // Недавние хэштеги получают небольшой бонус к рейтингу для приоритезации
    return trendingTopics
      .sort((a, b) => {
        // Рассчитываем "эффективный" рейтинг:
        // - Недавние хэштеги получают бонус 30% к счетчику
        const aEffectiveCount = a.createdAt !== null 
          ? a.postCount * 1.3  // бонус 30% для недавних хэштегов
          : a.postCount;
          
        const bEffectiveCount = b.createdAt !== null 
          ? b.postCount * 1.3  // бонус 30% для недавних хэштегов
          : b.postCount;
          
        // Сортируем по эффективному рейтингу
        const countDiff = bEffectiveCount - aEffectiveCount;
        
        // При примерно равных рейтингах (разница менее 1), используем другие факторы
        if (Math.abs(countDiff) < 1) {
          // Если один из них недавний, а другой нет - приоритет недавнему
          if (a.createdAt !== null && b.createdAt === null) return -1;
          if (a.createdAt === null && b.createdAt !== null) return 1;
          
          // Если оба недавние или оба старые - сортируем по дате (для недавних)
          // или по имени (для старых)
          if (a.createdAt !== null && b.createdAt !== null) {
            return (b.createdAt || new Date(0)).getTime() - (a.createdAt || new Date(0)).getTime();
          } else {
            return a.name.localeCompare(b.name);
          }
        }
        
        return countDiff;
      })
      .slice(0, 7); // Берем только топ-7 хэштегов
  }

  // Job operations
  async getAllJobs(): Promise<any[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getJobsByFilter(filter: any): Promise<any[]> {
    const jobs = Array.from(this.jobs.values()).filter(job => job.status === 'active');
    
    return jobs.filter(job => {
      if (filter.location && !job.location?.toLowerCase().includes(filter.location.toLowerCase())) return false;
      if (filter.experienceLevel && job.experienceLevel !== filter.experienceLevel) return false;
      if (filter.employmentType && job.employmentType !== filter.employmentType) return false;
      if (filter.isRemote !== undefined && job.isRemote !== filter.isRemote) return false;
      if (filter.technologies && filter.technologies.length > 0) {
        const hasMatchingTech = filter.technologies.some((tech: string) => 
          job.technologies?.some((jobTech: string) => 
            jobTech.toLowerCase().includes(tech.toLowerCase())
          )
        );
        if (!hasMatchingTech) return false;
      }
      return true;
    });
  }

  async getJobById(id: string): Promise<any> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    // Добавляем информацию о пользователе, создавшем вакансию
    const poster = this.users.get(job.postedBy);
    return {
      ...job,
      poster: poster ? {
        id: poster.id,
        username: poster.username,
        firstName: poster.firstName,
        lastName: poster.lastName,
        profileImageUrl: poster.profileImageUrl
      } : null
    };
  }

  async createJob(jobData: any): Promise<any> {
    const job = {
      id: uuidv4(),
      ...jobData,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.jobs.set(job.id, job);
    return job;
  }

  async updateJob(id: string, data: any): Promise<any> {
    const job = this.jobs.get(id);
    if (!job) throw new Error('Job not found');
    
    const updatedJob = {
      ...job,
      ...data,
      updatedAt: new Date()
    };
    
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: string): Promise<void> {
    this.jobs.delete(id);
  }

  async getJobsByUser(userId: string): Promise<any[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.postedBy === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Resume operations
  async getResumesByUser(userId: string): Promise<any[]> {
    return Array.from(this.resumes.values())
      .filter(resume => resume.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPublicResumes(): Promise<any[]> {
    console.log('All resumes in storage:', Array.from(this.resumes.values()));
    const allResumes = Array.from(this.resumes.values());
    console.log('Total resumes count:', allResumes.length);
    
    const visibleResumes = allResumes.filter(resume => {
      console.log('Resume visibility check:', resume.id, 'isVisible:', resume.isVisible);
      return resume.isVisible === true || resume.isVisible === undefined; // Включаем резюме без явного флага
    });
    
    console.log('Visible resumes count:', visibleResumes.length);
    
    return visibleResumes
      .map(resume => {
        const user = this.users.get(resume.userId);
        return {
          ...resume,
          user: user ? {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl
          } : null
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getResumeById(id: string): Promise<any> {
    const resume = this.resumes.get(id);
    if (!resume) return undefined;
    
    const user = this.users.get(resume.userId);
    return {
      ...resume,
      user: user ? {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      } : null
    };
  }

  async createResume(resumeData: any): Promise<any> {
    const resume = {
      id: uuidv4(),
      ...resumeData,
      isVisible: true, // По умолчанию резюме видимое
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.resumes.set(resume.id, resume);
    return resume;
  }

  async updateResume(id: string, data: any): Promise<any> {
    const resume = this.resumes.get(id);
    if (!resume) throw new Error('Resume not found');
    
    const updatedResume = {
      ...resume,
      ...data,
      updatedAt: new Date()
    };
    
    this.resumes.set(id, updatedResume);
    return updatedResume;
  }

  async deleteResume(id: string): Promise<void> {
    this.resumes.delete(id);
  }

  // Job application operations
  async createJobApplication(applicationData: any): Promise<any> {
    const application = {
      id: uuidv4(),
      ...applicationData,
      status: 'pending',
      appliedAt: new Date()
    };
    
    this.jobApplications.set(application.id, application);
    return application;
  }

  async getJobApplicationsByJob(jobId: string): Promise<any[]> {
    return Array.from(this.jobApplications.values())
      .filter(app => app.jobId === jobId)
      .map(app => {
        const applicant = this.users.get(app.applicantId);
        const resume = app.resumeId ? this.resumes.get(app.resumeId) : null;
        return {
          ...app,
          applicant: applicant ? {
            id: applicant.id,
            username: applicant.username,
            firstName: applicant.firstName,
            lastName: applicant.lastName,
            profileImageUrl: applicant.profileImageUrl
          } : null,
          resume
        };
      })
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }

  async getJobApplicationsByUser(userId: string): Promise<any[]> {
    return Array.from(this.jobApplications.values())
      .filter(app => app.applicantId === userId)
      .map(app => {
        const job = this.jobs.get(app.jobId);
        return {
          ...app,
          job
        };
      })
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }

  async updateJobApplicationStatus(id: string, status: string): Promise<any> {
    const application = this.jobApplications.get(id);
    if (!application) throw new Error('Application not found');
    
    const updatedApplication = {
      ...application,
      status
    };
    
    this.jobApplications.set(id, updatedApplication);
    return updatedApplication;
  }

  async hasUserAppliedToJob(userId: string, jobId: string): Promise<boolean> {
    return Array.from(this.jobApplications.values())
      .some(app => app.applicantId === userId && app.jobId === jobId);
  }

  // Job offer operations
  async createJobOffer(offerData: any): Promise<any> {
    const id = `job-offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const offer = {
      id,
      ...offerData,
      createdAt: new Date()
    };
    
    this.jobOffers.set(id, offer);
    return offer;
  }

  async getJobOffersByUser(userId: string): Promise<any[]> {
    return Array.from(this.jobOffers.values())
      .filter(offer => offer.resumeAuthorId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getJobOffersByResume(resumeId: string): Promise<any[]> {
    return Array.from(this.jobOffers.values())
      .filter(offer => offer.resumeId === resumeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateJobOfferStatus(id: string, status: string): Promise<any> {
    const offer = this.jobOffers.get(id);
    if (!offer) throw new Error('Job offer not found');
    
    const updatedOffer = {
      ...offer,
      status
    };
    
    this.jobOffers.set(id, updatedOffer);
    return updatedOffer;
  }

  async hasUserOfferedJobToResume(userId: string, resumeId: string, jobId: string): Promise<boolean> {
    return Array.from(this.jobOffers.values())
      .some(offer => offer.offeredByUserId === userId && offer.resumeId === resumeId && offer.jobId === jobId);
  }
}

export const storage = new MemStorage();
