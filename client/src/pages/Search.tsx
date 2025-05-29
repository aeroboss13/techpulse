import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MainLayout from "@/components/MainLayout";
import PostCard from "@/components/PostCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, MapPin, Calendar, Users, Briefcase, FileText, Hash } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { Link } from "wouter";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [location, setLocation] = useLocation();
  const { language } = useLanguage();

  // Получаем поисковый запрос из URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
      setSearchTerm(query);
    }
  }, [location]);

  useEffect(() => {
    document.title = `DevStream - ${language === 'ru' ? 'Поиск' : 'Search'}`;
  }, [language]);

  // Поиск постов
  const { data: posts, isLoading: isPostsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ["/api/posts/search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const res = await fetch(`/api/posts/search?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Failed to search posts");
      return res.json();
    },
    enabled: false,
  });

  // Поиск пользователей
  const { data: users, isLoading: isUsersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["/api/users/search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Failed to search users");
      return res.json();
    },
    enabled: false,
  });

  // Поиск вакансий
  const { data: jobs, isLoading: isJobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ["/api/jobs/search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const res = await fetch(`/api/jobs/search?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Failed to search jobs");
      return res.json();
    },
    enabled: false,
  });

  // Поиск резюме
  const { data: resumes, isLoading: isResumesLoading, refetch: refetchResumes } = useQuery({
    queryKey: ["/api/resumes/search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const res = await fetch(`/api/resumes/search?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Failed to search resumes");
      return res.json();
    },
    enabled: false,
  });

  // Поиск хэштегов
  const { data: hashtags, isLoading: isHashtagsLoading, refetch: refetchHashtags } = useQuery({
    queryKey: ["/api/hashtags/search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const res = await fetch(`/api/hashtags/search?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Failed to search hashtags");
      return res.json();
    },
    enabled: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Обновляем URL с поисковым запросом
      const newUrl = `/search?q=${encodeURIComponent(searchTerm)}`;
      window.history.pushState({}, '', newUrl);
      
      // Выполняем поиск
      refetchPosts();
      refetchUsers();
      refetchJobs();
      refetchResumes();
      refetchHashtags();
    }
  };

  const renderSkeleton = () => (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden p-4">
      <div className="flex items-start space-x-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );

  const totalResults = (posts?.length || 0) + (users?.length || 0) + (jobs?.length || 0) + (resumes?.length || 0) + (hashtags?.length || 0);
  const isLoading = isPostsLoading || isUsersLoading || isJobsLoading || isResumesLoading || isHashtagsLoading;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Форма поиска */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Input
                type="text"
                className="pl-10 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                placeholder={language === 'ru' ? 'Поиск пользователей, вакансий, резюме, хэштегов и постов' : 'Search users, jobs, resumes, hashtags, and posts'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <SearchIcon className="h-5 w-5 text-gray-400" />
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

        {/* Результаты поиска */}
        {searchTerm && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">
                {language === 'ru' ? 'Результаты поиска для' : 'Search results for'} "{searchTerm}"
              </h2>
              {!isLoading && (
                <p className="text-gray-600 dark:text-gray-400">
                  {language === 'ru' ? `Найдено ${totalResults} результатов` : `Found ${totalResults} results`}
                </p>
              )}
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full mb-6">
                <TabsTrigger value="all" className="flex-1">
                  {language === 'ru' ? 'Все' : 'All'} {!isLoading && `(${totalResults})`}
                </TabsTrigger>
                <TabsTrigger value="posts" className="flex-1">
                  {language === 'ru' ? 'Посты' : 'Posts'} {!isLoading && `(${posts?.length || 0})`}
                </TabsTrigger>
                <TabsTrigger value="users" className="flex-1">
                  {language === 'ru' ? 'Люди' : 'People'} {!isLoading && `(${users?.length || 0})`}
                </TabsTrigger>
                <TabsTrigger value="jobs" className="flex-1">
                  {language === 'ru' ? 'Вакансии' : 'Jobs'} {!isLoading && `(${jobs?.length || 0})`}
                </TabsTrigger>
                <TabsTrigger value="resumes" className="flex-1">
                  {language === 'ru' ? 'Резюме' : 'Resumes'} {!isLoading && `(${resumes?.length || 0})`}
                </TabsTrigger>
                <TabsTrigger value="hashtags" className="flex-1">
                  {language === 'ru' ? 'Хэштеги' : 'Hashtags'} {!isLoading && `(${hashtags?.length || 0})`}
                </TabsTrigger>
              </TabsList>

              {/* Все результаты */}
              <TabsContent value="all" className="space-y-6">
                {isLoading ? (
                  <>
                    {renderSkeleton()}
                    {renderSkeleton()}
                    {renderSkeleton()}
                  </>
                ) : totalResults === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center">
                    <h3 className="text-xl font-medium mb-2">
                      {language === 'ru' ? 'Ничего не найдено' : 'No results found'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {language === 'ru' ? 'Попробуйте изменить поисковый запрос' : 'Try adjusting your search terms'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Пользователи */}
                    {users && users.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {language === 'ru' ? 'Пользователи' : 'Users'}
                        </h3>
                        <div className="grid gap-4">
                          {users.slice(0, 3).map((user: any) => (
                            <Link key={user.id} href={`/profile/${user.id}`}>
                              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={user.profileImageUrl} />
                                    <AvatarFallback>{user.displayName?.charAt(0) || user.username?.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-medium">{user.displayName || user.username}</h4>
                                    <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
                                    {user.bio && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{user.bio}</p>}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Посты */}
                    {posts && posts.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {language === 'ru' ? 'Посты' : 'Posts'}
                        </h3>
                        <div className="space-y-4">
                          {posts.slice(0, 3).map((post: any) => (
                            <PostCard key={post.id} post={post} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Вакансии */}
                    {jobs && jobs.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          {language === 'ru' ? 'Вакансии' : 'Jobs'}
                        </h3>
                        <div className="grid gap-4">
                          {jobs.slice(0, 3).map((job: any) => (
                            <div key={job.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm">
                              <h4 className="font-medium text-lg mb-2">{job.title}</h4>
                              <p className="text-gray-600 dark:text-gray-400 mb-2">{job.company}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">{job.description}</p>
                              <div className="flex gap-2 mt-3">
                                <Badge variant="secondary">{job.type}</Badge>
                                <Badge variant="outline">{job.salary}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Хэштеги */}
                    {hashtags && hashtags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                          <Hash className="h-5 w-5" />
                          {language === 'ru' ? 'Хэштеги' : 'Hashtags'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {hashtags.slice(0, 10).map((hashtag: any) => (
                            <Badge 
                              key={hashtag.name} 
                              variant="outline" 
                              className="cursor-pointer hover:bg-primary hover:text-white"
                              onClick={() => {
                                localStorage.setItem('selectedHashtag', hashtag.name);
                                window.location.href = '/explore';
                              }}
                            >
                              {hashtag.name} ({hashtag.postCount})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Отдельные вкладки для каждого типа */}
              <TabsContent value="posts" className="space-y-4">
                {isPostsLoading ? (
                  <>
                    {renderSkeleton()}
                    {renderSkeleton()}
                    {renderSkeleton()}
                  </>
                ) : posts?.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center">
                    <h3 className="text-xl font-medium mb-2">
                      {language === 'ru' ? 'Посты не найдены' : 'No posts found'}
                    </h3>
                  </div>
                ) : (
                  posts?.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                {isUsersLoading ? (
                  <>
                    {renderSkeleton()}
                    {renderSkeleton()}
                    {renderSkeleton()}
                  </>
                ) : users?.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center">
                    <h3 className="text-xl font-medium mb-2">
                      {language === 'ru' ? 'Пользователи не найдены' : 'No users found'}
                    </h3>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {users?.map((user: any) => (
                      <Link key={user.id} href={`/profile/${user.id}`}>
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.profileImageUrl} />
                              <AvatarFallback>{user.displayName?.charAt(0) || user.username?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{user.displayName || user.username}</h4>
                              <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
                              {user.bio && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{user.bio}</p>}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Остальные вкладки аналогично */}
            </Tabs>
          </div>
        )}
      </div>
    </MainLayout>
  );
}