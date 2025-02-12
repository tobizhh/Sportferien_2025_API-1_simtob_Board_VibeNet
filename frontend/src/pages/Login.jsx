'use client';

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from './Login.module.css';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { 
        email: email.trim(), 
        password: password.trim() 
      }, {
        headers: { "Content-Type": "application/json" }
      });
      
      if (res.data.requireTwoFactor) {
        setShowTwoFactor(true);
      } else {
        localStorage.setItem("token", res.data.token);
        navigate("/chat/firstServer/general");
      }
    } catch (err) {
      console.error("Fehler beim Login", err.response ? err.response.data : err.message);
    }
  };

  const handleTwoFactor = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/two-factor", { 
        email: email.trim(), 
        twoFactorCode: twoFactorCode.trim() 
      }, {
        headers: { "Content-Type": "application/json" }
      });
      
      localStorage.setItem("token", res.data.token);
      navigate("/chat/firstServer/general");
    } catch (err) {
      console.error("Fehler bei der Zwei-Faktor-Authentifizierung", err.response ? err.response.data : err.message);
    }
  };

  return (
    <div className={styles.container}>
      {!showTwoFactor ? (
        <form onSubmit={handleLogin} className={styles.form}>
          <h2 className={styles.title}>Login</h2>
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
          <button type="submit" className={styles.button}>Login</button>
        </form>
      ) : (
        <form onSubmit={handleTwoFactor} className={styles.form}>
          <h2 className={styles.title}>Zwei-Faktor-Authentifizierung</h2>
          <input 
            type="text" 
            value={twoFactorCode} 
            onChange={(e) => setTwoFactorCode(e.target.value)} 
            placeholder="Zwei-Faktor-Code"
            className={styles.input}
          />
          <button type="submit" className={styles.button}>Bestätigen</button>
        </form>
      )}
    </div>
  );
}

export default Login;
