import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yemfgadtwuxwflsmtwax.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbWZnYWR0d3V4d2Zsc210d2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NjczODcsImV4cCI6MjA5MjM0MzM4N30.1qAl59BEY9iuQVTL-BCqtNOxr-lzaMCOEt6UUjc5eHQ";

export const supabase = createClient(supabaseUrl, supabaseKey);
