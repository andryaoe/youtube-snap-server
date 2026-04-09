// ===== IMPORT =====
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();

// ===== ENV (Railway Variables) =====
const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;
const BASE_URL = "https://youtube-snap-server-production.up.railway.app";

// ===== STATIC FILES =====
app.use(express.static("public"));
app.use("/.well-known", express.static(path.join(__dirname, ".well-known")));

// ===== YOUTUBE FETCH =====
async function getLatestVideos() {
  try {
    console.log("ENV CHECK:", API_KEY ? "API OK" : "NO API KEY");

    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?key=${API_KEY}` +
      `&channelId=${CHANNEL_ID}` +
      `&part=snippet` +
      `&order=date` +
      `&maxResults=6` +
      `&type=video`;

    const res = await fetch(url);
    const data = await res.json();

    console.log("YouTube items:", data.items?.length);

    if (!data.items) return [];
    return data.items;
  } catch (err) {
    console.log("YouTube Fetch Error:", err);
    return [];
  }
}

// ===== HOME =====
app.get("/", (req, res) => {
  res.redirect("/channel");
});

// ===== LANDING PAGE =====
app.get("/channel", async (req, res) => {
  const videos = await getLatestVideos();

  const videoHTML = videos.length
    ? videos.map(v => `
      <div class="video-card">
        <iframe width="350" height="200"
          src="https://www.youtube.com/embed/${v.id.videoId}"
          frameborder="0" allowfullscreen>
        </iframe>
        <p>${v.snippet.title}</p>
      </div>
    `).join("")
    : `<p>No videos available 😢</p>`;

  res.send(`
  <html>
  <head>
    <title>YouTube Channel</title>
    <style>
      body{margin:0;font-family:sans-serif;background:#0f172a;color:white}
      header{text-align:center;padding:30px;background:#1e293b}
      .btn{background:red;color:white;padding:12px 25px;border-radius:10px;text-decoration:none}
      .container{max-width:1000px;margin:auto;padding:20px}
      .videos{display:flex;flex-wrap:wrap;justify-content:center;gap:20px}
      .video-card{background:#1e293b;padding:10px;border-radius:12px;width:360px;text-align:center}
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
      <h2 style="text-align:center">Latest Videos</h2>
      <div class="videos">${videoHTML}</div>
    </div>
  </body>
  </html>
  `);
});


// ===== SNAP ENDPOINT =====
app.get("/snap", async (req, res) => {
  const accept = req.headers.accept || "";

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
              BASE_URL + "/placeholder.png"
          },
          {
            type: "button",
            label: "Open Channel",
            action: { type: "open_url", url: BASE_URL + "/channel" }
          }
        ]
      }
    });
  }

  res.redirect("/channel");
});


// ===== FARCASTER FRAME =====
app.get("/frame", async (req, res) => {
  const videos = await getLatestVideos();
  const firstVideo = videos[0];

  const image =
    firstVideo?.snippet?.thumbnails?.high?.url ||
    BASE_URL + "/placeholder.png";

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta property="og:title" content="My YouTube Channel" />
    <meta property="og:image" content="${image}" />

    <meta name="fc:frame" content="vNext" />
    <meta name="fc:frame:image" content="${image}" />
    <meta name="fc:frame:button:1" content="Open Channel" />
    <meta name="fc:frame:button:1:action" content="link" />
    <meta name="fc:frame:button:1:target" content="${BASE_URL}/channel" />
  </head>
  <body>Farcaster Frame</body>
  </html>
  `);
});


// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
