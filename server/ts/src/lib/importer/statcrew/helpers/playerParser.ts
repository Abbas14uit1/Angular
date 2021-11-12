import * as moment from "moment";

// typings
import * as Athlyte from "../../../../../../../typings/athlyte/football";
import * as AthlyteCommon from "../../../../../../../typings/athlyte/football/common-stats.d";
import * as AthlytePlayer from "../../../../../../../typings/athlyte/football/player.d";
import * as StatcrewTeam from "../../../../../../../typings/statcrew/football/team.d";
import { VH } from "../../AthlyteImporter";

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
export function parsePlayer(
  player: StatcrewTeam.IPlayer,
  teamCode: number,
  teamName: string,
  teamConference: string,
  teamConferenceDivision: string,
  teamTidyName: string,
  opponentCode: number,
  opponentName: string,
  opponentConference: string,
  opponentConferenceDivision: string,
  side: VH,
  gameDate: Date,
  actualDate: string):
  AthlytePlayer.IPlayer {
  const stats: AthlyteCommon.ICommonStats = {
    receiving: player.rcv ? parseReceiving(player.rcv[0]) : undefined,
    rushing: player.rush ? parseRush(player.rush[0]) : undefined,
    pass: player.pass ? parsePass(player.pass[0]) : undefined,
    defense: player.defense ? parseDefense(player.defense[0]) : undefined,
    kickReceiving: player.kr ? parseKickReceiving(player.kr[0]) : undefined,
    fumbles: player.fumbles ? parseFumbles(player.fumbles[0]) : undefined,
    intReturn: player.ir ? parseInterceptionReturn(player.ir[0]) : undefined,
    scoring: player.scoring ? parseScoring(player.scoring[0]) : undefined,
    kickoff: player.ko ? parseKickoff(player.ko[0]) : undefined,
    fieldgoal: player.fg ? parseFieldgoal(player.fg[0]) : undefined,
    pointAfter: player.pat ? parsePointAfter(player.pat[0]) : undefined,
    punt: player.punt ? parsePunt(player.punt[0]) : undefined,
    puntReturn: player.pr ? parsePuntReturn(player.pr[0]) : undefined,
  };
  const individualGameStats: AthlytePlayer.IPerGamePlayerStats = {
    codeInGame: (side === VH.home ? "H" : "V") + player.$.code + "",
    side,
    gameDate,
    actualDate,
    opponentCode,
    opponentName,
    opponentConference,
    opponentConferenceDivision,
    season: moment(gameDate).subtract(3, "months").year(),
    pos: {
      dpos: player.$.dpos,
      opos: player.$.opos,
    },
    stats,
    started: (player.$.gs && true) || false,
    plays: [],
    playerClass: player.$.class,
    uniform: player.$.uni + "",
  };
  const athlytePlayer: AthlytePlayer.IPlayer = {
    teamCode,
    teamTidyName,
    teamName,
    teamConference,
    teamConferenceDivision,
    sportCode: "MFB",
    name: player.$.name,
    playerId: player.$.playerid,
    tidyName: player.$.checkname,
    games: [individualGameStats],
  };
  return athlytePlayer;
}

export function parseReceiving(stats: StatcrewTeam.IReceivingStats): AthlyteCommon.IReceivingStats {
  const rcv = stats.$;
  return {
    rcvLong: rcv.long,
    rcvNum: rcv.no,
    rcvTd: rcv.td,
    rcvYards: rcv.yds,
  };
}

export function parseRush(stats: StatcrewTeam.IRushStats): AthlyteCommon.IRushingStats {
  const rush = stats.$;
  return {
    rushAtt: rush.att,
    rushGain: rush.gain,
    rushLong: rush.long,
    rushLoss: rush.loss,
    rushTd: rush.td,
    rushYards: rush.yds,
  };
}

export function parsePass(stats: StatcrewTeam.IPassStats): AthlyteCommon.IPassStats {
  const pass = stats.$;
  return {
    passAtt: pass.att,
    passComp: pass.comp,
    passInt: pass.int,
    passLong: pass.long,
    passSacks: pass.sacks,
    passSackYards: pass.sackyds,
    passTd: pass.td,
    passYards: pass.yds,
  };
}

