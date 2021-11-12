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
const moment = require("moment");
const mongo = require("mongodb");
const AthlyteImporter_1 = require("../../../importer/AthlyteImporter");
const BaseballStatcrewImportBase_1 = require("../BaseballStatcrewImportBase");
const play_1 = require("./play");
const player_1 = require("./player");
const team_1 = require("./team");
const teamGames_1 = require("./teamGames");
// interfaces
/**
 * GameClass manages the entire lifecycle of games,
 * from parsing the game data (from the output of xml2js)
 * to saving to Mongo.
 */
class Game extends BaseballStatcrewImportBase_1.BaseballStatcrewImportBase {
    constructor() {
        super();
        this.dependents = [];
        this.alreadyExists = false;
        this.initialized = false;
        this.parsedData = {
            _id: undefined,
            playerIds: [],
            playIds: [],
            teamIds: {},
        };
    }
    /**
     * Generate an ID for this game. Checks database before generating a new one
     * to set `this.alreadyExists`, which indicates that a game should be deleted
     * before resaving an updated version to Mongo.
     * @param db Mongo DB
     */
    generateId(db, sportCode) {
        return __awaiter(this, void 0, void 0, function* () {
            // added another codition for double header game. In single day team will play with same opponent two games. Scenario in MBA now.
            const game = yield db.collection("games")
                .findOne({ sportCode: sportCode, "team.home.code": this.parsedData.team.home.code,
                "team.visitor.code": this.parsedData.team.visitor.code, actualDate: this.parsedData.actualDate,
                "venue.dhGame": this.parsedData.venue.dhGame }, { fields: { _id: 1 } });
            let id;
            if (game) {
                id = game._id;
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
     * Check flag to see whether this game already exists in DB; throws error
     * if `this.alreadyExists` flag is undefined because `this.generateId()` has not
     * been called yet.
     */
    getAlreadyExists() {
        if (this.initialized == false) {
            throw new Error("Trying to check existance before checking the DB for the ID");
        }
        else {
            return this.alreadyExists;
        }
    }
    /**
     * Prepare "dynamic" data for saving to Mongo; all data for a game
     * is considered to be dynamic since no game shares information with other games.
     * By comparison, some data about players (such as name) is constant between games.
     */
    prepareDynamicData() {
        if (this.parsedData._id === undefined) {
            throw new Error("Trying to save game data before ID field has been populated");
        }
        else if (!this.parsedData.teamIds.home || !this.parsedData.teamIds.visitor) {
            throw new Error("Trying to save game data before team IDs have been populated");
        }
        else if (this.parsedData.playerIds.length === 0) {
            throw new Error("Trying to save game data before player IDs have been populated");
        }
        else if (this.parsedData.playIds.length === 0) {
            throw new Error("Trying to save game data before play IDs have been populated");
        }
        else {
            return this.parsedData;
        }
    }
    /* istanbul ignore next */
    /**
     * Preparing static data is a noop for game, since everything is dynamic
     */
    prepareStaticData() {
        return;
    }
    /**
     * Add an ID of a team to this game to be either the home or visitor team
     * @param teamStatus Flag stating whether the team (teamId = newId) was home or visitor for the game
     * @param newId ID of the team which is being added to this team
     */
    updateTeamRef(teamStatus, newId) {
        // add team IDs to their drives
        if (this.parsedData.summary && this.parsedData.summary.battingDetails) {
            this.parsedData.summary.battingDetails.forEach((battingDetail) => {
                if (battingDetail.team === teamStatus) {
                    battingDetail.teamId = newId;
                }
            });
        }
        // add team IDs to the game
        if (teamStatus === AthlyteImporter_1.VH.home) {
            this.parsedData.teamIds.home = newId;
        }
        else if (teamStatus === AthlyteImporter_1.VH.visitor) {
            this.parsedData.teamIds.visitor = newId;
        }
        else {
            throw new Error("Updating unexpected team");
        }
    }
    /**
     * Add a play ID to this Game instance
     * @param newId ID of the play to associate with this game
     */
    updatePlayRef(newId) {
        this.parsedData.playIds.push(newId);
    }
    /**
     * Add a player ID to this Game instance
     * Players are added regardless of whether they played or not.
     * @param newId ID of the player to associate with this game
     */
    updatePlayerRef(newId) {
        this.parsedData.playerIds.push(newId);
    }
    /**
     * Update dependents of this Game instance,
     * where dependents are instances of Mongo<Team|Player|Player>
     * which require the ID of this game before saving.
     */
    updateDependents() {
        for (const dependent of this.dependents) {
            if (dependent instanceof team_1.Team ||
                dependent instanceof player_1.Player ||
                dependent instanceof play_1.Play ||
                dependent instanceof teamGames_1.TeamGame) {
                dependent.updateGameRef(this.getId());
            }
            else {
                throw new Error("Game dependents must be team, player, play, or teamGames");
            }
        }
    }
    /**
     * Get metadata about the game, such as the start/ end times and officiating crew.
     * @param venue Statcrew information about the venue, including information such
     * as date and location
     */
    parseMeta(venue) {
        const venueMeta = venue.$;
        const officials = venue.umpires[0].$;
        const venueRules = venue.rules[0].$;
        const parsedOfficials = [];
        // go from officials object to array of officials    
        for (const official in officials) {
            /* istanbul ignore else */
            if (officials.hasOwnProperty(official)) {
                parsedOfficials.push({
                    pos: official,
                    name: officials[official],
                });
            }
        }
        return {
            startTime: moment(venueMeta.start, "hh:mm A").toDate(),
            endTime: moment(venueMeta.end, "hh:mm A").toDate(),
            umpires: parsedOfficials,
            rules: {
                innings: venueMeta.schedinn,
                batters: venueRules.batters,
                usedh: venueRules.usedh,
            },
        };
    }
    /**
     * Get venue information, such as location and weather
     * @param venue Statcrew information about the venue
     */
    parseVenue(venue) {
        const venueMeta = venue.$;
        const neutralLocation = venueMeta.neutralgame === "Y";
        const nightGame = venueMeta.nitegame === "Y";
        const conferenceGame = venueMeta.leaguegame === "Y";
        const postseasonGame = venueMeta.postseason === "Y";
        const gameType = venueMeta.gametype.split(",");
        return {
            geoLocation: venueMeta.location,
            stadiumName: venueMeta.stadium,
            neutralLocation,
            nightGame,
            dhGame: venueMeta.dhgame === null ? undefined : venueMeta.dhgame,
            series: venueMeta.series,
            schedInn: venueMeta.schedinn,
            schedNote: venueMeta.schednote,
            conferenceGame,
            postseasonGame,
            attendance: venueMeta.attend,
            temperatureF: venueMeta.temp,
            wind: venueMeta.wind === null ? undefined : venueMeta.wind,
            weather: venueMeta.weather,
            gameType: gameType,
        };
    }
    /**
     * Get an overview of the teams in a game; limited to their short name (i.e. "UA)
     * and normal name (i.e. "University of Alabama")
     * @param teams Statcrew information about the two teams playing in the game
     */
    parseTeam(teams) {
        const teamInfo = {};
        for (const team of teams) {
            const info = {
                id: team.$.id,
                name: team.$.name,
                code: team.$.code,
                score: team.linescore[0].$.runs,
                runs: team.linescore[0].$.runs,
                hits: team.linescore[0].$.hits,
                errs: team.linescore[0].$.errs,
                lob: team.linescore[0].$.lob,
            };
            if (team.$.vh === "H") {
                teamInfo.home = info;
            }
            else if (team.$.vh === "V") {
                teamInfo.visitor = info;
            }
            else {
                throw new TypeError("Could not recognize visitor/ home status");
            }
        }
        return teamInfo;
    }
    /**
     * Parse a game to extract relevant information to add to `this.parsedData`
     * @param inputVenueData Venue data from Statcrew
     * @param inputTeamData Team data from Statcrew
     * @param parsedPlays List of parsed plays in Athlyte format
     */
    parse(inputVenueData, inputTeamData, plays) {
        const gameDate = moment(inputVenueData.$.date, "MM-DD-YYYY");
        const actualDate = inputVenueData.$.date;
        //winstonLogger.log("info", "actual date " + actualDate);
        // form Athlyte game object
        const gameInfo = {
            _id: "",
            playerIds: [],
            playIds: [],
            sportCode: inputVenueData.$.sportcode,
            teamIds: {
                home: undefined,
                visitor: undefined,
            },
            gameDate: gameDate.toDate(),
            actualDate: actualDate,
            season: gameDate.subtract(7, "months").year(),
            meta: this.parseMeta(inputVenueData),
            venue: this.parseVenue(inputVenueData),
            team: this.parseTeam(inputTeamData),
            summary: parseSummary(plays, inputTeamData),
        };
        this.parsedData = gameInfo;
    }
    /**
     * Save a game to Mongo
     * @param db Mongo DB
     */
    save(db) {
        return db.collection("games").insert(this.prepareDynamicData())
            .then(() => this.getId());
    }
}
exports.Game = Game;
/**
 * Get a summary of notable plays in a game, such as scores, drive starts/ ends, field goals, etc.
 * Populates each field (scores, dcrives, fgas, etc.) with the index of that play in the overall list of plays
 * @param plays List of plays (already parsed) in a game
 * @param longThresh Threshold for minimum number of yards in a long play; defaults to 70
 */
function parseSummary(plays, teams, longThresh = 70) {
    const scores = [];
    const played = [];
    const battingDetails = [];
    const driveStartStop = [];
    const fgas = [];
    const longplay = [];
    const driveIndex = 0;
    const teamNames = []; //Note: index 0 is always home team
    //let scoringDrive: number | undefined; // drive is considered over when a score happens (or ends with turnover)
    if (teams[0].$.vh == 'H') {
        teamNames.push(teams[0].$);
        teamNames.push(teams[1].$);
    }
    else {
        teamNames.push(teams[1].$);
        teamNames.push(teams[0].$);
    }
    if (teams[0].linescore[0].lineinn !== undefined) {
        teams[0].linescore[0].lineinn.forEach((lineInn, index) => {
            if (lineInn.$.score !== 'X') {
                scores.push(Number(lineInn.$.score));
                played.push(true);
            }
            else {
                scores.push(0);
                played.push(false);
            }
        });
    }
    for (const inning of plays[0].inning) {
        let battingDetail;
        battingDetails.push({
            team: inning.batting[0].$.vh == 'H' ? AthlyteImporter_1.VH.home : AthlyteImporter_1.VH.visitor,
            teamName: inning.batting[0].$.vh == 'H' ? teamNames[0].name : teamNames[1].name,
            code: inning.batting[0].$.vh == 'H' ? teamNames[0].code : teamNames[1].code,
            inning: inning.$.number,
            num: inning.$.number,
            r: inning.batting[0].innsummary[0].r,
            h: inning.batting[0].innsummary[0].h,
            e: inning.batting[0].innsummary[0].e,
            lob: inning.batting[0].innsummary[0].lob,
            plays: inning.batting[0].play.length,
        });
        if (!inning.batting[1]) {
            continue;
        }
        battingDetails.push({
            team: inning.batting[1].$.vh == 'H' ? AthlyteImporter_1.VH.home : AthlyteImporter_1.VH.visitor,
            teamName: inning.batting[1].$.vh == 'H' ? teamNames[0].name : teamNames[1].name,
            code: inning.batting[0].$.vh == 'H' ? teamNames[0].code : teamNames[1].code,
            inning: inning.$.number,
            num: inning.$.number,
            r: inning.batting[1].innsummary[0].r,
            h: inning.batting[1].innsummary[0].h,
            e: inning.batting[1].innsummary[0].e,
            lob: inning.batting[1].innsummary[0].lob,
            plays: inning.batting[1].play.length,
        });
    }
    return {
        scores,
        played,
        battingDetails,
    };
}
exports.parseSummary = parseSummary;
//# sourceMappingURL=game.js.map