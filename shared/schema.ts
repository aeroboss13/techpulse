import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  username: varchar("username").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: varchar("password_hash"),
  bio: text("bio"),
  location: varchar("location"),
  website: varchar("website"),
  github: varchar("github"),
  twitter: varchar("twitter"),
  telegram: varchar("telegram"),
  language: varchar("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  codeSnippet: text("code_snippet"),
  language: varchar("language"),
  image: varchar("image"),
  tags: text("tags").array(),
  isAiRecommended: boolean("is_ai_recommended").default(false),
  aiRecommendationReason: text("ai_recommendation_reason"),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().notNull(),
  postId: varchar("post_id").notNull().references(() => posts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().notNull(),
  postId: varchar("post_id").notNull().references(() => posts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().notNull(),
  postId: varchar("post_id").notNull().references(() => posts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().notNull(),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const codeSnippets = pgTable("code_snippets", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  code: text("code").notNull(),
  language: varchar("language").notNull(),
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trendingTopics = pgTable("trending_topics", {
  id: varchar("id").primaryKey().notNull(),
  category: varchar("category").notNull(),
  name: varchar("name").notNull(),
  postCount: integer("post_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Таблица вакансий
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().notNull(),
  title: varchar("title").notNull(),
  company: varchar("company").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  location: varchar("location"),
  salary: varchar("salary"),
  employmentType: varchar("employment_type"), // full-time, part-time, contract, freelance
  experienceLevel: varchar("experience_level"), // junior, middle, senior, lead
  technologies: text("technologies").array(), // массив технологий
  isRemote: boolean("is_remote").default(false),
  contactEmail: varchar("contact_email"),
  externalLink: varchar("external_link"),
  status: varchar("status").default("active"), // active, closed, paused
  postedBy: varchar("posted_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Таблица резюме
export const resumes = pgTable("resumes", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(), // например "Full-stack Developer"
  summary: text("summary"),
  experience: text("experience"), // опыт работы
  skills: text("skills").array(), // массив навыков
  education: text("education"),
  contactEmail: varchar("contact_email"),
  telegramNick: varchar("telegram_nick"), // Telegram ник для связи
  location: varchar("location"),
  expectedSalary: varchar("expected_salary"),
  preferredEmploymentType: varchar("preferred_employment_type"),
  isRemotePreferred: boolean("is_remote_preferred").default(false),
  portfolioLink: varchar("portfolio_link"),
  githubLink: varchar("github_link"),
  linkedinLink: varchar("linkedin_link"),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Таблица откликов на вакансии
export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().notNull(),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  applicantId: varchar("applicant_id").notNull().references(() => users.id),
  resumeId: varchar("resume_id").references(() => resumes.id),
  coverLetter: text("cover_letter"),
  status: varchar("status").default("pending"), // pending, reviewed, accepted, rejected
  appliedAt: timestamp("applied_at").defaultNow(),
});

// Таблица предложений вакансий для авторов резюме
export const jobOffers = pgTable("job_offers", {
  id: varchar("id").primaryKey().notNull(),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  resumeId: varchar("resume_id").notNull().references(() => resumes.id),
  resumeAuthorId: varchar("resume_author_id").notNull().references(() => users.id),
  offeredByUserId: varchar("offered_by_user_id").notNull().references(() => users.id),
  message: text("message"), // персональное сообщение от HR
  status: varchar("status").default("pending"), // pending, viewed, interested, declined
  createdAt: timestamp("created_at").defaultNow(),
});

// Таблица уведомлений
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id), // кому пришло уведомление
  fromUserId: varchar("from_user_id").notNull().references(() => users.id), // от кого пришло уведомление
  type: varchar("type").notNull(), // "like", "comment", "mention", "follow"
  postId: varchar("post_id").references(() => posts.id), // если связано с постом
  commentId: varchar("comment_id"), // если связано с комментарием
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  content: true,
  codeSnippet: true,
  language: true,
  tags: true,
});

export const insertCodeSnippetSchema = createInsertSchema(codeSnippets).pick({
  title: true,
  description: true,
  code: true,
  language: true,
  tags: true,
  isPublic: true,
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  title: true,
  company: true,
  description: true,
  requirements: true,
  location: true,
  salary: true,
  employmentType: true,
  experienceLevel: true,
  technologies: true,
  isRemote: true,
  contactEmail: true,
  externalLink: true,
});

export const insertResumeSchema = createInsertSchema(resumes).pick({
  title: true,
  summary: true,
  experience: true,
  skills: true,
  education: true,
  location: true,
  expectedSalary: true,
  preferredEmploymentType: true,
  isRemotePreferred: true,
  portfolioLink: true,
  githubLink: true,
  linkedinLink: true,
  isVisible: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).pick({
  jobId: true,
  resumeId: true,
  coverLetter: true,
});

export const insertJobOfferSchema = createInsertSchema(jobOffers).pick({
  jobId: true,
  resumeId: true,
  message: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  fromUserId: true,
  type: true,
  postId: true,
  commentId: true,
  message: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type CodeSnippet = typeof codeSnippets.$inferSelect;
export type InsertCodeSnippet = z.infer<typeof insertCodeSnippetSchema>;
export type TrendingTopic = typeof trendingTopics.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobOffer = typeof jobOffers.$inferSelect;
export type InsertJobOffer = z.infer<typeof insertJobOfferSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
