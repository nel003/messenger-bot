const axios = require("axios");

module.exports = async function shorten(url) {
  const res = await axios({
    method: "POST",
    url: "https://cutt.ly/scripts/shortenUrl.php",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    data: `url=${url}&domain=0`,
  });
  return res.data;
}
