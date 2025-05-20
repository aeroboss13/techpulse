import { Home, Compass, Bookmark, Code, Bot, User, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  
  const navItems = [
    { path: "/", label: t('nav.home'), icon: Home },
    { path: "/explore", label: t('nav.explore'), icon: Compass },
    { path: "/bookmarks", label: t('nav.bookmarks'), icon: Bookmark, requiresAuth: true },
    { path: "/snippets", label: t('nav.snippets'), icon: Code, requiresAuth: true },
    { path: "/ai-assistant", label: t('nav.ai'), icon: Bot },
    { path: "/profile", label: t('nav.profile'), icon: User, requiresAuth: true },
  ];
  
  return (
    <aside className="hidden md:block w-64 pr-8">
      <nav className="sticky top-20">
        <ul className="space-y-2">
          {navItems.map((item) => {
            if (item.requiresAuth && !isAuthenticated) return null;
            
            return (
              <li key={item.path}>
                <Link href={item.path} className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300",
                  location === item.path 
                    ? "bg-blue-50 dark:bg-primary-dark text-primary font-medium" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{t('nav.ai')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('ai.placeholder')}
              </p>
              <Button variant="link" className="mt-1 h-auto p-0" asChild>
                <span onClick={() => window.location.href = "/ai-assistant"}>{t('ai.send')}</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
