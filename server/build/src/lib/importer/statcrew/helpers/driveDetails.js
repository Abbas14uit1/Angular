"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// enum
const AthlyteImporter_1 = require("../../AthlyteImporter");
/**
 * Get drive information from Statcrew and parse into the Athlyte format
 * @param drive A drive summary for Statcrew
 */
exports.parseDriveDetails = (drive) => {
    const driveDetails = drive.$;
    const drivingTeam = driveDetails.vh === "V" ? AthlyteImporter_1.VH.visitor : AthlyteImporter_1.VH.home;
    return {
        drivingTeam,
        drivingTeamName: driveDetails.team,
        startPlay: exports.parsePlayDetails(driveDetails.start, drivingTeam),
        endPlay: exports.parsePlayDetails(driveDetails.end, drivingTeam),
        plays: driveDetails.plays,
        yards: driveDetails.yards,
        timeOfPossession: driveDetails.top,
    };
};
/**
 * Parse details about a drive's start or end from a string such as "KO,1,15:00,25", which would indicate
 * a kickoff in the 1st quarter, 15:00 on clock, from 25 yard line.
 * @param playString String containing information about the start/ end of a play
 * @param poss The team with possession, used for determining that a drive at the 70 yard line is \
 * the same as a drive on the other team's 20 yard line.
 */
exports.parsePlayDetails = (playString, poss) => {
    const [type, qtr, clockTime, yardLine] = playString.split(",");
    return {
        clock: clockTime,
        quarter: Number.parseInt(qtr),
        playType: type,
        fieldPos: exports.calculateFieldPosition(Number.parseInt(yardLine), poss),
    };
};
/**
 * Normalize field position, from a number that may be greater than 50 into a number <= 50 with
 * the side of the field stored separately. For example, when Home has the ball on their 70 yard line,
 * this function will return an object which states that the ball is on the visitor 30 yard line.
 * @param yard Yardline, may be > 50
 * @param poss Team with the ball
 */
exports.calculateFieldPosition = (yard, poss) => {
    // side
    let side;
    if (yard > 50) {
        if (poss === AthlyteImporter_1.VH.home) {
            // home team starting on their 60 yard line is same as starting on visitor 40 yard line
            side = AthlyteImporter_1.VH.visitor;
        }
        else {
            // else visitor starting on visitor 60 is same as starting on home 50
            side = AthlyteImporter_1.VH.home;
        }
    }
    else {
        side = poss;
    }
    // yard
    let yardBelow50;
    if (yard <= 50) {
        yardBelow50 = yard;
    }
    else {
        yardBelow50 = 100 - yard; // their 60 is our 40
    }
    return {
        endzone: yardBelow50 === 0,
        side,
        yardline: yardBelow50,
    };
};
//# sourceMappingURL=driveDetails.js.map