import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import "../styles/NewListing.css";
import Button from "react-bootstrap/Button";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import Col from "react-bootstrap/Col";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "../axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import ImageUploading from "react-images-uploading";
import { AiFillDelete } from "react-icons/ai";
import { GrUpdate } from "react-icons/gr";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Select from "react-select";
import { planningAreas } from "../planningArea";
import Spinner from "react-bootstrap/Spinner";

const listingSchema = yup
  .object({
    title: yup
      .string()
      .label("Title")
      .max(100, "Maximum 100 characters allowed")
      .required(),
    postalCode: yup
      .string()
      .label("Postal Code")
      .required()
      .matches(/\d{6}/, "Invalid Singapore postal code"),
    location: yup.string().label("Location").required(),
    isRoom: yup
      .string()
      .typeError("Listing Type is a required field")
      .required()
      .matches(/(room|unit)/),
    description: yup
      .string()
      .label("Description")
      .max(500, "Maximum 500 characters allowed"),
    price: yup
      .number()
      .label("Price")
      .typeError("Please enter a valid number")
      .integer("Price must be an integer")
      .moreThan(0, "Price cannot be negative or 0")
      .required(),
    numRooms: yup
      .number()
      .typeError("Please choose one")
      .integer()
      .lessThan(6)
      .moreThan(0)
      .required(),
  })
  .required();

const locationOptions = planningAreas.map((area) => {
  return { value: area, label: area };
});
export default function NewListing() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ resolver: yupResolver(listingSchema) });
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const maxImageNumber = 5;

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    setImages(imageList);
  };

  const postListing = async (data) => {
    setLoading(true);
    data.isRoom = data.isRoom === "room" ? true : false;
    const finalData = {
      ...data,
      seller_id: currentUser.id,
    };
    try {
      const res = await axios.post("/api/listing", finalData, {
        withCredentials: true,
      });
      await uploadImages(res.data.id);
      navigate(`/listing/${res.data.id}`);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const uploadImages = async (listingId) => {
    let promises = [];
    images.forEach((image) => {
      promises.push(uploadToS3(image, listingId));
    });
    const res = await Promise.all(promises);
    console.log(res);
  };

  const uploadToS3 = async (image, listingId) => {
    const formData = new FormData();
    formData.append("image", image.file);
    formData.append("listing_id", listingId);
    const res = await axios.put("/api/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return res;
  };

  return (
    <Container className="mt-3">
      <h3>What are you listing?</h3>
      <Row sm={1} lg={2} className="g-4">
        <Col>
          <Card>
            <Card.Body>
              <ImageUploading
                inputProps={{ name: "files" }}
                multiple
                value={images}
                onChange={onChange}
                maxNumber={maxImageNumber}
                dataURLKey="data_url"
                acceptType={["jpg", "png", "jpeg"]}
              >
                {({
                  imageList,
                  onImageUpload,
                  onImageRemoveAll,
                  onImageUpdate,
                  onImageRemove,
                  isDragging,
                  dragProps,
                  errors,
                }) => (
                  // write your building UI
                  <div>
                    <div
                      className="uploadBox"
                      {...dragProps}
                      style={
                        isDragging ? { filter: "brightness(50%)" } : undefined
                      }
                    >
                      <Button onClick={onImageUpload}>
                        Click or Drop here
                      </Button>
                    </div>
                    {errors && (
                      <div className="text-danger">
                        {errors.maxNumber && (
                          <span>
                            Number of selected images exceed maximum (5)
                          </span>
                        )}
                        {errors.acceptType && (
                          <span>Your selected file type is not allowed</span>
                        )}
                      </div>
                    )}
                    <Button
                      className="mt-2"
                      variant="secondary"
                      onClick={onImageRemoveAll}
                    >
                      Remove all images
                    </Button>
                    <div className="imageGrid">
                      {imageList.map((image, index) => (
                        <div key={index} className="image-item">
                          <img src={image["data_url"]} alt="" width="100%" />
                          <div className="d-flex justify-content-between">
                            <OverlayTrigger overlay={<Tooltip>Update</Tooltip>}>
                              <Button
                                variant="light"
                                className="mt-2 p-0"
                                onClick={() => onImageUpdate(index)}
                              >
                                <GrUpdate size={"1.25em"} />
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger
                              overlay={<Tooltip>Delete image</Tooltip>}
                            >
                              <Button
                                variant="light"
                                className="mt-2 p-0"
                                onClick={() => onImageRemove(index)}
                              >
                                <AiFillDelete color="#7C0A02" size={"1.5em"} />
                              </Button>
                            </OverlayTrigger>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ImageUploading>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <form noValidate onSubmit={handleSubmit(postListing)}>
                <div className="form-group">
                  <label htmlFor="postalCode">Title</label>
                  <input
                    id="title"
                    type="text"
                    className="form-control"
                    {...register("title")}
                    placeholder="Enter a title"
                    required
                  />
                  <p className="text-danger">{errors.title?.message}</p>
                </div>
                <div className="form-group mt-3">
                  <label
                    className="form-check-inline"
                    htmlFor="flexRadioDefault1"
                  >
                    Listing Type
                  </label>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="flexRadioDefault1"
                      value="room"
                      name="isRoom"
                      {...register("isRoom")}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexRadioDefault1"
                    >
                      Rooms
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="flexRadioDefault2"
                      value="unit"
                      name="isRoom"
                      {...register("isRoom")}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexRadioDefault2"
                    >
                      Whole unit
                    </label>
                  </div>
                  <p className="text-danger">{errors.isRoom?.message}</p>
                </div>
                <div className="form-group mt-3">
                  <label htmlFor="postalCode">Postal Code</label>
                  <input
                    id="postalCode"
                    type="text"
                    className="form-control"
                    {...register("postalCode")}
                    required
                  />
                  <p className="text-danger">{errors.postalCode?.message}</p>
                </div>

                <Controller
                  control={control}
                  name="location"
                  render={({ field: { onChange, value, name, ref } }) => (
                    <Select
                      className="form-floating"
                      inputRef={ref}
                      isSearchable
                      options={locationOptions}
                      placeholder="Location"
                      value={locationOptions.find((c) => c.value === value)}
                      onChange={(val) => onChange(val?.value)}
                    />
                  )}
                />
                <p className="text-danger">{errors.location?.message}</p>
                <div className="form-group mt-3">
                  <label htmlFor="numRooms">Number of Rooms</label>
                  <select
                    {...register("numRooms")}
                    className="form-select"
                    id="numRooms"
                    required
                  >
                    <option>How many rooms?</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                  <p className="text-danger">{errors.numRooms?.message}</p>
                </div>
                <div className="form-group mt-3">
                  <label htmlFor="price">Price</label>
                  <input
                    id="price"
                    {...register("price")}
                    type="number"
                    className="form-control"
                    required
                  />
                  <p className="text-danger">{errors.price?.message}</p>
                </div>
                <div className="form-group mt-3">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    placeholder="Give a short description"
                    {...register("description")}
                    className="form-control"
                    rows={3}
                  />
                  <p className="text-danger">{errors.description?.message}</p>
                </div>
                <Button className="mt-3" type="submit">
                  {loading && (
                    <Spinner
                      variant="secondary"
                      as="span"
                      size="sm"
                      animation="border"
                      role="status"
                    />
                  )}{" "}
                  Create new listing
                </Button>
              </form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
