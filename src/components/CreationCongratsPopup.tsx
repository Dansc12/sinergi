import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreationCongratsPopupProps {
  isVisible: boolean;
  contentType: "workout" | "meal" | "recipe" | "routine";
  onDismiss: () => void;
  onPost: () => void;
}

const contentLabels: Record<string, string> = {
  workout: "Workout",
  meal: "Meal",
  recipe: "Recipe",
  routine: "Routine",
};

const TIMER_DURATION = 5000; // 5 seconds

const CreationCongratsPopup = ({
  isVisible,
  contentType,
  onDismiss,
  onPost,
}: CreationCongratsPopupProps) => {
  const [visible, setVisible] = useState(isVisible);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    setVisible(isVisible);

    if (isVisible) {
      setProgress(100);
      startTimeRef.current = Date.now();

      const updateProgress = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, 100 - (elapsed / TIMER_DURATION) * 100);
        setProgress(remaining);

        if (remaining > 0) {
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        } else {
          setVisible(false);
          onDismiss();
        }
      };

      animationFrameRef.current = requestAnimationFrame(updateProgress);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isVisible, onDismiss]);

  const handleDismiss = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setVisible(false);
    onDismiss();
  };

  const handlePost = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setVisible(false);
    onPost();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-4 right-4 z-50"
        >
          <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            {/* Progress bar */}
            <div className="h-1 bg-muted w-full">
              <motion.div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>
            
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <PartyPopper size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">
                    {contentLabels[contentType]} Saved!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Would you like to share it with your friends?
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                  className="flex-1"
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  onClick={handlePost}
                  className="flex-1 gap-2"
                >
                  <Share2 size={16} />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreationCongratsPopup;
