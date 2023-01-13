import express, { Express } from "express";
// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || "0.0.0.0";
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 8080;

// Grab the blacklist from the command-line so that we can update the blacklist without deploying
// again. CORS Anywhere is open by design, and this blacklist is not used, except for countering
// immediate abuse (e.g. denial of service). If you want to block all origins except for some,
// use originWhitelist instead.
var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
function parseEnvList(env: string | undefined) {
  if (!env) {
    return [];
  }
  return env.split(",");
}

// Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
var checkRateLimit = require("./lib/rate-limit")(
  process.env.CORSANYWHERE_RATELIMIT
);

var corsAnywhere = require("cors-anywhere");
let proxy = corsAnywhere.createServer({
  originWhitelist: [], // Allow all origins
  requireHeaders: [], // Do not require any headers.
  removeHeaders: [], // Do not remove any headers.
});

var app = express();

// const PORT: string | number = 4100;

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json

// app.use(bodyParser.json());

app.use(express.json());

// serve up production assets
// app.use(express.static("fbphising/build"));
// let the react app to handle any unknown routes
// serve up the index.html if express does'nt recognize the route
// const path = require("path");
// app.get("*", (req: any, res: { sendFile: (arg0: any) => void }) => {
//   res.sendFile(path.resolve(__dirname, "fbphising", "build", "index.html"));
// });

/* Attach our cors proxy to the existing API on the /proxy endpoint. */
app.get("*", (req, res) => {
  req.url = req.url.replace("/proxy/", "/"); // Strip '/proxy' from the front of the URL, else the proxy won't work.
  proxy.emit("request", req, res);
});

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
