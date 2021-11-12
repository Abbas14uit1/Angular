import * as moment from "moment";

import { VH } from "../../AthlyteImporter";

import * as Athlyte from "../../../../../../../typings/athlyte/football";
import * as CommonStats from "../../../../../../../typings/athlyte/football/common-stats.d";
import * as AthlyteTeam from "../../../../../../../typings/athlyte/football/team.d";
import * as AthlyteGame from "../../../../../../../typings/athlyte/football/game.d";
import { IStatcrewFootballJSON } from "../../../../../../../typings/statcrew/football";
import * as StatcrewPlay from "../../../../../../../typings/statcrew/football/play.d";
import * as StatcrewTeam from "../../../../../../../typings/statcrew/football/team.d";
import * as StatcrewVenue from "../../../../../../../typings/statcrew/football/venue.d";

/**
 * Get information about a team from the statcrew JSON
 * @param inputTeam team information from the statcrew JSON
 * @param quarters the quarter information from the statcrew JSON
 * @param gameDate the date of the game
 * @param actualDate the actual date of the game as a string (actual string from XML)
 */
export function parseTeam(
  inputTeam: StatcrewTeam.ITeam, opponent: StatcrewTeam.ITeam,
  quarters: StatcrewPlay.IQuarter[], gameDate: Date, actualDate: string, venue: StatcrewVenue.IVenue): AthlyteTeam.ITeam {
  const { code, conference, conferenceDivision, name, tidyName } = parseMeta(inputTeam);
  const opponentData = parseMeta(opponent);
  // const opponentName = parseMeta(opponent).name;
  const linescore = parseLineScore(inputTeam);
  const totals = parseTotals(inputTeam);
  const side = parseSide(inputTeam.$.vh);
  const qtrTotals = parseQuarterSummaries(side, quarters);
  const venueData = parseVenue(venue);
  const players: string[] = [];
  const teamInfo = parseTeams([inputTeam, opponent]);
  const team: AthlyteTeam.ITeam = {
    games: {
      homeAway: side,
      opponentCode: opponentData.code,
      opponentName: opponentData.name,
      conference,
      conferenceDivision,
      opponentConference: opponentData.conference,
      opponentConferenceDivision: opponentData.conferenceDivision,
      linescore,
      totals,
      gameDate,
      actualDate,
      sportCode: "MFB",
      season: moment(gameDate).subtract(3, "months").year(),
      qtrTotals,
      homeTeam: teamInfo.home,
      visitorTeam: teamInfo.visitor,
      gameType: venueData.gameType,
      geoLocation: venueData.geoLocation,
      attendance: venueData.attendance,
      nightGame: venueData.nightGame,
      neutralLocation: venueData.neutralLocation,
      startTime: venueData.startTime,
      players: players,
    },
    code,
    name,
    tidyName,
    
  };
  return team;
}

export function parseVenue(venue: StatcrewVenue.IVenue) {
  const venueMeta: StatcrewVenue.IMetaVenueStats = venue.$;
  const neutralLocation: boolean = venueMeta.neutralgame === "Y";
  const nightGame: boolean = venueMeta.nitegame === "Y";
  const gameType: string[] = venueMeta.gametype.split(",");
  return {
    geoLocation: venueMeta.location,
    neutralLocation,
    nightGame,
    gameType,
    attendance: venueMeta.attend,
    startTime: moment(venueMeta.start, "hh:mm A").toDate(),    
  };
}

export function parseTeams(teams: StatcrewTeam.ITeam[]) {
  const teamInfo: AthlyteGame.IGameTeam = {} as AthlyteGame.IGameTeam;
  for (const team of teams) {
    const info: AthlyteGame.ITeamHeader = {
      id: team.$.id,
      name: team.$.name,
      code: team.$.code,
      conf: team.$.conf,
      confDivision: team.$.confdivision,
      score: team.linescore[0].$.score,
    };
    if (team.$.vh === "H") {
      teamInfo.home = info;
    } else if (team.$.vh === "V") {
      teamInfo.visitor = info;
    } else {
      throw new TypeError("Could not recognize visitor/ home status");
    }
  }
  return teamInfo;
}

/**
 * parse the team meta information, such as name, team code
 * @param team team information from statcrew JSON
 */
