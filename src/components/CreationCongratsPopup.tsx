import { useEffect, useState } from "react";
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

const CreationCongratsPopup = ({
  isVisible,
  contentType,
  onDismiss,
  onPost,
}: CreationCongratsPopupProps) => {
  const [visible, setVisible] = useState(isVisible);

  useEffect(() => {
    setVisible(isVisible);

    if (isVisible) {
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss();
  };

  const handlePost = () => {
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
          <div className="bg-card border border-border rounded-2xl shadow-lg p-4">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreationCongratsPopup;
