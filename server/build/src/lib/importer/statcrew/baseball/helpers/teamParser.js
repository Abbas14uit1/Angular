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
    const totals = parseTotals(inputTeam);
    const side = parseSide(inputTeam.$.vh);
    const players = [];
    const opponentConference = parseMeta(opponent).conf;
    const opponentConferenceDivision = parseMeta(opponent).confDivision;
    const conference = parseMeta(inputTeam).conf;
    const conferenceDivision = parseMeta(inputTeam).confDivision;
    const teamInfo = parseTeamInfo([inputTeam, opponent]);
    const venueData = parseVenue(inputVenueData);
    const team = {
        games: {
            homeAway: side,
            opponentCode,
            opponentName,
            linescore,
            record: inputTeam.$.record === undefined ? 0 : Number(inputTeam.$.record.split('-')[0]),
            sportCode: sportCode,
            gameDate,
            starters: parseStarters(inputTeam),
            totals,
            actualDate,
            season: moment(gameDate).subtract(7, "months").year(),
            conference,
            conferenceDivision,
            opponentConference,
            opponentConferenceDivision,
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
        record,
        confRecord: record,
        conference: 0,
        rank: 0,
        tidyName
    };
    return team;
}
exports.parseTeam = parseTeam;
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
exports.parseTeamInfo = parseTeamInfo;
function parseVenue(venue) {
    const venueMeta = venue.$;
    const neutralLocation = venueMeta.neutralgame === "Y";
    const nightGame = venueMeta.nitegame === "Y";
    const gameType = venueMeta.gametype.split(",");
    return {
        geoLocation: venueMeta.location,
        neutralLocation,
        nightGame,
        attendance: venueMeta.attend,
        gameType: gameType,
        startTime: moment(venueMeta.start, "hh:mm A").toDate(),
    };
}
exports.parseVenue = parseVenue;
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
 * parse the team meta information, such as name, team code
 * @param team team information from statcrew JSON
 */
function parseStarters(team) {
    const starters = [];
    team.starters[0].starter.forEach((starter, index) => {
        starters.push({
            spot: starter.$.spot,
            name: starter.$.name,
            uni: starter.$.uni,
            pos: starter.$.pos,
        });
    });
    return starters;
}
exports.parseStarters = parseStarters;
/**
 * parse the team totals information, such as name, hitting, pitch summary
 * @param team team information from statcrew JSON
 */
