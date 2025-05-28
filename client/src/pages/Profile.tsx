import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostCard from '@/components/PostCard';
import EditProfileDialog from '@/components/EditProfileDialog';
import { useLanguage } from '@/components/LanguageProvider';
import { useAuth } from '@/hooks/useAuth';
import { CalendarDays, MapPin, Users, MessageSquare, Heart, Code, Briefcase } from 'lucide-react';

export default function Profile() {
  const { userId } = useParams();
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: profileUser, isLoading: userLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
  });

  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: [`/api/posts/user/${userId}`],
  });

  const { data: userStats } = useQuery({
    queryKey: [`/api/users/${userId}/stats`],
  });

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
                {isOwnProfile && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    Редактировать профиль
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
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('profile.noLikes')}</h3>
              <p className="text-muted-foreground">{t('profile.noLikesDesc')}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="snippets" className="space-y-4">
            <div className="text-center py-12">
              <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('profile.noSnippets')}</h3>
              <p className="text-muted-foreground">{t('profile.noSnippetsDesc')}</p>
            </div>
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