import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MainLayout from "@/components/MainLayout";
import PostCard from "@/components/PostCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("trending");
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  const { t, language } = useLanguage();

  // Глобальный обработчик для хэштегов
  useEffect(() => {
    const handleHashtagFilter = (event: CustomEvent) => {
      const hashtag = event.detail;
      console.log('[GLOBAL HASHTAG] Received hashtag:', hashtag);
      setSelectedHashtag(hashtag);
      setSelectedTab("hashtag");
    };

    window.addEventListener('filterByHashtag', handleHashtagFilter as EventListener);
    return () => {
      window.removeEventListener('filterByHashtag', handleHashtagFilter as EventListener);
    };
  }, []);

  // Обработка хэштега из localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHashtag = localStorage.getItem('selectedHashtag');
      console.log('[HASHTAG FILTER] Checking localStorage for hashtag:', savedHashtag);
      
      if (savedHashtag) {
        console.log('[HASHTAG FILTER] Setting hashtag filter from localStorage:', savedHashtag);
        setSelectedHashtag(savedHashtag);
        setSelectedTab("hashtag");
        // Очищаем localStorage после использования
        localStorage.removeItem('selectedHashtag');
      }
    }
  }, [location]);
  
  useEffect(() => {
    document.title = "DevStream - Explore";
  }, []);
  
  const { data: trendingPosts, isLoading: isTrendingLoading } = useQuery({
    queryKey: ["/api/posts/trending"],
    queryFn: async () => {
      const res = await fetch("/api/posts/trending");
      if (!res.ok) throw new Error("Failed to fetch trending posts");
      return res.json();
    },
  });
  
  const { data: bookmarkedPosts, isLoading: isBookmarkedLoading } = useQuery({
    queryKey: ["/api/user/bookmarked-posts"],
    queryFn: async () => {
      const res = await fetch("/api/user/bookmarked-posts", {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch bookmarked posts");
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

  // Query for hashtag posts
  const { data: hashtagPosts, isLoading: isHashtagLoading, refetch: refetchHashtagPosts } = useQuery({
    queryKey: ["/api/posts/hashtag", selectedHashtag],
    queryFn: async () => {
      if (!selectedHashtag) return [];
      console.log('[HASHTAG QUERY] Fetching posts for:', selectedHashtag);
      const res = await fetch(`/api/posts/hashtag/${encodeURIComponent(selectedHashtag)}`);
      if (!res.ok) throw new Error("Failed to fetch hashtag posts");
      const posts = await res.json();
      console.log('[HASHTAG QUERY] Found posts:', posts.length);
      return posts;
    },
    enabled: !!selectedHashtag && selectedTab === "hashtag",
  });

  // Принудительное обновление при изменении хэштега
  useEffect(() => {
    if (selectedHashtag && selectedTab === "hashtag") {
      console.log('[HASHTAG EFFECT] Refetching posts for:', selectedHashtag);
      refetchHashtagPosts();
    }
  }, [selectedHashtag, selectedTab]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSelectedTab("search");
      searchRefetch();
    }
  };

  const clearHashtagFilter = () => {
    console.log('[HASHTAG CLEAR] Clearing filter');
    setSelectedHashtag(null);
    setSelectedTab("trending");
    // Очищаем URL от параметра topic
    setLocation("/explore");
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
  
  return (
    <MainLayout>
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
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full">
          <TabsTrigger value="trending" className="flex-1">{t('general.trending')}</TabsTrigger>
          <TabsTrigger value="latest" className="flex-1">{language === 'ru' ? 'Сохраненное' : 'Bookmarked'}</TabsTrigger>
          {selectedHashtag && (
            <TabsTrigger value="hashtag" className="flex-1">
              {selectedHashtag}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearHashtagFilter();
                }}
                className="ml-2 h-5 w-5 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </TabsTrigger>
          )}
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
          {isBookmarkedLoading ? (
            <>
              {renderPostSkeleton()}
              {renderPostSkeleton()}
              {renderPostSkeleton()}
            </>
          ) : bookmarkedPosts?.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center">
              <h3 className="text-xl font-medium mb-2">{language === 'ru' ? 'У вас пока нет сохраненных постов' : 'No bookmarked posts yet'}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'ru' ? 'Сохраняйте интересные посты, нажимая на иконку закладки!' : 'Save interesting posts by clicking the bookmark icon!'}
              </p>
            </div>
          ) : (
            bookmarkedPosts?.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </TabsContent>

        {selectedHashtag && (
          <TabsContent value="hashtag" className="space-y-6 mt-6">
            {isHashtagLoading ? (
              <>
                {renderPostSkeleton()}
                {renderPostSkeleton()}
                {renderPostSkeleton()}
              </>
            ) : hashtagPosts?.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center">
                <h3 className="text-xl font-medium mb-2">
                  {language === 'ru' ? 'Нет постов с этим хэштегом' : 'No posts with this hashtag'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {language === 'ru' 
                    ? 'Пока никто не опубликовал посты с хэштегом ' + selectedHashtag
                    : 'No one has posted with the hashtag ' + selectedHashtag + ' yet'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {language === 'ru' ? 'Посты с хэштегом' : 'Posts with hashtag'} {selectedHashtag}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {hashtagPosts?.length} {language === 'ru' ? 'постов' : 'posts'}
                  </span>
                </div>
                {hashtagPosts?.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </>
            )}
          </TabsContent>
        )}
        
        {searchTerm && (
          <TabsContent value="search" className="space-y-6 mt-6">
            {isSearchLoading ? (
              <>
                {renderPostSkeleton()}
                {renderPostSkeleton()}
              </>
            ) : searchResults?.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center">
                <h3 className="text-xl font-medium mb-2">No results found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try different keywords or check your spelling
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-medium">
                  Search results for "{searchTerm}"
                </h3>
                {searchResults?.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </>
            )}
          </TabsContent>
        )}
      </Tabs>
    </MainLayout>
  );
}
