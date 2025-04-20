
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
  
  -- Increment the value
  current_value := current_value + 1;
  
  -- Update the posts table
  UPDATE public.posts SET likes = current_value WHERE id = row_id;
  
  -- Return the new value
  RETURN current_value;
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
  
  -- Prevent negative values
  IF current_value > 0 THEN
    current_value := current_value - 1;
  ELSE
    current_value := 0;
  END IF;
  
  -- Update the posts table
  UPDATE public.posts SET likes = current_value WHERE id = row_id;
  
  -- Return the new value
  RETURN current_value;
END;
$$;
