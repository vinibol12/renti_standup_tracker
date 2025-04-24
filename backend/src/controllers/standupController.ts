import { Request, Response, NextFunction } from 'express';
import { Standup } from '../models/Standup';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { 
  getStartOfToday, 
  getTodayPeriod, 
  getYesterdayPeriod, 
  getLastDaysPeriod 
} from '../utils/dateUtils';

// Define interfaces for type safety
interface UserDocument {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
}

interface PopulatedStandup {
  _id: mongoose.Types.ObjectId;
  userId: UserDocument;
  yesterday: string;
  today: string;
  blockers: string;
  createdAt: Date;
}

/**
 * Standup Controller - Handles all standup-related business logic
 */
export default {
  /**
   * Middleware to validate user exists before proceeding
   */
  validateUser: async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({
          message: 'Validation failed',
          errors: {
            userId: 'User ID not provided'
          }
        });
      }
      
      // Validate if a user exists with that ID
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          message: 'Validation failed',
          errors: {
            userId: 'User not found'
          }
        });
      }
      
      next(); // For middleware, we call next() without returning it
    } catch (_error) {
      return res.status(500).json({ message: 'Server error validating user' });
    }
  },

  /**
   * Check if user has already submitted a standup for today
   */
  checkDailyStandup: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.userId;
      
      // Convert string userId to ObjectId for mongoose query
      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      // Check if the user has already submitted a standup for today
      const existingStandup = await Standup.hasStandupForToday(userObjectId);
      
      if (existingStandup) {
        return res.status(200).json({
          hasSubmittedToday: true,
          standup: existingStandup
        });
      }
      
      return res.status(200).json({
        hasSubmittedToday: false
      });
    } catch (_error) {
      return res.status(500).json({ message: 'Server error checking daily standup' });
    }
  },

  /**
   * Create a new standup entry for a user
   */
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { yesterday, today, blockers } = req.body;
      
      // Basic field validation
      const validationErrors: Record<string, string> = {};
      
      if (!yesterday) {
        validationErrors.yesterday = 'What you did yesterday is required';
      }
      
      if (!today) {
        validationErrors.today = 'What you plan to do today is required';
      }
      
      if (Object.keys(validationErrors).length > 0) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validationErrors
        });
      }
      
      const userId = req.userId;
      
      // Convert string userId to ObjectId for mongoose
      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      // Check if the user already submitted a standup for today
      const existingStandup = await Standup.hasStandupForToday(userObjectId);
      if (existingStandup) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: {
            userId: 'You already submitted a standup for today'
          }
        });
      }
      
      // Create the standup
      const standup = new Standup({
        userId: userObjectId,
        yesterday,
        today,
        blockers: blockers || 'No blockers'
      });
      
      // Save the standup
      const savedStandup = await standup.save();
      return res.status(201).json(savedStandup);
    } catch (_error) {
      return res.status(500).json({ message: 'Server error' });
    }
  },

  /**
   * Get all standups for the current user
   */
  getUserStandups: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.userId;
      const { period } = req.query;
      
      // Base filter always includes user ID
      const filter: Record<string, unknown> = { userId };
      
      // Add date filtering based on period
      if (period === 'week') {
        filter.createdAt = { $gte: getLastDaysPeriod(7).start };
      } else if (period === 'month') {
        filter.createdAt = { $gte: getLastDaysPeriod(30).start };
      }
      // 'all' uses just the user ID filter
      
      const standups = await Standup.find(filter)
        .sort({ createdAt: -1 })
        .lean();
      
      return res.status(200).json(standups);
    } catch (_error) {
      return res.status(500).json({ message: 'Server error fetching standups' });
    }
  },

  /**
   * Get the most recent standup entry from each team member
   */
  getTeamStandups: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { filter } = req.query;
      
      // Define date filter based on filter value
      const dateFilter: Record<string, unknown> = {};
      
      if (filter === 'today') {
        const { start, end } = getTodayPeriod();
        dateFilter.createdAt = { $gte: start, $lte: end };
      } else if (filter === 'yesterday') {
        const { start, end } = getYesterdayPeriod();
        dateFilter.createdAt = { $gte: start, $lte: end };
      } else {
        // Default to week (or if 'week' is explicitly specified)
        const { start } = getLastDaysPeriod(7);
        dateFilter.createdAt = { $gte: start };
      }
      
      // Use type assertion to handle the populated documents
      const standups = await Standup.find(dateFilter)
        .populate('userId', 'username email') as unknown as PopulatedStandup[];
      
      // Group by user and get the most recent entry for each
      const userMap = new Map<string, PopulatedStandup>();
      
      standups.forEach(standup => {
        const userId = standup.userId._id.toString();
        
        if (!userMap.has(userId) || userMap.get(userId)!.createdAt < standup.createdAt) {
          userMap.set(userId, standup);
        }
      });
      
      // Convert map to array
      const teamStandups = Array.from(userMap.values());
      
      return res.json(teamStandups);
    } catch (_error) {
      console.log("Error getting team standups", _error);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  /**
   * Update an existing standup entry
   */
  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { yesterday, today, blockers } = req.body;
      
      // Basic field validation
      const validationErrors: Record<string, string> = {};
      
      if (!yesterday) {
        validationErrors.yesterday = 'What you did yesterday is required';
      }
      
      if (!today) {
        validationErrors.today = 'What you plan to do today is required';
      }
      
      if (Object.keys(validationErrors).length > 0) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validationErrors
        });
      }
      
      const userId = req.userId;
      
      // Find the standup entry
      const standup = await Standup.findOne({ _id: id, userId });
      
      if (!standup) {
        return res.status(404).json({
          message: 'Validation failed',
          errors: {
            id: 'Standup entry not found or you do not have permission to update it'
          }
        });
      }
      
      // Make sure it's today's standup
      const today_date = getStartOfToday();
      
      const tomorrow = new Date(today_date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const standupDate = new Date(standup.createdAt);
      
      if (standupDate < today_date || standupDate >= tomorrow) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: {
            id: 'You can only edit today\'s standup entry'
          }
        });
      }
      
      // Update the standup
      standup.yesterday = yesterday;
      standup.today = today;
      standup.blockers = blockers || 'No blockers';
      
      // Save the updated standup
      const updatedStandup = await standup.save();
      
      return res.status(200).json(updatedStandup);
    } catch (_error) {
      return res.status(500).json({ message: 'Server error updating standup' });
    }
  },
};
