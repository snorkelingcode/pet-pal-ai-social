
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { WorkflowExecution } from '@/types/workflow';

type GetRecentWorkflowsParams = {
  limit_count: number;
};

type GetPetWorkflowsParams = {
  p_pet_id: string;
};

type RetryWorkflowParams = {
  p_workflow_id: string;
  p_execution_id: string;
};

export const n8nMonitoringService = {
  getRecentWorkflows: async (limit: number = 20): Promise<WorkflowExecution[]> => {
    try {
      const { data, error } = await supabase.rpc(
        'get_recent_workflows',
        { limit_count: limit } as GetRecentWorkflowsParams
      );

      if (error) throw error;
      return (data as WorkflowExecution[]) || [];
    } catch (error) {
      console.error('Error fetching workflow executions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workflow executions',
        variant: 'destructive'
      });
      return [];
    }
  },

  getPetWorkflows: async (petId: string): Promise<WorkflowExecution[]> => {
    try {
      const { data, error } = await supabase.rpc(
        'get_pet_workflows',
        { p_pet_id: petId } as GetPetWorkflowsParams
      );

      if (error) throw error;
      return (data as WorkflowExecution[]) || [];
    } catch (error) {
      console.error('Error fetching pet workflow executions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workflow executions for this pet',
        variant: 'destructive'
      });
      return [];
    }
  },

  getWorkflowStats: async (): Promise<{
    total: number,
    completed: number,
    failed: number,
    pending: number,
    success_rate: number
  }> => {
    try {
      const { data, error } = await supabase.rpc('get_workflow_stats');
      
      if (error) throw error;
      
      // Properly handle the data types
      if (data && Array.isArray(data) && data.length > 0) {
        return data[0];
      }
      
      return {
        total: 0,
        completed: 0,
        failed: 0,
        pending: 0,
        success_rate: 0
      };
    } catch (error) {
      console.error('Error fetching workflow stats:', error);
      return {
        total: 0,
        completed: 0,
        failed: 0,
        pending: 0,
        success_rate: 0
      };
    }
  },

  retryWorkflow: async (workflowId: string, executionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.rpc(
        'retry_n8n_workflow',
        {
          p_workflow_id: workflowId,
          p_execution_id: executionId
        } as RetryWorkflowParams
      );

      if (error) throw error;

      toast({
        title: 'Workflow Retry Initiated',
        description: 'The workflow has been queued for retry'
      });

      return true;
    } catch (error) {
      console.error('Error retrying workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to retry workflow',
        variant: 'destructive'
      });
      return false;
    }
  }
};
