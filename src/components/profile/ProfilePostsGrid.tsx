import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PostDetailModal } from "@/components/connect/PostDetailModal";
import { PostData } from "@/components/connect/PostCard";
import { Loader2, Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Json } from "@/integrations/supabase/types";

interface Post {
  id: string;
  user_id: string;
  content_type: string;
  content_data: Json;
  description: string | null;
  images: string[] | null;
  visibility: string;
  created_at: string;
}

interface ProfilePostsGridProps {
  onEmptyAction?: () => void;
  emptyState: {
    title: string;
    description: string;
    action: string;
  };
  userId?: string;
}

const transformToPostData = (
  post: Post,
  userName: string,
  userHandle: string,
  userAvatar?: string
): PostData => {
  const contentData = post.content_data as Record<string, unknown>;

  let displayContent = post.description || "";

  if (post.content_type === "meal" && !post.description) {
    const mealType = (contentData?.mealType as string) || "Meal";
    const foods = (contentData?.foods as Array<{ name: string }>) || [];
    const foodNames = foods.map((f) => f.name).join(", ");
    displayContent = `Logged ${mealType}: ${foodNames}`;
  } else if (post.content_type === "workout" && !post.description) {
    const exercises = (contentData?.exercises as Array<{ name: string }>) || [];
    const exerciseNames = exercises.map((e) => e.name).join(", ");
    displayContent = `Completed workout: ${exerciseNames}`;
  } else if (post.content_type === "recipe" && !post.description) {
    const recipeName = (contentData?.name as string) || "Recipe";
    displayContent = `Shared a recipe: ${recipeName}`;
  } else if (post.content_type === "routine" && !post.description) {
    const routineName = (contentData?.name as string) || "Routine";
    displayContent = `Created routine: ${routineName}`;
  }

  return {
    id: post.id,
    userId: post.user_id,
    user: {
      name: userName,
      avatar: userAvatar,
      handle: userHandle,
    },
    content: displayContent,
    images: post.images || undefined,
    type: post.content_type as PostData["type"],
    timeAgo: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
    contentData: post.content_data,
    hasDescription: !!post.description,
    createdAt: post.created_at,
  };
};

export const ProfilePostsGrid = ({
  onEmptyAction,
  emptyState,
  userId,
}: ProfilePostsGridProps) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [profile, setProfile] = useState<{
    first_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!targetUserId) {
        setPosts([]);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch only actual posts (content_type = 'post') that are not private
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", targetUserId)
          .eq("content_type", "post")
          .neq("visibility", "private")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchProfile = async () => {
      if (!targetUserId) return;
      const { data } = await supabase
        .from("profiles")
        .select("first_name, username, avatar_url")
        .eq("user_id", targetUserId)
        .single();
      if (data) setProfile(data);
    };

    fetchPosts();
    fetchProfile();
  }, [targetUserId]);

  const isOwnProfile = user?.id === targetUserId;
  const userName = profile?.first_name || (isOwnProfile ? "You" : "User");
  const userHandle = profile?.username
    ? `@${profile.username}`
    : isOwnProfile
    ? "@you"
    : "@user";
  const userAvatar = profile?.avatar_url || undefined;

  if (isLoading) {
    return (
      <div className="col-span-2 py-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="col-span-2 py-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Plus size={24} className="text-muted-foreground" />
        </div>
        <p className="font-medium mb-1">{emptyState.title}</p>
        <p className="text-sm text-muted-foreground mb-4 max-w-[200px]">
          {emptyState.description}
        </p>
        {onEmptyAction && emptyState.action && (
          <Button size="sm" variant="outline" onClick={onEmptyAction}>
            {emptyState.action}
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="col-span-2 grid grid-cols-2 gap-1">
        {posts.map((post) => {
          const firstImage = post.images?.[0];
          const hasMultipleImages = (post.images?.length || 0) > 1;

          return (
            <button
              key={post.id}
              onClick={() =>
                setSelectedPost(
                  transformToPostData(post, userName, userHandle, userAvatar)
                )
              }
              className="relative aspect-square bg-muted overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {firstImage ? (
                <img
                  src={firstImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <ImageIcon size={32} className="text-muted-foreground" />
                </div>
              )}
              {hasMultipleImages && (
                <div className="absolute top-2 right-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-white drop-shadow-md"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="14"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    <rect
                      x="7"
                      y="7"
                      width="14"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="white"
                      fillOpacity="0.3"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedPost && (
        <PostDetailModal
          open={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
        />
      )}
    </>
  );
};