export function parseMeta(team: StatcrewTeam.ITeam) {
  const metaInfo: StatcrewTeam.IMetaTeamStats = team.$;
  // const record = team.$.record.split("-");
  if (!metaInfo.code) {
    throw (Error("Missing team code"));
  }
  return {
    code: metaInfo.code,
    conference: metaInfo.conf,
    conferenceDivision: metaInfo.confdivision,
    tidyName: metaInfo.id,
    name: metaInfo.name,
  };
}

/**
 * parse whether the team was home or visitor
 * @param side visitor or home
 */
function parseSide(side: StatcrewTeam.VH): VH {
  if (side === "H") {
    return VH.home;
  } else if (side === "V") {
    return VH.visitor;
  } else {
    throw new Error("Statcrew team value was not V or H");
  }
}

/**
 * parse the line score information about a team
 * @param team team information from statcrew JSON
 */
function parseLineScore(team: StatcrewTeam.ITeam): AthlyteTeam.ITeamLineScore {
  const linescoreInfo: StatcrewTeam.ILinescore = team.linescore[0];
  const parsedPeriods: AthlyteTeam.ITeamPeriodScore[] = [];

  for (const period of linescoreInfo.lineprd) {
    parsedPeriods.push({ period: period.$.prd, score: period.$.score });
  }

  return {
    score: linescoreInfo.$.score,
    periods: parsedPeriods,
  };

}

/**
 * parse the teams total stats from the game
 * @param team team information from statcrew JSON
 */
