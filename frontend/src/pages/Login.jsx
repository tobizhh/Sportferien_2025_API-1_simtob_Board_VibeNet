import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { 
        email: email.trim(), 
        password: password.trim() 
      }, {
        headers: { "Content-Type": "application/json" }  // Sicherstellen, dass JSON gesendet wird
      });
      localStorage.setItem("token", res.data.token);
      navigate("/chat/firstServer/general");
    } catch (err) {
      console.error("Fehler beim Login", err.response ? err.response.data : err.message);
    }
  };
  

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
