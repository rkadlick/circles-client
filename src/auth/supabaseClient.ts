import { createClient } from '@supabase/supabase-js';

const SUPA_URL = import.meta.env.VITE_SUPA_URL;
const SUPA_KEY = import.meta.env.VITE_SUPA_KEY;

if (!SUPA_URL || !SUPA_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(SUPA_URL, SUPA_KEY);
