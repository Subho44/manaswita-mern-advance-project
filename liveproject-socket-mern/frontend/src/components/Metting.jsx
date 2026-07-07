import React, { useState, useEffect } from "react";
import axios from "axios";

const Metting = () => {
  const [title, setTitle] = useState("");
  const [meetings, setMeetings] = useState([]);

  const getmeetings = async () => {
    const res = await axios.get("http://localhost:5500/api/meetings");
    setMeetings(res.data);
  };
  const createmeeting = async (e) => {
    e.preventDefault();

    const res = await axios.post("http://localhost:5500/api/meetings/create", {
      title,
    });
    alert("metting created");
    setTitle("");
    getmeetings();

    window.open(res.data.roomUrl, "_blank");
    setMeetings(res.data);
  };

  useEffect(() => {
    getmeetings();
  }, []);

  return (
    <>
      <h1>Live meeting app</h1>
      <form onSubmit={createmeeting}>
        <input
          type="text"
          placeholder="enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <button>create metting</button>
      </form>

      <h2>all mettings</h2>

      {meetings.map((x) => (
        <div>
          <h3>{x.title}</h3>
          <p>{x.roomUrl}</p>
          <a href={x.roomUrl} target="_blank">
            <button>join meeting</button>
          </a>
        </div>
      ))}
    </>
  );
};

export default Metting;
