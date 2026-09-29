-- Sakhi Cycle Supabase Schema & Row-Level Security (RLS) Migration
-- Safe, additive migration preserving existing tables if any exist

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. Cycle Settings Table
CREATE TABLE IF NOT EXISTS public.cycle_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_period_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cycle_length INTEGER NOT NULL DEFAULT 28,
  period_duration INTEGER NOT NULL DEFAULT 5,
  luteal_length INTEGER NOT NULL DEFAULT 14,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cycle_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cycle_settings' AND policyname = 'Users can manage own cycle settings') THEN
    CREATE POLICY "Users can manage own cycle settings" ON public.cycle_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 3. Daily Logs Table
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood TEXT,
  energy INTEGER,
  flow TEXT,
  symptoms JSONB DEFAULT '[]'::jsonb,
  sleep_hours NUMERIC,
  water_glasses INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_logs' AND policyname = 'Users can manage own daily logs') THEN
    CREATE POLICY "Users can manage own daily logs" ON public.daily_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 4. Partner Permissions Table
CREATE TABLE IF NOT EXISTS public.partner_permissions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_linked BOOLEAN DEFAULT false,
  partner_name TEXT DEFAULT 'Arjun',
  invite_code TEXT,
  share_phase BOOLEAN DEFAULT true,
  share_next_period BOOLEAN DEFAULT true,
  share_pms_mood BOOLEAN DEFAULT true,
  share_daily_logs BOOLEAN DEFAULT false,
  share_symptoms BOOLEAN DEFAULT false,
  share_private_notes BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.partner_permissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_permissions' AND policyname = 'Users can manage own partner permissions') THEN
    CREATE POLICY "Users can manage own partner permissions" ON public.partner_permissions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 5. Community Forum Posts Table
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_pseudonym TEXT NOT NULL,
  author_avatar TEXT DEFAULT '🌸',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  reactions JSONB DEFAULT '{"heart": 0, "helpful": 0, "hug": 0}'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forum_posts' AND policyname = 'Anyone can view forum posts') THEN
    CREATE POLICY "Anyone can view forum posts" ON public.forum_posts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forum_posts' AND policyname = 'Authenticated users can insert posts') THEN
    CREATE POLICY "Authenticated users can insert posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forum_posts' AND policyname = 'Users can update own posts') THEN
    CREATE POLICY "Users can update own posts" ON public.forum_posts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 6. Doctor Consultations / Inquiries Table
CREATE TABLE IF NOT EXISTS public.doctor_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  symptoms_summary TEXT,
  preferred_date DATE,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.doctor_inquiries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'doctor_inquiries' AND policyname = 'Users can manage own doctor inquiries') THEN
    CREATE POLICY "Users can manage own doctor inquiries" ON public.doctor_inquiries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 7. Automatic Profile Provisioning Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
      updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
