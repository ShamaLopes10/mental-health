// src/components/Chatbot/Chatbot.js
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FaPaperPlane } from "react-icons/fa";
import bgImg from '../assets/img/bg.jpg';
import { useAuth } from "../contexts/authContext";

const PageWrapper = styled.div`
  width: 100%;
  height: 90vh;
  background: url(${bgImg}) center/cover no-repeat;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const ChatWrapper = styled.div`
  width: 100%;
  max-width: 700px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(0,0,0,0.2);
  background: rgba(255, 255, 255, 0.85); // light overlay so text is readable
  font-family: "Helvetica", sans-serif;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Message = styled.div`
  max-width: 80%;
  align-self: ${props => (props.isUser ? "flex-end" : "flex-start")};
  background: ${props => (props.isUser ? "#852575ff" : "#fff")};
  color: ${props => (props.isUser ? "#fff" : "#000")};
  padding: 12px 16px;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  word-wrap: break-word;
`;

const InputContainer = styled.form`
  display: flex;
  padding: 12px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: 20px;
  border: 1px solid #ccc;
  outline: none;
  font-size: 16px;
`;

const SendButton = styled.button`
  margin-left: 8px;
  padding: 0 16px;
  border: none;
  border-radius: 50%;
  background-color: #ab0a98ff;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #9f2795ff;
  }
`;

const Chatbot = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const greetedKey = `greeted_${user?.id}`;
  const hasBeenGreeted = localStorage.getItem(greetedKey);

  const [messages, setMessages] = useState(() => {
    if (!userId) return [];
    const saved = localStorage.getItem(`chatMessages_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(`chatMessages_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  useEffect(() => {
    if (user && !hasBeenGreeted) {
      const welcomeMessage = {
        text: `Hi ${user.username}! How are you feeling today? 😊`,
        isUser: false,
      };
      setMessages((prev) => [...prev, welcomeMessage]);
      localStorage.setItem(greetedKey, "true");
    }
  }, [user]);

  if (!userId) {
    return <p>Please log in to access the chatbot.</p>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);

    const sse = new EventSource(
      `http://localhost:5000/chat_stream?user_id=${userId}&message=${encodeURIComponent(input)}`
    );

    let botMessage = { text: "", isUser: false };
    setMessages((prev) => [...prev, botMessage]);

    sse.onmessage = (event) => {
      if (event.data === "[DONE]") {
        sse.close();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = botMessage;
          return updated;
        });
      } else {
        botMessage.text += (botMessage.text ? " " : "") + event.data;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...botMessage };
          return updated;
        });
      }
    };

    sse.onerror = () => {
      sse.close();
      botMessage.text = "Oops! Something went wrong.";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = botMessage;
        return updated;
      });
    };

    setInput("");
  };

  return (
    <PageWrapper>
      <ChatWrapper>
        <MessagesContainer>
          {messages.map((msg, idx) => (
            <Message key={idx} isUser={msg.isUser}>
              {msg.text}
            </Message>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>
        <InputContainer onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <SendButton type="submit">
            <FaPaperPlane />
          </SendButton>
        </InputContainer>
      </ChatWrapper>
    </PageWrapper>
  );
};

export default Chatbot;
