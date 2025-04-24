
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type UpdatePetWebhookUrlParams = {
  p_pet_id: string;
  p_webhook_url: string;
};

export type StartN8nWorkflowParams = {
  workflow_id: string;
  workflow_name: string;
  webhook_url: string;
  payload: any;
  pet_id: string;
  action_type?: 'post_creation' | 'post_interaction' | 'messaging' | 'follow_unfollow' | 'profile_update' | 'test_integration' | 'rapid_posting';
};

export type GetWorkflowStatusParams = {
  p_workflow_id: string;
  p_execution_id: string;
};

export const n8nIntegrationService = {
  setWebhookUrl: async (petId: string, webhookUrl: string): Promise<boolean> => {
    try {
      const { error } = await supabase.rpc(
        'update_pet_webhook_url',
        { p_pet_id: petId, p_webhook_url: webhookUrl } as UpdatePetWebhookUrlParams
      );

      if (error) throw error;

      toast({
        title: 'Webhook URL Updated',
        description: 'Your n8n webhook URL has been updated successfully'
      });

      return true;
    } catch (error) {
      console.error('Error updating webhook URL:', error);
      toast({
        title: 'Error',
        description: 'Failed to update webhook URL',
        variant: 'destructive'
      });
      return false;
    }
  },

  testIntegration: async (petId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.rpc(
        'start_n8n_workflow',
        {
          workflow_id: 'test-integration',
          workflow_name: 'Test n8n Integration',
          webhook_url: 'https://n8n.example.com/webhook/test',
          payload: JSON.stringify({
            petId,
            testMessage: 'This is a test from PetPal AI'
          }),
          pet_id: petId,
          action_type: 'test_integration'
        } as StartN8nWorkflowParams
      );

      if (error) throw error;

      toast({
        title: 'Test Successful',
        description: 'Successfully connected to n8n'
      });

      return true;
    } catch (error) {
      console.error('Error testing n8n integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to n8n',
        variant: 'destructive'
      });
      return false;
    }
  },

  checkWorkflowStatus: async (workflowId: string, executionId: string): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc(
        'get_workflow_status',
        {
          p_workflow_id: workflowId,
          p_execution_id: executionId
        } as GetWorkflowStatusParams
      );

      if (error) throw error;
      return data || 'unknown';
    } catch (error) {
      console.error('Error checking workflow status:', error);
      return 'error';
    }
  }
};
