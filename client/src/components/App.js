import React from "react";
import Home from "./Home";
import Header from "./Header";
import "../styles/App.css";
import { UserProvider } from "../contexts/UserContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NewListing from "./NewListing";
import Listing from "./Listing";
import Chat from "./Chat";
import { ChatEngineWrapper } from "react-chat-engine";
import Dashboard from "./Dashboard";
import VerifyEmail from "./VerifyEmail";
import RequireAuth from "./RequireAuth";
import Profile from "./Profile";

export default function App() {
  return (
    <UserProvider>
      <ChatEngineWrapper>
        <div className="App">
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/confirm-email" element={<VerifyEmail />} />
              <Route path="/confirm-email/:token" element={<VerifyEmail />} />
              <Route path="/" element={<Home />} />
              <Route path="/listing" element={<Dashboard />} />
              <Route path="/listing/:listingId" element={<Listing />} />
              <Route element={<RequireAuth />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-listing" element={<NewListing />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:chatId" element={<Chat />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      </ChatEngineWrapper>
    </UserProvider>
  );
}
