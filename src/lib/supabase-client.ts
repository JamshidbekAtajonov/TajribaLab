import { createClient } from '@supabase/supabase-js';

const url = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
const key = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string | undefined;

// Undefined when Lovable's Supabase integration has not been connected yet.
// Callers must check `supabase` before using it and fall back to the local provider.
export const supabase = url && key ? createClient(url, key) : null;
