"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AthlyteImporter_1 = require("../../../AthlyteImporter");
/**
 * Parse the batter information and returns the athlyte batter compatible data
 * @param batter is a StatcrewPlay.IBatter object.
*/
function parseBatter(batter) {
    return {
        name: batter.$.name,
        id: batter.$.code,
        action: batter.$.action,
        out: batter.$.out,
        adv: batter.$.adv,
        tobase: batter.$.tobase,
        ab: batter.$.ab,
        k: batter.$.k,
        kl: batter.$.kl,
        flyout: batter.$.flyout,
        wherehit: batter.$.wherehit,
    };
}
exports.parseBatter = parseBatter;
/**
 * Parse the pitcher information and returns the athlyte pitcher compatible object
 * @param pitcher is a StatcrewPlay.IPitcher object.
*/
function parsePitcher(pitcher) {
    return {
        name: pitcher.$.name,
        id: pitcher.$.code,
        bf: pitcher.$.bf,
        ip: pitcher.$.ip,
        ab: pitcher.$.ab,
        k: pitcher.$.k,
        kl: pitcher.$.kl,
        flyout: pitcher.$.flyout,
    };
}
exports.parsePitcher = parsePitcher;
/**
 * Parse the pitches information and returns the athlyte pitches compatible object
 * @param pitches is a StatcrewPlay.IPitches object.
*/
function parsePitches(pitches) {
    return {
        text: pitches.$.text,
        b: pitches.$.b,
        s: pitches.$.s,
    };
}
exports.parsePitches = parsePitches;
/**
 * Parse the fielder information and returns the athlyte fielder compatible object
 * @param fielder is a StatcrewPlay.IFielder object.
*/
function parseFielder(fielder) {
    const athyteFielder = [];
    if (!fielder) {
        return athyteFielder;
    }
    fielder.forEach((fielderInstance, index) => {
        athyteFielder.push({
            pos: fielderInstance.$.pos,
            name: fielderInstance.$.name,
            id: fielderInstance.$.code,
            po: fielderInstance.$.po,
            a: fielderInstance.$.a,
        });
    });
    return athyteFielder;
}
exports.parseFielder = parseFielder;
/**
 * Parse the runner information and returns the athlyte runner compatible object
 * @param runner is a StatcrewPlay.IRunner object.
*/
function parseRunner(runner) {
    return {
        base: runner.$.base,
        name: runner.$.name,
        id: runner.$.code,
        action: runner.$.action,
        out: runner.$.out,
        adv: runner.$.adv,
        tobase: runner.$.tobase,
        scored: runner.$.scored,
        por: runner.$.por,
    };
}
exports.parseRunner = parseRunner;
/**
 * Parse the runner information and returns the athlyte runner compatible object
 * @param runner is a StatcrewPlay.IRunner object.
*/
function parseSub(sub) {
    return {
        for: sub.$.for,
        who: sub.$.who,
        pos: sub.$.pos,
        spot: sub.$.spot,
        team: sub.$.vh == "H" ? AthlyteImporter_1.VH.home : AthlyteImporter_1.VH.visitor,
        forId: sub.$.forcode,
        whoId: sub.$.whocode,
    };
}
exports.parseSub = parseSub;
/*export function addPlayerInvolved(playerId: PlayerId): void {
  if (this.results.playersInvolved.indexOf(playerId) === -1) {
    this.results.playersInvolved.push(playerId);
  }
}*/
//# sourceMappingURL=playParser.js.map