import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Hard lock to the ONE project that is allowed
const EXPECTED_PROJECT_REF = "tfpknxjrefqnkcxsyvhl";

// Safe fallback values (URL + publishable key are not secrets; do NOT use service-role key here)
// Replace the key below with your REAL publishable/anon key for the EXPECTED_PROJECT_REF project.
const FALLBACK_SUPABASE_URL = `https://${EXPECTED_PROJECT_REF}.supabase.co`;
const FALLBACK_PUBLISHABLE_KEY = "sb_publishable_rMlpZmNPa72OBJ0Z6DaLLg_UuIuh-v8";

// Prefer env vars if they exist, but allow fallback so Lovable preview doesn't white-screen
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (import.meta.env.SUPABASE_URL as string | undefined) ||
  FALLBACK_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.SUPABASE_KEY as string | undefined) ||
  FALLBACK_PUBLISHABLE_KEY;

// Validate URL + key exist (either env or fallback)
if (!SUPABASE_URL) {
  throw new Error(
    "Missing Supabase URL. Set VITE_SUPABASE_URL (preferred) or SUPABASE_URL in your Lovable environment.",
  );
}
if (!SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY === "REPLACE_WITH_YOUR_PUBLISHABLE_KEY") {
  throw new Error(
    "Missing Supabase publishable key. Set VITE_SUPABASE_PUBLISHABLE_KEY (preferred) or SUPABASE_ANON_KEY in your Lovable environment, or replace FALLBACK_PUBLISHABLE_KEY in src/integrations/supabase/client.ts.",
  );
}

// HARD LOCK: refuse to run if this points anywhere except the expected project
if (!SUPABASE_URL.includes(EXPECTED_PROJECT_REF)) {
  throw new Error(
    `Wrong Supabase project detected. Expected project ref "${EXPECTED_PROJECT_REF}" but got SUPABASE_URL="${SUPABASE_URL}".`,
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
