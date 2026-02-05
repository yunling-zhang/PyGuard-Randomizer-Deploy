import { useState, useEffect } from 'react';
import api from './services/api';
import TeamDashboard from './components/TeamDashboard';
import Timer from './components/Timer';
import TeamList from './components/TeamList';
import TeamManagementModal from './components/TeamManagementModal';
import Login from './components/Login';

function App() {
  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch teams when authenticated
  useEffect(() => {
    if (user) {
      fetchTeams();
      fetchActiveTeam();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/me`, {
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setAuthChecked(true);
    }
  };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await api.getAllTeams();
      setTeams(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch teams. Please check if the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveTeam = async () => {
    try {
      const data = await api.getActiveTeam();
      setCurrentTeam(data);
    } catch (err) {
      console.error('Failed to fetch active team:', err);
    }
  };

  const handleRandomize = async () => {
    // Prevent race condition from rapid clicks
    if (isRandomizing) return;

    try {
      setIsRandomizing(true);

      // If there's a confirmed team, mark it as presented before picking next
      if (currentTeam && isConfirmed) {
        await api.confirmTeam(currentTeam.id);
      }

      const selectedTeam = await api.randomizeTeam();

      if (!selectedTeam.id) {
        setCurrentTeam(null);
      } else {
        setCurrentTeam(selectedTeam);
      }

      setIsConfirmed(false);

      // Refresh teams list to update status
      await fetchTeams();
    } catch (err) {
      setError('Failed to randomize team');
      console.error(err);
    } finally {
      setIsRandomizing(false);
    }
  };

  const handleConfirm = async () => {
    if (!currentTeam) return;

    try {
      // Just mark as confirmed locally, don't change status yet
      setIsConfirmed(true);
    } catch (err) {
      setError('Failed to confirm team');
      console.error(err);
    }
  };

  const handleSkip = async () => {
    if (!currentTeam) return;

    try {
      // Skip current team (mark as unpresented)
      await api.skipTeam(currentTeam.id);
      setIsConfirmed(false);

      // Automatically pick the next group
      const selectedTeam = await api.randomizeTeam();

      if (!selectedTeam.id) {
        setCurrentTeam(null);
      } else {
        setCurrentTeam(selectedTeam);
      }

      // Refresh teams list to update status
      await fetchTeams();
    } catch (err) {
      setError('Failed to skip team');
      console.error(err);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm('Are you sure you want to reset all teams? This will mark all teams as unpresented.');

    if (!confirmed) return;

    try {
      await api.resetAllTeams();
      setCurrentTeam(null);
      setIsConfirmed(false);

      // Refresh teams list to update status
      await fetchTeams();
    } catch (err) {
      setError('Failed to reset teams');
      console.error(err);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setTeams([]);
      setCurrentTeam(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const allTeamsPresented = teams.length > 0 && teams.every(team => team.status === 'PRESENTED');

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="app">
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="app">
        <header className="topbar">
          <h1 className="topbar-title">Presentation Randomizer</h1>
        </header>
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <header className="topbar">
          <h1 className="topbar-title">Presentation Randomizer</h1>
        </header>
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'red' }}>{error}</p>
          <button className="btn" onClick={fetchTeams}>Retry</button>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="topbar-title">Presentation Randomizer</h1>
        <div className="topbar-actions">
          <span className="topbar-user">Welcome, {user.username}</span>
          <button className="btn btn-manage" onClick={() => setIsModalOpen(true)}>
            Manage Teams
          </button>
          <button className="btn btn-reset" onClick={handleReset}>
            Reset All Progress
          </button>
          <button className="btn btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="main">
          <TeamDashboard
            currentTeam={currentTeam}
            onRandomize={handleRandomize}
            onConfirm={handleConfirm}
            onSkip={handleSkip}
            allTeamsPresented={allTeamsPresented}
            isConfirmed={isConfirmed}
            isRandomizing={isRandomizing}
          />
          <Timer allTeamsPresented={allTeamsPresented} />
        </section>

        <TeamList teams={teams} />
      </main>

      <TeamManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teams={teams}
        onRefresh={fetchTeams}
      />
    </div>
  );
}

export default App;
