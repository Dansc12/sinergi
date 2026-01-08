import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useSavedPosts = (postId: string, contentType: string) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if post is already saved
  useEffect(() => {
    const checkSaved = async () => {
      if (!user?.id || !postId) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("saved_posts")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .maybeSingle();

      if (!error) {
        setIsSaved(!!data);
      }
      setIsLoading(false);
    };

    checkSaved();
  }, [user?.id, postId]);

  const toggleSave = useCallback(async () => {
    if (!user?.id || !postId) {
      toast.error("Please sign in to save posts");
      return;
    }

    if (isSaved) {
      // Unsave
      const { error } = await supabase
        .from("saved_posts")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", postId);

      if (error) {
        toast.error("Failed to unsave");
        return;
      }

      // If unsaving a workout, also remove from saved_workouts table
      if (contentType === "workout") {
        await supabase
          .from("saved_workouts")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);
      }

      setIsSaved(false);
      toast.success("Removed from saved");
    } else {
      // Save
      const { error } = await supabase.from("saved_posts").insert({
        user_id: user.id,
        post_id: postId,
        content_type: contentType,
      });

      if (error) {
        toast.error("Failed to save");
        return;
      }

      // If saving a workout, also add to saved_workouts table
      if (contentType === "workout") {
        // Fetch the post data to get workout details
        const { data: postData } = await supabase
          .from("posts")
          .select("content_data, description")
          .eq("id", postId)
          .single();

        if (postData) {
          const contentData = postData.content_data as Record<string, unknown>;
          const exercisesData = (contentData?.exercises || []) as unknown[];
          await supabase.from("saved_workouts").insert({
            user_id: user.id,
            post_id: postId,
            title: (contentData?.title as string) || (contentData?.name as string) || "Workout",
            exercises: JSON.parse(JSON.stringify(exercisesData)),
            tags: (contentData?.tags as string[]) || [],
            description: postData.description,
          });
        }
      }

      setIsSaved(true);
      
      // Show content-specific success message
      const typeLabel = contentType === "meal" ? "Meals" 
        : contentType === "recipe" ? "Recipes"
        : contentType === "workout" ? "Workouts"
        : contentType === "routine" ? "Routines"
        : "Saved";
      
      toast.success(`Saved to My ${typeLabel}`);
    }
  }, [user?.id, postId, contentType, isSaved]);

  return { isSaved, isLoading, toggleSave };
};
