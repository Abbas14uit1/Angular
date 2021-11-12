"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const AthlyteImporter_1 = require("../../AthlyteImporter");
/**
 * Get information about a team from the statcrew JSON
 * @param inputTeam team information from the statcrew JSON
 * @param quarters the quarter information from the statcrew JSON
 * @param gameDate the date of the game
 * @param actualDate the actual date of the game as a string (actual string from XML)
 */
function parseTeam(inputTeam, opponent, quarters, gameDate, actualDate, venue) {
    const { code, conference, conferenceDivision, name, tidyName } = parseMeta(inputTeam);
    const opponentData = parseMeta(opponent);
    // const opponentName = parseMeta(opponent).name;
    const linescore = parseLineScore(inputTeam);
    const totals = parseTotals(inputTeam);
    const side = parseSide(inputTeam.$.vh);
    const qtrTotals = parseQuarterSummaries(side, quarters);
    const venueData = parseVenue(venue);
    const players = [];
    const teamInfo = parseTeams([inputTeam, opponent]);
    const team = {
        games: {
            homeAway: side,
            opponentCode: opponentData.code,
            opponentName: opponentData.name,
            conference,
            conferenceDivision,
            opponentConference: opponentData.conference,
            opponentConferenceDivision: opponentData.conferenceDivision,
            linescore,
            totals,
            gameDate,
            actualDate,
            sportCode: "MFB",
            season: moment(gameDate).subtract(3, "months").year(),
            qtrTotals,
            homeTeam: teamInfo.home,
            visitorTeam: teamInfo.visitor,
            gameType: venueData.gameType,
            geoLocation: venueData.geoLocation,
            attendance: venueData.attendance,
            nightGame: venueData.nightGame,
            neutralLocation: venueData.neutralLocation,
            startTime: venueData.startTime,
            players: players,
        },
        code,
        name,
        tidyName,
    };
    return team;
}
exports.parseTeam = parseTeam;
function parseVenue(venue) {
    const venueMeta = venue.$;
    const neutralLocation = venueMeta.neutralgame === "Y";
    const nightGame = venueMeta.nitegame === "Y";
    const gameType = venueMeta.gametype.split(",");
    return {
        geoLocation: venueMeta.location,
        neutralLocation,
        nightGame,
        gameType,
        attendance: venueMeta.attend,
        startTime: moment(venueMeta.start, "hh:mm A").toDate(),
    };
}
exports.parseVenue = parseVenue;
function parseTeams(teams) {
    const teamInfo = {};
    for (const team of teams) {
        const info = {
            id: team.$.id,
            name: team.$.name,
            code: team.$.code,
            conf: team.$.conf,
            confDivision: team.$.confdivision,
            score: team.linescore[0].$.score,
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
exports.parseTeams = parseTeams;
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
        code: metaInfo.code,
        conference: metaInfo.conf,
        conferenceDivision: metaInfo.confdivision,
        tidyName: metaInfo.id,
        name: metaInfo.name,
    };
}
exports.parseMeta = parseMeta;
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
 * parse the line score information about a team
 * @param team team information from statcrew JSON
 */
function parseLineScore(team) {
    const linescoreInfo = team.linescore[0];
    const parsedPeriods = [];
    for (const period of linescoreInfo.lineprd) {
        parsedPeriods.push({ period: period.$.prd, score: period.$.score });
    }
    return {
        score: linescoreInfo.$.score,
        periods: parsedPeriods,
    };
}
/**
 * parse the teams total stats from the game
 * @param team team information from statcrew JSON
 */
function parseTotals(team) {
    const totalsInfo = team.totals[0];
    const firstdowns = totalsInfo.firstdowns[0].$;
    const penalties = totalsInfo.penalties[0].$;
    const conversions = totalsInfo.conversions[0].$;
    const misc = totalsInfo.misc[0].$;
    const redzone = totalsInfo.redzone[0].$;
    const rush = totalsInfo.rush[0].$;
    const pass = totalsInfo.pass[0].$;
    const receiving = totalsInfo.rcv[0].$;
    const fumbles = totalsInfo.fumbles ? totalsInfo.fumbles[0].$ : {
        lost: 0,
        no: 0,
    };
    const punt = totalsInfo.punt ? totalsInfo.punt[0].$ : {
        no: 0,
        yds: 0,
        long: 0,
        blkd: 0,
        tb: 0,
        fc: 0,
        plus50: 0,
        inside20: 0,
    };
    const kickoff = totalsInfo.ko ? totalsInfo.ko[0].$ : {
        no: 0,
        yds: 0,
        ob: 0,
        tb: 0,
    };
    const fieldgoal = totalsInfo.fg ? totalsInfo.fg[0].$ : {
        made: 0,
        att: 0,
        long: 0,
        blkd: 0,
    };
    const pat = totalsInfo.pat ? {
        kickatt: totalsInfo.pat[0].$.kickatt || 0,
        kickmade: totalsInfo.pat[0].$.kickmade || 0,
        passatt: totalsInfo.pat[0].$.passatt || 0,
        passmade: totalsInfo.pat[0].$.passmade || 0,
        rushatt: totalsInfo.pat[0].$.rushatt || 0,
        rushmade: totalsInfo.pat[0].$.rushmade || 0,
    } : {
        kickatt: 0,
        kickmade: 0,
        passatt: 0,
        passmade: 0,
        rushatt: 0,
        rushmade: 0,
    };
    const defense = totalsInfo.defense[0].$;
    const kickReceiving = totalsInfo.kr ? totalsInfo.kr[0].$ : {
        no: 0,
        yds: 0,
        td: 0,
        long: 0,
    };
    const puntReceiving = totalsInfo.pr ? totalsInfo.pr[0].$ : {
        no: 0,
        yds: 0,
        td: 0,
        long: 0,
    };
    const interceptionReceiving = totalsInfo.ir ? totalsInfo.ir[0].$ : {
        no: 0,
        yds: 0,
        td: 0,
        long: 0,
    };
    const scoring = totalsInfo.scoring ? {
        td: totalsInfo.scoring[0].$.td || 0,
        fg: totalsInfo.scoring[0].$.fg || 0,
        patKick: totalsInfo.scoring[0].$.patkick || 0,
    } : {
        td: 0,
        fg: 0,
        patKick: 0,
    };
    return {
        firstdowns: {
            fdTotal: firstdowns.no,
            fdRush: firstdowns.rush,
            fdPass: firstdowns.pass,
            fdPenalty: firstdowns.penalty,
        },
        penalties: {
            penTotal: penalties.no,
            penYards: penalties.yds,
        },
        conversions: {
            convThird: conversions.thirdconv,
            convThirdAtt: conversions.thirdatt,
            convFourth: conversions.fourthconv,
            convFourthAtt: conversions.fourthatt,
        },
        fumbles: {
            fumbTotal: fumbles.no,
            fumbLost: fumbles.lost,
        },
        misc: {
            yards: misc.yds,
            top: misc.top,
            ona: misc.ona,
            onm: misc.onm,
            ptsto: misc.ptsto,
        },
        redzone: {
            redAtt: redzone.att,
            redScores: redzone.scores,
            redPoints: redzone.points,
            redTdRush: redzone.tdrush,
            redTdPass: redzone.tdpass,
            redFgMade: redzone.fgmade,
            redEndFga: redzone.endfga,
            redEndDown: redzone.enddowns,
            redEndInt: redzone.endint,
            redEndFumb: redzone.endfumb,
            redEndHalf: redzone.endhalf,
            redEndGame: redzone.endgame,
        },
        rushing: {
            rushAtt: rush.att,
            rushYards: rush.yds,
            rushGain: rush.gain,
            rushLoss: rush.loss,
            rushTd: rush.td,
            rushLong: rush.long,
        },
        pass: {
            passComp: pass.comp,
            passAtt: pass.att,
            passInt: pass.int,
            passYards: pass.yds,
            passTd: pass.td,
            passLong: pass.long,
            passSacks: pass.sacks,
            passSackYards: pass.sackyds,
        },
        receiving: {
            rcvNum: receiving.no,
            rcvYards: receiving.yds,
            rcvTd: receiving.td,
            rcvLong: receiving.long,
        },
        punt: {
            puntNum: punt.no,
            puntYards: punt.yds,
            puntLong: punt.long,
            puntBlocked: punt.blkd,
            puntTb: punt.tb,
            puntFc: punt.fc,
            puntPlus50: punt.plus50,
            puntInside20: punt.inside20,
        },
        kickoff: {
            koNum: kickoff.no,
            koYards: kickoff.yds,
            koOb: kickoff.ob,
            koTb: kickoff.tb,
        },
        fieldgoal: {
            fgMade: fieldgoal.made,
            fgAtt: fieldgoal.att,
            fgLong: fieldgoal.long,
            fgBlocked: fieldgoal.blkd,
        },
        pointAfter: {
            kickatt: pat.kickatt,
            kickmade: pat.kickmade,
            passatt: pat.passatt,
            passmade: pat.passmade,
            rushatt: pat.rushatt,
            rushmade: pat.rushmade,
        },
        defense: {
            dTackUa: defense.tackua,
            dTackA: defense.tacka,
            dTackTot: defense.tot_tack || defense.tacka + defense.tackua,
            dTflua: defense.tflua || 0,
            dTfla: defense.tfla || 0,
            dTflyds: defense.tflyds || 0,
            dSackUa: defense.sackua || 0,
            dSackA: defense.sacka || 0,
            dSacks: defense.sacks || (defense.sackua || 0) + (defense.sacka || 0),
            dSackYards: defense.sackyds || 0,
            dBrup: defense.brup || 0,
            dFf: defense.ff || 0,
            dFr: defense.fr || 0,
            dFryds: defense.fryds || 0,
            dInt: defense.int || 0,
            dIntYards: defense.intyds || 0,
            dQbh: defense.qbh || 0,
            dblkd: defense.blkd || 0,
        },
        kickReceiving: {
            krNo: kickReceiving.no,
            krYards: kickReceiving.yds,
            krTd: kickReceiving.td,
            krLong: kickReceiving.long,
        },
        puntReturn: {
            prNo: puntReceiving.no,
            prYards: puntReceiving.yds,
            prTd: puntReceiving.td,
            prLong: puntReceiving.long,
        },
        intReturn: {
            irNo: interceptionReceiving.no,
            irYards: interceptionReceiving.yds,
            irTd: interceptionReceiving.td,
            irLong: interceptionReceiving.long,
        },
        scoring,
    };
}
exports.parseTotals = parseTotals;
/**
 * parse the team's per quarter stats
 * @param quarter quarter information from statcrew JSON
 * @param quarterNum quarter number
 */
function parseQuarterSummary(quarter, quarterNum) {
    const firstdowns = quarter.firstdowns ?
        quarter.firstdowns[0].$ : {
        no: 0,
        rush: 0,
        pass: 0,
        penalty: 0,
    };
    const penalties = quarter.penalties ?
        quarter.penalties[0].$ : {
        no: 0,
        yds: 0,
    };
    const conversions = quarter.conversions ?
        quarter.conversions[0].$ : {
        thirdconv: 0,
        thirdatt: 0,
        fourthconv: 0,
        fourthatt: 0,
    };
    const fumbles = quarter.fumbles ?
        quarter.fumbles[0].$ : {
        no: 0,
        lost: 0,
    };
    const misc = quarter.misc ?
        quarter.misc[0].$ : {
        yds: 0,
        top: "",
        ona: 0,
        onm: 0,
        ptsto: 0,
    };
    const redzone = quarter.redzone ?
        quarter.redzone[0].$ : {
        att: 0,
        scores: 0,
        points: 0,
        tdrush: 0,
        tdpass: 0,
        fgmade: 0,
        endfga: 0,
        enddowns: 0,
        endint: 0,
        endfumb: 0,
        endhalf: 0,
        endgame: 0,
    };
    const rush = quarter.rush ?
        quarter.rush[0].$ : {
        att: 0,
        yds: 0,
        gain: 0,
        loss: 0,
        td: 0,
        long: 0,
    };
    const pass = quarter.pass ?
        quarter.pass[0].$ : {
        comp: 0,
        att: 0,
        int: 0,
        yds: 0,
        td: 0,
        long: 0,
        sacks: 0,
        sackyds: 0,
    };
    const receiving = quarter.rcv ?
        quarter.rcv[0].$ : {
        no: 0,
        yds: 0,
        td: 0,
        long: 0,
    };
    const punt = quarter.punt ?
        quarter.punt[0].$ : {
        no: 0,
        yds: 0,
        long: 0,
        blkd: 0,
        tb: 0,
        fc: 0,
        plus50: 0,
        inside20: 0,
    };
    const kickoff = quarter.ko ?
        quarter.ko[0].$ : {
        no: 0,
        yds: 0,
        ob: 0,
        tb: 0,
    };
    const fieldgoal = quarter.fg ?
        quarter.fg[0].$ : {
        made: 0,
        att: 0,
        long: 0,
        blkd: 0,
    };
    const pat = quarter.pat ?
        quarter.pat[0].$ : {
        kickatt: 0,
        kickmade: 0,
        passatt: 0,
        passmade: 0,
        rushatt: 0,
        rushmade: 0,
    };
    const defense = quarter.defense ? quarter.defense[0].$ : {
        tacka: 0,
        tackua: 0,
    };
    const kickReceiving = quarter.kr ?
        quarter.kr[0].$ : {
        no: 0,
        yds: 0,
        td: 0,
        long: 0,
    };
    const puntReceiving = quarter.pr ?
        quarter.pr[0].$ : {
        no: 0,
        yds: 0,
        td: 0,
        long: 0,
    };
    const interceptionReceiving = quarter.ir ?
        quarter.ir[0].$ : {
        no: 0,
        yds: 0,
        td: 0,
        long: 0,
    };
    const scoring = quarter.scoring ? {
        td: quarter.scoring[0].$.td || 0,
        fg: quarter.scoring[0].$.fg || 0,
        patKick: quarter.scoring[0].$.patkick || 0,
    } : {
        td: 0,
        fg: 0,
        patKick: 0,
    };
    return {
        qtrNum: quarterNum,
        firstdowns: {
            fdTotal: firstdowns.no,
            fdRush: firstdowns.rush,
            fdPass: firstdowns.pass,
            fdPenalty: firstdowns.penalty,
        },
        penalties: {
            penTotal: penalties.no,
            penYards: penalties.yds,
        },
        conversions: {
            convThird: conversions.thirdconv,
            convThirdAtt: conversions.thirdatt,
            convFourth: conversions.fourthconv,
            convFourthAtt: conversions.fourthatt,
        },
        fumbles: {
            fumbTotal: fumbles.no,
            fumbLost: fumbles.lost,
        },
        misc: {
            yards: misc.yds,
            top: misc.top,
            ona: misc.ona,
            onm: misc.onm,
            ptsto: misc.ptsto,
        },
        redzone: {
            redAtt: redzone.att,
            redScores: redzone.scores,
            redPoints: redzone.points,
            redTdRush: redzone.tdrush,
            redTdPass: redzone.tdpass,
            redFgMade: redzone.fgmade,
            redEndFga: redzone.endfga,
            redEndDown: redzone.enddowns,
            redEndInt: redzone.endint,
            redEndFumb: redzone.endfumb,
            redEndHalf: redzone.endhalf,
            redEndGame: redzone.endgame,
        },
        rushing: {
            rushAtt: rush.att,
            rushYards: rush.yds,
            rushGain: rush.gain,
            rushLoss: rush.loss,
            rushTd: rush.td,
            rushLong: rush.long,
        },
        pass: {
            passComp: pass.comp,
            passAtt: pass.att,
            passInt: pass.int,
            passYards: pass.yds,
            passTd: pass.td,
            passLong: pass.long,
            passSacks: pass.sacks,
            passSackYards: pass.sackyds,
        },
        receiving: {
            rcvNum: receiving.no,
            rcvYards: receiving.yds,
            rcvTd: receiving.td,
            rcvLong: receiving.long,
        },
        punt: {
            puntNum: punt.no,
            puntYards: punt.yds,
            puntLong: punt.long,
            puntBlocked: punt.blkd,
            puntTb: punt.tb,
            puntFc: punt.fc,
            puntPlus50: punt.plus50,
            puntInside20: punt.inside20,
        },
        kickoff: {
            koNum: kickoff.no,
            koYards: kickoff.yds,
            koOb: kickoff.ob,
            koTb: kickoff.tb,
        },
        fieldgoal: {
            fgMade: fieldgoal.made,
            fgAtt: fieldgoal.att,
            fgLong: fieldgoal.long,
            fgBlocked: fieldgoal.blkd,
        },
        pointAfter: {
            kickatt: pat.kickatt || 0,
            kickmade: pat.kickmade || 0,
            passatt: pat.passatt || 0,
            passmade: pat.passmade || 0,
            rushatt: pat.rushatt || 0,
            rushmade: pat.rushmade || 0,
        },
        defense: {
            dTackUa: defense.tackua,
            dTackA: defense.tacka,
            dTackTot: defense.tot_tack || defense.tacka + defense.tackua,
            dTflua: defense.tflua || 0,
            dTfla: defense.tfla || 0,
            dTflyds: defense.tflyds || 0,
            dSacks: defense.sacks || 0,
            dSackUa: defense.sackua || 0,
            dSackA: defense.sacka || 0,
            dSackYards: defense.sackyds || 0,
            dBrup: defense.brup || 0,
            dFf: defense.ff || 0,
            dFr: defense.fr || 0,
            dFryds: defense.fryds || 0,
            dInt: defense.int || 0,
            dIntYards: defense.intyds || 0,
            dQbh: defense.qbh || 0,
            dblkd: defense.blkd || 0,
        },
        kickReceiving: {
            krNo: kickReceiving.no,
            krYards: kickReceiving.yds,
            krTd: kickReceiving.td,
            krLong: kickReceiving.long,
        },
        puntReturn: {
            prNo: puntReceiving.no,
            prYards: puntReceiving.yds,
            prTd: puntReceiving.td,
            prLong: puntReceiving.long,
        },
        intReturn: {
            irNo: interceptionReceiving.no,
            irYards: interceptionReceiving.yds,
            irTd: interceptionReceiving.td,
            irLong: interceptionReceiving.long,
        },
        scoring,
    };
}
exports.parseQuarterSummary = parseQuarterSummary;
/**
 * parse the team's stats for all quarters
 * @param side home or visitor
 * @param quarters information about each quarter from statcrew JSON
 */
function parseQuarterSummaries(side, quarters) {
    if (quarters == null || quarters[0].qtrsummary == null) {
        return undefined;
    }
    return quarters
        .map((quarter) => {
        const vh = side === AthlyteImporter_1.VH.home ? "H" : "V";
        if (!("$" in quarter.qtrsummary[0])) {
            return vh === "H" ? quarter.qtrsummary[0] : quarter.qtrsummary[1];
        }
        return quarter.qtrsummary[0].$.vh === vh ? quarter.qtrsummary[0] : quarter.qtrsummary[1];
    })
        .map((quarter, quarterNum) => parseQuarterSummary(quarter, quarterNum));
}
exports.parseQuarterSummaries = parseQuarterSummaries;
//# sourceMappingURL=teamParser.js.map