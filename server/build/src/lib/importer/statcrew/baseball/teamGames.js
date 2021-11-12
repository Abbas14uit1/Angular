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
const teamParser_1 = require("./helpers/teamParser");
const BaseballStatcrewImportBase_1 = require("../BaseballStatcrewImportBase");
/**
 * Team class manages the entire lifecycle of team data, from parsing
 * the Statcrew data up through saving to Mongo
 */
class TeamGame extends BaseballStatcrewImportBase_1.BaseballStatcrewImportBase {
    constructor() {
        super();
        this.dependents = [];
        this.alreadyExists = false;
        this.initialized = false;
        this.parsedData = {
            _id: undefined,
            games: [],
            players: [],
        };
    }
    /**
     * Get IDs of teams; queries Mongo by the team's abbreviation (ex: UA for University of Alabama)
     * and uses _id if found. If no ID is found, generates a new one.
     * Returns both the new/ existing ID and a flag saying whether the ID was generated or new.
     * @param db Mongo DB
     * @param home Home team to get ID for
     * @param visitor Visiting team to get ID for
     */
    generateId(db, sportCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let team = yield db.collection("teamGames").findOne({ "actualDate": this.parsedData.games.actualDate, "teamCode": this.parsedData.code,
                "sportCode": sportCode }, { fields: { _id: 1 } });
            let id;
            if (team && !isNaN(this.parsedData.code)) {
                id = team._id;
                this.alreadyExists = true;
                this.initialized = true;
            }
            else {
                id = new mongo.ObjectID().toHexString();
                this.alreadyExists = false;
                this.initialized = true;
            }
            return id;
        });
    }
    /**
     * Check whether team already exists in Mongo
     */
    getAlreadyExists() {
        if (this.initialized == false) {
            throw new Error("Trying to check existance before checking the DB for the ID");
        }
        else {
            return this.alreadyExists;
        }
    }
    /* istanbul ignore next */
    /**
     * Manually set a player as existing/ not existing in database.
     * Note: This should only be used in testing!
     * @param exists Boolean indicating whether a player already exists in DB
     */
    _setAlreadyExists(exists) {
        this.alreadyExists = exists;
        this.initialized = true;
    }
    /**
     * Prepare a team's static data for save.
     * Static data is team data which does not change between games/ seasons
     * such as team name.
     */
    prepareStaticData() {
        if (this.parsedData._id === undefined) {
            throw new Error("Trying to save data before all fields have been populated");
        }
        else {
            return {
                code: this.parsedData.code,
                _id: this.parsedData._id,
                name: this.parsedData.name,
                tidyName: this.parsedData.tidyName,
            };
        }
    }
    /**
     * Prepare a team's dynamic data for save.
     * Dynamic data is that which changes beteen games and seasons.
     */
    prepareDynamicData() {
        if (this.parsedData.games === undefined) {
            throw new Error("Trying to save data before all fields have been populated");
        }
        else {
            return {
                games: this.parsedData.games,
                record: this.parsedData.record,
                confRecord: this.parsedData.confRecord,
                rank: this.parsedData.rank,
                conference: this.parsedData.conference,
            };
        }
    }
    /**
     * Add a player's ID to the list of players on this team
     * @param id ID of player to associate with a team
     */
    updatePlayerRef(id) {
        this.parsedData.games.players.push(id);
    }
    /**
     * Add a game ID to this team to mark this team as being a part of a certain game
     * @param gameId ID of the game to associate with a team
     */
    updateGameRef(id) {
        this.parsedData.games.gameId = id;
    }
    updateTeamRef(id) {
        this.parsedData.games.teamId = id;
    }
    /**
     * Provide this MongoTeam instance's ID to instances of Mongo<Game|Player>
     * which need to know the ID of this game before they can be saved to Mongo.
     */
    updateDependents() {
    }
    /**
     * Parse team data into `this.parsedData`
     * @param inputTeam Statcrew team information
     * @param gameDate Date of the game
     */
    parse(inputTeam, opponent, gameDate, actualDate, sportCode, inputVenue) {
        this.parsedData = teamParser_1.parseTeam(inputTeam, opponent, gameDate, actualDate, sportCode, inputVenue);
    }
    /**
     * Save team information to Mongo.
     * If the team already exists, most data is left unchanged and new records are appended to the list of a
     * team's games and players. In other words, only dynamic data is saved.
     * If the team does not exist, both static and dynamic data is saved.
     * @param db Mongo DB
     */
    save(db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.getAlreadyExists()) {
                throw new Error("Game already exists in mongo.");
            }
            else {
                const teamData = Object.assign({}, this.prepareStaticData(), this.parsedData.games);
                return db.collection("teamGames").insert(teamData)
                    .then(() => this.getId());
            }
        });
    }
}
exports.TeamGame = TeamGame;
//# sourceMappingURL=teamGames.js.map