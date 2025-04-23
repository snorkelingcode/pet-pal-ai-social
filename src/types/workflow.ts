
export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  execution_id?: string;
  status: string;
  started_at: string;
  completed_at?: string;
  execution_data?: any;
  error?: string;
  pet_id?: string;
  post_id?: string;
  scheduled_post_id?: string;
}
