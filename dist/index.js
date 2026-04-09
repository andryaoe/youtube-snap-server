"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const snap_hono_1 = require("@farcaster/snap-hono");
const app = new hono_1.Hono();
(0, snap_hono_1.registerSnapHandler)(app, async (ctx) => {
    if (ctx.action.type === "get") {
        return {
            version: "1.0",
            theme: { accent: "purple", mode: "dark" },
            ui: {
                root: "page",
                elements: {
                    page: {
                        type: "stack",
                        props: {},
                        children: ["title", "body", "action", "videoList"],
                    },
                    title: {
                        type: "text",
                        props: { content: "My YouTube Channel", weight: "bold" },
                    },
                    body: {
                        type: "text",
                        props: { content: "Check out my latest videos and subscribe!" },
                    },
                    action: {
                        type: "button",
                        props: { label: "Subscribe", variant: "primary" },
                        on: {
                            press: {
                                action: "submit",
                                params: { target: "https://www.youtube.com/channel/UCtsoONeSvOP-RznVk0iYOGw?sub_confirmation=1" },
                            },
                        },
                    },
                    videoList: {
                        type: "list",
                        props: {
                            items: [
                                {
                                    title: "Video 1",
                                    url: "https://www.youtube.com/watch?v=VIDEO_ID_1",
                                },
                                {
                                    title: "Video 2",
                                    url: "https://www.youtube.com/watch?v=VIDEO_ID_2",
                                }
                            ],
                        },
                    },
                },
            },
        };
    }
    // Handle POST interactions if needed
    const { fid, inputs, button_index } = ctx.action;
});
