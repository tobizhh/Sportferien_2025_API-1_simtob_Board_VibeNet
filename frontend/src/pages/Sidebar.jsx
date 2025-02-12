import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Sidebar() {
  const [servers, setServers] = useState([]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await axios.get("/api/servers");
        setServers(res.data);
      } catch (err) {
        console.error("Fehler beim Laden der Server:", err);
      }
    };
    fetchServers();
  }, []);

  return (
    <div>
      {servers.map((server) => (
        <Link key={server._id} to={`/chat/${server._id}/general`}>
          {server.name}
        </Link>
      ))}
    </div>
  );
}

export default Sidebar;
