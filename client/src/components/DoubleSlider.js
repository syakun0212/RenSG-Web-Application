import React, { useLayoutEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import "../styles/DoubleSlider.css";

export default function DoubleSlider({
  min,
  max,
  searchParams,
  setSearchParams,
  setOpenDropdown,
}) {
  const [avg, setAvg] = useState((min + max) / 2);
  const [minVal, setMinVal] = useState(avg);
  const [maxVal, setMaxVal] = useState(avg);

  const thumbsize = 14;
  const width = 300;
  const minWidth =
    thumbsize + ((avg - min) / (max - min)) * (width - 2 * thumbsize);
  const minPercent = ((minVal - min) / (avg - min)) * 100;
  const maxPercent = ((maxVal - avg) / (max - avg)) * 100;
  const styles = {
    min: {
      width: minWidth,
      left: 0,
      "--minRangePercent": `${minPercent}%`,
    },
    max: {
      width: thumbsize + ((max - avg) / (max - min)) * (width - 2 * thumbsize),
      left: minWidth,
      "--maxRangePercent": `${maxPercent}%`,
    },
  };

  useLayoutEffect(() => {
    setAvg((maxVal + minVal) / 2);
  }, [minVal, maxVal]);

  return (
    <Container className="h-100">
      <div
        className="min-max-slider mx-auto"
        data-legendnum="2"
        data-rangemin={min}
        data-rangemax={max}
        data-thumbsize={thumbsize}
        data-rangewidth={width}
      >
        <label htmlFor="min">Minimum price</label>
        <input
          id="min"
          className="min"
          style={styles.min}
          name="min"
          type="range"
          step="1"
          min={min}
          max={avg}
          value={minVal}
          onChange={({ target }) => setMinVal(parseInt(target.value))}
        />
        <label htmlFor="max">Maximum price</label>
        <input
          id="max"
          className="max"
          style={styles.max}
          name="max"
          type="range"
          step="1"
          min={avg}
          max={max}
          value={maxVal}
          onChange={({ target }) => setMaxVal(parseInt(target.value))}
        />
      </div>
      <div className="labels">
        <div className="d-flex flex-column">
          <span>Min price</span>
          <span>${minVal}</span>
        </div>
        <div className="d-flex flex-column text-end">
          <span>Max price</span>
          <span>${maxVal}</span>
        </div>
      </div>
      <Button
        onClick={() => {
          setSearchParams({
            ...searchParams,
            minPrice: minVal,
            maxPrice: maxVal,
          });
          setOpenDropdown(false);
        }}
        className="mt-2"
        variant="secondary"
      >
        Save
      </Button>
    </Container>
  );
}
