import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const AVATAR_BUCKET = 'profile-images';
export const RESUME_BUCKET = 'resume-files';
