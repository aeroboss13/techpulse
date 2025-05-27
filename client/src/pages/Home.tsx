import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/MainLayout";
import CreatePostCard from "@/components/CreatePostCard";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });
  
  useEffect(() => {
    document.title = "DevStream - Home";
  }, []);

  return (
    <MainLayout>
      {isAuthenticated && <CreatePostCard />}
      
      {isLoading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden p-4">
              <div className="flex items-start space-x-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
          {language === 'ru' ? 'Ошибка загрузки постов' : 'Error loading posts'}
        </div>
      )}

      {posts && posts.length === 0 && (
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
          {language === 'ru' ? 'Пока нет постов' : 'No posts yet'}
        </div>
      )}

      {posts && posts.map((post: any) => (
        <PostCard key={post.id} post={post} />
      ))}
    </MainLayout>
  );
}