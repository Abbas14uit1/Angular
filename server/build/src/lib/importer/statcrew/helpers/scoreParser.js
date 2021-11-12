"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const calculateDistance_1 = require("../../../calculateDistance");
const AthlyteImporter_1 = require("../../AthlyteImporter");
/**
 * Get information about a play which resulted in a score
 * @param parsedTokens List of tokens containing (among other info) scoring information
 * @param startLocation Starting location of the play
 * @param poss Team with possession when the play started
 * @param type Type of score (touchdown, FG, etc.)
 * @param turnover Whether a turnover occured during the play (if one did; other team is given the scoring credit)
 * @param vscore Visitor score
 * @param hscore Home score
 */
function parseScore(parsedTokens, startLocation, poss, type, turnover, vscore, hscore) {
    if (type === undefined || vscore === undefined || hscore === undefined) {
        return;
    }
    if (parsedTokens.safety) {
        return parseScoreSafety(poss, parsedTokens, startLocation, hscore, vscore, turnover);
    }
    switch (type) {
        case "P":
            return parseScorePass(poss, parsedTokens, startLocation, hscore, vscore, turnover);
        case "R":
            return parseScoreRush(poss, parsedTokens, startLocation, hscore, vscore, turnover);
        case "X":
            return parseScorePat(poss, parsedTokens, startLocation, hscore, vscore, turnover);
        case "F":
            return parseScoreFG(poss, parsedTokens, startLocation, hscore, vscore, turnover);
        case "U":
            // punt return for TD
            // note: poss is the punting team; start location is the location ball was punted from
            return parseScorePuntReturn(poss, parsedTokens, startLocation, hscore, vscore, turnover);
        case "K":
            // kickoff return for TD
            // note: poss is the kicking team; start location is the location ball was kicked from
            return parseScoreKickoffReturn(poss, parsedTokens, startLocation, hscore, vscore, turnover);
        /* istanbul ignore next */
        default:
            throw new Error(`Unexpected type of score: ${type}`);
    }
}
exports.parseScore = parseScore;
const parseScorePass = (poss, tokens, startLocation, hscore, vscore, turnover) => {
    if (turnover && tokens.return) {
        // score on pass that was a turnover = a return touchdown
        const side = poss === AthlyteImporter_1.VH.visitor ? AthlyteImporter_1.VH.home : AthlyteImporter_1.VH.visitor; // invert scoring side
        return {
            side,
            scoringPlayerId: tokens.return.returnerId,
            homeScore: hscore,
            visitorScore: vscore,
            type: "RET",
            // yards for interception score is the interception location - endzone location
            yards: calculateDistance_1.calculateDistance(side, tokens.pass.endingLocation, tokens.return.ballReturnedTo),
        };
    }
    return {
        side: poss,
        scoringPlayerId: tokens.pass.receiverId,
        homeScore: hscore,
        visitorScore: vscore,
        type: "PASS",
        yards: calculateDistance_1.calculateDistance(poss, startLocation, tokens.pass.endingLocation),
    };
};
const parseScoreRush = (poss, tokens, startLocation, hscore, vscore, turnover) => {
    let distance;
    let scoringPlayerId;
    if (tokens.fumble && tokens.fumbleRecovery && turnover) {
        const newSide = poss === AthlyteImporter_1.VH.visitor ? AthlyteImporter_1.VH.home : AthlyteImporter_1.VH.visitor;
        scoringPlayerId = tokens.fumbleRecovery.recoveringId;
        distance = calculateDistance_1.calculateDistance(newSide, tokens.fumble.recoveredLocation, tokens.fumbleRecovery.returnedToLocation);
    }
    else if (tokens.fumble && tokens.fumbleRecovery) {
        scoringPlayerId = tokens.fumbleRecovery.recoveringId;
        distance = calculateDistance_1.calculateDistance(poss, tokens.fumble.recoveredLocation, tokens.fumbleRecovery.returnedToLocation);
    }
    else {
        scoringPlayerId = tokens.rush.rusherId;
        distance = calculateDistance_1.calculateDistance(poss, startLocation, tokens.rush.endingLocation);
    }
    return {
        side: turnover ? (poss === AthlyteImporter_1.VH.visitor ? AthlyteImporter_1.VH.home : AthlyteImporter_1.VH.visitor) : poss,
        scoringPlayerId,
        homeScore: hscore,
        visitorScore: vscore,
        type: "RUSH",
        yards: distance,
    };
};
const parseScorePat = (poss, tokens, startLocation, hscore, vscore, turnover) => {
    return {
        side: turnover /* istanbul ignore next */ ? (poss === AthlyteImporter_1.VH.visitor ? AthlyteImporter_1.VH.home : AthlyteImporter_1.VH.visitor) : poss,
        scoringPlayerId: tokens.pointAfterTd.playerId,
        homeScore: hscore,
        visitorScore: vscore,
        type: "PAT",
        yards: startLocation.yardline,
    };
};
const parseScoreFG = (poss, tokens, startLocation, hscore, vscore, turnover) => {
    return {
        side: turnover /* istanbul ignore next */ ? (poss === AthlyteImporter_1.VH.visitor ? AthlyteImporter_1.VH.home : AthlyteImporter_1.VH.visitor) : poss,
        scoringPlayerId: tokens.fga.kickerId,
        homeScore: hscore,
        visitorScore: vscore,
        type: "FG",
        yards: tokens.fga.distance,
    };
};
/**
 * Parse a punt return for a touchdown
 * @param poss Possession (the punting team)
 * @param tokens Object with tokens describing the play
 * @param startLoation Starting location of play (where ball was punted from)
 * @param hscore Home score
 * @param vscore Visitor score
 * @param turnover Whether a turnover occured during the play; if so, the scoring team is opposite the expected one
 */
