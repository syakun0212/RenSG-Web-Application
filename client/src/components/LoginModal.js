import React, { useState } from "react";
import NavDropdown from "react-bootstrap/NavDropdown";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "../styles/LoginModal.css";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Container from "react-bootstrap/esm/Container";
import axios from "../axios";
import { useUser } from "../contexts/UserContext";
import { Link } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";

const loginSchema = yup
  .object({
    email: yup
      .string()
      .email("Email is invalid")
      .required("Email must not be empty"),
    password: yup.string().required("Password cannot be empty"),
  })
  .required();

const signupSchema = yup
  .object({
    email: yup
      .string()
      .email("Email is invalid")
      .required("Email must not be empty"), //ntu domain exists at the endof string
    password: yup
      .string()
      .required("Password cannot be empty.")
      .min(8, "Password must be at least 8 characters"),
    passwordConfirm: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match."),
  })
  .required();

export default function LoginModal({ setShowToast }) {
  const [show, setShow] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { setCurrentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const {
    handleSubmit: handleSignupSubmit,
    control: signupControl,
    formState: { errors: signupErrors },
    setError: setSignupError,
  } = useForm({ resolver: yupResolver(signupSchema) });
  const {
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    setError: setLoginError,
    control: loginControl,
  } = useForm({ resolver: yupResolver(loginSchema) });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const signupSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post("/api/signup", data, {
        withCredentials: true,
      });
      //show verification screen
      setEmail(data.email);
      setActiveTab(2);
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message === "Email already exists") {
        setSignupError("email", {
          type: "manual",
          message: "Email already exists.",
        });
      }
    }
    setLoading(false);
  };

  const loginSubmit = async (data) => {
    try {
      const res = await axios.post("/api/login", data, {
        withCredentials: true,
      });
      setCurrentUser({
        id: data.id,
        email: data.email,
        password: res.data.password,
      });
      setShowToast(true);
    } catch (error) {
      if (error.response?.data?.message === "Email not verified") {
        setLoginError("verificationError", {
          type: "manual",
          message: "Email not yet verified. ",
        });
      } else if (
        error.response?.data?.message === "Email or Password incorrect."
      ) {
        setLoginError("password", {
          type: "manual",
          message: "Email or password is incorrect",
        });
      }
    }
  };

  return (
    <>
      <NavDropdown.Item variant="primary" onClick={handleShow}>
        Login/Signup
      </NavDropdown.Item>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <div className="tabs">
            <div
              onClick={() => setActiveTab(0)}
              className={activeTab === 0 ? "active" : ""}
            >
              Login
            </div>
            <div
              onClick={() => setActiveTab(1)}
              className={
                "ml-4 " + (activeTab === 1 || activeTab === 2 ? "active" : "")
              }
            >
              Signup
            </div>
            <div
              className={
                "indicator " + (activeTab === 0 ? null : "indicatorRight")
              }
            ></div>
          </div>
        </Modal.Header>
        <Modal.Body className="tabBody">
          <div className={"form " + (activeTab === 2 ? "activeBody" : null)}>
            <h5>An email has been sent to {email}</h5>
            <p>Please verify your account before logging in.</p>
          </div>
          <Form
            noValidate
            onSubmit={handleLoginSubmit(loginSubmit)}
            className={"form " + (activeTab === 0 ? "activeBody" : null)}
          >
            <Form.Group className="mb-3" controlId="loginEmail">
              <Form.Label>Email address</Form.Label>
              <Controller
                name="email"
                control={loginControl}
                render={({
                  field: { ref, name, onChange, onBlur },
                  fieldState: { invalid },
                }) => (
                  <Form.Control
                    isInvalid={invalid}
                    onChange={onChange}
                    onBlur={onBlur}
                    name={name}
                    ref={ref}
                    type="email"
                    placeholder="Enter email"
                  />
                )}
              />
              <p className="text-danger">{loginErrors.email?.message}</p>
            </Form.Group>

            <Form.Group className="mb-3" controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Controller
                control={loginControl}
                name="password"
                render={({
                  field: { name, ref, onChange, onBlur },
                  fieldState: { invalid },
                }) => (
                  <Form.Control
                    isInvalid={invalid}
                    onChange={onChange}
                    onBlur={onBlur}
                    name={name}
                    ref={ref}
                    type="password"
                    placeholder="Password"
                  />
                )}
              />
              <p className="text-danger">{loginErrors.password?.message}</p>
              {loginErrors.verificationError && (
                <p>
                  Email not yet verified.{" "}
                  <Link
                    onClick={() => setShow(false)}
                    className="text-underline"
                    to="/confirm-email"
                  >
                    Resend verification.
                  </Link>
                </p>
              )}
            </Form.Group>
            <Container className="p-0 d-flex justify-content-between">
              {loading && (
                <Spinner
                  variant="secondary"
                  as="span"
                  size="sm"
                  animation="border"
                  role="status"
                />
              )}{" "}
              <Button type="submit" variant="primary">
                Login
              </Button>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
            </Container>
          </Form>
          <Form
            onSubmit={handleSignupSubmit(signupSubmit)}
            className={"form " + (activeTab === 1 ? "activeBody" : null)}
          >
            <Form.Group className="mb-3" controlId="signupEmail">
              <Controller
                control={signupControl}
                name="email"
                render={({
                  field: { name, ref, onChange, onBlur },
                  fieldState: { invalid },
                }) => (
                  <Form.Control
                    onChange={onChange}
                    onBlur={onBlur}
                    isInvalid={invalid}
                    name={name}
                    ref={ref}
                    type="email"
                    placeholder="Email"
                  />
                )}
              />
              <Form.Text className="text-muted">
                We'll never share your email with anyone else.
              </Form.Text>

              <p className="text-danger">{signupErrors.email?.message}</p>
            </Form.Group>

            <Form.Group className="mb-3" controlId="signupPassword">
              <Controller
                control={signupControl}
                name="password"
                render={({
                  field: { name, ref, onChange, onBlur },
                  fieldState: { invalid },
                }) => (
                  <Form.Control
                    onBlur={onBlur}
                    onChange={onChange}
                    isInvalid={invalid}
                    name={name}
                    ref={ref}
                    type="password"
                    placeholder="Password"
                  />
                )}
              />
              <p className="text-danger">{signupErrors.password?.message}</p>
            </Form.Group>
            <Form.Group className="mb-3" controlId="signuoPasswordConfirm">
              <Controller
                control={signupControl}
                name="passwordConfirm"
                render={({
                  field: { name, ref, onChange, onBlur },
                  fieldState: { invalid },
                }) => (
                  <Form.Control
                    onBlur={onBlur}
                    onChange={onChange}
                    isInvalid={invalid}
                    name={name}
                    ref={ref}
                    type="password"
                    placeholder="Confirm Password"
                  />
                )}
              />
              <p className="text-danger">
                {signupErrors.passwordConfirm?.message}
              </p>
            </Form.Group>
            <Container className="p-0 d-flex justify-content-between">
              <Button
                variant="primary"
                onClick={handleSignupSubmit(signupSubmit)}
              >
                {loading && (
                  <Spinner
                    variant="secondary"
                    as="span"
                    size="sm"
                    animation="border"
                    role="status"
                  />
                )}{" "}
                Submit
              </Button>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
            </Container>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
