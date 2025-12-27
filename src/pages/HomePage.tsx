import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HomeHeader } from "@/components/home/HomeHeader";
import { ProgressCharts } from "@/components/home/ProgressCharts";
import { TasksSection } from "@/components/home/TasksSection";
import { useUserData } from "@/hooks/useUserData";
import CreationCongratsPopup from "@/components/CreationCongratsPopup";

interface LocationState {
  showCongrats?: boolean;
  contentType?: "workout" | "meal" | "recipe" | "routine";
  contentData?: Record<string, unknown>;
  images?: string[];
}

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { profile, streakCount, todaysTasks, isLoading } = useUserData();

  const [showCongratsPopup, setShowCongratsPopup] = useState(false);
  const [congratsContentType, setCongratsContentType] = useState<"workout" | "meal" | "recipe" | "routine">("workout");
  const [congratsData, setCongratsData] = useState<{ contentData?: Record<string, unknown>; images?: string[] }>({});

  useEffect(() => {
    if (state?.showCongrats && state?.contentType) {
      setCongratsContentType(state.contentType);
      setCongratsData({ contentData: state.contentData, images: state.images });
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
    </div>
  );
};

export default HomePage;
