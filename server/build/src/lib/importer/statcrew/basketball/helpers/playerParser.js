"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const AthlyteImporter_1 = require("../../../AthlyteImporter");
/**
 * Helper funtion that parses a player information from the statcrew JSON
 * Used by the PlayerClass parse function
 * @param player player information from XML
 * @param teamTidyName player's team tidy name
 * @param teamName player's team name
 * @param side home or visitor
 * @param gameDate date of the game
 * @param actualDate date as in XML
 */
function parsePlayer(player, teamCode, teamName, teamTidyName, teamConference, teamConferenceDivision, opponentCode, opponentName, opponentConference, opponentConferenceDivision, side, gameDate, actualDate, sportCode) {
    let stats;
    let prdStats1;
    let prdStats2;
    if (player.stats !== undefined && player.stats[0]) {
        stats = {
            fgm: player.stats[0].$.fgm || 0,
            fga: player.stats[0].$.fga || 0,
            fgm3: player.stats[0].$.fgm3 || 0,
            fga3: player.stats[0].$.fga3 || 0,
            ftm: player.stats[0].$.ftm || 0,
            fta: player.stats[0].$.fta || 0,
            tp: player.stats[0].$.tp || 0,
            blk: player.stats[0].$.blk || 0,
            stl: player.stats[0].$.stl || 0,
            ast: player.stats[0].$.ast || 0,
            min: player.stats[0].$.min || 0,
            oreb: player.stats[0].$.oreb || 0,
            dreb: player.stats[0].$.dreb || 0,
            treb: player.stats[0].$.treb || 0,
            pf: player.stats[0].$.pf || 0,
            tf: player.stats[0].$.tf || 0,
            to: player.stats[0].$.to || 0,
            //dq: number;
            deadball: parseDeadball(player.stats[0].$.deadball),
            deadballByPeriod: player.stats[0].$.deadball != undefined && typeof player.stats[0].$.deadball != "number" ? player.stats[0].$.deadball.split(",").map(Number) : [0],
            fgpct: player.stats[0].$.fgpct || 0,
            fg3pct: player.stats[0].$.fg3pct || 0,
            ftpct: player.stats[0].$.ftpct || 0,
            dDoubles: computeDoubleDoubles(player.stats[0].$.tp, player.stats[0].$.stl, player.stats[0].$.blk, player.stats[0].$.ast, player.stats[0].$.treb),
            tDoubles: computeTripleDoubles(player.stats[0].$.tp, player.stats[0].$.stl, player.stats[0].$.blk, player.stats[0].$.ast, player.stats[0].$.treb),
        };
    }
    if (player.statsbyprd !== undefined && player.statsbyprd[0]) {
        prdStats1 = {
            prd: 1,
            fgm: player.statsbyprd[0].$.fgm || 0,
            fga: player.statsbyprd[0].$.fga || 0,
            fgm3: player.statsbyprd[0].$.fgm3 || 0,
            fga3: player.statsbyprd[0].$.fga3 || 0,
            ftm: player.statsbyprd[0].$.ftm || 0,
            fta: player.statsbyprd[0].$.fta || 0,
            tp: player.statsbyprd[0].$.tp || 0,
            blk: player.statsbyprd[0].$.blk || 0,
            stl: player.statsbyprd[0].$.stl || 0,
            ast: player.statsbyprd[0].$.ast || 0,
            min: player.statsbyprd[0].$.min || 0,
            oreb: player.statsbyprd[0].$.oreb || 0,
            dreb: player.statsbyprd[0].$.dreb || 0,
            treb: player.statsbyprd[0].$.treb || 0,
            pf: player.statsbyprd[0].$.pf || 0,
            tf: player.statsbyprd[0].$.tf || 0,
            to: player.statsbyprd[0].$.to || 0,
            fgpct: player.statsbyprd[0].$.fgpct || 0,
            fg3pct: player.statsbyprd[0].$.fg3pct || 0,
            ftpct: player.statsbyprd[0].$.ftpct || 0,
            foul: player.statsbyprd[0].$.foul || 0,
        };
    }
    if (player.statsbyprd !== undefined && player.statsbyprd[1]) {
        prdStats2 = {
            prd: 2,
            fgm: player.statsbyprd[1].$.fgm || 0,
            fga: player.statsbyprd[1].$.fga || 0,
            fgm3: player.statsbyprd[1].$.fgm3 || 0,
            fga3: player.statsbyprd[1].$.fga3 || 0,
            ftm: player.statsbyprd[1].$.ftm || 0,
            fta: player.statsbyprd[1].$.fta || 0,
            tp: player.statsbyprd[1].$.tp || 0,
            blk: player.statsbyprd[1].$.blk || 0,
            stl: player.statsbyprd[1].$.stl || 0,
            ast: player.statsbyprd[1].$.ast || 0,
            min: player.statsbyprd[1].$.min || 0,
            oreb: player.statsbyprd[1].$.oreb || 0,
            dreb: player.statsbyprd[1].$.dreb || 0,
            treb: player.statsbyprd[1].$.treb || 0,
            pf: player.statsbyprd[1].$.pf || 0,
            tf: player.statsbyprd[1].$.tf || 0,
            to: player.statsbyprd[1].$.to || 0,
            fgpct: player.statsbyprd[1].$.fgpct || 0,
            fg3pct: player.statsbyprd[1].$.fg3pct || 0,
            ftpct: player.statsbyprd[1].$.ftpct || 0,
            foul: player.statsbyprd[1].$.foul || 0,
        };
    }
    const individualGameStats = {
        codeInGame: (side === AthlyteImporter_1.VH.home ? "H" : "V") + player.$.code + "",
        side,
        gameDate,
        actualDate,
        opponentCode,
        opponentName,
        opponentConference,
        opponentConferenceDivision,
        season: moment(gameDate).subtract(4, "months").year(),
        pos: {
            pos: player.$.pos,
            gp: player.$.gp,
            gs: player.$.gs,
        },
        started: (player.$.gs && true) || false,
        plays: [],
        playerClass: player.$.class,
        uniform: player.$.uni + "",
    };
    if (stats !== undefined) {
        individualGameStats.stats = stats;
    }
    if (prdStats1 !== undefined && prdStats2 !== undefined) {
        individualGameStats.prdStats = [prdStats1, prdStats2];
    }
    else if (prdStats1 !== undefined) {
        individualGameStats.prdStats = [prdStats1];
    }
    else if (prdStats2 !== undefined) {
        individualGameStats.prdStats = [prdStats2];
    }
    else {
        individualGameStats.prdStats = undefined;
    }
    const athlytePlayer = {
        teamCode: teamCode,
        teamTidyName: teamTidyName,
        teamName: teamName,
        sportCode: sportCode,
        name: player.$.name,
        tidyName: player.$.checkname,
        playerId: player.$.playerid,
        teamConference: teamConference,
        teamConferenceDivision: teamConferenceDivision,
        games: [individualGameStats],
    };
    return athlytePlayer;
}
exports.parsePlayer = parsePlayer;
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
 * compute the triple doubles for a player
 * @param tp total points from XML
 * @param stl steals from XML
 * @param blk blocks from XML
 * @param ast assists from XML
 * @param treb total rebounds from XML
  */
function computeTripleDoubles(tp, stl, blk, ast, treb) {
    let count = 0;
    if (tp >= 10) {
        count = count + 1;
    }
    if (stl >= 10) {
        count = count + 1;
    }
    if (blk >= 10) {
        count = count + 1;
    }
    if (ast >= 10) {
        count = count + 1;
    }
    if (treb >= 10) {
        count = count + 1;
    }
    if (count >= 3) {
        return 1;
    }
    return 0;
}
/**
* compute the double doubles for a player
* @param tp total points from XML
* @param stl steals from XML
* @param blk blocks from XML
* @param ast assists from XML
* @param treb total rebounds from XML
*/
function computeDoubleDoubles(tp, stl, blk, ast, treb) {
    let count = 0;
    if (tp >= 10) {
        count = count + 1;
    }
    if (stl >= 10) {
        count = count + 1;
    }
    if (blk >= 10) {
        count = count + 1;
    }
    if (ast >= 10) {
        count = count + 1;
    }
    if (treb >= 10) {
        count = count + 1;
    }
    if (count == 2) {
        return 1;
    }
    return 0;
}
//# sourceMappingURL=playerParser.js.map