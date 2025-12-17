import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footprints, Clock, Dumbbell, ChevronRight, ChevronDown, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useDailyLogs } from "@/hooks/useDailyLogs";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WorkoutExercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
  notes: string;
  isCardio: boolean;
  sets: {
    id: string;
    weight: string;
    reps: string;
    distance: string;
    time: string;
    completed: boolean;
  }[];
}

interface WorkoutLog {
  id: string;
  exercises: WorkoutExercise[];
  notes: string | null;
  photos: string[] | null;
  created_at: string;
}

interface FitnessViewProps {
  selectedDate?: Date;
}

export const FitnessView = ({ selectedDate }: FitnessViewProps) => {
  const navigate = useNavigate();
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null);
  
  const { workoutLogs, isLoading } = useDailyLogs(selectedDate || new Date());
  
  const steps = 0;
  const stepsGoal = 10000;
  const stepsLeft = stepsGoal - steps;

  const toggleWorkout = (workoutId: string) => {
    setExpandedWorkout(expandedWorkout === workoutId ? null : workoutId);
  };

  const handleQuickLogWorkout = () => {
    navigate("/create/workout");
  };

  const getWorkoutSummary = (workout: WorkoutLog) => {
    const exerciseCount = workout.exercises.length;
    const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    return `${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''} • ${totalSets} set${totalSets !== 1 ? 's' : ''}`;
  };

  const formatWorkoutTime = (createdAt: string) => {
    return format(new Date(createdAt), "h:mm a");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Steps Progress - No Frame */}
      <div className="text-center">
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              strokeWidth="14"
              stroke="hsl(var(--muted))"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              strokeWidth="14"
              stroke="url(#stepsGradient)"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(steps / stepsGoal) * 440} 440`}
            />
            <defs>
              <linearGradient id="stepsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(270, 91%, 65%)" />
                <stop offset="100%" stopColor="hsl(320, 100%, 60%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Footprints className="text-primary mb-1" size={24} />
            <span className="text-3xl font-bold">{steps.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">{stepsLeft.toLocaleString()} to go</span>
          </div>
        </div>
      </div>

      {/* Logged Workouts */}
      <div>
        <h3 className="font-semibold mb-3">Logged Workouts</h3>
        
        {workoutLogs.length > 0 ? (
          <div className="space-y-3">
            {workoutLogs.map((workout) => (
              <motion.div
                key={workout.id}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Workout Header */}
                <button
                  onClick={() => toggleWorkout(workout.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Dumbbell size={18} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Workout</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock size={14} />
                        <span>{formatWorkoutTime(workout.created_at)}</span>
                        <span>•</span>
                        <span>{getWorkoutSummary(workout)}</span>
                      </div>
                    </div>
                  </div>
                  {expandedWorkout === workout.id ? (
                    <ChevronDown size={20} className="text-muted-foreground" />
                  ) : (
                    <ChevronRight size={20} className="text-muted-foreground" />
                  )}
                </button>

                {/* Expanded Workout Details */}
                <AnimatePresence>
                  {expandedWorkout === workout.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        {/* Exercise List */}
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                          {workout.exercises.slice(0, 5).map((exercise, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-foreground">{exercise.name}</span>
                              <span className="text-muted-foreground">
                                {exercise.sets.length} set{exercise.sets.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          ))}
                          {workout.exercises.length > 5 && (
                            <span className="text-xs text-primary">
                              +{workout.exercises.length - 5} more exercises
                            </span>
                          )}
                        </div>

                        {/* View Details Button */}
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => setSelectedWorkout(workout)}
                        >
                          View Full Details
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Preview when collapsed */}
                {expandedWorkout !== workout.id && (
                  <div className="px-4 pb-4">
                    <div className="text-sm text-muted-foreground space-y-1">
                      {workout.exercises.slice(0, 3).map((exercise, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{exercise.name}</span>
                          <span>{exercise.sets.length} set{exercise.sets.length !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                      {workout.exercises.length > 3 && (
                        <span className="text-xs text-primary">
                          +{workout.exercises.length - 3} more exercises
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <Calendar size={32} className="mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-1">No workouts logged for this day</p>
            <p className="text-sm text-muted-foreground/70 mb-4">
              Log a workout to track your progress
            </p>
          </div>
        )}

        {/* Quick Log Workout Button */}
        <Button
          variant="outline"
          className="w-full mt-4 gap-2 border-primary/50 text-primary hover:bg-primary/10"
          onClick={handleQuickLogWorkout}
        >
          <Dumbbell size={18} />
          Log a Workout
        </Button>
      </div>

      {/* Workout Detail Modal */}
      <Dialog open={!!selectedWorkout} onOpenChange={() => setSelectedWorkout(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell size={20} className="text-primary" />
              Workout Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedWorkout && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {format(new Date(selectedWorkout.created_at), "MMMM d, yyyy 'at' h:mm a")}
              </p>

              {selectedWorkout.notes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm">{selectedWorkout.notes}</p>
                </div>
              )}

              <div className="space-y-3">
                {selectedWorkout.exercises.map((exercise, exIndex) => (
                  <div key={exIndex} className="bg-card border border-border rounded-lg p-3">
                    <h4 className="font-semibold mb-2">{exercise.name}</h4>
                    {exercise.notes && (
                      <p className="text-xs text-muted-foreground mb-2">{exercise.notes}</p>
                    )}
                    <div className="space-y-1">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Set {setIndex + 1}</span>
                          {exercise.isCardio ? (
                            <span>
                              {set.distance && `${set.distance} mi`}
                              {set.distance && set.time && " • "}
                              {set.time && set.time}
                            </span>
                          ) : (
                            <span>
                              {set.weight && `${set.weight} lbs`}
                              {set.weight && set.reps && " × "}
                              {set.reps && `${set.reps} reps`}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {selectedWorkout.photos && selectedWorkout.photos.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Photos</h4>
                  <div className="flex gap-2 overflow-x-auto">
                    {selectedWorkout.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Workout photo ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
