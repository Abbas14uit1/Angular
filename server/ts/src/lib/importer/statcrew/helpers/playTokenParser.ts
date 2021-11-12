import * as winston from "winston";

import * as Athlyte from "../../../../../../../typings/athlyte/football/";
import { PlayerId } from "../../../../../../../typings/athlyte/football/index.d";
import * as AthlytePlay from "../../../../../../../typings/athlyte/football/play.d";
import { IStatcrewFootballJSON } from "../../../../../../../typings/statcrew/football";
import { VH } from "../../AthlyteImporter";

/**
 * Parse token strings from Statcrew data
 */
export class TokenParser {

  /**
   * Remove the token prefix and split by commas
   * @param token String with PREFIX:info,info,info,... format
   */
  private static split(token: string): string[] {
    const trimmed = token.substr(token.indexOf(":") + 1);
    return trimmed.split(",");
  }

  private readonly split: string[];
  private results: AthlytePlay.IPlayResults;
  private poss: VH;
  private turnover: string | undefined;
  private logger?: winston.LoggerInstance;
  private isReturned: boolean = false;
  private isKIOrPuntOrFga: boolean = false;
  private isFgaBlocked: boolean = false;

  constructor(input: string, poss: VH, turnover: string | undefined, logger?: winston.LoggerInstance) {
    this.split = input.split(" ");
    this.results = { playersInvolved: [] };
    this.poss = poss;
    this.turnover = turnover;
    this.logger = logger;
    this.isReturned = false;
    this.isKIOrPuntOrFga = false;
    this.isFgaBlocked = false;
  }

  /**
   * Parse the token string that was provided to constructor, returning all information
   * that could be found.
   */
  public parse(): AthlytePlay.IPlayResults {
    if (this.split.length === 1 && this.split[0] === "") {
      return this.results;
    }
    for (const token of this.split) {
      const prefix = token.substr(0, token.indexOf(":") + 1);
      switch (prefix) {
        case "CMT:":  // comment
          return this.results;
        case "KO:":
          this.results.kickoff = this.parseKickoff(token);
          this.addPlayerInvolved(this.results.kickoff.kickerId);
          break;
        case "TB:":
          this.results.touchback = true;
          break;
        case "PASS:":
          this.results.pass = this.parsePass(token);
          this.addPlayerInvolved(this.results.pass.passerId);
          this.addPlayerInvolved(this.results.pass.receiverId);
          break;
        case "TACK:":
          this.results.tackle = this.parseTackle(token);
          this.results.tackle.forEach((tackle) => {
            this.addPlayerInvolved(tackle.tacklerId);
          });
          break;
        case "RUSH:":
          this.results.rush = this.parseRush(token);
          this.addPlayerInvolved(this.results.rush.rusherId);
          break;
        case "FGA:":  // fieldgoal attempt
          this.results.fga = this.parseFga(token);
          this.addPlayerInvolved(this.results.fga.kickerId);
          break;
        case "RET:":  // return
          this.results.return = this.parseReturn(token);
          this.addPlayerInvolved(this.results.return.returnerId);
          break;
        case "OB:": // out of bounds
          this.results.outOfBounds = true;
          break;
        case "SACK:":
          this.results.sack = this.parseSack(token);
          this.results.sack.sackerIds.forEach((sacker) => {
            this.addPlayerInvolved(sacker);
          });
          break;
        case "PUNT:":
          this.results.punt = this.parsePunt(token);
          this.addPlayerInvolved(this.results.punt.punterId);
          break;
        case "FC:": // fair catch
          this.results.fairCatch = this.parseFairCatch(token);
          this.addPlayerInvolved(this.results.fairCatch.callerId);
          break;
        case "PEN:":
          this.results.penalty = this.parsePenalty(token);
          if (this.results.penalty.details.playerDrawingPenalty) {
            this.addPlayerInvolved(this.results.penalty.details.playerDrawingPenalty);
          }
          break;
        case "TOUT:":
          this.results.timeout = this.parseTimeout(token);
          break;
        case "NOPLAY:":
          this.results.noplay = true;
          break;
        case "QBH:":
          this.results.qbHurry = this.parseQbHurry(token);
          this.addPlayerInvolved(this.results.qbHurry.playerId);
          break;
        case "FUMB:":
          this.results.fumble = this.parseFumble(token);
          this.addPlayerInvolved(this.results.fumble.fumbledBy);
          break;
        case "FORCE:":
          this.results.fumbleForced = this.parseFumbleForcer(token);
          this.addPlayerInvolved(this.results.fumbleForced.forcerId);
          break;
        case "+:":  // fumble recovery
          this.results.fumbleRecovery = this.parseFumbleRecovery(token);
          this.addPlayerInvolved(this.results.fumbleRecovery.recoveringId);
          break;
        case "DN:":
          this.results.down = true;
          break;
        case "BRUP:": // break up
          this.results.brokenUp = this.parseBrokenUp(token);
          this.addPlayerInvolved(this.results.brokenUp.breakingUpId);
          break;
        case "PAT:":
          this.results.pointAfterTd = this.parsePointAfter(token);
          this.addPlayerInvolved(this.results.pointAfterTd.playerId);
          break;
        case "SAF:":
          this.results.safety = this.parseSafety(token);
          this.addPlayerInvolved(this.results.safety.playerId);
          break;
        case "BLOCK:":
          this.results.block = this.parseBlock(token);
          this.addPlayerInvolved(this.results.block.blockerId);
        default:
          /* istanbul ignore next */
          if (this.logger) {
            this.logger.log("debug",
              `Token: ${prefix} is an unexpected play token prefix with properties ${TokenParser.split(token)}`);
          }
          break;
      }
    }
    return this.results;
  }

