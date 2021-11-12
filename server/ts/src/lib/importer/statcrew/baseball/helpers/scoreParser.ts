import { calculateDistance } from "../../../../calculateDistance";
import { VH } from "../../../AthlyteImporter";

// definitions
import * as Athlyte from "../../../../../../../../typings/athlyte/basketball";
import * as AthlytePlay from "../../../../../../../../typings/athlyte/basketball/play.d";

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
  poss: VH,
  playerCode: string,
  type?: string,  
  hscore?: number,
  vscore?: number): AthlytePlay.IScoreInfo | void {

  if (type === undefined || vscore === undefined || hscore === undefined) {
    return;
  }

  return { 
    side: poss, 
    scoringPlayerId: playerCode,
    type: type, 
    homeScore:hscore, 
    visitorScore:vscore, 
  };  
}




