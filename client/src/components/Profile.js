import React, { useEffect, useRef, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Row from "react-bootstrap/Row";
import Avatar from "react-avatar";
import { useUser } from "../contexts/UserContext";
import axios from "../axios";
import ListingCard from "./ListingCard";
import "../styles/Profile.css";

export default function Profile() {
  const { currentUser, setCurrentUser } = useUser();
  const [myBids, setMyBids] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const imagePicker = useRef(null);

  async function uploadProfilePicture(event) {
    try {
      const formData = new FormData();
      formData.append("image", event.target.files[0]);
      const res = await axios.put("/api/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setCurrentUser({ ...currentUser, picture: res.data.message });
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    async function getProfileInfo() {
      try {
        const bidRes = await axios.get(`/api/bids/user/${currentUser.id}`, {
          withCredentials: true,
        });
        setMyBids(bidRes.data.bids);
        console.log(bidRes);
        const listingRes = await axios.get(`/api/listing/user`, {
          withCredentials: true,
        });
        setMyListings(listingRes.data.listings);
      } catch (error) {
        console.error(error);
      }
    }
    getProfileInfo();
  }, [currentUser]);

  return (
    <Container className="mt-5 profile-container">
      <Row>
        <Col sm={3}>
          <Container>
            <Row>
              <Avatar
                onClick={() => imagePicker.current.click()}
                size="200px"
                style={{
                  border: "1px solid lightgrey",
                  cursor: "pointer",
                  padding: 0,
                }}
                round={true}
                name={currentUser.email}
                src={`https://cz2006-bucket.s3.ap-southeast-1.amazonaws.com/${currentUser.picture}`}
              />
              <input
                type="file"
                ref={imagePicker}
                style={{ display: "none" }}
                onChange={(e) => uploadProfilePicture(e)}
              />
            </Row>
            <h5 className="mt-3">@{currentUser.email.split("@")[0]}</h5>
          </Container>
        </Col>
        <Col className="tabs-container">
          <Tabs defaultActiveKey="listings">
            <Tab eventKey="listings" title="Listings" tabClassName="mytabs">
              <Container className="mt-3 p-0">
                {myListings.length === 0 && (
                  <div className="text-center">No listings found.</div>
                )}
                {myListings.map((listing, idx) => (
                  <ListingCard {...listing} key={idx} />
                ))}
              </Container>
            </Tab>
            <Tab eventKey="bids" title="Bids" tabClassName="mytabs">
              <Container className="mt-3 p-0">
                {myBids.length === 0 && (
                  <div className="text-center">No bids found.</div>
                )}
                {myBids.map((bid, idx) => (
                  <ListingCard
                    bidDate={bid.date}
                    bidAmt={bid.amount}
                    bidStatus={bid.status}
                    {...bid.listing}
                    key={idx}
                  />
                ))}
              </Container>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}
