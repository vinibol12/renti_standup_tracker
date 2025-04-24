import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Setup an in-memory MongoDB server for testing
let mongoServer: MongoMemoryServer;

/**
 * Connect to the in-memory database before running tests
 */
export const setupTestDB = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};

/**
 * Drop database, close the connection and stop mongod
 */
export const teardownTestDB = async (): Promise<void> => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

/**
 * Clear all collections in the test database
 */
export const clearDatabase = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

// Add a simple test to make Jest happy
describe('Test setup', () => {
  it('should be properly configured', () => {
    expect(true).toBe(true);
  });
});
