import * as moment from "moment";
import * as mongo from "mongodb";

import * as Athlyte from "../../../../../../../typings/athlyte/football";
import * as AthlyteGame from "../../../../../../../typings/athlyte/football/game.d";
import * as StatcrewDrive from "../../../../../../../typings/statcrew/football/drive.d";
import * as StatcrewTeam from "../../../../../../../typings/statcrew/football/team.d";
import * as StatcrewVenue from "../../../../../../../typings/statcrew/football/venue.d";
import { calculateDistance } from "../../../calculateDistance";
import { VH } from "../../../importer/AthlyteImporter";
import { parseDriveDetails } from "../helpers/driveDetails";
import { StatcrewImportBase } from "../StatcrewImportBase";
import { Play } from "./play";
import { Player } from "./player";
import { Team } from "./team";
import { TeamGame } from "./teamGame";

// interfaces
/**
 * GameClass manages the entire lifecycle of games,
 * from parsing the game data (from the output of xml2js)
 * to saving to Mongo.
 */
export class Game extends StatcrewImportBase {
  public parsedData: Athlyte.IGame;
  /**
   * Plays, teams, and players all need to know the ID of a game before they are saved to Mongo
   */
  public dependents: Array<Play | Team | Player | TeamGame>;
  private alreadyExists: boolean;
  private initialized: boolean;
  private playsEmpty: boolean;

  constructor() {
    super();
    this.dependents = [];
    this.alreadyExists = false;
    this.initialized = false;
    this.playsEmpty = false;
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
  public async generateId(db: mongo.Db): Promise<string> {
    const game = await db.collection("games")
      .findOne({ "sportCode": "MFB", "team.home.code": this.parsedData.team.home.code,
      "team.visitor.code": this.parsedData.team.visitor.code, "actualDate": this.parsedData.actualDate
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
    } else if (this.parsedData.playIds.length === 0 && this.playsEmpty == false) {
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
    if (this.parsedData.summary && this.parsedData.summary.driveDetails) {
      this.parsedData.summary.driveDetails.forEach((driveDetail) => {
        if (driveDetail.drivingTeam === teamStatus) {
          driveDetail.drivingTeamId = newId;
        }
      });
    }

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
        throw new Error("Game dependents must be team, player, or play");
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
    for (const official in officials) {
      /* istanbul ignore else */
      if (officials.hasOwnProperty(official)) {
        parsedOfficials.push({
          pos: official,
          name: officials[official],
        });
      }
    }
    return {
      startTime: moment(venueMeta.start, "hh:mm A").toDate(),
      endTime: moment(venueMeta.end, "hh:mm A").toDate(),
      officials: parsedOfficials,
      rules: {
        quarters: venueRules.qtrs,
        minutes: venueRules.mins,
        downs: venueRules.downs,
        yards: venueRules.yds,
        kickoffSpot: venueRules.kospot,
        touchbackSpot: venueRules.tbspot,
        kickoffTouchbackSpot: venueRules.kotbspot,
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
    const nightGame: boolean = venueMeta.nitegame === "Y";
    const conferenceGame: boolean = venueMeta.leaguegame === "Y";
    const postseasonGame: boolean = venueMeta.postseason === "Y";
    const gameType: string[] = venueMeta.gametype.split(",");
    return {
      geoLocation: venueMeta.location,
      stadiumName: venueMeta.stadium,
      neutralLocation,
      nightGame,
      conferenceGame,
      postseasonGame,
      gameType,
      attendance: venueMeta.attend,
      temperatureF: venueMeta.temp,
      wind: venueMeta.wind === null ? undefined : venueMeta.wind,
      weather: venueMeta.weather,
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
   * Parse a game to extract relevant information to add to `this.parsedData`
   * @param inputVenueData Venue data from Statcrew
   * @param inputTeamData Team data from Statcrew
   * @param inputDriveData Drive data from statcrew
   * @param parsedPlays List of parsed plays in Athlyte format
   */
  public parse(
    inputVenueData: StatcrewVenue.IVenue,
    inputTeamData: StatcrewTeam.ITeam[],
    inputDriveData: StatcrewDrive.IDrive[],
    parsedPlays: Athlyte.IPlay[],
  ): void {
    const gameDate = moment(inputVenueData.$.date, "MM-DD-YYYY");
    const actualDate = inputVenueData.$.date;
    // form Athlyte game object
    const gameInfo: Athlyte.IGame = {
      _id: "",
      playerIds: [],
      playIds: [],
      sportCode: "MFB",
      teamIds: {
        home: undefined,
        visitor: undefined,
      },
      gameDate: gameDate.toDate(),
      actualDate: actualDate,
      season: gameDate.subtract(3, "months").year(), // subtract 3 months to ensure that Jan games are in season
      meta: this.parseMeta(inputVenueData),
      venue: this.parseVenue(inputVenueData),
      team: this.parseTeam(inputTeamData),
      summary: parseSummary(parsedPlays, inputDriveData),
      updateTime: new Date(),
    };
    if (parsedPlays.length === 0){
      this.playsEmpty = true;
    }
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
  plays: Athlyte.IPlay[],
  drives: StatcrewDrive.IDrive[],
  longThresh = 70,
): AthlyteGame.IGameSummary {
  const scores: number[] = [];
  const driveStartStop: number[][] = [];
  const fgas: number[] = [];
  const longplay: number[] = [];
  const driveIndex = 0;
  let scoringDrive: number | undefined; // drive is considered over when a score happens (or ends with turnover)
  if (plays.length === 1 && plays[0].playInGame === 0){
    //There is no play in this array its an empty play so reset to empty.
    plays = [];
  }
  plays.forEach((play, index) => {
    // SCORES
    if (play.score && !play.results.pointAfterTd) {
      // ignore PATs
      scores.push(index);
      scoringDrive = index;
    }

    // DRIVES
    if (play.drive >= driveIndex && play.playInDrive === 1) {
      // start of a new drive; terminate last drive and start new one
      if (driveStartStop.length === 0) {
        driveStartStop.push([index, NaN]);
      } else {
        // terminate previous drive
        // drive is terminated on the drive which score happened (if a score happened)
        // otherwise on the previous play index.
        driveStartStop[driveStartStop.length - 1][1] = scoringDrive || index - 1;
        // start new drive
        driveStartStop.push([index, NaN]);
        scoringDrive = undefined;
      }
    }
    if (index === plays.length - 1) {
      // reached last play; terminate the drive list
      driveStartStop[driveStartStop.length - 1][1] = index;
    }

    // FGAS
    if (play.results.fga) {
      fgas.push(index);
    }

    // LONG PLAYS
    if (play.playStartLocation && play.playEndLocation) {
      const distance = calculateDistance(play.possession, play.playStartLocation, play.playEndLocation);
      if (distance >= longThresh) {
        longplay.push(index);
      }
    }
  });
  return {
    scores,
    drives: driveStartStop,
    driveDetails: drives == null ? undefined : drives.map((drive) => parseDriveDetails(drive)),
    fgas,
    longplay,
  };
}
