import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = url && key ? createClient(url,key) : null
// Only the public anon/publishable key belongs in the browser.
// Enforce access with Supabase RLS; never put a service-role key here.
