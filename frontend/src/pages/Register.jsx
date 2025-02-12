'use client';

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from './Register.module.css';

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", { 
        username, 
        email, 
        password,
        enableTwoFactor
      });
      navigate("/login");
    } catch (err) {
      console.error("Fehler beim Registrieren", err);
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
        />
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email"
          className={styles.input}
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password"
          className={styles.input}
        />
        <label className={styles.checkboxLabel}>
          <input 
            type="checkbox" 
            checked={enableTwoFactor} 
            onChange={(e) => setEnableTwoFactor(e.target.checked)} 
          />
          Zwei-Faktor-Authentifizierung aktivieren
        </label>
        <button type="submit" className={styles.button}>Registrieren</button>
      </form>
    </div>
  );
}

export default Register;
