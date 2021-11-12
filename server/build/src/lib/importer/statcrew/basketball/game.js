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
const BasketballStatcrewImportBase_1 = require("../BasketballStatcrewImportBase");
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
class Game extends BasketballStatcrewImportBase_1.BasketballStatcrewImportBase {
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
            const game = yield db.collection("games")
                .findOne({
                sportCode: sportCode, "team.home.code": this.parsedData.team.home.code,
                "team.visitor.code": this.parsedData.team.visitor.code, actualDate: this.parsedData.actualDate
            }, { fields: { _id: 1 } });
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
        //Every play is different so adding the play is good enough.
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
                throw new Error("Game dependents must be team, player, play, or teamGame.");
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
        const officials = venue.officials[0].$;
        const venueRules = venue.rules[0].$;
        const parsedOfficials = [];
        // go from officials object to array of officials
        if (officials && officials.text.length > 0)
            for (const official in officials.text.split(",")) {
                parsedOfficials.push({
                    pos: "",
                    name: official,
                });
            }
        let venueStartTime;
        if (venueMeta.start === undefined || (venueMeta.start.length === undefined)) {
            venueStartTime = moment(venueMeta.time, "hh:mm A").toDate();
        }
        else {
            venueStartTime = moment(venueMeta.start, "hh:mm A").toDate();
        }
        return {
            startTime: venueStartTime,
            endTime: moment(venueMeta.end, "hh:mm A").toDate(),
            officials: parsedOfficials,
            rules: {
                minutes: venueRules.minutes,
                prds: venueRules.prds,
                minutesot: venueRules.minutesot,
                fouls: venueRules.fouls,
                qh: venueRules.qh,
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
        const nightGame = false; /* This information is missing in the xml */
        const conferenceGame = venueMeta.leaguegame === "Y";
        const postseasonGame = venueMeta.postseason === "Y";
        const stadium = typeof venueMeta.location != "number" ? venueMeta.location.split("-")[0] : "";
        const gameType = venueMeta.gametype.split(",");
        return {
            geoLocation: venueMeta.location,
            stadiumName: stadium,
            neutralLocation,
            nightGame,
            conferenceGame,
            postseasonGame,
            attendance: venueMeta.attend,
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
                score: team.linescore[0].$.score,
                record: team.$.record ? team.$.record.split("-") : [""],
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
     * @param inputDriveData Drive data from statcrew
     * @param parsedPlays List of parsed plays in Athlyte format
     */
    parse(inputVenueData, inputTeamData, inputSummaryData, parsedPlays) {
        const gameDate = moment(inputVenueData.$.date, "MM-DD-YYYY");
        const actualDate = inputVenueData.$.date;
        let periodClock = [];
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
            season: gameDate.subtract(4, "months").year(),
            meta: this.parseMeta(inputVenueData),
            venue: this.parseVenue(inputVenueData),
            team: this.parseTeam(inputTeamData),
            summary: parseSummary(inputSummaryData, periodClock),
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
function parseSummary(inputPeriodSummaries, periodClock) {
    let summary = [];
    let special = [];
    let totalOvertime = 0;
    for (const byPeriodSummary of inputPeriodSummaries.byprdsummary) {
        const period = byPeriodSummary.$.prd;
        summary.push(...parsePeriodSummary(byPeriodSummary.summary, period, periodClock));
        special.push(...parsePeriodSpecial(byPeriodSummary.special, period, periodClock));
        if (period > 2) {
            ++totalOvertime;
        }
    }
    return {
        periodSpecial: special,
        periodSummary: summary,
        totalOvertimePeriods: totalOvertime,
    };
}
exports.parseSummary = parseSummary;
/**
 * Translate the summary from statscrew to athlyte datastructure
 * @param plays List of plays (already parsed) in a game
 * @param longThresh Threshold for minimum number of yards in a long play; defaults to 70
 */
function parsePeriodSummary(inputPeriodSummaries, period, periodClock) {
    const athlytePeriodSummary = [];
    if (undefined == undefined || inputPeriodSummaries.length == 0) {
        return athlytePeriodSummary;
    }
    let vh = AthlyteImporter_1.VH.home;
    let counter = 0;
    for (const summary of inputPeriodSummaries) {
        if (summary.$.vh == "V")
            vh = AthlyteImporter_1.VH.visitor;
        athlytePeriodSummary.push({
            vh: vh,
            fgm: summary.$.fgm,
            fga: summary.$.fga,
            fgm3: summary.$.fgm3,
            fga3: summary.$.fga3,
            ftm: summary.$.ftm,
            fta: summary.$.fta,
            blk: summary.$.blk,
            stl: summary.$.stl,
            ast: summary.$.ast,
            oreb: summary.$.oreb,
            dreb: summary.$.dreb,
            treb: summary.$.treb,
            pf: summary.$.pf,
            tf: summary.$.tf,
            to: summary.$.to,
            prdClockTime: periodClock[counter++],
            prds: period,
        });
    }
    return athlytePeriodSummary;
}
exports.parsePeriodSummary = parsePeriodSummary;
/**
 * Translate the summary from statscrew to athlyte datastructure
 * @param plays List of plays (already parsed) in a game
 * @param longThresh Threshold for minimum number of yards in a long play; defaults to 70
 */
function parsePeriodSpecial(inputPeriodSpecial, period, periodClock) {
    let vh = AthlyteImporter_1.VH.home;
    const athlytePeriodSpecial = [];
    if (inputPeriodSpecial == undefined || inputPeriodSpecial.length == 0) {
        return athlytePeriodSpecial;
    }
    let counter = 0;
    for (const special of inputPeriodSpecial) {
        if (special.$.vh == "V")
            vh = AthlyteImporter_1.VH.visitor;
        athlytePeriodSpecial.push({
            vh: vh,
            ptsTo: special.$.pts_to,
            ptsCh2: special.$.pts_ch2,
            ptsPaint: special.$.pts_paint,
            ptsFastb: special.$.pts_fastb,
            ptsBench: special.$.pts_bench,
            ties: special.$.ties,
            leads: special.$.leads,
            possCount: special.$.poss_count,
            possTime: special.$.poss_time,
            scoreCount: special.$.score_count,
            scoreTime: special.$.score_time,
            leadTime: special.$.lead_time,
            tiedTime: special.$.tied_time,
            largeLead: special.$.large_lead,
            largeLeadT: special.$.large_lead_t,
            prdClockTime: periodClock[counter++],
            prds: period,
        });
    }
    return athlytePeriodSpecial;
}
exports.parsePeriodSpecial = parsePeriodSpecial;
//# sourceMappingURL=game.js.map