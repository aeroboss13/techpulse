import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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

  const defaultTrendingTopics: TrendingTopic[] = [
    { id: "1", category: "Web Dev", name: "#TypeScript5.0", postCount: 4218 },
    { id: "2", category: "AI", name: "#GPT4", postCount: 3112 },
    { id: "3", category: "Cloud", name: "#Kubernetes", postCount: 2854 },
    { id: "4", category: "Security", name: "#ZeroTrust", postCount: 1932 }
  ];

  const defaultSuggestedUsers: SuggestedUser[] = [
    { id: "1", username: "johndoe", displayName: "John Doe", profileImageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50" },
    { id: "2", username: "lisacodes", displayName: "Lisa Wang", profileImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50" },
    { id: "3", username: "mikejs", displayName: "Mike Johnson", profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50" }
  ];

  const displayTopics = trendingTopics || defaultTrendingTopics;
  const displayUsers = suggestedUsers || defaultSuggestedUsers;

  return (
    <aside className="hidden lg:block w-80 pl-8">
      <div className="sticky top-20 space-y-6">
        {/* Trending Topics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Trending in Tech</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {displayTopics.map(topic => (
                <li key={topic.id}>
                  <Link href={`/explore?topic=${encodeURIComponent(topic.name)}`}>
                    <a className="block hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-2 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Trending in {topic.category}
                      </div>
                      <div className="font-medium">{topic.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Intl.NumberFormat('en-US').format(topic.postCount)} posts
                      </div>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Who to Follow */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Who to follow</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-4">
              {displayUsers.map(user => (
                <li key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user.profileImageUrl} alt={user.displayName} />
                      <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.displayName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1 h-auto" size="sm">
                    Follow
                  </Button>
                </li>
              ))}
            </ul>
            <Button variant="link" className="mt-4 p-0 h-auto" asChild>
              <Link href="/explore">Show more</Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* AI Feature */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm p-4 text-white">
          <div className="flex items-center space-x-3 mb-3">
            <Bot className="h-6 w-6" />
            <h3 className="font-bold text-lg">AI Code Assistant</h3>
          </div>
          <p className="mb-4 text-sm opacity-90">
            Get help with debugging, code reviews, or generate boilerplate code with our AI assistant.
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
            <Link href="/ai-assistant">Try It Now</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