export function parseTotals(team: StatcrewTeam.ITeam): AthlyteTeam.ITeamTotals {
  const totalsInfo: StatcrewTeam.ITotals = team.totals[0];
  const firstdowns = totalsInfo.firstdowns[0].$;
  const penalties = totalsInfo.penalties[0].$;
  const conversions = totalsInfo.conversions[0].$;
  const misc = totalsInfo.misc[0].$;
  const redzone = totalsInfo.redzone[0].$;
  const rush = totalsInfo.rush[0].$;
  const pass = totalsInfo.pass[0].$;
  const receiving = totalsInfo.rcv[0].$;
  const fumbles = totalsInfo.fumbles ? totalsInfo.fumbles[0].$ : {
    lost: 0,
    no: 0,
  };
  const punt = totalsInfo.punt ? totalsInfo.punt[0].$ : {
    no: 0,
    yds: 0,
    long: 0,
    blkd: 0,
    tb: 0,
    fc: 0,
    plus50: 0,
    inside20: 0,
  };
  const kickoff = totalsInfo.ko ? totalsInfo.ko[0].$ : {
    no: 0,
    yds: 0,
    ob: 0,
    tb: 0,
  };
  const fieldgoal = totalsInfo.fg ? totalsInfo.fg[0].$ : {
    made: 0,
    att: 0,
    long: 0,
    blkd: 0,
  };
  const pat = totalsInfo.pat ? {
    kickatt: totalsInfo.pat[0].$.kickatt || 0,
    kickmade: totalsInfo.pat[0].$.kickmade || 0,
    passatt: totalsInfo.pat[0].$.passatt || 0,
    passmade: totalsInfo.pat[0].$.passmade || 0,
    rushatt: totalsInfo.pat[0].$.rushatt || 0,
    rushmade: totalsInfo.pat[0].$.rushmade || 0,
  } : {
      kickatt: 0,
      kickmade: 0,
      passatt: 0,
      passmade: 0,
      rushatt: 0,
      rushmade: 0,
    };
  const defense = totalsInfo.defense[0].$;
  const kickReceiving = totalsInfo.kr ? totalsInfo.kr[0].$ : {
    no: 0,
    yds: 0,
    td: 0,
    long: 0,
  };
  const puntReceiving = totalsInfo.pr ? totalsInfo.pr[0].$ : {
    no: 0,
    yds: 0,
    td: 0,
    long: 0,
  };
  const interceptionReceiving = totalsInfo.ir ? totalsInfo.ir[0].$ : {
    no: 0,
    yds: 0,
    td: 0,
    long: 0,
  };
  const scoring = totalsInfo.scoring ? {
    td: totalsInfo.scoring[0].$.td || 0,
    fg: totalsInfo.scoring[0].$.fg || 0,
    patKick: totalsInfo.scoring[0].$.patkick || 0,
  } : {
      td: 0,
      fg: 0,
      patKick: 0,
    };

  return {
    firstdowns: {
      fdTotal: firstdowns.no,
      fdRush: firstdowns.rush,
      fdPass: firstdowns.pass,
      fdPenalty: firstdowns.penalty,
    },
    penalties: {
      penTotal: penalties.no,
      penYards: penalties.yds,
    },
    conversions: {
      convThird: conversions.thirdconv,
      convThirdAtt: conversions.thirdatt,
      convFourth: conversions.fourthconv,
      convFourthAtt: conversions.fourthatt,
    },
    fumbles: {
      fumbTotal: fumbles.no,
      fumbLost: fumbles.lost,
    },
    misc: {
      yards: misc.yds,
      top: misc.top,
      ona: misc.ona,
      onm: misc.onm,
      ptsto: misc.ptsto,
    },
    redzone: {
      redAtt: redzone.att,
      redScores: redzone.scores,
      redPoints: redzone.points,
      redTdRush: redzone.tdrush,
      redTdPass: redzone.tdpass,
      redFgMade: redzone.fgmade,
      redEndFga: redzone.endfga,
      redEndDown: redzone.enddowns,
      redEndInt: redzone.endint,
      redEndFumb: redzone.endfumb,
      redEndHalf: redzone.endhalf,
      redEndGame: redzone.endgame,
    },
    rushing: {
      rushAtt: rush.att,
      rushYards: rush.yds,
      rushGain: rush.gain,
      rushLoss: rush.loss,
      rushTd: rush.td,
      rushLong: rush.long,
    },
    pass: {
      passComp: pass.comp,
      passAtt: pass.att,
      passInt: pass.int,
      passYards: pass.yds,
      passTd: pass.td,
      passLong: pass.long,
      passSacks: pass.sacks,
      passSackYards: pass.sackyds,
    },
    receiving: {
      rcvNum: receiving.no,
      rcvYards: receiving.yds,
      rcvTd: receiving.td,
      rcvLong: receiving.long,
    },
    punt: {
      puntNum: punt.no,
      puntYards: punt.yds,
      puntLong: punt.long,
      puntBlocked: punt.blkd,
      puntTb: punt.tb,
      puntFc: punt.fc,
      puntPlus50: punt.plus50,
      puntInside20: punt.inside20,
    },
    kickoff: {
      koNum: kickoff.no,
      koYards: kickoff.yds,
      koOb: kickoff.ob,
      koTb: kickoff.tb,
    },
    fieldgoal: {
      fgMade: fieldgoal.made,
      fgAtt: fieldgoal.att,
      fgLong: fieldgoal.long,
      fgBlocked: fieldgoal.blkd,
    },
    pointAfter: {
      kickatt: pat.kickatt,
      kickmade: pat.kickmade,
      passatt: pat.passatt,
      passmade: pat.passmade,
      rushatt: pat.rushatt,
      rushmade: pat.rushmade,
    },
    defense: {
      dTackUa: defense.tackua,
      dTackA: defense.tacka,
      dTackTot: defense.tot_tack || defense.tacka + defense.tackua,
      dTflua: defense.tflua || 0,
      dTfla: defense.tfla || 0,
      dTflyds: defense.tflyds || 0,
      dSackUa: defense.sackua || 0,
      dSackA: defense.sacka || 0,
      dSacks: defense.sacks || (defense.sackua || 0) + (defense.sacka || 0),
      dSackYards: defense.sackyds || 0,
      dBrup: defense.brup || 0,
      dFf: defense.ff || 0,
      dFr: defense.fr || 0,
      dFryds: defense.fryds || 0,
      dInt: defense.int || 0,
      dIntYards: defense.intyds || 0,
      dQbh: defense.qbh || 0,
      dblkd: defense.blkd || 0,
    },
    kickReceiving: {
      krNo: kickReceiving.no,
      krYards: kickReceiving.yds,
      krTd: kickReceiving.td,
      krLong: kickReceiving.long,
    },
    puntReturn: {
      prNo: puntReceiving.no,
      prYards: puntReceiving.yds,
      prTd: puntReceiving.td,
      prLong: puntReceiving.long,
    },
    intReturn: {
      irNo: interceptionReceiving.no,
      irYards: interceptionReceiving.yds,
      irTd: interceptionReceiving.td,
      irLong: interceptionReceiving.long,
    },
    scoring,
  };
}

/**
 * parse the team's per quarter stats
 * @param quarter quarter information from statcrew JSON
 * @param quarterNum quarter number
 */
