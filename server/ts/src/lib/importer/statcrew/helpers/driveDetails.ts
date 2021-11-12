// types
import { IDriveDetails, IDrivePlayInfo } from "../../../../../../../typings/athlyte/football/game.d";
import { IFieldPosition } from "../../../../../../../typings/athlyte/football/index.d";
import { IDrive } from "../../../../../../../typings/statcrew/football/drive.d";

// enum
import { VH } from "../../AthlyteImporter";

/**
 * Get drive information from Statcrew and parse into the Athlyte format
 * @param drive A drive summary for Statcrew
 */
export const parseDriveDetails: (drive: IDrive) => IDriveDetails = (drive) => {
  const driveDetails = drive.$;
  const drivingTeam = driveDetails.vh === "V" ? VH.visitor : VH.home;
  return {
    drivingTeam,
    drivingTeamName: driveDetails.team,
    startPlay: parsePlayDetails(driveDetails.start, drivingTeam),
    endPlay: parsePlayDetails(driveDetails.end, drivingTeam),
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
export const parsePlayDetails: (playString: string, poss: VH) => IDrivePlayInfo = (playString, poss) => {
  const [type, qtr, clockTime, yardLine] = playString.split(",");
  return {
    clock: clockTime,
    quarter: Number.parseInt(qtr),
    playType: type,
    fieldPos: calculateFieldPosition(Number.parseInt(yardLine), poss),
  };
};

/**
 * Normalize field position, from a number that may be greater than 50 into a number <= 50 with
 * the side of the field stored separately. For example, when Home has the ball on their 70 yard line,
 * this function will return an object which states that the ball is on the visitor 30 yard line.
 * @param yard Yardline, may be > 50
 * @param poss Team with the ball
 */
export const calculateFieldPosition: (yard: number, poss: VH) => IFieldPosition = (yard, poss) => {
  // side
  let side: VH;
  if (yard > 50) {
    if (poss === VH.home) {
      // home team starting on their 60 yard line is same as starting on visitor 40 yard line
      side = VH.visitor;
    } else {
      // else visitor starting on visitor 60 is same as starting on home 50
      side = VH.home;
    }
  } else {
    side = poss;
  }

  // yard
  let yardBelow50: number;
  if (yard <= 50) {
    yardBelow50 = yard;
  } else {
    yardBelow50 = 100 - yard; // their 60 is our 40
  }

  return {
    endzone: yardBelow50 === 0,
    side,
    yardline: yardBelow50,
  };
};
