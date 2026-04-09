// server.js final full interaktif (tanpa dotenv dan node-fetch)
const express = require("express");
const app = express();

// Gunakan Environment Variables Railway
const API_KEY = process.env.YOUTUBE_API_KEY;        // YouTube API key
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;  // YouTube Channel ID

// Ambil 5 video terbaru
async function getLatestVideos() {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=5`;
  const res = await fetch(url);
  const data = await res.json();

  // Mapping ke layout Snap interaktif
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
        label: video.snippet.title.substring(0,50),
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
  res.send("<h1>YouTube Snap Server</h1><p>Gunakan /snap untuk Farcaster Snap</p>");
});

// Route Snap untuk Farcaster
app.get("/snap", async (req, res) => {
  const accept = req.headers["accept"] || "";

  // Jika request dari Farcaster Snap
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

// Listen ke Railway port
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Snap server running on port " + PORT);
});
