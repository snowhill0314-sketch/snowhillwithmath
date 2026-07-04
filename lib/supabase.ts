import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase 환경 변수가 둘 다 올바르게 설정되어 있는지 체크합니다.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// 설정되지 않은 경우 클라이언트는 null을 반환하고 클라이언트 측에서 localStorage로 대체 작동합니다.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
