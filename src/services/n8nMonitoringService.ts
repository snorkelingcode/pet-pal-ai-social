
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { WorkflowExecution } from '@/types/workflow';
import type { Database } from '@/integrations/supabase/types';

type GetRecentWorkflowsParams = Database['public']['Functions']['get_recent_workflows']['Args'];
type GetPetWorkflowsParams = Database['public']['Functions']['get_pet_workflows']['Args'];
type RetryWorkflowParams = Database['public']['Functions']['retry_n8n_workflow']['Args'];

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
      // Supabase's .rpc returns data as an array if returns TABLE (...), so use first entry
      if (error) throw error;
      if (Array.isArray(data) && data.length > 0) {
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
