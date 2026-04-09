const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();

// 🔥 ENV + FALLBACK (ANTI ERROR)
const API_KEY =
  process.env.YOUTUBE_API_KEY ||
  "AIzaSyAZL9gU6nAHLLy4RA00T8LdqjwAddZUPgQ";

const CHANNEL_ID =
  process.env.CHANNEL_ID ||
  "UCtsoONeSvOP-RznVk0iYOGw";

const BASE_URL =
  process.env.BASE_URL ||
  "https://youtube-snap-server-production.up.railway.app";

app.use(express.static("public"));
app.use("/.well-known", express.static(path.join(__dirname, ".well-known")));


// ===== YOUTUBE FETCH =====
async function getLatestVideos() {
  try {
    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?key=${API_KEY}` +
      `&channelId=${CHANNEL_ID}` +
      `&part=snippet` +
      `&order=date` +
      `&maxResults=6` +
      `&type=video`;

    console.log("API KEY ACTIVE:", API_KEY ? "YES" : "NO");

    const res = await fetch(url);
    const data = await res.json();

    if (!data.items) return [];
    return data.items;
  } catch (err) {
    console.log("YT ERROR:", err);
    return [];
  }
}

app.get("/", (req,res)=>res.redirect("/channel"));


// ===== LANDING PAGE =====
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
    : `<h2>No videos available 😢</h2>`;

  res.send(`
  <html>
  <head>
    <title>YouTube Channel</title>
    <style>
      body{margin:0;font-family:sans-serif;background:#0f172a;color:white}
      header{text-align:center;padding:30px;background:#1e293b}
      .btn{background:red;color:white;padding:12px 25px;border-radius:10px;text-decoration:none}
      .videos{display:flex;flex-wrap:wrap;justify-content:center;gap:20px;padding:20px}
      .video-card{background:#1e293b;padding:10px;border-radius:12px;width:360px;text-align:center}
    </style>
  </head>
  <body>
    <header>
      <h1>🎬 My YouTube Channel</h1>
      <a class="btn" href="https://www.youtube.com/channel/${CHANNEL_ID}" target="_blank">
        Subscribe
      </a>
    </header>
    <div class="videos">${videoHTML}</div>
  </body>
  </html>
  `);
});


// ===== SNAP =====
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


// ===== FRAME =====
app.get("/frame", async (req, res) => {
  const videos = await getLatestVideos();
  const firstVideo = videos[0];

  const image =
    firstVideo?.snippet?.thumbnails?.high?.url ||
    BASE_URL + "/placeholder.png";

  res.send(`
  <html>
  <head>
    <meta property="og:image" content="${image}" />
    <meta name="fc:frame" content="vNext" />
    <meta name="fc:frame:image" content="${image}" />
    <meta name="fc:frame:button:1" content="Open Channel" />
    <meta name="fc:frame:button:1:action" content="link" />
    <meta name="fc:frame:button:1:target" content="${BASE_URL}/channel" />
  </head>
  <body>Frame</body>
  </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
