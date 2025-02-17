"use client"

import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import styles from "./Chat.module.css"

function Chat() {
  const { channelId } = useParams()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get(`http://localhost:5000/api/messages/${channelId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMessages(res.data)
      } catch (err) {
        console.error("Error fetching messages:", err)
      }
    }

    if (channelId) {
      fetchMessages()
    }
  }, [channelId])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const token = localStorage.getItem("token")
      const res = await axios.post(
        "http://localhost:5000/api/messages",
        { content: newMessage, channel: channelId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      setMessages((prevMessages) => [...prevMessages, res.data.messageData])
      setNewMessage("")
    } catch (err) {
      console.error("Error sending message:", err)
    }
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatContent}>
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
  )
}

export default Chat
