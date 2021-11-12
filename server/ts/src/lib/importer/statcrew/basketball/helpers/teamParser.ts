import * as moment from "moment";
import { winstonLogger } from "../../../../winstonLogger";

import { VH } from "../../../AthlyteImporter";

import * as Athlyte from "../../../../../../../../typings/athlyte/basketball";
import * as CommonStats from "../../../../../../../../typings/athlyte/basketball/common-stats.d";
import * as AthlyteTeam from "../../../../../../../../typings/athlyte/basketball/team.d";
import { IStatcrewBasketballJSON } from "../../../../../../../../typings/statcrew/basketball";
import * as StatcrewPlay from "../../../../../../../../typings/statcrew/basketball/play.d";
import * as StatcrewTeam from "../../../../../../../../typings/statcrew/basketball/team.d";
import * as AthlyteGame from "../../../../../../../../typings/athlyte/basketball/game.d";
import * as StatcrewVenue from "../../../../../../../../typings/statcrew/basketball/venue.d";

/**
 * Get information about a team from the statcrew JSON
 * @param inputTeam team information from the statcrew JSON
 * @param quarters the quarter information from the statcrew JSON
 * @param gameDate the date of the game
 * @param actualDate the actual date of the game as a string (actual string from XML) 
 */
export function parseTeam(
  inputTeam: StatcrewTeam.ITeam, opponent: StatcrewTeam.ITeam, gameDate: Date, actualDate: string, sportCode: "MBB" | "WBB",
  inputVenueData: StatcrewVenue.IVenue): AthlyteTeam.ITeam {
  const { code, name, tidyName } = parseMeta(inputTeam);
  const opponentCode = parseMeta(opponent).code;
  const opponentName = parseMeta(opponent).name;
  const linescore = parseLineScore(inputTeam);
  const record = parseRecords(inputTeam);
  const side = parseSide(inputTeam.$.vh);
  const totals = parseTotals(inputTeam);
  const players: string[] = [];
  const opponentConference = parseMeta(opponent).conf;
  const opponentConferenceDivision = parseMeta(opponent).confDivision;
  const conference = parseMeta(inputTeam).conf;
  const conferenceDivision = parseMeta(inputTeam).confDivision;
  const teamInfo = parseTeamInfo([inputTeam, opponent]);
  const venueData = parseVenue(inputVenueData);
  const metaData = parseStartTime(inputVenueData)
  const team: AthlyteTeam.ITeam = {
    games: {
      homeAway: side,
      opponentCode,
      opponentName,
      opponentConference,
      opponentConferenceDivision,
      conference,
      conferenceDivision,
      linescore,
      sportCode: sportCode,
      record,
      gameDate,
      actualDate,
      totals,
      season: moment(gameDate).subtract(4, "months").year(),
      homeTeam: teamInfo.home,
      visitorTeam: teamInfo.visitor,
      gameType: venueData.gameType,
      geoLocation: venueData.geoLocation,
      attendance: venueData.attendance,
      nightGame: venueData.nightGame,
      neutralLocation: venueData.neutralLocation,
      startTime: metaData.startTime,
      players: players,
    },
    code,
    name,
    tidyName,
  };
  return team;
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
    code: Number(metaInfo.code),
    tidyName: metaInfo.id,
    name: metaInfo.name,
    conf: metaInfo.conf,
    confDivision: metaInfo.confdivision
  };
}

/**
   * Get an overview of the teams in a game; limited to their short name (i.e. "UA)
   * and normal name (i.e. "University of Alabama")
   * @param teams Statcrew information about the two teams playing in the game
   */
