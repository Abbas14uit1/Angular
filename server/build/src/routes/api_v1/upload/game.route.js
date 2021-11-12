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
const multer = require("multer");
const footballImporter_1 = require("../../../lib/importer/statcrew/football/footballImporter");
const basketballImporter_1 = require("../../../lib/importer/statcrew/basketball/basketballImporter");
const baseballImporter_1 = require("../../../lib/importer/statcrew/baseball/baseballImporter");
const XMLParser_1 = require("../../../lib/XMLParser");
//import * as Athlyte from "../../../../../../typings/athlyte/football";
const gameRoute = express_1.Router();
exports.gameRoute = gameRoute;
const storage = multer.memoryStorage();
const upload = multer({ storage });
/**
 * Parse and save files uploaded with the "xml" form field.
 * Returns IDs as body.data.ids.{gameId|playIds|playerIds|homeId|visitorId}
 */
gameRoute.post("/", upload.single("file"), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).json({
            errors: [{
                    code: "XMLParseError",
                    title: "No file was provided",
                }],
        });
    }
    const xmlString = req.file.buffer.toString("UTF-8");
    const meta = req.body;
    const parser = new XMLParser_1.XMLParser(xmlString);
    let coordinator;
    try {
        if (parser.getGameType() == 'bbgame') {
            coordinator = new basketballImporter_1.BasketballImporter();
            const statcrewJSON = yield parser.parseXml();
            coordinator.parse(statcrewJSON);
        }
        else if (parser.getGameType() == 'bsgame') {
            coordinator = new baseballImporter_1.BaseballImporter();
            const statcrewJSON = yield parser.parseXml();
            coordinator.parse(statcrewJSON);
        }
        else {
            coordinator = new footballImporter_1.FootballImporter();
            const statcrewJSON = yield parser.parseXml();
            yield coordinator.updateUploadStatusSchedule(req.app.locals.db, statcrewJSON, "upload_failed");
            coordinator.parse(statcrewJSON);
            coordinator.updateUploadStatusSchedule(req.app.locals.db, statcrewJSON, "upload_success");
        }
    }
    catch (err) {
        res.status(500).json({
            errors: [{
                    code: "XMLParseError",
                    title: "Error occured while parsing XML file",
                    detail: err.stack,
                }],
        });
        return;
    }
    try {
        // if parsing was successful, save to DB
        const gameDoc = yield coordinator.saveToMongo(req.app.locals.db);
        /* istanbul ignore if */
        if (gameDoc.gameId === undefined) {
            throw new Error("Could not save game ID to database");
        }
        /*if (req.app.locals.superlativeEngine) {
          req.app.locals.superlativeEngine.send("game " + gameDoc.gameId);
        }*/
        res.status(201).json({
            data: {
                ids: gameDoc,
            },
        });
    }
    catch (err) {
        /* istanbul ignore next */
        res.status(500).json({
            errors: [{
                    code: "XMLParseError",
                    title: "Error occured while saving XML file",
                    detail: err.stack,
                }],
        });
    }
}));
//# sourceMappingURL=game.route.js.map