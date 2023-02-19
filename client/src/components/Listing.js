import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../axios";
import Image from "react-bootstrap/Image";
import "../styles/Listing.css";
import { useUser } from "../contexts/UserContext";
import { publicKey } from "../chatEngine";
import Form from "react-bootstrap/Form";
import { useForm } from "react-hook-form";
import BidModal from "./BidModal";
import Spinner from "react-bootstrap/Spinner";
import { getRecommendation } from "../utils";
import { ReactComponent as Logo } from "../assets/rentsg.svg";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

export async function createDirectChat(currentUser, users) {
  const creds = {
    "Public-Key": publicKey,
    "User-Name": currentUser.email,
    "User-Secret": currentUser.password,
    "Content-Type": "application/json",
  };
  const res = await fetch("https://api.chatengine.io/chats/", {
    method: "PUT",
    body: JSON.stringify({
      is_direct_chat: true,
      usernames: users,
    }),
    headers: creds,
  });
  const data = await res.json();
  return data.id;
}

export default function Listing() {
  const { listingId } = useParams();
  const [listingData, setListingData] = useState();
  const [images, setImages] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [listingBids, setListingBids] = useState([]);
  const [topBid, setTopBid] = useState({});
  const [myBid, setMyBid] = useState({});
  const [highestBid, setHighestBid] = useState();
  const [loading, setLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm();
  const [openBidModal, setOpenBidModal] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [showAcceptBidSuccess, setShowAcceptBidSuccess] = useState(false);
  const [showRejectBidSuccess, setShowRejectBidSuccess] = useState(false);
  const [rec, setRec] = useState();

  useEffect(() => {
    async function getListingData() {
      try {
        setLoading(true);
        const res = await axios.get(`/api/listing/${listingId}`);
        const highestBidRes = await axios.get(
          `/api/bids/listing/${listingId}/highest`
        );
        setHighestBid(highestBidRes.data?.highest?.amount);
        //get bidding data if user is the lister
        if (res.data?.listing.seller.email === currentUser?.email) {
          const bids = await axios.get(`/api/bids/listing/${listingId}`, {
            withCredentials: true,
          });
          const filteredBids = bids.data.bids.filter(
            (bid) => bid.status !== "rejected"
          );
          setFilteredBids(filteredBids);
          if (filteredBids.length > 0) {
            setTopBid(filteredBids[0]);
          }
          if (filteredBids.length > 1) {
            setListingBids(filteredBids.slice(1, filteredBids.length));
          }
          const bidControls = {};
          bids.data.bids.forEach((_, idx) => (bidControls[idx] = false));
          setOpenBidModal(bidControls);
        } else if (currentUser) {
          //get own bid if not lister
          const bidRes = await axios.get(`/api/bids/listing/${listingId}`, {
            withCredentials: true,
          });
          setMyBid(bidRes.data?.bid);
          setValue("amount", bidRes.data?.bid?.amount);
        }
        setImages(res.data.listing.images);
        setListingData(res.data.listing);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
    getListingData();
  }, [listingId, currentUser, setValue]);

  async function placeBid(data) {
    try {
      setBidLoading(true);
      await axios.post(`/api/bids/listing/${listingId}`, data, {
        withCredentials: true,
      });
      setMyBid(data);
      setShowAlert(true);
    } catch (error) {
      console.error(error);
    }
    setBidLoading(false);
  }

  const updateBidStatus = async (id, status) => {
    try {
      await axios.put(
        `/api/bids/${id}`,
        { status: status },
        { withCredentials: true }
      );
      if (status === "rejected") {
        const updated = filteredBids.filter((bid) => bid.id !== id);
        setFilteredBids(updated);
        console.log(updated);
        if (updated.length > 0) {
          setTopBid(updated[0]);
        }
        if (updated.length > 1) {
          setListingBids(updated.slice(1, updated.length));
        }
        setShowRejectBidSuccess(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  async function closeListing() {
    setListingData({ ...listingData, status: "closed" });
    setShowAcceptBidSuccess(true);
  }

  const roomRef = {
    1: "1-ROOM",
    2: "2-ROOM",
    3: "3-ROOM",
    4: "4-ROOM",
    5: "5-ROOM",
    EXECUTIVE: "EXECUTIVE",
  };

  async function getRecommendation(location, room) {
    console.log("ROOM IS", room);
    const parsedLocation = location.toUpperCase();
    const parsedRoom = roomRef[room];
    const finalData = {
      town: parsedLocation,
      flat_type: parsedRoom,
    };
    console.log(finalData);
    try {
      const res = await axios.post("/api/model", finalData, {
        withCredentials: true,
      });
      var value = 999;
      value = parseFloat(res["data"]["listing"]["pred"]);
      console.log(value);
      setRec(value);
      return value;
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="w-100 h-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }
  return (
    <Container
      className="pb-5"
      getRecommendation={getRecommendation(
        listingData.location,
        listingData.numRooms
      )}
    >
      <ToastContainer position="bottom-center">
        <Toast
          onClose={() => setShowAlert(false)}
          bg="success"
          delay={3000}
          autohide
          show={showAlert}
        >
          <Toast.Header>
            <h6 className="me-auto text-black text-center">
              Successfully placed bid!
            </h6>
          </Toast.Header>
        </Toast>
      </ToastContainer>
      <ToastContainer position="bottom-center">
        <Toast
          onClose={() => setShowAcceptBidSuccess(false)}
          bg="success"
          delay={5000}
          autohide
          show={showAcceptBidSuccess}
        >
          <Toast.Header>
            <h6 className="me-auto text-black text-center">
              Congratulations! Your listing is marked as sold.
            </h6>
          </Toast.Header>
        </Toast>
      </ToastContainer>
      <ToastContainer position="bottom-center">
        <Toast
          onClose={() => setShowRejectBidSuccess(false)}
          bg="success"
          delay={5000}
          autohide
          show={showRejectBidSuccess}
        >
          <Toast.Header>
            <h6 className="me-auto text-black text-center">
              You have rejected this bid.
            </h6>
          </Toast.Header>
        </Toast>
      </ToastContainer>
      <Row className="mt-3">
        <h3>{listingData.title}</h3>
      </Row>
      <Row>
        <p>{listingData.location}</p>
      </Row>
      <Row className="mt-3">
        <Container>
          <div className="photo-grid">
            {images.map((image, idx) => (
              <div key={image.id} className="shadow-sm photo-card">
                <Image
                  rounded
                  src={`https://cz2006-bucket.s3.ap-southeast-1.amazonaws.com/${image.file_name}`}
                />
              </div>
            ))}
          </div>
        </Container>
      </Row>
      <Row className="mt-3">
        <Col sm={8}>
          <Row>
            <Col>
              <h4>Description</h4>
              <p>{listingData.description}</p>
            </Col>
            <Col className="d-flex align-items-end flex-column">
              <h4>${listingData.price} SGD/mo</h4>
              <div className="text-secondary bg-primary rounded p-2">
                <Logo style={{ width: "80px" }} />
                <span className="fw-bold ps-2">Recommended</span>
                <h5 className="text-end mt-2">${rec} SGD/mo</h5>
              </div>
              {
                <div className="text-white bg-secondary rounded p-2 mt-3">
                  <span className="ps-2">Highest Bid Now</span>
                  <h6 className="text-end mt-2">
                    {highestBid ? `${highestBid} SGD/mo` : "None"}
                  </h6>
                </div>
              }
            </Col>
          </Row>
        </Col>
        <Col>
          <Card className="bid-box">
            {listingData.status === "closed" ? (
              <Card.Body>
                <p>{listingData.seller.email}</p>
                <Button className="w-100" disabled>
                  Sold
                </Button>
              </Card.Body>
            ) : currentUser &&
              currentUser.email === listingData?.seller.email ? (
              <Card.Body>
                <p>Top Bidder</p>
                {topBid && Object.keys(topBid).length > 0 && (
                  <div>
                    <BidModal
                      id={topBid.id}
                      idx={0}
                      open={openBidModal}
                      setOpenBidModal={setOpenBidModal}
                      bidder={topBid.bidder.email}
                      amount={topBid.amount}
                      closeListing={closeListing}
                      updateBidStatus={updateBidStatus}
                    />
                    <div
                      type="button"
                      onClick={() => {
                        setOpenBidModal({ ...openBidModal, 0: true });
                      }}
                    >
                      <p
                        className={`${
                          topBid.status === "rejected" ? "text-danger" : ""
                        }`}
                      >
                        {topBid.bidder.email.split("@")[0]} placed $
                        {topBid.amount}
                      </p>
                    </div>
                  </div>
                )}
                <hr />
                <div className="bid-list">
                  {listingBids.map((bid, idx) => (
                    <div key={idx}>
                      <BidModal
                        id={bid.id}
                        idx={idx + 1}
                        open={openBidModal}
                        setOpenBidModal={setOpenBidModal}
                        bidder={bid.bidder.email}
                        amount={bid.amount}
                        closeListing={closeListing}
                        updateBidStatus={updateBidStatus}
                      />
                      <div
                        type="button"
                        onClick={() => {
                          setOpenBidModal({ ...openBidModal, [idx + 1]: true });
                        }}
                      >
                        <p>
                          {bid.bidder.email.split("@")[0]} placed ${bid.amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            ) : (
              <Card.Body>
                <p>{listingData.seller.email}</p>
                <Button
                  className="w-100 mb-2"
                  variant="secondary"
                  onClick={async () => {
                    const chatId = await createDirectChat(currentUser, [
                      listingData.seller.email,
                    ]);
                    navigate(`/chat/${chatId}`);
                  }}
                  disabled={!currentUser}
                >
                  {currentUser ? "Chat now" : "Login to chat"}
                </Button>
                <Form onSubmit={handleSubmit(placeBid)}>
                  <Form.Control
                    {...register("amount")}
                    name="amount"
                    type="number"
                    disabled={myBid.amount}
                    placeholder="Enter a bid eg. 1000"
                  />
                  <Button
                    disabled={!currentUser || myBid.amount}
                    className="w-100 mt-2"
                    type="submit"
                  >
                    {bidLoading && (
                      <Spinner
                        variant="secondary"
                        as="span"
                        size="sm"
                        animation="border"
                        role="status"
                      />
                    )}{" "}
                    {currentUser ? "Place Bid" : "Login to Bid"}
                  </Button>
                </Form>
              </Card.Body>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
