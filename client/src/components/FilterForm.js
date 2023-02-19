import React from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { AiOutlineSearch } from "react-icons/ai";
import Container from "react-bootstrap/esm/Container";
import { Controller, useForm } from "react-hook-form";
import { createSearchParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { planningAreas } from "../planningArea";
import "../styles/FilterForm.css";

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "transparent",
    border: "none",
    boxShadow: state.isFocused ? 0 : 0,
  }),
  container: (provided, state) => ({
    ...provided,
    width: "100%",
  }),
  valueContainer: (provided) => ({
    ...provided,
    backgroundColor: "transparent",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    maxWidth: "100%",
    flexWrap: "nowrap",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#212529",
  }),
};

export default function FilterForm({ inHeader }) {
  const { handleSubmit, control } = useForm();
  const navigate = useNavigate();

  const onSearch = (data) => {
    console.log(data);
    navigate({
      pathname: "/listing",
      search: `?${createSearchParams(data)}`,
    });
  };

  const locationOptions = planningAreas.map((area) => {
    return { value: area, label: area };
  });

  const typeOptions = [
    { value: "unit", label: "Whole Unit" },
    { value: "room", label: "Individual Unit" },
  ];

  const numberOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
  ];

  return (
    <Form className="my-1" onSubmit={handleSubmit(onSearch)}>
      <Container
        fluid="lg"
        className={"form-container" + (inHeader ? " py-1" : "")}
      >
        <Row>
          <Col md={5} sm={4} className="field">
            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, value, name, ref } }) => (
                <Select
                  className="form-floating"
                  inputRef={ref}
                  isMulti
                  isSearchable
                  styles={selectStyles}
                  options={locationOptions}
                  placeholder="Location"
                  value={locationOptions.find((c) => c.value === value)}
                  onChange={(val) => onChange(val.map((v) => v.value))}
                />
              )}
            />
          </Col>
          <Col md={3} sm={3} className="field">
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value, name, ref } }) => (
                <Select
                  isClearable
                  className="form-floating"
                  inputRef={ref}
                  styles={selectStyles}
                  options={typeOptions}
                  placeholder="Rental Type"
                  value={typeOptions.find((c) => c.value === value)}
                  onChange={(val) => onChange(val?.value)}
                />
              )}
            />
          </Col>
          <Col md={3} sm={3} className="field">
            <Controller
              control={control}
              name="number"
              render={({ field: { onChange, value, name, ref } }) => (
                <Select
                  isClearable
                  className="form-floating"
                  inputRef={ref}
                  styles={selectStyles}
                  options={numberOptions}
                  placeholder="Number of rooms"
                  value={numberOptions.find((c) => c.value === value)}
                  onChange={(val) => onChange(val?.value)}
                />
              )}
            />
          </Col>
          <Col
            sm={2}
            md={1}
            className="d-flex p-0 justify-content-end align-items-center"
          >
            <Button type="submit" className="search-button">
              <AiOutlineSearch size={"1.5rem"} />
            </Button>
          </Col>
        </Row>
      </Container>
    </Form>
  );
}
