import { useState } from 'react';

export default function TeamManagementModal({ isOpen, onClose, teams, onRefresh }) {
  const [mode, setMode] = useState('list'); // 'list', 'add', 'edit'
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState(['']);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setTeamName('');
    setMembers(['']);
    setSelectedTeam(null);
    setError('');
  };

  const handleAddMember = () => {
    setMembers([...members, '']);
  };

  const handleRemoveMember = (index) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleMemberChange = (index, value) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const handleSaveTeam = async () => {
    try {
      setError('');

      if (!teamName.trim()) {
        setError('Team name is required');
        return;
      }

      const filteredMembers = members.filter(m => m.trim() !== '');
      if (filteredMembers.length === 0) {
        setError('At least one member is required');
        return;
      }

      const teamData = {
        name: teamName.trim(),
        members: filteredMembers
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/teams${selectedTeam ? `/${selectedTeam.id}` : ''}`, {
        method: selectedTeam ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(teamData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save team');
      }

      resetForm();
      setMode('list');
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setTeamName(team.name);
    setMembers(team.members.length > 0 ? team.members : ['']);
    setMode('edit');
  };

  const handleDeleteTeam = async (teamId) => {
    const confirmed = window.confirm('Are you sure you want to delete this team?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/teams/${teamId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete team');
      }

      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    resetForm();
    setMode('list');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Team Management</h2>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        {mode === 'list' && (
          <div className="modal-body">
            <button className="btn btn-add-team" onClick={() => setMode('add')}>
              Add New Team
            </button>

            <div className="team-management-list">
              {teams.map((team) => (
                <div key={team.id} className="team-management-item">
                  <div className="team-management-info">
                    <strong>{team.name}</strong>
                    <div className="team-management-members">
                      {team.members.join(', ')}
                    </div>
                  </div>
                  <div className="team-management-actions">
                    <button className="btn-icon btn-edit" onClick={() => handleEditTeam(team)}>
                      Edit
                    </button>
                    <button className="btn-icon btn-delete" onClick={() => handleDeleteTeam(team.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(mode === 'add' || mode === 'edit') && (
          <div className="modal-body">
            <div className="form-group">
              <label>Team Name:</label>
              <input
                type="text"
                className="input"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>

            <div className="form-group">
              <label>Members:</label>
              {members.map((member, index) => (
                <div key={index} className="member-input-group">
                  <input
                    type="text"
                    className="input"
                    value={member}
                    onChange={(e) => handleMemberChange(index, e.target.value)}
                    placeholder={`Member ${index + 1}`}
                  />
                  {members.length > 1 && (
                    <button
                      className="btn-icon btn-remove-member"
                      onClick={() => handleRemoveMember(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button className="btn-add-member" onClick={handleAddMember}>
                + Add Member
              </button>
            </div>

            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => { resetForm(); setMode('list'); }}>
                Cancel
              </button>
              <button className="btn btn-save" onClick={handleSaveTeam}>
                {mode === 'edit' ? 'Update Team' : 'Create Team'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
