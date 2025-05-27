import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/MainLayout";
import CreatePostCard from "@/components/CreatePostCard";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import Jobs from "./Jobs";
import Resumes from "./Resumes";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExploreTab, setSelectedExploreTab] = useState("trending");
  
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const { data: trendingPosts, isLoading: isTrendingLoading } = useQuery({
    queryKey: ["/api/posts/trending"],
    queryFn: async () => {
      const res = await fetch("/api/posts/trending");
      if (!res.ok) throw new Error("Failed to fetch trending posts");
      return res.json();
    },
  });
  
  const { data: latestPosts, isLoading: isLatestLoading } = useQuery({
    queryKey: ["/api/posts/latest"],
    queryFn: async () => {
      const res = await fetch("/api/posts/latest");
      if (!res.ok) throw new Error("Failed to fetch latest posts");
      return res.json();
    },
  });
  
  const { data: searchResults, isLoading: isSearchLoading, refetch: searchRefetch } = useQuery({
    queryKey: ["/api/posts/search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const res = await fetch(`/api/posts/search?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Failed to search posts");
      return res.json();
    },
    enabled: false,
  });
  
  useEffect(() => {
    document.title = "DevStream - Home";
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSelectedExploreTab("search");
      searchRefetch();
    }
  };
  
  const renderPostSkeleton = () => (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden p-4">
      <div className="flex items-start space-x-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-full mt-1" />
          <Skeleton className="h-4 w-3/4 mt-1" />
          
          <Skeleton className="h-40 w-full mt-4 rounded-lg" />
          
          <div className="mt-4 flex justify-between">
            <div className="flex space-x-4">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderHomeContent = () => (
    <>
      {isAuthenticated && <CreatePostCard />}
      
      <div className="space-y-6">
        {isLoading ? (
          <>
            {renderPostSkeleton()}
            {renderPostSkeleton()}
            {renderPostSkeleton()}
          </>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
            {language === 'ru' ? 'Не удалось загрузить посты. Пожалуйста, повторите попытку позже.' : 'Failed to load posts. Please try again later.'}
          </div>
        ) : posts?.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center">
            <h3 className="text-xl font-medium mb-2">{language === 'ru' ? 'Пока нет постов' : 'No posts yet'}</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'ru' ? 'Будьте первым, кто поделится чем-то с сообществом!' : 'Be the first to share something with the community!'}
            </p>
          </div>
        ) : (
          posts?.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </>
  );

  return (
    <MainLayout>
      <Tabs defaultValue="home" className="w-full">
        <TabsList className={`grid w-full ${isAuthenticated ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="home">Главная</TabsTrigger>
          <TabsTrigger value="explore">Обзор</TabsTrigger>
          {isAuthenticated && (
            <TabsTrigger value="work">Работа</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="home" className="mt-6">
          {renderHomeContent()}
        </TabsContent>
        
        <TabsContent value="explore" className="mt-6">
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  className="pl-10 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                  placeholder={language === 'ru' ? 'Поиск постов, тем или пользователей' : 'Search for posts, topics, or users'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <Button 
                type="submit" 
                className="rounded-full px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium"
              >
                {language === 'ru' ? 'Поиск' : 'Search'}
              </Button>
            </form>
          </div>
          
          <Tabs value={selectedExploreTab} onValueChange={setSelectedExploreTab}>
            <TabsList className="w-full">
              <TabsTrigger value="trending" className="flex-1">{language === 'ru' ? 'Популярные' : 'Trending'}</TabsTrigger>
              <TabsTrigger value="latest" className="flex-1">{language === 'ru' ? 'Новые' : 'Latest'}</TabsTrigger>
              {searchTerm && (
                <TabsTrigger value="search" className="flex-1">{language === 'ru' ? 'Результаты поиска' : 'Search Results'}</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="trending" className="space-y-6 mt-6">
              {isTrendingLoading ? (
                <>
                  {renderPostSkeleton()}
                  {renderPostSkeleton()}
                  {renderPostSkeleton()}
                </>
              ) : trendingPosts?.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center">
                  <h3 className="text-xl font-medium mb-2">{language === 'ru' ? 'Нет популярных постов' : 'No trending posts'}</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {language === 'ru' ? 'Загляните позже, чтобы увидеть популярный контент' : 'Check back later for trending content'}
                  </p>
                </div>
              ) : (
                trendingPosts?.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="latest" className="space-y-6 mt-6">
              {isLatestLoading ? (
                <>
                  {renderPostSkeleton()}
                  {renderPostSkeleton()}
                  {renderPostSkeleton()}
                </>
              ) : latestPosts?.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center">
                  <h3 className="text-xl font-medium mb-2">{language === 'ru' ? 'Нет новых постов' : 'No latest posts'}</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {language === 'ru' ? 'Загляните позже, чтобы увидеть новый контент' : 'Check back later for new content'}
                  </p>
                </div>
              ) : (
                latestPosts?.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </TabsContent>
            
            {searchTerm && (
              <TabsContent value="search" className="space-y-6 mt-6">
                {isSearchLoading ? (
                  <>
                    {renderPostSkeleton()}
                    {renderPostSkeleton()}
                    {renderPostSkeleton()}
                  </>
                ) : searchResults?.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center">
                    <h3 className="text-xl font-medium mb-2">{language === 'ru' ? 'Ничего не найдено' : 'No results found'}</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {language === 'ru' ? 'Попробуйте изменить запрос' : 'Try a different search term'}
                    </p>
                  </div>
                ) : (
                  searchResults?.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </TabsContent>
            )}
          </Tabs>
        </TabsContent>
        
        {isAuthenticated && (
          <TabsContent value="work" className="mt-6">
            <Tabs defaultValue="jobs" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="jobs">Вакансии</TabsTrigger>
                <TabsTrigger value="resumes">Резюме</TabsTrigger>
              </TabsList>
              
              <TabsContent value="jobs" className="mt-6">
                <Jobs />
              </TabsContent>
              
              <TabsContent value="resumes" className="mt-6">
                <Resumes />
              </TabsContent>
            </Tabs>
          </TabsContent>
        )}
      </Tabs>
    </MainLayout>
  );
}
