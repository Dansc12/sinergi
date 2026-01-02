import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { ALL_MUSCLES, MUSCLE_DISPLAY_NAMES, getMuscleDisplayName } from "@/lib/muscleContributions";

export type PrimaryGroup = "Push" | "Pull" | "Legs" | "Core";

interface DailyData {
  date: string;
  dateLabel: string;
  value: number;
}

interface SetMuscleVolumeRow {
  id: string;
  user_id: string;
  log_date: string;
  exercise_name: string;
  set_index: number;
  primary_group: string;
  muscle: string;
  allocated_tonnage: number;
}

// Muscles available for each primary group
const PRIMARY_GROUP_MUSCLES: Record<PrimaryGroup, readonly string[]> = ALL_MUSCLES;

export const useEnhancedStrengthData = () => {
  const [volumeData, setVolumeData] = useState<SetMuscleVolumeRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrimaryGroup, setSelectedPrimaryGroup] = useState<PrimaryGroup | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  const fetchVolumeData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("set_muscle_volume")
        .select("*")
        .eq("user_id", user.id)
        .order("log_date", { ascending: true });

      if (error) throw error;
      setVolumeData((data as SetMuscleVolumeRow[]) || []);
    } catch (error) {
      console.error("Error fetching volume data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVolumeData();
  }, [fetchVolumeData]);

  // Get available muscles for the selected primary group
  const availableMuscles = useMemo(() => {
    if (!selectedPrimaryGroup) return [];
    return [...PRIMARY_GROUP_MUSCLES[selectedPrimaryGroup]];
  }, [selectedPrimaryGroup]);

  // Reset selected muscle when primary group changes
  useEffect(() => {
    setSelectedMuscle(null);
  }, [selectedPrimaryGroup]);

  // Calculate daily volume data based on filters
  const dailyVolumeData = useMemo((): DailyData[] => {
    const dailyVolumes: Record<string, number> = {};

    volumeData.forEach(row => {
      // Filter by primary group
      if (selectedPrimaryGroup && row.primary_group !== selectedPrimaryGroup) return;
      
      // Filter by specific muscle
      if (selectedMuscle && row.muscle !== selectedMuscle) return;

      const dateKey = row.log_date;
      dailyVolumes[dateKey] = (dailyVolumes[dateKey] || 0) + Number(row.allocated_tonnage);
    });

    return Object.entries(dailyVolumes)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, value]) => ({
        date,
        dateLabel: format(parseISO(date), "MMM d"),
        value: Math.round(value)
      }));
  }, [volumeData, selectedPrimaryGroup, selectedMuscle]);

  // Calculate totals and trends
  const totalVolume = useMemo(() => {
    return dailyVolumeData.reduce((sum, d) => sum + d.value, 0);
  }, [dailyVolumeData]);

  const latestValue = dailyVolumeData.length > 0 ? dailyVolumeData[dailyVolumeData.length - 1].value : 0;
  
  const trend = dailyVolumeData.length >= 2
    ? dailyVolumeData[dailyVolumeData.length - 1].value - dailyVolumeData[dailyVolumeData.length - 2].value
    : 0;

  // Get display name for current filter
  const getFilterLabel = useCallback(() => {
    if (selectedMuscle) {
      return getMuscleDisplayName(selectedMuscle);
    }
    if (selectedPrimaryGroup) {
      return selectedPrimaryGroup;
    }
    return "Overall";
  }, [selectedPrimaryGroup, selectedMuscle]);

  return {
    chartData: dailyVolumeData,
    dailyVolumeData,
    totalVolume,
    latestValue,
    trend,
    isLoading,
    refetch: fetchVolumeData,
    // Filters
    selectedPrimaryGroup,
    setSelectedPrimaryGroup,
    selectedMuscle,
    setSelectedMuscle,
    availableMuscles,
    getFilterLabel,
    // For backward compat - map to old interface
    selectedSubGroup: selectedMuscle,
    setSelectedSubGroup: setSelectedMuscle,
    availableSubGroups: availableMuscles.map(m => getMuscleDisplayName(m)),
    // Constants for UI
    PRIMARY_GROUP_MUSCLES,
    MUSCLE_DISPLAY_NAMES,
    getMuscleDisplayName,
  };
};
