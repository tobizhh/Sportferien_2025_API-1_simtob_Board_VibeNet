import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import styles from "./Chat.module.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const socket = io(API_BASE_URL, { autoConnect: false });

function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // ✅ Redirect if Not Logged In
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // ✅ Fetch Messages on Load (Sorted)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const requestUrl = `${API_BASE_URL}/api/messages`;
  
        console.log("🔍 Fetching messages from:", requestUrl);
        const res = await axios.get(requestUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log("✅ Messages fetched:", res.data);
  
        // ✅ Fix: Sort messages to display oldest first
        const uniqueMessages = Array.from(new Map(res.data.map((msg) => [msg._id, msg])).values())
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
        setMessages(uniqueMessages);
      } catch (err) {
        console.error("❌ Error fetching messages:", err.response?.data || err.message);
      }
    };
  
    fetchMessages();
  }, []);
  
  
  
  
  
  
  

  // ✅ Listen for Real-Time Messages
  useEffect(() => {
    socket.connect();
  
    socket.on("receiveMessage", (message) => {
      console.log("📨 New real-time message received:", message);
  
      setMessages((prevMessages) => {
        const seenIDs = new Set(prevMessages.map((msg) => msg._id));
  
        if (seenIDs.has(message._id)) {
          console.warn("⚠️ Duplicate received from Socket.io:", message);
          return prevMessages; // ✅ Ignore duplicates
        }
  
        console.log("✅ Adding new message:", message);
        return [...prevMessages, message];
      });
    });
  
    return () => {
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, []);
  
  
  

  // ✅ Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
  
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/messages`,
        { content: newMessage },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
  
      // ✅ Fix: Only send `content` and `author` to avoid duplicate `_id` errors
      socket.emit("sendMessage", { content: res.data.content, author: res.data.author });
  
      setNewMessage("");
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  };
  
  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatContent}>
        <button className={styles.friendsButton} onClick={() => navigate("/friends/request")}>
          👥 Friends
        </button>

        <div className={styles.messageList}>
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg._id} className={styles.message}>
                <span className={styles.author}>{msg.author?.username || "Unknown"}:</span>
                <span className={styles.content}>{msg.content}</span>
              </div>
            ))
          ) : (
            <p className={styles.noMessages}>No messages yet.</p>
          )}
        </div>

        <div className={styles.inputContainer}>
          <form onSubmit={handleSendMessage} className={styles.inputForm}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className={styles.inputField}
            />
            <button type="submit" className={styles.sendButton}>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
