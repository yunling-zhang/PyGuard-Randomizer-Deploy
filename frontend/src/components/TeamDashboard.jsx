export default function TeamDashboard({ currentTeam, onRandomize, onConfirm, onSkip, allTeamsPresented, isConfirmed, isRandomizing }) {
  const isCurrentlySelected = currentTeam && currentTeam.status === 'CURRENTLY_SELECTED';
  const showConfirmSkip = isCurrentlySelected && !isConfirmed;

  return (
    <section className="card">
      <h2 className="card-title">Current Team:</h2>

      <div className="card-content">
        <div className={`team-name ${!currentTeam ? 'team-name-empty' : ''}`}>
          {allTeamsPresented
            ? 'All teams have presented!'
            : currentTeam
              ? currentTeam.name
              : 'No team selected'}
        </div>

        {currentTeam && (
          <ul className="team-members">
            {currentTeam.members.map((member, index) => (
              <li key={index}>{member}</li>
            ))}
          </ul>
        )}

        {showConfirmSkip ? (
          <div className="button-group">
            <button
              className="btn btn-confirm"
              type="button"
              onClick={onConfirm}
            >
              Confirm Presentation
            </button>
            <button
              className="btn btn-skip"
              type="button"
              onClick={onSkip}
            >
              Skip Team
            </button>
          </div>
        ) : (
          <button
            className="btn team-btn"
            type="button"
            onClick={onRandomize}
            disabled={allTeamsPresented || isRandomizing}
          >
            {isRandomizing ? 'Selecting...' : 'Pick the next group'}
          </button>
        )}
      </div>
    </section>
  );
}
