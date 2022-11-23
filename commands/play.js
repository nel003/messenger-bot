const Spotify = require("node-spotify-api");
const axios = require("axios");
const Permissions = require("../model/Permissions");
const shorten = require("../utils/urlShort");
const fs = require("fs");
const https = require("https");
require("dotenv").config();

const spotify = new Spotify({
  id: process.env.SPOTIFY_ID,
  secret: process.env.SPOTIFY_SECRET,
});

function randomStr(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function search(title) {
  const res = await spotify.search({ type: "track", query: title });
  const artist = res.tracks.items[0].artists[0].name;
  const songTitle = res.tracks.items[0].name;
  const spotiURL = res.tracks.items[0].external_urls.spotify;
  return { artist, songTitle, spotiURL };
}

async function isDownloaded(link, path) {
  return new Promise((resolve) => {
    https.get(link, (res) => {
      const filePath = fs.createWriteStream(path);
      res.pipe(filePath);
      filePath.on("finish", () => {
        filePath.close();
        resolve();
      });
    });
  });
}

module.exports = async function main(api, message, title) {
  const has = await Permissions.findOne({ threadID: message.threadID });
  if (has === null) {
    return;
  }
  if (!has.allowed.includes("play")) {
    return;
  }

  const info = await api.getUserInfo(message.senderID);
  const { name, firstName } = info[message.senderID];

  if (title.trim() === "") {
    api.sendMessage(
      {
        body: `@${firstName} Please provide a song title!`,
        mentions: [
          {
            tag: `@${firstName}`,
            id: message.senderID,
          },
        ],
      },
      message.threadID
    );
    return;
  }
  const { artist, songTitle, spotiURL } = await search(title);

  const res = await axios({
    method: "POST",
    url: "https://api.spotify-downloader.com/",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    data: `link=${spotiURL}`,
  });

  const mp3 = res.data.audio.url;
  const path = `./mp3/${randomStr(10)}.mp3`;
  const shortUrl = await shorten(mp3);
  await isDownloaded(mp3, path);

  api.sendMessage(
    {
      body: `@${firstName} Here's your request🎶\n\nArtist: ${artist}\nTitle: ${songTitle}\nDownload: ${shortUrl}`,
      attachment: fs.createReadStream(path),
      mentions: [
        {
          tag: `@${firstName}`,
          id: message.senderID,
        },
      ],
    },
    message.threadID,
    (err) => {
      if (err) return console.log(err);
      fs.unlinkSync(path);
    }
  );
};
