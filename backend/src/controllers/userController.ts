import { Request, Response } from 'express';
import { User } from '../models/User';
import mongoose from 'mongoose';

/**
 * User Controller - Handles all user-related business logic
 */
export default {
  /**
   * Login a user
   */
  login: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { username } = req.body;
      
      // Validate username is provided
      if (!username) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: {
            username: 'Username is required'
          }
        });
      }
      
      const user = await User.findOne({ username });
      
      if (!user) {
        return res.status(404).json({ 
          message: 'Validation failed',
          errors: {
            username: 'User not found with this username'
          }
        });
      }
      
      return res.status(200).json(user);
    } catch (_error) {
      return res.status(500).json({ message: 'Server error' });
    }
  },

  /**
   * Register a new user
   */
  register: async (req: Request, res: Response): Promise<Response> => {
    try {
      // Create a new user with the request body
      const user = new User(req.body);
      
      // Save the user (will trigger validation via pre-save hook)
      await user.save();
      
      return res.status(201).json(user);
    } catch (error) {
      // Handle validation errors
      if (error instanceof mongoose.Error.ValidationError) {
        // Format validation errors for the client
        const errors: Record<string, string> = {};
        
        // Extract error messages from the ValidationError object
        for (const field in error.errors) {
          errors[field] = error.errors[field].message;
        }
        
        return res.status(400).json({ 
          message: 'Validation failed',
          errors 
        });
      }
      
      // Handle other types of errors
      return res.status(500).json({ message: 'Server error' });
    }
  }
};
