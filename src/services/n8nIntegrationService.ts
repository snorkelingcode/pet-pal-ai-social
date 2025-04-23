
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const n8nIntegrationService = {
  setWebhookUrl: async (petId: string, webhookUrl: string): Promise<boolean> => {
    try {
      // The error is because n8n_webhook_url doesn't exist in the type definition
      // We'll use a raw update query instead
      const { error } = await supabase.rpc('update_pet_webhook_url', {
        p_pet_id: petId,
        p_webhook_url: webhookUrl
      });
      
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
      const { data, error } = await supabase.rpc('start_n8n_workflow', {
        workflow_id: 'test-integration',
        workflow_name: 'Test n8n Integration',
        webhook_url: 'https://n8n.example.com/webhook/test',
        payload: JSON.stringify({
          petId,
          testMessage: 'This is a test from PetPal AI'
        }),
        pet_id: petId
      });
      
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
      // Use a custom RPC function instead of direct table access
      const { data, error } = await supabase.rpc('get_workflow_status', {
        p_workflow_id: workflowId,
        p_execution_id: executionId
      });
      
      if (error) throw error;
      
      return data || 'unknown';
    } catch (error) {
      console.error('Error checking workflow status:', error);
      return 'error';
    }
  }
};
