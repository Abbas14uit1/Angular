import * as moment from "moment";
import * as mongo from "mongodb";

import { winstonLogger } from "../../../winstonLogger";
import * as Athlyte from "../../../../../../../typings/athlyte/basketball";
import * as AthlyteGame from "../../../../../../../typings/athlyte/basketball/game.d";
import * as StatcrewPeriodSummary from "../../../../../../../typings/statcrew/basketball/periodSummary.d";
import * as StatcrewTeam from "../../../../../../../typings/statcrew/basketball/team.d";
import * as StatcrewVenue from "../../../../../../../typings/statcrew/basketball/venue.d";
import * as StatcrewPeriod from "../../../../../../../typings/statcrew/basketball/periodSummary.d"
import { calculateDistance } from "../../../calculateDistance";
import { VH } from "../../../importer/AthlyteImporter";
import { BasketballStatcrewImportBase } from "../BasketballStatcrewImportBase";
import { Play } from "./play";
import { Player } from "./player";
import { Team } from "./team";
import { TeamGame } from "./teamGames";

// interfaces
/**
 * GameClass manages the entire lifecycle of games,
 * from parsing the game data (from the output of xml2js)
 * to saving to Mongo.
 */
export class Game extends BasketballStatcrewImportBase {
  public parsedData: Athlyte.IGame;
  /**
   * Plays, teams, and players all need to know the ID of a game before they are saved to Mongo
   */
  public dependents: Array<Play | Team | Player | TeamGame>;
  private alreadyExists: boolean;
  private initialized: boolean;

  constructor() {
    super();
    this.dependents = [];
    this.alreadyExists = false;
    this.initialized = false;
    this.parsedData = {
      _id: undefined,
      playerIds: [],
      playIds: [],
      teamIds: {},
    } as any;
  }

  /**
   * Generate an ID for this game. Checks database before generating a new one
   * to set `this.alreadyExists`, which indicates that a game should be deleted
   * before resaving an updated version to Mongo.
   * @param db Mongo DB
   */
  public async generateId(db: mongo.Db, sportCode: "MBB" | "WBB"): Promise<string> {
    const game = await db.collection("games")
      .findOne({
        sportCode: sportCode, "team.home.code": this.parsedData.team.home.code,
        "team.visitor.code": this.parsedData.team.visitor.code, actualDate: this.parsedData.actualDate
      }, { fields: { _id: 1 } });
    let id: string;
    if (game) {
      id = game._id;
      this.alreadyExists = true;
      this.initialized = true;
    } else {
      id = new mongo.ObjectID().toHexString();
      this.alreadyExists = false;
      this.initialized = true;
    }
    return id;
  }

  /**
   * Check flag to see whether this game already exists in DB; throws error
   * if `this.alreadyExists` flag is undefined because `this.generateId()` has not
   * been called yet.
   */
  public getAlreadyExists(): boolean {
    if (this.initialized == false) {
      throw new Error("Trying to check existance before checking the DB for the ID");
    } else {
      return this.alreadyExists;
    }
  }

  /**
   * Prepare "dynamic" data for saving to Mongo; all data for a game
   * is considered to be dynamic since no game shares information with other games.
   * By comparison, some data about players (such as name) is constant between games.
   */
  public prepareDynamicData(): AthlyteGame.IGame {
    if (this.parsedData._id === undefined) {
      throw new Error("Trying to save game data before ID field has been populated");
    } else if (!this.parsedData.teamIds.home || !this.parsedData.teamIds.visitor) {
      throw new Error("Trying to save game data before team IDs have been populated");
    } else if (this.parsedData.playerIds.length === 0) {
      throw new Error("Trying to save game data before player IDs have been populated");
    } else if (this.parsedData.playIds.length === 0) {
      throw new Error("Trying to save game data before play IDs have been populated");
    } else {
      return this.parsedData;
    }
  }

  /* istanbul ignore next */
  /**
   * Preparing static data is a noop for game, since everything is dynamic
   */
  public prepareStaticData(): void {
    return;
  }

  /**
   * Add an ID of a team to this game to be either the home or visitor team
   * @param teamStatus Flag stating whether the team (teamId = newId) was home or visitor for the game
   * @param newId ID of the team which is being added to this team
   */
  public updateTeamRef(teamStatus: VH, newId: string) {
    // add team IDs to their drives


    // add team IDs to the game
    if (teamStatus === VH.home) {
      this.parsedData.teamIds.home = newId;
    } else if (teamStatus === VH.visitor) {
      this.parsedData.teamIds.visitor = newId;
    } else {
      throw new Error("Updating unexpected team");
    }
  }

