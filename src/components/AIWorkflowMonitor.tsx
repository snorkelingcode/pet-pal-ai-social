
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { n8nMonitoringService } from '@/services/n8nMonitoringService';
import { formatDistanceToNow } from 'date-fns';

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  execution_id: string | null;
  status: string;
  execution_data: any;
  started_at: string;
  completed_at: string | null;
  error: string | null;
  pet_id: string | null;
  post_id: string | null;
  scheduled_post_id: string | null;
}

interface WorkflowStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  success_rate: number;
}

const AIWorkflowMonitor = ({ petId }: { petId?: string }) => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [stats, setStats] = useState<WorkflowStats>({
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
    success_rate: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load workflows based on active tab
      let workflowsData: WorkflowExecution[] = [];
      if (activeTab === 'pet' && petId) {
        workflowsData = await n8nMonitoringService.getPetWorkflows(petId);
      } else {
        workflowsData = await n8nMonitoringService.getRecentWorkflows();
      }
      
      setExecutions(workflowsData);
      
      // Load stats (if we're on the recent tab)
      if (activeTab === 'recent') {
        const statsData = await n8nMonitoringService.getWorkflowStats();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up interval to refresh data every minute
    const intervalId = setInterval(loadData, 60000);
    
    return () => clearInterval(intervalId);
  }, [activeTab, petId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRetry = async (workflowId: string, executionId: string) => {
    await n8nMonitoringService.retryWorkflow(workflowId, executionId);
    // Reload after retry
    loadData();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
      case 'failed':
      case 'webhook_failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' = 'outline';
    
    switch (status) {
      case 'completed':
        variant = 'success';
        break;
      case 'error':
      case 'failed':
      case 'webhook_failed':
        variant = 'destructive';
        break;
      case 'started':
      case 'pending':
      case 'webhook_called':
      case 'processing':
        variant = 'secondary';
        break;
      default:
        variant = 'outline';
    }
    
    return (
      <Badge variant={variant}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>AI Workflow Monitor</CardTitle>
            <CardDescription>Track n8n workflow executions</CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} /> 
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">Recent Executions</TabsTrigger>
            <TabsTrigger value="pet" disabled={!petId}>Pet Executions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent">
            {!loading && (
              <div className="grid grid-cols-4 gap-4 mb-6 mt-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Failed</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{stats.success_rate}%</p>
                    <Progress value={stats.success_rate} className="mt-2" />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pet">
            {petId && (
              <div className="my-4">
                <h3 className="font-semibold">Workflow executions for this pet</h3>
              </div>
            )}
          </TabsContent>
          
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-[200px]">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : executions.length > 0 ? (
              <div className="space-y-4">
                {executions.map((execution) => (
                  <Card key={execution.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{execution.workflow_name}</CardTitle>
                          <CardDescription className="text-xs">
                            ID: {execution.workflow_id}
                          </CardDescription>
                        </div>
                        {getStatusBadge(execution.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 pb-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Started:</span>{' '}
                          {formatDistanceToNow(new Date(execution.started_at), { addSuffix: true })}
                        </div>
                        {execution.completed_at && (
                          <div>
                            <span className="text-muted-foreground">Completed:</span>{' '}
                            {formatDistanceToNow(new Date(execution.completed_at), { addSuffix: true })}
                          </div>
                        )}
                      </div>
                      {execution.error && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 text-sm rounded border border-red-200 dark:border-red-800">
                          {execution.error}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-2 flex justify-end gap-2">
                      {(execution.status === 'error' || execution.status === 'failed') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRetry(execution.workflow_id, execution.execution_id || execution.id)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Retry
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-[200px] text-muted-foreground">
                No workflow executions found
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIWorkflowMonitor;
