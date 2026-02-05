import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all teams
export const getAllTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams', message: error.message });
  }
};

// Get a single team by ID
export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({
      where: { id }
    });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team', message: error.message });
  }
};

// Create a new team
export const createTeam = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name || !members || !Array.isArray(members)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Name and members array are required'
      });
    }

    const team = await prisma.team.create({
      data: {
        name,
        members,
        status: 'UNPRESENTED',
        active: false
      }
    });

    res.status(201).json(team);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: 'Team name already exists',
        message: 'A team with this name already exists'
      });
    }
    res.status(500).json({ error: 'Failed to create team', message: error.message });
  }
};

// Update a team
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, members, status, active } = req.body;

    const team = await prisma.team.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(members && { members }),
        ...(status && { status }),
        ...(typeof active === 'boolean' && { active })
      }
    });

    res.json(team);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.status(500).json({ error: 'Failed to update team', message: error.message });
  }
};

// Delete a team
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.team.delete({
      where: { id }
    });
    
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.status(500).json({ error: 'Failed to delete team', message: error.message });
  }
};

// Randomize and select next team
export const randomizeTeam = async (req, res) => {
  try {
    // Get all unpresented teams (not currently selected or presented)
    const unpresentedTeams = await prisma.team.findMany({
      where: {
        status: 'UNPRESENTED'
      }
    });

    if (unpresentedTeams.length === 0) {
      return res.status(200).json({
        message: 'All teams have presented',
        team: null
      });
    }

    // Randomly select one
    const randomIndex = Math.floor(Math.random() * unpresentedTeams.length);
    const selectedTeam = unpresentedTeams[randomIndex];

    // Mark as currently selected and active
    const updatedTeam = await prisma.team.update({
      where: { id: selectedTeam.id },
      data: {
        status: 'CURRENTLY_SELECTED',
        active: true
      }
    });

    // Deactivate all other teams
    await prisma.team.updateMany({
      where: {
        id: { not: selectedTeam.id }
      },
      data: {
        active: false
      }
    });

    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to randomize team', message: error.message });
  }
};

// Reset all teams (mark as unpresented)
export const resetAllTeams = async (req, res) => {
  try {
    await prisma.team.updateMany({
      data: {
        status: 'UNPRESENTED',
        active: false
      }
    });

    const teams = await prisma.team.findMany();
    res.json({ message: 'All teams reset successfully', teams });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset teams', message: error.message });
  }
};

// Get the currently active team
export const getActiveTeam = async (req, res) => {
  try {
    const activeTeam = await prisma.team.findFirst({
      where: {
        active: true
      }
    });

    res.json(activeTeam || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active team', message: error.message });
  }
};

// Confirm the currently selected team (mark as presented)
export const confirmTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await prisma.team.update({
      where: { id },
      data: {
        status: 'PRESENTED',
        active: false
      }
    });

    res.json(team);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.status(500).json({ error: 'Failed to confirm team', message: error.message });
  }
};

// Skip the currently selected team (mark back as unpresented)
export const skipTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await prisma.team.update({
      where: { id },
      data: {
        status: 'UNPRESENTED',
        active: false
      }
    });

    res.json(team);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.status(500).json({ error: 'Failed to skip team', message: error.message });
  }
};
