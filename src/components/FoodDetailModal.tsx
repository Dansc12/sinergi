import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FoodItem {
  fdcId: number;
  description: string;
  brandName?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize?: string;
}

interface FoodDetailModalProps {
  isOpen: boolean;
  food: FoodItem | null;
  onClose: () => void;
  onConfirm: (food: FoodItem, servings: number, servingSize: string) => void;
}

const servingSizeOptions = [
  { value: "serving", label: "1 serving" },
  { value: "100g", label: "100g" },
  { value: "1oz", label: "1 oz (28g)" },
  { value: "cup", label: "1 cup" },
];

export const FoodDetailModal = ({
  isOpen,
  food,
  onClose,
  onConfirm,
}: FoodDetailModalProps) => {
  const [servings, setServings] = useState(1);
  const [servingSize, setServingSize] = useState("serving");

  useEffect(() => {
    if (isOpen) {
      setServings(1);
      setServingSize("serving");
    }
  }, [isOpen, food]);

  if (!food) return null;

  const adjustedCalories = Math.round(food.calories * servings);
  const adjustedProtein = food.protein * servings;
  const adjustedCarbs = food.carbs * servings;
  const adjustedFats = food.fats * servings;

  const totalMacros = adjustedProtein + adjustedCarbs + adjustedFats;
  const proteinPercentage = totalMacros > 0 ? (adjustedProtein / totalMacros) * 100 : 0;
  const carbsPercentage = totalMacros > 0 ? (adjustedCarbs / totalMacros) * 100 : 0;
  const fatsPercentage = totalMacros > 0 ? (adjustedFats / totalMacros) * 100 : 0;

  // Calculate stroke dash for the circular progress
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  
  // Convert percentages to stroke offsets for each macro segment
  const proteinDash = (proteinPercentage / 100) * circumference;
  const carbsDash = (carbsPercentage / 100) * circumference;
  const fatsDash = (fatsPercentage / 100) * circumference;

  const handleConfirm = () => {
    onConfirm(food, servings, servingSize);
  };

  const decrementServings = () => {
    if (servings > 0.5) {
      setServings(prev => Math.round((prev - 0.5) * 10) / 10);
    }
  };

  const incrementServings = () => {
    setServings(prev => Math.round((prev + 0.5) * 10) / 10);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background z-50"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="h-full flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft size={24} />
              </Button>
              <h2 className="text-lg font-semibold flex-1 text-center truncate px-2">
                {food.description}
              </h2>
              <Button variant="ghost" size="icon" onClick={handleConfirm}>
                <Check size={24} className="text-primary" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-start gap-6">
                {/* Calorie Circle with Macro Ring */}
                <div className="relative flex-shrink-0">
                  <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="12"
                    />
                    {/* Protein segment (blue) */}
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="hsl(220 90% 56%)"
                      strokeWidth="12"
                      strokeDasharray={`${proteinDash} ${circumference}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                    {/* Carbs segment (yellow/orange) */}
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="hsl(45 93% 47%)"
                      strokeWidth="12"
                      strokeDasharray={`${carbsDash} ${circumference}`}
                      strokeDashoffset={-proteinDash}
                      strokeLinecap="round"
                    />
                    {/* Fats segment (pink/red) */}
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="hsl(340 82% 52%)"
                      strokeWidth="12"
                      strokeDasharray={`${fatsDash} ${circumference}`}
                      strokeDashoffset={-(proteinDash + carbsDash)}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Center calorie text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{adjustedCalories}</span>
                    <span className="text-xs text-muted-foreground">cal</span>
                  </div>
                </div>

                {/* Servings Controls */}
                <div className="flex-1 space-y-4">
                  {/* Number of Servings */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Number of Servings
                    </label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={decrementServings}
                      >
                        <Minus size={18} />
                      </Button>
                      <span className="text-2xl font-bold min-w-[3rem] text-center">
                        {servings}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={incrementServings}
                      >
                        <Plus size={18} />
                      </Button>
                    </div>
                  </div>

                  {/* Serving Size */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Serving Size
                    </label>
                    <Select value={servingSize} onValueChange={setServingSize}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {servingSizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Macro Breakdown */}
              <div className="mt-8 space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Nutrition Facts</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-card border border-border text-center">
                    <div className="w-3 h-3 rounded-full bg-[hsl(220,90%,56%)] mx-auto mb-2" />
                    <div className="text-lg font-bold">{adjustedProtein.toFixed(1)}g</div>
                    <div className="text-xs text-muted-foreground">Protein</div>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border text-center">
                    <div className="w-3 h-3 rounded-full bg-[hsl(45,93%,47%)] mx-auto mb-2" />
                    <div className="text-lg font-bold">{adjustedCarbs.toFixed(1)}g</div>
                    <div className="text-xs text-muted-foreground">Carbs</div>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border text-center">
                    <div className="w-3 h-3 rounded-full bg-[hsl(340,82%,52%)] mx-auto mb-2" />
                    <div className="text-lg font-bold">{adjustedFats.toFixed(1)}g</div>
                    <div className="text-xs text-muted-foreground">Fats</div>
                  </div>
                </div>
              </div>

              {/* Macro Legend */}
              <div className="mt-6 flex justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[hsl(220,90%,56%)]" />
                  <span className="text-muted-foreground">{proteinPercentage.toFixed(0)}% Protein</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[hsl(45,93%,47%)]" />
                  <span className="text-muted-foreground">{carbsPercentage.toFixed(0)}% Carbs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[hsl(340,82%,52%)]" />
                  <span className="text-muted-foreground">{fatsPercentage.toFixed(0)}% Fats</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};