'use client';

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from './Register.module.css';

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enableTwoFactor, setEnableTwoFactor] = useState(false); // 2FA Zustand
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", { 
        username: username.trim(), 
        email: email.trim(), 
        password: password.trim(),
        enableTwoFactor: enableTwoFactor // 2FA Wert wird korrekt gesendet
      });

      alert("Registrierung erfolgreich!");
      navigate("/login");
    } catch (err) {
      console.error("Fehler beim Registrieren", err);
      if (err.response && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Registrierung fehlgeschlagen. Bitte versuche es erneut.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleRegister} className={styles.form}>
        <h2 className={styles.title}>Registrieren</h2>
        
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username"
          className={styles.input}
          required
        />

        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email"
          className={styles.input}
          required
        />

        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password"
          className={styles.input}
          required
        />

        {/* 2FA Checkbox */}
        <div className={styles.checkboxContainer}>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              className={styles.customCheckbox} 
              checked={enableTwoFactor} // Bindet den Zustand
              onChange={(e) => setEnableTwoFactor(e.target.checked)} // Aktualisiert den Zustand
            />
            Zwei-Faktor-Authentifizierung aktivieren
          </label>
        </div>

        <button type="submit" className={styles.button}>Registrieren</button>
      </form>
    </div>
  );
}

export default Register;
