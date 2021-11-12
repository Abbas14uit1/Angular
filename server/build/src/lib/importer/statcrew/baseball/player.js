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
const BaseballStatcrewImportBase_1 = require("../BaseballStatcrewImportBase");
const game_1 = require("./game");
const play_1 = require("./play");
const team_1 = require("./team");
const teamGames_1 = require("./teamGames");
const playerParser_1 = require("./helpers/playerParser");
const KeyedCollection_1 = require("../../../utility/KeyedCollection");
/**
 * Player class manages the entire lifecycle of player data,
 * from import from Statcrew JSON through saving to Mongo
 */
class Player extends BaseballStatcrewImportBase_1.BaseballStatcrewImportBase {
    constructor() {
        super();
        this.dependents = [];
        this.alreadyExists = false;
        this.initialized = false;
        this.parsedData = {
            _id: undefined,
            games: [],
            teamId: undefined,
        };
    }
    /**
     * Check whether a player exists in a Mongo DB. Returns the player's ID
     * if found; otherwise generates a new ID.
     * @param db Mongo DB connection
     */
    generateId(db, sportCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = db.collection("players")
                .findOne({ playerId: this.parsedData.playerId, sportCode: sportCode, teamCode: this.parsedData.teamCode }, { fields: { _id: 1 } }); // Need to check team code
            const existingPlayerId = yield query;
            let id;
            if (existingPlayerId) {
                id = existingPlayerId._id;
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
     * Check whether a player already exists in Mongo
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
     * Prepare dynamic player data (data which may change from game to game)
     * for saving to Mongo
     */
    prepareDynamicData() {
        if (this.parsedData.games.length === 0) {
            throw new Error("Trying to save data before all fields have been populated");
        }
        else {
            return {
                games: this.parsedData.games,
            };
        }
    }
    /**
     * Prepare static player data (data which does not change from game to game)
     * for saving to Mongo
     */
    prepareStaticData() {
        if (this.parsedData._id === undefined || this.parsedData.teamId === undefined) {
            throw new Error("Trying to save data before all fields have been populated");
        }
        else {
            return {
                _id: this.parsedData._id,
                name: this.parsedData.name,
                sportCode: this.parsedData.sportCode,
                teamCode: this.parsedData.teamCode,
                teamId: this.parsedData.teamId,
                teamName: this.parsedData.teamName,
                teamTidyName: this.parsedData.teamTidyName,
                tidyName: this.parsedData.tidyName,
                playerId: this.parsedData.playerId,
                teamConference: this.parsedData.teamConference,
                teamConferenceDivision: this.parsedData.teamConferenceDivision,
            };
        }
    }
    /**
     * Mark a player as being involved in a play (ex: threw a pass) by adding
     * the ID of that play to the player's list of plays.
     * @param id ID of the play involving this player
     */
    updatePlayRef(id) {
        this.parsedData.games[0].plays.push(id);
    }
    /**
     * Mark a player as being involved in a game, regardless of
     * whether they started or played.
     * @param id ID of the game involving this player
     */
    updateGameRef(id) {
        this.parsedData.games[0].gameId = id;
    }
    /**
     * Mark a player as being a member of a team; technically only
     * necessary for the static (initial) data.
     * @param id ID of the team this player belongs to
     */
    updateTeamRef(id) {
        this.parsedData.teamId = id;
    }
    /**
     * Update the dependents of this player.
     * Calling this function will pass the ID of this player to the instances
     * of <Team|Player|Game>Class that need to know this player's ID before saving.
     */
    updateDependents() {
        for (const dependent of this.dependents) {
            if (dependent instanceof team_1.Team ||
                dependent instanceof game_1.Game ||
                dependent instanceof teamGames_1.TeamGame) {
                dependent.updatePlayerRef(this.getId());
            }
            else if (dependent instanceof play_1.Play) {
                dependent.updatePlayerRef(this.getId(), this.parsedData.games[0].codeInGame);
            }
            else {
                throw new Error("Dependents of player must be team or play");
            }
        }
    }
    /**
     * Parses the player information using a helper function
     * @param player the player information to parse
     * @param teamName name of the team the player is on
     * @param side visitor or home of team
     * @param gameDate date of the game
     */
    parse(player, teamCode, teamName, teamTidyName, confName, confDivision, opponentCode, opponentName, oppoConfName, oppoConfDivision, side, gameDate, actualDate, sportCode) {
        this.parsedData = playerParser_1.parsePlayer(player, teamCode, teamName, teamTidyName, confName, confDivision, opponentCode, opponentName, oppoConfName, oppoConfDivision, side, gameDate, actualDate, sportCode);
        Player.playerRef.Add(player.$.name, Number(player.$.uni));
    }
    /**
     * Saves the player to the database
     * updates the player if it already exists, otherwise inserts
     * @param db mongo database
     */
    save(db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.getAlreadyExists()) {
                const updateCommand = {
                    q: { _id: this.getId() },
                    u: { $push: { games: { $each: this.prepareDynamicData().games } } },
                    multi: false,
                    upsert: false,
                };
                return db.command({
                    update: "players",
                    updates: [updateCommand],
                    ordered: true,
                }).then(() => this.getId());
            }
            else {
                const preparedData = Object.assign({}, this.prepareStaticData(), this.prepareDynamicData());
                return db.collection("players").insert(preparedData)
                    .then(() => this.getId());
            }
        });
    }
    /**
     * Prepares the player for batch saving
     * returns either the command to update the player, or the player object to insert if it's new
     */
    prepareForBatchSave() {
        if (this.getAlreadyExists()) {
            return ({
                q: { _id: this.getId() },
                u: { $push: { games: { $each: this.prepareDynamicData().games } } },
                multi: false,
                upsert: false,
            });
        }
        else {
            return Object.assign({}, this.prepareStaticData(), this.prepareDynamicData());
        }
    }
}
Player.playerRef = new KeyedCollection_1.KeyedCollection();
exports.Player = Player;
//# sourceMappingURL=player.js.map