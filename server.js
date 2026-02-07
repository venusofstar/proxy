const express = require("express");
const { spawn } = require("child_process");

const app = express();
const PORT = 3000;

// 📌 MP4 SOURCES
const STREAMS = {
  gold2: "https://cdn1.magixz.com/Pinaybold/JerrielCry4zeeh2.mp4",
  gold3: "https://cdn1.magixz.com/Pinaybold/JerrielCry4zeeh3.mp4",
    gold4: "https://cdn1.magixz.com/Pinaybold/JerrielCry4zeeh4.mp4",
  gold5: "https://cdn1.magixz.com/Pinaybold/JerrielCry4zeeh5.mp4",
    gold6: "https://cdn1.magixz.com/Pinaybold/JerrielCry4zeeh6.mp4"
};

// reusable restream function
function restreamMp4(sourceUrl, req, res) {
  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Cache-Control", "no-cache");

  const ffmpeg = spawn("ffmpeg", [
    "-re",
    "-i", sourceUrl,
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
}

// ▶️ Test1 stream
app.get("/gold2.mp4", (req, res) => {
  restreamMp4(STREAMS.test1, req, res);
});

// ▶️ Test2 stream
app.get("/gold3.mp4", (req, res) => {
  restreamMp4(STREAMS.test2, req, res);
});

app.get("/gold4.mp4", (req, res) => {
  restreamMp4(STREAMS.test1, req, res);
});

// ▶️ Test2 stream
app.get("/gold5.mp4", (req, res) => {
  restreamMp4(STREAMS.test2, req, res);
});

app.get("/gold6.mp4", (req, res) => {
  restreamMp4(STREAMS.test1, req, res);
});





app.get("/", (req, res) => {
  res.send("MP4 Restream Server Running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Test1 → http://localhost:${PORT}/gold1.mp4`);
  console.log(`Test2 → http://localhost:${PORT}/gold2.mp4`);
    console.log(`Test1 → http://localhost:${PORT}/gold3.mp4`);
  console.log(`Test2 → http://localhost:${PORT}/gold4.mp4`);
    console.log(`Test2 → http://localhost:${PORT}/gold5.mp4`);
});
