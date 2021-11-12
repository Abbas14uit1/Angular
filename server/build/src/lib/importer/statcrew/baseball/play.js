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
const playParser = require("./helpers/playParser");
const BaseballStatcrewImportBase_1 = require("../BaseballStatcrewImportBase");
const game_1 = require("./game");
const player_1 = require("./player");
/**
 * PlayClass manages the entire lifecycle of games,
 * from parsing the play data (from the output of xml2js)
 * to saving to Mongo.
 */
class Play extends BaseballStatcrewImportBase_1.BaseballStatcrewImportBase {
    constructor() {
        super();
        this.batInPlayVisitor = 0;
        this.batInPlayHome = 0;
        this.outInPlayVisitor = 0;
        this.outInPlayHome = 0;
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
        this.parsedData.playerIds.forEach((playerId, index) => {
            if (playerId == codeInGame) {
                this.parsedData.playerIds[index] = id;
            }
        });
        //this.parsedData.playerIds.push(id);
        let results = [];
        if (this.parsedData.results) {
            results = Object.getOwnPropertyNames(this.parsedData.results);
        }
        if (this.parsedData.results.sub && this.parsedData.results.sub.forId == codeInGame) {
            this.parsedData.results.sub.forId = id;
        }
        if (this.parsedData.results.sub && this.parsedData.results.sub.whoId == codeInGame) {
            this.parsedData.results.sub.whoId = id;
        }
        if (this.parsedData.results.batter && this.parsedData.results.batter.id === codeInGame) {
            this.parsedData.results.batter.id = id;
        }
        if (this.parsedData.results.pitcher && this.parsedData.results.pitcher.id === codeInGame) {
            this.parsedData.results.pitcher.id = id;
        }
        if (this.parsedData.results.runner && this.parsedData.results.runner.id === codeInGame) {
            this.parsedData.results.runner.id = id;
        }
        if (this.parsedData.results.fielder) {
            this.parsedData.results.fielder.forEach((fielder, index) => {
                if (fielder.id === codeInGame && this.parsedData.results.fielder) {
                    this.parsedData.results.fielder[index].id = id;
                }
            });
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
    parse(inputPlay, inningNumber, possession, teamId, sportCode) {
        let sanitizedPossession;
        if (possession !== "V" && possession !== "H") {
            throw new TypeError("Unexpected possession");
        }
        else {
            sanitizedPossession = possession === "H" ? AthlyteImporter_1.VH.home : AthlyteImporter_1.VH.visitor;
        }
        let batter;
        let outs = 0;
        if (inputPlay.batter) {
            batter = playParser.parseBatter(inputPlay.batter[0]);
            if (batter.out == 1) {
                outs = possession === "H" ? ++this.outInPlayHome : ++this.outInPlayVisitor;
            }
            else {
                outs = possession === "H" ? this.outInPlayHome : this.outInPlayVisitor;
            }
        }
        const playInBat = possession === "H" ? this.batInPlayHome++ : this.batInPlayVisitor++;
        this.parsedData = {
            gameId: "",
            sportCode: sportCode,
            possession: sanitizedPossession,
            inningNumber,
            playInBat,
            playInGame: inputPlay.$.seq,
            outs,
            description: inputPlay.narrative[0].$.text,
            batProf: inputPlay.$.batprof,
            pitchProf: inputPlay.$.pchprof,
            results: {
                batter: batter === undefined ? undefined : batter,
                sub: inputPlay.sub ? playParser.parseSub(inputPlay.sub[0]) : undefined,
                runner: inputPlay.runner ? playParser.parseRunner(inputPlay.runner[0]) : undefined,
                pitches: inputPlay.pitches ? playParser.parsePitches(inputPlay.pitches[0]) : undefined,
                pitcher: inputPlay.pitcher ? playParser.parsePitcher(inputPlay.pitcher[0]) : undefined,
                fielder: inputPlay.fielder ? playParser.parseFielder(inputPlay.fielder) : undefined,
            },
            score: inputPlay.runner ? inputPlay.runner[0].$.scored ? Number(inputPlay.runner[0].$.scored) : 0 : 0,
            playerIds: [],
            narrative: inputPlay.narrative[0].$.text,
        };
        if (this.parsedData.results.batter && batter) {
            this.parsedData.playerIds.push(batter.id ? batter.id : "");
        }
        if (this.parsedData.results.runner) {
            this.parsedData.playerIds.push(this.parsedData.results.runner.id ? this.parsedData.results.runner.id : "");
        }
        if (this.parsedData.results.pitcher) {
            this.parsedData.playerIds.push(this.parsedData.results.pitcher.id ? this.parsedData.results.pitcher.id : "");
        }
        if (this.parsedData.results.fielder) {
            this.parsedData.results.fielder.forEach((fielder, index) => {
                this.parsedData.playerIds.push(fielder.id ? fielder.id : "");
            });
        }
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
    for (const inning of input.inning) {
        const inningNum = inning.$.number;
        for (const batInning of inning.batting) {
            const vh = batInning.$.vh;
            const teamId = batInning.$.id;
            const playsInInning = batInning.play.map((inputPlay) => {
                const play = new Play();
                play.parse(inputPlay, inningNum, vh, teamId, sportCode);
                return play;
            });
            plays = plays.concat(playsInInning);
        }
    }
    return plays;
}
exports.parsePlays = parsePlays;
//# sourceMappingURL=play.js.map