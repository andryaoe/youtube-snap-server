const express = require("express");
const axios = require("axios");
const app = express();

// ===== HARDCODE FINAL =====
const YOUTUBE_API_KEY = "AIzaSyAZL9gU6nAHLLy4RA00T8LdqjwAddZUPgQ";
const CHANNEL_ID = "UCtsoONeSvOP-RznVk0iYOGw";
const BASE_URL = "https://lifestyle-hawaiian-contractor-the.trycloudflare.com";

// ===== ROOT TEST =====
app.get("/", (req, res) => {
  res.send("YouTube Snap Server Running 🚀");
});

// ===== GET LATEST VIDEOS =====
app.get("/videos", async (req, res) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=6`;

    const response = await axios.get(url);

    const videos = response.data.items
      .filter(item => item.id.videoId)
      .map(item => ({
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        videoId: item.id.videoId,
        url: `https://youtube.com/watch?v=${item.id.videoId}`
      }));

    res.json(videos);

  } catch (err) {
    console.log(err.message);
    res.status(500).send("Error fetching videos");
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log("Server running on port 3000"));
