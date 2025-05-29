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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-xl border-b border-border/30">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/25">
              <Code className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="ml-4 font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">DevStream</span>
          </Link>
        </div>
        
        <div className="relative flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch}>
            <div className="relative group">
              <Input
                type="text"
                className="pl-11 pr-4 py-3 h-11 rounded-2xl border-0 bg-muted/30 hover:bg-muted/50 focus:bg-card focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/10 transition-all duration-300 w-full text-sm placeholder:text-muted-foreground/60"
                placeholder={language === 'ru' ? "Поиск пользователей, постов, работ..." : "Search users, posts, jobs..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary/60 transition-colors" />
              </div>
            </div>
          </form>
        </div>
        
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-10 h-10 rounded-2xl hover:bg-muted/50 hover:scale-105 transition-all duration-300">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          
          {isAuthenticated && <NotificationDropdown />}
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 h-10 px-3 hover:bg-muted/50 rounded-2xl group hover:scale-105 transition-all duration-300">
                  <Avatar className="w-7 h-7 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary/10 to-primary/5">{user?.firstName?.[0] || user?.email?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block text-sm font-medium">{user?.firstName || user?.email?.split('@')[0] || "User"}</span>
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
            <Button asChild className="h-8 px-4 rounded-lg text-sm font-medium">
              <Link href="/login">{language === 'ru' ? "Войти" : "Log in"}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
