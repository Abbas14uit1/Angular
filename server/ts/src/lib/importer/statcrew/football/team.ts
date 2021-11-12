import * as moment from "moment";
import * as mongo from "mongodb";

import { parseTeam } from ".././helpers/teamParser";
import { StatcrewImportBase } from "../StatcrewImportBase";
import { Game } from "./game";
import { Player } from "./player";

// definitions
import * as CommonStats from "../../../../../../../typings/athlyte/football/common-stats.d";
import * as AthlyteTeam from "../../../../../../../typings/athlyte/football/team.d";
import { IStatcrewFootballJSON } from "../../../../../../../typings/statcrew/football";
import * as StatcrewPlay from "../../../../../../../typings/statcrew/football/play.d";
import * as StatcrewTeam from "../../../../../../../typings/statcrew/football/team.d";
import * as StatcrewVenue from "../../../../../../../typings/statcrew/football/venue.d";
import { TeamGame } from "./teamGame";

/**
 * Team class manages the entire lifecycle of team data, from parsing
 * the Statcrew data up through saving to Mongo
 */
export class Team extends StatcrewImportBase {
  public parsedData: AthlyteTeam.ITeam;
  /**
   * Games and players need to know a team's ID before saving to Mongo
   */
  public dependents: Array<Game | Player | TeamGame>;
  private alreadyExists: boolean;
  private initialized: boolean;

  constructor() {
    super();    
    this.dependents = [];
    this.alreadyExists = false;
    this.initialized = false;
    this.parsedData = {
      _id: undefined,
      games: [],
      players: [],
    } as any;
  }

  /**
   * Get IDs of teams; queries Mongo by the team's abbreviation (ex: UA for University of Alabama)
   * and uses _id if found. If no ID is found, generates a new one.
   * Returns both the new/ existing ID and a flag saying whether the ID was generated or new.
   * @param db Mongo DB
   * @param home Home team to get ID for
   * @param visitor Visiting team to get ID for
   */
  public async generateId(db: mongo.Db) {
    let team = await db.collection("teams").findOne({ code: this.parsedData.code }, { fields: { _id: 1 } });
    let id: string;
    if (team && !isNaN(this.parsedData.code)) {
      id = team._id;
      this.alreadyExists = true;
      this.initialized = true;
    } else {
      team = await db.collection("teams").findOne({ code: this.parsedData.code }, { fields: { _id: 1 } });
      if (team) {
        id = team._id;
        this.alreadyExists = true;
        this.initialized = true;
      } else {
        id = new mongo.ObjectID().toHexString();
        this.alreadyExists = false;
        this.initialized = true;
      }
    }
    return id;
  }

  /**
   * Check whether team already exists in Mongo
   */
  public getAlreadyExists(): boolean {
    if (this.initialized == false) {
      throw new Error("Trying to check existance before checking the DB for the ID");
    } else {
      return this.alreadyExists;
    }
  }

  /* istanbul ignore next */
  /**
   * Manually set a player as existing/ not existing in database.
   * Note: This should only be used in testing!
   * @param exists Boolean indicating whether a player already exists in DB
   */
  public _setAlreadyExists(exists: boolean): void {
    this.alreadyExists = exists;
    this.initialized = true;
  }

  /**
   * Prepare a team's static data for save.
   * Static data is team data which does not change between games/ seasons
   * such as team name.
   */
  public prepareStaticData(): AthlyteTeam.ITeamStaticData {
    if (this.parsedData._id === undefined) {
      throw new Error("Trying to save data before all fields have been populated");
    } else {
      return {
        code: this.parsedData.code,
        _id: this.parsedData._id,        
        name: this.parsedData.name,
        tidyName: this.parsedData.tidyName,
      };
    }
  }

  /**
   * Prepare a team's dynamic data for save.
   * Dynamic data is that which changes beteen games and seasons.
   */
  public prepareDynamicData(): any {
    if (this.parsedData.games.gameId === undefined){
      throw new Error("Trying to save game data before ID field has been populated");
    } else {
      return {
        conference: this.parsedData.games.conference,
        conferenceDivision: this.parsedData.games.conferenceDivision,
        games: [this.parsedData.games.gameId],
        players: this.parsedData.games.players,
      };
    }
  }

  /**
   * Add a player's ID to the list of players on this team
   * @param id ID of player to associate with a team
   */
  public updatePlayerRef(id: string) {
    this.parsedData.games.players.push(id);
  }

  /**
   * Add a game ID to this team to mark this team as being a part of a certain game
   * @param gameId ID of the game to associate with a team
   */
  public updateGameRef(id: string) {
    this.parsedData.games.gameId = id;
  }

  /**
   * Provide this MongoTeam instance's ID to instances of Mongo<Game|Player>
   * which need to know the ID of this game before they can be saved to Mongo.
   */
  public updateDependents() {
    for (const dependent of this.dependents) {
      if (dependent instanceof Game) {
        dependent.updateTeamRef(this.parsedData.games.homeAway, this.getId());
      } else if (dependent instanceof Player) {
        dependent.updateTeamRef(this.getId());
      } else if (dependent instanceof TeamGame) {
        dependent.updateTeamRef(this.getId());
      } else {
        throw new Error("Team dependents must be game or player");
      }
    }
  }

  /**
   * Parse team data into `this.parsedData`
   * @param inputTeam Statcrew team information
   * @param quarterTotals Statcrew quarter totals information
   * @param gameDate Date of the game
   */
  public parse(inputTeam: StatcrewTeam.ITeam,
    opponent: StatcrewTeam.ITeam,
    venue: StatcrewVenue.IVenue,
    quarterTotals?: StatcrewPlay.IQuarter[],
    gameDate?: Date, actualDate?: string
    ): void {
    if (quarterTotals === undefined){
      quarterTotals = [{} as StatcrewPlay.IQuarter];
      quarterTotals[0].qtrsummary = [{} as StatcrewTeam.IQuarterSummary, {} as StatcrewTeam.IQuarterSummary];
      
    }
    if (gameDate === undefined || actualDate === undefined)
      return;
    this.parsedData = parseTeam(inputTeam, opponent, quarterTotals, gameDate, actualDate, venue);
  }

  /**
   * Save team information to Mongo.
   * If the team already exists, most data is left unchanged and new records are appended to the list of a
   * team's games and players. In other words, only dynamic data is saved.
   * If the team does not exist, both static and dynamic data is saved.
   * @param db Mongo DB
   */
  public async save(db: mongo.Db): Promise<string> {
    if (this.getAlreadyExists()) {
      const data = this.prepareDynamicData();
      const updateInstruction = {
        q: { _id: this.getId() },
        u: {
          $push: {
            games: { $each: data.games },
            players: { $each: data.players },
          },
        },
        multi: false,
        upsert: false,
      };
      return db.command({
        update: "teams",
        updates: [updateInstruction],
        ordered: true,
      }).then(() => this.getId());
    } else {
      const teamData = Object.assign({}, this.prepareStaticData(), this.prepareDynamicData());
      return db.collection("teams").insert(teamData)
        .then(() => this.getId());
    }
  }
}
