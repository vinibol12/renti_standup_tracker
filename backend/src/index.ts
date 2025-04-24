import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import routes from './routes';

// Only use dotenv in development; Railway sets env vars directly in production
if (process.env.NODE_ENV !== 'production') {
  // Load environment variables from .env.development
  dotenv.config({ path: '.env.development' });
  console.log('Loaded environment from .env.development');
} else {
  console.log('Running in production mode, using system environment variables');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Debug environment variables
console.log('Available environment variable keys:');
console.log(Object.keys(process.env).join(', '));

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/standup_tracker';

// Log which database we're connecting to
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log('MONGO_URL value:', MONGO_URL);

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('MongoDB Connected');
    console.log('Connected to database:', mongoose.connection.name);
    console.log('Connection state:', mongoose.connection.readyState);
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Simple user identification middleware
app.use((req, _res, next) => {
  const userId = req.headers['x-user-id'];
  if (userId) {
    // Since we've extended the Request interface, we can directly assign
    req.userId = userId as string;
  }
  next();
});

// API Routes
app.use('/api', routes);

app.get('/', (_req, res) => {
  res.send('Standup Tracker API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
