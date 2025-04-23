
import React, { useState } from 'react';
import HeaderCard from '@/components/HeaderCard';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AIWorkflowMonitor from '@/components/AIWorkflowMonitor';

const AIMonitoring = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('workflows');

  if (!user) {
    return (
      <>
        <HeaderCard 
          title="AI Monitoring" 
          subtitle="Log in to view AI workflow monitoring"
        />
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Please log in to access this feature.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderCard 
        title="AI Monitoring" 
        subtitle="Track and manage AI workflows for your pets"
      />
      
      <div className="container mx-auto p-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflows" className="mt-4">
            <AIWorkflowMonitor />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Workflow Settings</h3>
                <p className="text-muted-foreground">
                  Configure your n8n integration settings here.
                  <br />
                  Coming soon: Custom webhook URLs, workflow templates, and notification preferences.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AIMonitoring;
