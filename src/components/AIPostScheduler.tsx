import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { petAIService } from '@/services/petAIService';
import { PetProfile } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Bot, Calendar, Image as ImageIcon, MessageCircle, AlertCircle } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';

interface AIPostSchedulerProps {
  petProfile: PetProfile;
}

const AIPostScheduler = ({ petProfile }: AIPostSchedulerProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postCount, setPostCount] = useState(3);
  const [includeImages, setIncludeImages] = useState(true);
  const [frequency, setFrequency] = useState("daily");
  const [postingTime, setPostingTime] = useState("random");
  const [voiceExample, setVoiceExample] = useState("");
  const [samplePost, setSamplePost] = useState("");
  const { data: scheduledPosts } = useScheduledPosts(petProfile.id);

  const storeMemory = useCallback(async (content: string, type: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('pet-ai-learning', {
        body: {
          action: 'store_memory',
          petId: petProfile.id,
          content,
          type,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error storing memory:', error);
      return null;
    }
  }, [petProfile.id]);

  const getRelevantMemories = useCallback(async (context: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('pet-ai-learning', {
        body: {
          action: 'retrieve_relevant_memories',
          petId: petProfile.id,
          content: context,
        },
      });

      if (error) throw error;
      return data.memories;
    } catch (error) {
      console.error('Error retrieving memories:', error);
      return [];
    }
  }, [petProfile.id]);

  const generateSamplePost = async () => {
    setLoading(true);
    setSamplePost("");
    try {
      const relevantMemories = await getRelevantMemories(voiceExample);
      
      const content = await petAIService.generatePost(
        petProfile.id, 
        null, // content
        null, // imageBase64
        voiceExample // voiceExample
      );
      
      if (content) {
        setSamplePost(content);
        await storeMemory(content, 'generated_post');
      }
    } catch (error) {
      console.error("Error generating sample post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate sample post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const scheduleAIPosts = async () => {
    setLoading(true);
    try {
      const relevantMemories = await getRelevantMemories(voiceExample);
      
      const success = await petAIService.scheduleAIPosts(
        petProfile.id, 
        postCount, 
        {
          frequency,
          postingTime,
          includeImages,
          voiceExample,
          contentTheme: 'specific-context',
          memories: relevantMemories,
        }
      );
      
      if (success) {
        toast({
          title: "Posts Scheduled",
          description: `${postCount} posts have been scheduled for ${petProfile.name} using your voice example and pet's memories`,
        });
        setOpen(false);
      }
    } catch (error) {
      console.error("Error scheduling posts:", error);
      toast({
        title: "Error",
        description: "Failed to schedule posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isVoiceExampleProvided = voiceExample.trim().length > 0;

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2" 
        onClick={() => setOpen(true)}
      >
        <Bot size={16} />
        Schedule AI Posts
        {scheduledPosts?.length > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-muted rounded-full text-xs">
            {scheduledPosts.length}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule AI Posts for {petProfile.name}</DialogTitle>
            <DialogDescription>
              Let your pet create witty one-liners limited to 140 characters
            </DialogDescription>
          </DialogHeader>

          {scheduledPosts && scheduledPosts.length > 0 && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Scheduled Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scheduledPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span>
                          {new Date(post.scheduled_for).toLocaleString()}
                        </span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                          post.status === 'completed' ? 'bg-green-100 text-green-800' :
                          post.status === 'failed' ? 'bg-red-100 text-red-800' :
                          post.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-muted'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      {post.posts && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `/post/${post.posts.id}`}
                        >
                          View Post
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 py-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle size={16} />
                  Voice & Context Example
                </CardTitle>
                <CardDescription>
                  This is the most important part - provide a sample that will set the context and voice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea 
                    id="voice-example"
                    placeholder="Example: 'Rito has been getting in lots of trouble lately and so has MoMo. Their legal fees are more expensive than our house!'"
                    value={voiceExample}
                    onChange={(e) => {
                      if (e.target.value.length <= 140) {
                        setVoiceExample(e.target.value);
                        setSamplePost("");
                      }
                    }}
                    className="min-h-[100px]"
                    maxLength={140}
                  />
                  <p className="text-xs text-muted-foreground">
                    {140 - voiceExample.length} characters remaining. Write a post that captures your pet's voice and establishes specific context.
                  </p>
                </div>

                {!isVoiceExampleProvided && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      A voice example is strongly recommended. Without it, generated posts will be generic.
                    </AlertDescription>
                  </Alert>
                )}
                
                {samplePost && (
                  <Alert className="bg-muted">
                    <AlertDescription>
                      <strong>Sample post:</strong> {samplePost}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={generateSamplePost} 
                    disabled={loading || !isVoiceExampleProvided}
                  >
                    Generate Sample Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar size={16} />
                  Posting Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Number of posts to schedule: {postCount}</Label>
                  <Slider 
                    value={[postCount]} 
                    min={1} 
                    max={10} 
                    step={1} 
                    onValueChange={values => setPostCount(values[0])} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Posting frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="random">Random</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Best time to post</Label>
                  <Select value={postingTime} onValueChange={setPostingTime}>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (8 AM - 12 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                      <SelectItem value="evening">Evening (5 PM - 10 PM)</SelectItem>
                      <SelectItem value="random">Random Times</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="include-images" 
                    checked={includeImages}
                    onCheckedChange={setIncludeImages}
                  />
                  <label htmlFor="include-images" className="flex items-center gap-2">
                    <ImageIcon size={16} />
                    Include images in posts
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button onClick={scheduleAIPosts} disabled={loading || !isVoiceExampleProvided}>
              {loading ? "Processing..." : "Schedule Posts"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIPostScheduler;
