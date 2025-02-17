import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Friends from "./pages/Friends";

function App() {
  const userId = localStorage.getItem("userId");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/friends" element={userId ? <Friends userId={userId} /> : <Navigate to="/login" />} />
        <Route path="/chat/:serverId/:channelId" element={userId ? <Chat /> : <Navigate to="/login" />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