const parseScorePuntReturn = (poss, tokens, startLoation, hscore, vscore, turnover) => {
    let distance;
    let scoringPlayerId;
    const scoringTeam = turnover ?
        /* istanbul ignore next */ poss :
        /* istanbul ignore next */ (poss === AthlyteImporter_1.VH.visitor ? AthlyteImporter_1.VH.home : AthlyteImporter_1.VH.visitor);
    if (tokens.block) {
        distance = calculateDistance_1.calculateDistance(scoringTeam, tokens.punt.recoveredLocation, tokens.fumbleRecovery.returnedToLocation);
        scoringPlayerId = tokens.fumbleRecovery.recoveringId;
    }
    else {
        distance = calculateDistance_1.calculateDistance(scoringTeam, tokens.punt.puntedToLocation, tokens.return.ballReturnedTo);
        scoringPlayerId = tokens.return.returnerId;
    }
    return {
        side: scoringTeam,
        homeScore: hscore,
        visitorScore: vscore,
        scoringPlayerId,
        type: "RET",
        yards: distance,
    };
};
/**
 * Parse a kickoff return for a touchdown
 * @param poss Possession (the kicking team)
 * @param tokens Object with tokens describing the play
 * @param startLocation Starting location of the play (where ball was kicked from)
 * @param hscore Home score
 * @param vscore Visitor score
 * @param turnover Whether a turnover occured during play; for a kickoff, this *should* never be true
 */
const parseScoreKickoffReturn = (poss, tokens, startLocation, hscore, vscore, turnover) => {
    const scoringTeam = turnover ?
        /* istanbul ignore next: kickoffs don't have forced turnovers */ poss :
        /* istanbul ignore next */ (poss === AthlyteImporter_1.VH.visitor ? AthlyteImporter_1.VH.home : AthlyteImporter_1.VH.visitor);
    const distance = calculateDistance_1.calculateDistance(scoringTeam, tokens.kickoff.kickedTo, tokens.return.ballReturnedTo);
    return {
        side: scoringTeam,
        homeScore: hscore,
        visitorScore: vscore,
        scoringPlayerId: tokens.return.returnerId,
        type: "RET",
        yards: distance,
    };
};
const parseScoreSafety = (poss, tokens, startLocation, hscore, vscore, turnover) => {
    const scoringTeam = tokens.safety.scoringTeam;
    return {
        side: scoringTeam,
        homeScore: hscore,
        visitorScore: vscore,
        scoringPlayerId: tokens.safety.playerId,
        type: "SAF",
        yards: 0,
    };
};
//# sourceMappingURL=scoreParser.js.map