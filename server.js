const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// 🔑 CONFIG
const YOUTUBE_API_KEY = "AIzaSyAZL9gU6nAHLLy4RA00T8LdqjwAddZUPgQ";
const CHANNEL_ID = "UCtsoONeSvOP-RznVk0iYOGw";
const BASE_URL = "https://youtube-snap-server-production.up.railway.app";


// ===================================================
// HEALTH CHECK
// ===================================================
app.get("/", (req, res) => {
  res.send("YouTube Snap Server Running 🚀");
});


// ===================================================
// FETCH YOUTUBE VIDEOS (JSON API)
// ===================================================
async function fetchVideos() {
  const url =
    `https://www.googleapis.com/youtube/v3/search` +
    `?key=${YOUTUBE_API_KEY}` +
    `&channelId=${CHANNEL_ID}` +
    `&part=snippet,id&order=date&maxResults=10`;

  const response = await axios.get(url);

  return response.data.items
    .filter(item => item.id.videoId)
    .map(item => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      thumbnail: item.snippet.thumbnails.high.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
}

app.get("/videos", async (req, res) => {
  try {
    const videos = await fetchVideos();
    res.json(videos);
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});


// ===================================================
// BUILD FARCASTER FRAME HTML
// ===================================================
function buildFrame(video) {
  const subscribeUrl = `https://www.youtube.com/channel/${CHANNEL_ID}?sub_confirmation=1`;

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta property="og:title" content="${video.title}" />
      <meta property="og:image" content="${video.thumbnail}" />

      <meta name="fc:frame" content="vNext" />
      <meta name="fc:frame:image" content="${video.thumbnail}" />

      <meta name="fc:frame:button:1" content="▶️ Watch" />
      <meta name="fc:frame:button:1:action" content="link" />
      <meta name="fc:frame:button:1:target" content="${video.url}" />

      <meta name="fc:frame:button:2" content="📺 Subscribe" />
      <meta name="fc:frame:button:2:action" content="link" />
      <meta name="fc:frame:button:2:target" content="${subscribeUrl}" />

      <meta name="fc:frame:button:3" content="🔁 Next Video" />
      <meta name="fc:frame:button:3:action" content="post" />
      <meta name="fc:frame:post_url" content="${BASE_URL}/snap" />
    </head>
    <body>
      <h1>${video.title}</h1>
    </body>
  </html>
  `;
}


// ===================================================
// FARCASTER SNAP (GET + POST)
// ===================================================
async function handleSnap(req, res) {
  try {
    const videos = await fetchVideos();
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];

    const html = buildFrame(randomVideo);
    res.send(html);

  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).send("Frame error");
  }
}

app.get("/snap", handleSnap);
app.post("/snap", handleSnap);


// ===================================================
