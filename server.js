// server.js
import express from "express";
import axios from "axios";
import { verifyJFS } from "@farcaster/jfs"; // pastikan package @farcaster/jfs terinstal

const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables (Railway)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;
const BASE_URL = process.env.BASE_URL;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => res.send("YouTube Snap Server Running 🚀"));

// JSON endpoint videos
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
    console.log(err.message);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// Farcaster Snap endpoint
app.get("/snap", async (req, res) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=5`;
    const response = await axios.get(url);
    const videos = response.data.items.filter(v => v.id.videoId);

    let metaButtons = "";
    let bodyHTML = "";

    videos.forEach((video, idx) => {
      const vidUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
      const title = video.snippet.title;
      const thumb = video.snippet.thumbnails.high.url;

      // Watch button
      metaButtons += `
        <meta name="fc:frame:button:${idx + 1}" content="▶️ Watch">
        <meta name="fc:frame:button:${idx + 1}:action" content="link">
        <meta name="fc:frame:button:${idx + 1}:target" content="${vidUrl}">
      `;

      // Share button
      metaButtons += `
        <meta name="fc:frame:button:${idx + 100}" content="🔗 Share">
        <meta name="fc:frame:button:${idx + 100}:action" content="post">
        <meta name="fc:frame:button:${idx + 100}:target" content="/share">
        <meta name="fc:frame:button:${idx + 100}:payload" content='{"videoTitle":"${title}","videoUrl":"${vidUrl}"}'>
      `;

      bodyHTML += `
        <div style="margin-bottom:15px; display:flex; align-items:center; gap:10px;">
          <img src="${thumb}" width="120" style="border-radius:8px;" />
          <span style="font-size:16px; font-weight:bold;">${title}</span>
        </div>
      `;
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="fc:frame" content="vNext">
  <meta name="fc:frame:title" content="Latest Videos">
  <meta name="fc:frame:image" content="${videos[0]?.snippet?.thumbnails?.high?.url || ''}">
  ${metaButtons}
</head>
<body style="font-family:sans-serif; margin:20px;">
  <h2>Latest Videos</h2>
  ${bodyHTML}
</body>
</html>
`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);

  } catch (err) {
    console.log(err.message);
    res.status(500).send("Frame error");
  }
});

// POST /share — authenticated via JFS
app.post("/share", async (req, res) => {
  try {
    const jfsCompact = req.headers["content-type"] === "application/jfs+json" ? req.body : req.body.jfs;

    if (!jfsCompact) return res.status(400).json({ error: "Missing JFS" });

    // Verify JFS signature
    const verified = await verifyJFS(jfsCompact);
    if (!verified.valid) return res.status(401).json({ error: "Invalid JFS" });

    const { videoTitle, videoUrl } = verified.payload;

    // Simulasi post cast (replace with actual Farcaster post API if tersedia)
    console.log("Creating cast:", videoTitle, videoUrl, "by FID", verified.fid);

    res.json({
      status: "success",
      message: `Cast created: "${videoTitle}" 🔗 ${videoUrl} #credit @andryaoe.eth`
    });

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Failed to share" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
