export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** Accounts are optional: without these two values the site keeps running in local demo mode. */
export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
