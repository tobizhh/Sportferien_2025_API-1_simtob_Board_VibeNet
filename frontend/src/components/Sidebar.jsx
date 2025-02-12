import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

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
    <div className="w-16 bg-gray-800 flex flex-col items-center py-4 space-y-4">
      {servers.map((server) => (
        <Link
          key={server._id}
          to={`/chat/${server._id}/general`}
          className="w-12 h-12 bg-gray-700 flex items-center justify-center rounded-full hover:bg-gray-600"
        >
          {server.name.charAt(0)}
        </Link>
      ))}
    </div>
  );
}

export default Sidebar;
