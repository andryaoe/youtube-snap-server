import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 HARDCODED (works)
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
      `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=5`;

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
// FARCASTER SNAP ENDPOINT
// ===============================
app.get("/snap", async (req, res) => {
  const accept = req.headers["accept"] || "";

  // Snap request
  if (accept.includes("application/vnd.farcaster.snap+json")) {
    try {
      const url =
        `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=1`;

      const response = await axios.get(url);
      const video = response.data.items[0];

      const title = video.snippet.title;
      const thumbnail = video.snippet.thumbnails.high.url;
      const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
      const channelUrl = `https://www.youtube.com/channel/${CHANNEL_ID}`;
      const shareText = `Check out this video: ${videoUrl} (credit: @andryaoe.eth)`;

      const snapJson = {
        version: "1",
        type: "snap",
        layout: {
          type: "view",
          contents: [
            { type: "text", value: `📺 ${title}` },
            { type: "image", url: thumbnail },
            {
              type: "button",
              label: "▶️ Watch Video",
              action: { type: "open_url", url: videoUrl }
            },
            {
              type: "button",
              label: "🔔 Subscribe",
              action: { type: "open_url", url: channelUrl }
            },
            {
              type: "button",
              label: "📤 Share",
              action: {
                type: "cast",
                text: shareText
              }
            }
          ]
        }
      };

      res.setHeader("Content-Type", "application/vnd.farcaster.snap+json");
      return res.json(snapJson);
    } catch (err) {
      console.log(err.response?.data || err.message);
      return res.status(500).json({ error: "Snap frame error" });
    }
  }

  // Non-snap request → landing page
  res.redirect("/channel");
});

// ===============================
// CHANNEL LANDING PAGE
// ===============================
app.get("/channel", async (req, res) => {
  try {
    const url =
      `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=5`;

    const response = await axios.get(url);
    const videos = response.data.items.filter(v => v.id.videoId);

    const videoHTML = videos.length
      ? videos.map(v => `
        <div class="video-card">
          <iframe width="350" height="200" src="https://www.youtube.com/embed/${v.id.videoId}" frameborder="0" allowfullscreen></iframe>
          <p>${v.snippet.title}</p>
        </div>
      `).join("")
      : `<p>No videos available 😢</p>`;

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
          <p>Welcome to my channel! Latest videos, bio, and subscribe button.</p>
          <a class="btn" href="${channelUrl}" target="_blank">🔔 Subscribe Now</a>
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
    res.status(500).send("Channel page error");
  }
});

// ===============================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
