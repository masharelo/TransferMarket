import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import './EditTransfers.css'
import formatDate from '../../utils/FormatDate'
import formatValue from '../../utils/FormatValue'
import isRegularDate from '../../utils/IsRegularDate'

const EditTransfers = () => {
  const token = localStorage.getItem('token')

  const [mode, setMode] = useState('new')
  const [transfers, setTransfers] = useState([])
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [selected, setSelected] = useState(null)
  const [filterText, setFilterText] = useState('')
  const [formData, setFormData] = useState({
    type: 'transfer',
    player_id: '',
    team_from: '',
    team_to: '',
    start_date: '',
    end_date: '',
    price: ''
  })

  const [playerInput, setPlayerInput] = useState('')
  const [teamFromInput, setTeamFromInput] = useState('')
  const [teamToInput, setTeamToInput] = useState('')
  const [playerOptionsFiltered, setPlayerOptionsFiltered] = useState([])
  const [teamFromOptionsFiltered, setTeamFromOptionsFiltered] = useState([])
  const [teamToOptionsFiltered, setTeamToOptionsFiltered] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transfersRes, playersRes, teamsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/transfers', {
            headers: { Authorization: `Bearer ${token}` },
            params: { offset: 0, limit: 10000 }
          }),
          axios.get('http://localhost:5000/api/auth/players', {
            headers: { Authorization: `Bearer ${token}` },
            params: { offset: 0, limit: 10000 }
          }),
          axios.get('http://localhost:5000/api/auth/teams', {
            headers: { Authorization: `Bearer ${token}` },
            params: { offset: 0, limit: 10000 }
          })
        ])

        setTransfers(transfersRes.data)
        setPlayers(playersRes.data)
        setTeams(teamsRes.data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchData()
  }, [token])

  useEffect(() => {
    if (formData.type === 'contract') {
      setFormData(prev => ({ ...prev, team_to: prev.team_from }))
      setTeamToInput(teamFromInput)
    }
  }, [formData.type, formData.team_from, teamFromInput])

  const playerMap = useMemo(() => {
    const map = {}
    players.forEach(p => {
      map[p.player_id] = `${p.name} ${p.surname}`
    })
    return map
  }, [players])

  const teamMap = useMemo(() => {
    const map = {}
    teams.forEach(t => {
      map[t.team_id] = t.name
    })
    return map
  }, [teams])

  const handleInputChange = e => {
    const { name, value } = e.target
    if (name === 'price' && value < 0) {
      alert('Price cannot be negative.')
      return false
    }
    if ((formData.type === 'transfer' || formData.type === 'loan') && name === 'team_to' && value === formData.team_from) {
      alert('Team To cannot be the same as Team From for transfer or loan.')
      return
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const { type, player_id, team_from, team_to, start_date, end_date, price } = formData
    if (!type || !player_id || !team_from || !team_to || !start_date || !end_date || price === '') {
      alert('All fields must be filled. (Player, Team names must be from recommended)')
      return false
    }
    if ((type === 'transfer' || type === 'loan') && team_from === team_to) {
      alert('Team From and Team To must be different for transfer or loan.')
      return false
    }
    return validateDates()
  }

  const validateDates = () => {
    const start = new Date(formData.start_date)
    const end = formData.end_date ? new Date(formData.end_date) : null

    if (!isRegularDate(formData.start_date)) {
      alert('Invalid start date.')
      return false
    }

    if (end && isNaN(end.getTime())) {
      alert('Invalid end date.')
      return false
    }

    if (end && end < start) {
      alert('End date must be after start date.')
      return false
    }

    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await axios.post('http://localhost:5000/api/admin/add_contract', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      window.location.reload()
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdate = async e => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await axios.put(`http://localhost:5000/api/admin/contracts/${selected.contract_id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      window.location.reload()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEditClick = t => {
    setSelected(t)
    setFormData({
      type: t.type,
      player_id: t.player_id,
      team_from: t.team_from,
      team_to: t.team_to,
      start_date: t.start_date.split('T')[0],
      end_date: t.end_date ? t.end_date.split('T')[0] : '',
      price: t.price
    })
    setPlayerInput(playerMap[t.player_id] || '')
    setTeamFromInput(teamMap[t.team_from] || '')
    setTeamToInput(teamMap[t.team_to] || '')
    setMode('edit')
  }

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this record?')) return
    try {
      await axios.delete(`http://localhost:5000/api/admin/contracts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTransfers(transfers.filter(t => t.contract_id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = transfers.filter(t =>
    (playerMap[t.player_id] || '').toLowerCase().includes(filterText.toLowerCase()) ||
    t.type.toLowerCase().includes(filterText.toLowerCase())
  )

  const searchPlayers = text => {
    setPlayerOptionsFiltered(players.filter(p =>
      `${p.name} ${p.surname}`.toLowerCase().includes(text.toLowerCase())
    ))
  }

  const searchTeamsFrom = text => {
    setTeamFromOptionsFiltered(teams.filter(t =>
      t.name.toLowerCase().includes(text.toLowerCase())
    ))
  }

  const searchTeamsTo = text => {
    setTeamToOptionsFiltered(teams.filter(t =>
      t.name.toLowerCase().includes(text.toLowerCase())
    ))
  }

  const renderForm = onSubmit => (
    <form className="edit-form" onSubmit={onSubmit}>
      <select name="type" value={formData.type} onChange={handleInputChange}>
        <option value="transfer">Transfer</option>
        <option value="loan">Loan</option>
        <option value="contract">Contract</option>
      </select>

      <input
        type="text"
        placeholder="Player Name"
        value={playerInput}
        onChange={e => {
          setPlayerInput(e.target.value)
          searchPlayers(e.target.value)
        }}
        required
      />
      {playerOptionsFiltered.length > 0 && (
        <ul className="edittransfers-dropdown">
          {playerOptionsFiltered.slice(0, 3).map(p => (
            <li key={p.player_id} onClick={() => {
              setFormData(prev => ({ ...prev, player_id: p.player_id }))
              setPlayerInput(`${p.name} ${p.surname}`)
              setPlayerOptionsFiltered([])
            }}>
              {p.name} {p.surname} ({p.date_of_birth.split('T')[0]})
            </li>
          ))}
        </ul>
      )}

      <input
        type="text"
        placeholder="From Team"
        value={teamFromInput}
        onChange={e => {
          setTeamFromInput(e.target.value)
          searchTeamsFrom(e.target.value)
        }}
        style={{color:"red"}}
        required
      />
      {teamFromOptionsFiltered.length > 0 && (
        <ul className="edittransfers-dropdown">
          {teamFromOptionsFiltered.slice(0, 3).map(t => (
            <li key={t.team_id} onClick={() => {
              setFormData(prev => ({ ...prev, team_from: t.team_id }))
              setTeamFromInput(t.name)
              setTeamFromOptionsFiltered([])
            }}>
              {t.name}
            </li>
          ))}
        </ul>
      )}

      <input
        type="text"
        placeholder="To Team"
        value={teamToInput}
        onChange={e => {
          if (formData.type !== 'contract') {
            setTeamToInput(e.target.value)
            searchTeamsTo(e.target.value)
          }
        }}
        disabled={formData.type === 'contract'}
        style={{color:"green"}}
        required
      />
      {formData.type !== 'contract' && teamToOptionsFiltered.length > 0 && (
        <ul className="edittransfers-dropdown">
          {teamToOptionsFiltered.slice(0, 3).map(t => (
            <li key={t.team_id} onClick={() => {
              setFormData(prev => ({ ...prev, team_to: t.team_id }))
              setTeamToInput(t.name)
              setTeamToOptionsFiltered([])
            }}>
              {t.name}
            </li>
          ))}
        </ul>
      )}

      <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} required />
      <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} />
      <input type="number" name="price" placeholder="Price (€)" value={formData.price} onChange={handleInputChange} min="0" required />

      <div className="edit-info-buttons">
        <button type="submit">{mode === 'edit' ? 'Update' : 'Create'}</button>
      </div>
    </form>
  )

  return (
    <div className="edit-container">
      <div className="edit-sidebar">
        <button className="edit-buttons" onClick={() => {
          setMode('new')
          setSelected(null)
          setFormData({ type: 'transfer', player_id: '', team_from: '', team_to: '', start_date: '', end_date: '', price: '' })
          setPlayerInput('')
          setTeamFromInput('')
          setTeamToInput('')
        }}>New Transfer</button>

        <button className="edit-buttons" onClick={() => {
          setMode('edit_delete')
          setSelected(null)
        }}>Edit/Delete</button>
      </div>

      {mode === 'new' && renderForm(handleSubmit)}

      {mode === 'edit_delete' && (
        <div className="edit-list">
          <input
            className="edit-filter"
            type="text"
            placeholder="Filter by player or type"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />
          {filtered.length === 0 ? (
            <p className="no-info-message">No matching records.</p>
          ) : (
            <div className="edit-grid">
              {filtered.map((t, index) => (
                <div key={t.contract_id || `contract-${index}`} className="edit-card">
                  <h3>{t.type} #{t.contract_id}</h3>
                  <p>Player: {playerMap[t.player_id] || t.player_id}</p>
                  <p style={{color:"red"}}>From: {teamMap[t.team_from] || t.team_from}</p>
                  <p style={{color:"green"}}>To: {teamMap[t.team_to] || t.team_to}</p>
                  <p>Start: {formatDate(t.start_date)} <br /> End: {t.end_date ? formatDate(t.end_date) : '—'}</p>
                  <p>Price: €{formatValue(t.price)}</p>
                  <div className="edit-info-buttons">
                    <button className="editpost-action-button" onClick={() => handleEditClick(t)}>Edit</button>
                    <button className="editpost-action-button" onClick={() => handleDelete(t.contract_id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === 'edit' && selected && renderForm(handleUpdate)}
    </div>
  )
}

export default EditTransfers
