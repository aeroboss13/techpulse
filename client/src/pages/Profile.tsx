import { useState } from 'react';
import * as React from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostCard from '@/components/PostCard';
import EditProfileDialog from '@/components/EditProfileDialog';
import { useLanguage } from '@/components/LanguageProvider';
import { useAuth } from '@/hooks/useAuth';
import { CalendarDays, MapPin, Users, MessageSquare, Heart, Code, Briefcase, Github } from 'lucide-react';
import { SiTelegram, SiX } from 'react-icons/si';
import CodeSnippet from '@/components/CodeSnippet';
import { apiRequest } from '@/lib/queryClient';

export default function Profile() {
  const { userId } = useParams();
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const queryClient = useQueryClient();

  const { data: profileUser, isLoading: userLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
  });

  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: [`/api/posts/user/${userId}`],
  });

  const { data: userStats } = useQuery({
    queryKey: [`/api/users/${userId}/stats`],
  });

  const { data: likedPosts, isLoading: likedPostsLoading } = useQuery({
    queryKey: [`/api/user/liked-posts`],
    enabled: !!currentUser && currentUser.id === userId, // Загружаем только для собственного профиля
  });

  const { data: userSnippets, isLoading: snippetsLoading } = useQuery({
    queryKey: currentUser?.id === userId ? [`/api/snippets/my`] : [`/api/snippets/user/${userId}`],
    enabled: !!userId && !!currentUser,
  });

  // Проверяем статус подписки при загрузке
  const { data: followStatus } = useQuery({
    queryKey: [`/api/users/${userId}/follow-status`],
    enabled: !!currentUser && currentUser.id !== userId,
  });

  // Обновляем состояние подписки при получении данных
  React.useEffect(() => {
    if (followStatus?.isFollowing !== undefined) {
      setIsFollowing(followStatus.isFollowing);
    }
  }, [followStatus]);

  const followMutation = useMutation({
    mutationFn: async (followed: boolean) => {
      console.log('Отправка запроса подписки:', followed);
      const response = await apiRequest('POST', `/api/users/${userId}/follow`, { followed });
      console.log('Ответ сервера:', response);
      return await response.json();
    },
    onSuccess: (data) => {
      console.log('Успешная подписка, обновляем кэш');
      // Обновляем локальное состояние на основе ответа сервера
      if (data && typeof data.isFollowing === 'boolean') {
        setIsFollowing(data.isFollowing);
      }
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/follow-status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/stats`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
    },
    onError: (error) => {
      console.error('Ошибка подписки:', error);
      // Возвращаем предыдущее состояние при ошибке
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/follow-status`] });
    }
  });

  const handleFollowToggle = () => {
    const newFollowState = !isFollowing;
    console.log('Клик по кнопке подписки, новое состояние:', newFollowState);
    followMutation.mutate(newFollowState);
  };

  if (userLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!profileUser) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <h1 className="text-2xl font-bold text-muted-foreground">{t('profile.notFound')}</h1>
          <p className="text-muted-foreground">{t('profile.userNotExists')}</p>
        </div>
      </MainLayout>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profileUser?.profileImageUrl} alt={profileUser?.firstName || profileUser?.email} />
                  <AvatarFallback className="text-2xl">
                    {(profileUser?.firstName?.[0] || profileUser?.email?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    Редактировать профиль
                  </Button>
                ) : (
                  <Button 
                    variant={isFollowing ? "outline" : "default"} 
                    size="sm"
                    onClick={handleFollowToggle}
                    disabled={followMutation.isPending}
                  >
                    {followMutation.isPending 
                      ? (isFollowing ? 'Отписываюсь...' : 'Подписываюсь...')
                      : (isFollowing ? 'Отписаться' : 'Подписаться')
                    }
                  </Button>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">
                    {profileUser?.firstName && profileUser?.lastName 
                      ? `${profileUser.firstName} ${profileUser.lastName}`
                      : profileUser?.firstName || profileUser?.username || profileUser?.email?.split('@')[0] || 'Пользователь'
                    }
                  </h1>
                  <p className="text-muted-foreground">@{profileUser?.username || profileUser?.email?.split('@')[0] || 'user'}</p>
                </div>
                
                {profileUser.bio && (
                  <p className="text-lg">{profileUser.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profileUser.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profileUser.location}
                    </div>
                  )}
                  {profileUser.website && (
                    <div className="flex items-center gap-1">
                      <Code className="h-4 w-4" />
                      <a href={profileUser.website} target="_blank" rel="noopener noreferrer" 
                         className="text-primary hover:underline">
                        {profileUser.website}
                      </a>
                    </div>
                  )}
                  
                  {/* Social Media Links */}
                  <div className="flex items-center gap-4">
                    {profileUser?.github && (
                      <a 
                        href={profileUser.github.startsWith('http') ? profileUser.github : `https://github.com/${profileUser.github}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-accent"
                      >
                        <Github className="h-5 w-5" />
                        <span className="text-sm font-medium">GitHub</span>
                      </a>
                    )}
                    
                    {profileUser?.telegram && (
                      <a 
                        href={profileUser.telegram.startsWith('http') ? profileUser.telegram : `https://t.me/${profileUser.telegram}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-[#0088cc] transition-colors p-2 rounded-lg hover:bg-accent"
                      >
                        <SiTelegram className="h-5 w-5" />
                        <span className="text-sm font-medium">Telegram</span>
                      </a>
                    )}
                    
                    {profileUser?.twitter && (
                      <a 
                        href={profileUser.twitter.startsWith('http') ? profileUser.twitter : `https://twitter.com/${profileUser.twitter}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-[#1da1f2] transition-colors p-2 rounded-lg hover:bg-accent"
                      >
                        <SiX className="h-5 w-5" />
                        <span className="text-sm font-medium">Twitter</span>
                      </a>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      Присоединился {profileUser?.createdAt 
                        ? new Date(profileUser.createdAt).toLocaleDateString('ru-RU', { 
                            year: 'numeric', 
                            month: 'long',
                            day: 'numeric'
                          }) 
                        : 'недавно'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">{userStats?.followersCount || 0}</span>
                    <span className="text-muted-foreground">{t('profile.followers')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">{userStats?.followingCount || 0}</span>
                    <span className="text-muted-foreground">{t('profile.following')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-semibold">{userStats?.postsCount || 0}</span>
                    <span className="text-muted-foreground">{t('profile.posts')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">{t('profile.posts')}</TabsTrigger>
            <TabsTrigger value="likes">{t('profile.likes')}</TabsTrigger>
            <TabsTrigger value="snippets">{t('profile.codeSnippets')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4">
            {postsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : userPosts?.length > 0 ? (
              userPosts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('profile.noPosts')}</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? t('profile.noPostsOwn') : t('profile.noPostsUser')}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="likes" className="space-y-4">
            {currentUser?.id === userId ? (
              likedPostsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : likedPosts?.length > 0 ? (
                likedPosts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('profile.noLikes')}</h3>
                  <p className="text-muted-foreground">{t('profile.noLikesDesc')}</p>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Приватная информация</h3>
                <p className="text-muted-foreground">Понравившиеся посты доступны только владельцу профиля</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="snippets" className="space-y-4">
            {snippetsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : userSnippets?.length > 0 ? (
              userSnippets.map((snippet: any) => (
                <div key={snippet.id} className="border rounded-lg p-4 bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{snippet.title}</h3>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                      {snippet.language}
                    </span>
                  </div>
                  {snippet.description && (
                    <p className="text-sm text-muted-foreground mb-3">{snippet.description}</p>
                  )}
                  <CodeSnippet 
                    code={snippet.code} 
                    language={snippet.language} 
                    showLineNumbers={true}
                    maxHeight="300px"
                  />
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{new Date(snippet.createdAt).toLocaleDateString('ru-RU')}</span>
                    <span>{snippet.isPublic ? 'Публичный' : 'Приватный'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('profile.noSnippets')}</h3>
                <p className="text-muted-foreground">{t('profile.noSnippetsDesc')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <EditProfileDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        profileData={profileUser}
        onProfileUpdate={() => {
          // Refresh profile data after update
          window.location.reload();
        }}
      />
    </MainLayout>
  );
}