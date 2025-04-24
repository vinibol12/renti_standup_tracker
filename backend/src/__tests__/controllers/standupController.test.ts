import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../../models/User';
import { Standup } from '../../models/Standup';
import standupController from '../../controllers/standupController';
import { setupTestDB, teardownTestDB, clearDatabase } from '../testSetup';

// Mock Express request and response
const mockRequest = () => {
  const req: Partial<Request> = {};
  req.body = {};
  req.params = {};
  req.query = {};
  req.userId = '';
  return req as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

const mockNext: NextFunction = jest.fn();

// Set up test database
beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());
beforeEach(async () => await clearDatabase());

describe('Standup Controller Tests', () => {
  let testUser: mongoose.Document & { _id: mongoose.Types.ObjectId, username: string, email: string };
  
  // Create a test user before each test
  beforeEach(async () => {
    testUser = new User({
      username: 'standuptester',
      email: 'standuptester@example.com'
    });
    await testUser.save();
  });
  
  describe('validateUser middleware', () => {
    it('should return 401 if userId is not provided', async () => {
      const req = mockRequest();
      // No userId set
      const res = mockResponse();
      
      await standupController.validateUser(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: {
          userId: 'User ID not provided'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
    
    it('should return 404 if user does not exist', async () => {
      const req = mockRequest();
      req.userId = new mongoose.Types.ObjectId().toString();
      const res = mockResponse();
      
      await standupController.validateUser(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: {
          userId: 'User not found'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
    
    it('should call next() if user exists', async () => {
      const req = mockRequest();
      req.userId = testUser._id.toString();
      const res = mockResponse();
      
      await standupController.validateUser(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
  
  describe('checkDailyStandup function', () => {
    it('should return hasSubmittedToday: false when no standup exists for today', async () => {
      const req = mockRequest();
      req.userId = testUser._id.toString();
      const res = mockResponse();
      
      await standupController.checkDailyStandup(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        hasSubmittedToday: false
      });
    });
    
    it('should return hasSubmittedToday: true and the standup when a standup exists for today', async () => {
      // Create a standup for today
      const standup = new Standup({
        userId: testUser._id,
        yesterday: 'Test update',
        today: 'Test plan',
        blockers: 'None'
      });
      await standup.save();
      
      const req = mockRequest();
      req.userId = testUser._id.toString();
      const res = mockResponse();
      
      await standupController.checkDailyStandup(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        hasSubmittedToday: true,
        standup: expect.objectContaining({
          _id: expect.any(mongoose.Types.ObjectId),
          userId: expect.any(mongoose.Types.ObjectId),
          yesterday: 'Test update',
          today: 'Test plan',
          blockers: 'None'
        })
      });
    });
  });
  
  describe('create function', () => {
    it('should return validation errors if required fields are missing', async () => {
      const req = mockRequest();
      req.userId = testUser._id.toString();
      req.body = {
        // Missing both 'yesterday' and 'today' fields
        blockers: 'None'
      };
      const res = mockResponse();
      
      await standupController.create(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: {
          yesterday: 'What you did yesterday is required',
          today: 'What you plan to do today is required'
        }
      });
    });
    
    it('should create a standup entry successfully', async () => {
      const req = mockRequest();
      req.userId = testUser._id.toString();
      req.body = {
        yesterday: 'Worked on UI components',
        today: 'Working on API integration',
        blockers: 'None'
      };
      const res = mockResponse();
      
      await standupController.create(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      
      // Check the response
      expect(res.json).toHaveBeenCalled();
      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      expect(responseData._id).toBeDefined();
      expect(responseData.userId.toString()).toBe(testUser._id.toString());
      expect(responseData.yesterday).toBe('Worked on UI components');
      expect(responseData.today).toBe('Working on API integration');
    });
    
    it('should prevent a user from submitting multiple standups on the same day', async () => {
      // Create a first standup for today
      const standup = new Standup({
        userId: testUser._id,
        yesterday: 'First update',
        today: 'First plan',
        blockers: 'None'
      });
      await standup.save();
      
      // Try to create a second standup
      const req = mockRequest();
      req.userId = testUser._id.toString();
      req.body = {
        yesterday: 'Second update',
        today: 'Second plan',
        blockers: 'None'
      };
      const res = mockResponse();
      
      await standupController.create(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: {
          userId: 'You already submitted a standup for today'
        }
      });
    });
  });
  
  describe('getUserStandups function', () => {
    it('should return the user\'s standup entries', async () => {
      // Create some standup entries for the user
      const standup1 = new Standup({
        userId: testUser._id,
        yesterday: 'Task 1',
        today: 'Task 2',
        blockers: 'None',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      });
      await standup1.save();
      
      const standup2 = new Standup({
        userId: testUser._id,
        yesterday: 'Task 3',
        today: 'Task 4',
        blockers: 'Issue with API'
      });
      await standup2.save();
      
      const req = mockRequest();
      req.userId = testUser._id.toString();
      const res = mockResponse();
      
      await standupController.getUserStandups(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      expect(responseData.length).toBe(2);
      
      // Entries should be sorted by createdAt (newest first)
      expect(responseData[0].yesterday).toBe('Task 3'); // Newest entry
      expect(responseData[1].yesterday).toBe('Task 1'); // Older entry
    });
    
    it('should return an empty array if user has no standups', async () => {
      const req = mockRequest();
      req.userId = testUser._id.toString();
      const res = mockResponse();
      
      await standupController.getUserStandups(req, res);
      
      expect(res.json).toHaveBeenCalled();
      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      expect(responseData).toEqual([]);
    });
  });
});
