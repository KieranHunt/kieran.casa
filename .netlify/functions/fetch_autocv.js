const https = require("https");

exports.handler = function(event, context, callback) {
  https.get("https://s3-eu-west-1.amazonaws.com/autocv/build/autocv/index.html", res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", data => {
      body += data;
    });
    res.on("end", () => {
      callback(null, {
        statusCode: 200,
        body: body
      });
    });
  });
}
