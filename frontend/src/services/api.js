const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      credentials: 'include',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Teams endpoints
  async getAllTeams() {
    return this.request('/teams');
  }

  async getTeamById(id) {
    return this.request(`/teams/${id}`);
  }

  async getActiveTeam() {
    return this.request('/teams/active');
  }

  async createTeam(teamData) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async updateTeam(id, teamData) {
    return this.request(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teamData),
    });
  }

  async deleteTeam(id) {
    return this.request(`/teams/${id}`, {
      method: 'DELETE',
    });
  }

  async randomizeTeam() {
    return this.request('/teams/randomize', {
      method: 'POST',
    });
  }

  async resetAllTeams() {
    return this.request('/teams/reset', {
      method: 'POST',
    });
  }

  async confirmTeam(id) {
    return this.request(`/teams/${id}/confirm`, {
      method: 'POST',
    });
  }

  async skipTeam(id) {
    return this.request(`/teams/${id}/skip`, {
      method: 'POST',
    });
  }
}

export default new ApiService();
