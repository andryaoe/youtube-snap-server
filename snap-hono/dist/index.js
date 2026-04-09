"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const snap_hono_1 = require("@farcaster/snap-hono");
const node_fetch_1 = __importDefault(require("node-fetch"));
const YOUTUBE_API_KEY = "AIzaSyAZL9gU6nAHLLy4RA00T8LdqjwAddZUPgQ";
const CHANNEL_ID = "UCtsoONeSvOP-RznVk0iYOGw";
const app = new hono_1.Hono();
async function fetchLatestVideos() {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=5`;
    const res = await (0, node_fetch_1.default)(url);
    const data = await res.json();
    if (!data.items)
        return [];
    return data.items.map((item) => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
}
(0, snap_hono_1.registerSnapHandler)(app, async (ctx) => {
    let videos = [];
    try {
        videos = await fetchLatestVideos();
    }
    catch (err) {
        console.error("Error fetching videos:", err);
    }
    const uiElements = {
        page: { type: "stack", props: {}, children: ["title", "body", "action", "videoList"] },
        title: { type: "text", props: { content: "My YouTube Channel", weight: "bold" } },
        body: { type: "text", props: { content: "Check out my latest videos and subscribe!" } },
        action: {
            type: "button",
            props: { label: "Subscribe", variant: "primary" },
            on: { press: { action: "submit", params: { target: `https://www.youtube.com/channel/${CHANNEL_ID}?sub_confirmation=1` } } }
        },
        videoList: {
            type: "list",
            props: {
                items: videos.length > 0 ? videos : [{ title: "Video belum tersedia 😢", url: "#" }]
            }
        }
    };
    return {
        version: "1.0",
        theme: { accent: "purple", mode: "dark" },
        ui: {
            root: "page",
            elements: uiElements
        }
    };
});
