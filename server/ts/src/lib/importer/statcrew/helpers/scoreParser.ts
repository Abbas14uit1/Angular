import { calculateDistance } from "../../../calculateDistance";
import { VH } from "../../AthlyteImporter";

// definitions
import * as Athlyte from "../../../../../../../typings/athlyte/football";
import * as AthlytePlay from "../../../../../../../typings/athlyte/football/play.d";

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
export function parseScore(
  parsedTokens: AthlytePlay.IPlayResults,
  startLocation: Athlyte.IFieldPosition,
  poss: VH,
  type?: string,
  turnover?: string,
  vscore?: number,
  hscore?: number): AthlytePlay.IScoreInfo | void {

  if (type === undefined || vscore === undefined || hscore === undefined) {
    return;
  }

  if (parsedTokens.safety) {
    return parseScoreSafety(poss, parsedTokens, startLocation, hscore!, vscore!, turnover);
  }
  switch (type) {
    case "P":
      return parseScorePass(poss, parsedTokens, startLocation, hscore!, vscore!, turnover);
    case "R":
      return parseScoreRush(poss, parsedTokens, startLocation, hscore!, vscore!, turnover);
    case "X":
      return parseScorePat(poss, parsedTokens, startLocation, hscore!, vscore!, turnover);
    case "F":
      return parseScoreFG(poss, parsedTokens, startLocation, hscore!, vscore!, turnover);
    case "U":
      // punt return for TD
      // note: poss is the punting team; start location is the location ball was punted from
      return parseScorePuntReturn(poss, parsedTokens, startLocation, hscore!, vscore!, turnover);
    case "K":
      // kickoff return for TD
      // note: poss is the kicking team; start location is the location ball was kicked from
      return parseScoreKickoffReturn(poss, parsedTokens, startLocation, hscore!, vscore!, turnover);
    /* istanbul ignore next */
    default:
      throw new Error(`Unexpected type of score: ${type}`);
  }
}

type IScoreDetailFunc = (
  poss: VH,
  parsedTokens: AthlytePlay.IPlayResults,
  startLocation: Athlyte.IFieldPosition,
  hscore: number,
  vscore: number,
  turnover?: string,
) => AthlytePlay.IScoreInfo;

const parseScorePass: IScoreDetailFunc = (poss, tokens, startLocation, hscore, vscore, turnover) => {
  if (turnover && tokens.return) {
    // score on pass that was a turnover = a return touchdown
    const side = poss === VH.visitor ? VH.home : VH.visitor; // invert scoring side
    return {
      side,
      scoringPlayerId: tokens.return!.returnerId,
      homeScore: hscore,
      visitorScore: vscore,
      type: "RET",
      // yards for interception score is the interception location - endzone location
      yards: calculateDistance(side, tokens.pass!.endingLocation, tokens.return!.ballReturnedTo),
    };
  }
  return {
    side: poss,
    scoringPlayerId: tokens.pass!.receiverId,
    homeScore: hscore,
    visitorScore: vscore,
    type: "PASS",
    yards: calculateDistance(poss, startLocation, tokens.pass!.endingLocation),
  };
};

const parseScoreRush: IScoreDetailFunc = (poss, tokens, startLocation, hscore, vscore, turnover) => {
  let distance: number;
  let scoringPlayerId: string;
  if (tokens.fumble && tokens.fumbleRecovery && turnover) {
    const newSide = poss === VH.visitor ? VH.home : VH.visitor;
    scoringPlayerId = tokens.fumbleRecovery.recoveringId;
    distance = calculateDistance(newSide, tokens.fumble.recoveredLocation, tokens.fumbleRecovery.returnedToLocation);
  } else if (tokens.fumble && tokens.fumbleRecovery) {
    scoringPlayerId = tokens.fumbleRecovery.recoveringId;
    distance = calculateDistance(poss, tokens.fumble.recoveredLocation, tokens.fumbleRecovery.returnedToLocation);
  } else {
    scoringPlayerId = tokens.rush!.rusherId;
    distance = calculateDistance(poss, startLocation, tokens.rush!.endingLocation);
  }
  return {
    side: turnover ? (poss === VH.visitor ? VH.home : VH.visitor) : poss,
    scoringPlayerId,
    homeScore: hscore,
    visitorScore: vscore,
    type: "RUSH",
    yards: distance,
  };
};

const parseScorePat: IScoreDetailFunc = (poss, tokens, startLocation, hscore, vscore, turnover) => {
  return {
    side: turnover /* istanbul ignore next */ ? (poss === VH.visitor ? VH.home : VH.visitor) : poss,
    scoringPlayerId: tokens.pointAfterTd!.playerId,
    homeScore: hscore,
    visitorScore: vscore,
    type: "PAT",
    yards: startLocation.yardline, // PAT always goes from the yardline to the 0, so distance is just yardline number
  };
};

const parseScoreFG: IScoreDetailFunc = (poss, tokens, startLocation, hscore, vscore, turnover) => {
  return {
    side: turnover /* istanbul ignore next */ ? (poss === VH.visitor ? VH.home : VH.visitor) : poss,
    scoringPlayerId: tokens.fga!.kickerId,
    homeScore: hscore,
    visitorScore: vscore,
    type: "FG",
    yards: tokens.fga!.distance,
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
const parseScorePuntReturn: IScoreDetailFunc = (poss, tokens, startLoation, hscore, vscore, turnover) => {
  let distance: number;
  let scoringPlayerId: Athlyte.PlayerId;
  const scoringTeam = turnover ?
    /* istanbul ignore next */poss :
    /* istanbul ignore next */ (poss === VH.visitor ? VH.home : VH.visitor);
  if (tokens.block) {
    distance = calculateDistance(scoringTeam,
      tokens.punt!.recoveredLocation!, tokens.fumbleRecovery!.returnedToLocation);
    scoringPlayerId = tokens.fumbleRecovery!.recoveringId;
  } else {
    distance = calculateDistance(scoringTeam, tokens.punt!.puntedToLocation, tokens.return!.ballReturnedTo);
    scoringPlayerId = tokens.return!.returnerId;
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
const parseScoreKickoffReturn: IScoreDetailFunc = (poss, tokens, startLocation, hscore, vscore, turnover) => {
  const scoringTeam = turnover ?
    /* istanbul ignore next: kickoffs don't have forced turnovers */ poss :
    /* istanbul ignore next */ (poss === VH.visitor ? VH.home : VH.visitor);
  const distance = calculateDistance(scoringTeam, tokens.kickoff!.kickedTo, tokens.return!.ballReturnedTo);
  return {
    side: scoringTeam,
    homeScore: hscore,
    visitorScore: vscore,
    scoringPlayerId: tokens.return!.returnerId,
    type: "RET",
    yards: distance,
  };
};

const parseScoreSafety: IScoreDetailFunc = (poss, tokens, startLocation, hscore, vscore, turnover) => {
  const scoringTeam = tokens.safety!.scoringTeam;
  return {
    side: scoringTeam,
    homeScore: hscore,
    visitorScore: vscore,
    scoringPlayerId: tokens.safety!.playerId,
    type: "SAF",
    yards: 0,
  };
};
