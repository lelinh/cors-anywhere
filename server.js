"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
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
function parseEnvList(env) {
    if (!env) {
        return [];
    }
    return env.split(",");
}
// Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
var checkRateLimit = require("./lib/rate-limit")(process.env.CORSANYWHERE_RATELIMIT);
var cors_proxy = require("cors-anywhere");
cors_proxy
    .createServer({
    originBlacklist: originBlacklist,
    originWhitelist: originWhitelist,
    requireHeader: ["origin", "x-requested-with"],
    // checkRateLimit: checkRateLimit,
    removeHeaders: [
        "cookie",
        "cookie2",
        // Strip Heroku-specific headers
        "x-request-start",
        "x-request-id",
        "via",
        "connect-time",
        "total-route-time",
        // Other Heroku added debug headers
        // 'x-forwarded-for',
        // 'x-forwarded-proto',
        // 'x-forwarded-port',
    ],
    redirectSameOrigin: true,
    httpProxyOptions: {
        // Do not add X-Forwarded-For, etc. headers, because Heroku already adds it.
        xfwd: false,
    },
})
    .listen(port, host, function () {
    console.log("Running CORS Anywhere on " + host + ":" + port);
});
var app = (0, express_1.default)();
const PORT = 4100;
// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
// app.use(bodyParser.json());
app.use(express_1.default.json());
// serve up production assets
// app.use(express.static("fbphising/build"));
// let the react app to handle any unknown routes
// serve up the index.html if express does'nt recognize the route
// const path = require("path");
// app.get("*", (req: any, res: { sendFile: (arg0: any) => void }) => {
//   res.sendFile(path.resolve(__dirname, "fbphising", "build", "index.html"));
// });
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
