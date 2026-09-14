const express = require("express");
const { createServer } = require("node:http");
const path = require("path");

// Correct static paths from your module output
const uvPath = require("@titaniumnetwork-dev/ultraviolet").uvPath;
const epoxyPath = require("@mercuryworkshop/epoxy-transport").epoxyPath;
const baremuxPath = require("@mercuryworkshop/bare-mux/node").baremuxPath;

const { server: wisp } = require("@mercuryworkshop/wisp-js/server");

const app = express();

// Homepage route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));

const httpServer = createServer();
httpServer.on("request", (req, res) => app(req, res));
httpServer.on("upgrade", (req, socket, head) => {
  if (req.url.endsWith("/wisp/")) {
    wisp.routeRequest(req, socket, head);
  } else {
    socket.end();
  }
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => console.log(`Aether running on port ${PORT}`));
