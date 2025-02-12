'use client';

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from './Sidebar.module.css';

function Sidebar() {
  const [servers, setServers] = useState([]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/servers");
        setServers(res.data);
      } catch (err) {
        console.error("Fehler beim Laden der Server:", err);
      }
    };
    fetchServers();
  }, []);

  return (
    <div className={styles.sidebar}>
      <div className={styles.category}>
        <h3 className={styles.categoryTitle}>Servers</h3>
        {servers.map((server) => (
          <Link
            key={server._id}
            to={`/chat/${server._id}/general`}
            className={styles.serverLink}
          >
            <div className={styles.serverIcon}>{server.name.charAt(0)}</div>
            <span className={styles.serverName}>{server.name}</span>
          </Link>
        ))}
      </div>
      <div className={styles.category}>
        <h3 className={styles.categoryTitle}>Friends</h3>
        {/* Add friend list here when implemented */}
      </div>
    </div>
  );
}

export default Sidebar;
