// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://syvxflddmryziujvzlxk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5dnhmbGRkbXJ5eml1anZ6bHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNzkwNDUsImV4cCI6MjA1OTc1NTA0NX0.iKFhA8mL36el0Yjhr2EAjHRsR99u3v-n5wEOYMX0p2w";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);