'use client';

import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from './Chat.module.css';

function Chat() {
  const { serverId, channelId } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${channelId}`);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Fehler beim Laden der Nachrichten:", err.response ? err.response.data : err.message);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [channelId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
  
    try {
      const token = localStorage.getItem("token");
  
      const res = await axios.post(
        "http://localhost:5000/api/messages",
        { content: message, channel: channelId },
        {
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
  
      setMessages((prevMessages) => [...prevMessages, res.data.messageData]);
      setMessage("");
  
    } catch (err) {
      console.error("Fehler beim Senden der Nachricht:", err.response ? err.response.data : err.message);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageList}>
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className={styles.message}>
              <span className={styles.author}>{msg.author?.username || "Unbekannt"}:</span>
              <span className={styles.content}>{msg.content}</span>
            </div>
          ))
        ) : (
          <p className={styles.noMessages}>Keine Nachrichten vorhanden.</p>
        )}
      </div>
      <form onSubmit={sendMessage} className={styles.messageForm}>
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Nachricht eingeben..." 
          className={styles.messageInput}
        />
        <button type="submit" className={styles.sendButton}>Senden</button>
      </form>
    </div>
  );
}

export default Chat;
