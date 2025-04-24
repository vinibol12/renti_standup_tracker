import { User } from '../../models/User';
import { setupTestDB, teardownTestDB, clearDatabase } from '../testSetup';
import mongoose from 'mongoose';

// Set up the test database
beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());
beforeEach(async () => await clearDatabase());

describe('User Model Tests', () => {
  it('should create a new user successfully', async () => {
    // Create user data
    const userData = {
      username: 'testuser',
      email: 'test@example.com'
    };
    
    // Create a new user
    const user = new User(userData);
    const savedUser = await user.save();
    
    // Check if the user was created successfully
    expect(savedUser).toBeTruthy();
    expect(savedUser.username).toBe('testuser');
    expect(savedUser.email).toBe('test@example.com');
  });
  
  it('should not create a user without username', async () => {
    // Create incomplete user data (missing username)
    const userData = {
      email: 'test@example.com'
    };
    
    try {
      // Attempt to create a user
      const user = new User(userData);
      await user.save();
      // If no error is thrown, the test should fail
      fail('Expected validation error for missing username');
    } catch (error) {
      // Expect a ValidationError
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      // Check that the error is about the username
      expect((error as mongoose.Error.ValidationError).errors.username).toBeDefined();
    }
  });
  
  it('should not create a user without email', async () => {
    // Create incomplete user data (missing email)
    const userData = {
      username: 'testuser'
    };
    
    try {
      // Attempt to create a user
      const user = new User(userData);
      await user.save();
      // If no error is thrown, the test should fail
      fail('Expected validation error for missing email');
    } catch (error) {
      // Expect a ValidationError
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      // Check that the error is about the email
      expect((error as mongoose.Error.ValidationError).errors.email).toBeDefined();
    }
  });
  
  it('should not create a user with invalid email format', async () => {
    // Create user data with invalid email
    const userData = {
      username: 'testuser',
      email: 'notanemail'
    };
    
    try {
      // Attempt to create a user
      const user = new User(userData);
      await user.save();
      // If no error is thrown, the test should fail
      fail('Expected validation error for invalid email format');
    } catch (error) {
      // Expect a ValidationError
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      // Check that the error is about the email
      expect((error as mongoose.Error.ValidationError).errors.email).toBeDefined();
    }
  });
  
  it('should not create a user with duplicate username', async () => {
    // Create first user
    const firstUser = new User({
      username: 'duplicate',
      email: 'first@example.com'
    });
    await firstUser.save();
    
    // Try to create another user with the same username
    try {
      const secondUser = new User({
        username: 'duplicate',
        email: 'second@example.com'
      });
      await secondUser.save();
      // If no error is thrown, the test should fail
      fail('Expected validation error for duplicate username');
    } catch (error) {
      // Expect a ValidationError
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      // Check that the error is about the username
      expect((error as mongoose.Error.ValidationError).errors.username).toBeDefined();
    }
  });
  
  it('should not create a user with duplicate email', async () => {
    // Create first user
    const firstUser = new User({
      username: 'firstuser',
      email: 'duplicate@example.com'
    });
    await firstUser.save();
    
    // Try to create another user with the same email
    try {
      const secondUser = new User({
        username: 'seconduser',
        email: 'duplicate@example.com'
      });
      await secondUser.save();
      // If no error is thrown, the test should fail
      fail('Expected validation error for duplicate email');
    } catch (error) {
      // Expect a ValidationError
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      // Check that the error is about the email
      expect((error as mongoose.Error.ValidationError).errors.email).toBeDefined();
    }
  });
});