function parseTotals(team) {
    let totals = {};
    totals.hitting = {
        appear: 1,
        ab: team.totals[0].hitting[0].$.ab,
        r: team.totals[0].hitting[0].$.r,
        h: team.totals[0].hitting[0].$.h,
        rbi: team.totals[0].hitting[0].$.rbi,
        double: team.totals[0].hitting[0].$.double || 0,
        triple: team.totals[0].hitting[0].$.triple || 0,
        hr: team.totals[0].hitting[0].$.hr || 0,
        bb: team.totals[0].hitting[0].$.bb || 0,
        so: team.totals[0].hitting[0].$.so || 0,
        hbp: team.totals[0].hitting[0].$.hbp || 0,
        kl: team.totals[0].hitting[0].$.kl || 0,
        sh: team.totals[0].hitting[0].$.sh || 0,
        sf: team.totals[0].hitting[0].$.sf || 0,
        ibb: team.totals[0].hitting[0].$.ibb || 0,
        sb: team.totals[0].hitting[0].$.sb || 0,
        cs: team.totals[0].hitting[0].$.cs || 0,
        rchci: team.totals[0].hitting[0].$.rchci || 0,
        rcherr: team.totals[0].hitting[0].$.rcherr || 0,
        rchfc: team.totals[0].hitting[0].$.rchfc || 0,
        gdp: team.totals[0].hitting[0].$.gdp || 0,
        picked: team.totals[0].hitting[0].$.picked || 0,
        hitDp: team.totals[0].hitting[0].$.hitdp || 0,
        ground: team.totals[0].hitting[0].$.ground || 0,
        fly: team.totals[0].hitting[0].$.fly || 0,
        tb: computeTotalBases(team.totals[0].hitting[0].$.h || 0, team.totals[0].hitting[0].$.double || 0, team.totals[0].hitting[0].$.triple || 0, team.totals[0].hitting[0].$.hr || 0),
        hwhp: (team.totals[0].hitting[0].$.h || 0) +
            (team.totals[0].hitting[0].$.bb || 0) +
            (team.totals[0].hitting[0].$.hbp || 0),
        abbhpsf: (team.totals[0].hitting[0].$.ab || 0) +
            (team.totals[0].hitting[0].$.bb || 0) +
            (team.totals[0].hitting[0].$.hbp || 0) +
            (team.totals[0].hitting[0].$.sf || 0),
        pa: (team.totals[0].hitting[0].$.ab || 0) +
            (team.totals[0].hitting[0].$.bb || 0) +
            (team.totals[0].hitting[0].$.hbp || 0) +
            (team.totals[0].hitting[0].$.sf || 0) +
            (team.totals[0].hitting[0].$.sb || 0),
        babp: (team.totals[0].hitting[0].$.ab || 0) -
            (team.totals[0].hitting[0].$.hr || 0) -
            (team.totals[0].hitting[0].$.so || 0) +
            (team.totals[0].hitting[0].$.sf || 0),
        single: ((team.totals[0].hitting[0].$.h || 0) -
            ((team.totals[0].hitting[0].$.double || 0) +
                (team.totals[0].hitting[0].$.triple || 0) +
                (team.totals[0].hitting[0].$.hr || 0))),
        hhr: ((team.totals[0].hitting[0].$.h || 0) -
            (team.totals[0].hitting[0].$.hr || 0)),
        sba: ((team.totals[0].hitting[0].$.sb || 0) +
            (team.totals[0].hitting[0].$.cs || 0)),
    };
    totals.fielding = {
        appear: 1,
        po: team.totals[0].fielding[0].$.po || 0,
        a: team.totals[0].fielding[0].$.a || 0,
        e: team.totals[0].fielding[0].$.e || 0,
        sba: team.totals[0].fielding[0].$.sba || 0,
        csb: team.totals[0].fielding[0].$.csb || 0,
        pb: team.totals[0].fielding[0].$.pb || 0,
        ci: team.totals[0].fielding[0].$.ci || 0,
        indp: team.totals[0].fielding[0].$.indp || 0,
        intp: team.totals[0].fielding[0].$.intp || 0,
        poa: (team.totals[0].fielding[0].$.po || 0) +
            (team.totals[0].fielding[0].$.a || 0),
        poae: (team.totals[0].fielding[0].$.po || 0) +
            (team.totals[0].fielding[0].$.a || 0) +
            (team.totals[0].fielding[0].$.e || 0)
    };
    totals.pitching = {
        appear: team.totals[0].pitching[0].$.appear || 0,
        win: team.totals[0].pitching[0].$.win || 0,
        save: team.totals[0].pitching[0].$.save || 0,
        loss: team.totals[0].pitching[0].$.loss || 0,
        gs: team.totals[0].pitching[0].$.gs || 0,
        cg: team.totals[0].pitching[0].$.cg || 0,
        sho: team.totals[0].pitching[0].$.sho || 0,
        cbo: team.totals[0].pitching[0].$.cbo || 0,
        ip: team.totals[0].pitching[0].$.ip || 0,
        h: team.totals[0].pitching[0].$.h || 0,
        r: team.totals[0].pitching[0].$.r || 0,
        er: team.totals[0].pitching[0].$.er || 0,
        bb: team.totals[0].pitching[0].$.bb || 0,
        k: team.totals[0].pitching[0].$.k || 0,
        so: team.totals[0].pitching[0].$.so || 0,
        bf: team.totals[0].pitching[0].$.bf || 0,
        ab: team.totals[0].pitching[0].$.ab || 0,
        double: team.totals[0].pitching[0].$.double || 0,
        triple: team.totals[0].pitching[0].$.triple || 0,
        hr: team.totals[0].pitching[0].$.hr || 0,
        wp: team.totals[0].pitching[0].$.wp || 0,
        bk: team.totals[0].pitching[0].$.bk || 0,
        hbp: team.totals[0].pitching[0].$.hbp || 0,
        kl: team.totals[0].pitching[0].$.kl || 0,
        ibb: team.totals[0].pitching[0].$.ibb || 0,
        inheritr: team.totals[0].pitching[0].$.inheritr || 0,
        inherits: team.totals[0].pitching[0].$.inherits || 0,
        sfa: team.totals[0].pitching[0].$.sfa || 0,
        sha: team.totals[0].pitching[0].$.sha || 0,
        cia: team.totals[0].pitching[0].$.cia || 0,
        pitches: team.totals[0].pitching[0].$.pitches || 0,
        gdp: team.totals[0].pitching[0].$.gdp || 0,
        fly: team.totals[0].pitching[0].$.fly || 0,
        ground: team.totals[0].pitching[0].$.ground || 0,
        teamue: team.totals[0].pitching[0].$.teamue || 0,
        hhr: (team.totals[0].pitching[0].$.h || 0) -
            (team.totals[0].pitching[0].$.hr || 0),
        abkhrsf: (team.totals[0].pitching[0].$.ab || 0) -
            (team.totals[0].pitching[0].$.hr || 0) -
            (team.totals[0].pitching[0].$.so || 0) +
            (team.totals[0].pitching[0].$.sfa || 0),
        hwhp: (team.totals[0].pitching[0].$.h || 0) +
            (team.totals[0].pitching[0].$.bb || 0) +
            (team.totals[0].pitching[0].$.hbp || 0),
        pa: (team.totals[0].pitching[0].$.ab || 0) +
            (team.totals[0].pitching[0].$.bb || 0) +
            (team.totals[0].pitching[0].$.hbp || 0) +
            (team.totals[0].pitching[0].$.sfa || 0) +
            (team.totals[0].pitching[0].$.sha || 0),
        tb: computeTotalBases(team.totals[0].pitching[0].$.h || 0, team.totals[0].pitching[0].$.double || 0, team.totals[0].pitching[0].$.triple || 0, team.totals[0].pitching[0].$.hr || 0),
    };
    let hitSummary;
    if (team.totals[0].hsitsummary !== undefined && team.totals[0].hsitsummary[0]) {
        hitSummary = {
            rchfc: team.totals[0].hsitsummary[0].$.rchfc || 0,
            rcherr: team.totals[0].hsitsummary[0].$.rcherr || 0,
            rchci: team.totals[0].hsitsummary[0].$.rchci || 0,
            ground: team.totals[0].hsitsummary[0].$.ground || 0,
            fly: team.totals[0].hsitsummary[0].$.fly || 0,
            w2Outs: (team.totals[0].hsitsummary[0].$.w2outs || "").split(',').map(Number),
            wRunners: (team.totals[0].hsitsummary[0].$.wrunners || "").split(',').map(Number),
            wrBiops: (team.totals[0].hsitsummary[0].$.wrbiops || "").split(',').map(Number),
            vsLeft: (team.totals[0].hsitsummary[0].$.vsleft || "").split(',').map(Number),
            vsRight: (team.totals[0].hsitsummary[0].$.vsright || "").split(',').map(Number),
            leadOff: (team.totals[0].hsitsummary[0].$.leadoff || "").split(',').map(Number),
            rbiThird: (team.totals[0].hsitsummary[0].$.rbi3rd || "").split(',').map(Number),
            wLoaded: (team.totals[0].hsitsummary[0].$.wloaded || "").split(',').map(Number),
            advops: (team.totals[0].hsitsummary[0].$.advops || "").split(',').map(Number),
            adv: team.totals[0].hsitsummary[0].$.adv || 0,
            lob: team.totals[0].hsitsummary[0].$.lob || 0,
            rbi2Out: team.totals[0].hsitsummary[0].$["rbi-2out"] || 0,
            wRunnersH: (team.totals[0].hsitsummary[0].$.wrunners || "").split(',').length > 1 ?
                Number((team.totals[0].hsitsummary[0].$.wrunners || "").split(',')[0]) : 0,
            wRunnersAB: (team.totals[0].hsitsummary[0].$.wrunners || "").split(',').length > 1 ?
                Number((team.totals[0].hsitsummary[0].$.wrunners || "").split(',')[1]) : 0,
            wLoadedH: (team.totals[0].hsitsummary[0].$.wloaded || "").split(',').length > 1 ?
                Number((team.totals[0].hsitsummary[0].$.wloaded || "").split(',')[0]) : 0,
            wLoadedAB: (team.totals[0].hsitsummary[0].$.wloaded || "").split(',').length > 1 ?
                Number((team.totals[0].hsitsummary[0].$.wloaded || "").split(',')[1]) : 0,
            w2OutsH: (team.totals[0].hsitsummary[0].$.w2outs || "").split(',').length > 1 ?
                Number((team.totals[0].hsitsummary[0].$.w2outs || "").split(',')[0]) : 0,
            w2OutsAB: (team.totals[0].hsitsummary[0].$.w2outs || "").split(',').length > 1 ?
                Number((team.totals[0].hsitsummary[0].$.w2outs || "").split(',')[1]) : 0,
        };
    }
    let pitchSummary;
    if (team.totals[0].psitsummary != undefined && team.totals[0].psitsummary[0]) {
        pitchSummary = {
            fly: team.totals[0].psitsummary[0].$.fly || 0,
            ground: team.totals[0].psitsummary[0].$.ground || 0,
            leadoff: (team.totals[0].psitsummary[0].$.leadoff || "").split(",").map(Number),
            wRunners: (team.totals[0].psitsummary[0].$.wrunners || "").split(",").map(Number),
            vsLeft: (team.totals[0].psitsummary[0].$.vsleft || "").split(",").map(Number),
            vsRight: (team.totals[0].psitsummary[0].$.vsright || "").split(",").map(Number),
            w2Outs: (team.totals[0].psitsummary[0].$.w2outs || "").split(",").map(Number),
            pitches: team.totals[0].psitsummary[0].$.pitches || 0,
            strikes: team.totals[0].psitsummary[0].$.strikes || 0,
        };
    }
    totals.hitSummary = hitSummary;
    totals.pitchSummary = pitchSummary;
    /* if(team.totals[0].hsituation){
       totals.hitSituation = []
       totals.hitSituation.push({
         context: team.totals[0].hsituation[0].$.context || "",
         pos: team.totals[0].hsituation[0].$.pos || "",
         ab: team.totals[0].hsituation[0].$.ab || 0,
         r: team.totals[0].hsituation[0].$.r || 0,
         h: team.totals[0].hsituation[0].$.h || 0,
         rbi: team.totals[0].hsituation[0].$.rbi || 0,
         ground: team.totals[0].hsituation[0].$.ground || 0,
         fly: team.totals[0].hsituation[0].$.fly || 0,
         cs: team.totals[0].hsituation[0].$.cs || 0,
         sf: team.totals[0].hsituation[0].$.sf || 0,
         gdp: team.totals[0].hsituation[0].$.gdp || 0,
         hitDp: team.totals[0].hsituation[0].$.hitdp || 0,
         so: team.totals[0].hsituation[0].$.so || 0,
         bb: team.totals[0].hsituation[0].$.bb || 0,
         double: team.totals[0].hsituation[0].$.double || 0,
         triple: team.totals[0].hsituation[0].$.triple || 0,
         kl: team.totals[0].hsituation[0].$.kl || 0,
         sb: team.totals[0].hsituation[0].$.sb || 0,
         spot: team.totals[0].hsituation[0].$.spot || 0,
         pitcher: team.totals[0].hsituation[0].$.pitcher || "",
         pitcherPlayerId: team.totals[0].hsituation[0].$.pitcher || "",
       });
     }
 
     if(team.totals[0].fsituation){
       totals.fieldSituation = {
         context: team.totals[0].fsituation[0].$.context || "",
         pos: team.totals[0].fsituation[0].$.pos || "",
         po: team.totals[0].fsituation[0].$.po || 0,
         a: team.totals[0].fsituation[0].$.a || 0,
         e: team.totals[0].fsituation[0].$.e || 0,
         sba: team.totals[0].fsituation[0].$.sba || 0,
         csb: team.totals[0].fsituation[0].$.csb || 0,
       };
     }
     totals.pitchingSituation = [];
     for (var psituation of team.totals[0].psituation){
       totals.pitchingSituation.push({
         context: psituation.$.context || "",
         innining: psituation.$.inn || 0,
         ip: psituation.$.ip || 0,
         h: psituation.$.h || 0,
         r: psituation.$.r || 0,
         er: psituation.$.er || 0,
         bb: psituation.$.bb || 0,
         so: psituation.$.so || 0,
         bf: psituation.$.bf || 0,
         ab: psituation.$.ab || 0,
         fly: psituation.$.fly || 0,
         ground: psituation.$.ground || 0,
         kl: psituation.$.kl || 0,
         double: psituation.$.double || 0,
         triple: psituation.$.triple || 0,
         ibb: psituation.$.ibb || 0,
         gdp: psituation.$.gdp || 0,
       });
     }*/
    return totals;
}
exports.parseTotals = parseTotals;
/**
 * parse the line score information about a team
 * @param team team information from statcrew JSON
 */
