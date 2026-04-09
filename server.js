const express = require("express");
const path = require("path");
const app = express();

// ambil dari Railway env
const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;

// static files
app.use(express.static("public"));
app.use("/.well-known", express.static(path.join(__dirname, ".well-known")));


// ===============================
// GET LATEST YOUTUBE VIDEOS
// ===============================
async function getLatestVideos() {
  try {
    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?key=${API_KEY}` +
      `&channelId=${CHANNEL_ID}` +
      `&part=snippet` +
      `&order=date` +
      `&maxResults=6` +
      `&type=video`; // 🔥 penting: hanya video

    const res = await fetch(url);
    const data = await res.json();

    console.log("YouTube API response:", data); // debug railway logs

    if (!data.items) return [];
    return data.items;

  } catch (err) {
    console.log("YouTube fetch error:", err);
    return [];
  }
}


// ===============================
// CHANNEL PAGE
// ===============================
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
        🔔 Subscribe
      </a>
    </header>
    <div class="container">
      <h2 style="text-align:center;">Latest Videos</h2>
      <div class="videos">${videoHTML}</div>
    </div>
  </body>
  </html>
  `);
});


// ===============================
// SNAP ENDPOINT
// ===============================
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
            url: firstVideo?.snippet?.thumbnails?.high?.url
              || "https://youtube-snap-server-production.up.railway.app/placeholder.png"
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


// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
