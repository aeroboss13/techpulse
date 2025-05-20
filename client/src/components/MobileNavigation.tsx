import { Home, Compass, Code, Bot, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function MobileNavigation() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/explore", label: "Explore", icon: Compass },
    { path: "/snippets", label: "Snippets", icon: Code, requiresAuth: true },
    { path: "/ai-assistant", label: "AI", icon: Bot },
    { path: "/profile", label: "Profile", icon: User, requiresAuth: true },
  ];
  
  const getItemPath = (item: typeof navItems[0]) => {
    if (item.requiresAuth && !isAuthenticated) {
      return "/api/login";
    }
    return item.path;
  };
  
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 z-10">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link key={item.path} href={getItemPath(item)}>
            <a 
              className={`flex flex-col items-center justify-center ${
                location === item.path 
                  ? "text-primary" 
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}
