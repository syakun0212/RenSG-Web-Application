import axios from "../axios";
import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import { useSearchParams } from "react-router-dom";
import ListingCard from "./ListingCard";
import Row from "react-bootstrap/Row";
import "../styles/Dashboard.css";
import Map from "./Map";
import DoubleSlider from "./DoubleSlider";
import Dropdown from "react-bootstrap/Dropdown";

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    async function getListings() {
      const res = await axios.get("/api/listing?" + searchParams);
      setListings(
        res.data.listings.filter((listing) => listing.status !== "closed")
      );
      console.log(res);
    }
    getListings();
  }, [searchParams]);

  return (
    <Container fluid className="dashboard">
      <Row className="filter-bar">
        <Dropdown show={openDropdown}>
          <Dropdown.Toggle
            onClick={() => setOpenDropdown(!openDropdown)}
            className="toggle"
          >
            Price
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <DoubleSlider
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              min={100}
              max={3000}
              setOpenDropdown={setOpenDropdown}
            />
          </Dropdown.Menu>
        </Dropdown>
      </Row>
      <Row className="dashboard-main">
        <Col sm={7} className="list">
          {listings.length === 0 && (
            <div className="text-center">No listings found.</div>
          )}
          {listings.map((listing, idx) => (
            <ListingCard {...listing} key={idx} />
          ))}
        </Col>
        <Col className="p-0">
          <Map listings={listings} />
        </Col>
      </Row>
    </Container>
  );
}
