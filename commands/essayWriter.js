const axios = require("axios");
const Permissions = require("../model/Permissions");
require("dotenv").config();

const headers = {
  accept: "application/json, text/plain, */*",
  cookie: process.env.UWU_COOKIE,
};

async function getTokenID() {
  const res = await axios({
    method: "GET",
    url: "https://top-one-uwu-clone-2.onrender.com/api/openai/get-servers?payload=%7B%22openaiStates%22:%22%7B%5C%22search%5C%22:%5C%22%5C%22,%5C%22sort%5C%22:%5C%22generated_tokens%5C%22,%5C%22isAscending%5C%22:true,%5C%22filter%5C%22:%5C%22Online%5C%22,%5C%22limit%5C%22:8%7D%22%7D",
    headers,
  });
  const data = res.data;
  for (let i = 0; i < data.length; i++) {
    if (data[i].generated_tokens > 999) {
      return data[i].id;
    }
  }
  return 0;
}

async function write(id, sentence, intensity) {
  const res = await axios({
    method: "GET",
    url: `https://top-one-uwu-clone-2.onrender.com/api/openai/basic-completion?payload=%7B%22serverId%22:${id},%22input%22:%22${sentence
      .trim()
      .replace(
        " ",
        "+"
      )}%22,%22intensity%22:${intensity},%22onlyFirstParagraph%22:false,%22language%22:%22English%22,%22prompt%22:%22Write+an+essay+about+the+[Input],+split+it+by+parts+(Introduction,+Body,+Conclusion).%22%7D`,
      headers
    
  });
  return res.data;
}

module.exports = async function main(api, message, sentence) {
  const has = await Permissions.findOne({ threadID: message.threadID });
  if (has === null) {
    return;
  }
  if (!has.allowed.includes("essay")) {
    return;
  }
  
  const info = await api.getUserInfo(message.senderID);
  const { name, firstName } = info[message.senderID];
  
  if (sentence === "undefined") {
    api.sendMessage(
    {
      body: `@${firstName} Please provide some input.`,
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
  const id = await getTokenID();
  const answer = await write(id, sentence, 4);

  api.sendMessage(
    {
      body: `@${firstName} Here's your essay🎉\n\n${answer}`,
      mentions: [
        {
          tag: `@${firstName}`,
          id: message.senderID,
        },
      ],
    },
    message.threadID
  );
};
