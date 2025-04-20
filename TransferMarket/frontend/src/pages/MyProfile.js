import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const MyProfile = () => {
  const { user, /*updateUser*/ } = useContext(AuthContext);

  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        user_id: user.user_id,
        username: user.username,
        name: user.name,
        surname: user.surname,
        email: user.email,
        date_of_birth: user.date_of_birth,
        password: user.password,
        pfp: user.pfp,
        is_admin: user.is_admin,
      });
    }
  }, [user]);

  /*
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    updateUser(profileData);
    alert("Profile updated!");
  };
  */

  if (!profileData) return <p>Loading user profile...</p>;

  return (
        <div>
            <h1>My Profile</h1>
            <p>This is the My Profile page.</p>
            <h2>Profile Information</h2>
            <p>Profile Picture: {user.pfp}</p>
            <p>Username: {user.username}</p>
            <p>Name: {user.name}</p>
            <p>Surname: {user.surname}</p>
            <p>Email: {user.email}</p>
            <p>Date of Birth: {user.date_of_birth}</p>
        </div>
  );
};

export default MyProfile;
