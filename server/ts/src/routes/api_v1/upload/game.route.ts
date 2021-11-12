import { Router } from "express";
import * as multer from "multer";

import { FootballImporter } from "../../../lib/importer/statcrew/football/footballImporter";
import { BasketballImporter } from "../../../lib/importer/statcrew/basketball/basketballImporter";
import { BaseballImporter } from "../../../lib/importer/statcrew/baseball/baseballImporter";

import { winstonLogger } from "../../../lib/winstonLogger";
import { XMLParser } from "../../../lib/XMLParser";

//import * as Athlyte from "../../../../../../typings/athlyte/football";

const gameRoute: Router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * Parse and save files uploaded with the "xml" form field.
 * Returns IDs as body.data.ids.{gameId|playIds|playerIds|homeId|visitorId}
 */
gameRoute.post("/", upload.single("file"), async (req, res, next) => {
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
  const parser = new XMLParser(xmlString);
  let coordinator;

  try {
    if (parser.getGameType() == 'bbgame') {
      coordinator = new BasketballImporter();
      const statcrewJSON = await parser.parseXml();
      coordinator.parse(statcrewJSON);
    }
    else if (parser.getGameType() == 'bsgame') {
      coordinator = new BaseballImporter();
      const statcrewJSON = await parser.parseXml();
      coordinator.parse(statcrewJSON);
    }
    else {
      coordinator = new FootballImporter();
      const statcrewJSON = await parser.parseXml();
      await coordinator.updateUploadStatusSchedule(req.app.locals.db, statcrewJSON, "upload_failed");
      coordinator.parse(statcrewJSON);
      coordinator.updateUploadStatusSchedule(req.app.locals.db, statcrewJSON, "upload_success");
    }

  } catch (err) {

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
    const gameDoc = await coordinator.saveToMongo(req.app.locals.db);
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
  } catch (err) {
    /* istanbul ignore next */
    res.status(500).json({
      errors: [{
        code: "XMLParseError",
        title: "Error occured while saving XML file",
        detail: err.stack,
      }],
    });
  }
});

export { gameRoute };
