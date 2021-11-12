#!/usr/bin/env node

/**
 * Module dependencies.
 */

import * as bcrypt from "bcryptjs";
import * as cp from "child_process";
import * as debugModule from "debug";
import * as http from "http";
import * as mongo from "mongodb";

import { app } from "../app";
import { dbName, jwtSecret, mongoDb, saltLength, sampleUser } from "../config/config";
import { winstonLogger } from "../lib/winstonLogger";

const debug = debugModule("src:server");

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

// Setup Winston for logging
winstonLogger.addFile({
  level: process.env.NODE_ENV === "production" ? "error" : "debug",
  filename: "app.log",
  json: true,
});

winstonLogger.addConsole({
  level: "info",
});

/**
 * Listen on provided port, on all network interfaces.
 */

// After start up Mongo
winstonLogger.log("info", `connecting to ${mongoDb}/${dbName}`);
mongo.MongoClient.connect(`${mongoDb}/${dbName}`, (err, database) => {
  if (err) {
    winstonLogger.log("error", err.message);
    throw err;
  }
  try {
    createIndices(database);
    addUser(database);
    app.locals.db = database;
    server.listen(port);
  } catch (err) {
    winstonLogger.log("error", err);
    throw err;
  }
});

server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: any) {
  const normalizedPort = parseInt(val, 10);

  if (isNaN(normalizedPort)) {
    // named pipe
    return val;
  }

  if (normalizedPort >= 0) {
    // port number
    return normalizedPort;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string"
    ? "Pipe " + port
    : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      winstonLogger.log("error", bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      winstonLogger.log("error", bind + " is already in use");
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
  const addr = server.address();
  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port;
  debug("Listening on " + bind);
}

/**
 * Create indices on the Mongo database to speed up queries in production.
 * Note: more indicies are possible, but in the interest of saving space, indices
 * are currently limited to these
 * @param db Mongo database
 */
async function createIndices(db: mongo.Db): Promise<any> {
  try {
    const playIndices = await db.collection("plays").createIndexes([
      {
        key: { gameId: 1 },
        name: "gameId",
      },
    ]);
    const playerIndices = await db.collection("players").createIndexes([
      {
        key: { "games.gameId": 1 },
        name: "gameId",
      },
      {
        key: { teamId: 1 },
        name: "teamId",
      },
    ]);
    const teamIndices = await db.collection("teams").createIndexes([
      {
        key: { "games.gameId": 1 },
        name: "gameId",
      },
    ]);
    return Promise.all([playIndices, playerIndices, teamIndices]);
  } catch (err) {
    return Promise.reject(err);
  }
}

/**
 * Adds the base admin user to the database
 * Allows for a user that has permissions to add other admins
 * @param db Mongo database
 */
async function addUser(db: mongo.Db): Promise<any> {
  try {
    const existingUser = await db.collection("users").findOne({ username: sampleUser.username });
    if (!existingUser) {
      db.collection("users").insertOne(sampleUser);
    }
  } catch (err) {
    winstonLogger.log("error", err);
  }
}
