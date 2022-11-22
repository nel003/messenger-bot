const Spotify = require("node-spotify-api");
const axios = require("axios");
const Permissions = require("../model/Permissions");
const fs = require("fs");
const https = require("https");

const spotify = new Spotify({
  id: "a2483dab6389471a8f9f4e28bd7310fd",
  secret: "330ec1c2fdb146b58e21e5c6051c0012",
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
  return res.tracks.items[0].external_urls.spotify;
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
  const spotiURL = await search(title);

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

  await isDownloaded(mp3, path);

  api.sendMessage(
    {
      body: `@${firstName} Here's your request🎶`,
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
