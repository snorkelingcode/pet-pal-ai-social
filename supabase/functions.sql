
-- Create an increment function for post likes
CREATE OR REPLACE FUNCTION public.increment(row_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_value INTEGER;
BEGIN
  SELECT likes INTO current_value FROM public.posts WHERE id = row_id;
  RETURN current_value + 1;
END;
$$;

-- Create a decrement function for post likes
CREATE OR REPLACE FUNCTION public.decrement(row_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_value INTEGER;
BEGIN
  SELECT likes INTO current_value FROM public.posts WHERE id = row_id;
  IF current_value > 0 THEN
    RETURN current_value - 1;
  ELSE
    RETURN 0;
  END IF;
END;
$$;
