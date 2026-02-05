import express from 'express';
import {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  randomizeTeam,
  resetAllTeams,
  getActiveTeam,
  confirmTeam,
  skipTeam
} from '../controllers/teamController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { randomizeLimiter } from '../middleware/rateLimit.js';
import { createTeamSchema, updateTeamSchema, teamIdSchema } from '../schemas/teamSchema.js';

const router = express.Router();

// All team routes require authentication
router.use(requireAuth);

// GET /api/teams - Get all teams
router.get('/', getAllTeams);

// GET /api/teams/active - Get currently active team
router.get('/active', getActiveTeam);

// GET /api/teams/:id - Get team by ID
router.get('/:id', validate(teamIdSchema), getTeamById);

// POST /api/teams - Create new team
router.post('/', validate(createTeamSchema), createTeam);

// PUT /api/teams/:id - Update team
router.put('/:id', validate(updateTeamSchema), updateTeam);

// DELETE /api/teams/:id - Delete team
router.delete('/:id', validate(teamIdSchema), deleteTeam);

// POST /api/teams/randomize - Randomize next team (with rate limiting)
router.post('/randomize', randomizeLimiter, randomizeTeam);

// POST /api/teams/reset - Reset all teams
router.post('/reset', resetAllTeams);

// POST /api/teams/:id/confirm - Confirm currently selected team
router.post('/:id/confirm', validate(teamIdSchema), confirmTeam);

// POST /api/teams/:id/skip - Skip currently selected team
router.post('/:id/skip', validate(teamIdSchema), skipTeam);

export default router;
