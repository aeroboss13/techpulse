import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/LanguageProvider";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, Search, Bell, Moon, Sun, User, LogOut, Settings, Code, Globe
} from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import NotificationDropdown from "./NotificationDropdown";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Перенаправляем на страницу поиска с параметром
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
      setSearchTerm(""); // Очищаем поле поиска
    }
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center">
            <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span className="ml-2 font-bold text-xl text-primary">DevStream</span>
          </Link>
        </div>
        
        <div className="relative flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Input
                type="text"
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                placeholder={language === 'ru' ? "Поиск в DevStream" : "Search DevStream"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </form>
        </div>
        
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          
          {isAuthenticated && <NotificationDropdown />}
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full flex items-center space-x-2 focus:outline-none">
                  <Avatar className="w-8 h-8 border-2 border-primary">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                    <AvatarFallback>{user?.firstName?.[0] || user?.email?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block font-medium">{user?.firstName || user?.email?.split('@')[0] || "User"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href={`/profile/${user?.id}`} className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>{language === 'ru' ? "Профиль" : "Profile"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/snippets" className="flex items-center w-full">
                    <Code className="mr-2 h-4 w-4" />
                    <span>{language === 'ru' ? "Мои сниппеты" : "My Snippets"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{language === 'ru' ? "Настройки" : "Settings"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  logout().then(() => {
                    window.location.href = "/login";
                  });
                }}>
                  <div className="flex items-center w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{language === 'ru' ? "Выйти" : "Log out"}</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">{language === 'ru' ? "Войти" : "Log in"}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
