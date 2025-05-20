import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/MainLayout";
import PostCard from "@/components/PostCard";
import EditProfileDialog from "@/components/EditProfileDialog";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/LanguageProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Link2, Edit2, GitPullRequest, Twitter } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    document.title = `DevStream - ${user?.firstName || t('nav.profile')}`;
  }, [user, t]);
  
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
  });
  
  const { data: userPosts, isLoading: isPostsLoading } = useQuery({
    queryKey: ["/api/user/posts"],
    queryFn: async () => {
      const res = await fetch("/api/user/posts");
      if (!res.ok) throw new Error("Failed to load user posts");
      return res.json();
    },
  });
  
  const { data: likedPosts, isLoading: isLikedPostsLoading } = useQuery({
    queryKey: ["/api/user/liked-posts"],
    queryFn: async () => {
      const res = await fetch("/api/user/liked-posts");
      if (!res.ok) throw new Error("Failed to load liked posts");
      return res.json();
    },
  });
  
  const handleProfileUpdate = () => {
    // Инвалидируем кэш для обновления данных
    queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  };
  
  const renderProfileSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex space-x-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
  
  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden mb-6">
        {isProfileLoading ? (
          <div className="p-6">
            {renderProfileSkeleton()}
          </div>
        ) : (
          <>
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-end -mt-16 mb-4 sm:space-x-4">
                <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-900">
                  <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                  <AvatarFallback>{user?.firstName?.[0] || user?.email?.[0] || "U"}</AvatarFallback>
                </Avatar>
                
                <div className="mt-4 sm:mt-0 flex-1">
                  <h1 className="text-2xl font-bold">
                    {profile?.displayName || user?.firstName || user?.email?.split('@')[0] || "User"}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    @{profile?.username || user?.firstName?.toLowerCase() || "user"}
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 sm:mt-0"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  {t('profile.edit')}
                </Button>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {profile?.bio || t('profile.defaultBio')}
              </p>
              
              <div className="flex flex-wrap gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                {profile?.location && (
                  <div className="flex items-center mr-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{profile.location}</span>
                  </div>
                )}
                
                {profile?.website && (
                  <div className="flex items-center mr-4">
                    <Link2 className="h-4 w-4 mr-1" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                
                <div className="flex items-center mr-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{t('profile.joined')} {new Date(profile?.joinedAt || "2023-01-01").toLocaleDateString(
                    user?.language === 'ru' ? 'ru-RU' : 'en-US', 
                    { month: 'long', year: 'numeric' }
                  )}</span>
                </div>
              </div>
              
              <div className="flex space-x-6 mb-4">
                <div>
                  <span className="font-bold">{profile?.followingCount || 0}</span>{" "}
                  <span className="text-gray-500 dark:text-gray-400">{t('profile.following')}</span>
                </div>
                <div>
                  <span className="font-bold">{profile?.followersCount || 0}</span>{" "}
                  <span className="text-gray-500 dark:text-gray-400">{t('profile.followers')}</span>
                </div>
                <div>
                  <span className="font-bold">{profile?.postsCount || userPosts?.length || 0}</span>{" "}
                  <span className="text-gray-500 dark:text-gray-400">{t('profile.posts')}</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {profile?.github && (
                  <a 
                    href={`https://github.com/${profile.github}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary"
                  >
                    <GitPullRequest className="h-5 w-5" />
                  </a>
                )}
                
                {profile?.twitter && (
                  <a 
                    href={`https://twitter.com/${profile.twitter}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      <Tabs defaultValue="posts" onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="posts" className="flex-1">{t('profile.posts')}</TabsTrigger>
          <TabsTrigger value="snippets" className="flex-1">{t('nav.snippets')}</TabsTrigger>
          <TabsTrigger value="likes" className="flex-1">{t('post.like')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-6 mt-6">
          {isPostsLoading ? (
            <>
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </>
          ) : userPosts?.length === 0 ? (
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-8 text-center">
              <h3 className="text-xl font-medium mb-2">{t('profile.noPosts')}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('profile.noPostsMessage')}
              </p>
            </div>
          ) : (
            userPosts?.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="snippets" className="space-y-6 mt-6">
          {isPostsLoading ? (
            <>
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </>
          ) : userPosts?.filter((post: any) => post.codeSnippet)?.length === 0 ? (
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-8 text-center">
              <h3 className="text-xl font-medium mb-2">{t('profile.noSnippets')}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('profile.noSnippetsMessage')}
              </p>
            </div>
          ) : (
            userPosts
              ?.filter((post: any) => post.codeSnippet)
              .map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))
          )}
        </TabsContent>
        
        <TabsContent value="likes" className="space-y-6 mt-6">
          {isLikedPostsLoading ? (
            <>
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </>
          ) : likedPosts?.length === 0 ? (
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-8 text-center">
              <h3 className="text-xl font-medium mb-2">{t('profile.noLikes')}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('profile.noLikesMessage')}
              </p>
            </div>
          ) : (
            likedPosts?.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </TabsContent>
      </Tabs>
      
      {/* Диалог редактирования профиля */}
      <EditProfileDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        profileData={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </MainLayout>
  );
}