  /**
   * Add a play ID to this Game instance
   * @param newId ID of the play to associate with this game
   */
  public updatePlayRef(newId: string) {
    //Every play is different so adding the play is good enough.
    this.parsedData.playIds.push(newId);
  }

  /**
   * Add a player ID to this Game instance
   * Players are added regardless of whether they played or not.
   * @param newId ID of the player to associate with this game
   */
  public updatePlayerRef(newId: string) {
    this.parsedData.playerIds.push(newId);
  }

  /**
   * Update dependents of this Game instance,
   * where dependents are instances of Mongo<Team|Player|Player>
   * which require the ID of this game before saving.
   */
  public updateDependents() {
    for (const dependent of this.dependents) {
      if (dependent instanceof Team ||
        dependent instanceof Player ||
        dependent instanceof Play ||
        dependent instanceof TeamGame) {
        dependent.updateGameRef(this.getId());
      } else {
        throw new Error("Game dependents must be team, player, play, or teamGame.");
      }
    }
  }

  /**
   * Get metadata about the game, such as the start/ end times and officiating crew.
   * @param venue Statcrew information about the venue, including information such
   * as date and location
   */
  public parseMeta(venue: StatcrewVenue.IVenue): AthlyteGame.IGameMeta {
    const venueMeta: StatcrewVenue.IMetaVenueStats = venue.$;
    const officials: StatcrewVenue.IVenueOfficials = venue.officials[0].$;
    const venueRules: StatcrewVenue.IVenueRules = venue.rules[0].$;
    const parsedOfficials: AthlyteGame.IOfficialInfo[] = [];
    // go from officials object to array of officials
    if (officials && officials.text.length > 0)
      for (const official in officials.text.split(",")) {

        parsedOfficials.push({
          pos: "", //In basketball the officials are just a comma sepereated names
          name: official,
        });
      }
    let venueStartTime: any;
    if (venueMeta.start === undefined || (venueMeta.start.length === undefined)) {
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
   * Get venue information, such as location and weather
   * @param venue Statcrew information about the venue
   */
  public parseVenue(venue: StatcrewVenue.IVenue): AthlyteGame.IGameVenue {
    const venueMeta: StatcrewVenue.IMetaVenueStats = venue.$;
    const neutralLocation: boolean = venueMeta.neutralgame === "Y";
    const nightGame: boolean = false; /* This information is missing in the xml */
    const conferenceGame: boolean = venueMeta.leaguegame === "Y";
    const postseasonGame: boolean = venueMeta.postseason === "Y";
    const stadium: string = typeof venueMeta.location != "number" ? venueMeta.location.split("-")[0] : "";
    const gameType: string[] = venueMeta.gametype.split(",")
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

  /**
   * Get an overview of the teams in a game; limited to their short name (i.e. "UA)
   * and normal name (i.e. "University of Alabama")
   * @param teams Statcrew information about the two teams playing in the game
   */
  public parseTeam(teams: StatcrewTeam.ITeam[]): AthlyteGame.IGameTeam {
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

  /**
   * Parse a game to extract relevant information to add to `this.parsedData`
   * @param inputVenueData Venue data from Statcrew
   * @param inputTeamData Team data from Statcrew
   * @param inputDriveData Drive data from statcrew
   * @param parsedPlays List of parsed plays in Athlyte format
   */
  public parse(
    inputVenueData: StatcrewVenue.IVenue,
    inputTeamData: StatcrewTeam.ITeam[],
    inputSummaryData: StatcrewPeriodSummary.IPeriodSummaries,
    parsedPlays: Athlyte.IPlay[],
  ): void {
    const gameDate = moment(inputVenueData.$.date, "MM-DD-YYYY");
    const actualDate = inputVenueData.$.date;
    let periodClock: string[] = [];
    // form Athlyte game object
    const gameInfo: Athlyte.IGame = {
      _id: "",
      playerIds: [],
      playIds: [],
      sportCode: inputVenueData.$.sportcode,
      teamIds: {
        home: undefined,
        visitor: undefined,
      },
      gameDate: gameDate.toDate(),
      actualDate: actualDate,
      season: gameDate.subtract(4, "months").year(), // subtract 3 months to ensure that Jan games are in season
      meta: this.parseMeta(inputVenueData),
      venue: this.parseVenue(inputVenueData),
      team: this.parseTeam(inputTeamData),
      summary: parseSummary(inputSummaryData, periodClock),
    };
    this.parsedData = gameInfo;
  }

  /**
   * Save a game to Mongo
   * @param db Mongo DB
   */
  public save(db: mongo.Db): Promise<string> {
    return db.collection("games").insert(this.prepareDynamicData())
      .then(() => this.getId());
  }
}

/**
 * Get a summary of notable plays in a game, such as scores, drive starts/ ends, field goals, etc.
 * Populates each field (scores, dcrives, fgas, etc.) with the index of that play in the overall list of plays
 * @param plays List of plays (already parsed) in a game
 * @param longThresh Threshold for minimum number of yards in a long play; defaults to 70
 */
export function parseSummary(
  inputPeriodSummaries: StatcrewPeriod.IPeriodSummaries,
  periodClock: string[],
): AthlyteGame.IGameSummary {

  let summary: AthlyteGame.IPeriodSummary[] = [];
  let special: AthlyteGame.IPeriodSpecial[] = [];
  let totalOvertime: number = 0;
  for (const byPeriodSummary of inputPeriodSummaries.byprdsummary) {
    const period = byPeriodSummary.$.prd;
    summary.push(...parsePeriodSummary(byPeriodSummary.summary, period, periodClock));
    special.push(...parsePeriodSpecial(byPeriodSummary.special, period, periodClock));
    if (period > 2) {
      ++totalOvertime;
    }
  }

  return {
    periodSpecial: special,
    periodSummary: summary,
    totalOvertimePeriods: totalOvertime,
  };
}


/**
 * Translate the summary from statscrew to athlyte datastructure
 * @param plays List of plays (already parsed) in a game
 * @param longThresh Threshold for minimum number of yards in a long play; defaults to 70
 */
export function parsePeriodSummary(
  inputPeriodSummaries: StatcrewTeam.ISummary[],
  period: number,
  periodClock: string[]
): AthlyteGame.IPeriodSummary[] {

  const athlytePeriodSummary: AthlyteGame.IPeriodSummary[] = [];
  if (undefined == undefined || inputPeriodSummaries.length == 0) {
    return athlytePeriodSummary
  }
  let vh = VH.home;
  let counter = 0;
  for (const summary of inputPeriodSummaries) {
    if (summary.$.vh == "V")
      vh = VH.visitor;

    athlytePeriodSummary.push(
      {
        vh: vh,
        fgm: summary.$.fgm,
        fga: summary.$.fga,
        fgm3: summary.$.fgm3,
        fga3: summary.$.fga3,
        ftm: summary.$.ftm,
        fta: summary.$.fta,
        blk: summary.$.blk,
        stl: summary.$.stl,
        ast: summary.$.ast,
        oreb: summary.$.oreb,
        dreb: summary.$.dreb,
        treb: summary.$.treb,
        pf: summary.$.pf,
        tf: summary.$.tf,
        to: summary.$.to,
        prdClockTime: periodClock[counter++],
        prds: period,
      })
  }
  return athlytePeriodSummary;
}


/**
 * Translate the summary from statscrew to athlyte datastructure
 * @param plays List of plays (already parsed) in a game
 * @param longThresh Threshold for minimum number of yards in a long play; defaults to 70
 */
export function parsePeriodSpecial(
  inputPeriodSpecial: StatcrewTeam.ISpecial[],
  period: number,
  periodClock: string[]
): AthlyteGame.IPeriodSpecial[] {

  let vh = VH.home;
  const athlytePeriodSpecial: AthlyteGame.IPeriodSpecial[] = [];
  if (inputPeriodSpecial == undefined || inputPeriodSpecial.length == 0) {
    return athlytePeriodSpecial
  }
  let counter: number = 0;
  for (const special of inputPeriodSpecial) {
    if (special.$.vh == "V")
      vh = VH.visitor;
    athlytePeriodSpecial.push(
      {
        vh: vh,
        ptsTo: special.$.pts_to,
        ptsCh2: special.$.pts_ch2,
        ptsPaint: special.$.pts_paint,
        ptsFastb: special.$.pts_fastb,
        ptsBench: special.$.pts_bench,
        ties: special.$.ties,
        leads: special.$.leads,
        possCount: special.$.poss_count,
        possTime: special.$.poss_time,
        scoreCount: special.$.score_count,
        scoreTime: special.$.score_time,
        leadTime: special.$.lead_time,
        tiedTime: special.$.tied_time,
        largeLead: special.$.large_lead,
        largeLeadT: special.$.large_lead_t,
        prdClockTime: periodClock[counter++],
        prds: period,
      })
  }

  return athlytePeriodSpecial;
}
