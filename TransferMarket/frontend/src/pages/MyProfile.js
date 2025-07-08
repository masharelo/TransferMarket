import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import './MyProfile.css';
import formatDate from "../utils/FormatDate";

const MyProfile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [pictureChanged, setPictureChanged] = useState(false);
  const [removePfpButtonText, setRemovePfpButtonText] = useState("Remove PFP");

  useEffect(() => {
    if (user) {
      const userCopy = {
        user_id: user.user_id,
        username: user.username,
        name: user.name,
        surname: user.surname,
        email: user.email,
        date_of_birth: user.date_of_birth,
        password: user.password,
        pfp: user.pfp,
        is_admin: user.is_admin,
      };
      setProfileData(userCopy);
      setFormData(userCopy);
    }
  }, [user]);

  if (!profileData) return <p className="loading">Loading your profile...</p>;

  const handleEditToggle = () => {
    setEditing(!editing);
    setError("");
    if (!editing) {
      setPictureChanged(false);
      setRemovePfpButtonText("Remove PFP");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPictureChanged(true);
    }
  };

  const handleRemovePfp = () => {
    setProfilePicture(null);
    setPictureChanged(true);
    setRemovePfpButtonText("Removed");
  };

  const handleSave = async () => {
    setError("");
    const formDataWithFile = new FormData();

    Object.keys(formData).forEach((key) => {
      formDataWithFile.append(key, formData[key]);
    });

    if (profilePicture) {
      formDataWithFile.append("pfp", profilePicture);
      formDataWithFile.append("removePfp", "false");
    } else if (pictureChanged) {
      formDataWithFile.append("removePfp", "true");
    }

    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/${user.user_id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formDataWithFile,
      });

      if (res.status === 409) {
        const msg = await res.json();
        setError(msg.error || "Username or email already exists");
        return;
      }

      if (!res.ok) throw new Error("Update failed");

      const updatedUser = await res.json();
      updateUser(updatedUser);
      setProfileData(updatedUser);
      setEditing(false);
      setPictureChanged(false);
      setRemovePfpButtonText("Remove PFP");
    } catch (err) {
      console.error(err);
      setError("An error occurred while updating your profile.");
    }
  };


  const isRemovePfpButtonDisabled = !profileData.pfp;

  return (
    <div className="profile-container">
      <h1 className="profile-title">🗝️ My Profile</h1>
      <div className="profile-card">
        <div className="pfp-container">
          {editing ? (
            <img
              src={`http://localhost:5000/uploads/users/${profileData.pfp || 'basic.jpeg'}`}
              alt="PFP"
              className="profile-pic"
              onClick={() => document.getElementById('file-input').click()}
              style={{ cursor: 'pointer' }}
            />
          ) : (
            <img
              src={`http://localhost:5000/uploads/users/${profileData.pfp || 'basic.jpeg'}`}
              alt="PFP"
              className="profile-pic"
            />
          )}
          {editing && (
            <>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              /> <br/>
              <button
                className="remove-pfp-button"
                onClick={handleRemovePfp}
                disabled={isRemovePfpButtonDisabled}
              >
                {removePfpButtonText}
              </button>
            </>
          )}
        </div>
        <div className="profile-details">
          <p><strong>Username: </strong>
            {editing ? (
              <input
                className="editing-input"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            ) : profileData.username}
          </p>
          <p><strong>Name: </strong>
            {editing ? (
              <input
                className="editing-input"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            ) : profileData.name}
          </p>
          <p><strong>Surname: </strong>
            {editing ? (
              <input
                className="editing-input"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                required
              />
            ) : profileData.surname}
          </p>
          <p><strong>Email: </strong>
            {editing ? (
              <input
                className="editing-input"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            ) : profileData.email}
          </p>
          <p><strong>Date of Birth: </strong> {formatDate(profileData.date_of_birth)}</p>
          {error && <p className="error">{error}</p>}
        </div>
        <div className="edit-info-buttons">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={!formData.username || !formData.name || !formData.surname || !formData.email} className="save-userinfo-button">Save</button>
              <button onClick={handleEditToggle}>Cancel</button>
            </>
          ) : (
            <button onClick={handleEditToggle}>Change Profile Info</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
