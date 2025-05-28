import { Home, Compass, Code, Bot, User, Briefcase, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/LanguageProvider";

export default function MobileNavigation() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  
  const navItems = [
    { 
      path: "/", 
      label: language === 'ru' ? 'Главная' : 'Home', 
      icon: Home 
    },
    { 
      path: "/explore", 
      label: language === 'ru' ? 'Обзор' : 'Explore', 
      icon: Compass 
    },
    { 
      path: "/work", 
      label: language === 'ru' ? 'Работа' : 'Work', 
      icon: Briefcase,
      requiresAuth: true 
    },
    { 
      path: "/ai-assistant", 
      label: language === 'ru' ? 'ИИ' : 'AI', 
      icon: Bot,
      requiresAuth: true 
    },
    { 
      path: "/profile", 
      label: language === 'ru' ? 'Профиль' : 'Profile', 
      icon: User, 
      requiresAuth: true 
    },
  ];
  
  
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 z-10">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          // Если требуется авторизация и пользователь не авторизован, скрываем элемент
          if (item.requiresAuth && !isAuthenticated) return null;
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex flex-col items-center justify-center transition-colors ${
                location === item.path 
                  ? "text-primary dark:text-blue-400" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
