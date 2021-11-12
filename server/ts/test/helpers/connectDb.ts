import * as dotenv from "dotenv";
import * as mongo from "mongodb";
import * as uuid from "uuid";
dotenv.config();

export function getConnection() {
  const connectionString = `mongodb://${process.env.HOST}/${uuid()}`;
  const dbClient = new mongo.MongoClient();
  return dbClient.connect(connectionString, {
    promiseLibrary: Promise,
  });
}
