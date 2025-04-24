import 'express';

/**
 * 🐉 HERE BE DRAGONS 🐉
 * 
 * In a production environment, we would implement proper authentication middleware with typed interfaces
 * This is purely for convenience in this demo application to reduce TypeScript noise with need for @ts-expect-error comments
 */
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}
