import mongoose from 'mongoose';
import { User } from '../models/User';
import { Standup } from '../models/Standup';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || '';
console.log("Using MongoDB URI:", MONGO_URL);

// Sample users to create
const users = [
  {
    username: 'testuser',
    email: 'test@example.com',
    password: 'default-password' // Simplified for our authentication approach
  },
  {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'default-password'
  },
  {
    username: 'janedoe',
    email: 'jane@example.com',
    password: 'default-password'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');

    // STEP 1: Remove all existing users to start fresh
    await User.deleteMany({});
    console.log('Deleted all existing users');
    
    // STEP 2: Create the test users
    const createdUsers = [];
    
    for (const userData of users) {
      // Create a new user
      const newUser = new User(userData);
      await newUser.save();
      console.log(`User ${userData.username} created with email ${userData.email}!`);
      createdUsers.push(newUser);
    }
    
    // STEP 3: Verify users can be found by username
    console.log('\nVerifying users can be found by username:');
    for (const userData of users) {
      const foundUser = await User.findOne({ username: userData.username });
      if (foundUser) {
        console.log(` User ${userData.username} found with email ${foundUser.email}`);
      } else {
        console.error(` ERROR: User with username ${userData.username} NOT FOUND!`);
      }
    }
    
    // Clear existing standups
    await Standup.deleteMany({});
    console.log('\nExisting standup entries cleared');
    
    // Create sample standup entries (3 for each user)
    for (const user of createdUsers) {
      const today = new Date();
      
      // Today's standup
      await Standup.create({
        userId: user._id,
        yesterday: `${user.username} worked on setting up the API`,
        today: `${user.username} will implement authentication`,
        blockers: 'None',
        createdAt: today
      });
      
      // Yesterday's standup
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      await Standup.create({
        userId: user._id,
        yesterday: `${user.username} designed database schema`,
        today: `${user.username} will set up the API`,
        blockers: 'Waiting for requirements',
        createdAt: yesterday
      });
      
      // Two days ago standup
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      await Standup.create({
        userId: user._id,
        yesterday: `${user.username} reviewed requirements`,
        today: `${user.username} will design database schema`,
        blockers: 'Still unclear on some requirements',
        createdAt: twoDaysAgo
      });
    }
    
    console.log('Sample standup entries created successfully!');
    
    console.log('\nSimplified Login Instructions:');
    console.log('To log in, just enter one of these usernames:');
    users.forEach(user => {
      console.log(`- ${user.username}`);
    });
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
};

// Run the seeding function
seedDatabase();
