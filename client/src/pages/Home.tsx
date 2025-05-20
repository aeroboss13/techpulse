import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/MainLayout";
import CreatePostCard from "@/components/CreatePostCard";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated } = useAuth();
  
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
            Failed to load posts. Please try again later.
          </div>
        ) : posts?.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center">
            <h3 className="text-xl font-medium mb-2">No posts yet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to share something with the community!
            </p>
          </div>
        ) : (
          posts?.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </MainLayout>
  );
}
