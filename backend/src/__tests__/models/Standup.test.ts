import mongoose from 'mongoose';
import { Standup } from '../../models/Standup';
import { User } from '../../models/User';
import { setupTestDB, teardownTestDB, clearDatabase } from '../testSetup';

// Set up and tear down the test database
beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());
beforeEach(async () => await clearDatabase());

describe('Standup Model Tests', () => {
  // Define the testUser type
  let testUser: mongoose.Document & { _id: mongoose.Types.ObjectId, username: string, email: string };
  
  // Create a test user before each test
  beforeEach(async () => {
    testUser = new User({
      username: 'standuptester',
      email: 'standuptester@example.com'
    });
    await testUser.save();
  });
  
  it('should create a new standup entry successfully', async () => {
    const standupData = {
      userId: testUser._id,
      yesterday: 'Worked on UI components',
      today: 'Working on API integration',
      blockers: 'None'
    };
    
    const standup = new Standup(standupData);
    const savedStandup = await standup.save();
    
    // Verify standup was saved correctly
    expect(savedStandup._id).toBeDefined();
    expect(savedStandup.userId.toString()).toBe(testUser._id.toString());
    expect(savedStandup.yesterday).toBe(standupData.yesterday);
    expect(savedStandup.today).toBe(standupData.today);
    expect(savedStandup.blockers).toBe(standupData.blockers);
    expect(savedStandup.createdAt).toBeDefined();
  });
  
  it('should fail when required fields are missing', async () => {
    // Missing 'today' field
    const incompleteStandup = new Standup({
      userId: testUser._id,
      yesterday: 'Worked on UI components',
      blockers: 'None'
    });
    
    let error: mongoose.Error.ValidationError | null = null;
    try {
      await incompleteStandup.save();
    } catch (e) {
      error = e as mongoose.Error.ValidationError;
    }
    
    expect(error).toBeDefined();
    expect(error!.name).toBe('ValidationError');
    expect(error!.errors?.today).toBeDefined();
  });
  
  it('should fail when userId is invalid', async () => {
    const invalidUserIdStandup = new Standup({
      userId: new mongoose.Types.ObjectId(), // Valid ObjectId but not a real user
      yesterday: 'Worked on UI components',
      today: 'Working on API integration',
      blockers: 'None'
    });
    
    // This should not throw an error because Mongoose only validates that it's an ObjectId,
    // but it should not populate properly when trying to reference the user
    await invalidUserIdStandup.save();
    
    const populated = await Standup.findById(invalidUserIdStandup._id).populate('userId');
    expect(populated?.userId).toBeNull(); // User reference should be null
  });

  it('should prevent multiple standup entries for the same user on the same day', async () => {
    // Create the first standup for today
    const firstStandup = new Standup({
      userId: testUser._id,
      yesterday: 'First update',
      today: 'First plan',
      blockers: 'None'
    });
    await firstStandup.save();
    
    // Try to create a second standup for the same day
    const secondStandup = new Standup({
      userId: testUser._id,
      yesterday: 'Second update',
      today: 'Second plan',
      blockers: 'None'
    });
    
    // Should throw a validation error
    let error: mongoose.Error.ValidationError | null = null;
    try {
      await secondStandup.save();
    } catch (e) {
      error = e as mongoose.Error.ValidationError;
    }
    
    expect(error).toBeDefined();
    expect(error?.message).toContain('already submitted a standup for today');
  });

  it('should allow a user to submit a standup entry for a different day', async () => {
    // Create a standup for "yesterday"
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    
    const yesterdayStandup = new Standup({
      userId: testUser._id,
      yesterday: 'Yesterday update',
      today: 'Yesterday plan',
      blockers: 'None',
      createdAt: yesterdayDate
    });
    await yesterdayStandup.save();
    
    // Create a standup for "today"
    const todayStandup = new Standup({
      userId: testUser._id,
      yesterday: 'Today update',
      today: 'Today plan',
      blockers: 'None'
    });
    
    // This should succeed
    const savedStandup = await todayStandup.save();
    expect(savedStandup._id).toBeDefined();
  });

  it('should correctly identify if a user has submitted a standup for today', async () => {
    // Before submitting a standup
    const hasTodaysBefore = await Standup.hasStandupForToday(testUser._id);
    expect(hasTodaysBefore).toBeNull();
    
    // Create a standup for today
    const standup = new Standup({
      userId: testUser._id,
      yesterday: 'Test update',
      today: 'Test plan',
      blockers: 'None'
    });
    await standup.save();
    
    // After submitting a standup
    const hasTodaysAfter = await Standup.hasStandupForToday(testUser._id);
    expect(hasTodaysAfter).toBeDefined();
    expect(hasTodaysAfter!.userId.toString()).toBe(testUser._id.toString());
  });
});