  /**
   * Parse the kickoff token.
   * Ex: KO:99,V00 indicates a kickoff by player with ID=99 to the visitor 0 yard line (i.e into endzone for touchback)
   * @param token Token containing the kickoff indicator, "KO"
   */
  private parseKickoff(token: string): AthlytePlay.IKickoffDetails {
    this.isKIOrPuntOrFga = true;
    const split = TokenParser.split(token);
    const kickerId = (this.poss === VH.home ? "H" : "V") + split[0];
    const location = split[1];
    const yardline = Number.parseInt(location.substr(1));
    const kickedTo: Athlyte.IFieldPosition = {
      endzone: yardline === 0,
      side: location.substr(0, 1) === "V" ? VH.visitor : VH.home,
      yardline,
    };
    return {
      kickedTo,
      kickerId,
    };
  }

  /**
   * Parse the pass token
   * Ex: PASS:0D,C,2B,V31 indicates a pass from player 0D to player 2B, completed (C), to the visitor 31 yard line.
   * C = completed, X = intercepted, I = incomplete.
   * @param token Token string containing the pass indicator, "PASS"
   */
  private parsePass(token: string): AthlytePlay.IPassDetails {
    const split = TokenParser.split(token);
    // passer
    const passerId = (this.poss === VH.home ? "H" : "V") + split[0];
    // status
    const wasCompleted = split[1] === "C";
    const wasIntercepted = split[1] === "X";
    
    // receiver
    let receiverId : string 
    if (wasIntercepted === true){
      receiverId = (this.poss === VH.home ? "V" : "H") + split[2];
    } else {
      receiverId = (this.poss === VH.home ? "H" : "V") + split[2];
    }
    
    // location
    const side = split[3].substr(0, 1);
    const yardline = Number.parseInt(split[3].substr(1));

    let endingLocation: Athlyte.IFieldPosition | undefined;
    if (side === "*") {
      // incomplete
      endingLocation = {
        side: this.poss,
        yardline,
        endzone: yardline === 0,
      };
    } else if (side !== "V" && side !== "H") {
      throw new TypeError("Unexpected value for play ending location");
    } else {
      endingLocation = {
        side: side === "V" ? VH.visitor : VH.home,
        yardline,
        endzone: yardline === 0,
      };
    }
    return {
      passerId,
      receiverId,
      wasCompleted,
      wasIntercepted,
      endingLocation,
    };
  }

  /**
   * Parse a tackle to get player(s) information
   * @param token Tackle token, TACK:player,player,player
   */
  private parseTackle(token: string): AthlytePlay.ITackleDetails[] {
    const split = TokenParser.split(token);
    const tacklers: AthlytePlay.ITackleDetails[] = [];
    let possString: string;
    if (this.turnover) {
      possString = (this.poss === VH.home ? "H" : "V");
    } else {
      possString = (this.poss === VH.home ? "V" : "H");
    }
    // fix for issue - tackle is getting added to the receiving team. 
    if (this.isKIOrPuntOrFga === true && this.isReturned === true) {
      possString = (this.poss === VH.home ? "H" : "V");
    }

    if (this.isFgaBlocked === true){
      possString = (this.poss === VH.home ? "H" : "V");
    }

    for (const tackler of split) {
      if (tackler.trim().length === 0)
        continue
      tacklers.push({
        tacklerId: possString + tackler,
      });
    }
    return tacklers;
  }

