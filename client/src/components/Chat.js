import React, { useContext, useEffect } from "react";
import { ChatEngine, ChatEngineContext } from "react-chat-engine";
import { Navigate, useParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import "../styles/Chat.css";
import MyChatCard from "./MyChatCard";

export default function Chat() {
  const { currentUser } = useUser();
  const { chatId } = useParams();
  const { setActiveChat } = useContext(ChatEngineContext);

  useEffect(() => {
    if (chatId) {
      setActiveChat(chatId);
    }
  }, [chatId, setActiveChat]);

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="chat-box">
      <ChatEngine
        height="100%"
        publicKey="8e6d367c-7b5c-4ec9-ad8c-1c361795c1fe"
        userName={currentUser.email}
        userSecret={currentUser.password}
        renderChatSettings={(chatAppState) => null}
        renderChatCard={(chat, index) => (
          <MyChatCard chat={chat} index={`${index}`} />
        )}
      />
    </div>
  );
}
