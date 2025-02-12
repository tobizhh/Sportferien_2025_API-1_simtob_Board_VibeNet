
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import UserList from "./pages/UserList";
import styles from './App.module.css';

function App() {
  return (
    <Router>
      <div className={styles.app}>
        <Sidebar />
        <div className={styles.content}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chat/:serverId/:channelId" element={<Chat />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </div>
        <UserList />
      </div>
    </Router>
  );
}

export default App;
