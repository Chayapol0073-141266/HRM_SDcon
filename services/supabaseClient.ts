import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://obwcuhejyliakzpzmgvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9id2N1aGVqeWxpYWt6cHptZ3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMzYyMzEsImV4cCI6MjA4MDkxMjIzMX0.mC0BsSOiJNPAUvSMqs4LLoMcPI8ANJyF48jilLcCnPU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);