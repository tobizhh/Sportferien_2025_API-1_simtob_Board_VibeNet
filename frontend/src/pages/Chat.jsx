import { useParams, useNavigate } from "react-router-dom"; // 🔹 Import useNavigate
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Chat.module.css";

function Chat() {
  const { channelId } = useParams();
  const navigate = useNavigate(); // 🔹 Hook for navigation
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [channelObjectId, setChannelObjectId] = useState(null);

  useEffect(() => {
    const fetchChannelId = async () => {
      try {
        const res = await axios.get(`https://vibechat-4i7uyyao7-sdfas-projects-3138fa8b.vercel.app:1000/api/channels/name/${channelId}`);
        if (res.data._id) {
          console.log("✅ Found channel ID:", res.data._id);
          setChannelObjectId(res.data._id);
        } else {
          console.error("⚠️ Channel not found!");
        }
      } catch (error) {
        console.error("❌ Error fetching channel ID:", error);
      }
    };
  
    if (channelId.length !== 24) { 
      fetchChannelId();
    } else {
      setChannelObjectId(channelId);
    }
  }, [channelId]);
  

  useEffect(() => {
    const fetchMessages = async () => {
      if (!channelObjectId) {
        console.error("⚠️ channelObjectId is undefined!");
        return;
      }
      
      console.log(`🔍 Fetching messages for channel: ${channelObjectId}`);
      
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`https://vibechat-4i7uyyao7-sdfas-projects-3138fa8b.vercel.app/api/messages/channel/${channelObjectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Error fetching messages:", err.response?.data || err.message);
      }
    };
  
    fetchMessages();
  }, [channelObjectId]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !channelObjectId) return;

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("User ID is missing!");
        return;
      }

      const res = await axios.post(
        "https://vibechat-4i7uyyao7-sdfas-projects-3138fa8b.vercel.app/api/messages",
        { content: newMessage, channel: channelObjectId, author: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessages((prevMessages) => [...prevMessages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatContent}>
        <button className={styles.friendsButton} onClick={() => navigate("/friends")}>
          👥 Friends
        </button>
        
        <div className={styles.messageList}>
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div key={index} className={styles.message}>
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
            <button type="submit" className={styles.sendButton}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
