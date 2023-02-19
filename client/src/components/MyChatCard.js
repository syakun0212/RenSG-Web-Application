import React from "react";
import { ChatCard, deleteChat } from "react-chat-engine";
import Dropdown from "react-bootstrap/Dropdown";
import { BsThreeDots } from "react-icons/bs";
import { publicKey } from "../chatEngine";
import { useUser } from "../contexts/UserContext";

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <div
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    className="d-flex align-items-center ps-2"
    style={{ cursor: "pointer" }}
  >
    <BsThreeDots />
  </div>
));

export default function MyChatCard({ index, chat }) {
  const { currentUser } = useUser();
  const creds = {
    publicKey: publicKey,
    userName: currentUser.email,
    userSecret: currentUser.password,
  };
  return (
    <div className="d-flex" style={{ backgroundColor: "var(--accentlight)" }}>
      <Dropdown className="d-flex align-center">
        <Dropdown.Toggle as={CustomToggle}></Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => deleteChat(creds, chat.id)}>
            Delete
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <ChatCard key={index} chat={chat} />
    </div>
  );
}
