const express = require("express");
const axios = require("axios");

const app = express();

// ⚠️ WAJIB untuk Railway
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// 🔑 HARDCODE (works)
const YOUTUBE_API_KEY = "AIzaSyAZL9gU6nAHLLy4RA00T8LdqjwAddZUPgQ";
const CHANNEL_ID = "UCtsoONeSvOP-RznVk0iYOGw";
const BASE_URL = "https://youtube-snap-server-production.up.railway.app";


// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.send("YouTube Snap Server Running 🚀");
});


// ===============================
// GET VIDEOS API
// ===============================
app.get("/videos", async (req, res) => {
  try {
    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?key=${YOUTUBE_API_KEY}` +
      `&channelId=${CHANNEL_ID}` +
      `&part=snippet,id&order=date&maxResults=5`;

    const response = await axios.get(url);

    const videos = response.data.items
      .filter(item => item.id.videoId)
      .map(item => ({
        title: item.snippet.title,
        videoId: item.id.videoId,
        thumbnail: item.snippet.thumbnails.high.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));

    res.json(videos);
  } catch (err) {
    console.log("VIDEOS ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});


// ===============================
// FARCASTER FRAME
// ===============================
app.get("/snap", async (req, res) => {
  try {
    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?key=${YOUTUBE_API_KEY}` +
      `&channelId=${CHANNEL_ID}` +
      `&part=snippet,id&order=date&maxResults=1`;

    const response = await axios.get(url);
    const video = response.data.items[0];

    const title = video.snippet.title;
    const thumbnail = video.snippet.thumbnails.high.url;
    const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta property="og:title" content="${title}" />
<meta property="og:image" content="${thumbnail}" />

<meta name="fc:frame" content="vNext" />
<meta name="fc:frame:image" content="${thumbnail}" />
<meta name="fc:frame:button:1" content="▶️ Watch Video" />
<meta name="fc:frame:button:1:action" content="link" />
<meta name="fc:frame:button:1:target" content="${videoUrl}" />
</head>
<body>
<h1>${title}</h1>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);

  } catch (err) {
    console.log("SNAP ERROR:", err.response?.data || err.message);
    res.status(500).send("Frame error");
  }
});


// ⭐⭐⭐ INI YANG FIX 502 ⭐⭐⭐
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
