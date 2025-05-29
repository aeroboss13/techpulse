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
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-6 flex items-center justify-between h-14">
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Code className="h-4 w-4 text-background" />
            </div>
            <span className="ml-3 font-semibold text-lg tracking-tight">DevStream</span>
          </Link>
        </div>
        
        <div className="relative flex-1 max-w-sm mx-8">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Input
                type="text"
                className="pl-9 pr-4 py-2 h-9 rounded-lg border-0 bg-muted/40 hover:bg-muted/60 focus:bg-background focus:ring-1 focus:ring-border transition-all duration-200 w-full text-sm"
                placeholder={language === 'ru' ? "Поиск..." : "Search..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </form>
        </div>
        
        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-8 h-8 rounded-lg hover:bg-muted/60">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          
          {isAuthenticated && <NotificationDropdown />}
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 h-8 px-2 hover:bg-muted/60 rounded-lg">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                    <AvatarFallback className="text-xs">{user?.firstName?.[0] || user?.email?.[0] || "U"}</AvatarFallback>
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
