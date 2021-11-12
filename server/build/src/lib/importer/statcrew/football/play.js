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
const winstonLogger_1 = require("../../../winstonLogger");
const AthlyteImporter_1 = require("../../AthlyteImporter");
const playTokenParser_1 = require("../helpers/playTokenParser");
const scoreParser_1 = require("../helpers/scoreParser");
const StatcrewImportBase_1 = require("../StatcrewImportBase");
const game_1 = require("./game");
const player_1 = require("./player");
/**
 * PlayClass manages the entire lifecycle of games,
 * from parsing the play data (from the output of xml2js)
 * to saving to Mongo.
 */
class Play extends StatcrewImportBase_1.StatcrewImportBase {
    /**
     * Convert a starting location string into an object with side and yardline properties
     * @param startPos Starting position string, in format V20, H35, or similar
     */
    static parsePlayStartLocation(startPos) {
        const side = startPos[0];
        const yardline = Number.parseInt(startPos.substr(1));
        if ((side === "V" || side === "H") && (Number.isFinite(yardline))
            && yardline >= 0 && yardline <= 50) {
            return {
                side: side === "H" ? AthlyteImporter_1.VH.home : AthlyteImporter_1.VH.visitor,
                yardline,
                endzone: false,
            };
        }
        else {
            throw new TypeError("Unexpected value in field position string");
        }
    }
    /**
     * Parse play end location (before penalties are applied)
     * TODO: handling plays with multiple starts/ ends, as in cases of interceptions?
     * @param parsedTokens Tokens containing information about the end of the play, such as TD or tackle
     */
    static parsePlayEndLocation(parsedTokens, start) {
        if (parsedTokens.noplay) {
            return start;
        }
        if (parsedTokens.pass) {
            if (!parsedTokens.pass.wasIntercepted) {
                // incomplete passes still count; are used for sacks
                if (parsedTokens.pass.wasCompleted || parsedTokens.sack) {
                    // both completions and sacks are defined in the pass ending location
                    return parsedTokens.pass.endingLocation;
                }
                return start;
            }
            else {
                // Note: intercepted passes are counted as ending at the ending locatation AFTER the interception
                return parsedTokens.pass.endingLocation;
            }
        }
        else if (parsedTokens.rush) {
            return parsedTokens.rush.endingLocation;
        }
        else if (parsedTokens.kickoff && parsedTokens.return) {
            // possibility for kick return
            return parsedTokens.return.ballReturnedTo;
        }
        // fallback
        return;
    }
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
    generateId(db) {
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
        this.parsedData.playerIds.push(id);
        let results = [];
        if (this.parsedData.results) {
            results = Object.getOwnPropertyNames(this.parsedData.results);
        }
        for (const result of results) {
            switch (result) {
                case "kickoff":
                    if (this.parsedData.results.kickoff.kickerId === codeInGame) {
                        this.parsedData.results.kickoff.kickerId = id;
                    }
                    break;
                case "pass":
                    if (this.parsedData.results.pass.passerId === codeInGame) {
                        this.parsedData.results.pass.passerId = id;
                    }
                    if (this.parsedData.results.pass.receiverId === codeInGame) {
                        this.parsedData.results.pass.receiverId = id;
                    }
                    break;
                case "brokenUp":
                    if (this.parsedData.results.brokenUp.breakingUpId === codeInGame) {
                        this.parsedData.results.brokenUp.breakingUpId = id;
                    }
                    break;
                case "tackle":
                    for (const tackle of this.parsedData.results.tackle) {
                        if (tackle.tacklerId === codeInGame) {
                            tackle.tacklerId = id;
                        }
                    }
                    break;
                case "return":
                    if (this.parsedData.results.return.returnerId === codeInGame) {
                        this.parsedData.results.return.returnerId = id;
                    }
                    break;
                case "pointAfterTd":
                    if (this.parsedData.results.pointAfterTd.playerId === codeInGame) {
                        this.parsedData.results.pointAfterTd.playerId = id;
                    }
                    break;
                case "rush":
                    if (this.parsedData.results.rush.rusherId === codeInGame) {
                        this.parsedData.results.rush.rusherId = id;
                    }
                    break;
                case "sack":
                    for (const sack of this.parsedData.results.sack.sackerIds) {
                        if (sack === codeInGame) {
                            this.parsedData.results.sack.sackerIds[this.parsedData.results.sack.sackerIds.indexOf(sack)] = id;
                        }
                    }
                    break;
                case "punt":
                    if (this.parsedData.results.punt.punterId === codeInGame) {
                        this.parsedData.results.punt.punterId = id;
                    }
                    if (this.parsedData.results.punt.recoveringId && this.parsedData.results.punt.recoveringId === codeInGame) {
                        this.parsedData.results.punt.recoveringId = id;
                    }
                    break;
                case "fumble":
                    if (this.parsedData.results.fumble.fumbledBy === codeInGame) {
                        this.parsedData.results.fumble.fumbledBy = id;
                    }
                    break;
                case "fumbleForced":
                    if (this.parsedData.results.fumbleForced.forcerId === codeInGame) {
                        this.parsedData.results.fumbleForced.forcerId = id;
                    }
                    break;
                case "fumbleRecovery":
                    if (this.parsedData.results.fumbleRecovery.recoveringId === codeInGame) {
                        this.parsedData.results.fumbleRecovery.recoveringId = id;
                    }
                    break;
                case "qbHurry":
                    if (this.parsedData.results.qbHurry.playerId === codeInGame) {
                        this.parsedData.results.qbHurry.playerId = id;
                    }
                    break;
                case "fga":
                    if (this.parsedData.results.fga.kickerId === codeInGame) {
                        this.parsedData.results.fga.kickerId = id;
                    }
                    break;
                case "fairCatch":
                    if (this.parsedData.results.fairCatch.callerId === codeInGame) {
                        this.parsedData.results.fairCatch.callerId = id;
                    }
                    break;
                case "penalty":
                    if (this.parsedData.results.penalty.accepted &&
                        this.parsedData.results.penalty.details.playerDrawingPenalty === codeInGame) {
                        this.parsedData.results.penalty.details.playerDrawingPenalty = id;
                    }
                    break;
                case "safety":
                    if (this.parsedData.results.safety.playerId === codeInGame) {
                        this.parsedData.results.safety.playerId = id;
                    }
                    break;
                case "block":
                    if (this.parsedData.results.block.blockerId === codeInGame) {
                        this.parsedData.results.block.blockerId = id;
                    }
                    break;
                case "playersInvolved":
                    for (const player of this.parsedData.results.playersInvolved) {
                        if (player === codeInGame) {
                            this.parsedData.results.playersInvolved[this.parsedData.results.playersInvolved.indexOf(player)] = id;
                        }
                    }
                    break;
            }
        }
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
    parse(inputPlay, quarter) {
        const [possession, down, togo, startFieldPos] = inputPlay.$.context.split(",");
        const [drive, playIndexInDrive, playInGame] = inputPlay.$.playid.split(",");
        const [minutes, seconds] = inputPlay.$.clock ? inputPlay.$.clock.split(":") : ["0", "0"];
        const playDescription = inputPlay.$.text;
        const sanitizedDown = Number.parseInt(down);
        let sanitizedPossession;
        if (sanitizedDown < 1 || sanitizedDown > 4) {
            throw new TypeError("Down number is outside expected range");
        }
        if (possession !== "V" && possession !== "H") {
            throw new TypeError("Unexpected possession");
        }
        else {
            sanitizedPossession = possession === "H" ? AthlyteImporter_1.VH.home : AthlyteImporter_1.VH.visitor;
        }
        const tokenParser = new playTokenParser_1.TokenParser(inputPlay.$.tokens, sanitizedPossession, inputPlay.$.turnover);
        let parsedTokens;
        try {
            parsedTokens = tokenParser.parse();
        }
        catch (err) {
            winstonLogger_1.winstonLogger.log("error", "unexpected tokens " + inputPlay.$.tokens);
            winstonLogger_1.winstonLogger.log("error", err.message);
            parsedTokens = { playersInvolved: [] };
        }
        const playStartLocation = Play.parsePlayStartLocation(startFieldPos);
        this.parsedData = {
            gameId: "",
            playerIds: [],
            sportCode: "MFB",
            possession: sanitizedPossession,
            quarter,
            playInDrive: Number.parseInt(playIndexInDrive),
            down: sanitizedDown,
            drive: Number.parseInt(drive),
            playInGame: Number.parseInt(playInGame),
            playStartLocation,
            playEndLocation: Play.parsePlayEndLocation(parsedTokens, playStartLocation) || undefined,
            yardsToGo: Number.parseInt(togo),
            // TODO: game clock start time not always defined
            gameClockStartTime: { minutes: Number.parseInt(minutes), seconds: Number.parseInt(seconds) },
            resultedInFirstDown: inputPlay.$.first !== undefined ? true : false,
            description: playDescription,
            turnover: inputPlay.$.turnover,
            score: scoreParser_1.parseScore(parsedTokens, playStartLocation, sanitizedPossession, inputPlay.$.type, inputPlay.$.turnover, inputPlay.$.vscore, inputPlay.$.hscore) || undefined,
            results: parsedTokens,
            tokens: inputPlay.$.tokens,
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
    /**
     * Creates a empty play in case there is no plays available in the game xml
    */
    createAEmptyPlay() {
        this.parsedData = {
            gameId: "",
            playerIds: [],
            sportCode: "MFB",
            possession: AthlyteImporter_1.VH.home,
            down: 0,
            playStartLocation: { side: AthlyteImporter_1.VH.home,
                yardline: 0,
                endzone: false },
            yardsToGo: 10,
            gameClockStartTime: { minutes: 0,
                seconds: 0 },
            resultedInFirstDown: false,
            description: "No Play",
            quarter: 0,
            playInDrive: 0,
            drive: 0,
            playInGame: 0,
            results: { playersInvolved: ["none"] },
            tokens: "",
        };
    }
}
exports.Play = Play;
/**
 * Helper function to automate the parsing of all plays in a games
 * @param input List of all plays
 */
function parsePlays(input) {
    let plays = [];
    for (const quarter of input.qtr) {
        try {
            const qtrNum = quarter.$.number;
            let error = false;
            const playsInQtr = quarter.play.reduce((acc, inputPlay) => {
                const play = new Play();
                try {
                    play.parse(inputPlay, qtrNum);
                    acc.push(play);
                }
                catch (err) {
                    winstonLogger_1.winstonLogger.log("error", "Error in parsing a play element");
                    winstonLogger_1.winstonLogger.log("error", err.message);
                }
                return acc;
            }, []);
            plays = plays.concat(playsInQtr);
        }
        catch (err) {
            winstonLogger_1.winstonLogger.log("error", "Error in parsing a play element, ignore the entire qtr ");
            winstonLogger_1.winstonLogger.log("error", err.message);
        }
    }
    if (plays.length === 0) {
        // May be the file has no plays
        let play = new Play();
        play.createAEmptyPlay();
        plays = plays.concat(play);
    }
    return plays;
}
exports.parsePlays = parsePlays;
//# sourceMappingURL=play.js.map