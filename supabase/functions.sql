
-- Get workflow status
CREATE OR REPLACE FUNCTION public.get_workflow_status(p_workflow_id TEXT, p_execution_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status
  FROM n8n_workflow_executions
  WHERE workflow_id = p_workflow_id
    AND execution_id = p_execution_id;
    
  RETURN COALESCE(v_status, 'unknown');
END;
$$;

-- Update pet webhook URL
CREATE OR REPLACE FUNCTION public.update_pet_webhook_url(p_pet_id UUID, p_webhook_url TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE pet_profiles
  SET n8n_webhook_url = p_webhook_url
  WHERE id = p_pet_id;
END;
$$;

-- Get recent workflows
CREATE OR REPLACE FUNCTION public.get_recent_workflows(limit_count INTEGER DEFAULT 20)
RETURNS SETOF n8n_workflow_executions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM n8n_workflow_executions
  ORDER BY started_at DESC
  LIMIT limit_count;
END;
$$;

-- Get pet workflows
CREATE OR REPLACE FUNCTION public.get_pet_workflows(p_pet_id UUID)
RETURNS SETOF n8n_workflow_executions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM n8n_workflow_executions
  WHERE pet_id = p_pet_id
  ORDER BY started_at DESC;
END;
$$;

-- Get workflow statistics
CREATE OR REPLACE FUNCTION public.get_workflow_stats()
RETURNS TABLE(
  total INTEGER,
  completed INTEGER,
  failed INTEGER,
  pending INTEGER,
  success_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total INTEGER;
  v_completed INTEGER;
  v_failed INTEGER;
  v_pending INTEGER;
  v_success_rate NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_total FROM n8n_workflow_executions;
  
  SELECT COUNT(*) INTO v_completed 
  FROM n8n_workflow_executions 
  WHERE status = 'completed';
  
  SELECT COUNT(*) INTO v_failed 
  FROM n8n_workflow_executions 
  WHERE status IN ('error', 'failed', 'webhook_failed');
  
  SELECT COUNT(*) INTO v_pending 
  FROM n8n_workflow_executions 
  WHERE status IN ('started', 'pending', 'webhook_called', 'processing');
  
  IF v_total > 0 THEN
    v_success_rate := (v_completed::NUMERIC / v_total::NUMERIC) * 100;
  ELSE
    v_success_rate := 0;
  END IF;
  
  RETURN QUERY SELECT v_total, v_completed, v_failed, v_pending, v_success_rate;
END;
$$;

-- Retry a workflow
CREATE OR REPLACE FUNCTION public.retry_n8n_workflow(p_workflow_id TEXT, p_execution_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_workflow RECORD;
  v_webhook_result JSONB;
BEGIN
  -- Get the workflow to retry
  SELECT * INTO v_workflow
  FROM n8n_workflow_executions
  WHERE workflow_id = p_workflow_id
    AND (execution_id = p_execution_id OR id::TEXT = p_execution_id);
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Call the workflow again using the same data
  INSERT INTO n8n_workflow_executions (
    workflow_id,
    workflow_name,
    status,
    execution_data,
    pet_id,
    post_id,
    scheduled_post_id
  ) VALUES (
    v_workflow.workflow_id,
    v_workflow.workflow_name,
    'retry_scheduled',
    v_workflow.execution_data,
    v_workflow.pet_id,
    v_workflow.post_id,
    v_workflow.scheduled_post_id
  );
  
  RETURN TRUE;
END;
$$;
