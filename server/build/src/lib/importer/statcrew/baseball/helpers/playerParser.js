"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
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
    let stats = {};
    stats.hitting = {
        appear: player.hitting ? 1 : 0,
        ab: player.hitting ? player.hitting[0].$.ab : 0,
        r: player.hitting ? player.hitting[0].$.r : 0,
        h: player.hitting ? player.hitting[0].$.h : 0,
        rbi: player.hitting ? player.hitting[0].$.rbi : 0,
        double: player.hitting ? player.hitting[0].$.double || 0 : 0,
        triple: player.hitting ? player.hitting[0].$.triple || 0 : 0,
        hr: player.hitting ? player.hitting[0].$.hr || 0 : 0,
        bb: player.hitting ? player.hitting[0].$.bb || 0 : 0,
        ibb: player.hitting ? player.hitting[0].$.ibb || 0 : 0,
        so: player.hitting ? player.hitting[0].$.so || 0 : 0,
        hbp: player.hitting ? player.hitting[0].$.hbp || 0 : 0,
        kl: player.hitting ? player.hitting[0].$.kl || 0 : 0,
        sb: player.hitting ? player.hitting[0].$.sb || 0 : 0,
        cs: player.hitting ? player.hitting[0].$.cs || 0 : 0,
        sh: player.hitting ? player.hitting[0].$.sh || 0 : 0,
        sf: player.hitting ? player.hitting[0].$.sf || 0 : 0,
        picked: player.hitting ? player.hitting[0].$.picked || 0 : 0,
        rchci: player.hitting ? player.hitting[0].$.rchci || 0 : 0,
        rcherr: player.hitting ? player.hitting[0].$.rcherr || 0 : 0,
        rchfc: player.hitting ? player.hitting[0].$.rchfc || 0 : 0,
        gdp: player.hitting ? player.hitting[0].$.gdp || 0 : 0,
        hitDp: player.hitting ? player.hitting[0].$.hitdp || 0 : 0,
        ground: player.hitting ? player.hitting[0].$.ground || 0 : 0,
        fly: player.hitting ? player.hitting[0].$.fly || 0 : 0,
        tb: computeTotalBases(player.hitting ? player.hitting[0].$.h : 0, player.hitting ? player.hitting[0].$.double || 0 : 0, player.hitting ? player.hitting[0].$.triple || 0 : 0, player.hitting ? player.hitting[0].$.hr || 0 : 0),
        hwhp: (player.hitting ? player.hitting[0].$.h : 0) +
            (player.hitting ? player.hitting[0].$.bb || 0 : 0) +
            (player.hitting ? player.hitting[0].$.hbp || 0 : 0),
        abbhpsf: (player.hitting ? player.hitting[0].$.ab : 0) +
            (player.hitting ? player.hitting[0].$.bb || 0 : 0) +
            (player.hitting ? player.hitting[0].$.hbp || 0 : 0) +
            (player.hitting ? player.hitting[0].$.sf || 0 : 0),
        pa: (player.hitting ? player.hitting[0].$.ab : 0) +
            (player.hitting ? player.hitting[0].$.bb || 0 : 0) +
            (player.hitting ? player.hitting[0].$.hbp || 0 : 0) +
            (player.hitting ? player.hitting[0].$.sf || 0 : 0) +
            (player.hitting ? player.hitting[0].$.sb || 0 : 0),
        babp: ((player.hitting ? player.hitting[0].$.ab : 0) -
            (player.hitting ? player.hitting[0].$.hr || 0 : 0) -
            (player.hitting ? player.hitting[0].$.so || 0 : 0) +
            (player.hitting ? player.hitting[0].$.sf || 0 : 0)),
        single: ((player.hitting ? player.hitting[0].$.h : 0) -
            ((player.hitting ? player.hitting[0].$.double || 0 : 0) +
                (player.hitting ? player.hitting[0].$.triple || 0 : 0) +
                (player.hitting ? player.hitting[0].$.hr || 0 : 0))),
        hhr: ((player.hitting ? player.hitting[0].$.h : 0) -
            (player.hitting ? player.hitting[0].$.hr || 0 : 0)),
        sba: ((player.hitting ? player.hitting[0].$.sb || 0 : 0) +
            (player.hitting ? player.hitting[0].$.cs || 0 : 0)),
    };
    stats.fielding = {
        appear: player.fielding ? 1 : 0,
        po: player.fielding ? player.fielding[0].$.po || 0 : 0,
        a: player.fielding ? player.fielding[0].$.a || 0 : 0,
        e: player.fielding ? player.fielding[0].$.e || 0 : 0,
        sba: player.fielding ? player.fielding[0].$.sba || 0 : 0,
        csb: player.fielding ? player.fielding[0].$.csb || 0 : 0,
        pb: player.fielding ? player.fielding[0].$.pb || 0 : 0,
        ci: player.fielding ? player.fielding[0].$.ci || 0 : 0,
        indp: player.fielding ? player.fielding[0].$.indp || 0 : 0,
        intp: player.fielding ? player.fielding[0].$.intp || 0 : 0,
        poa: (player.fielding ? player.fielding[0].$.po || 0 : 0) +
            (player.fielding ? player.fielding[0].$.a || 0 : 0),
        poae: (player.fielding ? player.fielding[0].$.po || 0 : 0) +
            (player.fielding ? player.fielding[0].$.a || 0 : 0) +
            (player.fielding ? player.fielding[0].$.e || 0 : 0)
    };
    stats.pitching = {
        appear: player.pitching ? 1 : 0,
        win: player.pitching ? player.pitching[0].$.win || 0 : 0,
        save: player.pitching ? player.pitching[0].$.save || 0 : 0,
        loss: player.pitching ? player.pitching[0].$.loss || 0 : 0,
        gs: player.pitching ? player.pitching[0].$.gs || 0 : 0,
        cg: player.pitching ? player.pitching[0].$.cg || 0 : 0,
        sho: player.pitching ? player.pitching[0].$.sho || 0 : 0,
        cbo: player.pitching ? player.pitching[0].$.cbo || 0 : 0,
        ip: player.pitching ? player.pitching[0].$.ip || 0 : 0,
        h: player.pitching ? player.pitching[0].$.h || 0 : 0,
        r: player.pitching ? player.pitching[0].$.r || 0 : 0,
        er: player.pitching ? player.pitching[0].$.er || 0 : 0,
        bb: player.pitching ? player.pitching[0].$.bb || 0 : 0,
        k: player.pitching ? player.pitching[0].$.k || 0 : 0,
        so: player.pitching ? player.pitching[0].$.so || 0 : 0,
        bf: player.pitching ? player.pitching[0].$.bf || 0 : 0,
        ab: player.pitching ? player.pitching[0].$.ab || 0 : 0,
        double: player.pitching ? player.pitching[0].$.double || 0 : 0,
        triple: player.pitching ? player.pitching[0].$.triple || 0 : 0,
        hr: player.pitching ? player.pitching[0].$.hr || 0 : 0,
        wp: player.pitching ? player.pitching[0].$.wp || 0 : 0,
        bk: player.pitching ? player.pitching[0].$.bk || 0 : 0,
        hbp: player.pitching ? player.pitching[0].$.hbp || 0 : 0,
        kl: player.pitching ? player.pitching[0].$.kl || 0 : 0,
        ibb: player.pitching ? player.pitching[0].$.ibb || 0 : 0,
        inheritr: player.pitching ? player.pitching[0].$.inheritr || 0 : 0,
        inherits: player.pitching ? player.pitching[0].$.inherits || 0 : 0,
        sfa: player.pitching ? player.pitching[0].$.sfa || 0 : 0,
        sha: player.pitching ? player.pitching[0].$.sha || 0 : 0,
        cia: player.pitching ? player.pitching[0].$.cia || 0 : 0,
        pitches: player.pitching ? player.pitching[0].$.pitches || 0 : 0,
        gdp: player.pitching ? player.pitching[0].$.gdp || 0 : 0,
        fly: player.pitching ? player.pitching[0].$.fly || 0 : 0,
        ground: player.pitching ? player.pitching[0].$.ground || 0 : 0,
        teamue: player.pitching ? player.pitching[0].$.teamue || 0 : 0,
        hhr: (player.pitching ? player.pitching[0].$.h || 0 : 0) -
            (player.pitching ? player.pitching[0].$.hr || 0 : 0),
        abkhrsf: (player.pitching ? player.pitching[0].$.ab || 0 : 0) -
            (player.pitching ? player.pitching[0].$.hr || 0 : 0) -
            (player.pitching ? player.pitching[0].$.so || 0 : 0) +
            (player.pitching ? player.pitching[0].$.sfa || 0 : 0),
        hwhp: (player.pitching ? player.pitching[0].$.h || 0 : 0) +
            (player.pitching ? player.pitching[0].$.bb || 0 : 0) +
            (player.pitching ? player.pitching[0].$.hbp || 0 : 0),
        pa: (player.pitching ? player.pitching[0].$.ab || 0 : 0) +
            (player.pitching ? player.pitching[0].$.bb || 0 : 0) +
            (player.pitching ? player.pitching[0].$.hbp || 0 : 0) +
            (player.pitching ? player.pitching[0].$.sfa || 0 : 0) +
            (player.pitching ? player.pitching[0].$.sha || 0 : 0),
        tb: computeTotalBases(player.pitching ? player.pitching[0].$.h || 0 : 0, player.pitching ? player.pitching[0].$.double || 0 : 0, player.pitching ? player.pitching[0].$.triple || 0 : 0, player.pitching ? player.pitching[0].$.hr || 0 : 0)
    };
    stats.fieldSituation = {
        context: player.fsituation ? player.fsituation[0].$.context : "",
        pos: player.fsituation ? player.fsituation[0].$.pos : "",
        po: player.fsituation ? player.fsituation[0].$.po : 0,
        a: player.fsituation ? player.fsituation[0].$.a : 0,
        e: player.fsituation ? player.fsituation[0].$.e : 0,
        sba: player.fsituation ? player.fsituation[0].$.sba : 0,
        csb: player.fsituation ? player.fsituation[0].$.csb : 0,
        sbcs: (player.fsituation ? player.fsituation[0].$.sba || 0 : 0) +
            (player.fsituation ? player.fsituation[0].$.csb || 0 : 0),
    };
    const hitSituation = [];
    if (player.hsituation) {
        player.hsituation.forEach((situation, index) => {
            hitSituation.push({
                context: situation.$.context || "",
                pos: situation.$.pos || "",
                ab: situation.$.ab || 0,
                r: situation.$.r || 0,
                h: situation.$.h || 0,
                rbi: situation.$.rbi || 0,
                fly: situation.$.fly || 0,
                cs: situation.$.cs || 0,
                sf: situation.$.sf || 0,
                gdp: situation.$.gdp || 0,
                hitDp: situation.$.hitdp || 0,
                bb: situation.$.bb || 0,
                so: situation.$.so || 0,
                double: situation.$.double || 0,
                triple: situation.$.triple || 0,
                kl: situation.$.kl || 0,
                sb: situation.$.sb || 0,
                ground: situation.$.ground || 0,
                spot: situation.$.spot || 0,
                pitcher: situation.$.pitcher || "",
                pitcherPlayerId: situation.$.pitcher || "",
                sbcs: (situation.$.sb || 0) + (situation.$.cs || 0),
            });
        });
    }
    if (player.hsitsummary && player.hsitsummary.length >= 1 && player.hsitsummary[0].$ != undefined) {
        stats.hitSummary = {
            rchfc: player.hsitsummary[0].$.rchfc || 0,
            rcherr: player.hsitsummary[0].$.rcherr || 0,
            rchci: player.hsitsummary[0].$.rchci || 0,
            ground: player.hsitsummary[0].$.ground || 0,
            fly: player.hsitsummary[0].$.fly || 0,
            w2Outs: (player.hsitsummary[0].$.w2outs || "").split(',').map(Number),
            wRunners: (player.hsitsummary[0].$.wrunners || "").split(',').map(Number),
            wrBiops: (player.hsitsummary[0].$.wrbiops || "").split(',').map(Number),
            vsLeft: (player.hsitsummary[0].$.vsleft || "").split(',').map(Number),
            vsRight: (player.hsitsummary[0].$.vsright || "").split(',').map(Number),
            leadOff: (player.hsitsummary[0].$.leadoff || "").split(',').map(Number),
            rbiThird: (player.hsitsummary[0].$.rbi3rd || "").split(',').map(Number),
            wLoaded: (player.hsitsummary[0].$.wloaded || "").split(',').map(Number),
            advops: (player.hsitsummary[0].$.advops || "").split(',').map(Number),
            adv: player.hsitsummary[0].$.adv || 0,
            lob: player.hsitsummary[0].$.lob || 0,
            rbi2Out: player.hsitsummary[0].$["rbi-2out"] || 0,
            wRunnersH: (player.hsitsummary[0].$.wrunners || "").split(',').length > 1 ?
                Number((player.hsitsummary[0].$.wrunners || "").split(',')[0]) : 0,
            wRunnersAB: (player.hsitsummary[0].$.wrunners || "").split(',').length > 1 ?
                Number((player.hsitsummary[0].$.wrunners || "").split(',')[1]) : 0,
            wLoadedH: (player.hsitsummary[0].$.wloaded || "").split(',').length > 1 ?
                Number((player.hsitsummary[0].$.wloaded || "").split(',')[0]) : 0,
            wLoadedAB: (player.hsitsummary[0].$.wloaded || "").split(',').length > 1 ?
                Number((player.hsitsummary[0].$.wloaded || "").split(',')[1]) : 0,
            w2OutsH: (player.hsitsummary[0].$.w2outs || "").split(',').length > 1 ?
                Number((player.hsitsummary[0].$.w2outs || "").split(',')[0]) : 0,
            w2OutsAB: (player.hsitsummary[0].$.w2outs || "").split(',').length > 1 ?
                Number((player.hsitsummary[0].$.w2outs || "").split(',')[1]) : 0,
        };
    }
    if (player.psitsummary && player.psitsummary.length >= 1 && player.psitsummary[0].$ != undefined) {
        stats.pitchSummary = {
            fly: player.psitsummary[0].$.fly || 0,
            ground: player.psitsummary[0].$.ground || 0,
            leadoff: (player.psitsummary[0].$.leadoff || "").split(",").map(Number),
            wRunners: (player.psitsummary[0].$.wrunners || "").split(",").map(Number),
            vsLeft: (player.psitsummary[0].$.vsleft || "").split(",").map(Number),
            vsRight: (player.psitsummary[0].$.vsright || "").split(",").map(Number),
            w2Outs: (player.psitsummary[0].$.w2outs || "").split(",").map(Number),
            pitches: player.psitsummary[0].$.pitches || 0,
            strikes: player.psitsummary[0].$.strikes || 0,
        };
    }
    stats.hitSituation = hitSituation;
    const bats = player.$.bats;
    const throws = player.$.throws;
    const spot = player.$.spot;
    const gp = player.$.gp;
    const gs = player.$.gs || 0;
    const individualGameStats = {
        //as the code is empty let use the uni
        codeInGame: player.$.code + "",
        side,
        gameDate,
        actualDate,
        opponentCode,
        opponentName,
        opponentConference,
        opponentConferenceDivision,
        bats,
        throws,
        spot,
        gp,
        gs,
        season: moment(gameDate).subtract(7, "months").year(),
        pos: player.$.pos,
        stats,
        started: (player.$.gs && true) || false,
        plays: [],
        playerClass: player.$.class,
        uniform: player.$.uni + "",
    };
    const athlytePlayer = {
        teamCode: teamCode,
        teamTidyName: teamTidyName,
        teamName: teamName,
        sportCode: sportCode,
        name: player.$.name,
        tidyName: player.$.name,
        games: [individualGameStats],
        playerId: player.$.playerid,
        teamConference: teamConference,
        teamConferenceDivision: teamConferenceDivision,
    };
    return athlytePlayer;
}
exports.parsePlayer = parsePlayer;
function computeTotalBases(oneb, twob, threeb, hr) {
    let twobase = twob * 1;
    let threebase = threeb * 2;
    let hrbase = hr * 3;
    return oneb + twobase + threebase + hrbase;
}
//# sourceMappingURL=playerParser.js.map