  /**
   * Parse a rush to get player rushing and the final location
   * @param token Rush token, RUSH:playerCode,rushedToLocation
   */
  private parseRush(token: string): AthlytePlay.IRushDetails {
    const split = TokenParser.split(token);
    const rusherId = (this.poss === VH.home ? "H" : "V") + split[0];
    const endingLocation: Athlyte.IFieldPosition = {
      side: split[1].substr(0, 1) === "V" ? VH.visitor : VH.home,
      yardline: Number.parseInt(split[1].substr(1)),
      endzone: split[1].substr(1, 3) === "00",
    };
    return { rusherId, endingLocation };
  }

  /**
   * Parse a field goal attempt to get kicker, distance, and success status
   * @param token Field goal attempt token, FGA:kickerId,distance,good
   */
  private parseFga(token: string): AthlytePlay.IFieldGoalDetails {
    this.isKIOrPuntOrFga = true;
    const split = TokenParser.split(token);
    this.isFgaBlocked = split[2] === "B";
    return {
      kickerId: (this.poss === VH.home ? "H" : "V") + split[0],
      distance: Number.parseInt(split[1]),
      wasGood: split[2] === "G",
    };
  }

  /**
   * Parse a kick return attempt to get returner and location
   * @param token Kick return token, RET:returnerId,returnedToLocation
   */
  private parseReturn(token: string): AthlytePlay.IReturnDetails {
    this.isReturned = true;
    const split = TokenParser.split(token);
    return {
      returnerId: (this.poss === VH.home ? "V" : "H") + split[0],
      ballReturnedTo: {
        side: split[1].substr(0, 1) === "V" ? VH.visitor : VH.home,
        yardline: Number.parseInt(split[1].substr(1)),
        endzone: split[1].substr(1, 3) === "00",
      },
    };
  }

  /**
   * Parse a sack to get player(s) involved
   * @param token Sack token, SACK:player,player,...
   */
  private parseSack(token: string): AthlytePlay.ISackDetails {
    const split = TokenParser.split(token);
    const sackers: Athlyte.PlayerId[] = [];
    for (const player of split) {
      sackers.push((this.poss === VH.home ? "V" : "H") + player);
    }
    return {
      sackerIds: sackers,
    };
  }

  /**
   * Parse a punt to get punter and location
   * @param token Punt token, PUNT:punterId,puntedToLocation
   */
  private parsePunt(token: string): AthlytePlay.IPuntDetails {
    this.isKIOrPuntOrFga = true
    const split = TokenParser.split(token);
    if (split.length === 2) {
      return {
        punterId: (this.poss === VH.home ? "H" : "V") + split[0],
        puntedToLocation: {
          side: split[1].substr(0, 1) === "V" ? VH.visitor : VH.home,
          yardline: Number.parseInt(split[1].substr(1)),
          endzone: split[1].substr(1, 3) === "00",
        },
      };
    } else {
      return {
        punterId: (this.poss === VH.home ? "H" : "V") + split[0],
        puntedToLocation: {
          side: split[1].substr(0, 1) === "V" ? VH.visitor : VH.home,
          yardline: Number.parseInt(split[1].substr(1)),
          endzone: split[1].substr(1, 3) === "00",
        },
        blocked: true,
        recoveringTeam: split[3] === "H" ? VH.home : VH.visitor,
        recoveredLocation: {
          side: split[4].substr(0, 1) === "V" ? VH.visitor : VH.home,
          yardline: Number.parseInt(split[4].substr(1)),
          endzone: split[4].substr(1, 3) === "00",
        },
        recoveringId: split[3] + split[5],
      };
    }
  }

  /**
   * Parse a fair catch to see who called it
   * @param token Fair catch token, FC:callerId
   */
  private parseFairCatch(token: string): AthlytePlay.IFairCatchDetails {
    const split = TokenParser.split(token);
    return {
      callerId: (this.poss === VH.home ? "V" : "H") + split[0],
    };
  }

  /**
   * Parse penalty to get information about player, type, team, etc.
   * @param token Penalty token, PEN:againstTeam,type,accepted,playerId,newLocation,???
   */
  private parsePenalty(token: string): AthlytePlay.IPenaltyDetails {
    const split = TokenParser.split(token);
    const against = split[0] === "V" ? VH.visitor : VH.home;
    const accepted = split[2] === "A";
    const details = accepted ? {
      playerDrawingPenalty: split[0] + split[3],
      type: split[1],
      newFieldPosition: {
        side: split[4].substr(0, 1) === "V" ? VH.visitor : VH.home,
        yardline: Number.parseInt(split[4].substr(1)),
        endzone: split[1].substr(1, 3) === "00",
      },
    } : {
        type: split[1],
      };
    return { against, accepted, details };
  }

  /**
   * Parse a timeout token to see who called it
   * @param token TOUT:callingTeam
   */
  private parseTimeout(token: string): AthlytePlay.ITimeOutDetails {
    const split = TokenParser.split(token);
    return {
      calledBy: split[0] === "V" ? VH.visitor : VH.home,
    };
  }

