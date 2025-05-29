import { useState } from "react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageSquare, Bookmark, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import CodeSnippet from "./CodeSnippet";
import { useLanguage } from "./LanguageProvider";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    codeSnippet?: string;
    language?: string;
    createdAt: string;
    likes: number;
    comments: number;
    isLiked: boolean;
    isBookmarked: boolean;
    isAiRecommended?: boolean;
    aiRecommendationReason?: string;
    tags: string[];
    user: {
      id: string;
      username: string;
      displayName: string;
      profileImageUrl: string;
    };
    image?: string;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  // Загружаем комментарии когда раздел комментариев открыт
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: [`/api/posts/${post.id}/comments`],
    enabled: showComments,
  });
  
  const likePostMutation = useMutation({
    mutationFn: () => {
      return apiRequest("POST", `/api/posts/${post.id}/like`, { liked: !liked });
    },
    onSuccess: () => {
      if (liked) {
        setLikesCount(prev => prev - 1);
      } else {
        setLikesCount(prev => prev + 1);
      }
      setLiked(!liked);
      // Обновляем кэш постов
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/trending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/latest'] });
    },
    onError: (error) => {
      toast({
        title: t('toast.error'),
        description: t('toast.postCreateError'),
        variant: "destructive",
      });
    }
  });
  
  const bookmarkPostMutation = useMutation({
    mutationFn: () => {
      return apiRequest("POST", `/api/posts/${post.id}/bookmark`, { bookmarked: !bookmarked });
    },
    onSuccess: () => {
      setBookmarked(!bookmarked);
      toast({
        title: bookmarked ? t('toast.postUnbookmarked') : t('toast.postBookmarked'),
        duration: 2000,
      });
    },
    onError: (error) => {
      toast({
        title: t('toast.error'),
        description: bookmarked ? t('toast.postUnbookmarked') : t('toast.postBookmarked'),
        variant: "destructive",
      });
    }
  });
  
  const handleLike = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    likePostMutation.mutate();
  };
  
  const handleBookmark = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    bookmarkPostMutation.mutate();
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.user.displayName}'s post on DevStream`,
          text: post.content.substring(0, 50) + "...",
          url: window.location.origin + `/post/${post.id}`,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      const url = `${window.location.origin}/post/${post.id}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied to clipboard",
        duration: 2000,
      });
    }
  };

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => {
      return apiRequest("POST", `/api/posts/${post.id}/comments`, { content });
    },
    onSuccess: () => {
      toast({
        title: language === 'ru' ? "Комментарий добавлен" : "Comment added",
        duration: 2000,
      });
      setCommentText("");
      // Перезагружаем комментарии
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
    },
    onError: () => {
      toast({
        title: language === 'ru' ? "Ошибка при добавлении комментария" : "Error adding comment",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText.trim());
  };
  
  return (
    <article 
      className={`bg-card rounded-lg border border-border/60 overflow-hidden hover:border-border transition-all duration-200 ${
        post.isAiRecommended ? "border-blue-200 dark:border-blue-800" : ""
      }`}
    >
      {post.isAiRecommended && (
        <div className="bg-muted/40 px-4 py-2 flex items-center text-sm border-b border-border/40">
          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 flex items-center justify-center">
            <span className="text-xs text-white font-bold">AI</span>
          </div>
          <span className="text-muted-foreground text-xs">
            {post.aiRecommendationReason || "Recommended by AI based on your interests"}
          </span>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <Link href={`/profile/${post.user.id}`}>
            <Avatar className="w-8 h-8 cursor-pointer hover:scale-105 transition-transform">
              <AvatarImage src={post.user.profileImageUrl} alt={post.user.displayName} />
              <AvatarFallback className="text-xs">{post.user.displayName[0]}</AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 text-sm">
              <Link href={`/profile/${post.user.id}`}>
                <span className="font-medium text-foreground hover:text-foreground/80 cursor-pointer transition-colors">
                  {post.user.displayName}
                </span>
              </Link>
              <Link href={`/profile/${post.user.id}`}>
                <span className="text-muted-foreground hover:text-foreground/60 cursor-pointer transition-colors">@{post.user.username}</span>
              </Link>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground text-xs">
                {(() => {
                  const distance = formatDistanceToNow(new Date(post.createdAt));
                  if (language === 'ru') {
                    // Обработка русских дат
                    if (distance.includes('less than a minute')) return 'меньше минуты назад';
                    if (distance.includes('1 minute')) return '1 минуту назад';
                    if (distance.includes('minutes')) {
                      const match = distance.match(/(\d+) minutes/);
                      if (match) {
                        const num = parseInt(match[1]);
                        if (num === 1) return '1 минуту назад';
                        if (num >= 2 && num <= 4) return `${num} минуты назад`;
                        return `${num} минут назад`;
                      }
                    }
                    if (distance.includes('about 1 hour')) return 'около 1 часа назад';
                    if (distance.includes('1 hour')) return '1 час назад';
                    if (distance.includes('hours')) {
                      const match = distance.match(/(\d+) hours/);
                      if (match) {
                        const num = parseInt(match[1]);
                        if (num === 1) return '1 час назад';
                        if (num >= 2 && num <= 4) return `${num} часа назад`;
                        return `${num} часов назад`;
                      }
                    }
                    if (distance.includes('1 day')) return '1 день назад';
                    if (distance.includes('days')) {
                      const match = distance.match(/(\d+) days/);
                      if (match) {
                        const num = parseInt(match[1]);
                        if (num === 1) return '1 день назад';
                        if (num >= 2 && num <= 4) return `${num} дня назад`;
                        return `${num} дней назад`;
                      }
                    }
                    return distance + ' назад';
                  }
                  return distance + ' ago';
                })()}
              </span>
            </div>
            
            <div className="mt-2 text-foreground/90 leading-relaxed">
              {post.content.includes('```') ? (
                post.content.split(/(```(\w*)\n[\s\S]*?\n```)/g).map((part, i) => {
                  if (i % 3 === 0) {
                    // Regular text
                    return part ? <p key={i}>{part}</p> : null;
                  } else if (i % 3 === 1) {
                    // This is the entire code block with backticks
                    const codeMatch = part.match(/```(\w*)\n([\s\S]*?)\n```/);
                    if (codeMatch) {
                      const language = codeMatch[1] || 'javascript';
                      const code = codeMatch[2] || '';
                      return (
                        <div className="mt-3 mb-3" key={i}>
                          <CodeSnippet 
                            code={code} 
                            language={language} 
                            showLineNumbers={true}
                            maxHeight="300px"
                          />
                        </div>
                      );
                    }
                    return null;
                  } else {
                    // Language identifier (already processed)
                    return null;
                  }
                })
              ) : (
                <p>
                  {post.content.split(/(\s+)/).map((word, index) => {
                    if (word.startsWith('#') && word.length > 1) {
                      return (
                        <span key={index} className="text-blue-500 hover:text-blue-600 cursor-pointer font-medium">
                          {word}
                        </span>
                      );
                    }
                    return word;
                  })}
                </p>
              )}
            </div>
            
            {post.codeSnippet && (
              <div className="mt-3">
                <CodeSnippet 
                  code={post.codeSnippet} 
                  language={post.language || 'javascript'} 
                  showLineNumbers={true}
                  maxHeight="300px"
                />
              </div>
            )}
            
            {post.image && (
              <img 
                src={post.image} 
                alt="Post attachment" 
                className="mt-3 rounded-lg w-full h-auto object-cover"
              />
            )}
            
            <div className="mt-4 space-y-3">
              {/* Action buttons */}
              <div className="flex items-center space-x-6">
                <button 
                  className="flex items-center space-x-1.5 text-muted-foreground hover:text-foreground transition-colors group"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">{post.comments || 0}</span>
                </button>
                
                <button 
                  className={`flex items-center space-x-1.5 transition-colors group ${
                    liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                  }`}
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 group-hover:scale-110 transition-transform ${liked ? "fill-current" : ""}`} />
                  <span className="text-sm">{likesCount}</span>
                </button>
                
                <button 
                  className={`flex items-center space-x-1.5 transition-colors group ${
                    bookmarked ? "text-blue-500" : "text-muted-foreground hover:text-blue-500"
                  }`}
                  onClick={handleBookmark}
                >
                  <Bookmark className={`h-4 w-4 group-hover:scale-110 transition-transform ${bookmarked ? "fill-current" : ""}`} />
                </button>
                
                <button 
                  className="flex items-center space-x-1.5 text-muted-foreground hover:text-foreground transition-colors group"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>
              
              {/* Hashtags - separate row */}
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-w-full overflow-hidden">
                  {post.tags.slice(0, 5).map((tag, index) => {
                    const tagColors = {
                      "React": "blue",
                      "Python": "yellow", 
                      "DataScience": "green",
                      "ML": "red",
                      "Docker": "teal",
                      "TypeScript": "blue",
                      "JavaScript": "yellow",
                      "Performance": "purple"
                    };
                    
                    const colorKey = Object.keys(tagColors).find(key => 
                      tag.toLowerCase() === key.toLowerCase()
                    ) || Object.keys(tagColors)[index % Object.keys(tagColors).length];
                    
                    const color = tagColors[colorKey as keyof typeof tagColors] || "gray";
                    
                    return (
                      <Badge 
                        key={tag} 
                        variant="outline"
                        className={`
                          text-xs px-2 py-1 rounded-full shrink-0 cursor-pointer hover:opacity-80 whitespace-nowrap
                          ${color === 'blue' && 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'} 
                          ${color === 'yellow' && 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'} 
                          ${color === 'green' && 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'} 
                          ${color === 'red' && 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'} 
                          ${color === 'teal' && 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200'} 
                          ${color === 'purple' && 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'} 
                          ${color === 'gray' && 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'}
                        `}
                        onClick={() => {
                          localStorage.setItem('selectedHashtag', tag);
                          window.location.href = '/explore';
                        }}
                      >
                        #{tag}
                      </Badge>
                    );
                  })}
                  {post.tags.length > 6 && (
                    <Badge variant="outline" className="text-xs px-2 py-1 rounded-full text-gray-500">
                      +{post.tags.length - 6}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
            <div className="space-y-3">
              {/* Add Comment Input */}
              {isAuthenticated && (
                <div className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/api/placeholder/32/32" alt="Your avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder={language === 'ru' ? "Написать комментарий..." : "Write a comment..."}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[60px] resize-none"
                    />
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        onClick={handleAddComment}
                        disabled={!commentText.trim()}
                        className="px-4"
                      >
                        {language === 'ru' ? "Отправить" : "Post"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Comments List */}
              <div className="space-y-3 pt-2">
                {commentsLoading ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ru' ? "Загрузка комментариев..." : "Loading comments..."}
                  </div>
                ) : (comments as any[]).length > 0 ? (
                  (comments as any[]).map((comment: any) => (
                    <div key={comment.id} className="flex space-x-2">
                      <Avatar className="w-6 h-6 mt-1">
                        <AvatarImage src={comment.user?.profileImageUrl || "/api/placeholder/32/32"} alt={comment.user?.displayName} />
                        <AvatarFallback className="text-xs">{comment.user?.displayName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline space-x-2">
                          <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {comment.user?.displayName || comment.user?.username || 'Пользователь'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {formatDistanceToNow(new Date(comment.createdAt))} {language === 'ru' ? 'назад' : 'ago'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 break-words">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ru' ? "Пока нет комментариев" : "No comments yet"}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
