"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const AthlyteImporter_1 = require("../../../AthlyteImporter");
/**
 * Get information about a team from the statcrew JSON
 * @param inputTeam team information from the statcrew JSON
 * @param quarters the quarter information from the statcrew JSON
 * @param gameDate the date of the game
 * @param actualDate the actual date of the game as a string (actual string from XML)
 */
function parseTeam(inputTeam, opponent, gameDate, actualDate, sportCode, inputVenueData) {
    const { code, name, tidyName } = parseMeta(inputTeam);
    const opponentCode = parseMeta(opponent).code;
    const opponentName = parseMeta(opponent).name;
    const linescore = parseLineScore(inputTeam);
    const record = parseRecords(inputTeam);
    const side = parseSide(inputTeam.$.vh);
    const totals = parseTotals(inputTeam);
    const players = [];
    const opponentConference = parseMeta(opponent).conf;
    const opponentConferenceDivision = parseMeta(opponent).confDivision;
    const conference = parseMeta(inputTeam).conf;
    const conferenceDivision = parseMeta(inputTeam).confDivision;
    const teamInfo = parseTeamInfo([inputTeam, opponent]);
    const venueData = parseVenue(inputVenueData);
    const metaData = parseStartTime(inputVenueData);
    const team = {
        games: {
            homeAway: side,
            opponentCode,
            opponentName,
            opponentConference,
            opponentConferenceDivision,
            conference,
            conferenceDivision,
            linescore,
            sportCode: sportCode,
            record,
            gameDate,
            actualDate,
            totals,
            season: moment(gameDate).subtract(4, "months").year(),
            homeTeam: teamInfo.home,
            visitorTeam: teamInfo.visitor,
            gameType: venueData.gameType,
            geoLocation: venueData.geoLocation,
            attendance: venueData.attendance,
            nightGame: venueData.nightGame,
            neutralLocation: venueData.neutralLocation,
            startTime: metaData.startTime,
            players: players,
        },
        code,
        name,
        tidyName,
    };
    return team;
}
exports.parseTeam = parseTeam;
/**
 * parse the team meta information, such as name, team code
 * @param team team information from statcrew JSON
 */
function parseMeta(team) {
    const metaInfo = team.$;
    // const record = team.$.record.split("-");  
    if (!metaInfo.code) {
        throw (Error("Missing team code"));
    }
    return {
        code: Number(metaInfo.code),
        tidyName: metaInfo.id,
        name: metaInfo.name,
        conf: metaInfo.conf,
        confDivision: metaInfo.confdivision
    };
}
exports.parseMeta = parseMeta;
/**
   * Get an overview of the teams in a game; limited to their short name (i.e. "UA)
   * and normal name (i.e. "University of Alabama")
   * @param teams Statcrew information about the two teams playing in the game
   */
