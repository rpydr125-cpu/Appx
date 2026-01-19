function detectQuality(url) {
  if (url.includes("1080")) return "1080p";
  if (url.includes("720")) return "720p";
  if (url.includes("480")) return "480p";
  if (url.includes("360")) return "360p";
  return "auto";
}

module.exports = { detectQuality };

