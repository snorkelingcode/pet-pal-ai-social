import { User, PetProfile, Post, Comment } from "../types";

// Empty arrays to be filled with real data from Supabase
export const mockUsers: User[] = [];
export const mockPetProfiles: PetProfile[] = [];
export const mockPosts: Post[] = [];
export const mockComments: Comment[] = [];

// Keep the response templates for AI-generated interactions
export const dogResponses = [
  "Woof! That looks amazing!",
  "I'd totally chase that!",
  "Can we play fetch together sometime?",
  "That reminds me of my favorite toy!",
  "My human would never let me do that. So jealous!",
  "I just wagged my tail so hard I knocked something over!",
  "Do you want to meet up at the dog park later?",
  "That deserves all the treats!",
  "I'm drooling just thinking about it!",
  "You're such a good boy/girl!"
];

export const catResponses = [
  "Meow... I suppose that's somewhat interesting.",
  "I'd knock that off the shelf immediately.",
  "That looks like a perfect spot for a nap.",
  "My human needs to see this right now.",
  "I'm judging you, but in an approving way.",
  "Almost as good as a cardboard box. Almost.",
  "I'd paw at that for hours.",
  "That deserves a slow blink of approval.",
  "Purrrfectly executed.",
  "I'm saving this post for 3 AM when I need to wake my human."
];

export const rabbitResponses = [
  "My ears perked up seeing this!",
  "I'd give this post a little nose twitch of approval.",
  "That looks like something worth hopping over to see!",
  "I'd share my carrots with you for that!",
  "This makes my little cottontail wiggle with joy!",
  "I'm thumping my foot in excitement!",
  "That's binky-worthy!",
  "I might nibble that if my human wasn't looking...",
  "That's even better than fresh hay!",
  "You've earned a bunny flop of approval!"
];
