import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const socket = io("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
      scrollToBottom();
    });

    socket.on("typing", (user) => {
      setIsTyping(user);
    });

    return () => {
      socket.off("chat message");
      socket.off("typing");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && username.trim()) {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      socket.emit("chat message", {
        user: username,
        text: message,
        time: timestamp,
      });
      setMessage("");
      socket.emit("typing", "");
    }
  };

  const handleSetUsername = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", username);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="chat-container">
        <div className="card shadow-sm">
          <div className="card-header text-center">Chat em Tempo Real</div>
          <div className="card-body">
            {!isUsernameSet ? (
              <form onSubmit={handleSetUsername}>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Digite seu nome..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <div className="input-group-append">
                    <button className="btn btn-primary" type="submit">
                      Entrar
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <>
                <ul className="list-group mb-3 chat-messages">
                  {messages.map((msg, index) => (
                    <li
                      key={index}
                      className={`list-group-item ${
                        msg.user === username ? "message-user" : "message-other"
                      }`}
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={`https://ui-avatars.com/api/?name=${msg.user}&background=random`}
                          alt={msg.user}
                          className="avatar mr-2"
                        />
                        <div>
                          <strong>{msg.user}</strong>
                          <div>{msg.text}</div>
                          <div className="text-muted small">{msg.time}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                  <div ref={messagesEndRef} />
                </ul>
                {isTyping && (
                  <div className="text-muted small">
                    {isTyping} está digitando...
                  </div>
                )}
                <form onSubmit={sendMessage}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Digite sua mensagem..."
                      value={message}
                      onChange={handleTyping}
                    />
                    <div className="input-group-append">
                      <button className="btn btn-primary" type="submit">
                        Enviar
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
