"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function parseScore(poss, playerCode, type, hscore, vscore) {
    if (type === undefined || vscore === undefined || hscore === undefined) {
        return;
    }
    return {
        side: poss,
        scoringPlayerId: playerCode,
        type: type,
        homeScore: hscore,
        visitorScore: vscore,
    };
}
exports.parseScore = parseScore;
//# sourceMappingURL=scoreParser.js.map