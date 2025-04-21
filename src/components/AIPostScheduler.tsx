
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { petAIService } from '@/services/petAIService';
import { petMemoryService } from '@/services/petMemoryService';
import { PetProfile } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Bot, Calendar, Image as ImageIcon, MessageCircle, AlertCircle, Users, Brain, Timer } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

const ScheduledPostItem = ({ post }: { post: any }) => {
  return (
    <div key={post.id} className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {new Date(post.scheduled_for).toLocaleString()}
          </span>
          <Badge 
            variant={
              post.status === 'completed' ? 'default' :
              post.status === 'failed' ? 'destructive' :
              post.status === 'processing' ? 'secondary' :
              'outline'
            }
            className="text-xs"
          >
            {post.status}
          </Badge>
        </div>
        {post.posts && (
          <p className="text-xs text-muted-foreground mt-1 truncate max-w-[300px]">
            {post.posts.content}
          </p>
        )}
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
  );
};

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
  const [petMemories, setPetMemories] = useState<any[]>([]);
  const [petRelationships, setPetRelationships] = useState<any[]>([]);
  const [useMemories, setUseMemories] = useState(true);
  const [every2Minutes, setEvery2Minutes] = useState(false);
  const { data: scheduledPosts } = useScheduledPosts(petProfile.id);
  const [serviceError, setServiceError] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (open && petProfile.id) {
      const fetchPetData = async () => {
        const memories = await petMemoryService.getAllMemories(petProfile.id);
        const relationships = await petMemoryService.getPetRelationships(petProfile.id);
        setPetMemories(memories);
        setPetRelationships(relationships);
      };
      
      fetchPetData();
      setServiceError(false);
    }
  }, [open, petProfile.id]);

  const storeMemory = useCallback(async (content: string, type: string) => {
    try {
      const memory = await petMemoryService.storeMemory(
        petProfile.id,
        content,
        type,
      );
      return memory;
    } catch (error) {
      console.error('Error storing memory:', error);
      return null;
    }
  }, [petProfile.id]);

  const getRelevantMemories = useCallback(async (context: string) => {
    try {
      if (!useMemories) return [];
      
      const memories = await petMemoryService.getRelevantMemories(petProfile.id, context);
      return memories;
    } catch (error) {
      console.error('Error retrieving memories:', error);
      return [];
    }
  }, [petProfile.id, useMemories]);

  const generateSamplePost = async () => {
    setLoading(true);
    setSamplePost("");
    try {
      const relevantMemories = await getRelevantMemories(voiceExample);
      
      const content = await petAIService.generatePost(
        petProfile.id, 
        null, // content
        null, // imageBase64
        voiceExample, // voiceExample
        relevantMemories
      );
      
      if (content) {
        setSamplePost(content);
        await storeMemory(content, 'generated_post');
      }
    } catch (error) {
      console.error("Error generating AI post:", error);
      
      if (error.message?.includes("non-2xx status code") || 
          error.message?.includes("service") || 
          error.name === "FunctionsHttpError") {
        setServiceError(true);
      }
      
      toast({
        title: "Error",
        description: "AI service is currently unavailable. Please try again later.",
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
      const options: any = {
        frequency,
        postingTime,
        includeImages,
        voiceExample,
        contentTheme: 'specific-context',
        memories: relevantMemories,
        every2Minutes,
      };
      console.log("Scheduling posts with options:", options);
      const success = await petAIService.scheduleAIPosts(
        petProfile.id, 
        postCount, 
        options
      );
      if (success) {
        toast({
          title: "Posts Scheduled",
          description: every2Minutes
            ? "Your pet will post something random every 2 minutes!"
            : `${postCount} posts have been scheduled for ${petProfile.name} using your voice example and pet's memories`,
        });
        await storeMemory(
          every2Minutes
            ? `Scheduled posts every 2 minutes with voice example: "${voiceExample}"`
            : `Scheduled ${postCount} ${frequency} posts with${includeImages ? '' : 'out'} images using voice example: "${voiceExample}"`,
          'scheduling_event'
        );
        setOpen(false);
      }
    } catch (error) {
      console.error("Error scheduling posts:", error);
      
      if (error.message?.includes("non-2xx status code") || 
          error.message?.includes("service") || 
          error.name === "FunctionsHttpError") {
        setServiceError(true);
      }
      
      toast({
        title: "Error",
        description: "AI service is currently unavailable. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isVoiceExampleProvided = voiceExample.trim().length > 0;
  const hasPetMemories = petMemories.length > 0;

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
        <DialogContent className="w-full p-0 gap-0 h-[90vh] max-h-[90vh] overflow-hidden sm:max-w-[95vw] md:max-w-2xl">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <DialogTitle>Schedule AI Posts for {petProfile.name}</DialogTitle>
            <DialogDescription>
              Create personalized posts based on your pet's personality and memories
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="px-4 sm:px-6 pb-4 sm:pb-6 h-full overflow-y-auto">
            <div className="space-y-4 py-2 sm:py-4">
              {serviceError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    The AI service is currently unavailable. This could be due to high demand or maintenance.
                    Please try again later.
                  </AlertDescription>
                </Alert>
              )}

              {scheduledPosts && scheduledPosts.length > 0 && (
                <Card className="mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar size={16} />
                      Scheduled Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40">
                      <div className="space-y-1">
                        {scheduledPosts.map((post) => (
                          <ScheduledPostItem key={post.id} post={post} />
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {hasPetMemories && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Brain size={16} />
                      Pet Memory System
                    </CardTitle>
                    <CardDescription>
                      Your pet has {petMemories.length} memories that influence their personality
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="use-memories" 
                        checked={useMemories}
                        onCheckedChange={setUseMemories}
                      />
                      <Label htmlFor="use-memories">
                        Use pet memory system for more personalized posts
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Top memories by importance:
                      </Label>
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {petMemories
                            .sort((a, b) => b.importance - a.importance)
                            .slice(0, 3)
                            .map(memory => (
                              <div key={memory.id} className="text-xs bg-muted p-2 rounded">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{memory.memoryType}</span>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Badge variant={memory.sentiment > 0 ? "default" : memory.sentiment < 0 ? "destructive" : "outline"} className="text-[10px]">
                                          Importance: {memory.importance}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Importance level determines how much this memory influences your pet's behavior</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <p className="truncate mt-1">{memory.content}</p>
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {petRelationships.length > 0 && (
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Pet relationships:
                        </Label>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {petRelationships.slice(0, 3).map(relationship => (
                            <div key={relationship.id} className="flex flex-col items-center">
                              <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                                  {relationship.related_pet?.profile_picture ? (
                                    <img 
                                      src={relationship.related_pet.profile_picture} 
                                      alt={relationship.related_pet.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Users className="w-4 h-4 absolute inset-0 m-auto" />
                                  )}
                                </div>
                                <Badge 
                                  variant={
                                    relationship.sentiment > 0.3 ? "default" :
                                    relationship.sentiment < -0.3 ? "destructive" :
                                    "outline"
                                  } 
                                  className="absolute -bottom-1 -right-1 text-[10px] w-4 h-4 p-0 flex items-center justify-center">
                                  {relationship.familiarity}
                                </Badge>
                              </div>
                              <span className="text-xs mt-1">{relationship.related_pet?.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

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
                      className="min-h-[100px] resize-none"
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
                      disabled={loading || !isVoiceExampleProvided || serviceError}
                    >
                      {loading ? "Generating..." : "Generate Sample Post"}
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
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="every-2-minutes"
                      checked={every2Minutes}
                      onCheckedChange={setEvery2Minutes}
                    />
                    <Label htmlFor="every-2-minutes" className="flex items-center gap-2">
                      <Timer size={16} />
                      Post every 2 minutes
                    </Label>
                  </div>
                  {every2Minutes && (
                    <Alert className="bg-muted">
                      <AlertDescription>
                        Your pet will post something random every 2 minutes. All other schedule settings will be ignored.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!every2Minutes && (
                    <>
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
                    </>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="include-images" 
                      checked={includeImages}
                      onCheckedChange={setIncludeImages}
                      disabled={every2Minutes}
                    />
                    <Label htmlFor="include-images" className="flex items-center gap-2">
                      <ImageIcon size={16} />
                      Include images in posts
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6 pb-6">
              <Button 
                onClick={scheduleAIPosts} 
                disabled={loading || !isVoiceExampleProvided || serviceError}
                className="w-full sm:w-auto"
              >
                {loading ? "Processing..." : "Schedule Posts"}
              </Button>
            </DialogFooter>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIPostScheduler;
