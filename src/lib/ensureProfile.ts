import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { TablesInsert } from "@/integrations/supabase/types";

type EnsureProfileOptions = {
  defaults?: Partial<TablesInsert<"profiles">>;
};

type EnsureProfileResult = {
  onboarding_completed: boolean;
};

const selectOnboardingCompleted = async (userId: string) => {
  return supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
};

const insertProfile = async (
  user: Pick<User, "id" | "email">,
  defaults: Partial<TablesInsert<"profiles">>
) => {
  const payload: TablesInsert<"profiles"> = {
    user_id: user.id,
    onboarding_completed: false,
    ...defaults,
  };

  const { error } = await supabase.from("profiles").insert(payload);

  // If we hit duplicate key (profile already created elsewhere), treat as success.
  if (error && (error.code === "23505" || /duplicate key/i.test(error.message))) {
    return { error: null };
  }

  return { error };
};

/**
 * Ensures a profiles row exists for the authenticated user.
 *
 * - Creates a minimal row when missing
 * - Returns `{ onboarding_completed }` (defaults to false)
 */
export const ensureProfile = async (
  user: Pick<User, "id" | "email">,
  options?: EnsureProfileOptions
): Promise<EnsureProfileResult> => {
  const defaults = options?.defaults ?? {};

  // 1) Check if profile exists
  const existing = await selectOnboardingCompleted(user.id);
  if (!existing.error && existing.data) {
    return { onboarding_completed: !!existing.data.onboarding_completed };
  }

  // 2) No row found: attempt insert
  const ins = await insertProfile(user, defaults);
  if (!ins.error) {
    const after = await selectOnboardingCompleted(user.id);
    return { onboarding_completed: !!after.data?.onboarding_completed };
  }

  // 3) Last resort: return safe default
  return { onboarding_completed: false };
};
