-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  subscription_type TEXT NOT NULL DEFAULT 'free' CHECK (subscription_type IN ('free', 'pro')),
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  daily_prompt_count INTEGER NOT NULL DEFAULT 0,
  last_prompt_reset TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Percakapan Baru',
  is_shared BOOLEAN DEFAULT false,
  share_link TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create OTP table for email verification
CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = user_id OR is_shared = true);

CREATE POLICY "Users can create their own conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.conversations FOR DELETE
USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND (c.user_id = auth.uid() OR c.is_shared = true)
  )
);

CREATE POLICY "Users can create messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete messages in their conversations"
ON public.messages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND c.user_id = auth.uid()
  )
);

-- OTP policies (public insert for sending OTP)
CREATE POLICY "Anyone can create OTP"
ON public.otp_codes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view their OTP"
ON public.otp_codes FOR SELECT
USING (true);

CREATE POLICY "Anyone can update OTP"
ON public.otp_codes FOR UPDATE
USING (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-files', 'chat-files', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-files' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-files');

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);