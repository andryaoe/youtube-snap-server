// server.js final untuk YouTube Snap Farcaster
const express = require("express");
const path = require("path");
const app = express();

// Ganti USERNAME dengan GitHub kamu
const WEBSITE_URL = "https://andryaoe.github.io/youtube-snap/";

// Route utama untuk menampilkan halaman web
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Route khusus untuk Farcaster / Warpcast Snap
app.get("/snap", (req, res) => {
  const accept = req.headers.accept || "";

  // Kalau request dari Farcaster (minta JSON)
  if (accept.includes("application/json")) {
    return res.json({
      version: "vNext",         // Versi Snap
      type: "frame",            // Harus "frame" supaya tombol muncul
      name: "YouTube Snap",     // Nama Snap
      image: "https://i.imgur.com/8Km9tLL.png", // Logo / thumbnail Snap
      buttons: [
        {
          label: "Open YouTube Channel",
          action: "link",
          target: WEBSITE_URL
        }
      ]
    });
  }

  // Kalau browser biasa → redirect ke website
  res.redirect(WEBSITE_URL);
});

// Listen ke Railway port
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Snap server running on port " + PORT);
});
