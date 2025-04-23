
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { WorkflowExecution } from '@/types/workflow';

export const n8nMonitoringService = {
  getRecentWorkflows: async (limit: number = 20): Promise<WorkflowExecution[]> => {
    try {
      // Use typed parameters for RPC call
      const { data, error } = await supabase.rpc('get_recent_workflows', {
        limit_count: limit
      });
        
      if (error) throw error;
      return data as WorkflowExecution[] || [];
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
      // Use typed parameters for RPC call
      const { data, error } = await supabase.rpc('get_pet_workflows', {
        p_pet_id: petId
      });
        
      if (error) throw error;
      return data as WorkflowExecution[] || [];
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
      // Use typed parameters for RPC call
      const { data, error } = await supabase.rpc('get_workflow_stats');
        
      if (error) throw error;
      
      return data || {
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
      // Use typed parameters for RPC call
      const { data, error } = await supabase.rpc('retry_n8n_workflow', {
        p_workflow_id: workflowId,
        p_execution_id: executionId
      });
        
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
