import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import './TeamDetail.css';
import countryNameToCode from "../utils/CountryToCode";
import formatDate from "../utils/FormatDate";
import getAge from "../utils/GetAge";
import formatValue from "../utils/FormatValue";
import formatTotalValue from "../utils/FormatTotalValue";

const TeamDetail = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [activeTab, setActiveTab] = useState("Squad");
  const [tabData, setTabData] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [squadValue, setSquadValue] = useState(0);

  useEffect(() => {
    const fetchTeam = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/teams/${teamId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeam(res.data);
      } catch (err) {
        console.error("Failed to fetch team:", err);
      }
    };

    fetchTeam();
  }, [teamId]);

  const toggleFavourite = async () => {
    const token = localStorage.getItem("token");
    try {
      if (team.is_favourite) {
        await axios.delete(`http://localhost:5000/api/auth/favourite_teams/${team.team_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://localhost:5000/api/auth/favourite_teams/${team.team_id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setTeam(prev => ({ ...prev, is_favourite: !prev.is_favourite }));
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    }
  };

  useEffect(() => {
    const fetchTabData = async () => {
      const token = localStorage.getItem("token");
      setLoadingTab(true);

      try {
        let url = "";
        switch (activeTab) {
          case "Squad":
            url = `http://localhost:5000/api/auth/teams/${teamId}/squad`;
            break;
          case "Contracts":
            url = `http://localhost:5000/api/auth/teams/${teamId}/contracts?direction=incoming`;
            break;
          case "Loans":
            url = `http://localhost:5000/api/auth/teams/${teamId}/contracts?type=loan`;
            break;
          case "Transfers":
            url = `http://localhost:5000/api/auth/teams/${teamId}/contracts?type=transfer`;
            break;
          default:
            return;
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setTabData(res.data);
        if (activeTab === "Squad") {
          const totalValue = res.data.reduce((sum, player) => {
            const val = Number(player.value);
            return sum + (isNaN(val) ? 0 : val);
          }, 0);
          setSquadValue(totalValue);
        }

      } catch (err) {
        console.error(`Failed to fetch ${activeTab.toLowerCase()}:`, err);
        setTabData([]);
      } finally {
        setLoadingTab(false);
      }
    };

    fetchTabData();
  }, [activeTab, teamId]);

  if (!team) return <p className="empty-favourites">Loading...</p>;

  const countryCode = countryNameToCode[team.country];

  return (
    <div className="team-detail-content-box">
      <div className="team-detail-card">
        <div className="team-detail-logo-box">
          <div className="team-detail-logo-wrapper">
            <img
              src={`http://localhost:5000/uploads/teams/${team.logo}`}
              alt={`${team.name} logo`}
              className="team-detail-logo"
            />
          </div>
          <button
            onClick={toggleFavourite}
            className={`team-detail-fav-btn ${team.is_favourite ? "fav" : ""}`}
            title={team.is_favourite ? "Remove from favourites" : "Add to favourites"}
          >
            {team.is_favourite ? "★" : "☆"}
          </button>
        </div>

        <div className="team-detail-info-and-buttons">
          <div className="team-detail-info">
            <h1>
              {team.name}
              {countryCode ? (
                <img
                  className="team-detail-flag"
                  src={`https://flagcdn.com/w40/${countryCode}.png`}
                  alt={team.country}
                  title={team.country}
                />
              ) : (
                <span className="team-detail-flag-fallback" title="Unknown country">🌍</span>
              )}
            </h1>
            <p><strong>Country:</strong> {team.country}</p>
            {team.city && <p><strong>City:</strong> {team.city}</p>}
            <p><strong>Stadium:</strong> {team.stadium}</p>
            <p><strong>Capacity:</strong> {team.stadium_capacity}</p>
            <p><strong>Founded:</strong> {formatDate(team.founded)}, {getAge(team.founded)} years</p>
            <p><strong>Squad Value:</strong> €{formatTotalValue(squadValue)}</p>
          </div>

          <div className="nav-buttons-in-team-card">
            {["Squad", "Transfers", "Loans", "Contracts"].map(label => (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                className={activeTab === label ? "active-tab" : ""}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tab-section">
        <div className="tab-content">
          {loadingTab ? (
            <p>Loading {activeTab.toLowerCase()}...</p>
          ) : tabData.length === 0 ? (
            <p className="empty-favourites">No {activeTab.toLowerCase()} data available.</p>
          ) : (
            <table className="transfers-table">
              <thead>
                {activeTab === "Squad" && (
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Age</th>
                    <th>Nationality</th>
                    <th>Value</th>
                  </tr>
                )}
                {activeTab === "Transfers" && (
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Price</th>
                    <th>Start</th>
                    <th>End</th>
                  </tr>
                )}
                {activeTab === "Contracts" && (
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Type</th>
                    <th>Start</th>
                    <th>End</th>
                  </tr>
                )}
                {activeTab === "Loans" && (
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Price</th>
                    <th>Start</th>
                    <th>End</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {activeTab === "Squad" &&
                  tabData.map((player, index) => (
                    <tr key={player.player_id || index}>
                      <td>{index + 1}</td>
                      <td>{player.name} {player.surname}
                        {countryNameToCode[player.nationality] ? (
                          <img
                            className="team-detail-flag"
                            src={`https://flagcdn.com/w20/${countryNameToCode[player.nationality]}.png`}
                            alt={player.nationality}
                            title={player.nationality}
                          />
                        ) : (
                          <span className="team-detail-flag-fallback">🌍</span>
                        )}
                      </td>
                      <td>{player.position}</td>
                      <td>{player.date_of_birth ? getAge(player.date_of_birth) : "N/A"}</td>
                      <td>{player.nationality}</td>
                      <td>€{formatValue(player.value)}</td>
                    </tr>
                  ))}

                {activeTab === "Transfers" &&
                  tabData.map((item, index) => (
                    <tr key={item.contract_id || index}>
                      <td>{index + 1}</td>
                      <td>{item.player_name} {item.player_surname}
                        {countryNameToCode[item.player_nationality] ? (
                          <img
                            className="team-detail-flag"
                            src={`https://flagcdn.com/w20/${countryNameToCode[item.player_nationality]}.png`}
                            alt={item.player_nationality}
                            title={item.player_nationality}
                          />
                        ) : (
                          <span className="team-detail-flag-fallback">🌍</span>
                        )}
                      </td>
                      <td className={item.team_from === Number(teamId) ? "golden-team" : ""}>
                        {item.team_from_name}
                      </td>
                      <td className={item.team_to === Number(teamId) ? "golden-team" : ""}>
                        {item.team_to_name}
                      </td>
                      <td>€{formatValue(item.price || 0)}</td>
                      <td>{formatDate(item.start_date)}</td>
                      <td>{formatDate(item.end_date)}</td>
                    </tr>
                  ))}

                {activeTab === "Contracts" &&
                  tabData.map((item, index) => (
                    <tr key={item.contract_id || index}>
                      <td>{index + 1}</td>
                      <td>{item.player_name} {item.player_surname}
                        {countryNameToCode[item.player_nationality] ? (
                          <img
                            className="team-detail-flag"
                            src={`https://flagcdn.com/w20/${countryNameToCode[item.player_nationality]}.png`}
                            alt={item.player_nationality}
                            title={item.player_nationality}
                          />
                        ) : (
                          <span className="team-detail-flag-fallback">🌍</span>
                        )}
                      </td>
                      <td>{item.type === "transfer" ? "Transfer" : item.type === "loan" ? "Loan" : "Contract"}</td>
                      <td>{formatDate(item.start_date)}</td>
                      <td>{formatDate(item.end_date)}</td>
                    </tr>
                  ))}

                {activeTab === "Loans" &&
                  tabData.map((item, index) => (
                    <tr key={item.contract_id || index}>
                      <td>{index + 1}</td>
                      <td>{item.player_name} {item.player_surname}
                        {countryNameToCode[item.player_nationality] ? (
                          <img
                            className="team-detail-flag"
                            src={`https://flagcdn.com/w20/${countryNameToCode[item.player_nationality]}.png`}
                            alt={item.player_nationality}
                            title={item.player_nationality}
                          />
                        ) : (
                          <span className="team-detail-flag-fallback">🌍</span>
                        )}
                      </td>
                      <td>{item.team_from_name}</td>
                      <td>{item.team_to_name}</td>
                      <td>€{item.price}</td>
                      <td>{formatDate(item.start_date)}</td>
                      <td>{formatDate(item.end_date)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;
