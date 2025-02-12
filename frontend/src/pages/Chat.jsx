import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Chat() {
  const { serverId, channelId } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${channelId}`);
        setMessages(Array.isArray(res.data) ? res.data : []); // Sicherstellen, dass es ein Array ist
      } catch (err) {
        console.error("Fehler beim Laden der Nachrichten:", err.response ? err.response.data : err.message);
        setMessages([]); // Falls Fehler, setze ein leeres Array
      }
    };

    fetchMessages();
  }, [channelId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return; // Keine leeren Nachrichten senden
  
    try {
      const token = localStorage.getItem("token"); // Token aus LocalStorage abrufen
  
      const res = await axios.post(
        "http://localhost:5000/api/messages",
        { content: message, channel: channelId },
        {
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Token senden
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
    <div>
      <h2>Chat</h2>
      <div>
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <p key={index}><b>{msg.author?.username || "Unbekannt"}:</b> {msg.content}</p>
          ))
        ) : (
          <p>Keine Nachrichten vorhanden.</p>
        )}
      </div>
      <form onSubmit={sendMessage}>
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Nachricht eingeben..." 
        />
        <button type="submit">Senden</button>
      </form>
    </div>
  );
}

export default Chat;
