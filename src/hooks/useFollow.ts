import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

export function useFollow(otherUserId: string | null) {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const checkFollow = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !otherUserId) return setIsFollowing(false);
      setCurrentUserId(user.id);

      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("followee_id", otherUserId)
        .single();

      setIsFollowing(!!data);
    } finally {
      setIsLoading(false);
    }
  }, [otherUserId]);

  const follow = async () => {
    if (!currentUserId || !otherUserId) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: currentUserId, followee_id: otherUserId });
      if (error) throw error;
      setIsFollowing(true);
      toast.success("Started following!");
    } catch {
      toast.error("Failed to follow user");
    }
    setIsLoading(false);
  };

  const unfollow = async () => {
    if (!currentUserId || !otherUserId) return;
    setIsLoading(true);
    try {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("followee_id", otherUserId);
      setIsFollowing(false);
      toast.success("Unfollowed");
    } catch {
      toast.error("Failed to unfollow");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkFollow();
  }, [checkFollow]);

  return { isFollowing, isLoading, follow, unfollow };
}
