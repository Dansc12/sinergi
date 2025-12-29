import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servings?: number;
  servingSize?: string;
}

interface Ingredient {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servings: number;
  servingSize: string;
}

interface Creator {
  name: string;
  avatar_url?: string | null;
}

type MealItem = Food | Ingredient;

interface MealSavedCardProps {
  title: string;
  items: MealItem[];
  creator: Creator;
  createdAt: string;
  onCopy: () => void;
  copyButtonText?: string;
  isRecipe?: boolean;
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFats?: number;
}

const MealSavedCard = ({
  title,
  items,
  creator,
  createdAt,
  onCopy,
  copyButtonText = "Copy",
  isRecipe = false,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFats,
}: MealSavedCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  // Calculate totals if not provided
  const calcCalories = totalCalories ?? items.reduce<number>((sum, f) => sum + f.calories, 0);
  const calcProtein = totalProtein ?? items.reduce<number>((sum, f) => sum + f.protein, 0);
  const calcCarbs = totalCarbs ?? items.reduce<number>((sum, f) => sum + f.carbs, 0);
  const calcFats = totalFats ?? items.reduce<number>((sum, f) => sum + f.fats, 0);

  return (
    <div
      className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* Collapsed View */
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3"
          >
            {/* Avatar */}
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={creator.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-sm">
                {getInitials(creator.name)}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h4 className="font-semibold text-foreground truncate">{title}</h4>
              
              {/* Date */}
              <span className="text-xs text-muted-foreground -mt-0.5 block">
                {formatDate(createdAt)}
              </span>

              {/* Items Preview */}
              <p className="text-xs text-muted-foreground/80 mt-1.5 truncate">
                {items.map((f) => f.name).join(", ")}
              </p>
            </div>

            {/* Copy Button */}
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              className="shrink-0"
            >
              {copyButtonText}
            </Button>
          </motion.div>
        ) : (
          /* Expanded View */
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header Row */}
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={creator.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {getInitials(creator.name)}
                </AvatarFallback>
              </Avatar>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Copy Button */}
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy();
                }}
                className="shrink-0"
              >
                {copyButtonText}
              </Button>
            </div>

            {/* Title and Date under avatar */}
            <div className="mt-3">
              <h4 className="font-semibold text-foreground">{title}</h4>
              <span className="text-xs text-muted-foreground">
                {formatDate(createdAt)}
              </span>
            </div>

            {/* Nutrition Summary */}
            <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
              <span>{Math.round(calcCalories)} cal</span>
              <span>P: {Math.round(calcProtein)}g</span>
              <span>C: {Math.round(calcCarbs)}g</span>
              <span>F: {Math.round(calcFats)}g</span>
            </div>

            {/* Food/Ingredient Details */}
            <div className="mt-4 space-y-3">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="space-y-1">
                  <h5 className="font-medium text-foreground text-sm">{item.name}</h5>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-muted/50 px-2 py-1 rounded">
                      {item.servings || 1} × {item.servingSize || "serving"}
                    </span>
                    <span className="text-xs bg-muted/50 px-2 py-1 rounded">
                      {Math.round(item.calories)} cal
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MealSavedCard;