export function parseQuarterSummary(
  quarter: StatcrewTeam.IQuarterSummary,
  quarterNum: number,
): AthlyteTeam.IQuarterTotals {
  const firstdowns = quarter.firstdowns ?
    quarter.firstdowns[0].$ : {
      no: 0,
      rush: 0,
      pass: 0,
      penalty: 0,
    };
  const penalties = quarter.penalties ?
    quarter.penalties[0].$ : {
      no: 0,
      yds: 0,
    };
  const conversions = quarter.conversions ?
    quarter.conversions[0].$ : /* istanbul ignore next */ {
      thirdconv: 0,
      thirdatt: 0,
      fourthconv: 0,
      fourthatt: 0,
    };
  const fumbles = quarter.fumbles ?
    quarter.fumbles[0].$ : {
      no: 0,
      lost: 0,
    };
  const misc = quarter.misc ?
    quarter.misc[0].$ : {
      yds: 0,
      top: "",
      ona: 0,
      onm: 0,
      ptsto: 0,
    };
  const redzone = quarter.redzone ?
    quarter.redzone[0].$ : {
      att: 0,
      scores: 0,
      points: 0,
      tdrush: 0,
      tdpass: 0,
      fgmade: 0,
      endfga: 0,
      enddowns: 0,
      endint: 0,
      endfumb: 0,
      endhalf: 0,
      endgame: 0,
    };
  const rush = quarter.rush ?
    quarter.rush[0].$ : {
      att: 0,
      yds: 0,
      gain: 0,
      loss: 0,
      td: 0,
      long: 0,
    };
  const pass = quarter.pass ?
    quarter.pass[0].$ : {
      comp: 0,
      att: 0,
      int: 0,
      yds: 0,
      td: 0,
      long: 0,
      sacks: 0,
      sackyds: 0,
    };
  const receiving = quarter.rcv ?
    quarter.rcv[0].$ : {
      no: 0,
      yds: 0,
      td: 0,
      long: 0,
    };
  const punt = quarter.punt ?
    quarter.punt[0].$ : {
      no: 0,
      yds: 0,
      long: 0,
      blkd: 0,
      tb: 0,
      fc: 0,
      plus50: 0,
      inside20: 0,
    };
  const kickoff = quarter.ko ?
    quarter.ko[0].$ : {
      no: 0,
      yds: 0,
      ob: 0,
      tb: 0,
    };
  const fieldgoal = quarter.fg ?
    quarter.fg[0].$ : {
      made: 0,
      att: 0,
      long: 0,
      blkd: 0,
    };
  const pat = quarter.pat ?
    quarter.pat[0].$ : {
      kickatt: 0,
      kickmade: 0,
      passatt: 0,
      passmade: 0,
      rushatt: 0,
      rushmade: 0,
    };
  const defense = quarter.defense ? quarter.defense[0].$ : {
    tacka: 0,
    tackua: 0,
  };
  const kickReceiving = quarter.kr ?
    quarter.kr[0].$ : {
      no: 0,
      yds: 0,
      td: 0,
      long: 0,
    };
  const puntReceiving = quarter.pr ?
    quarter.pr[0].$ : {
      no: 0,
      yds: 0,
      td: 0,
      long: 0,
    };
  const interceptionReceiving = quarter.ir ?
    quarter.ir[0].$ : {
      no: 0,
      yds: 0,
      td: 0,
      long: 0,
    };
  const scoring = quarter.scoring ? {
    td: quarter.scoring[0].$.td || 0,
    fg: quarter.scoring[0].$.fg || 0,
    patKick: quarter.scoring[0].$.patkick || 0,
  } : {
      td: 0,
      fg: 0,
      patKick: 0,
    };
  return {
    qtrNum: quarterNum,
    firstdowns: {
      fdTotal: firstdowns.no,
      fdRush: firstdowns.rush,
      fdPass: firstdowns.pass,
      fdPenalty: firstdowns.penalty,
    },
    penalties: {
      penTotal: penalties.no,
      penYards: penalties.yds,
    },
    conversions: {
      convThird: conversions.thirdconv,
      convThirdAtt: conversions.thirdatt,
      convFourth: conversions.fourthconv,
      convFourthAtt: conversions.fourthatt,
    },
    fumbles: {
      fumbTotal: fumbles.no,
      fumbLost: fumbles.lost,
    },
    misc: {
      yards: misc.yds,
      top: misc.top,
      ona: misc.ona,
      onm: misc.onm,
      ptsto: misc.ptsto,
    },
    redzone: {
      redAtt: redzone.att,
      redScores: redzone.scores,
      redPoints: redzone.points,
      redTdRush: redzone.tdrush,
      redTdPass: redzone.tdpass,
      redFgMade: redzone.fgmade,
      redEndFga: redzone.endfga,
      redEndDown: redzone.enddowns,
      redEndInt: redzone.endint,
      redEndFumb: redzone.endfumb,
      redEndHalf: redzone.endhalf,
      redEndGame: redzone.endgame,
    },
    rushing: {
      rushAtt: rush.att,
      rushYards: rush.yds,
      rushGain: rush.gain,
      rushLoss: rush.loss,
      rushTd: rush.td,
      rushLong: rush.long,
    },
    pass: {
      passComp: pass.comp,
      passAtt: pass.att,
      passInt: pass.int,
      passYards: pass.yds,
      passTd: pass.td,
      passLong: pass.long,
      passSacks: pass.sacks,
      passSackYards: pass.sackyds,
    },
    receiving: {
      rcvNum: receiving.no,
      rcvYards: receiving.yds,
      rcvTd: receiving.td,
      rcvLong: receiving.long,
    },
    punt: {
      puntNum: punt.no,
      puntYards: punt.yds,
      puntLong: punt.long,
      puntBlocked: punt.blkd,
      puntTb: punt.tb,
      puntFc: punt.fc,
      puntPlus50: punt.plus50,
      puntInside20: punt.inside20,
    },
    kickoff: {
      koNum: kickoff.no,
      koYards: kickoff.yds,
      koOb: kickoff.ob,
      koTb: kickoff.tb,
    },
    fieldgoal: {
      fgMade: fieldgoal.made,
      fgAtt: fieldgoal.att,
      fgLong: fieldgoal.long,
      fgBlocked: fieldgoal.blkd,
    },
    pointAfter: {
      kickatt: pat.kickatt || 0,
      kickmade: pat.kickmade || 0,
      passatt: pat.passatt || 0,
      passmade: pat.passmade || 0,
      rushatt: pat.rushatt || 0,
      rushmade: pat.rushmade || 0,
    },
    defense: {
      dTackUa: defense.tackua,
      dTackA: defense.tacka,
      dTackTot: defense.tot_tack || defense.tacka + defense.tackua,
      dTflua: defense.tflua || 0,
      dTfla: defense.tfla || 0,
      dTflyds: defense.tflyds || 0,
      dSacks: defense.sacks || 0,
      dSackUa: defense.sackua || 0,
      dSackA: defense.sacka || 0,
      dSackYards: defense.sackyds || 0,
      dBrup: defense.brup || 0,
      dFf: defense.ff || 0,
      dFr: defense.fr || 0,
      dFryds: defense.fryds || 0,
      dInt: defense.int || 0,
      dIntYards: defense.intyds || 0,
      dQbh: defense.qbh || 0,
      dblkd: defense.blkd || 0,
    },
    kickReceiving: {
      krNo: kickReceiving.no,
      krYards: kickReceiving.yds,
      krTd: kickReceiving.td,
      krLong: kickReceiving.long,
    },
    puntReturn: {
      prNo: puntReceiving.no,
      prYards: puntReceiving.yds,
      prTd: puntReceiving.td,
      prLong: puntReceiving.long,
    },
    intReturn: {
      irNo: interceptionReceiving.no,
      irYards: interceptionReceiving.yds,
      irTd: interceptionReceiving.td,
      irLong: interceptionReceiving.long,
    },
    scoring,
  };
}

/**
 * parse the team's stats for all quarters
 * @param side home or visitor
 * @param quarters information about each quarter from statcrew JSON
 */
export function parseQuarterSummaries(side: VH, quarters: StatcrewPlay.IQuarter[]) {
  if (quarters == null || quarters[0].qtrsummary == null) {
    return undefined;
  }
  return quarters
    .map((quarter) => {
      const vh = side === VH.home ? "H" : "V";

      if (!( "$" in quarter.qtrsummary[0])) {
        return vh === "H"? quarter.qtrsummary[0] : quarter.qtrsummary[1];
      }
      return quarter.qtrsummary[0].$.vh === vh ? quarter.qtrsummary[0] : quarter.qtrsummary[1];
    })
    .map((quarter, quarterNum) => parseQuarterSummary(quarter, quarterNum));
}
