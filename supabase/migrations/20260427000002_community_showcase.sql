
-- Create community showcase table
CREATE TABLE IF NOT EXISTS public.community_showcase (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.thumbnail_projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    prompt TEXT,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create showcase likes table
CREATE TABLE IF NOT EXISTS public.showcase_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    showcase_id UUID REFERENCES public.community_showcase(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(showcase_id, user_id)
);

-- Enable RLS
ALTER TABLE public.community_showcase ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_likes ENABLE ROW LEVEL SECURITY;

-- Policies for community_showcase
CREATE POLICY "Anyone can view showcase" ON public.community_showcase
    FOR SELECT USING (true);

CREATE POLICY "Users can publish their own projects" ON public.community_showcase
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own published projects" ON public.community_showcase
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for showcase_likes
CREATE POLICY "Anyone can view likes" ON public.showcase_likes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like" ON public.showcase_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike" ON public.showcase_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Function to increment likes count
CREATE OR REPLACE FUNCTION public.handle_showcase_like() 
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.community_showcase 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.showcase_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.community_showcase 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.showcase_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for likes count
CREATE TRIGGER on_showcase_like
AFTER INSERT OR DELETE ON public.showcase_likes
FOR EACH ROW EXECUTE FUNCTION public.handle_showcase_like();
