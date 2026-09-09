-- 1. Create a users table that links to Supabase auth
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) NOT NULL PRIMARY KEY,
  username TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: To automatically create a user on signup, run this trigger setup in Supabase SQL editor:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, username, email)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Create the summaries table
CREATE TABLE public.summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  articles JSONB NOT NULL,
  summaries JSONB NOT NULL,
  translated_headlines JSONB DEFAULT '{}'::jsonb,
  translated_highlights JSONB DEFAULT '{}'::jsonb,
  individual_reports JSONB DEFAULT '{}'::jsonb,
  topics JSONB DEFAULT '[]'::jsonb,
  sentiment TEXT
);

-- 3. Enable Row Level Security (RLS) on summaries
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for summaries
CREATE POLICY "Users can view their own summaries"
  ON public.summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own summaries"
  ON public.summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summaries"
  ON public.summaries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries"
  ON public.summaries FOR DELETE
  USING (auth.uid() = user_id);
