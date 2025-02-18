import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import axios from "axios";
import styles from "./Friends.module.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://vibechat-4i7uyyao7-sdfas-projects-3138fa8b.vercel.app/api";

function Friends({ userId }) {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate(); // ✅ Initialisiere die Navigation

  useEffect(() => {
    if (!userId) return;
    fetchFriends();
    fetchFriendRequests();
  }, [userId]);

  const fetchFriends = async () => {
    try {
const res = await axios.get(`https://vibechat-4i7uyyao7-sdfas-projects-3138fa8b.vercel.app/friends/${userId}`);

      setFriends(res.data.friends);
    } catch (error) {
      console.error("❌ Error fetching friends:", error.response?.data || error.message);
    }
  };

  const fetchFriendRequests = async () => {
    try {

      const res = await axios.get(`https://vibechat-4i7uyyao7-sdfas-projects-3138fa8b.vercel.app/friends/friend-requests/${userId}`);

      setFriendRequests(res.data.requests);
    } catch (error) {
      console.error("❌ Error fetching friend requests:", error.response?.data || error.message);
    }
  };

  const handleSearchUser = async () => {
    try {

      const res = await axios.get(`https://vibechat-4i7uyyao7-sdfas-projects-3138fa8b.vercel.app/users/search?username=${searchUser}`);

      setSelectedUser(res.data);
    } catch (error) {
      alert("❌ User not found");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Friends</h2>

      {/* 🔹 Neuer Zurück zum Chat Button */}
      <button onClick={() => navigate("/chat/firstServer/general")} className={styles.backButton}>
        🔙 Back to Chat
      </button>

      <h3>Friend Requests</h3>
      {friendRequests.length > 0 ? (
        <ul>
          {friendRequests.map((req) => (
            <li key={req._id}>{req.username}</li>
          ))}
        </ul>
      ) : (
        <p>No friend requests</p>
      )}

      <h3>Your Friends</h3>
      {friends.length > 0 ? (
        <ul>
          {friends.map((friend) => (
            <li key={friend._id}>{friend.username}</li>
          ))}
        </ul>
      ) : (
        <p>No friends added yet</p>
      )}

      <h3>Find User</h3>
      <input
        type="text"
        placeholder="Search username"
        value={searchUser}
        onChange={(e) => setSearchUser(e.target.value)}
      />
      <button onClick={handleSearchUser}>Search</button>

      {selectedUser && (
        <div>
          <p>Found: {selectedUser.username}</p>
          <button onClick={() => console.log("Send friend request")}>Send Friend Request</button>
        </div>
      )}
    </div>
  );
}

export default Friends;
