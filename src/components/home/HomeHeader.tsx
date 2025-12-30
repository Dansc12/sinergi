import { Flame } from "lucide-react";
import { createPortal } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationsPanel } from "./NotificationsPanel";

interface HomeHeaderProps {
  userName: string;
  streakCount: number;
  avatarUrl?: string;
  onProfileClick: () => void;
}

export const HomeHeader = ({
  userName,
  streakCount,
  avatarUrl,
  onProfileClick,
}: HomeHeaderProps) => {
  const header = (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background">
      {/* Top Bar */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Avatar & Streak Badge */}
          <div className="flex items-center gap-3">
            <button onClick={onProfileClick}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl} alt={userName} />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>

            <div className="flex items-center gap-1.5 bg-streak text-primary-foreground px-3 py-1.5 rounded-full text-sm font-bold">
              <Flame size={16} />
              <span>{streakCount}</span>
            </div>
          </div>

          {/* Right: Notification Bell */}
          <NotificationsPanel />
        </div>
      </div>
    </header>
  );

  // Portal to <body> so the header is truly viewport-fixed even if some ancestor creates
  // a containing block (e.g. via transform/filter/backdrop-filter).
  if (typeof document === "undefined") return header;
  return createPortal(header, document.body);
};
