import { z } from 'zod';

// Schema for creating a team
export const createTeamSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Team name is required')
      .max(100, 'Team name must be less than 100 characters')
      .trim(),
    members: z.array(
      z.string()
        .min(1, 'Member name cannot be empty')
        .max(100, 'Member name must be less than 100 characters')
        .trim()
    )
      .min(1, 'At least one team member is required')
      .max(20, 'Maximum 20 members per team'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

// Schema for updating a team
export const updateTeamSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Team name is required')
      .max(100, 'Team name must be less than 100 characters')
      .trim()
      .optional(),
    members: z.array(
      z.string()
        .min(1, 'Member name cannot be empty')
        .max(100, 'Member name must be less than 100 characters')
        .trim()
    )
      .min(1, 'At least one team member is required')
      .max(20, 'Maximum 20 members per team')
      .optional(),
    status: z.enum(['UNPRESENTED', 'CURRENTLY_SELECTED', 'PRESENTED']).optional(),
    active: z.boolean().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, 'Team ID is required'),
  }),
});

// Schema for team ID param
export const teamIdSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, 'Team ID is required'),
  }),
});
