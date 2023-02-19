import axios from "../axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { useForm } from "react-hook-form";
import { useUser } from "../contexts/UserContext";
import ToastContainer from "react-bootstrap/ToastContainer";
import Toast from "react-bootstrap/Toast";
import Spinner from "react-bootstrap/esm/Spinner";

export default function VerifyEmail() {
  const { token } = useParams();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { register, handleSubmit } = useForm();
  const { setCurrentUser } = useUser();

  const submitEmail = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post("/api/confirm-email", data);
      console.log(res);
      setShowAlert(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    async function verifyEmail() {
      try {
        const res = await axios.get(`/api/confirm-email/${token}`, {
          withCredentials: true,
        });
        console.log(res);
        setCurrentUser({
          id: res.data.id,
          email: res.data.email,
          password: res.data.password,
        });
      } catch (error) {
        if (error.response?.data?.message === "Token has expired") {
          setError(true);
        }
      }
    }
    if (token) {
      verifyEmail();
    }
  }, [token, setCurrentUser]);

  return (
    <Container className="mt-5">
      <ToastContainer position="top-center">
        <Toast
          onClose={() => setShowAlert(false)}
          bg="success"
          delay={5000}
          autohide
          show={showAlert}
        >
          <Toast.Header>
            <h6 className="me-auto text-black text-center">
              Email sent! Please check your email.
            </h6>
          </Toast.Header>
        </Toast>
      </ToastContainer>
      <Card className="w-100">
        {!token ? (
          <Card.Body>
            <h3>Verify your email address</h3>
            Resend verification email
            <Form onSubmit={handleSubmit(submitEmail)}>
              <Form.Control
                {...register("email")}
                className="mt-3"
                placeholder="Email address"
              />
              <Button type="submit" className="mt-3 ms-auto d-block">
                {loading && (
                  <Spinner
                    variant="secondary"
                    as="span"
                    size="sm"
                    animation="border"
                    role="status"
                  />
                )}{" "}
                Send
              </Button>
            </Form>
          </Card.Body>
        ) : error ? (
          <Card.Body>
            <h1>Your token has expired</h1>
            Resend verification email
            <Form onSubmit={handleSubmit(submitEmail)}>
              <Form.Control
                {...register("email")}
                className="mt-3"
                placeholder="Email address"
              />
              <Button type="submit" className="mt-3 ms-auto d-block">
                {loading && (
                  <Spinner
                    variant="secondary"
                    as="span"
                    size="sm"
                    animation="border"
                    role="status"
                  />
                )}{" "}
                Send
              </Button>
            </Form>
          </Card.Body>
        ) : (
          <Card.Body>
            <h1>Email verified!</h1>
            Find your rental home <Link to="/listing">here</Link>
          </Card.Body>
        )}
      </Card>
    </Container>
  );
}
