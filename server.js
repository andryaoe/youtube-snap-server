const express = require("express");
const app = express();

const API_KEY = "AIzaSyAZL9gU6nAHLLy4RA00T8LdqjwAddZUPgQ";
const CHANNEL_ID = "UCtsoONeSvOP-RznVk0iYOGw";

app.use(express.static("public"));

async function getLatestVideos() {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=6`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items) {
      console.log("YouTube API error:", data);
      return [];
    }

    return data.items.filter(v => v.id.videoId); // hanya video
  } catch (err) {
    console.log("Fetch error:", err);
    return [];
  }
}

//
// 🌐 LANDING PAGE CHANNEL
//
app.get("/channel", async (req, res) => {
  const videos = await getLatestVideos();

  let videoHTML = "<p>Video belum tersedia 😢</p>";

  if (videos.length > 0) {
    videoHTML = videos.map(v => `
      <iframe width="350" height="200"
        src="https://www.youtube.com/embed/${v.id.videoId}"
        frameborder="0" allowfullscreen>
      </iframe>
    `).join("");
  }

  res.send(`
  <html>
  <head>
    <title>My YouTube Channel</title>
    <style>
      body{font-family:sans-serif;background:#0f172a;color:white;text-align:center}
      .container{max-width:900px;margin:auto}
      .btn{background:red;padding:15px 25px;color:white;text-decoration:none;border-radius:10px}
      iframe{margin:10px;border-radius:12px}
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🎬 My YouTube Channel</h1>
      <p>Watch my latest videos and subscribe 🚀</p>
      <a class="btn" href="https://www.youtube.com/channel/${CHANNEL_ID}" target="_blank">
        🔔 Subscribe Now
      </a>
      <h2>Latest Videos</h2>
      ${videoHTML}
    </div>
  </body>
  </html>
  `);
});

//
// 📺 SNAP ENDPOINT
//
app.get("/snap", async (req, res) => {
  const accept = req.headers["accept"] || "";

  if (accept.includes("application/vnd.farcaster.snap+json")) {
    const videos = await getLatestVideos();

    return res.json({
      version: "1",
      type: "snap",
      layout: {
        type: "view",
        contents: [
          { type: "text", value: "📺 Visit my YouTube channel!" },
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

app.listen(process.env.PORT || 3000, "0.0.0.0", () =>
  console.log("Server running")
);
