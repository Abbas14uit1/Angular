import { Router } from "express";
import * as mongo from "mongodb";
import * as multer from "multer";

import { FootballImporter } from "../../../lib/importer/statcrew/football/footballImporter";
import { winstonLogger } from "../../../lib/winstonLogger";
import { XMLParser } from "../../../lib/XMLParser";

import * as Athlyte from "../../../../../../typings/athlyte/football";

const gameJsonRoute: Router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * Upload a JSON file as a game, this is used to create games for the future seasons
 * returns the id of the game
 */
gameJsonRoute.post("/", async (req, res, next) => {
  const db: mongo.Db = req.app.locals.db;
  const game = req.body;
  // const mongoGame = await db.collection("games")
  //   .findOne({ gameDate: game.gameDate, team: game.team }, { fields: { _id: 1 } });
  // if (mongoGame !== undefined) {
  game._id = new mongo.ObjectID().toHexString();
  try {
    await db.collection("games").insertOne(game);
    res.status(201).json({
      data: game._id,
    });
  } catch (err) {
    res.status(500).json({
      errors: [{
        code: "MongoRetrievalError",
        title: "Unknown error occured during Mongo operation",
        message: err.message,
      }],
    });
  }
  // }
  // else {
  //   res.status(400).json({
  //     errors: [{
  //       code: "GameInDBError",
  //       title: "Game already exists in database",
  //       message: "Game already exists in DB",
  //     }],
  //   });
  // }
  return;

});

export { gameJsonRoute };
