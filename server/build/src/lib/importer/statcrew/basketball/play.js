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
const mongo = require("mongodb");
const AthlyteImporter_1 = require("../../AthlyteImporter");
const scoreParser_1 = require("./helpers/scoreParser");
const playParser_1 = require("./helpers/playParser");
const BasketballStatcrewImportBase_1 = require("../BasketballStatcrewImportBase");
const game_1 = require("./game");
const player_1 = require("./player");
/**
 * PlayClass manages the entire lifecycle of games,
 * from parsing the play data (from the output of xml2js)
 * to saving to Mongo.
 */
class Play extends BasketballStatcrewImportBase_1.BasketballStatcrewImportBase {
    constructor() {
        super();
        this.dependents = [];
        this.parsedData = {
            _id: undefined,
            gameId: undefined,
            playerIds: [],
        };
    }
    /**
     * Generate a new play ID. Since plays are unique to each game,
     * no need to check Mongo for an already-existing similar play.
     * @param db Mongo DB (here for compatability with base class)
     */
    generateId(db, sportCode) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(new mongo.ObjectID().toHexString());
        });
    }
    /**
     * Add a player's ID to the list of players involved in this play.
     * Replace the previous code in game used to represent players with the id in the play results
     * @param id ID of a player involved in this play
     */
    updatePlayerRef(id, codeInGame) {
        var index = this.parsedData.playerIds.indexOf(codeInGame);
        if (index !== -1) {
            this.parsedData.playerIds[index] = id;
        }
        let results = [];
    }
    /**
     * Associate a play with a game.
     * @param id The ID of the game that this play is a part of
     */
    updateGameRef(id) {
        this.parsedData.gameId = id;
    }
    /**
     * Prepare dynamic data for save.
     * For a play, all data is dynamic. No play will add to information
     * to an already-existing play.
     */
    prepareDynamicData() {
        if (this.parsedData._id === undefined ||
            this.parsedData.gameId === undefined) {
            // does not check players, since it may be empty on occasion
            throw new Error("Trying to save data before all fields have been populated");
        }
        else {
            return this.parsedData;
        }
    }
    /* istanbul ignore next */
    /**
     * Getting static data is a noop for Play; all data is dynamic
     */
    prepareStaticData() {
        return;
    }
    /**
     * Update dependents (other classes which have registered as a dependent
     * of SavePlay). Calling this function results in the ID of this play
     * being passed on to instances of Player and Game save classes.
     */
    updateDependents() {
        //throw new Error("this is a tragedy");
        for (const dependent of this.dependents) {
            if (dependent instanceof player_1.Player ||
                dependent instanceof game_1.Game) {
                dependent.updatePlayRef(this.getId());
            }
            else {
                throw new Error("Only players and games should be dependents of a play");
            }
        }
    }
    /**
     * Parse play information from Statcrew's format to our own Athlyte format
     * @param inputPlay the play information
     * @param quarter the quarter the play occured in
     */
    parse(inputPlay, period, periodTime, periodClock, sportCode) {
        //const [possession, down, togo, startFieldPos] = inputPlay.$.context.split(",");
        //const [drive, playIndexInDrive, playInGame] = inputPlay.$.playid.split(",");    
        const [minutes, seconds] = inputPlay.$.time ? inputPlay.$.time.split(":") : ["0", "0"];
        const possession = inputPlay.$.vh;
        let sanitizedPossession;
        sanitizedPossession = possession === "H" ? AthlyteImporter_1.VH.home : AthlyteImporter_1.VH.visitor;
        //winstonLogger.log("info","Name: "  + inputPlay.$.checkname);
        const playerNames = [inputPlay.$.checkname.replace(',', ' ')];
        const type = inputPlay.$.type === undefined ? "" : inputPlay.$.type;
        const paint = inputPlay.$.paint === undefined ? "" : inputPlay.$.paint;
        const uni = possession + inputPlay.$.uni;
        //const tokenParser = new TokenParser(inputPlay.$.tokens, sanitizedPossession, inputPlay.$.turnover);
        /* let parsedTokens: AthlytePlay.IPlayResults;
         try {
           parsedTokens = tokenParser.parse();
         } catch (err) {
           winstonLogger.log("error", "unexpected tokens " + inputPlay.$.tokens);
           winstonLogger.log("error", err.message)
           parsedTokens = { playersInvolved: [] };
         }
         const playStartLocation: Athlyte.IFieldPosition = Play.parsePlayStartLocation(startFieldPos);*/
        this.parsedData = {
            gameId: "",
            sportCode: sportCode,
            playerIds: [uni],
            possession: sanitizedPossession,
            period: period,
            playInGame: inputPlay.$.seq,
            overtime: period > 2 ? true : false,
            playerNames: playerNames,
            gameClockStartTime: { minutes: Number.parseInt(minutes), seconds: Number.parseInt(seconds) },
            action: inputPlay.$.action,
            type: type,
            description: playParser_1.constructDescription(playerNames[0], inputPlay.$.team, inputPlay.$.action, type),
            //resultedInFirstDown: inputPlay.$.first !== undefined ? true : false,
            //description: playDescription,
            //turnover: inputPlay.$.turnover, // todo: change F, I, etc. to more descriptive names
            score: scoreParser_1.parseScore(sanitizedPossession, type, String(inputPlay.$.uni), inputPlay.$.hscore, inputPlay.$.vscore) || undefined,
            possessionTeamName: inputPlay.$.team,
            possessionTeamCode: 0
        };
    }
    /**
     * Save a single play to Mongo.
     * Currently useful for testing; might later be useful for live game support
     * @param db Mongo DB
     */
    save(db) {
        return db.collection("plays").insertOne(this.prepareDynamicData())
            .then(() => this.getId());
    }
    /**
     * Get the data in this play ready for batch saving with mongo's insertMany function
     */
    prepareForBatchSave() {
        return this.prepareDynamicData();
    }
}
exports.Play = Play;
/**
 * Helper function to automate the parsing of all plays in a games
 * @param input List of all plays
 */
function parsePlays(input, sportCode) {
    let plays = [];
    if (input.period !== undefined) {
        for (const period of input.period) {
            const periodNum = period.$.number;
            const periodTime = period.$.time;
            const periodClock = period.clock[0].$.time;
            const playsInPeriod = period.play.map((inputPlay) => {
                const play = new Play();
                play.parse(inputPlay, periodNum, periodTime, periodClock, sportCode);
                return play;
            });
            plays = plays.concat(playsInPeriod);
        }
    }
    return plays;
}
exports.parsePlays = parsePlays;
//# sourceMappingURL=play.js.map