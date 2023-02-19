import React from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import Carousel from "react-bootstrap/Carousel";
import Row from "react-bootstrap/esm/Row";
import "../styles/ListingCard.css";
import { useNavigate } from "react-router-dom";
import { formatTimeAgo } from "../utils";

export default function ListingCard({
  id,
  created_at,
  images,
  title,
  location,
  isRoom,
  numRooms,
  price,
  bidDate,
  bidAmt,
  bidStatus,
}) {
  const navigate = useNavigate();
  return (
    <Container>
      <Row>
        <Col>
          <Carousel variant="dark" interval={null}>
            {images.map((image) => (
              <Carousel.Item className="image-col" key={image.file_name}>
                <Image
                  rounded
                  className="thumbnail"
                  src={`https://cz2006-bucket.s3.ap-southeast-1.amazonaws.com/${image.file_name}`}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>
        <Col
          role="button"
          onClick={() => navigate({ pathname: `/listing/${id}` })}
        >
          <Row className="h-100">
            <div className="d-flex p-0">
              <h5 className="p-0 m-0">{title}</h5>
              {bidDate ? (
                <span className="ms-auto">{formatTimeAgo(bidDate)}</span>
              ) : (
                <span className="ms-auto">{formatTimeAgo(created_at)}</span>
              )}
            </div>
            <span className="p-0">{location}</span>
            <hr className="m-0" />
            <ul>
              {isRoom ? <li>Individual Rooms</li> : <li>Whole unit</li>}
              <li>{numRooms} bedrooms</li>
            </ul>
            <span className="mt-auto text-end">{price} SGD/mo</span>
            {bidAmt && (
              <div
                className={
                  "d-flex align-items-center justify-content-end text-white w-50 ms-auto rounded " +
                  (bidStatus === "approved"
                    ? "bg-success"
                    : bidStatus === "rejected"
                    ? "bg-danger"
                    : "bg-secondary")
                }
              >
                {bidAmt} SGD/mo {bidStatus}
              </div>
            )}
          </Row>
        </Col>
      </Row>
      <hr />
    </Container>
  );
}
