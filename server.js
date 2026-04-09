import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

const YOUTUBE_API_KEY = "AIzaSyAZL9gU6nAHLLy4RA00T8LdqjwAddZUPgQ";
const CHANNEL_ID = "UCtsoONeSvOP-RznVk0iYOGw";
const BASE_URL = "https://youtube-snap-server-production.up.railway.app";

// Health check
app.get("/", (req, res) => res.send("YouTube Snap Server 🚀"));

// /videos endpoint
app.get("/videos", async (req, res) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=5`;
    const response = await axios.get(url);
    const videos = response.data.items
      .filter(v => v.id.videoId)
      .map(v => ({
        title: v.snippet.title,
        videoId: v.id.videoId,
        thumbnail: v.snippet.thumbnails.high.url,
        url: `https://www.youtube.com/watch?v=${v.id.videoId}`
      }));
    res.json(videos);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// /snap endpoint Farcaster frame
app.get("/snap", async (req, res) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=1`;
    const response = await axios.get(url);
    const video = response.data.items[0];

    const title = video.snippet.title;
    const thumbnail = video.snippet.thumbnails.high.url;
    const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;

    // HTML meta tags for Farcaster frame
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="fc:frame" content="vNext" />
        <meta name="fc:frame:title" content="${title}" />
        <meta name="fc:frame:image" content="${thumbnail}" />

        <!-- Watch Button -->
        <meta name="fc:frame:button:1" content="▶️ Watch Video" />
        <meta name="fc:frame:button:1:action" content="link" />
        <meta name="fc:frame:button:1:target" content="${videoUrl}" />

        <!-- Share Button -->
        <meta name="fc:frame:button:2" content="🔗 Share" />
        <meta name="fc:frame:button:2:action" content="cast" />
        <meta name="fc:frame:button:2:target" content="Check out this video: ${videoUrl} #SnapCredit @andryaoe.eth" />
      </head>
      <body>
        <h1>${title}</h1>
        <img src="${thumbnail}" width="100%" />
      </body>
    </html>
    `;

    res.send(html);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Frame error");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
