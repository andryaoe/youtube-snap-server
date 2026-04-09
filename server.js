require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const app = express();

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

// Ambil 5 video terbaru dari channel YouTube
async function getLatestVideos() {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=5`;
  const res = await fetch(url);
  const data = await res.json();

  return data.items.map(video => ({
    type: "view",
    layout: "horizontal",
    contents: [
      {
        type: "image",
        url: video.snippet.thumbnails.medium.url
      },
      {
        type: "button",
        label: video.snippet.title.substring(0,50), // max 50 karakter
        action: {
          type: "open_url",
          url: `https://www.youtube.com/watch?v=${video.id.videoId}`
        }
      }
    ]
  }));
}

// Route utama
app.get("/", (req, res) => {
  res.send("<h1>YouTube Snap Server</h1><p>Use /snap for Farcaster Snap</p>");
});

// Route Snap
app.get("/snap", async (req, res) => {
  const accept = req.headers["accept"] || "";

  // Request dari Farcaster Snap
  if (accept.includes("application/vnd.farcaster.snap+json")) {
    const videos = await getLatestVideos();

    return res.json({
      version: "1",
      type: "snap",
      layout: {
        type: "view",
        contents: [
          { type: "text", value: "📺 My Latest YouTube Videos" },
          ...videos
        ]
      }
    });
  }

  // Browser biasa → redirect ke channel
  res.redirect(`https://www.youtube.com/channel/${CHANNEL_ID}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Snap server running on port " + PORT);
});
