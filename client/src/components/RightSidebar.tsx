import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/components/LanguageProvider";

interface TrendingTopic {
  id: string;
  category: string;
  name: string;
  postCount: number;
}

interface SuggestedUser {
  id: string;
  username: string;
  displayName: string;
  profileImageUrl: string;
}

export default function RightSidebar() {
  const { t, language } = useLanguage();
  const [location, setLocation] = useLocation();

  const handleHashtagClick = (hashtag: string) => {
    console.log('[HASHTAG CLICK] Clicking hashtag:', hashtag);
    // Отправляем глобальное событие
    const event = new CustomEvent('filterByHashtag', { detail: hashtag });
    window.dispatchEvent(event);
    // Переходим на страницу Explore
    setLocation('/explore');
  };
  const { data: trendingTopics } = useQuery<TrendingTopic[]>({
    queryKey: ["/api/trending-topics"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/trending-topics");
        if (!res.ok) return [];
        return await res.json();
      } catch (error) {
        console.error("Failed to fetch trending topics:", error);
        return [];
      }
    },
  });

  const { data: suggestedUsers } = useQuery<SuggestedUser[]>({
    queryKey: ["/api/suggested-users"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/suggested-users");
        if (!res.ok) return [];
        return await res.json();
      } catch (error) {
        console.error("Failed to fetch suggested users:", error);
        return [];
      }
    },
  });

  // Не используем демо-данные по умолчанию для новых пользователей
  const displayTopics = trendingTopics || [];
  const displayUsers = suggestedUsers || [];

  return (
    <aside className="hidden lg:block w-80 pl-8">
      <div className="sticky top-20 space-y-6">
        {/* Trending Topics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{language === 'ru' ? 'Популярно в IT' : 'Trending in Tech'}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {displayTopics.map(topic => (
                <li key={topic.id}>
                  <button 
                    onClick={() => handleHashtagClick(topic.name)}
                    className="block w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {language === 'ru' ? 'Популярно в' : 'Trending in'} {topic.category}
                    </div>
                    <div className="font-medium">{topic.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Intl.NumberFormat('en-US').format(topic.postCount)} {language === 'ru' ? 'постов' : 'posts'}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        

        
        {/* AI Feature */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm p-4 text-white">
          <div className="flex items-center space-x-3 mb-3">
            <Bot className="h-6 w-6" />
            <h3 className="font-bold text-lg">{language === 'ru' ? 'ИИ-ассистент' : 'AI Assistant'}</h3>
          </div>
          <p className="mb-4 text-sm opacity-90">
            {language === 'ru' 
              ? 'Получите помощь с отладкой, проверкой кода или генерацией шаблонного кода с помощью ИИ.' 
              : 'Get help with debugging, code reviews, or generate boilerplate code with our AI assistant.'}
          </p>
          <div className="rounded-lg overflow-hidden mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 600"
              className="w-full h-auto"
              style={{ background: 'rgba(0, 0, 0, 0.2)' }}
            >
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4158D0" stopOpacity="0.8" />
                  <stop offset="46%" stopColor="#C850C0" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#FFCC70" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#gradient)" opacity="0.3" />
              <g transform="translate(400, 300)">
                <g>
                  <circle r="120" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2" />
                  <circle r="150" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" />
                  <circle r="180" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" />
                </g>
                <g className="animate-pulse">
                  <circle cx="0" cy="-150" r="10" fill="rgba(255, 255, 255, 0.8)" />
                  <circle cx="106" cy="-106" r="10" fill="rgba(255, 255, 255, 0.8)" />
                  <circle cx="150" cy="0" r="10" fill="rgba(255, 255, 255, 0.8)" />
                  <circle cx="106" cy="106" r="10" fill="rgba(255, 255, 255, 0.8)" />
                  <circle cx="0" cy="150" r="10" fill="rgba(255, 255, 255, 0.8)" />
                  <circle cx="-106" cy="106" r="10" fill="rgba(255, 255, 255, 0.8)" />
                  <circle cx="-150" cy="0" r="10" fill="rgba(255, 255, 255, 0.8)" />
                  <circle cx="-106" cy="-106" r="10" fill="rgba(255, 255, 255, 0.8)" />
                </g>
                <circle r="60" fill="rgba(255, 255, 255, 0.2)" />
                <path
                  d="M-20,-20 L20,20 M-20,20 L20,-20"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>
          <Button className="w-full bg-white text-blue-600 hover:bg-opacity-90" asChild>
            <Link href="/ai-assistant">{language === 'ru' ? 'Попробовать сейчас' : 'Try It Now'}</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
