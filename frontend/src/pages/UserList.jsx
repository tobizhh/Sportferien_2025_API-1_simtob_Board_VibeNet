'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './UserList.module.css';

function UserList() {
  const [users, setUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Fehler beim Laden der Benutzer:", err);
      }
    };

    const fetchFriendRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/friends/requests", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        setFriendRequests(res.data);
      } catch (err) {
        console.error("Fehler beim Laden der Freundschaftsanfragen:", err);
      }
    };

    fetchUsers();
    fetchFriendRequests();
  }, []);

  const sendFriendRequest = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/friends/request/${userId}`, {}, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      alert("Freundschaftsanfrage gesendet");
    } catch (err) {
      console.error("Fehler beim Senden der Freundschaftsanfrage:", err);
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/friends/accept/${requestId}`, {}, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      setFriendRequests(friendRequests.filter(request => request._id !== requestId));
      alert("Freundschaftsanfrage akzeptiert");
    } catch (err) {
      console.error("Fehler beim Akzeptieren der Freundschaftsanfrage:", err);
    }
  };

  return (
    <div className={styles.userList}>
      <h3>Benutzer</h3>
      {users.map(user => (
        <div key={user._id} className={styles.userItem}>
          <span>{user.username}</span>
          <button onClick={() => sendFriendRequest(user._id)}>Freund hinzufügen</button>
        </div>
      ))}
      <h3>Freundschaftsanfragen</h3>
      {friendRequests.map(request => (
        <div key={request._id} className={styles.requestItem}>
          <span>{request.from.username}</span>
          <button onClick={() => acceptFriendRequest(request._id)}>Akzeptieren</button>
        </div>
      ))}
    </div>
  );
}

export default UserList;
