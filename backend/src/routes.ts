import express from 'express';
import userController from './controllers/userController';
import standupController from './controllers/standupController';

const router = express.Router();

/**
 * User Routes
 */
router.post('/users/login', userController.login);
router.post('/users/register', userController.register);

/**
 * Standup Routes
 */
router.post('/standups', standupController.validateUser, standupController.create);
router.put('/standups/:id', standupController.validateUser, standupController.update);
router.get('/standups', standupController.validateUser, standupController.getUserStandups);
router.get('/standups/team', standupController.validateUser, standupController.getTeamStandups);
router.get('/standups/check-daily', standupController.validateUser, standupController.checkDailyStandup);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

export default router;
