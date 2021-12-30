#!/usr/bin/env node

/**
 * Module dependencies.
 */
"use strict";
var app = require("../app");
import socketManager from "../socket/index";
import { doConnectMongo } from "../mongodb/db";
var debug = require("debug")("keke-saolei-node:server");
var http = require("http");
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "9010");
console.log("ajax监听端口：", port);
console.log("ws监听端口：", port + 1);
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * 创建socketio
 */
const Server = require("socket.io");
const io = new Server(port + 1, { origins: "*:*" });

doConnectMongo().then(e => {
  socketManager.init(io);
})

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
