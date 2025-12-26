import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = "https://uezrpgdbeemoqrxuzaln.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlenJwZ2RiZWVtb3FyeHV6YWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMjUwMzcsImV4cCI6MjA2NjgwMTAzN30.8Rab0ISBx6CTGnEeItVAhk0vwOHgrPPFv6ooZ2Sy2Qk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  }
});


