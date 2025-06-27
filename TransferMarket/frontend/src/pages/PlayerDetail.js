import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PlayerDetail.css';
import countryNameToCode from "../utils/CountryToCode";
import formatDate from "../utils/FormatDate";
import getAge from "../utils/GetAge";
import formatValue from '../utils/FormatValue';

const PlayerDetail = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState([]);
  const [selectedView, setSelectedView] = useState('total');

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/players/${playerId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setPlayer(res.data);
      } catch (err) {
        console.error('Error fetching player details', err);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/stats/player/${playerId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching player stats', err);
      }
    };

    fetchPlayer();
    fetchStats();
  }, [playerId]);

  const toggleFavourite = async () => {
    const token = localStorage.getItem("token");
    try {
      if (player.is_favourite) {
        await axios.delete(`http://localhost:5000/api/auth/favourite_players/${player.player_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://localhost:5000/api/auth/favourite_players/${player.player_id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setPlayer(prev => ({ ...prev, is_favourite: !prev.is_favourite }));
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    }
  };

  const groupStatsByClub = () => {
    const grouped = {};
    stats.filter(s => s.team_type?.trim().toLowerCase() === 'club').forEach(stat => {
      if (!grouped[stat.team_name]) grouped[stat.team_name] = [];
      grouped[stat.team_name].push(stat);
    });
    return grouped;
  };

  const groupStatsByNational = () => {
    return stats.filter(s => s.team_type?.trim().toLowerCase() === 'national');
  };

  const getTotalStats = () => {
    const totalClubs = stats.filter(s => s.team_type?.trim().toLowerCase() === 'club').reduce((acc, stat) => ({
      matches: acc.matches + stat.matches,
      goals: acc.goals + stat.goals,
      assists: acc.assists + stat.assists,
      yellow_cards: acc.yellow_cards + stat.yellow_cards,
      red_cards: acc.red_cards + stat.red_cards,
    }), { matches: 0, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0 });

    const totalNational = stats.filter(s => s.team_type?.trim().toLowerCase() === 'national').reduce((acc, stat) => ({
      matches: acc.matches + stat.matches,
      goals: acc.goals + stat.goals,
      assists: acc.assists + stat.assists,
      yellow_cards: acc.yellow_cards + stat.yellow_cards,
      red_cards: acc.red_cards + stat.red_cards,
    }), { matches: 0, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0 });

    return { totalClubs, totalNational };
  };

  const renderStatsTable = (rows) => (
    <table className="transfers-table">
      <thead>
        <tr>
          <th>🗓️ Season</th>
          <th>#️⃣ Matches</th>
          <th>⚽ Goals</th>
          <th>🅰️ Assists</th>
          <th>🟨 Yellow</th>
          <th>🟥 Red</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((stat, index) => (
          <tr key={index}>
            <td>{stat.season}</td>
            <td>{stat.matches}</td>
            <td>{stat.goals}</td>
            <td>{stat.assists}</td>
            <td>{stat.yellow_cards}</td>
            <td>{stat.red_cards}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderStatsView = () => {
    if (selectedView === 'total') {
      const { totalClubs, totalNational } = getTotalStats();
      const hasClubStats = totalClubs.matches > 0;
      const hasNationalStats = totalNational.matches > 0;

      if (!hasClubStats && !hasNationalStats) {
        return <p className="no-stats-message">No recorded stats.</p>;
      }

      return (
        <>
          {hasClubStats && (
            <>
              <div className="club-header" style={{ cursor: "default" }}>
                <span className="club-name">📊 Total Club Stats</span>
              </div>
              {renderStatsTable([{ season: 'All Seasons', ...totalClubs }])}
            </>
          )}
          {hasNationalStats && (
            <>
              <div className="club-header" style={{ cursor: "default" }}>
                <span className="club-name">
                  <img
                    className="custom-player-flag"
                    src={`https://flagcdn.com/w40/${countryNameToCode[player.nationality]}.png`}
                    alt={player.nationality}
                    title={player.nationality}
                  />{" "}
                  Total Stats For {player.nationality}
                </span>
              </div>
              {renderStatsTable([{ season: 'All Seasons', ...totalNational }])}
            </>
          )}
        </>
      );
    }

    if (selectedView === 'club') {
      const grouped = groupStatsByClub();
      if (Object.keys(grouped).length === 0) {
        return <p className="no-stats-message">No recorded stats for clubs.</p>;
      }
      return Object.entries(grouped).map(([clubName, clubStats]) => {
        const sanitizedClubName = clubName.replace(/\s+/g, '');
        const clubLogo = `http://localhost:5000/uploads/teams/${sanitizedClubName}.png`;
        const teamId = clubStats[0].team_id;

        return (
          <div key={clubName}>
            <div className="club-header" onClick={() => navigate(`/teams/${teamId}`)}>
              <img className="club-logo" src={clubLogo} alt={`${clubName} logo`} />
              <span className="club-name">{clubName}</span>
            </div>
            {renderStatsTable(clubStats)}
          </div>
        );
      });
    }

    if (selectedView === 'country') {
      const nationalStats = groupStatsByNational();
      if (nationalStats.length === 0) {
        return <p className="no-stats-message">No recorded stats for {player.nationality}.</p>;
      }
      const teamId = nationalStats[0].team_id;

      return (
        <>
          <div className="club-header" onClick={() => navigate(`/teams/${teamId}`)} style={{ cursor: 'pointer' }}>
            <img
              className="club-logo"
              src={`https://flagcdn.com/w40/${countryNameToCode[player.nationality]}.png`}
              alt={player.nationality}
              title={player.nationality}
            />
            <span className="club-name">{player.nationality}</span>
          </div>
          {renderStatsTable(nationalStats)}
        </>
      );
    }

    return null;
  };

  if (!player || !Array.isArray(stats)) return <p className="empty-favourites">Loading...</p>;

  const countryCode = countryNameToCode[player.nationality];

  return (
    <div className="custom-player-layout">
      <div className="custom-player-card">
        <div className="custom-player-img-wrapper">
          <div className="custom-player-fav-container">
            <button
              onClick={toggleFavourite}
              className={`custom-player-fav-btn ${player.is_favourite ? 'fav' : ''}`}
              title={player.is_favourite ? "Remove from favourites" : "Add to favourites"}
            >
              {player.is_favourite ? '★' : '☆'}
            </button>
          </div>
          <img
            src={`http://localhost:5000/uploads/players/${player.picture}`}
            alt={`${player.name} ${player.surname}`}
          />
        </div>
        <h2>{player.name} {player.surname}</h2>
        <p><strong>Club:</strong> {player.current_club || 'No club'}</p>
        <p><strong>Position:</strong> {player.position}</p>
        <p>
          <strong>Nationality:</strong> {player.nationality}{' '}
          {countryCode ? (
            <img className="custom-player-flag" src={`https://flagcdn.com/w40/${countryCode}.png`} alt={player.nationality} title={player.nationality} />
          ) : (
            <span className="team-detail-flag-fallback">🌍</span>
          )}
        </p>
        <p><strong>Date of Birth:</strong> {formatDate(player.date_of_birth)}, {getAge(player.date_of_birth)} years</p>
        <p><strong>Value:</strong> {player.value ? `€${formatValue(player.value)}` : '???'}</p>
      </div>

      <div className="player-stats-wrapper">
        <div className="player-detail-stats-nav-buttons">
          <button className={selectedView === 'total' ? 'active' : ''} onClick={() => setSelectedView('total')}>Total Stats</button>
          <button className={selectedView === 'club' ? 'active' : ''} onClick={() => setSelectedView('club')}>Club Stats</button>
          <button className={selectedView === 'country' ? 'active' : ''} onClick={() => setSelectedView('country')}>Country Stats</button>
        </div>
        <div className="player-stats-section">
          {renderStatsView()}
        </div>
      </div>
    </div>
  );
};

export default PlayerDetail;
