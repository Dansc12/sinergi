import { useState, useRef } from "react";
import { NutritionView } from "@/components/daily-log/NutritionView";
import { FitnessView } from "@/components/daily-log/FitnessView";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, isToday, isYesterday, isTomorrow } from "date-fns";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

type TabType = "nutrition" | "fitness";

const DailyLogPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("nutrition");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [direction, setDirection] = useState(0);

  const goToPreviousDay = () => {
    setDirection(-1);
    setSelectedDate(prev => subDays(prev, 1));
  };

  const goToNextDay = () => {
    setDirection(1);
    setSelectedDate(prev => addDays(prev, 1));
  };

  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      goToPreviousDay();
    } else if (info.offset.x < -swipeThreshold) {
      goToNextDay();
    }
  };

  const getDateLabel = (date: Date): string => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-elevated px-4 py-4">
        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousDay}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          
          <AnimatePresence mode="wait" custom={direction}>
            <motion.span
              key={selectedDate.toISOString()}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="text-xl font-bold"
            >
              {getDateLabel(selectedDate)}
            </motion.span>
          </AnimatePresence>
          
          <button
            onClick={goToNextDay}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        {/* Segmented Control */}
        <div className="bg-muted rounded-xl p-1 flex">
          <button
            onClick={() => setActiveTab("nutrition")}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === "nutrition"
                ? "bg-card text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Nutrition
          </button>
          <button
            onClick={() => setActiveTab("fitness")}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === "fitness"
                ? "bg-card text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Fitness
          </button>
        </div>
      </header>

      {/* Content with swipe */}
      <motion.div
        className="px-4 py-4"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleSwipe}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${selectedDate.toISOString()}-${activeTab}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            {activeTab === "nutrition" ? (
              <NutritionView selectedDate={selectedDate} />
            ) : (
              <FitnessView selectedDate={selectedDate} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DailyLogPage;
