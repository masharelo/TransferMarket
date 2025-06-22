import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Transfers.css';
import formatDate from "../utils/FormatDate";
import formatValue from '../utils/FormatValue';

const Transfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortByValue, setSortByValue] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  const fetchTransfers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/transfers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTransfers(res.data);
      setFilteredTransfers(res.data);
    } catch (error) {
      console.error("Failed to fetch transfers:", error);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  useEffect(() => {
    let filtered = transfers;

    if (typeFilter) {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    if (playerSearch) {
      filtered = filtered.filter(t =>
        `${t.player_name} ${t.player_surname}`.toLowerCase().includes(playerSearch.toLowerCase())
      );
    }

    if (sortByValue) {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else {
      filtered = [...filtered].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    }

    setFilteredTransfers(filtered);
  }, [typeFilter, playerSearch, sortByValue, transfers]);

  const handleNewestClick = () => {
    setTypeFilter('');
    setPlayerSearch('');
    setSortByValue(false);
  };

  const navigate = useNavigate();

  const handleZoomedPictureClick = () => {
    if (zoomImage?.playerId) {
        navigate(`/players/${zoomImage.playerId}`);
    }
  };

  return (
    <div className="transfers-container">
      <div className="transfers-header">
        <h1 className="transfers-header">📈 Transfers</h1>
        <div className="transfers-controls">
          <div className="team-player-detail-nav-buttons">
            <button onClick={handleNewestClick}>Newest</button>
            <button onClick={() => setSortByValue(true)}>Sort by Value</button>
          </div>
          <select className="transfers-dropdown" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="transfer">Transfer</option>
            <option value="loan">Loan</option>
            <option value="contract">Contract</option>
          </select>
          <input
            type="text"
            placeholder="Filter by player name"
            value={playerSearch}
            onChange={(e) => setPlayerSearch(e.target.value)}
            className="transfers-filter"
          />
        </div>
      </div>

      <table className="transfers-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Type</th>
            <th>From</th>
            <th>To</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransfers.map((t, index) => (
            <tr key={index}>
              <td>
                <div className="picture-player">
                  <img
                    src={`http://localhost:5000/uploads/players/${t.player_picture}`}
                    alt={`${t.player_name} ${t.player_surname}`}
                    onClick={() => setZoomImage({image: `http://localhost:5000/uploads/players/${t.player_picture}`,
                        playerId: t.player_id, alt: `${t.player_name} ${t.player_surname}`})}
                    className="zoomable-img"
                  />
                  <strong>{t.player_name} {t.player_surname}</strong>
                </div>
              </td>
              <td className="transfer-column-type">{t.type}</td>
              <td>
                <div className="logo-name-cell-from">
                  <img src={`http://localhost:5000/uploads/teams/${t.team_from_logo}`} alt={`${t.team_from_name} logo`} className="team-logo" />
                  <strong className="team-name">{t.team_from_name}</strong>
                </div>
              </td>
              <td>
                <div className="logo-name-cell-to">
                  <strong className="team-name">{t.team_to_name}</strong>
                  <img src={`http://localhost:5000/uploads/teams/${t.team_to_logo}`} alt={`${t.team_to_name} logo`} className="team-logo" />
                </div>
              </td>
              <td>{formatDate(t.start_date)}</td>
              <td>{formatDate(t.end_date)}</td>
              <td>{t.type === "contract" ? (<>Extended <br />Contract</> ): t.price === 0 ? "Free Agent" : `€${formatValue(t.price)}`}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {zoomImage && (
        <div className="zoom-modal" onClick={() => setZoomImage(null)}>
            <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="zoom-player-name">{zoomImage.alt}</h2>
                <img src={zoomImage.image} alt={zoomImage.alt} className="zoom-image" onClick={handleZoomedPictureClick}/>
            </div>
        </div>
       )}
       
    </div>
  );
};

export default Transfers;
