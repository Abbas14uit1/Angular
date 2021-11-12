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
const express_1 = require("express");
const mongo = require("mongodb");
const multer = require("multer");
const gameJsonRoute = express_1.Router();
exports.gameJsonRoute = gameJsonRoute;
const storage = multer.memoryStorage();
const upload = multer({ storage });
/**
 * Upload a JSON file as a game, this is used to create games for the future seasons
 * returns the id of the game
 */
gameJsonRoute.post("/", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const game = req.body;
    // const mongoGame = await db.collection("games")
    //   .findOne({ gameDate: game.gameDate, team: game.team }, { fields: { _id: 1 } });
    // if (mongoGame !== undefined) {
    game._id = new mongo.ObjectID().toHexString();
    try {
        yield db.collection("games").insertOne(game);
        res.status(201).json({
            data: game._id,
        });
    }
    catch (err) {
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
}));
//# sourceMappingURL=gamejson.route.js.map