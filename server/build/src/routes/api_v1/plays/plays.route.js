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
const playRoutes = express_1.Router();
exports.playRoutes = playRoutes;
/**
 * Get all plays (limiting to 1000),
 * with the ?gameId=foo query limiting plays to a certain game.
 */
playRoutes.get("/", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const db = req.app.locals.db;
    const plays = yield db.collection("plays").find({}).limit(1000).toArray();
    res.status(200).json({
        data: plays,
    });
}));
/**
 * Get a play by unique Mongo play ID
 * Good for client API use, since lists of play IDs are frequently returned within other responses
 */
playRoutes.get("/:playId", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const db = req.app.locals.db;
        const play = yield db.collection("plays").findOne({ _id: req.params.playId });
        res.status(200).json({
            data: play,
        });
    }
    catch (err) {
        /* istanbul ignore next */
        res.status(500).json({
            errors: [{
                    code: "MongoRetrievalError",
                    title: "Error occured while fetching data from Mongo",
                    message: err.message,
                }],
        });
    }
}));
//# sourceMappingURL=plays.route.js.map