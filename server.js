import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

// HARDCODE (sudah terbukti works)
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
// GET YOUTUBE VIDEOS (JSON)
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
// CHANNEL LANDING PAGE
// ===============================
app.get("/channel", async (req, res) => {
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

    const videoHTML = videos.map(v => `
      <div class="video-card">
        <iframe width="320" height="180" src="https://www.youtube.com/embed/${v.videoId}" frameborder="0" allowfullscreen></iframe>
        <p>${v.title}</p>
      </div>
    `).join("");

    res.send(`
      <html>
      <head>
        <title>My YouTube Channel</title>
        <style>
          body {margin:0; font-family:sans-serif; background:#0f172a; color:white;}
          header {text-align:center; padding:30px; background:#1e293b;}
          header h1 {margin:0; font-size:2.5em;}
          header p {margin:5px 0; font-size:1.2em; color:#cbd5e1;}
          .btn {background:red; color:white; padding:12px 25px; border-radius:10px; text-decoration:none; margin:10px; display:inline-block;}
          .container {max-width:1000px; margin:auto; padding:20px;}
          .videos {display:flex; flex-wrap:wrap; justify-content:center; gap:20px;}
          .video-card {background:#1e293b; padding:10px; border-radius:12px; width:360px; text-align:center;}
          .video-card p {margin:5px 0; font-size:1em;}
          a.btn:hover {opacity:0.8;}
        </style>
      </head>
      <body>
        <header>
          <h1>🎬 My YouTube Channel</h1>
          <p>Welcome to my channel! Here you'll find latest videos, bio, and subscribe button.</p>
          <a class="btn" href="https://www.youtube.com/channel/${CHANNEL_ID}" target="_blank">🔔 Subscribe Now</a>
        </header>
        <div class="container">
          <h2 style="text-align:center;">Latest Videos</h2>
          <div class="videos">
            ${videoHTML}
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).send("Failed to load channel page");
  }
});

// ===============================
// FARCASTER SNAP FRAME (/snap)
// ===============================
app.get("/snap", async (req, res) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=1`;
    const response = await axios.get(url);

    const video = response.data.items.find(item => item.id.videoId);
    if (!video) return res.status(404).send("No video found");

    const title = video.snippet.title;
    const thumbnail = video.snippet.thumbnails.medium.url;
    const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta property="og:title" content="${title}" />
        <meta property="og:image" content="${thumbnail}" />

        <meta name="fc:frame" content="vNext" />
        <meta name="fc:frame:image" content="${thumbnail}" />

        <meta name="fc:frame:button:1" content="▶️ Watch Video" />
        <meta name="fc:frame:button:1:action" content="link" />
        <meta name="fc:frame:button:1:target" content="${videoUrl}" />

        <meta name="fc:frame:button:2" content="🔔 Subscribe" />
        <meta name="fc:frame:button:2:action" content="link" />
        <meta name="fc:frame:button:2:target" content="https://www.youtube.com/channel/${CHANNEL_ID}" />

        <meta name="fc:frame:button:3" content="📤 Share" />
        <meta name="fc:frame:button:3:action" content="link" />
        <meta name="fc:frame:button:3:target" content="https://farcaster.xyz/andryaoe.eth/?share=${encodeURIComponent(videoUrl)}" />
      </head>
      <body>
        <h1>${title}</h1>
        <iframe width="320" height="180" src="https://www.youtube.com/embed/${video.id.videoId}" frameborder="0" allowfullscreen></iframe>
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
app.listen(PORT, () => console.log("Server running on port " + PORT));
