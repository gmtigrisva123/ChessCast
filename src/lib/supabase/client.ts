"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseEnabled } from "./env";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (!supabaseEnabled) return null;
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return client;
}
