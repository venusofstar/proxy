import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// 🔥 YOUR STREAMS
const STREAMS = {
  lakers: "https://lb2.modifiles.fans/secure/VdSxiIByCXLnxLSqiBlNgILHlFCKpqLn/1774911600/1774939680/losangeleslakers/index.m3u8"
};

// 🔥 DEFAULT HEADERS (bypass protection)
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Referer": "https://pooembed.eu/",
  "Origin": "https://pooembed.eu/"
};

// 🔥 CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// 🔥 MAIN PLAY ROUTE (M3U8)
app.get("/play/:id", async (req, res) => {
  try {
    const streamUrl = STREAMS[req.params.id];
    if (!streamUrl) return res.status(404).send("Stream not found");

    const base = streamUrl.substring(0, streamUrl.lastIndexOf("/") + 1);

    const response = await fetch(streamUrl, { headers: HEADERS });
    let text = await response.text();

    // 🔥 Rewrite segment URLs (.ts, .m4s, etc.)
    text = text.replace(/^(?!#)(.+)$/gm, (line) => {
      if (line.startsWith("http")) {
        return `/segment?url=${encodeURIComponent(line)}`;
      }
      return `/segment?url=${encodeURIComponent(base + line)}`;
    });

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(text);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading stream");
  }
});

// 🔥 SEGMENT ROUTE
app.get("/segment", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("Missing URL");

    const response = await fetch(url, { headers: HEADERS });

    res.setHeader("Content-Type", "video/mp2t");
    response.body.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).send("Segment error");
  }
});

// 🔥 OPTIONAL: M3U PLAYLIST OUTPUT
app.get("/playlist.m3u", (req, res) => {
  res.setHeader("Content-Type", "application/x-mpegURL");

  let m3u = "#EXTM3U\n";

  for (const key in STREAMS) {
    m3u += `#EXTINF:-1 group-title="🏀 NBA",${key.toUpperCase()}\n`;
    m3u += `${req.protocol}://${req.get("host")}/play/${key}\n`;
  }

  res.send(m3u);
});

// 🔥 START SERVER
app.listen(PORT, () => {
  console.log(`🔥 Proxy IPTV running on port ${PORT}`);
});
