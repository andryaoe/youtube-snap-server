const express = require("express");
const app = express();

app.use(express.json());

// URL website YouTube kamu (GitHub Pages tadi)
const WEBSITE_URL = "https://andryaoe.github.io/youtube-snap/";

// Route utama Snap
app.get("/", (req, res) => {
  const accept = req.headers.accept || "";

  // 👉 Jika Farcaster request Snap (minta JSON)
  if (accept.includes("application/json")) {
    return res.json({
      version: "vNext",
      image: "https://i.imgur.com/8Km9tLL.png",
      buttons: [
        {
          label: "Open YouTube Channel",
          action: "link",
          target: WEBSITE_URL
        }
      ]
    });
  }

  // 👉 Jika user buka di browser → redirect ke website
  res.redirect(WEBSITE_URL);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Snap server running"));