export function parseTeamInfo(teams: StatcrewTeam.ITeam[]): AthlyteGame.IGameTeam {
  const teamInfo: AthlyteGame.IGameTeam = {} as AthlyteGame.IGameTeam;
  for (const team of teams) {
    const info: AthlyteGame.ITeamHeader = {
      id: team.$.id,
      name: team.$.name,
      code: team.$.code,
      score: team.linescore[0].$.score,
      record: team.$.record ? team.$.record.split("-") : [""],
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

export function parseVenue(venue: StatcrewVenue.IVenue): AthlyteGame.IGameVenue {
  const venueMeta: StatcrewVenue.IMetaVenueStats = venue.$;
  const neutralLocation: boolean = venueMeta.neutralgame === "Y";
  const nightGame: boolean = false; /* This information is missing in the xml */
  const conferenceGame: boolean = venueMeta.leaguegame === "Y";
  const postseasonGame: boolean = venueMeta.postseason === "Y";
  const stadium: string = typeof venueMeta.location != "number" ? venueMeta.location.split("-")[0] : "";
  const gameType: string[] = venueMeta.gametype !== undefined ? venueMeta.gametype.split(",") : []
  return {
    geoLocation: venueMeta.location,
    stadiumName: stadium,
    neutralLocation,
    nightGame,
    conferenceGame,
    postseasonGame,
    attendance: venueMeta.attend,
    gameType: gameType,
  };
}

export function parseStartTime(venue: StatcrewVenue.IVenue): AthlyteGame.IGameMeta {
  const venueMeta: StatcrewVenue.IMetaVenueStats = venue.$;
  const officials: StatcrewVenue.IVenueOfficials = venue.officials[0].$;
  const venueRules: StatcrewVenue.IVenueRules = venue.rules[0].$;
  const parsedOfficials: AthlyteGame.IOfficialInfo[] = [];
  let venueStartTime: any;
  if (venueMeta.start === undefined || venueMeta.start === null || (venueMeta.start.length === undefined)) {
    venueStartTime = moment(venueMeta.time, "hh:mm A").toDate()
  } else {
    venueStartTime = moment(venueMeta.start, "hh:mm A").toDate()
  }
  return {
    startTime: venueStartTime, //moment(venueMeta.start, "hh:mm A").toDate(),
    endTime: moment(venueMeta.end, "hh:mm A").toDate(),
    officials: parsedOfficials,
    rules: {
      minutes: venueRules.minutes,
      prds: venueRules.prds,
      minutesot: venueRules.minutesot,
      fouls: venueRules.fouls,
      qh: venueRules.qh,
    },
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
 * parse the team totals information, such as name, hitting, pitch summary
 * @param team team information from statcrew JSON
 */
export function parseTotals(team: StatcrewTeam.ITeam) {

  const stats: CommonStats.ICommonStats = {
    fgm: Number(team.totals[0].stats[0].$.fgm),
    fga: Number(team.totals[0].stats[0].$.fga),
    fgm3: Number(team.totals[0].stats[0].$.fgm3),
    fga3: Number(team.totals[0].stats[0].$.fga3),
    ftm: Number(team.totals[0].stats[0].$.ftm),
    fta: Number(team.totals[0].stats[0].$.fta),
    tp: Number(team.totals[0].stats[0].$.tp),
    blk: Number(team.totals[0].stats[0].$.blk),
    stl: Number(team.totals[0].stats[0].$.stl),
    ast: Number(team.totals[0].stats[0].$.ast),
    min: Number(team.totals[0].stats[0].$.min),
    oreb: Number(team.totals[0].stats[0].$.oreb),
    dreb: Number(team.totals[0].stats[0].$.dreb),
    treb: Number(team.totals[0].stats[0].$.treb),
    pf: Number(team.totals[0].stats[0].$.pf),
    tf: Number(team.totals[0].stats[0].$.tf),
    to: Number(team.totals[0].stats[0].$.to),
    deadball: parseDeadball(team.totals[0].stats[0].$.deadball),
    deadballByPeriod: team.totals[0].stats[0].$.deadball != undefined && typeof team.totals[0].stats[0].$.deadball != "number" ? team.totals[0].stats[0].$.deadball.split(",").map(Number) : [0],
    fgpct: Number(team.totals[0].stats[0].$.fgpct),
    fg3pct: Number(team.totals[0].stats[0].$.fg3pct),
    ftpct: team.totals[0].stats[0].$.ftpct,

  };

  let special: AthlyteTeam.ITotalSpecial | undefined;
  if (team.totals[0].special !== undefined && team.totals[0].special[0]) {
    special = {
      vh: parseSide(team.totals[0].special[0].$.vh),
      ptsTo: team.totals[0].special[0].$.pts_to,
      ptsCh2: team.totals[0].special[0].$.pts_ch2,
      ptsPaint: team.totals[0].special[0].$.pts_paint,
      ptsFastb: team.totals[0].special[0].$.pts_fastb,
      ptsBench: team.totals[0].special[0].$.pts_bench,
      ties: team.totals[0].special[0].$.ties,
      tiedTime: team.totals[0].special[0].$.tied_time,
      leads: team.totals[0].special[0].$.leads,
      leadTime: team.totals[0].special[0].$.lead_time,
      possCount: team.totals[0].special[0].$.poss_count,
      possTime: team.totals[0].special[0].$.poss_time,
      scoreCount: team.totals[0].special[0].$.score_count,
      scoreTime: team.totals[0].special[0].$.score_time,
      largeLead: team.totals[0].special[0].$.large_lead,
      largeLeadT: team.totals[0].special[0].$.large_lead_t,
    };
  }

  let statsbyprd1: CommonStats.ICommonStats | undefined;
  let statsbyprd2: CommonStats.ICommonStats | undefined;
  if (team.totals[0].statsbyprd !== undefined && team.totals[0].statsbyprd[0]) {
    statsbyprd1 = {
      prd: 1,
      fgm: Number(team.totals[0].statsbyprd[0].$.fgm),
      fga: Number(team.totals[0].statsbyprd[0].$.fga),
      fgm3: Number(team.totals[0].statsbyprd[0].$.fgm3),
      fga3: Number(team.totals[0].statsbyprd[0].$.fga3),
      ftm: Number(team.totals[0].statsbyprd[0].$.ftm),
      fta: Number(team.totals[0].statsbyprd[0].$.fta),
      tp: Number(team.totals[0].statsbyprd[0].$.tp),
      blk: Number(team.totals[0].statsbyprd[0].$.blk),
      stl: Number(team.totals[0].statsbyprd[0].$.stl),
      ast: Number(team.totals[0].statsbyprd[0].$.ast),
      min: Number(team.totals[0].statsbyprd[0].$.min),
      oreb: Number(team.totals[0].statsbyprd[0].$.oreb),
      dreb: Number(team.totals[0].statsbyprd[0].$.dreb),
      treb: Number(team.totals[0].statsbyprd[0].$.treb),
      pf: Number(team.totals[0].statsbyprd[0].$.pf),
      tf: Number(team.totals[0].statsbyprd[0].$.tf),
      to: Number(team.totals[0].statsbyprd[0].$.to),
      fgpct: Number(team.totals[0].statsbyprd[0].$.fgpct),
      fg3pct: Number(team.totals[0].statsbyprd[0].$.fg3pct),
      ftpct: team.totals[0].statsbyprd[0].$.ftpct,
      foul: team.totals[0].statsbyprd[0].$.foul,
    };
  }

  if (team.totals[0].statsbyprd !== undefined && team.totals[0].statsbyprd[1]) {
    statsbyprd2 = {
      prd: 2,
      fgm: Number(team.totals[0].statsbyprd[1].$.fgm),
      fga: Number(team.totals[0].statsbyprd[1].$.fga),
      fgm3: Number(team.totals[0].statsbyprd[1].$.fgm3),
      fga3: Number(team.totals[0].statsbyprd[1].$.fga3),
      ftm: Number(team.totals[0].statsbyprd[1].$.ftm),
      fta: Number(team.totals[0].statsbyprd[1].$.fta),
      tp: Number(team.totals[0].statsbyprd[1].$.tp),
      blk: Number(team.totals[0].statsbyprd[1].$.blk),
      stl: Number(team.totals[0].statsbyprd[1].$.stl),
      ast: Number(team.totals[0].statsbyprd[1].$.ast),
      min: Number(team.totals[0].statsbyprd[1].$.min),
      oreb: Number(team.totals[0].statsbyprd[1].$.oreb),
      dreb: Number(team.totals[0].statsbyprd[1].$.dreb),
      treb: Number(team.totals[0].statsbyprd[1].$.treb),
      pf: Number(team.totals[0].statsbyprd[1].$.pf),
      tf: Number(team.totals[0].statsbyprd[1].$.tf),
      to: Number(team.totals[0].statsbyprd[1].$.to),
      fgpct: Number(team.totals[0].statsbyprd[1].$.fgpct),
      fg3pct: Number(team.totals[0].statsbyprd[1].$.fg3pct),
      ftpct: team.totals[0].statsbyprd[1].$.ftpct,
      foul: team.totals[0].statsbyprd[1].$.foul,
    };
  }

  const totals: AthlyteTeam.ITeamTotals = {
    stats: stats,
    special: special,
  }
  if (statsbyprd1 !== undefined && statsbyprd2 !== undefined) {
    totals.prdStats = [statsbyprd1, statsbyprd2]
  } else if (statsbyprd1 !== undefined) {
    totals.prdStats = [statsbyprd1]
  } else if (statsbyprd2 !== undefined) {
    totals.prdStats = [statsbyprd2]
  } else {
    totals.prdStats = undefined
  }

  return totals;

}



/**
 * parse the deadball score to a single value
 * @param deadball string from the xml
 */
function parseDeadball(deadball: string): number {

  if (deadball == undefined || typeof deadball === "number")
    return 0;

  const deadballByPeriod: string[] = deadball.split(",");
  let deadballScore: number = 0;
  for (const deadballValue of deadballByPeriod) {
    deadballScore = deadballScore + Number(deadballValue);
  }
  return deadballScore;
}

/**
 * parse the line score information about a team
 * @param team team information from statcrew JSON
 */
function parseLineScore(team: StatcrewTeam.ITeam): AthlyteTeam.ITeamLineScore {
  const linescoreInfo: StatcrewTeam.ILinescore = team.linescore[0];
  const parsedPeriods: AthlyteTeam.ITeamPeriodScore[] = [];
  let totalOvertime: number = 0;

  for (const period of linescoreInfo.lineprd) {
    parsedPeriods.push({ period: period.$.prd, overtime: period.$.prd > 2 ? true : false, score: period.$.score });
    if (period.$.prd > 2) {
      ++totalOvertime;
    }
  }

  return {
    score: linescoreInfo.$.score,
    periods: parsedPeriods,
    totalOvertimePeriods: totalOvertime,
  };

}


/**
 * parse the teams total stats from the game
 * @param team team information from statcrew JSON
 */
export function parseRecords(team: StatcrewTeam.ITeam): string[] {
  if (team.$.record) {
    return team.$.record.split("-");
  }
  return [""]
}


