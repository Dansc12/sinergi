import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMuscleContributions, calculateAllocatedTonnage } from "@/lib/muscleContributions";
import { PrimaryGroup } from "@/hooks/useEnhancedStrengthData";

interface WorkoutExercise {
  name: string;
  muscleGroup?: string;
  primaryGroup?: string; // Accept any string, we'll cast internally
  isCardio?: boolean;
  sets: Array<{
    weight?: string | number;
    reps?: string | number;
    completed?: boolean;
  }>;
}

interface SetMuscleVolumeEntry {
  user_id: string;
  workout_log_id: string;
  log_date: string;
  exercise_name: string;
  set_index: number;
  primary_group: string;
  muscle: string;
  allocated_tonnage: number;
}

export const useSetMuscleVolume = () => {
  /**
   * Create set_muscle_volume entries for a workout
   * Call this after successfully inserting a workout_log
   */
  const createMuscleVolumeEntries = useCallback(async (
    userId: string,
    workoutLogId: string,
    logDate: string,
    exercises: WorkoutExercise[]
  ) => {
    const entries: SetMuscleVolumeEntry[] = [];

    exercises.forEach((exercise) => {
      // Skip cardio exercises
      if (exercise.isCardio) return;

      // Get muscle contributions for this exercise
      const { primaryGroup, muscleContributions } = getMuscleContributions(
        exercise.name,
        exercise.muscleGroup,
        exercise.primaryGroup
      );

      exercise.sets.forEach((set, setIndex) => {
        // Parse weight and reps
        const weight = typeof set.weight === 'string' ? parseFloat(set.weight) : (set.weight || 0);
        const reps = typeof set.reps === 'string' ? parseInt(set.reps, 10) : (set.reps || 0);

        // Only process completed sets with valid data
        if (weight <= 0 || reps <= 0) return;

        // Calculate allocated tonnage for each muscle
        const allocatedTonnage = calculateAllocatedTonnage(weight, reps, muscleContributions);

        // Create an entry for each muscle
        for (const [muscle, tonnage] of Object.entries(allocatedTonnage)) {
          if (tonnage > 0) {
            entries.push({
              user_id: userId,
              workout_log_id: workoutLogId,
              log_date: logDate,
              exercise_name: exercise.name,
              set_index: setIndex,
              primary_group: primaryGroup,
              muscle,
              allocated_tonnage: tonnage,
            });
          }
        }
      });
    });

    if (entries.length === 0) return;

    try {
      const { error } = await supabase
        .from("set_muscle_volume")
        .insert(entries);

      if (error) {
        console.error("Error inserting muscle volume entries:", error);
        throw error;
      }
    } catch (error) {
      console.error("Failed to create muscle volume entries:", error);
      throw error;
    }
  }, []);

  /**
   * Delete all muscle volume entries for a workout
   * Call this before updating or when deleting a workout
   */
  const deleteMuscleVolumeEntries = useCallback(async (workoutLogId: string) => {
    try {
      const { error } = await supabase
        .from("set_muscle_volume")
        .delete()
        .eq("workout_log_id", workoutLogId);

      if (error) {
        console.error("Error deleting muscle volume entries:", error);
        throw error;
      }
    } catch (error) {
      console.error("Failed to delete muscle volume entries:", error);
      throw error;
    }
  }, []);

  /**
   * Update muscle volume entries for a workout
   * Deletes existing entries and creates new ones
   */
  const updateMuscleVolumeEntries = useCallback(async (
    userId: string,
    workoutLogId: string,
    logDate: string,
    exercises: WorkoutExercise[]
  ) => {
    await deleteMuscleVolumeEntries(workoutLogId);
    await createMuscleVolumeEntries(userId, workoutLogId, logDate, exercises);
  }, [deleteMuscleVolumeEntries, createMuscleVolumeEntries]);

  return {
    createMuscleVolumeEntries,
    deleteMuscleVolumeEntries,
    updateMuscleVolumeEntries,
  };
};
