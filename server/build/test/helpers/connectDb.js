"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const mongo = require("mongodb");
const uuid = require("uuid");
dotenv.config();
function getConnection() {
    const connectionString = `mongodb://${process.env.HOST}/${uuid()}`;
    const dbClient = new mongo.MongoClient();
    return dbClient.connect(connectionString, {
        promiseLibrary: Promise,
    });
}
exports.getConnection = getConnection;
//# sourceMappingURL=connectDb.js.map