import { Request, Response } from 'express';
import { User } from '../../models/User';
import userController from '../../controllers/userController';
import { setupTestDB, teardownTestDB, clearDatabase } from '../testSetup';

// Mock Express request and response
const mockRequest = () => {
  const req: Partial<Request> = {};
  req.body = {};
  return req as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

// Set up test database
beforeAll(async () => await setupTestDB());
afterAll(async () => await teardownTestDB());
beforeEach(async () => await clearDatabase());

describe('User Controller Tests', () => {
  describe('login function', () => {
    it('should return 400 if username is not provided', async () => {
      const req = mockRequest();
      req.body = {}; // No username
      const res = mockResponse();
      
      await userController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Validation failed',
        errors: {
          username: 'Username is required'
        }
      });
    });
    
    it('should return 404 if user is not found', async () => {
      const req = mockRequest();
      req.body = { username: 'nonexistentuser' };
      const res = mockResponse();
      
      await userController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Validation failed',
        errors: {
          username: 'User not found with this username'
        }
      });
    });
    
    it('should return user if login is successful', async () => {
      // Create a user first
      const user = new User({
        username: 'logintest',
        email: 'login@example.com'
      });
      await user.save();
      
      const req = mockRequest();
      req.body = { username: 'logintest' };
      const res = mockResponse();
      
      await userController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      // Check that response includes user data
      const responseData = (res.json as jest.Mock).mock.calls[0][0];
      expect(responseData.username).toBe('logintest');
    });
  });
  
  describe('register function', () => {
    it('should return 400 if validation fails due to missing username', async () => {
      const req = mockRequest();
      req.body = { email: 'test@example.com' }; // No username
      const res = mockResponse();
      
      await userController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: 'Validation failed',
        errors: expect.objectContaining({
          username: expect.anything()
        })
      }));
    });
    
    it('should return 400 if username already exists', async () => {
      // Create a user first
      const existingUser = new User({
        username: 'existinguser',
        email: 'existing@example.com'
      });
      await existingUser.save();
      
      // Try to register with the same username
      const req = mockRequest();
      req.body = { 
        username: 'existinguser', 
        email: 'new@example.com'
      };
      const res = mockResponse();
      
      await userController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: 'Validation failed',
        errors: expect.objectContaining({
          username: expect.anything()
        })
      }));
    });
    
    it('should create new user if registration is valid', async () => {
      const req = mockRequest();
      req.body = { 
        username: 'newuser',
        email: 'new@example.com'
      };
      const res = mockResponse();
      
      await userController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      
      // Verify the user was created in the database
      const user = await User.findOne({ username: 'newuser' });
      expect(user).toBeTruthy();
      expect(user?.email).toBe('new@example.com');
    });
  });
});
