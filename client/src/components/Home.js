import React from "react";
import "../styles/Home.css";
import FilterForm from "./FilterForm";

export default function Home() {
  return (
    <div className="home">
      <div className="bg"></div>
      <div className="mt-5">
        <FilterForm />
      </div>
      <h1 className="text-center text-white mt-5">Finding a home made easy</h1>
    </div>
  );
}
