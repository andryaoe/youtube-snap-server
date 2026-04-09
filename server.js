import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 HARDCODE (sudah terbukti works)
const YOUTUBE_API_KEY = "AIzaSyAZL9gU6nAHLLy4RA00T8LdqjwAddZUPgQ";
const CHANNEL_ID = "UCtsoONeSvOP-RznVk0iYOGw";
const BASE_URL = "https://youtube-snap-server-production.up.railway.app";

// ===============================
// ROOT (health check)
// ===============================
app.get("/", (req, res) => {
  res.send("YouTube Snap Server Running 🚀");
});

// ===============================
// GET YOUTUBE VIDEOS (JSON endpoint)
// ===============================
app.get("/videos", async (req, res) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=5`;

    const response = await axios.get(url);
    const videos = response.data.items
      .filter(item => item.id.videoId)
      .map(item => ({
        title: item.snippet.title,
        videoId: item.id.videoId,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));

    res.json(videos);

  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// ===============================
// FARCASTER SNAP FRAME (/snap)
// ===============================
app.get("/snap", async (req, res) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=1`;

    const response = await axios.get(url);
    const video = response.data.items[0];

    if (!video) {
      return res.status(404).send("No video found");
    }

    const title = video.snippet.title;
    const thumbnail = video.snippet.thumbnails.medium.url;
    const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
    const channelUrl = `https://www.youtube.com/channel/${CHANNEL_ID}`;
    const shareUrl = `https://farcaster.xyz/andryaoe.eth/?share=${video.id.videoId}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>

          <!-- Farcaster Snap metadata -->
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="${thumbnail}" />

          <meta name="fc:frame:button:1" content="▶️ Watch Video" />
          <meta name="fc:frame:button:1:action" content="link" />
          <meta name="fc:frame:button:1:target" content="${videoUrl}" />

          <meta name="fc:frame:button:2" content="🔔 Subscribe" />
          <meta name="fc:frame:button:2:action" content="link" />
          <meta name="fc:frame:button:2:target" content="${channelUrl}" />

          <meta name="fc:frame:button:3" content="📤 Share" />
          <meta name="fc:frame:button:3:action" content="link" />
          <meta name="fc:frame:button:3:target" content="${shareUrl}" />
        </head>
        <body>
          <h1>${title}</h1>
        </body>
      </html>
    `;

    res.send(html);

  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).send("Frame error");
  }
});

// ===============================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
