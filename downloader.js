const { exec } = require("child_process");
const path = require("path");

function run(cmd) {
  return new Promise((res, rej) => {
    exec(cmd, err => err ? rej(err) : res());
  });
}

async function download(url, name, retry = 3) {
  const out = path.join("downloads", name + ".mp4");
  const cmd = `ffmpeg -y -i "${url}" -c copy -bsf:a aac_adtstoasc "${out}"`;

  for (let i = 0; i <= retry; i++) {
    try {
      await run(cmd);
      return out;
    } catch {
      if (i === retry) throw new Error("FFmpeg failed");
    }
  }
}

module.exports = { download };
