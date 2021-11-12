"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();
// "testing_mongo" is database name used when running locally (when testing, random UUIDs are used)
// export const dbName = "athlyte_sec";
exports.dbName = "athlyte";
exports.mongoDb = process.env.MONGO_USER && process.env.MONGO_PASS ?
    `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.HOST}` :
    `mongodb://${process.env.HOST}`;
// set up password hashing
exports.jwtSecret = process.env.JWT_SECRET;
exports.jwtSignOpts = { algorithm: "HS256", expiresIn: "60m" };
exports.saltLength = 10;
// create default admin user
exports.sampleUser = {
    admin: true,
    hashedPw: bcrypt.hashSync(process.env.DEMO_PASS || "defaultPassword", exports.saltLength),
    username: process.env.DEMO_USER || "defaultUser",
    superAdmin: false,
    isActive: true,
};
//# sourceMappingURL=config.js.map