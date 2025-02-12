'use client';

import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from './Chat.module.css';
import { FaUser } from "react-icons/fa";
import DrawPad from '../pages/DrawPad';
import { FaImage } from "react-icons/fa6";
import { FaPencilAlt } from "react-icons/fa";




function Chat() {
  const { serverId, channelId } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [channelName, setChannelName] = useState("");
  const [showDrawPad, setShowDrawPad] = useState(false);

  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${channelId}`);
        setMessages(Array.isArray(res.data) ? res.data : []);
        // Fetch channel name
        const channelRes = await axios.get(`http://localhost:5000/api/channels/${channelId}`);
        setChannelName(channelRes.data.name);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/messages/image",
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      setMessages((prevMessages) => [...prevMessages, res.data.messageData]);
    } catch (err) {
      console.error("Fehler beim Hochladen des Bildes:", err);
    }
  };

  const handleDrawingSend = (drawingData) => {
    // Implement sending drawing data to the server
    console.log("Sending drawing:", drawingData);
    setShowDrawPad(false);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h2>{channelName}</h2>
        <Link to="/account" className={styles.accountLink}>
          <FaUser />
        </Link>
      </div>
      <div className={styles.messageList}>
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className={styles.message}>
              <span className={styles.author}>{msg.author?.username || "Unbekannt"}:</span>
              {msg.content ? (
                <span className={styles.content}>{msg.content}</span>
              ) : msg.image ? (
                <img src={msg.image || "/placeholder.svg"} alt="Uploaded content" className={styles.uploadedImage} />
              ) : null}
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
        <label className={styles.uploadLabel}>
          <FaImage />
          <input type="file" onChange={handleImageUpload} accept="image/*" style={{display: 'none'}} />
        </label>
        <button type="button" onClick={() => setShowDrawPad(true)} className={styles.drawButton}>
          <FaPencilAlt />
        </button>
        <button type="submit" className={styles.sendButton}>Senden</button>
      </form>
      {showDrawPad && (
        <DrawPad onSend={handleDrawingSend} onClose={() => setShowDrawPad(false)} />
      )}
    </div>
  );
}

export default Chat;
// Compare this snippet from frontend/src/pages/Chat.jsx:
