import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/MainLayout";
import PostCard from "@/components/PostCard";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";

export default function Bookmarks() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  useEffect(() => {
    document.title = "DevStream - " + (language === 'ru' ? 'Закладки' : 'Bookmarks');
  }, [language]);
  
  // Получаем закладки пользователя
  const { data: bookmarkedPosts, isLoading } = useQuery({
    queryKey: ["/api/user/bookmarks"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user/bookmarks");
        if (!res.ok) {
          throw new Error("Failed to fetch bookmarks");
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        return [];
      }
    },
    enabled: !!user, // Запрос выполняется только если пользователь авторизован
  });
  
  const renderSkeleton = () => (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm mb-4 animate-pulse">
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
      
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
      
      <div className="flex justify-between">
        <div className="flex space-x-4">
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div>
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
  
  return (
    <MainLayout>
      <div className="py-4">
        <h1 className="text-2xl font-bold mb-6">
          {language === 'ru' ? 'Мои закладки' : 'My Bookmarks'}
        </h1>
        
        {isLoading ? (
          <div className="space-y-4">
            {renderSkeleton()}
            {renderSkeleton()}
            {renderSkeleton()}
          </div>
        ) : bookmarkedPosts?.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center">
            <h3 className="text-xl font-medium mb-2">
              {language === 'ru' ? 'У вас пока нет закладок' : 'No bookmarks yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'ru' 
                ? 'Сохраняйте интересные посты с помощью кнопки закладки' 
                : 'Save interesting posts using the bookmark button'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarkedPosts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}