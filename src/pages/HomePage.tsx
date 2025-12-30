import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HomeHeader } from "@/components/home/HomeHeader";
import { ProgressCharts } from "@/components/home/ProgressCharts";
import { TasksSection } from "@/components/home/TasksSection";
import { useUserData } from "@/hooks/useUserData";
import CreationCongratsPopup from "@/components/CreationCongratsPopup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LocationState {
  showCongrats?: boolean;
  contentType?: "workout" | "meal" | "recipe" | "routine";
  contentData?: Record<string, unknown>;
  images?: string[];
  canShare?: boolean;
}

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { profile, streakCount, todaysTasks, isLoading } = useUserData();

  const [showCongratsPopup, setShowCongratsPopup] = useState(false);
  const [congratsContentType, setCongratsContentType] = useState<"workout" | "meal" | "recipe" | "routine">("workout");
  const [congratsData, setCongratsData] = useState<{ contentData?: Record<string, unknown>; images?: string[] }>({});
  const [canShareContent, setCanShareContent] = useState(true);
  const [showSaveAsMealDialog, setShowSaveAsMealDialog] = useState(false);

  useEffect(() => {
    if (state?.showCongrats && state?.contentType) {
      setCongratsContentType(state.contentType);
      setCongratsData({ contentData: state.contentData, images: state.images });
      setCanShareContent(state.canShare !== false);
      setShowCongratsPopup(true);
      // Clear the state so refresh doesn't show popup again
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  const userName = profile?.first_name || "User";
  const avatarUrl = profile?.avatar_url || undefined;

  // Convert todaysTasks to a Set of completed task IDs
  const completedTasks = new Set<string>();
  if (todaysTasks.breakfast) completedTasks.add("breakfast");
  if (todaysTasks.lunch) completedTasks.add("lunch");
  if (todaysTasks.dinner) completedTasks.add("dinner");
  if (todaysTasks.workout) completedTasks.add("workout");
  if (todaysTasks.water) completedTasks.add("water");

  const handleCongratsPost = () => {
    setShowCongratsPopup(false);
    
    // If it's a meal and can't share, show the save as meal dialog
    if (congratsContentType === "meal" && !canShareContent) {
      setShowSaveAsMealDialog(true);
      return;
    }
    
    navigate("/share", {
      state: {
        contentType: congratsContentType,
        contentData: congratsData.contentData || {},
        images: congratsData.images || [],
        returnTo: "/",
        fromSelection: true,
      },
    });
  };

  const handleCongratsDismiss = () => {
    setShowCongratsPopup(false);
  };

  const handleSaveAsMeal = () => {
    setShowSaveAsMealDialog(false);
    // Navigate to create saved meal with the current foods
    navigate("/create/saved-meal", {
      state: {
        foods: (congratsData.contentData as { foods?: unknown[] })?.foods || [],
        mealType: (congratsData.contentData as { mealType?: string })?.mealType,
        photos: congratsData.images || [],
      },
    });
  };

  return (
    <div className="min-h-screen">
      <HomeHeader 
        userName={userName}
        streakCount={streakCount}
        avatarUrl={avatarUrl}
        onProfileClick={() => navigate("/profile")}
      />
      
      <div className="animate-fade-in">
        <ProgressCharts />
        <TasksSection completedTasks={completedTasks} />
      </div>

      <CreationCongratsPopup
        isVisible={showCongratsPopup}
        contentType={congratsContentType}
        onDismiss={handleCongratsDismiss}
        onPost={handleCongratsPost}
      />

      {/* Save as Meal Dialog - shown when user tries to share individual foods */}
      <Dialog open={showSaveAsMealDialog} onOpenChange={setShowSaveAsMealDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save as a Meal to Share</DialogTitle>
            <DialogDescription>
              To share your meal with friends, you need to save it as a Meal first. Would you like to create a Saved Meal with these foods?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowSaveAsMealDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAsMeal}>
              Save as Meal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
