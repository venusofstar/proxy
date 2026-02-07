const express = require("express");
const { spawn } = require("child_process");

const app = express();
const PORT = 3000;

/**
 * Usage:
 * http://localhost:3000/restream?url=MP4_URL
 */
app.get("/restream", (req, res) => {
  const inputUrl = req.query.url;

  if (!inputUrl) {
    return res.status(400).send("Missing MP4 url");
  }

  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Transfer-Encoding", "chunked");

  const ffmpeg = spawn("ffmpeg", [
    "-re",
    "-i", inputUrl,
    "-c:v", "copy",
    "-c:a", "copy",
    "-movflags", "frag_keyframe+empty_moov",
    "-f", "mp4",
    "pipe:1"
  ]);

  ffmpeg.stdout.pipe(res);

  ffmpeg.stderr.on("data", data => {
    console.log(data.toString());
  });

  req.on("close", () => {
    ffmpeg.kill("SIGKILL");
  });
});

app.listen(PORT, () => {
  console.log(`MP4 restream server running on http://localhost:${PORT}`);
});
