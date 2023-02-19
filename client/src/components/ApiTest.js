import axios from "../axios";
import React, { useEffect, useState } from "react";

export default function ApiTest() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/v1.0/test");
        setItems(res.data.items);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);
  return (
    <div>
      <ul>
        {items &&
          items.map((item) => (
            <li key={item.id} style={{ color: "white" }}>
              {item.name} {item.price}
            </li>
          ))}
      </ul>
    </div>
  );
}