function parseTeamInfo(teams) {
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
exports.parseTeamInfo = parseTeamInfo;
function parseVenue(venue) {
    const venueMeta = venue.$;
    const neutralLocation = venueMeta.neutralgame === "Y";
    const nightGame = false; /* This information is missing in the xml */
    const conferenceGame = venueMeta.leaguegame === "Y";
    const postseasonGame = venueMeta.postseason === "Y";
    const stadium = typeof venueMeta.location != "number" ? venueMeta.location.split("-")[0] : "";
    const gameType = venueMeta.gametype !== undefined ? venueMeta.gametype.split(",") : [];
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
exports.parseVenue = parseVenue;
function parseStartTime(venue) {
    const venueMeta = venue.$;
    const officials = venue.officials[0].$;
    const venueRules = venue.rules[0].$;
    const parsedOfficials = [];
    let venueStartTime;
    if (venueMeta.start === undefined || venueMeta.start === null || (venueMeta.start.length === undefined)) {
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
exports.parseStartTime = parseStartTime;
/**
 * parse whether the team was home or visitor
 * @param side visitor or home
 */
function parseSide(side) {
    if (side === "H") {
        return AthlyteImporter_1.VH.home;
    }
    else if (side === "V") {
        return AthlyteImporter_1.VH.visitor;
    }
    else {
        throw new Error("Statcrew team value was not V or H");
    }
}
/**
 * parse the team totals information, such as name, hitting, pitch summary
 * @param team team information from statcrew JSON
 */
function parseTotals(team) {
    const stats = {
        fgm: Number(team.totals[0].stats[0].$.fgm),
        fga: Number(team.totals[0].stats[0].$.fga),
        fgm3: Number(team.totals[0].stats[0].$.fgm3),
        fga3: Number(team.totals[0].stats[0].$.fga3),
        ftm: Number(team.totals[0].stats[0].$.ftm),
        fta: Number(team.totals[0].stats[0].$.fta),
        tp: Number(team.totals[0].stats[0].$.tp),
        blk: Number(team.totals[0].stats[0].$.blk),
        stl: Number(team.totals[0].stats[0].$.stl),
        ast: Number(team.totals[0].stats[0].$.ast),
        min: Number(team.totals[0].stats[0].$.min),
        oreb: Number(team.totals[0].stats[0].$.oreb),
        dreb: Number(team.totals[0].stats[0].$.dreb),
        treb: Number(team.totals[0].stats[0].$.treb),
        pf: Number(team.totals[0].stats[0].$.pf),
        tf: Number(team.totals[0].stats[0].$.tf),
        to: Number(team.totals[0].stats[0].$.to),
        deadball: parseDeadball(team.totals[0].stats[0].$.deadball),
        deadballByPeriod: team.totals[0].stats[0].$.deadball != undefined && typeof team.totals[0].stats[0].$.deadball != "number" ? team.totals[0].stats[0].$.deadball.split(",").map(Number) : [0],
        fgpct: Number(team.totals[0].stats[0].$.fgpct),
        fg3pct: Number(team.totals[0].stats[0].$.fg3pct),
        ftpct: team.totals[0].stats[0].$.ftpct,
    };
    let special;
    if (team.totals[0].special !== undefined && team.totals[0].special[0]) {
        special = {
            vh: parseSide(team.totals[0].special[0].$.vh),
            ptsTo: team.totals[0].special[0].$.pts_to,
            ptsCh2: team.totals[0].special[0].$.pts_ch2,
            ptsPaint: team.totals[0].special[0].$.pts_paint,
            ptsFastb: team.totals[0].special[0].$.pts_fastb,
            ptsBench: team.totals[0].special[0].$.pts_bench,
            ties: team.totals[0].special[0].$.ties,
            tiedTime: team.totals[0].special[0].$.tied_time,
            leads: team.totals[0].special[0].$.leads,
            leadTime: team.totals[0].special[0].$.lead_time,
            possCount: team.totals[0].special[0].$.poss_count,
            possTime: team.totals[0].special[0].$.poss_time,
            scoreCount: team.totals[0].special[0].$.score_count,
            scoreTime: team.totals[0].special[0].$.score_time,
            largeLead: team.totals[0].special[0].$.large_lead,
            largeLeadT: team.totals[0].special[0].$.large_lead_t,
        };
    }
    let statsbyprd1;
    let statsbyprd2;
    if (team.totals[0].statsbyprd !== undefined && team.totals[0].statsbyprd[0]) {
        statsbyprd1 = {
            prd: 1,
            fgm: Number(team.totals[0].statsbyprd[0].$.fgm),
            fga: Number(team.totals[0].statsbyprd[0].$.fga),
            fgm3: Number(team.totals[0].statsbyprd[0].$.fgm3),
            fga3: Number(team.totals[0].statsbyprd[0].$.fga3),
            ftm: Number(team.totals[0].statsbyprd[0].$.ftm),
            fta: Number(team.totals[0].statsbyprd[0].$.fta),
            tp: Number(team.totals[0].statsbyprd[0].$.tp),
            blk: Number(team.totals[0].statsbyprd[0].$.blk),
            stl: Number(team.totals[0].statsbyprd[0].$.stl),
            ast: Number(team.totals[0].statsbyprd[0].$.ast),
            min: Number(team.totals[0].statsbyprd[0].$.min),
            oreb: Number(team.totals[0].statsbyprd[0].$.oreb),
            dreb: Number(team.totals[0].statsbyprd[0].$.dreb),
            treb: Number(team.totals[0].statsbyprd[0].$.treb),
            pf: Number(team.totals[0].statsbyprd[0].$.pf),
            tf: Number(team.totals[0].statsbyprd[0].$.tf),
            to: Number(team.totals[0].statsbyprd[0].$.to),
            fgpct: Number(team.totals[0].statsbyprd[0].$.fgpct),
            fg3pct: Number(team.totals[0].statsbyprd[0].$.fg3pct),
            ftpct: team.totals[0].statsbyprd[0].$.ftpct,
            foul: team.totals[0].statsbyprd[0].$.foul,
        };
    }
    if (team.totals[0].statsbyprd !== undefined && team.totals[0].statsbyprd[1]) {
        statsbyprd2 = {
            prd: 2,
            fgm: Number(team.totals[0].statsbyprd[1].$.fgm),
            fga: Number(team.totals[0].statsbyprd[1].$.fga),
            fgm3: Number(team.totals[0].statsbyprd[1].$.fgm3),
            fga3: Number(team.totals[0].statsbyprd[1].$.fga3),
            ftm: Number(team.totals[0].statsbyprd[1].$.ftm),
            fta: Number(team.totals[0].statsbyprd[1].$.fta),
            tp: Number(team.totals[0].statsbyprd[1].$.tp),
            blk: Number(team.totals[0].statsbyprd[1].$.blk),
            stl: Number(team.totals[0].statsbyprd[1].$.stl),
            ast: Number(team.totals[0].statsbyprd[1].$.ast),
            min: Number(team.totals[0].statsbyprd[1].$.min),
            oreb: Number(team.totals[0].statsbyprd[1].$.oreb),
            dreb: Number(team.totals[0].statsbyprd[1].$.dreb),
            treb: Number(team.totals[0].statsbyprd[1].$.treb),
            pf: Number(team.totals[0].statsbyprd[1].$.pf),
            tf: Number(team.totals[0].statsbyprd[1].$.tf),
            to: Number(team.totals[0].statsbyprd[1].$.to),
            fgpct: Number(team.totals[0].statsbyprd[1].$.fgpct),
            fg3pct: Number(team.totals[0].statsbyprd[1].$.fg3pct),
            ftpct: team.totals[0].statsbyprd[1].$.ftpct,
            foul: team.totals[0].statsbyprd[1].$.foul,
        };
    }
    const totals = {
        stats: stats,
        special: special,
    };
    if (statsbyprd1 !== undefined && statsbyprd2 !== undefined) {
        totals.prdStats = [statsbyprd1, statsbyprd2];
    }
    else if (statsbyprd1 !== undefined) {
        totals.prdStats = [statsbyprd1];
    }
    else if (statsbyprd2 !== undefined) {
        totals.prdStats = [statsbyprd2];
    }
    else {
        totals.prdStats = undefined;
    }
    return totals;
}
exports.parseTotals = parseTotals;
/**
 * parse the deadball score to a single value
 * @param deadball string from the xml
 */
function parseDeadball(deadball) {
    if (deadball == undefined || typeof deadball === "number")
        return 0;
    const deadballByPeriod = deadball.split(",");
    let deadballScore = 0;
    for (const deadballValue of deadballByPeriod) {
        deadballScore = deadballScore + Number(deadballValue);
    }
    return deadballScore;
}
/**
 * parse the line score information about a team
 * @param team team information from statcrew JSON
 */
function parseLineScore(team) {
    const linescoreInfo = team.linescore[0];
    const parsedPeriods = [];
    let totalOvertime = 0;
    for (const period of linescoreInfo.lineprd) {
        parsedPeriods.push({ period: period.$.prd, overtime: period.$.prd > 2 ? true : false, score: period.$.score });
        if (period.$.prd > 2) {
            ++totalOvertime;
        }
    }
    return {
        score: linescoreInfo.$.score,
        periods: parsedPeriods,
        totalOvertimePeriods: totalOvertime,
    };
}
/**
 * parse the teams total stats from the game
 * @param team team information from statcrew JSON
 */
function parseRecords(team) {
    if (team.$.record) {
        return team.$.record.split("-");
    }
    return [""];
}
exports.parseRecords = parseRecords;
//# sourceMappingURL=teamParser.js.map