  /**
   * Parse a QB hurry to see who was the person hurrying the QB
   * @param token QB hurry token, QBH:team,playerId
   */
  private parseQbHurry(token: string): AthlytePlay.IQBHurryDetails {
    const split = TokenParser.split(token);
    return {
      playerId: (this.poss === VH.home ? "V" : "H") + split[1],
    };
  }

  /**
   * Parse a fumble token
   * @param token Fumble token string, FUMB:fumblingTeam,fumbleLocation,fumblingPlayer
   */
  private parseFumble(token: string): AthlytePlay.IFumbleDetails {
    const split = TokenParser.split(token);
    return {
      fumbledBy: split[0] + split[2] as Athlyte.PlayerId,
      recoveredLocation: {
        side: split[1].substr(0, 1) === "V" ? VH.visitor : VH.home,
        yardline: Number.parseInt(split[1].substr(1)),
        endzone: split[1].substr(1, 3) === "00",
      },
    };
  }

  /**
   * Parse a forced fumble
   * @param token Forced fumble token string, FORCE:forcingPlayerId
   */
  private parseFumbleForcer(token: string): AthlytePlay.IFumbleForceDetails {
    const split = TokenParser.split(token);
    // fix for issue - Kicking team did force fumble, was crediting to receiving team.
    if (this.isKIOrPuntOrFga === true && this.isReturned === true) {
      return {
          forcerId: (this.poss === VH.home ? "H" : "V") + split[0],
      };
    }
    const isIntercepted = this.results.pass? this.results.pass.wasIntercepted : false; 
    if ( isIntercepted === true && this.isReturned === true) {
      return {
          forcerId: (this.poss === VH.home ? "H" : "V") + split[0],
      };
    }

    return {
      // michael told me to assume the forcer is on defense
      forcerId: (this.poss === VH.home ? "V" : "H") + split[0],
    };
  }

  /**
   * Parse a fumble recovery
   * @param token Fumble recovery token string, +:recoveringPlayerId,returnedToLocation
   */
  private parseFumbleRecovery(token: string): AthlytePlay.IFumbleRecoveryDetails {
    const split = TokenParser.split(token);
    let possString: string;
    if (this.turnover) {
      possString = (this.poss === VH.home ? "V" : "H");
    } else {
      possString = (this.poss === VH.home ? "H" : "V");
    }
    if (this.isFgaBlocked === true) {
      possString = (this.poss === VH.home ? "V" : "H");
    }
    return {
      recoveringId: possString + split[0],
      returnedToLocation: {
        side: split[1].substr(0, 1) === "V" ? VH.visitor : VH.home,
        yardline: Number.parseInt(split[1].substr(1)),
        endzone: split[1].substr(1, 3) === "00",
      },
    };
  }

  /**
   * Parse a broken up pass to see who broke it up.
   * Current analysis of statcrew data indicates that breakup can only be a single player.
   * @param token Breakup string, BRUP:breakingUpId
   */
  private parseBrokenUp(token: string): AthlytePlay.IBrokenUpDetails {
    const split = TokenParser.split(token);
    return {
      breakingUpId: (this.poss === VH.home ? "V" : "H") + split[0],
    };
  }

  /**
   * Parse a point-after touchdown attempt. May be kick or two-point conversion.
   * @param token Parse point after touchdown attempt token string, PAT:type,playerId,wasGood
   */
  private parsePointAfter(token: string): AthlytePlay.IPointAfterTdDetails {
    const split = TokenParser.split(token);
    return {
      type: split[0],
      playerId: (this.poss === VH.home ? "H" : "V") + split[1],
      good: split[2] === "G",
    };
  }

  /**
   * Parse a safety to see who scored and who earned the safety
   * @param token safety string, SAF:scoringTeam,tacklerID
   */
  private parseSafety(token: string): AthlytePlay.ISafetyDetails {
    const split = TokenParser.split(token);
    return {
      scoringTeam: split[0] === "H" ? VH.home : VH.visitor,
      playerId: (this.poss === VH.home ? "V" : "H") + split[1],
    };
  }

  /**
   * parse a blocked punt or field goal to see who blocked it
   * @param token block punt/field goal string, BLOCK:blockerId
   */
  private parseBlock(token: string): AthlytePlay.IBlockDetails {
    const split = TokenParser.split(token);
    return {
      blockerId: (this.poss === VH.home ? "V" : "H") + split[0],
    };
  }

  private addPlayerInvolved(playerId: PlayerId): void {
    if (this.results.playersInvolved.indexOf(playerId) === -1) {
      this.results.playersInvolved.push(playerId);
    }
  }
}
