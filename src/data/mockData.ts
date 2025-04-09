import { User, PetProfile, Post, Comment } from "../types";

export const mockUsers: User[] = [
  {
    id: "user1",
    username: "sarahpet",
    email: "sarah@example.com",
    createdAt: "2023-10-15T14:23:54Z",
  },
  {
    id: "user2",
    username: "mikepaws",
    email: "mike@example.com",
    createdAt: "2023-09-22T08:12:01Z",
  },
  {
    id: "user3",
    username: "emmafur",
    email: "emma@example.com",
    createdAt: "2023-11-05T19:45:12Z",
  },
];

export const mockPetProfiles: PetProfile[] = [
  {
    id: "pet1",
    ownerId: "user1",
    name: "Buddy",
    species: "Dog",
    breed: "Golden Retriever",
    age: 3,
    personality: ["Playful", "Friendly", "Energetic"],
    bio: "I love playing fetch and making new friends at the park!",
    profilePicture: "https://images.unsplash.com/photo-1558788353-f76d92427f16?q=80&w=876&auto=format&fit=crop",
    createdAt: "2023-10-17T10:30:00Z",
    followers: 245,
    following: 132,
  },
  {
    id: "pet2",
    ownerId: "user2",
    name: "Whiskers",
    species: "Cat",
    breed: "Siamese",
    age: 5,
    personality: ["Independent", "Curious", "Affectionate"],
    bio: "Sunbeam finder, professional napper, and occasional zooming enthusiast.",
    profilePicture: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=843&auto=format&fit=crop",
    createdAt: "2023-09-25T14:20:10Z",
    followers: 189,
    following: 76,
  },
  {
    id: "pet3",
    ownerId: "user3",
    name: "Hopper",
    species: "Rabbit",
    breed: "Holland Lop",
    age: 2,
    personality: ["Shy", "Sweet", "Gentle"],
    bio: "Carrot connoisseur and professional hopper. I love cozy naps and gentle pets!",
    profilePicture: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?q=80&w=774&auto=format&fit=crop",
    createdAt: "2023-11-07T09:15:30Z",
    followers: 120,
    following: 45,
  },
];

export const mockPosts: Post[] = [
  {
    id: "post1",
    petId: "pet1",
    petProfile: mockPetProfiles[0],
    content: "Just had the best day at the dog park! Made so many new friends and chased all the balls. Living my best doggo life! 🐕 #DogLife #FetchFanatic",
    image: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?q=80&w=1470&auto=format&fit=crop",
    likes: 42,
    comments: 5,
    createdAt: "2024-04-07T15:30:22Z",
  },
  {
    id: "post2",
    petId: "pet2",
    petProfile: mockPetProfiles[1],
    content: "Found the perfect sunbeam today. Will not be taking any appointments for the next 5 hours. #CatNap #SunbeamSpecialist",
    image: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=774&auto=format&fit=crop",
    likes: 67,
    comments: 8,
    createdAt: "2024-04-08T10:15:43Z",
  },
  {
    id: "post3",
    petId: "pet3",
    petProfile: mockPetProfiles[2],
    content: "Discovered a secret stash of carrots! My human thinks I don't know where they hide the treats. Silly human! 🥕 #RabbitLife #CarrotLover",
    image: "https://images.unsplash.com/photo-1619447998047-4364e4094def?q=80&w=1374&auto=format&fit=crop",
    likes: 29,
    comments: 3,
    createdAt: "2024-04-08T17:45:10Z",
  },
  {
    id: "post4",
    petId: "pet1",
    petProfile: mockPetProfiles[0],
    content: "Went swimming for the first time today! Water is amazing, why didn't anyone tell me sooner? Can't wait for more splash time! #SwimmingDog #WaterLover",
    image: "https://images.unsplash.com/photo-1527489377706-5bf97e608852?q=80&w=1559&auto=format&fit=crop",
    likes: 38,
    comments: 7,
    createdAt: "2024-04-09T09:10:33Z",
  },
];

export const mockComments: Comment[] = [
  {
    id: "comment1",
    postId: "post1",
    petId: "pet2",
    petProfile: mockPetProfiles[1],
    content: "Looks fun! I prefer watching birds from the window, though.",
    likes: 8,
    createdAt: "2024-04-07T16:05:12Z",
  },
  {
    id: "comment2",
    postId: "post1",
    petId: "pet3",
    petProfile: mockPetProfiles[2],
    content: "Parks are scary! I prefer my cozy hutch and garden time.",
    likes: 5,
    createdAt: "2024-04-07T16:35:45Z",
  },
  {
    id: "comment3",
    postId: "post2",
    petId: "pet1",
    petProfile: mockPetProfiles[0],
    content: "I don't understand sunbeams, but I love running in them!",
    likes: 12,
    createdAt: "2024-04-08T11:20:18Z",
  },
];

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
