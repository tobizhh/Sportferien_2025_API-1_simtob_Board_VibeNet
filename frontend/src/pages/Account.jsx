'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Account.module.css';

function Account() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        setUsername(res.data.username);
        setEmail(res.data.email);
        setTwoFactorEnabled(res.data.twoFactorEnabled);
      } catch (err) {
        console.error("Fehler beim Laden der Benutzerdaten:", err);
      }
    };
    fetchUserData();
  }, []);

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/users/username", { username }, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      alert("Benutzername erfolgreich geändert");
    } catch (err) {
      console.error("Fehler beim Ändern des Benutzernamens:", err);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/users/profile-picture", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });
      setProfilePicture(URL.createObjectURL(file));
      alert("Profilbild erfolgreich geändert");
    } catch (err) {
      console.error("Fehler beim Ändern des Profilbilds:", err);
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/users/toggle-2fa", {}, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      setTwoFactorEnabled(!twoFactorEnabled);
      alert(twoFactorEnabled ? "2FA deaktiviert" : "2FA aktiviert");
    } catch (err) {
      console.error("Fehler beim Umschalten von 2FA:", err);
    }
  };

  return (
    <div className={styles.accountContainer}>
      <h2>Konto Einstellungen</h2>
      <div className={styles.profilePicture}>
        <img src={profilePicture || '/default-profile.png'} alt="Profile" />
        <input type="file" onChange={handleProfilePictureChange} accept="image/*" />
      </div>
      <form onSubmit={handleUsernameChange}>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Neuer Benutzername"
        />
        <button type="submit">Benutzername ändern</button>
      </form>
      <p>Email: {email}</p>
      <div className={styles.twoFactor}>
        <label>
          <input 
            type="checkbox" 
            checked={twoFactorEnabled} 
            onChange={handleTwoFactorToggle} 
          />
          Zwei-Faktor-Authentifizierung aktivieren
        </label>
      </div>
    </div>
  );
}

export default Account;
