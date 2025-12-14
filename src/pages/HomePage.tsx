import { useNavigate } from "react-router-dom";
import { HomeHeader } from "@/components/home/HomeHeader";
import { ProgressCharts } from "@/components/home/ProgressCharts";
import { TasksSection } from "@/components/home/TasksSection";
import { useUserData } from "@/hooks/useUserData";

const HomePage = () => {
  const navigate = useNavigate();
  const { profile, streakCount, todaysTasks, isLoading } = useUserData();

  const userName = profile?.first_name || "User";
  const avatarUrl = profile?.avatar_url || undefined;

  // Convert todaysTasks to a Set of completed task IDs
  const completedTasks = new Set<string>();
  if (todaysTasks.breakfast) completedTasks.add("breakfast");
  if (todaysTasks.lunch) completedTasks.add("lunch");
  if (todaysTasks.dinner) completedTasks.add("dinner");
  if (todaysTasks.workout) completedTasks.add("workout");
  if (todaysTasks.water) completedTasks.add("water");

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
    </div>
  );
};

export default HomePage;
