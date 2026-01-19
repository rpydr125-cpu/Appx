const { exec } = require("child_process");
const path = require("path");

function downloadM3U8(m3u8Url, outputName) {
  return new Promise((resolve, reject) => {
    const out = path.join(__dirname, "downloads", outputName + ".mp4");

    const cmd = `ffmpeg -y -i "${m3u8Url}" -c copy -bsf:a aac_adtstoasc "${out}"`;

    exec(cmd, (err) => {
      if (err) reject(err);
      else resolve(out);
    });
  });
}

module.exports = { downloadM3U8 };

