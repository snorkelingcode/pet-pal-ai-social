
-- Enable REPLICA IDENTITY FULL for the tables we need realtime updates for
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.post_interactions REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to the realtime publication
BEGIN;
  -- Drop the publication if it exists already
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create a new publication for all tables
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.comments, 
    public.posts, 
    public.post_interactions,
    public.profiles;
COMMIT;
