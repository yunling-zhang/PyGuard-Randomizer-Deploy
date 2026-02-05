export default function TeamList({ teams }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'PRESENTED':
        return 'presented';
      case 'CURRENTLY_SELECTED':
        return 'currently-selected';
      case 'UNPRESENTED':
      default:
        return '';
    }
  };

  const presentedCount = teams.filter(team => team.status === 'PRESENTED').length;
  const totalCount = teams.length;

  return (
    <section className="card">
      <section className="all-teams-top">
        <h3 className="card-title">All Teams</h3>
        <div className="progress-tracker">
          {presentedCount}/{totalCount} teams have presented
        </div>

        <div className="team-list">
          {teams.map((team) => (
            <button
              key={team.id}
              className={`team-tag ${getStatusClass(team.status)}`}
              type="button"
            >
              {team.name}
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}
