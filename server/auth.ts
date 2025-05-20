import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from './storage';

// Функция для хеширования пароля
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Функция для проверки пароля
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Middleware для проверки авторизации
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Расширение типа Express.Session для TypeScript
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

// Функция для инициализации пользователя при первом запуске
export async function initializeDefaultUser() {
  try {
    // Проверка наличия пользователей в системе
    const admin = await storage.getUserByEmail('admin@devstream.com');
    
    if (!admin) {
      console.log('Creating default admin user...');
      // Создание тестового пользователя-администратора
      await storage.upsertUser({
        id: '1',
        email: 'admin@devstream.com',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        passwordHash: await hashPassword('admin123'),
      });
      console.log('Default admin user created successfully!');
    }
  } catch (error) {
    console.error('Error initializing default user:', error);
  }
}