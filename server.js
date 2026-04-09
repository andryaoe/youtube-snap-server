const express = require("express");
const fetch = require("node-fetch"); // npm install node-fetch@2
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = "AIzaSyAZL9gU6nAHLLy4RA00T8LdqjwAddZUPgQ";
const CHANNEL_ID = "UCtsoONeSvOP-RznVk0iYOGw";

app.use(express.static("public"));
app.use("/.well-known", express.static(path.join(__dirname, ".well-known")));

// health check untuk Railway
app.get("/", (req, res) => {
  res.send("YouTube Snap Server is running 🚀");
});

// ambil video youtube
async function getLatestVideos() {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=6`;
    const response = await fetch(url);
    const data = await response.json();
    if (!data.items) return [];
    return data.items.filter(v => v.id.videoId);
  } catch (err) {
    console.log("Fetch error:", err);
    return [];
  }
}

// landing page channel (PUNYA KAMU — tidak berubah)
app.get("/channel", async (req, res) => {
  const videos = await getLatestVideos();
  const videoHTML = videos.length
    ? videos.map(v => `
      <div class="video-card">
        <iframe width="350" height="200"
        src="https://www.youtube.com/embed/${v.id.videoId}"
        frameborder="0" allowfullscreen></iframe>
        <p>${v.snippet.title}</p>
      </div>
    `).join("")
    : `<p>No videos available 😢</p>`;

  res.send(`
  <html>
  <head>
    <title>My YouTube Channel</title>
    <style>
      body {margin:0;font-family:sans-serif;background:#0f172a;color:white;}
      header {text-align:center;padding:30px;background:#1e293b;}
      .btn {background:red;color:white;padding:12px 25px;border-radius:10px;text-decoration:none;}
      .container {max-width:1000px;margin:auto;padding:20px;}
      .videos {display:flex;flex-wrap:wrap;justify-content:center;gap:20px;}
      .video-card {background:#1e293b;padding:10px;border-radius:12px;width:360px;text-align:center;}
    </style>
  </head>
  <body>
    <header>
      <h1>🎬 My YouTube Channel</h1>
      <a class="btn" href="https://www.youtube.com/channel/${CHANNEL_ID}" target="_blank">
      🔔 Subscribe Now</a>
    </header>
    <div class="container">
      <h2 style="text-align:center;">Latest Videos</h2>
      <div class="videos">${videoHTML}</div>
    </div>
  </body>
  </html>
  `);
});

// SNAP endpoint (punya kamu — tetap)
app.get("/snap", async (req, res) => {
  const accept = req.headers["accept"] || "";

  if (accept.includes("application/vnd.farcaster.snap+json")) {
    const videos = await getLatestVideos();
    const firstVideo = videos[0];

    return res.json({
      version: "1",
      type: "snap",
      layout: {
        type: "view",
        contents: [
          { type: "text", value: "📺 Visit my YouTube channel!" },
          {
            type: "image",
            url: firstVideo?.snippet?.thumbnails?.high?.url ||
              "https://youtube-snap-server-production.up.railway.app/placeholder.png"
          },
          {
            type: "button",
            label: "Open Channel",
            action: {
              type: "open_url",
              url: "https://youtube-snap-server-production.up.railway.app/channel"
            }
          }
        ]
      }
    });
  }

  res.redirect("/channel");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
