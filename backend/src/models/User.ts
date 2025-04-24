import mongoose from 'mongoose';

// Define interface for User document
interface IUser {
  username: string;
  email: string;
  createdAt: Date;
}

// Define mongoose schema with built-in validations
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'],
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens'],
    trim: true,
    unique: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    trim: true,
    lowercase: true,
    unique: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Pre-save hook to provide better error messages for duplicate keys
userSchema.pre('save', async function(next) {
  // Skip validation if neither username nor email was modified
  if (!this.isNew && !this.isModified('username') && !this.isModified('email')) {
    return next();
  }
  
  try {
    const model = this.constructor as mongoose.Model<IUser>;
    
    // Check for existing username
    if (this.isModified('username') || this.isNew) {
      const existingUsername = await model.findOne({ 
        username: this.username,
        _id: { $ne: this._id }
      });
      
      if (existingUsername) {
        const error = new mongoose.Error.ValidationError();
        error.addError('username', new mongoose.Error.ValidatorError({
          message: 'Username is already taken',
          path: 'username',
          type: 'unique'
        }));
        return next(error);
      }
    }
    
    // Check for existing email
    if (this.isModified('email') || this.isNew) {
      const existingEmail = await model.findOne({ 
        email: this.email,
        _id: { $ne: this._id }
      });
      
      if (existingEmail) {
        const error = new mongoose.Error.ValidationError();
        error.addError('email', new mongoose.Error.ValidatorError({
          message: 'Email is already in use',
          path: 'email',
          type: 'unique'
        }));
        return next(error);
      }
    }
    
    next();
  } catch (err) {
    // Properly type the error for next
    next(err as mongoose.CallbackError);
  }
});

export const User = mongoose.model<IUser>('User', userSchema);
