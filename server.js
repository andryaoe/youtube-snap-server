import express from "express";
import axios from "axios";

const app = express();
app.use(express.json()); // untuk menerima POST JSON

const PORT = process.env.PORT || 3000;

// 🔑 HARDCODE
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
// GET YOUTUBE VIDEOS
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
    console.log(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// ===============================
// FARCASTER FRAME (/snap)
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
        <meta charset="utf-8" />
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="${title}" />
        <meta property="og:image" content="${thumbnail}" />

        <meta name="fc:frame" content="vNext" />
        <meta name="fc:frame:image" content="${thumbnail}" />
        <meta name="fc:frame:button:1" content="▶️ Watch Video" />
        <meta name="fc:frame:button:1:action" content="link" />
        <meta name="fc:frame:button:1:target" content="${videoUrl}" />

        <meta name="fc:frame:button:2" content="🔗 Share" />
        <meta name="fc:frame:button:2:action" content="post" />
        <meta name="fc:frame:button:2:post-url" content="/share" />
      </head>
      <body style="font-family:sans-serif; background:#0f172a; color:white; text-align:center; padding:30px;">
        <img src="${thumbnail}" width="100%" style="border-radius:12px; max-width:480px;" />
        <h2 style="margin-top:15px;">${title}</h2>
        <p>Snap by <strong>@andryaoe.eth</strong></p>
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
// SHARE POST SIMULATION (/share)
// ===============================
app.post("/share", async (req, res) => {
  const { videoTitle, videoUrl } = req.body || {};
  if (!videoTitle || !videoUrl) {
    return res.status(400).json({ error: "Missing videoTitle or videoUrl" });
  }

  // simulasikan cast
  console.log("Simulate cast:", videoTitle, videoUrl);
  res.json({
    status: "success",
    message: `Cast created: "${videoTitle}" 🔗 ${videoUrl} #credit @andryaoe.eth`
  });
});

// ===============================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
