import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5500");

function Chatbox() {
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const loginUser = () => {
    if (!username.trim()) return alert("Enter username");

    setCurrentUser(username.trim());
    socket.emit("addUser", username.trim());
  };

  useEffect(() => {
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("receiveMessage");
    };
  }, []);

  const selectUser = async (user) => {
    setSelectedUser(user.username);

    const res = await axios.get(
      `http://localhost:5500/api/messages/${currentUser}/${user.username}`,
    );

    setMessages(res.data);
  };

  const sendMessage = () => {
    if (!selectedUser) return alert("Select user first");
    if (!message.trim()) return alert("Write message");

    socket.emit("sendMessage", {
      sender: currentUser,
      receiver: selectedUser,
      text: message.trim(),
    });

    setMessage("");
  };

  if (!currentUser) {
    return (
      <div>
        <h2>Enter Chat</h2>

        <input
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button onClick={loginUser}>Start Chat</button>
      </div>
    );
  }

  return (
    <div>
      <h3>Logged in: {currentUser}</h3>

      <h3>Online Users</h3>

      {onlineUsers
        .filter((user) => user.username !== currentUser)
        .map((user) => (
          <button
            key={user.socketId}
            onClick={() => selectUser(user)}
            style={{
              display: "block",
              margin: "5px 0",
              fontWeight: selectedUser === user.username ? "bold" : "normal",
            }}
          >
            🟢 {user.username}
          </button>
        ))}

      <h3>
        {selectedUser ? `Chat with ${selectedUser}` : "Select user to chat"}
      </h3>

      <div>
        {messages.map((msg, index) => (
          <div key={msg._id || index}>
            <b>{msg.sender}: </b>
            {msg.text}
          </div>
        ))}
      </div>

      <input
        placeholder="Type message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chatbox;