function parseLineScore(team) {
    const linescoreInfo = team.linescore[0];
    const parsedInningss = [];
    if (linescoreInfo.lineinn !== undefined) {
        for (const innings of linescoreInfo.lineinn) {
            parsedInningss.push({ inning: innings.$.inn, score: innings.$.score == "X" ? 0 : Number(innings.$.score) });
        }
    }
    return {
        score: linescoreInfo.$.runs,
        runs: linescoreInfo.$.runs,
        hits: linescoreInfo.$.hits,
        errs: linescoreInfo.$.errs,
        lob: linescoreInfo.$.lob,
        innings: parsedInningss,
    };
}
/**
 * parse the teams total stats from the game
 * @param team team information from statcrew JSON
 */
function parseRecords(team) {
    if (team.$.record === undefined) {
        return {
            wins: 0,
            losses: 0,
        };
    }
    if (Number(team.$.record.split("-")[0]) > Number(team.$.record.split("-")[1])) {
        return {
            wins: 1,
            losses: 0,
        };
    }
    return {
        wins: 0,
        losses: 1,
    };
}
exports.parseRecords = parseRecords;
function computeTotalBases(oneb, twob, threeb, hr) {
    let twobase = twob * 1;
    let threebase = threeb * 2;
    let hrbase = hr * 3;
    return oneb + twobase + threebase + hrbase;
}
//# sourceMappingURL=teamParser.js.map