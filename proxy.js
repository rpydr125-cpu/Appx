const express = require('express');
const axios = require('axios');
const app = express();

const REFERER = process.env.REFERER || 'https://example.com';

app.get('/xstream', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send('Missing URL');

  try {
    const response = await axios.get(videoUrl, {
      headers: {
        'Referer': REFERER,
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0'
      }
    });

    let content = response.data;
    const baseUrl = videoUrl.substring(0, videoUrl.lastIndexOf('/') + 1);

    content = content.replace(/^(?!#)([^\s]+\.ts[^\s]*)/gm, s =>
      `/xseg?url=${encodeURIComponent(baseUrl + s)}`
    );

    content = content.replace(/^(?!#)([^\s]+\.m3u8[^\s]*)/gm, p =>
      `/xstream?url=${encodeURIComponent(baseUrl + p)}`
    );

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(content);

  } catch (e) {
    res.status(500).send('Playlist load failed');
  }
});

app.get('/xseg', async (req, res) => {
  const segmentUrl = req.query.url;
  if (!segmentUrl) return res.status(400).send('Missing segment URL');

  try {
    const response = await axios.get(segmentUrl, {
      responseType: 'stream',
      headers: {
        'Referer': REFERER,
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0'
      }
    });

    res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp2t');
    response.data.pipe(res);

  } catch {
    res.status(500).send('Segment load failed');
  }
});

app.listen(3000, () => console.log("🌐 Proxy running on 3000"));
