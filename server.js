const express = require("express");
const path = require("path");
const app = express();

// Ganti USERNAME dengan GitHub kamu
const WEBSITE_URL = "https://andryaoe.github.io/youtube-snap/";

// Route utama untuk menampilkan website
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Route khusus untuk Farcaster Snap
app.get("/snap", (req, res) => {
  res.json({
    version: "1",
    type: "farcaster-snap",
    image: "https://i.imgur.com/8Km9tLL.png", // bisa diganti logo/thumbnail
    buttons: [
      {
        label: "Open YouTube Channel",
        action: "link",
        target: WEBSITE_URL
      }
    ]
  });
});

// Listen ke port Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Snap server running on port " + PORT);
});
