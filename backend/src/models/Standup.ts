import mongoose from 'mongoose';
import { getCurrentDate, getStartOfToday, getEndOfToday } from '../utils/dateUtils';

// Interface for Standup document
interface IStandup {
  userId: mongoose.Types.ObjectId;
  yesterday: string;
  today: string;
  blockers: string;
  createdAt: Date;
}

const standupSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required'] 
  },
  yesterday: { 
    type: String, 
    required: [true, 'What you did yesterday is required'],
    trim: true,
    minlength: [3, 'Yesterday\'s update must be at least 3 characters']
  },
  today: { 
    type: String, 
    required: [true, 'What you plan to do today is required'],
    trim: true,
    minlength: [3, 'Today\'s plan must be at least 3 characters'] 
  },
  blockers: { 
    type: String,
    default: 'No blockers',
    trim: true
  },
  createdAt: { 
    type: Date, 
    default: getCurrentDate 
  },
});

// Pre-save hook to prevent multiple standup entries per day for the same user
standupSchema.pre('save', async function(next) {
  try {
    // Skip validation if this is an update and createdAt hasn't changed
    if (!this.isNew && !this.isModified('createdAt')) {
      return next();
    }
    
    const model = this.constructor as mongoose.Model<IStandup>;
    
    // Get the start and end of the current day in NZ timezone
    const today = getStartOfToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); 
    
    // Check if the user already has a standup entry for today
    const existingStandup = await model.findOne({
      userId: this.userId,
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    if (existingStandup && this.isNew) {
      const error = new mongoose.Error.ValidationError();
      error.addError('userId', new mongoose.Error.ValidatorError({
        message: 'You already submitted a standup for today',
        path: 'userId',
        type: 'unique'
      }));
      return next(error);
    }
    
    next();
  } catch (err) {
    next(err as mongoose.CallbackError);
  }
});

// Helper static method to check if user has a standup for today
standupSchema.statics.hasStandupForToday = async function(userId) {
  // Get the start and end of the current day in NZ timezone
  const today = getStartOfToday();
  const tomorrow = getEndOfToday();
  
  return await this.findOne({
    userId,
    createdAt: {
      $gte: today,
      $lt: tomorrow
    }
  });
};

// Define interface for model with static methods
interface StandupModel extends mongoose.Model<IStandup> {
  hasStandupForToday(userId: mongoose.Types.ObjectId): Promise<IStandup | null>;
}

export const Standup = mongoose.model<IStandup, StandupModel>('Standup', standupSchema);
