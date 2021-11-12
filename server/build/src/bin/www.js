#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const debugModule = require("debug");
const http = require("http");
const mongo = require("mongodb");
const app_1 = require("../app");
const config_1 = require("../config/config");
const winstonLogger_1 = require("../lib/winstonLogger");
const debug = debugModule("src:server");
/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || "3000");
app_1.app.set("port", port);
/**
 * Create HTTP server.
 */
const server = http.createServer(app_1.app);
// Setup Winston for logging
winstonLogger_1.winstonLogger.addFile({
    level: process.env.NODE_ENV === "production" ? "error" : "debug",
    filename: "app.log",
    json: true,
});
winstonLogger_1.winstonLogger.addConsole({
    level: "info",
});
/**
 * Listen on provided port, on all network interfaces.
 */
// After start up Mongo
winstonLogger_1.winstonLogger.log("info", `connecting to ${config_1.mongoDb}/${config_1.dbName}`);
mongo.MongoClient.connect(`${config_1.mongoDb}/${config_1.dbName}`, (err, database) => {
    if (err) {
        winstonLogger_1.winstonLogger.log("error", err.message);
        throw err;
    }
    try {
        createIndices(database);
        addUser(database);
        app_1.app.locals.db = database;
        server.listen(port);
    }
    catch (err) {
        winstonLogger_1.winstonLogger.log("error", err);
        throw err;
    }
});
server.on("error", onError);
server.on("listening", onListening);
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
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
function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }
    const bind = typeof port === "string"
        ? "Pipe " + port
        : "Port " + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            winstonLogger_1.winstonLogger.log("error", bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            winstonLogger_1.winstonLogger.log("error", bind + " is already in use");
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
function createIndices(db) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const playIndices = yield db.collection("plays").createIndexes([
                {
                    key: { gameId: 1 },
                    name: "gameId",
                },
            ]);
            const playerIndices = yield db.collection("players").createIndexes([
                {
                    key: { "games.gameId": 1 },
                    name: "gameId",
                },
                {
                    key: { teamId: 1 },
                    name: "teamId",
                },
            ]);
            const teamIndices = yield db.collection("teams").createIndexes([
                {
                    key: { "games.gameId": 1 },
                    name: "gameId",
                },
            ]);
            return Promise.all([playIndices, playerIndices, teamIndices]);
        }
        catch (err) {
            return Promise.reject(err);
        }
    });
}
/**
 * Adds the base admin user to the database
 * Allows for a user that has permissions to add other admins
 * @param db Mongo database
 */
function addUser(db) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const existingUser = yield db.collection("users").findOne({ username: config_1.sampleUser.username });
            if (!existingUser) {
                db.collection("users").insertOne(config_1.sampleUser);
            }
        }
        catch (err) {
            winstonLogger_1.winstonLogger.log("error", err);
        }
    });
}
//# sourceMappingURL=www.js.map