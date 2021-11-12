import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import * as jwt from "jsonwebtoken";
dotenv.config();

// "testing_mongo" is database name used when running locally (when testing, random UUIDs are used)
// export const dbName = "athlyte_sec";
export const dbName = "athlyte";
export const mongoDb = process.env.MONGO_USER && process.env.MONGO_PASS ?
  `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.HOST}` :
  `mongodb://${process.env.HOST}`;

// set up password hashing
export const jwtSecret = process.env.JWT_SECRET;
export const jwtSignOpts: jwt.SignOptions = { algorithm: "HS256", expiresIn: "60m" };
export const saltLength = 10;

// create default admin user
export const sampleUser = {
  admin: true,
  hashedPw: bcrypt.hashSync(process.env.DEMO_PASS || "defaultPassword", saltLength),
  username: process.env.DEMO_USER || "defaultUser",
  superAdmin: false,
  isActive: true,
};