export function parseDefense(stats: StatcrewTeam.IDefenseStats): AthlyteCommon.IDefenseStats {
  const defense = stats.$;
  const dTackA = defense.tacka || 0;
  const dTackUa = defense.tackua || 0;
  const dSackUa = defense.sackua || 0;
  const dSackA = defense.sacka || 0;
  return {
    dTackUa,
    dTackA,
    dTackTot: defense.tot_tack || dTackUa + dTackA,
    dTflua: defense.tflua || 0,
    dTfla: defense.tfla || 0,
    dTflyds: defense.tflyds || 0,
    dSackUa,
    dSackA,
    dSacks: defense.sacks || dSackUa + dSackA,
    dSackYards: defense.sackyds || 0,
    dBrup: defense.brup || 0,
    dFf: defense.ff || 0,
    dFr: defense.fr || 0,
    dFryds: defense.fryds || 0,
    dInt: defense.int || 0,
    dIntYards: defense.intyds || 0,
    dQbh: defense.qbh || 0,
    dblkd: defense.blkd || 0,
  };
}

export function parseKickReceiving(stats: StatcrewTeam.ICommonReturnStats): AthlyteCommon.IKickReceivingStats {
  const kr = stats.$;
  return {
    krLong: kr.long,
    krNo: kr.no,
    krTd: kr.td,
    krYards: kr.yds,
  };
}

export function parseFumbles(stats: StatcrewTeam.IFumbleStats): AthlyteCommon.IFumbleStats {
  const fumb = stats.$;
  return {
    fumbLost: fumb.lost,
    fumbTotal: fumb.no,
  };
}

export function parseInterceptionReturn(stats: StatcrewTeam.ICommonReturnStats):
  AthlyteCommon.IInterceptionReturnStats {
  const ir = stats.$;
  return {
    irLong: ir.long,
    irNo: ir.no,
    irTd: ir.td,
    irYards: ir.yds,
  };
}

export function parseScoring(stats: StatcrewTeam.IScoringStats): AthlyteCommon.IScoringStats {
  const score = stats.$;
  return {
    fg: score.fg || 0,
    patKick: score.patkick || 0,
    td: score.td || 0,
  };
}

export function parseKickoff(stats: StatcrewTeam.IKickoffStats): AthlyteCommon.IKickoffStats {
  const ko = stats.$;
  return {
    koNum: ko.no,
    koOb: ko.ob,
    koTb: ko.tb,
    koYards: ko.yds,
  };
}

export function parseFieldgoal(stats: StatcrewTeam.IFieldgoalStats): AthlyteCommon.IFieldgoalStats {
  const fg = stats.$;
  return {
    fgAtt: fg.att,
    fgBlocked: fg.blkd,
    fgLong: fg.long,
    fgMade: fg.made,
  };
}

export function parsePointAfter(stats: StatcrewTeam.IPointAfterStats): AthlyteCommon.IPointAfterStats {
  const pat = stats.$;
  return {
    kickatt: pat.kickatt,
    kickmade: pat.kickmade,
    passatt: pat.passatt || 0,
    passmade: pat.passmade || 0,
    rushatt: pat.rushatt || 0,
    rushmade: pat.rushmade || 0,
  };
}

export function parsePunt(stats: StatcrewTeam.IPuntStats): AthlyteCommon.IPuntingStats {
  const punt = stats.$;
  return {
    puntNum: punt.no,
    puntYards: punt.yds,
    puntLong: punt.long,
    puntBlocked: punt.blkd,
    puntTb: punt.tb,
    puntFc: punt.fc,
    puntPlus50: punt.plus50,
    puntInside20: punt.inside20,
  };
}

export function parsePuntReturn(stats: StatcrewTeam.ICommonReturnStats): AthlyteCommon.IPuntReturnStats {
  const pr = stats.$;
  return {
    prLong: pr.long,
    prNo: pr.no,
    prTd: pr.td,
    prYards: pr.yds,
  };
}
